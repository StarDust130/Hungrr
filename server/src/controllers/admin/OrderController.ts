
import { Request, Response } from "express";
import prisma from "../../config/prisma";

import {
  startOfDay,
  endOfDay,
  subDays,
} from "date-fns";



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

    // ✅ FIXED: Now correctly reading 'range' and 'date' from the query
    const {
      limit = "10",
      page = "1",
      search,
      status,
      range, // <-- Added
      date, // <-- Added
    } = req.query as { [key: string]: string };

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    // --- Build the dynamic WHERE clause ---
    const whereClause: any = { cafeId: Number(cafeId) };

    // Text search filter
    if (search) {
      whereClause.publicId = { contains: search, mode: "insensitive" };
    }

    // Status filter
    if (status && status !== "all") {
      whereClause.status = { equals: status };
    }

    // ✅ FIXED: Added the date filtering logic
    if (range) {
      const now = new Date();
      let gte; // "greater than or equal to" date
      if (range === "today") {
        gte = startOfDay(now);
      } else if (range === "week") {
        gte = startOfDay(subDays(now, 6)); // Includes today + last 6 days
      } else if (range === "month") {
        gte = startOfDay(subDays(now, 29)); // Includes today + last 29 days
      }
      if (gte) {
        whereClause.created_at = { gte };
      }
    } else if (date) {
      // If a specific date is chosen, filter for that day only
      const startDate = startOfDay(new Date(date));
      const endDate = endOfDay(new Date(date));
      whereClause.created_at = { gte: startDate, lte: endDate };
    }

    // --- Fetch data from the database ---
    const [orders, totalCount] = await prisma.$transaction([
      prisma.order.findMany({
        where: whereClause, // The whereClause now includes date filters
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

    const whereClause: any = { cafeId: Number(cafeId) };
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
        orderBy: undefined,
      }),
    ]);

    const totalRevenue = stats._sum.total_price?.toNumber() || 0;
    const totalOrders = stats._count.id || 0;

    const countsByStatus = statusCounts.reduce((acc, curr) => {
      acc[curr.status] = curr._count?.status ?? 0;
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
export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    // Validate the incoming status
    const validStatuses = [
      "pending",
      "accepted",
      "preparing",
      "ready",
      "completed",
    ];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ message: "🚫 Invalid status provided." });
    }

    const updatedOrder = await prisma.order.update({
      where: { id: Number(orderId) },
      data: { status },
    });

    // In a real-time app, you would emit a socket.io event here
    // const io = req.app.get("io");
    // io.to(`cafe_${updatedOrder.cafeId}`).emit('order_status_updated', updatedOrder);

    res.status(200).json({
      message: "✅ Order status updated successfully.",
      order: updatedOrder,
    });
  } catch (err: any) {
    // Prisma's error code for a record not found
    if (err.code === "P2025") {
      return res.status(404).json({ message: "🚫 Order not found." });
    }
    console.error("❌ Error updating order status:", err);
    res.status(500).json({ message: "🚨 Server error." });
  }
};
