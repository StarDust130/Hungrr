// src/controllers/cafeController.ts
import { Request, Response } from "express";
import prisma from "../config/prisma";
import {  OrderStatus } from "../utils/types";


//! 1) Update Order Status (Socket io Live Status Show) 📦
export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const { status, paid } = req.body;

    if (status === undefined && paid === undefined) {
      return res
        .status(400)
        .json({ message: "Request body must contain 'status' or 'paid'" });
    }

    const numericOrderId = Number(orderId);
    if (isNaN(numericOrderId)) {
      return res.status(400).json({ message: "Invalid orderId" });
    }

    // Validate and prepare update data
    const dataToUpdate: { status?: OrderStatus; paid?: boolean } = {};

    if (status !== undefined) {
      const validStatuses: OrderStatus[] = [
        "pending",
        "accepted",
        "preparing",
        "ready",
        "completed",
      ];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: `Invalid status: '${status}'` });
      }
      dataToUpdate.status = status;
    }

    if (paid !== undefined) {
      if (typeof paid !== "boolean") {
        return res.status(400).json({ message: "'paid' must be a boolean" });
      }
      dataToUpdate.paid = paid;
    }

    let updatedOrder,
      newBill = null;

    await prisma.$transaction(async (tx) => {
      // Step 1: Update the order
      updatedOrder = await tx.order.update({
        where: { id: numericOrderId },
        data: dataToUpdate,
        select: {
          id: true,
          status: true,
          paid: true,
          total_price: true,
        },
      });

      // Step 2: If paid is true and status is completed, create a bill
      if (updatedOrder.paid && updatedOrder.status === "completed") {
        // Check if a bill already exists to prevent duplicates
        const existingBill = await tx.bill.findFirst({
          where: { orderId: numericOrderId },
        });

        if (!existingBill) {
          newBill = await tx.bill.create({
            data: {
              orderId: numericOrderId,
              amount: updatedOrder.total_price,
              paid_at: new Date(),
            },
          });
        }
      }
    });

    // Emit update via Socket.io
    const io = req.app.get("io");
    const roomName = `order_${numericOrderId}`;
    const payload = {
      status: updatedOrder!.status,
      paid: updatedOrder!.paid,
    };

    io.to(roomName).emit("order_updated", payload);

    return res.status(200).json({
      message: "Order updated successfully",
      order: updatedOrder,
      bill: newBill,
    });
  } catch (err: any) {
    if (err.code === "P2025") {
      return res.status(404).json({ message: "Order not found." });
    }
    console.error("❌ Error in updateOrderStatus:", err.message || err);
    return res.status(500).json({ message: "Server error" });
  }
};
  


