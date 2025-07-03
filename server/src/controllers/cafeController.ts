// src/controllers/cafeController.ts
import { Request, Response } from "express";
import prisma from "../config/prisma";
import { Prisma } from "@prisma/client";
import { UpsertBillRequestBody } from "../utils/types";



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
        bannerUrl: true,
        name: true,
        tagline: true,
        instaID: true,
        isPureVeg: true,
        openingTime: true,
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
      orderBy: { name: "asc" },
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
export const getCafeMenu = async (req: Request, res: Response): Promise<Response> => {
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

    const items = await prisma.menuItem.findMany({
      where: {
        cafeId: cafe.id,
        is_active: true,
      },
      include: {
        category: true,
      },
    });

    const grouped: Record<string, any[]> = {};
    for (const item of items) {
      if (item.category && item.category.name) {
        const catName = item.category.name;
        if (!grouped[catName]) grouped[catName] = [];
        grouped[catName].push(item);
      }
    }

    const categories = Object.keys(grouped).sort();
    const categoryIndex = parseInt(req.query.category_index as string) || 0;

    if (categoryIndex >= categories.length) {
      return res.status(204).json({});
    }

    const categoryName = categories[categoryIndex];
    if (categoryIndex >= categories.length) {
      return res.status(204).json({});
    }

    return res.json({
      [categoryName]: grouped[categoryName],
      hasMore: categoryIndex + 1 < categories.length,
    });
    
  } catch (err: any) {
    console.error("Error in getCafeMenu:", err);
    return res.status(500).json({ detail: "Internal server error" });
  }
};

//! 4) Upsert Bill (Create or Update Order) 💳
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
      where: { cafeId, tableNo, sessionToken , paid: false },
      orderBy: { created_at: "desc" },
    });

    let orderToProcess: { id: number };

    // SCENARIO 1: An unpaid order exists.
    if (lastOrder && lastOrder.paid === false) {
      orderToProcess = { id: lastOrder.id };

      // Also update the order's top-level details if they changed
      await prisma.order.update({
        where: { id: orderToProcess.id },
        data: {
          sessionToken: sessionToken, 
          payment_method: paymentMethod, 
          specialInstructions: specialInstructions,
          orderType: orderType,
        },
      });

      // Upsert items: This will create new items or update quantities of existing ones.
      const transactionItems = items.map((item) =>
        prisma.orderItem.upsert({
          where: {
            orderId_itemId: { orderId: orderToProcess.id, itemId: item.itemId },
          },
          // ✅ CRITICAL FIX: Replace the quantity, don't increment it.
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
      // SCENARIO 2: No active order exists, or the last one was paid. Create a NEW order.
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

    // The rest of the function remains the same...
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
      data: {
        total_price: new Prisma.Decimal(totalPrice.toFixed(2)),
      },
      // We use `select` to explicitly define the exact data to return.
      // This gives us full control.
      select: {
        id: true,
        publicId: true, // The important field for the frontend redirect
        paid: true,
        status: true,
        total_price: true,
        specialInstructions: true,
        payment_method: true,
        orderType: true,
        tableNo: true, // You might want to return this as well
        // You can still include relations when using `select` like this:
        order_items: {
          include: {
            item: true,
          },
        },
      },
      // ✅ FIX: The entire conflicting `include` block below has been removed.
    });

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
        cafe: { select: { slug: true  , name: true  , gstNo: true , logoUrl: true  , payment_url: true , address: true} },

        order_items: { include: { item: true } },
        bill: true,
      },
    });

    if (!order) {
      return res
        .status(404)
        .json({
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

    console.log(`📦 Fetched ${activeOrders.length} active orders for Cafe ID ${numericCafeId} and Table No ${numericTableNo}`);
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
    // 1. Get the order's public ID from the URL and the user's secret token from the header.
    const { publicId } = req.params;
    const sessionToken = req.headers["x-session-token"] as string;

    // 2. CRITICAL: If the user's session token is missing, deny the request.
    if (!sessionToken) {
      return res
        .status(401)
        .json({ message: "Unauthorized: Missing session token." });
    }

    // 3. Perform a single, atomic delete operation.
    // This is more efficient and safer than finding then deleting.
    const deletedOrder = await prisma.order.delete({
      // The 'where' clause is our security check. It will only find a record
      // to delete if ALL of these conditions are true.
      where: {
        publicId: publicId, // It must be the correct order.
        sessionToken: sessionToken, // It must belong to the user making the request.
        status: "pending", // It must still be in the 'pending' state.
        paid: false, // It must be unpaid.
      },
    });

    // If we reach here, the delete was successful.
    console.log(
      `✅ Order ${deletedOrder.id} was successfully canceled by the user.`
    );
    return res.status(200).json({ message: "Order successfully canceled." });
  } catch (error: any) {
    // Prisma throws a specific error (P2025) if no record was found to delete.
    // This is perfect for handling cases where the order doesn't exist, has already
    // been accepted by the kitchen, or belongs to another user.
    if (error.code === "P2025") {
      return res
        .status(404)
        .json({ message: "Order not found, or it can no longer be canceled." });
    }

    console.error("❌ Error canceling order:", error);
    return res
      .status(500)
      .json({ message: "Server error: Could not cancel order." });
  }
};