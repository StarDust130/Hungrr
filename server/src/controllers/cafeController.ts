// src/controllers/cafeController.ts
import { Request, Response } from "express";
import prisma from "../config/prisma";
import { Prisma } from "@prisma/client";

// ✅ DEFINE THE TYPE HERE to match your Prisma Schema. This resolves the error.
type OrderStatus = "pending" | "accepted" | "preparing" | "ready" | "completed";

//! Cafe Banner 🤑
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

//! Cafe Menu Categories 🍽️
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


//! Cafe Menu 😋
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


/**
 * POST or PATCH a bill
 * Handles:
 *  - Creating a new order with items
 *  - Adding more items to an existing unpaid order
 *  - Returns the full bill (order + items + total)
 */
// Define the shape of the incoming request body for type safety
interface UpsertBillRequestBody {
  cafeId: number;
  tableNo: number;
  items: { itemId: number; quantity: number }[];
  paymentMethod?: "counter" | "online";
  specialInstructions?: string;
  orderType?: string;
}

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
  } = req.body;

  if (!tableNo || !cafeId || !items?.length) {
    return res.status(400).json({ message: "Missing required fields." });
  }

  try {
    const lastOrder = await prisma.order.findFirst({
      where: { cafeId, tableNo },
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
          payment_method: paymentMethod, // ✅ FIX: Update payment method
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



/**
 * PATCH the order after payment (mark as paid + create bill)
 */
//! OrderStatus Tracker 😤
// ✅ Mark order as paid + emit socket
// ✅ FIXED: Ensure this emits to the correct, prefixed room name
interface CompletePaymentBody {
  orderId: number;
}

export const completeOrderPayment = async (
  req: Request<{}, {}, CompletePaymentBody>,
  res: Response
) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({ message: "Missing orderId" });
    }

    const numericOrderId = Number(orderId);

    // ✅ Use a transaction to safely update the Order AND create the Bill
    const { updatedOrder, newBill } = await prisma.$transaction(async (tx) => {
      // First, fetch the order to get its price and check if it's already paid
      const order = await tx.order.findUnique({
        where: { id: numericOrderId },
        select: { total_price: true, paid: true },
      });

      if (!order) {
        throw new Error("Order not found.");
      }
      if (order.paid) {
        // This prevents the function from running twice on the same order
        throw new Error("This order has already been paid.");
      }

      // 1. Your existing logic to update the order's status
      const updatedOrderResult = await tx.order.update({
        where: { id: numericOrderId },
        data: {
          paid: true,
          status: "completed",
        },
        // We select the fields we need for the socket event and the new bill
        select: {
          id: true,
          status: true,
          paid: true,
          total_price: true,
        },
      });

      // 2. ✅ The new logic: Create the corresponding Bill record
      const newBillResult = await tx.bill.create({
        data: {
          orderId: numericOrderId,
          amount: updatedOrderResult.total_price, // Use the final total price from the order
          paid_at: new Date(),
        },
      });

      // Return both results from the transaction
      return { updatedOrder: updatedOrderResult, newBill: newBillResult };
    });

    // ✅ Your existing socket logic, which runs AFTER the database transaction is successful
    const io = req.app.get("io");
    const roomName = `order_${numericOrderId}`;
    io.to(roomName).emit("order_updated", {
      status: updatedOrder.status,
      paid: updatedOrder.paid,
    });
    console.log(`📡 Socket emit sent to room "${roomName}"`);

    // Return a complete success message
    return res.status(200).json({
      message: "Order marked as paid and bill created successfully.",
      order: updatedOrder,
      bill: newBill,
    });
  } catch (err: any) {
    console.error("❌ Error in completeOrderPayment:", err.message || err);
    // Handle specific, known errors gracefully
    if (
      err.message.includes("already been paid") ||
      err.message.includes("Order not found")
    ) {
      return res.status(409).json({ message: err.message }); // 409 Conflict is a good status code here
    }
    return res
      .status(500)
      .json({ message: "Server error", error: err.message });
  }
};



//! GET /api/bill/:cafeSlug/:tableNo
export const getBillInfo = async (req: Request, res: Response) => {
  const { cafeKey, tableNo } = req.params;

  try {
    const isId = /^\d+$/.test(cafeKey);
    const cafe = await prisma.cafe.findUnique({
      where: isId ? { id: parseInt(cafeKey, 10) } : { slug: cafeKey },
    });

    if (!cafe) {
      return res.status(404).json({ error: "Cafe not found" });
    }

    // ✅ IMPROVEMENT: Find the latest order that is NOT yet 'completed'.
    const order = await prisma.order.findFirst({
      where: {
        cafeId: cafe.id,
        tableNo: parseInt(tableNo, 10),
        status: {
          not: "completed", // This prevents showing old, finished orders.
        },
      },
      orderBy: { created_at: "desc" },
      include: {
        order_items: { include: { item: true } },
        bill: true,
      },
    });

    if (!order) {
      return res
        .status(404)
        .json({
          message: "No active order found for this table.",
          order: null,
        });
    }

    // This 'if' block now means NO order has EVER been placed for this table.
    if (!order) {
      console.warn("⚠️ No order found at all for this table.");
      // 404 Not Found is a better status code in this case.
      return res.status(404).json({
        message: "No order has been placed for this table yet.",
        order: null,
      });
    }

    // The rest of the function for calculating totals is correct and remains the same.
    const totalPrice = order.order_items.reduce((sum, oi) => {
      return sum + Number(oi.item.price) * oi.quantity;
    }, 0);

    if (Number(order.total_price) !== totalPrice) {
      await prisma.order.update({
        where: { id: order.id },
        data: { total_price: totalPrice },
      });
    }

    const gstAmount = Number((0.18 * totalPrice).toFixed(2));
    const grandTotal = Number((totalPrice + gstAmount).toFixed(2));

    console.log("✅ Processed bill totals for order ID:", order.id);

    return res.status(200).json({
      cafe: {
        name: cafe.name,
        slug: cafe.slug,
      },
      table: {
        number: order.tableNo,
      },
      order: {
        id: order.id,
        status: order.status,
        total_price: totalPrice,
        created_at: order.created_at,
        specialInstructions: order.specialInstructions,
        payment_method: order.payment_method,
        orderType: order.orderType,
        paid: order.paid, // This will correctly be 'true' for paid orders
        items: order.order_items.map((oi) => ({
          id: oi.item.id,
          name: oi.item.name,
          quantity: oi.quantity,
          price: Number(oi.item.price),
        })),
      },
      bill: {
        amount: grandTotal,
        gst: gstAmount,
      },
    });
  } catch (error) {
    console.error("💥 getBillInfo error:", error);
    return res.status(500).json({ error: "Server error" });
  }
};



/**
 * PATCH /api/order/:orderId/status
 * Updates the status and/or paid status of an order and notifies clients.
 */
export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const { status, paid } = req.body;

    if (status === undefined && paid === undefined) {
      return res
        .status(400)
        .json({ message: "Request body must contain 'status' or 'paid'" });
    }

    // ✅ This object now uses our new OrderStatus type for better type safety
    const dataToUpdate: { status?: OrderStatus; paid?: boolean } = {};

    if (status !== undefined) {
      const validStatuses: OrderStatus[] = [
        "pending",
        "accepted",
        "preparing",
        "ready",
        "completed",
      ];

      // The runtime validation check is still crucial
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: `Invalid status: '${status}'` });
      }

      // We tell TypeScript it's safe to use the validated status
      dataToUpdate.status = status;
    }

    if (paid !== undefined) {
      if (typeof paid !== "boolean") {
        return res
          .status(400)
          .json({ message: "'paid' must be a boolean (true or false)" });
      }
      dataToUpdate.paid = paid;
    }

    const numericOrderId = Number(orderId);
    if (isNaN(numericOrderId)) {
      return res.status(400).json({ message: "Invalid orderId" });
    }

    // Now, Prisma is happy because dataToUpdate has the correct type
    const updatedOrder = await prisma.order.update({
      where: { id: numericOrderId },
      data: dataToUpdate,
      select: {
        id: true,
        status: true,
        paid: true,
      },
    });

    console.log(
      `📦 Order ${numericOrderId} updated in database:`,
      dataToUpdate
    );

    const io = req.app.get("io");
    const roomName = `order_${numericOrderId}`;
    const payload = {
      status: updatedOrder.status,
      paid: updatedOrder.paid,
    };

    console.log(
      `📡 Emitting 'order_updated' to room "${roomName}" with payload:`,
      payload
    );
    io.to(roomName).emit("order_updated", payload);

    return res.status(200).json({
      message: "Order updated successfully",
      order: updatedOrder,
    });
  } catch (err: any) {
    if (err.code === "P2025") {
      return res.status(404).json({ message: "Order not found." });
    }
    console.error("❌ Error in updateOrderStatus:", err.message || err);
    return res.status(500).json({ message: "Server error" });
  }
};

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
        cafe: { select: { slug: true } },

        order_items: { include: { item: true } },
        bill: true,
      },
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found.", order: null });
    }

    return res.status(200).json({ order });
  } catch (error) {
    console.error("💥 getBillByPublicId error:", error);
    return res.status(500).json({ error: "Server error" });
  }
};

//! GET /api/cafe/:cafeId/table/:tableNo/active-orders
// This endpoint fetches all active orders for a specific cafe and table.
export const getActiveOrdersForTable = async (req: Request, res: Response) => {
  try {
    const { cafeId, tableNo } = req.params;
    const numericCafeId = Number(cafeId);
    const numericTableNo = Number(tableNo);

    if (isNaN(numericCafeId) || isNaN(numericTableNo)) {
      return res.status(400).json({ error: "Invalid Cafe or Table ID." });
    }

    const activeOrders = await prisma.order.findMany({
      where: {
        cafeId: numericCafeId,
        tableNo: numericTableNo,
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
    

    return res.status(200).json({ activeOrders });

  } catch (error: any) {
    console.error("Error fetching active orders:", error);
    return res.status(500).json({ error: "Server error" });
  }
};

/**
 * This function finds and deletes all orders that are still 'pending'
 * and were created more than 10 minutes ago.
 */
//! Cron Job to delete pending orders (After 10 min)
export const cleanupPendingOrders = async () => {
  console.log("----------------------------------------");
  console.log("🧹 Running scheduled job: Cleaning up pending orders...");

  try {
    // Calculate the timestamp for 7 minutes ago
    const sevenMinutesAgo = new Date(Date.now() - 7 * 60 * 1000);

    // Find all orders that meet the deletion criteria
    const abandonedOrders = await prisma.order.findMany({
      where: {
        status: "pending",
        paid: false,
        created_at: {
          lt: sevenMinutesAgo, // 'lt' means "less than"
        },
      },
      select: {
        id: true, // We only need the IDs for deletion
      },
    });

    if (abandonedOrders.length === 0) {
      console.log("✨ No abandoned orders found to delete.");
      console.log("----------------------------------------");
      return;
    }

    const orderIdsToDelete = abandonedOrders.map((order) => order.id);

    // Delete all found orders in a single, efficient operation.
    // Because we added `onDelete: Cascade`, Prisma will also delete their OrderItems.
    const deleteResult = await prisma.order.deleteMany({
      where: {
        id: {
          in: orderIdsToDelete,
        },
      },
    });

    console.log(`✅ Successfully deleted ${deleteResult.count} abandoned order(s).`);
    console.log("IDs deleted:", orderIdsToDelete);
    console.log("----------------------------------------");

  } catch (error) {
    console.error("❌ An error occurred during the cleanup job:", error);
  }
};