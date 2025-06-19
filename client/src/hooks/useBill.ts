/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import axios from "axios";
import { BillData } from "@/types/menu";

export function useBill(cafeId: number | null, tableNo: number | null) {
  const [bill, setBill] = useState<BillData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log("👀 useEffect called with", cafeId, tableNo); // Add this
    if (!cafeId || tableNo === null) {
      console.log("❌ Skipping fetch - missing cafeId or tableNo");
      return;
    }

    const fetchBill = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/bill/${cafeId}/${tableNo}`
        );

        const data = response.data;

        const billData: BillData = {
          id: data.order.id,
          timestamp: data.order.created_at,
          items: data.order.items.map((item: any) => ({
            item: {
              id: item.id,
              name: item.name,
              price: item.price,
            },
            quantity: item.quantity,
          })),
          totalPrice: data.order.total_price,
          gstAmount: data.bill?.gst || 0,
          grandTotal: data.bill?.grandTotal || data.order.total_price,
          paymentMethod: data.order.payment_method,
          paymentStatus: data.order.paid ? "paid" : "pending",
        };

        setBill(billData);
      } catch (err) {
        console.error("❌ Failed to fetch bill:", err);
        setError("Failed to load bill.");
      } finally {
        setLoading(false);
      }
    };

    fetchBill();
  }, [cafeId, tableNo]);

  return { bill, loading, error };
}
  
