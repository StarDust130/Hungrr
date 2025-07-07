// src/controllers/cafeController.ts
import { Request, Response } from "express";
import prisma from "../../config/prisma";
import { Prisma } from "@prisma/client";
import { UpsertBillRequestBody } from "../../utils/types";
import { Server as SocketIOServer } from "socket.io";

//! 1) Cafe Banner 🤑
export const getCafeInfoBySlug = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { slug } = req.params;

  try {
    const cafe = await prisma.cafe.findFirst({
      where: {
        slug,
        is_active: true,
      },
      select: {
        id: true,
        slug: true,

        bannerUrl: true,
        name: true,
        tagline: true,
        instaID: true,
        isPureVeg: true,
        openingTime: true,
        gstPercentage: true,
      },
    });

    if (!cafe) {
      res.status(404).json({ success: false, message: "Cafe not found" });
    } else {
      res.json({ success: true, data: cafe });
    }
  } catch (error) {
    console.error("Error in getCafeInfoBySlug:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

//! 2) Cafe Menu Categories 🍽️
export const getCategory = async (req: Request, res: Response) => {
  const { slug } = req.params;

  if (typeof slug !== "string") {
    return res.status(400).json({ detail: "Invalid slug" });
  }

  try {
    const cafe = await prisma.cafe.findFirst({
      where: { slug, is_active: true },
      select: { id: true },
    });

    if (!cafe) {
      return res.status(404).json({ detail: "Cafe not found" });
    }

    const categories = await prisma.category.findMany({
      where: {
        cafeId: cafe.id,
        items: {
          some: {
            is_active: true,
          },
        },
      },
      orderBy: { order: "asc" }, // ✨ Change orderBy to use the new field
      select: { name: true },
    });

    const categoryNames = categories.map((cat) => cat.name);

    return res.status(200).json({ categories: categoryNames });
  } catch (error) {
    console.error("Error fetching menu categories:", error);
    return res.status(500).json({ detail: "Internal server error" });
  }
};

//! 3) Cafe Menu 😋
export const getCafeMenu = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { slug } = req.params;

    const cafe = await prisma.cafe.findFirst({
      where: {
        slug,
        is_active: true,
      },
    });

    if (!cafe) {
      return res.status(404).json({ detail: "Cafe not found" });
    }

    // 1. Fetch categories in the desired order
    const orderedCategories = await prisma.category.findMany({
      where: {
        cafeId: cafe.id,
        items: {
          some: {
            is_active: true,
          },
        },
      },
      orderBy: { order: "asc" },
      select: { name: true },
    });

    const orderedCategoryNames = orderedCategories.map((cat) => cat.name);
    const categoryIndex = parseInt(req.query.category_index as string) || 0;

    if (categoryIndex >= orderedCategoryNames.length) {
      return res.status(204).json({});
    }

    // Fetch all active items for the cafe
    const items = await prisma.menuItem.findMany({
      where: {
        cafeId: cafe.id,
        is_active: true,
      },
      include: {
        category: true,
      },
    });

    // Group items by category name
    const grouped: Record<string, any[]> = {};
    for (const item of items) {
      if (item.category?.name) {
        const catName = item.category.name;
        if (!grouped[catName]) grouped[catName] = [];
        grouped[catName].push(item);
      }
    }

    // ✨ 2. Sort items within each category with the new logic
    for (const categoryName in grouped) {
      grouped[categoryName].sort((a, b) => {
       const aHasImage = !!a.food_image_url;
const bHasImage = !!b.food_image_url;


        // Prioritize items with an image first
        if (aHasImage !== bHasImage) {
          return aHasImage ? -1 : 1;
        }

        // If both have/don't have an image, prioritize by tags
        const aHasTags = Array.isArray(a.tags) && a.tags.length > 0;
        const bHasTags = Array.isArray(b.tags) && b.tags.length > 0;
        
        if (aHasTags !== bHasTags) {
          return aHasTags ? -1 : 1;
        }

        // Otherwise, maintain original order
        return 0;
      });
    }

    const categoryName = orderedCategoryNames[categoryIndex];
    const categoryItems = grouped[categoryName] || [];

    return res.json({
      [categoryName]: categoryItems,
      hasMore: categoryIndex + 1 < orderedCategoryNames.length,
    });
  } catch (err: any) {
    console.error("Error in getCafeMenu:", err);
    return res.status(500).json({ detail: "Internal server error" });
  }
};

//! 4) Upsert Bill (Create or Update Order) 💳
const emitOrderEvent = (req: Request, eventName: string, order: any) => {
  const io = req.app.get("io") as SocketIOServer;
  if (io && order.cafeId) {
    const roomName = `cafe_${order.cafeId}`;
    io.to(roomName).emit(eventName, order);
    console.log(
      `📢 Emitted '${eventName}' to room '${roomName}' for order ${order.publicId}`
    );
  }
};

export const upsertBill = async (
  req: Request<{}, {}, UpsertBillRequestBody>,
  res: Response
) => {
  const {
    tableNo,
    cafeId,
    items,
    paymentMethod,
    specialInstructions,
    orderType,
    sessionToken,
  } = req.body;

  if (!sessionToken) {
    return res.status(400).json({ message: "Session token is required." });
  }

  if (!tableNo || !cafeId || !items?.length) {
    return res.status(400).json({ message: "Missing required fields." });
  }

  try {
    const lastOrder = await prisma.order.findFirst({
      where: { cafeId, tableNo, sessionToken, paid: false },
      orderBy: { created_at: "desc" },
    });

    let orderToProcess: { id: number };
    let isNewOrder = false; // Flag to determine which socket event to send

    if (lastOrder && lastOrder.paid === false) {
      // SCENARIO 1: Update an existing unpaid order.
      orderToProcess = { id: lastOrder.id };

      await prisma.order.update({
        where: { id: orderToProcess.id },
        data: {
          sessionToken,
          payment_method: paymentMethod,
          specialInstructions,
          orderType,
        },
      });

      const transactionItems = items.map((item) =>
        prisma.orderItem.upsert({
          where: {
            orderId_itemId: { orderId: orderToProcess.id, itemId: item.itemId },
          },
          update: { quantity: item.quantity },
          create: {
            orderId: orderToProcess.id,
            itemId: item.itemId,
            quantity: item.quantity,
          },
        })
      );
      await prisma.$transaction(transactionItems);
    } else {
      // SCENARIO 2: Create a NEW order.
      isNewOrder = true; // Set the flag
      const newOrder = await prisma.order.create({
        data: {
          tableNo,
          cafeId,
          sessionToken,
          payment_method: paymentMethod || "counter",
          specialInstructions: specialInstructions,
          orderType: orderType,
          order_items: {
            create: items.map((item) => ({
              itemId: item.itemId,
              quantity: item.quantity,
            })),
          },
        },
      });
      orderToProcess = { id: newOrder.id };
    }

    // --- Recalculate total and fetch the final order state ---
    const fullOrderForTotal = await prisma.order.findUnique({
      where: { id: orderToProcess.id },
      include: {
        order_items: { include: { item: { select: { price: true } } } },
      },
    });

    if (!fullOrderForTotal) {
      throw new Error("Could not find order after upsert operation.");
    }

    const totalPrice = fullOrderForTotal.order_items.reduce((sum, oi) => {
      return sum + Number(oi.item.price) * oi.quantity;
    }, 0);

    const finalUpdatedOrder = await prisma.order.update({
      where: { id: orderToProcess.id },
      data: { total_price: new Prisma.Decimal(totalPrice.toFixed(2)) },
      // Select all the data the frontend needs for a complete order object
      include: {
        order_items: {
          include: {
            item: true,
          },
        },
      },
    });

    // --- CRUCIAL FIX: Emit the socket event ---
    const eventName = isNewOrder ? "new_order" : "order_updated";
    emitOrderEvent(req, eventName, finalUpdatedOrder);

    // Finally, send the response to the original client
    return res.status(200).json({ order: finalUpdatedOrder });
  } catch (err: any) {
    console.error("❌ Upsert bill error:", err);
    return res
      .status(500)
      .json({ message: "Server error", error: err.message });
  }
};


//! 5) Get Bill by Public ID (For Customer View) 🧾
export const getBillByPublicId = async (req: Request, res: Response) => {
  try {
    const { publicId } = req.params;

    if (!publicId) {
      return res.status(400).json({ message: "Missing publicId parameter." });
    }

    const order = await prisma.order.findUnique({
      where: { publicId },
      include: {
        // ✅ ADD THIS LINE to include the cafe's slug in the response
        cafe: {
          select: {
            slug: true,
            name: true,
            gstNo: true,
            logoUrl: true,
            payment_url: true,
            address: true,
          },
        },

        order_items: { include: { item: true } },
        bill: true,
      },
    });

    if (!order) {
      return res.status(404).json({
        message: "Order not found or has expired.",
        order: null,
      });
    }

    return res.status(200).json({ order });
  } catch (error) {
    console.error("💥 getBillByPublicId error:", error);
    return res.status(500).json({ error: "Server error" });
  }
};

//! 6) Get Active Orders for a Table  📦
export const getActiveOrdersForTable = async (req: Request, res: Response) => {
  try {
    // 1) Extract cafeId and tableNo from request param and Validate them
    const { cafeId, tableNo } = req.params;

    const sessionToken = req.headers["x-session-token"] as string;

    // ✅ 1.2. Add a security check. If there's no token, return no orders.
    if (!sessionToken) {
      // Return an empty array instead of an error to handle this gracefully
      return res.status(200).json({ activeOrders: [] });
    }

    const numericCafeId = Number(cafeId);
    const numericTableNo = Number(tableNo);

    if (isNaN(numericCafeId) || isNaN(numericTableNo)) {
      return res.status(400).json({ error: "Invalid Cafe or Table ID." });
    }

    // 2) Fetch active orders for the given cafeId and tableNo
    const activeOrders = await prisma.order.findMany({
      where: {
        cafeId: numericCafeId,
        tableNo: numericTableNo,
        sessionToken: sessionToken, // Ensure the session token matches
        status: {
          not: "completed", // The key logic: ignore 'completed' orders
        },
      },
      // Only select the data the frontend needs for this feature
      select: {
        id: true,
        publicId: true,
        status: true,
      },
      orderBy: {
        created_at: "desc", // Get the most recent active order first
      },
    });

    console.log(
      `📦 Fetched ${activeOrders.length} active orders for Cafe ID ${numericCafeId} and Table No ${numericTableNo}`
    );
    console.log("Active Orders:", activeOrders);

    // 3) Return the active orders
    return res.status(200).json({ activeOrders });
  } catch (error: any) {
    console.error("Error fetching active orders:", error);
    return res.status(500).json({ error: "Server error" });
  }
};

//! 7) Delete order (only in pending stage)
export const cancelPendingOrder = async (req: Request, res: Response) => {
  try {
    const { publicId } = req.params;
    const sessionToken = req.headers["x-session-token"] as string;

    if (!sessionToken) {
      return res
        .status(401)
        .json({ message: "Unauthorized: Missing session token." });
    }

    const deletedOrder = await prisma.order.delete({
      where: {
        publicId: publicId,
        sessionToken: sessionToken,
        status: "pending",
        paid: false,
      },
    });

    // ✅ Emit cancellation event to both rooms.
    emitOrderEvent(req, "order_cancelled", deletedOrder);

    return res.status(200).json({ message: "Order successfully canceled." });
  } catch (error: any) {
    if (error.code === "P2025") {
      return res
        .status(404)
        .json({ message: "Order not found or can no longer be canceled." });
    }
    console.error("❌ Error canceling order:", error);
    return res.status(500).json({ message: "Server error." });
  }
};
