// src/controllers/cafeController.ts
import { Request, Response } from "express";
import prisma from "../../config/prisma";
import { OrderType, PaymentMethod, Prisma } from "@prisma/client";
import { UpsertBillRequestBody } from "../../utils/types";
import { Server } from "socket.io";
import { Order } from "@prisma/client"; // Or your specific Order type

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
        // ✅ FIX: REMOVED 'is_active: true' to allow fetching closed cafes.
        // The frontend will now handle the logic for displaying the "closed" message.
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
        // gstPercentage: true,
        is_active: true, // Keep this in the select to send the status to the frontend
        logoUrl: true,
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
    // ✅ FIX: REMOVED 'is_active: true' here as well for consistency.
    const cafe = await prisma.cafe.findFirst({
      where: { slug },
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
      orderBy: { order: "asc" },
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
      },
    });

    if (!cafe) {
      return res.status(404).json({ detail: "Cafe not found" });
    }

    // 1. Fetch categories in the desired order
    const orderedCategories = await prisma.category.findMany({
      where: {
        cafeId: cafe.id,
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
    // Fetch all active items for the cafe, including category and variants
    const items = await prisma.menuItem.findMany({
      where: {
        cafeId: cafe.id,
        is_active: true,
      },
      include: {
        category: true,
        variants: true, // ✅ include variants
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


export const emitOrderEvent = (
  req: Request,
  eventName: "new_order" | "order_updated" | "order_cancelled",
  order: Order
) => {
  const io: Server = req.app.get("io");
  if (!io || !order?.cafeId || !order?.id) {
    console.error("🔴 Failed to emit event: Missing io, cafeId, or order.id");
    return;
  }

  const cafeRoom = `cafe_${order.cafeId}`;
  const orderRoom = `order_${order.id}`;

  // 1. Emit to ADMIN room
  io.to(cafeRoom).emit(eventName, order);
  console.log(`📢 Emitted '${eventName}' to ADMIN room '${cafeRoom}'`);

  // 2. Emit to USER room - THIS IS THE CRITICAL MISSING PART
  io.to(orderRoom).emit(eventName, {
    status: order.status,
    paid: order.paid,
  });
  console.log(`📢 Emitted '${eventName}' to USER room '${orderRoom}'`);
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

  if (
    tableNo === undefined ||
    tableNo === null ||
    isNaN(Number(tableNo)) ||
    !cafeId ||
    !items?.length
  ) {
    return res.status(400).json({ message: "Missing required fields." });
  }

  try {
    // Validate itemIds and variantIds
    for (const item of items) {
      const menuItem = await prisma.menuItem.findUnique({
        where: { id: item.itemId },
        include: { variants: true },
      });
      if (!menuItem) {
        return res
          .status(400)
          .json({ message: `Invalid itemId: ${item.itemId}` });
      }
      if (item.variantId) {
        const variant = menuItem.variants.find((v) => v.id === item.variantId);
        if (!variant) {
          return res
            .status(400)
            .json({
              message: `Invalid variantId: ${item.variantId} for itemId: ${item.itemId}`,
            });
        }
      }
    }

    const lastOrder = await prisma.order.findFirst({
      where: { cafeId, tableNo, sessionToken, paid: false },
      orderBy: { created_at: "desc" },
      include: { order_items: true },
    });

    let orderToProcess: { id: number };
    let isNewOrder = false;

    const safePaymentMethod: PaymentMethod =
      paymentMethod &&
      Object.values(PaymentMethod).includes(paymentMethod as PaymentMethod)
        ? (paymentMethod as PaymentMethod)
        : PaymentMethod.cash;

    const safeOrderType: OrderType =
      orderType && Object.values(OrderType).includes(orderType as OrderType)
        ? (orderType as OrderType)
        : OrderType.dinein;

    if (lastOrder && lastOrder.paid === false) {
      orderToProcess = { id: lastOrder.id };

      await prisma.order.update({
        where: { id: orderToProcess.id },
        data: {
          sessionToken,
          payment_method: safePaymentMethod,
          specialInstructions,
          orderType: safeOrderType,
        },
      });

      // Delete existing order items to avoid conflicts
      await prisma.orderItem.deleteMany({
        where: { orderId: orderToProcess.id },
      });

      // Recreate order items
      const transactionItems = items.map((item) =>
        prisma.orderItem.create({
          data: {
            orderId: orderToProcess.id,
            itemId: item.itemId,
            quantity: item.quantity,
            variantId: item.variantId || null,
          },
        })
      );

      await prisma.$transaction(transactionItems);
    } else {
      isNewOrder = true;

      const newOrder = await prisma.order.create({
        data: {
          tableNo,
          cafeId,
          sessionToken,
          payment_method: safePaymentMethod,
          specialInstructions,
          orderType: safeOrderType,
          order_items: {
            create: items.map((item) => ({
              itemId: item.itemId,
              quantity: item.quantity,
              variantId: item.variantId || null,
            })),
          },
        },
      });

      orderToProcess = { id: newOrder.id };
    }

    const fullOrderForTotal = await prisma.order.findUnique({
      where: { id: orderToProcess.id },
      include: {
        order_items: {
          include: {
            item: { select: { price: true } },
            variant: { select: { price: true } },
          },
        },
      },
    });

    if (!fullOrderForTotal) {
      throw new Error("Could not find order after upsert operation.");
    }

    const totalPrice = fullOrderForTotal.order_items.reduce((sum, oi) => {
      const price = oi.variant
        ? Number(oi.variant.price)
        : Number(oi.item.price);
      return sum + price * oi.quantity;
    }, 0);

    const finalUpdatedOrder = await prisma.order.update({
      where: { id: orderToProcess.id },
      data: {
        total_price: new Prisma.Decimal(totalPrice.toFixed(2)),
      },
      include: {
        order_items: {
          include: {
            item: true,
            variant: true,
          },
        },
      },
    });

    const eventName = isNewOrder ? "new_order" : "order_updated";
    emitOrderEvent(req, eventName, finalUpdatedOrder);

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
        order_items: {
          include: {
            item: true,
            variant: true,
          },
        },
        bill: true,
      },
    });

    if (!order) {
      return res.status(404).json({
        message: "Order not found or has expired.",
        order: null,
      });
    }

    // Transform order_items to include variant name in item name and variant price
    const transformedOrderItems = order.order_items.map((oi) => ({
      ...oi,
      item: {
        ...oi.item,
        name: oi.variant
          ? `${oi.item.name} (${oi.variant.name})`
          : oi.item.name,
        price: oi.variant ? oi.variant.price : oi.item.price,
      },
    }));

    const responseOrder = { ...order, order_items: transformedOrderItems };

    return res.status(200).json({ order: responseOrder });
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
