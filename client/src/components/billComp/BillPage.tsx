"use client";

import { useEffect, useState } from "react";
import { Loader } from "lucide-react";
import { useBill } from "@/hooks/useBill";
import { BillDetails } from "./BillDetails";
import { OrderStatusTracker } from "./OrderStatusTracker";
import { BillFooter } from "./BillFooter";
import { BillActions } from "./BillActions";

export default function BillPage() {
  const [cafeId, setCafeId] = useState<number | null>(null);
  const [tableNo, setTableNo] = useState<number | null>(null);


  

  useEffect(() => {
    if (typeof window !== "undefined") {
      const raw = sessionStorage.getItem("currentBill");
      if (raw) {
        try {
          const sessionData = JSON.parse(raw);
          console.log("✅ sessionStorage found:", sessionData);
          setCafeId(Number(sessionData.cafeId));
          setTableNo(Number(sessionData.tableNo));
        } catch (err) {
          console.error("❌ Failed to parse sessionStorage:", err);
        }
      } else {
        console.warn("⚠️ sessionStorage 'currentBill' not found");
      }
    }
  }, []);

  const { bill, loading, error } = useBill(cafeId, tableNo);
    console.log("🔍 BillPage" , bill);

  if (loading || cafeId === null || tableNo === null) {
    return (
      <main className="flex justify-center items-center min-h-screen">
        <Loader className="w-6 h-6 animate-spin" />
        <span className="ml-2">Loading bill...</span>
      </main>
    );
  }

  if (error || !bill) {
    return (
      <main className="flex justify-center items-center min-h-screen text-red-500">
        <p>{error || "No active bill found for this table."}</p>
      </main>
    );
  }

  return (
    <div className="flex flex-col max-w-3xl mx-auto items-center justify-center min-h-screen p-4 gap-3">
      <p className="text-sm hidden md:block mx-auto">
        🐸 Yeah, I know the UI&apos;s ugly—but it&apos;s mobile-first, so I
        saved time being lazy! 😅📱 😁
      </p>
      <OrderStatusTracker status={bill.status} bill={bill} />
      <BillDetails bill={bill} />
      <BillFooter />
      <BillActions bill={bill} />
    </div>
  );
}
