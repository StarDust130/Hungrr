
import { Request, Response } from "express";
import prisma from "../../config/prisma";

import {
  startOfDay,
  endOfDay,
  subDays,
} from "date-fns";
import { emitOrderEvent } from "../user/userController";



//! 2) Order Management (Get all orders , updateOrderStatus) 🥘

// 1) Returns a date filter clause for queries based on a specific date or range ("today", "week", "month").
const getDateWhereClause = (range?: string, date?: string) => {
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

// 2) Get all orders for a specific Cafe with filters
export const getOrdersByCafe = async (req: Request, res: Response) => {
  try {
    const { cafeId } = req.params;

    const {
      limit = "10",
      page = "1",
      search,
      status,
      range,
      date,
    } = req.query as { [key: string]: string };

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const whereClause: any = { 
      cafeId: Number(cafeId),
      status: { not: "completed" }, // Exclude completed orders
    };

    if (search) {
      whereClause.publicId = { contains: search, mode: "insensitive" };
    }

    if (status && status !== "all") {
      whereClause.status = { equals: status };
    }

    if (range) {
      const now = new Date();
      let gte;
      if (range === "today") {
        gte = startOfDay(now);
      } else if (range === "week") {
        gte = startOfDay(subDays(now, 6));
      } else if (range === "month") {
        gte = startOfDay(subDays(now, 29));
      }
      if (gte) {
        whereClause.created_at = { gte };
      }
    } else if (date) {
      const startDate = startOfDay(new Date(date));
      const endDate = endOfDay(new Date(date));
      whereClause.created_at = { gte: startDate, lte: endDate };
    }

    const [orders, totalCount] = await prisma.$transaction([
      prisma.order.findMany({
        where: whereClause,
        orderBy: { created_at: "desc" },
        skip,
        take: limitNum,
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

    res.status(200).json({
      message: "✅ Orders fetched successfully with filters!",
      pageInfo: {
        currentPage: pageNum,
        limit: limitNum,
        totalOrders: totalCount,
        totalPages: Math.ceil(totalCount / limitNum),
      },
      orders,
    });
  } catch (err) {
    console.error("❌ Error in getOrdersByCafe:", err);
    res.status(500).json({ message: "🚨 Server error." });
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
              select: { name: true, price: true },
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
type OrderStatus = "pending" | "accepted" | "preparing" | "ready" | "completed";
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

