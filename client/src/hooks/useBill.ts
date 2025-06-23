/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import axios from "axios";
import { BillData } from "@/types/menu";
import { log } from "@/lib/helper";

// The hook now accepts a single orderId string
export function useBill(orderId: string | null) {
  const [bill, setBill] = useState<BillData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Don't fetch if orderId is not available yet
    if (!orderId) {
      setLoading(false);
      return;
    }

    const fetchBill = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/bill/${orderId}`
        );

        const { order } = res.data;
        if (!order) {
          throw new Error("No active order found.");
        }

        // Transform the backend order into the frontend BillData type
        const totalPrice = Number(order.total_price);
        const gstAmount = Number((totalPrice * 0.18).toFixed(2));
        const grandTotal = totalPrice + gstAmount;

        const billData: BillData = {
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
        };

        log("✅ Bill data fetched by ID:", billData);
        setBill(billData);
      } catch (err: any) {
        console.error("❌ Failed to fetch bill by ID:", err);
        setError(err.response?.data?.message || "Failed to load bill.");
      } finally {
        setLoading(false);
      }
    };

    fetchBill();
  }, [orderId]); // The effect now re-runs only if the orderId changes

  return { bill, loading, error };
}
