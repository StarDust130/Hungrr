// src/controllers/cafeController.ts
import { Request, Response } from "express";
import prisma from "../config/prisma";

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
export const upsertBill = async (req: Request, res: Response) => {
  try {
    const {
      tableNo,
      cafeId,
      items,
      paymentMethod,
      specialInstructions,
      orderType,
    } = req.body;

    // ... (basic validation remains the same) ...
    if (!tableNo || !cafeId || !items?.length) {
      return res.status(400).json({ message: "Missing required fields." });
    }
    const numericCafeId = Number(cafeId);
    const numericTableNo = Number(tableNo);
    if (isNaN(numericCafeId) || isNaN(numericTableNo)) {
      return res.status(400).json({ message: "Invalid cafeId or tableNo" });
    }

    // ✅ FIXED LOGIC: First, find the most recent order for the table, regardless of payment status.
    const lastOrderForTable = await prisma.order.findFirst({
      where: {
        tableNo: numericTableNo,
        cafeId: numericCafeId,
      },
      orderBy: {
        created_at: "desc",
      },
    });

    // ✅ NEW RULE: If the last order for this table is already paid, block the request.
    if (lastOrderForTable && lastOrderForTable.paid) {
      return res.status(409).json({
        // 409 Conflict is a good status code here
        message:
          "This table has a completed and paid order. Please start a new bill if needed.",
        order: lastOrderForTable,
      });
    }

    let order;

    // If an unpaid order exists, add items to it.
    if (lastOrderForTable) {
      // ✅ Order exists and is unpaid — add new items
      await prisma.orderItem.createMany({
        data: items.map((item: any) => ({
          itemId: Number(item.itemId),
          quantity: item.quantity,
          orderId: lastOrderForTable.id,
        })),
        skipDuplicates: true,
      });

      // ✅ Fetch updated order
      order = await prisma.order.findUnique({
        where: { id: lastOrderForTable.id },
        include: { order_items: true },
      });
    } else {
      // ✅ No order exists at all — create a new one
      order = await prisma.order.create({
        data: {
          tableNo: numericTableNo,
          cafeId: numericCafeId,
          payment_method: paymentMethod || "counter",
          status: "pending",
          specialInstructions,
          orderType,
          order_items: {
            create: items.map((item: any) => ({
              itemId: Number(item.itemId),
              quantity: item.quantity,
            })),
          },
        },
        include: { order_items: true },
      });
    }

    if (!order) {
      return res
        .status(500)
        .json({ message: "Order could not be created or fetched." });
    }

    return res.status(200).json({ order });
  } catch (err: any) {
    console.error("❌ Upsert bill error:", err?.message || err);
    return res
      .status(500)
      .json({ message: "Server error", error: err?.message });
  }
};



/**
 * PATCH the order after payment (mark as paid + create bill)
 */
//! OrderStatus Tracker 😤
// ✅ Mark order as paid + emit socket
// ✅ FIXED: Ensure this emits to the correct, prefixed room name
export const completeOrderPayment = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({ message: "Missing orderId" });
    }

    const numericOrderId = Number(orderId);

    // ✅ Mark order as paid and update status
    const updatedOrder = await prisma.order.update({
      where: { id: numericOrderId },
      data: {
        paid: true,
        status: "completed", // Or "confirmed" if that's your first step after payment
      },
      select: {
        id: true,
        status: true,
        paid: true,
      },
    });

    // ✅ Send live update via socket.io to the correct room
    const io = req.app.get("io");
    const roomName = `order_${numericOrderId}`; // ✅ Use the same consistent room name
    io.to(roomName).emit("order_updated", {
      status: updatedOrder.status,
      paid: updatedOrder.paid,
    });

    console.log(`📡 Socket emit sent to room "${roomName}"`);
    console.log("✅ 😽 Updated order:", updatedOrder);


    console.log(`✅ 😽 Event sent for order:`, updatedOrder);

    return res.status(200).json({
      message: "Order updated",
      order: updatedOrder,
    });
  } catch (err: any) {
    console.error("❌ Error in completeOrderPayment:", err.message || err);
    return res.status(500).json({ message: "Server error" });
  }
};



//! GET /api/bill/:cafeSlug/:tableNo
export const getBillInfo = async (req: Request, res: Response) => {
  const { cafeKey, tableNo } = req.params;

  try {
    console.log("🔍 Fetching bill for cafeKey:", cafeKey, "tableNo:", tableNo);
    const isId = /^\d+$/.test(cafeKey);

    const cafe = await prisma.cafe.findUnique({
      where: isId ? { id: parseInt(cafeKey, 10) } : { slug: cafeKey },
    });

    if (!cafe) {
      console.warn("❌ Cafe not found");
      return res.status(404).json({ error: "Cafe not found" });
    }

    // Find the MOST RECENT order for this table, regardless of payment status.
    const order = await prisma.order.findFirst({
      where: {
        cafeId: cafe.id,
        tableNo: parseInt(tableNo, 10),
        // ✅ REMOVED: The line `paid: false` was here.
        // By removing it, we find the latest order, whether it's paid or not.
      },
      orderBy: {
        created_at: "desc", // This ensures we get the newest one
      },
      include: {
        order_items: {
          include: {
            item: true,
          },
        },
        bill: true,
      },
    });

    // This 'if' block now means NO order has EVER been placed for this table.
    if (!order) {
      console.warn("⚠️ No order found at all for this table.");
      // 404 Not Found is a better status code in this case.
      return res
        .status(404)
        .json({
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
