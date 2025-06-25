"use client";

import { useEffect, useState } from "react";
import { useBill } from "@/hooks/useBill";
import { BillDetails } from "./BillDetails";
import { OrderStatusTracker } from "./OrderStatusTracker";
import { BillFooter } from "./BillFooter";
import { BillActions } from "./BillActions";
import socket from "@/lib/socket";
import { BillData, OrderStatus } from "@/types/menu";
import { log } from "@/lib/helper";
import Loading from "@/app/bills/loading";

// Your page now accepts publicId as a prop
export default function BillPage({ publicId }: { publicId: string }) {
  // The hook now directly uses the publicId prop
  const { bill: initialBill, loading, error } = useBill(publicId);
  log("BillPage: Initial bill data:", initialBill);
 


  // This state holds the live, socket-updated bill data
  const [liveBill, setLiveBill] = useState<BillData | null>(null);

  // This effect syncs the initial fetched data to the live state
  useEffect(() => {
    if (initialBill) {
      setLiveBill(initialBill);
    }
  }, [initialBill]);

  // This effect handles all socket communication
  useEffect(() => {
    // Don't connect socket if we don't have a bill yet
    if (!liveBill?.id) return;

    socket.connect();
    socket.emit("join_order_room", liveBill.id);

    const handleUpdate = (data: { status?: OrderStatus; paid?: boolean }) => {
      log("✅ Live update received:", data);

      if (data.paid === true) {
        localStorage.removeItem("cart");
        log("✅ Order is paid. Local cart has been cleared.");
      }

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

    return () => {
      socket.off("order_updated", handleUpdate);
      socket.disconnect(); // Good practice to disconnect on unmount
    };
  }, [liveBill?.id]); // This effect depends only on the live bill ID

  // --- All sessionStorage logic is GONE ---

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
