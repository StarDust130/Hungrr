"use client";

import { useEffect, useState } from "react";
import { useBill } from "@/hooks/useBill";
import { BillDetails } from "./BillDetails";
import { OrderStatusTracker } from "./OrderStatusTracker";
import { BillFooter } from "./BillFooter";
import { BillActions } from "./BillActions";
import Loading from "@/app/bills/loading";
import socket from "@/lib/socket";
import { BillData, OrderStatus } from "@/types/menu";
import { log } from "@/lib/helper";

export default function BillPage() {
  const [cafeKey, setCafeKey] = useState<string | null>(null);
  const [tableNo, setTableNo] = useState<number | null>(null);

  const { bill: initialBill, loading, error } = useBill(cafeKey, tableNo);
  const [liveBill, setLiveBill] = useState<BillData | null>(null);

  useEffect(() => {
    if (initialBill) {
      setLiveBill(initialBill);
    }
  }, [initialBill]);

  // ✅ This useEffect is the correct place
  useEffect(() => {
    if (!liveBill?.id) return;

    socket.connect();
    socket.emit("join_order_room", liveBill.id);

    const handleUpdate = (data: { status?: OrderStatus; paid?: boolean }) => {
      log("✅ Live update received in PARENT component:", data);

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

      // ✅ --- THIS IS WHERE YOU ADD THE NEW CODE --- ✅
      // If the update from the server confirms the order is paid,
      // remove the cart from localStorage.
      if (data.paid === true) {
        localStorage.removeItem("cart");
        log("✅ Order is paid. Local cart has been cleared.");
      }
      // ✅ --- END OF NEW CODE --- ✅
    };

    socket.on("order_updated", handleUpdate);

    return () => {
      socket.off("order_updated", handleUpdate);
    };
  }, [liveBill?.id]);

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
      <OrderStatusTracker bill={liveBill} />
      <BillDetails bill={liveBill} />
      <BillFooter />
      <BillActions bill={liveBill} />
    </div>
  );
}
