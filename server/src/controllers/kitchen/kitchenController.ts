import prisma from "../../config/prisma";
import { emitOrderEvent } from "../user/userController"; // Assuming this path is correct
import { Request, Response } from "express";

// Get all active orders for a cafe
export const getOrders = async (req: Request, res: Response) => {
  try {
    const { cafeId } = req.query;
    if (!cafeId) {
      return res.status(400).json({ error: "Cafe ID is required" });
    }

    const orders = await prisma.order.findMany({
      where: {
        cafeId: parseInt(cafeId as string),
        status: {
          in: ["accepted", "preparing", "ready"], // Fetch only active orders
        },
      },
      include: {
        order_items: {
          include: {
            item: true,
            variant: true,
          },
        },
      },
      orderBy: {
        created_at: "asc", // Oldest orders first
      },
    });

    res.json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ error: "Error fetching orders" });
  }
};

// Set preparation time AND start cooking
export const setPrepTime = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { prepTime } = req.body;
    if (!prepTime || isNaN(prepTime)) {
      return res.status(400).json({ error: "Valid prep time is required" });
    }

    const order = await prisma.order.update({
      where: { id: parseInt(id) },
      // Atomically update both prepTime and status
      data: {
        prepTime: parseInt(prepTime),
        status: "preparing",
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

    // Emit the single update to all clients
    emitOrderEvent(req, "order_updated", order);
    res.json(order);
  } catch (error) {
    console.error("Error setting prep time:", error);
    res.status(500).json({ error: "Error setting prep time" });
  }
};

// Complete cooking (status -> ready)
export const completeCooking = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const order = await prisma.order.update({
      where: { id: parseInt(id) },
      data: { status: "ready" },
      include: {
        order_items: {
          include: {
            item: true,
            variant: true,
          },
        },
      },
    });
    emitOrderEvent(req, "order_updated", order);
    res.json(order);
  } catch (error) {
    console.error("Error completing cooking:", error);
    res.status(500).json({ error: "Error completing cooking" });
  }
};

// Mark order as served (status -> completed)
export const serveOrder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const order = await prisma.order.update({
      where: { id: parseInt(id) },
      data: {
        status: "completed",
        updated_at: new Date(),
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
    emitOrderEvent(req, "order_updated", order);
    res.json(order);
  } catch (error) {
    console.error("Error marking order as served:", error);
    res.status(500).json({ error: "Error marking order as served" });
  }
};
