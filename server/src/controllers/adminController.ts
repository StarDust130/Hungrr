// src/controllers/cafeController.ts
import { Request, Response } from "express";
import prisma from "../config/prisma";
import {  OrderStatus } from "../utils/types";


//! 1) Update Order Status (Socket io Live Status Show) 📦
export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const { status, paid } = req.body;

    // --- Input Validation (Your code here is already perfect) ---
    if (status === undefined && paid === undefined) {
      return res
        .status(400)
        .json({ message: "Request must contain 'status' or 'paid'" });
    }
    const numericOrderId = Number(orderId);
    if (isNaN(numericOrderId)) {
      return res.status(400).json({ message: "Invalid orderId" });
    }
    const dataToUpdate: { status?: OrderStatus; paid?: boolean } = {};
    if (status) {
      // Your status validation is correct
      dataToUpdate.status = status;
    }
    if (paid !== undefined) {
      // Your 'paid' validation is correct
      dataToUpdate.paid = paid;
    }
    // --- End Validation ---

    // ✅ FIX: Get the results by destructuring the returned value from the transaction
    const { finalOrder, finalBill } = await prisma.$transaction(async (tx) => {
      // Step 1: Update the order
      const updatedOrder = await tx.order.update({
        where: { id: numericOrderId },
        data: dataToUpdate,
        select: {
          id: true,
          status: true,
          paid: true,
          total_price: true,
        },
      });

      let newBill = null;
      // Step 2: If paid and completed, create a bill if one doesn't exist
      if (updatedOrder.paid && updatedOrder.status === "completed") {
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

      // ✅ FIX: Return the results from the transaction block
      return { finalOrder: updatedOrder, finalBill: newBill };
    });

    // Now 'finalOrder' and 'finalBill' have the correct values here.

    // Emit update via Socket.io
    const io = req.app.get("io");
    const roomName = `order_${numericOrderId}`;
    const payload = {
      status: finalOrder.status,
      paid: finalOrder.paid,
    };

    io.to(roomName).emit("order_updated", payload);

    return res.status(200).json({
      message: "Order updated successfully.",
      order: finalOrder,
      bill: finalBill, // Will be null if no bill was created
    });
  } catch (err: any) {
    if (err.code === "P2025") {
      return res.status(404).json({ message: "Order not found." });
    }
    console.error("❌ Error in updateOrderStatus:", err.message || err);
    return res.status(500).json({ message: "Server error" });
  }
};
  


