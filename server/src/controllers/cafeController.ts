// src/controllers/cafeController.ts
import { Request, Response } from "express";
import prisma from "../config/prisma";

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
      items, // [{ itemId, quantity }]
      paymentMethod, // "counter" | "online"
      specialInstructions,
      orderType,
    } = req.body;

    // Validate required fields
    if (!tableNo || !cafeId || !items?.length) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    // Check if there is already an active unpaid order
    let order = await prisma.order.findFirst({
      where: {
        tableNo,
        cafeId,
        paid: false,
      },
      include: { order_items: true },
    });

    if (!order) {
      // ✅ Create new order
      order = await prisma.order.create({
        data: {
          tableNo,
          cafeId,
          payment_method: paymentMethod || "counter",
          status: "pending",
          specialInstructions,
          orderType,
          order_items: {
            create: items.map((item: any) => ({
              itemId: item.itemId,
              quantity: item.quantity,
            })),
          },
        },
        include: { order_items: true },
      });
    } else {
      // ✅ Patch existing unpaid order with new items
      await prisma.orderItem.createMany({
        data: items.map((item: any) => ({
          itemId: item.itemId,
          quantity: item.quantity,
          orderId: order!.id,
        })),
        skipDuplicates: true,
      });

      // Reload the updated order
      order = await prisma.order.findUnique({
        where: { id: order.id },
        include: { order_items: true },
      });
    }

    res.status(200).json({ order });
  } catch (err) {
    console.error("Upsert bill error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * PATCH the order after payment (mark as paid + create bill)
 */
export const completePayment = async (req: Request, res: Response) => {
  try {
    const { orderId, paymentStatus, amount } = req.body;

    const order = await prisma.order.update({
      where: { id: orderId },
      data: {
        paid: true,
        status: "completed",
        bill: {
          create: {
            amount,
            paid_at: new Date(),
          },
        },
      },
      include: { bill: true },
    });

    res.status(200).json({ order });
  } catch (err) {
    console.error("Payment completion error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


//! GET /api/bill/:cafeSlug/:tableNo




// GET /api/bill/:cafeSlug/:tableNo
export const getBillInfo = async (req: Request, res: Response) => {
  const { cafeSlug, tableNo } = req.params;

  try {
    // 1. Find the cafe by slug
    const cafe = await prisma.cafe.findUnique({
      where: { slug: cafeSlug },
    });

    if (!cafe) {
      return res.status(404).json({ error: "Cafe not found" });
    }

    // 2. Find the latest unpaid order for the given tableNo
    const order = await prisma.order.findFirst({
      where: {
        cafeId: cafe.id,
        tableNo: parseInt(tableNo, 10),
        paid: false,
      },
      orderBy: {
        created_at: "desc",
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

    if (!order) {
      return res.status(200).json({
        message: "No unpaid order found for this table.",
        order: null,
      });
    }

    // 3. Respond with full bill details
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
        total_price: order.total_price,
        created_at: order.created_at,
        specialInstructions: order.specialInstructions,
        payment_method: order.payment_method,
        orderType: order.orderType,
        paid: order.paid,
        items: order.order_items.map((oi) => ({
          id: oi.id,
          name: oi.item.name,
          quantity: oi.quantity,
          price: oi.item.price,
        })),
      },
      bill: order.bill ?? null,
    });
  } catch (error) {
    console.error("getBillInfo error:", error);
    return res.status(500).json({ error: "Server error" });
  }
};
