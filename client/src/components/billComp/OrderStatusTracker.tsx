// /app/bill/OrderStatusTracker.tsx

"use client";

import { useEffect, useState } from "react";
import { CheckCircle, Clock, UtensilsCrossed, PartyPopper } from "lucide-react";

// Define the status types for clarity
export type OrderStatus =
  | "payment-pending"
  | "confirmed"
  | "preparing"
  | "ready";

// --- Countdown Timer Hook (Unchanged) ---
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
    percentage: percentage,
  };
};

// --- Main Component with New, Integrated UI ---
export const OrderStatusTracker = ({ status }: { status: OrderStatus }) => {
  const isPaid = status !== "payment-pending";
  const { minutes, seconds, percentage } = useCountdown(
    15,
    status === "preparing"
  );

  const getLiveStatusDetails = () => {
    switch (status) {
      case "confirmed":
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
          progress: percentage,
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
      default: // payment-pending
        return {
          title: "Awaiting Payment",
          Icon: Clock,
          color: "text-gray-500",
          gradient: "from-gray-400 to-gray-500",
          progress: 0,
        };
    }
  };

  const { title, Icon, color, gradient, progress, isPreparing } =
    getLiveStatusDetails();

  return (
    <div className="w-full font-sans p-5 rounded-2xl bg-gray-50 dark:bg-gray-900/50 shadow-sm border border-gray-200 dark:border-gray-800 space-y-4">
      {/* --- Main Status Display --- */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100">
            {title}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Live Order Status
          </p>
        </div>
        <Icon
          className={`h-6 w-6 ${color} ${isPreparing ? "animate-bounce" : ""}`}
        />
      </div>

      {/* --- Integrated Countdown Timer --- */}
      {/* This section now appears seamlessly as part of the main card */}
      {isPreparing && (
        <div className="text-left flex justify-center pt-2">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
            Estimated time remaining
          </p>
          <p className={`font-mono font-bold text-3xl ${color}`}>
            {String(minutes).padStart(2, "0")}:
            {String(seconds).padStart(2, "0")}
          </p>
        </div>
      )}

      {/* --- Linear Progress Bar --- */}
      <div className="space-y-2">
        <div className="w-full bg-black/5 dark:bg-white/5 rounded-full h-2">
          <div
            className={`bg-gradient-to-r ${gradient} h-2 rounded-full transition-all duration-300 ease-linear`}
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <div className="flex justify-between text-xs font-medium text-gray-400">
          <span>Order Placed</span>
          <span>Ready</span>
        </div>
      </div>

      {/* --- Payment Status Footer --- */}
      <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400 pt-4 border-t border-gray-200 dark:border-gray-800">
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
