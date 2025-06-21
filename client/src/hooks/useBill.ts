/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import axios from "axios";
import { BillData } from "@/types/menu";

export function useBill(cafeKey: string | null, tableNo: number | null) {
  const [bill, setBill] = useState<BillData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log("📦 useBill hook called with:", cafeKey, tableNo);

    if (!cafeKey || tableNo === null) return;

    const fetchBill = async () => {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/bill/${cafeKey}/${tableNo}`
        );

        const data = res.data;
        console.log("✅ Bill data fetched:", data);

        if (!data.order) {
          console.warn("⚠️ No active order found");
          setError("No active bill found for this table.");
          return;
        }

        const billData: BillData = {
          id: data.order.id,
          timestamp: data.order.created_at,
          items: data.order.items.map((item: any) => ({
            item: {
              id: item.id,
              name: item.name,
              price: Number(item.price),
            },
            quantity: item.quantity,
          })),
          totalPrice: Number(data.order.total_price),
          gstAmount: Number(data.bill?.gst || 0), // ✅ Fix here
          grandTotal: Number(data.bill?.amount || data.order.total_price), // ✅ Fix here
          paymentMethod: data.order.payment_method,
          paymentStatus: data.order.paid ? "paid" : "pending",
          status: data.order.status,
        };

        console.log("✅ Bill data processed:", billData);
        

        setBill(billData);
      } catch (err) {
        console.error("❌ Failed to fetch bill:", err);
        setError("Failed to load bill.");
      } finally {
        setLoading(false);
      }
    };

    fetchBill();
  }, [cafeKey, tableNo]);

  return { bill, loading, error };
}
