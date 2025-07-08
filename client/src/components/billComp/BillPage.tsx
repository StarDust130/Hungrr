// src/components/BillPage.tsx (or wherever you have it)
"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { OrderStatusTracker } from "./OrderStatusTracker"; // The "dumb" child
import { BillDetails } from "./BillDetails";
import { BillFooter } from "./BillFooter";
import { BillActions } from "./BillActions";
import socket from "@/lib/socket";
import { BillData, OrderStatus } from "@/types/menu";
import { GST_CALCULATION } from "@/lib/helper";
import Loading from "@/app/bills/loading";
import OrderNotFound from "./OrderNotFound";

export default function BillPage({ publicId }: { publicId: string }) {
  // State for the bill, loading, and error is owned by this parent component
  const [bill, setBill] = useState<BillData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Effect 1: Handles the INITIAL data fetch. Runs only when publicId changes.
  useEffect(() => {
    const fetchBill = async () => {
      if (!publicId) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/bill/${publicId}`
        );
        const { order } = res.data;
        if (!order) throw new Error("Order not found.");

        const totalPrice = Number(order.total_price);
        const { gstAmount, grandTotal } = GST_CALCULATION(totalPrice);

        // Set the initial state of the bill
        setBill({
          id: order.id,
          timestamp: order.created_at,
          items: order.order_items,
          totalPrice,
          gstAmount,
          grandTotal,
          paymentMethod: order.payment_method,
          paymentStatus: order.paid ? "paid" : "pending",
          status: order.status,
          tableNo: order.tableNo,
          orderType: order.orderType,
          cafeName: order.cafe.name,
          logoUrl: order.cafe.logoUrl || "",
          gstNo: order.cafe.gstNo || "",
          payment_url: order.cafe.payment_url || "",
          address: order.cafe.address || "",
          publicId: order.publicId || "",
        });
      } catch (err) {
        setError("Failed to load bill.");
      } finally {
        setLoading(false);
      }
    };
    fetchBill();
  }, [publicId]);

  // Effect 2: Manages the LIVE WebSocket updates. Runs only when the bill ID is available.
  useEffect(() => {
    if (!bill?.id) return;

    const handleUpdate = (data: { status?: OrderStatus; paid?: boolean }) => {
      console.log("✅ Live WebSocket update received:", data);
      setBill((prevBill) => {
        if (!prevBill) return null;
        const newPaymentStatus =
          typeof data.paid === "boolean"
            ? data.paid
              ? "paid"
              : "pending"
            : prevBill.paymentStatus;
        return {
          ...prevBill,
          status: data.status ?? prevBill.status,
          paymentStatus: newPaymentStatus,
        };
      });
    };

    socket.connect();
    socket.emit("join_order_room", bill.id);
    socket.on("order_updated", handleUpdate);

    return () => {
      socket.off("order_updated", handleUpdate);
      socket.disconnect();
    };
  }, [bill?.id]);

  // --- RENDER LOGIC ---

  if (loading) return <Loading />;
  if (error || !bill)
    return (
      <OrderNotFound error={error || "Could not find the requested bill."} />
    );

  // Pass the single `bill` state down to all child components.
  // When `bill` is updated by the socket, all these components will re-render with new props.
  return (
    <div className="flex flex-col w-full mx-auto items-center justify-center min-h-screen p-4 gap-3">
      <OrderStatusTracker bill={bill} />
      <BillDetails bill={bill} />
      {bill.status !== "pending" && <BillFooter />}
      <BillActions bill={bill} />
    </div>
  );
}
