/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useBill } from "@/hooks/useBill";
import { BillDetails } from "./BillDetails";
import { OrderStatusTracker } from "./OrderStatusTracker";
import { BillFooter } from "./BillFooter";
import { BillActions } from "./BillActions";
import Loading from "@/app/bills/loading";

export default function BillPage() {
  const [cafeKey, setCafeKey] = useState<string | null>(null); // Use string for slug or id
  const [tableNo, setTableNo] = useState<number | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const raw = sessionStorage.getItem("currentBill");
      if (raw) {
        try {
          const sessionData = JSON.parse(raw);
          console.log("✅ sessionStorage found:", sessionData);
          setCafeKey(String(sessionData.cafeId)); // Use string here
          setTableNo(Number(sessionData.tableNo));
        } catch (err) {
          console.error("❌ Failed to parse sessionStorage:", err);
        }
      } else {
        console.warn("⚠️ sessionStorage 'currentBill' not found");
      }
    }
  }, []);

  console.log("🔍 cafeKey:", cafeKey, "tableNo:", tableNo);

  const { bill, loading, error } = useBill(cafeKey, tableNo);

  console.log("🔍 BillPage bill:", bill);

  if (loading || cafeKey === null || tableNo === null) {
    return <Loading />
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
      <OrderStatusTracker status={bill.status as any} bill={bill} />
      <BillDetails bill={bill} />
      <BillFooter />
      <BillActions bill={bill} />
    </div>
  );
}
