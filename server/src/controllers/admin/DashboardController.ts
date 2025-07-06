import { Request, Response } from "express";
import prisma from "../../config/prisma";
import {
  startOfDay,
  startOfWeek,
  format,
  endOfDay,
  eachHourOfInterval,
} from "date-fns";
import { generateTodayAISummaryPrompt } from "../../utils/dashboardSummaryPrompt";
import { groq } from "../../utils/groqClient";

//! ) Dashboard Stats  📊

// 1) Get Dashboard Summary for a Cafe
export const getDashboardSummary = async (req: Request, res: Response) => {
  try {
    // 1️⃣ Get inputs
    const { cafeId } = req.params;
    const range = (req.query.range as "today" | "week") || "today";

    if (!cafeId) {
      return res.status(400).json({ message: "🚫 Cafe ID is required." });
    }

    const dateFilter =
      range === "week"
        ? { gte: startOfWeek(new Date()) }
        : { gte: startOfDay(new Date()) };

    // 2️⃣ Collect stats
    const [totalOrders, totalRevenue, popularItem, orderStats] =
      await Promise.all([
        prisma.order.count({
          where: { cafeId: Number(cafeId), created_at: dateFilter },
        }),
        prisma.order.aggregate({
          where: { cafeId: Number(cafeId), created_at: dateFilter, paid: true },
          _sum: { total_price: true },
        }),
        prisma.orderItem.groupBy({
          by: ["itemId"],
          where: {
            order: {
              cafeId: Number(cafeId),
              created_at: dateFilter,
            },
          },
          _sum: { quantity: true },
          orderBy: { _sum: { quantity: "desc" } },
          take: 1,
        }),
        prisma.order.groupBy({
          by: ["status"],
          where: {
            cafeId: Number(cafeId),
            created_at: dateFilter,
          },
          _count: true,
        }),
      ]);

    let popularItemName = "N/A";
    if (popularItem.length > 0) {
      const item = await prisma.menuItem.findUnique({
        where: { id: popularItem[0].itemId },
        select: { name: true },
      });
      popularItemName = item?.name || "N/A";
    }

    const stats = {
      totalOrders,
      totalRevenue: totalRevenue._sum.total_price?.toFixed(2) || "0.00",
      popularItem: popularItemName,
      orderStatusCounts: orderStats.reduce((acc, curr) => {
        acc[curr.status] = curr._count;
        return acc;
      }, {} as Record<string, number>),
    };

    // 3️⃣ Send response
    return res.status(200).json({
      message: "✅ Dashboard summary ready!",
      stats,
    });
  } catch (err: any) {
    console.error("❌ Error in getDashboardSummary:", err.message || err);
    return res.status(500).json({
      message: "🚨 Failed to generate summary.",
    });
  }
};

// 2) Generate AI Insights for Dashboard
export const getTodayAISummary = async (req: Request, res: Response) => {
  try {
    // 1️⃣ Get cafe ID
    const { cafeId } = req.params;
    if (!cafeId) {
      return res.status(400).json({ message: "🚫 Cafe ID is required." });
    }

    const now = new Date();
    const todayFilter = { gte: startOfDay(now) };

    // 2️⃣ Fetch cafe info
    const cafe = await prisma.cafe.findUnique({
      where: { id: Number(cafeId) },
      select: {
        name: true,
        tagline: true,
        openingTime: true,
      },
    });

    if (!cafe) {
      return res.status(404).json({ message: "❌ Cafe not found." });
    }

    // 3️⃣ Get today's order data
    const [orderCount, revenue, topItemData] = await Promise.all([
      prisma.order.count({
        where: { cafeId: Number(cafeId), created_at: todayFilter },
      }),
      prisma.order.aggregate({
        where: {
          cafeId: Number(cafeId),
          created_at: todayFilter,
          paid: true,
        },
        _sum: { total_price: true },
      }),
      prisma.orderItem.groupBy({
        by: ["itemId"],
        where: {
          order: {
            cafeId: Number(cafeId),
            created_at: todayFilter,
          },
        },
        _sum: { quantity: true },
        orderBy: { _sum: { quantity: "desc" } },
        take: 1,
      }),
    ]);

    let topItemName = "N/A";
    if (topItemData.length > 0) {
      const item = await prisma.menuItem.findUnique({
        where: { id: topItemData[0].itemId },
        select: { name: true },
      });
      topItemName = item?.name || "N/A";
    }

    const currentTime = format(now, "hh:mm a");
    const totalRevenue = revenue._sum.total_price?.toFixed(2) || "0.00";

    // 4️⃣ Build AI prompt with cafe context
    const prompt = generateTodayAISummaryPrompt({
      orderCount,
      totalRevenue,
      topItem: topItemName,
      currentTime,
      cafeName: cafe.name,
      cafeTagline: cafe.tagline || "",
      openingTime: cafe.openingTime || "09:00 AM",
    });

    // 5️⃣ Get AI response
    const chat = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama3-70b-8192",
      temperature: 0.9,
      max_tokens: 300,
      stream: false,
    });

    const aiInsight =
      chat.choices[0]?.message?.content?.trim() || "No AI insight.";

    // 6️⃣ Respond to frontend
    return res.status(200).json({
      aiInsight,
    });
  } catch (err: any) {
    console.error("❌ AI Summary Error:", err.message || err);
    return res
      .status(500)
      .json({ message: "🚨 Failed to generate AI insight." });
  }
};

// 3) Get Today's Dashboard Data
export const getTodayDashboardData = async (req: Request, res: Response) => {
  try {
    const { cafeId } = req.params;
    const numericCafeId = Number(cafeId);

    if (isNaN(numericCafeId)) {
      return res.status(400).json({ message: "Invalid Cafe ID." });
    }

    const todayStart = startOfDay(new Date());
    const todayEnd = endOfDay(new Date());

    const [stats, orderStatusCounts, hourlyData, mostSoldItems] =
      await prisma.$transaction([
        // 1. Core Statistics (Revenue, Orders, Avg. Value)
        prisma.order.aggregate({
          where: {
            cafeId: numericCafeId,
            created_at: { gte: todayStart, lte: todayEnd },
          },
          _sum: { total_price: true },
          _count: { id: true },
        }),

        // 2. Order Status Distribution
        prisma.order.groupBy({
          by: ["status"],
          where: {
            cafeId: numericCafeId,
            created_at: { gte: todayStart, lte: todayEnd },
          },
          _count: { status: true },
          orderBy: undefined,
        }),

        // 3. Hourly Revenue
        prisma.order.findMany({
          where: {
            cafeId: numericCafeId,
            created_at: { gte: todayStart, lte: todayEnd },
          },
          select: {
            total_price: true,
            created_at: true,
          },
        }),

        // 4. Most Sold Items
        prisma.orderItem.groupBy({
          by: ["itemId"],
          where: {
            order: {
              cafeId: numericCafeId,
              created_at: { gte: todayStart, lte: todayEnd },
            },
          },
          _sum: { quantity: true },
          orderBy: {
            _sum: { quantity: "desc" },
          },
          take: 3,
        }),
      ]);

    // --- Process Data ---

    // Core Stats
    const totalRevenue = stats._sum.total_price?.toNumber() || 0;
    const totalOrders = stats._count.id || 0;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Order Status Pie Chart
    const statusDistribution = orderStatusCounts.map(({ status, _count }) => ({
      name: status.charAt(0).toUpperCase() + status.slice(1),
      value: _count?.status ?? 0,
    }));

    // Hourly Revenue Chart
    const hours = eachHourOfInterval({ start: todayStart, end: todayEnd });
    const hourlyRevenue = hours.map((hour) => ({
      hour: format(hour, "ha"), // e.g., "9am", "1pm"
      revenue: 0,
    }));

    hourlyData.forEach((order) => {
      const hourKey = format(order.created_at, "ha");
      const hourIndex = hourlyRevenue.findIndex((h) => h.hour === hourKey);
      if (hourIndex !== -1) {
        hourlyRevenue[hourIndex].revenue += order.total_price.toNumber();
      }
    });

    // Most Sold Items List
    const mostSoldItemsDetails = await prisma.menuItem.findMany({
      where: {
        id: { in: mostSoldItems.map((item) => item.itemId) },
      },
      select: { id: true, name: true },
    });

    const topSoldItems = mostSoldItems.map((item) => {
      const details = mostSoldItemsDetails.find((d) => d.id === item.itemId);
      return {
        name: details?.name || "Unknown Item",
        count: item._sum.quantity || 0,
      };
    });

    res.status(200).json({
      stats: {
        revenue: { value: totalRevenue, change: 0 }, // Placeholder for change
        orders: { value: totalOrders, change: 0 },
        avgOrderValue: { value: avgOrderValue, change: 0 },
        newCustomers: { value: 0, change: 0 }, // Placeholder
      },
      orderStatusData: statusDistribution,
      hourlyRevenueData: hourlyRevenue,
      mostSoldItems: topSoldItems,
    });
  } catch (error) {
    console.error("Error fetching today's dashboard data:", error);
    res.status(500).json({ message: "Server error fetching dashboard data." });
  }
};
