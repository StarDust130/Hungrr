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
import OrderNotFound from "./OrderNotFound";

export default function BillPage({ publicId }: { publicId: string }) {
  const { bill: initialBill, loading, error } = useBill(publicId);
  const [liveBill, setLiveBill] = useState<BillData | null>(null);

  useEffect(() => {
    if (initialBill) {
      setLiveBill(initialBill);
    }
  }, [initialBill]);

  useEffect(() => {
    if (!liveBill?.id) return;

    socket.connect();
    socket.emit("join_order_room", liveBill.id);

    const handleUpdate = (data: { status?: OrderStatus; paid?: boolean }) => {
      log("✅ Live update received:", data);

      if (data.paid === true) {
        sessionStorage.removeItem("cart");
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
      socket.disconnect();
    };
  }, [liveBill?.id, error]);

  // 1. Show loading indicator while the initial data is being fetched.
  if (loading) {
    return <Loading />;
  }

  // 2. After loading is complete, check for an error or if the bill is null.
  //    This is the only time we should show the OrderNotFound component.
  if (error || !initialBill) {
    return (
      <OrderNotFound
        error={error || "The requested bill could not be found."}
      />
    );
  }

  // 3. If we have a liveBill, render the main UI.
  //    We check for liveBill here to ensure we don't render with null data
  //    before the initialBill has been set to the liveBill state.
  if (liveBill) {
    return (
      <div className="flex flex-col max-w-3xl mx-auto items-center justify-center min-h-screen p-4 gap-3">
        <p className="text-sm hidden md:block mx-auto">
          🐸 Yeah, I know the UI&apos;s ugly—but it&apos;s mobile-first, so I
          saved time being lazy! 😅📱 😁
        </p>
        <OrderStatusTracker bill={liveBill} />
        <BillDetails bill={liveBill} />
        {
          liveBill.status !== "pending" && <BillFooter />
        }
        
        <BillActions bill={liveBill} />
      </div>
    );
  }

  // Fallback: This will briefly show the loading component if liveBill
  // hasn't been set yet, preventing a flash of a blank screen.
  return <Loading />;
}
