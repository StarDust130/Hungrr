
import { Request, Response } from "express";
import prisma from "../../config/prisma";

import {
  startOfDay,
  endOfDay,
  subDays,
} from "date-fns";
import { emitOrderEvent } from "../user/userController";
import { Prisma } from "@prisma/client";
import { OrderStatus } from "../../utils/types";



//! 2) Order Management (Get all orders , updateOrderStatus) 🥘

// 1) Returns a date filter clause for queries based on a specific date or range ("today", "week", "month").
export const getDateWhereClause = (range?: string, date?: string) => {
  if (date) {
    const startDate = startOfDay(new Date(date));
    const endDate = endOfDay(new Date(date));
    return { gte: startDate, lte: endDate };
  }

  const now = new Date();
  let gte;
  if (range === "today") {
    gte = startOfDay(now);
  } else if (range === "week") {
    gte = startOfDay(subDays(now, 6)); // Correctly includes today
  } else if (range === "month") {
    gte = startOfDay(subDays(now, 29)); // Correctly includes today
  }

  return gte ? { gte } : undefined;
};

// Type for Prisma where clause
type OrderWhereInput = Prisma.OrderWhereInput;

// Allowed status values (includes "all" for query validation)
const validStatuses = ["all", "pending", "accepted", "preparing", "ready", "completed"] as const;
type ValidStatus = (typeof validStatuses)[number];

// Allowed range values
const validRanges = ["today", "week", "month"] as const;
type Range = (typeof validRanges)[number];

export const getOrdersByCafe = async (req: Request, res: Response) => {
  try {
    const { cafeId } = req.params;
    const { limit, page, search, status, range, date, live } = req.query as {
      limit?: string;
      page?: string;
      search?: string;
      status?: string;
      range?: string;
      date?: string;
      live?: string;
    };

    // Validate query parameters
    const pageNum = parseInt(page || "1", 10);
    const limitNum = parseInt(limit || "10", 10);

    // Validate cafeId
    const cafeIdNum = parseInt(cafeId, 10);
    if (isNaN(cafeIdNum)) {
      console.warn(`Invalid cafeId: ${cafeId}`);
      return res.status(400).json({ message: "Invalid cafeId" });
    }

    // Validate page and limit
    if (isNaN(pageNum) || pageNum < 1) {
      console.warn(`Invalid page: ${page}`);
      return res.status(400).json({ message: "Invalid page number" });
    }
    if (isNaN(limitNum) || limitNum < 1) {
      console.warn(`Invalid limit: ${limit}`);
      return res.status(400).json({ message: "Invalid limit value" });
    }

    // Cap limit at 100 for performance
    const safeLimit = Math.min(limitNum, 100);
    const skip = (pageNum - 1) * safeLimit;

    // Validate status
    if (status && !validStatuses.includes(status as ValidStatus)) {
      console.warn(`Invalid status: ${status}`);
      return res.status(400).json({ message: "Invalid status value" });
    }

    // Validate range
    if (range && !validRanges.includes(range as Range)) {
      console.warn(`Invalid range: ${range}`);
      return res.status(400).json({ message: "Invalid range value" });
    }

    // Validate date
    if (date && isNaN(Date.parse(date))) {
      console.warn(`Invalid date: ${date}`);
      return res.status(400).json({ message: "Invalid date format" });
    }

    // Validate live
    const isLive = live === "true";

    // Build where clause with type safety
    const whereClause: OrderWhereInput = {
      cafeId: cafeIdNum,
    };

    // Exclude completed orders for LiveOrders
    if (isLive) {
      whereClause.status = { not: "completed" };
    } else if (status && status !== "all") {
      // Only apply status filter if status is not "all" for non-LiveOrders
      whereClause.status = { equals: status as OrderStatus }; // Cast to OrderStatus
    }

    if (search) {
      whereClause.publicId = { contains: search, mode: "insensitive" };
    }

    if (range || date) {
      const dateFilter = getDateWhereClause(range, date);
      if (dateFilter) {
        whereClause.created_at = dateFilter;
      }
    }

    // Fetch orders and count in a transaction
    const [orders, totalCount] = await prisma.$transaction([
      prisma.order.findMany({
        where: whereClause,
        orderBy: { created_at: "desc" },
        skip,
        take: safeLimit,
        select: {
          id: true,
          publicId: true,
          tableNo: true,
          total_price: true,
          created_at: true,
          status: true,
          orderType: true,
          payment_method: true,
          paid: true,
        },
      }),
      prisma.order.count({ where: whereClause }),
    ]);

    // Log success
    console.info(
      `Fetched ${orders.length} orders for cafeId ${cafeIdNum}, page ${pageNum}, limit ${safeLimit}, live=${isLive}`
    );

    res.status(200).json({
      message: "✅ Orders fetched successfully with filters!",
      pageInfo: {
        currentPage: pageNum,
        limit: safeLimit,
        totalOrders: totalCount,
        totalPages: Math.ceil(totalCount / safeLimit),
      },
      orders,
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    console.error(
      `Error in getOrdersByCafe for cafeId ${req.params.cafeId}: ${errorMessage}`,
      {
        stack: err instanceof Error ? err.stack : undefined,
      }
    );
    res
      .status(500)
      .json({ message: "🚨 Server error occurred while fetching orders." });
  }
};

// 3) Get Order Details by Order ID
export const getOrderDetails = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const order = await prisma.order.findUnique({
      where: { id: Number(orderId) },
      include: {
        order_items: {
          select: {
            quantity: true,
            item: {
              select: {
                name: true,
                price: true,
              },
            },
            variant: {
              select: {
                name: true,
                price: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      return res.status(404).json({ message: "🚫 Order not found." });
    }

    res.status(200).json({ message: "✅ Order details fetched.", order });
  } catch (err) {
    console.error("❌ Error in getOrderDetails:", err);
    res.status(500).json({ message: "🚨 Server error." });
  }
};

// 4) Get Cafe Stats (Revenue, Orders, Status Counts)
export const getCafeStats = async (req: Request, res: Response) => {
  try {
    const { cafeId } = req.params;
    const { range = "today", date } = req.query as { [key: string]: string };

    // Use the OrderStatus type for enum values
    const excludedStatuses: OrderStatus[] = ["pending"];

    const whereClause: any = {
      cafeId: Number(cafeId),
      status: { notIn: excludedStatuses },
    };

    const dateFilter = getDateWhereClause(range, date);
    if (dateFilter) {
      whereClause.created_at = dateFilter;
    }

    const [stats, statusCounts] = await prisma.$transaction([
      prisma.order.aggregate({
        _sum: { total_price: true },
        _count: { id: true },
        where: whereClause,
      }),
      prisma.order.groupBy({
        by: ["status"],
        where: whereClause,
        _count: { status: true },
        orderBy: undefined
      }),
    ]);

    const totalRevenue = stats._sum.total_price?.toNumber() || 0;
    const totalOrders = stats._count.id || 0;

    // Fix: groupBy returns { status, _count: { status: number } }
    const countsByStatus = statusCounts.reduce((acc, curr) => {
      acc[curr.status] = curr._count.status ?? 0;
      return acc;
    }, {} as Record<string, number>);

    res.status(200).json({
      message: "✅ Stats fetched successfully!",
      stats: {
        totalRevenue,
        totalOrders,
        averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
        pending: countsByStatus.pending || 0,
      },
    });
  } catch (err) {
    console.error("❌ Error in getCafeStats:", err);
    res.status(500).json({ message: "🚨 Server error while fetching stats." });
  }
};

// 5) Update Order Status
// Assume OrderStatus type is defined elsewhere, e.g., in a types.ts file
/**
 * REFACTORED: Updates an order's status and emits a real-time event.
 */
export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body as { status: OrderStatus };

    // This is where your code was failing with the Prisma "record not found" error
    const updatedOrder = await prisma.order.update({
      where: { id: Number(orderId) },
      data: { status },
    });

    // We only emit AFTER the database update is successful
    emitOrderEvent(req, "order_updated", updatedOrder);

    res
      .status(200)
      .json({ message: "✅ Order status updated.", order: updatedOrder });
  } catch (err: any) {
    if (err.code === "P2025") {
      console.error(
        `❌ UPDATE FAILED: Order with ID ${req.params.orderId} not found.`
      );
      return res
        .status(404)
        .json({ message: "Order not found. It may have been deleted." });
    }
    console.error("❌ Error updating order status:", err);
    res.status(500).json({ message: "🚨 Server error." });
  }
};


/**
 * NEW: Marks an order as paid and sets its status to 'accepted'.
 * Emits a real-time event upon success.
 */
export const markOrderAsPaid = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;

    const orderToUpdate = await prisma.order.findUnique({
        where: { id: Number(orderId) }
    });

    if (!orderToUpdate) {
        return res.status(404).json({ message: "🚫 Order not found." });
    }

    // Prevent re-processing if already paid and completed
    if (orderToUpdate.paid && orderToUpdate.status === 'completed') {
        return res.status(409).json({ message: "Order is already paid and completed." });
    }

    const updatedOrder = await prisma.order.update({
      where: { id: Number(orderId) },
      data: {
        paid: true,
        // Automatically move to 'accepted' if it was pending.
        // If it was already in another state (e.g., 'preparing'), leave it there.
        status: orderToUpdate.status === 'pending' ? 'accepted' : orderToUpdate.status,
      },
      include: {
        order_items: {
          select: {
            quantity: true,
            item: { select: { name: true } },
          },
        },
      },
    });

    // Emit the real-time update
    emitOrderEvent(req, 'order_updated', updatedOrder);

    res.status(200).json({
      message: "✅ Order marked as paid.",
      order: updatedOrder,
    });
  } catch (err: any) {
    if (err.code === "P2025") {
      return res.status(404).json({ message: "🚫 Order not found." });
    }
    console.error("❌ Error marking order as paid:", err);
    res.status(500).json({ message: "🚨 Server error." });
  }
};

