/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useBill } from "@/hooks/useBill";
import { BillDetails } from "./BillDetails";
import { OrderStatusTracker } from "./OrderStatusTracker";
import { BillFooter } from "./BillFooter";
import { BillActions } from "./BillActions";
import Loading from "@/app/bills/loading";
import socket from "@/lib/socket";
import { BillData, OrderStatus } from "@/types/menu"; // Make sure types are imported

export default function BillPage() {
  const [cafeKey, setCafeKey] = useState<string | null>(null);
  const [tableNo, setTableNo] = useState<number | null>(null);

  // This hook fetches the initial bill data
  const { bill: initialBill, loading, error } = useBill(cafeKey, tableNo);

  // ✅ FIX: Create a new state variable to hold the LIVE bill data.
  const [liveBill, setLiveBill] = useState<BillData | null>(null);

  // Sync the fetched bill data with our live state
  useEffect(() => {
    if (initialBill) {
      setLiveBill(initialBill);
    }
  }, [initialBill]);

  // ✅ FIX: Moved the socket listener logic here, to the parent component.
  useEffect(() => {
    // Don't do anything if we don't have a bill yet
    if (!liveBill?.id) return;

    socket.connect();
    socket.emit("join_order_room", liveBill.id);

    const handleUpdate = (data: { status?: OrderStatus; paid?: boolean }) => {
      console.log("✅ Live update received in PARENT component:", data);

      // Update the liveBill state with the new data
      setLiveBill((prevBill) => {
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

    socket.on("order_updated", handleUpdate);

    // Cleanup function
    return () => {
      socket.off("order_updated", handleUpdate);
    };
  }, [liveBill?.id]); // This effect now depends on the liveBill ID

  // This useEffect for sessionStorage remains the same
  useEffect(() => {
    if (typeof window !== "undefined") {
      const raw = sessionStorage.getItem("currentBill");
      if (raw) {
        try {
          const sessionData = JSON.parse(raw);
          setCafeKey(String(sessionData.cafeId));
          setTableNo(Number(sessionData.tableNo));
        } catch (err) {
          console.error("❌ Failed to parse sessionStorage:", err);
        }
      }
    }
  }, []);

  if (loading || !liveBill) {
    return <Loading />;
  }

  if (error) {
    return (
      <main className="flex justify-center items-center min-h-screen text-red-500">
        <p>{error}</p>
      </main>
    );
  }

  return (
    <div className="flex flex-col max-w-3xl mx-auto items-center justify-center min-h-screen p-4 gap-3">
      <p className="text-sm hidden md:block mx-auto">
        🐸 Yeah, I know the UI&apos;s ugly—but it&apos;s mobile-first, so I
        saved time being lazy! 😅📱 😁
      </p>
      {/* ✅ FIX: Both components now receive the SAME live bill data */}
      <OrderStatusTracker bill={liveBill} />
      <BillDetails bill={liveBill} />
      <BillFooter />
      <BillActions bill={liveBill} />
    </div>
  );
}
