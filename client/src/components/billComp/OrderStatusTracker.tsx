/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import socket from "@/lib/socket";
import {
  CheckCircle,
  Clock,
  UtensilsCrossed,
  PartyPopper,
  Store,
  Check,
} from "lucide-react";
import { BillData } from "@/types/menu"; // Assuming this is the path to your type

// This should match your Prisma schema enum for consistency
export type OrderStatus =
  | "pending"
  | "accepted"
  | "preparing"
  | "ready"
  | "completed";

// The useCountdown hook remains unchanged
const useCountdown = (initialMinutes: number, isActive: boolean) => {
  const [totalSeconds, setTotalSeconds] = useState(initialMinutes * 60);
  const totalInitialSeconds = initialMinutes * 60;

  useEffect(() => {
    if (!isActive) {
      setTotalSeconds(initialMinutes * 60);
      return;
    }
    if (totalSeconds <= 0) return;

    const timer = setInterval(() => {
      setTotalSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [isActive, totalSeconds, initialMinutes]);

  const percentage =
    totalSeconds > 0
      ? ((totalInitialSeconds - totalSeconds) / totalInitialSeconds) * 100
      : 100;

  return {
    minutes: Math.floor(totalSeconds / 60),
    seconds: totalSeconds % 60,
    percentage,
  };
};

export const OrderStatusTracker = ({ bill }: { bill: BillData }) => {
  // ✅ State is initialized from the props with the correct types
  const [status, setStatus] = useState<OrderStatus>(bill.status as OrderStatus);
  // ✅ FIXED: Initialize the 'isPaid' state from 'bill.paymentStatus'
  const [isPaid, setIsPaid] = useState(bill.paymentStatus === "paid");

  const { minutes, seconds, percentage } = useCountdown(
    15,
    status === "preparing"
  );

  // The socket logic is correct and remains the same
  useEffect(() => {
    if (!bill?.id) return;

    socket.connect();
    socket.emit("join_order_room", bill.id);

    // This listener correctly handles the { paid: boolean } from the socket
    const handleUpdate = (data: { status?: OrderStatus; paid?: boolean }) => {
      console.log("✅ 🔄 Live update received:", data);
      if (data.status) {
        setStatus(data.status);
      }
      // It updates the internal 'isPaid' state, which drives the UI
      if (typeof data.paid === "boolean") {
        setIsPaid(data.paid);
      }
    };

    socket.on("order_updated", handleUpdate);

    return () => {
      socket.off("order_updated", handleUpdate);
    };
  }, [bill.id]);

  // The rendering logic remains the same
  const getLiveStatusDetails = () => {
    if (bill.paymentMethod === "counter" && !isPaid) {
      return {
        title: "Go to Counter to Pay",
        Icon: Store,
        color: "text-gray-500",
        gradient: "from-gray-400 to-gray-500",
        progress: 5,
      };
    }

    switch (status) {
      case "pending":
        return {
          title: isPaid ? "Order Placed" : "Awaiting Payment",
          Icon: Clock,
          color: "text-gray-500",
          gradient: "from-gray-400 to-gray-500",
          progress: 10,
        };
      case "accepted":
        return {
          title: "Order Confirmed",
          Icon: CheckCircle,
          color: "text-blue-500",
          gradient: "from-blue-500 to-cyan-500",
          progress: 33,
        };
      case "preparing":
        return {
          title: "Preparing Your Food",
          Icon: UtensilsCrossed,
          color: "text-orange-500",
          gradient: "from-orange-500 to-amber-500",
          progress: 33 + percentage * 0.33,
          isPreparing: true,
        };
      case "ready":
        return {
          title: "Ready for Pickup",
          Icon: PartyPopper,
          color: "text-green-500",
          gradient: "from-green-500 to-emerald-500",
          progress: 100,
        };
      case "completed":
        return {
          title: "Order Completed",
          Icon: Check,
          color: "text-green-600",
          gradient: "from-green-500 to-emerald-500",
          progress: 100,
        };
      default:
        return {
          title: "Awaiting Status",
          Icon: Clock,
          color: "text-gray-500",
          gradient: "from-gray-400 to-gray-500",
          progress: 0,
        };
    }
  };

  const { title, Icon, color, gradient, progress, isPreparing } =
    getLiveStatusDetails();

  // The rest of the JSX remains the same
  return (
    <div className="w-full font-sans p-5 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-bold text-lg">{title}</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Live Order Status
          </p>
        </div>
        <Icon
          className={`h-6 w-6 ${color} ${isPreparing ? "animate-bounce" : ""}`}
        />
      </div>

      {isPreparing && (
        <div className="text-left justify-center pt-2">
          <p className="text-sm mb-1">Estimated time remaining</p>
          <p className={`font-mono font-bold text-3xl ${color}`}>
            {String(minutes).padStart(2, "0")}:
            {String(seconds).padStart(2, "0")}
          </p>
        </div>
      )}

      <div className="space-y-2">
        <div className="w-full bg-black/5 dark:bg-white/5 rounded-full h-2">
          <div
            className={`bg-gradient-to-r ${gradient} h-2 rounded-full transition-all duration-300 ease-linear`}
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <div className="flex justify-between text-xs font-medium text-gray-500 dark:text-gray-400">
          <span>Placed</span>
          <span>Ready</span>
        </div>
      </div>

      <div className="flex justify-between items-center text-sm pt-4 border-t border-gray-200 dark:border-gray-800">
        <p>Payment</p>
        <div
          className={`font-bold ${
            isPaid ? "text-green-600" : "text-yellow-600"
          }`}
        >
          {isPaid ? "PAID" : "PENDING"}
        </div>
      </div>
    </div>
  );
};
