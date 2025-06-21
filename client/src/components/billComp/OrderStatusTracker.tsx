"use client";

import { useEffect, useState, FC, useMemo, useRef } from "react";
import socket from "@/lib/socket";
import { BillData, OrderStatus } from "@/types/menu";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import {
  CheckCircle2,
  Hourglass,
  ThumbsUp,
  CookingPot,
  Bell,
  Wallet,
} from "lucide-react";

// The main component with the new design
export const OrderStatusTracker: FC<{ bill: BillData }> = ({ bill }) => {
  // --- STATE & LOGIC ---
  // Using the stable logic from your working version
  const [status, setStatus] = useState<OrderStatus>(bill.status as OrderStatus);
  const [isPaid, setIsPaid] = useState(bill.paymentStatus === "paid");
  const { minutes, seconds, percentage } = useCountdown(
    15,
    status === "preparing"
  );
  const hasFiredConfetti = useRef(isPaid);

  // Your working socket logic - unchanged
  useEffect(() => {
    if (!bill?.id) return;
    socket.connect();
    socket.emit("join_order_room", bill.id);
    const handleUpdate = (data: { status?: OrderStatus; paid?: boolean }) => {
      if (data.status) setStatus(data.status);
      if (typeof data.paid === "boolean") setIsPaid(data.paid);
    };
    socket.on("order_updated", handleUpdate);
    return () => {
      socket.off("order_updated", handleUpdate);
    };
  }, [bill.id]);

  // Effect to fire confetti on payment
  useEffect(() => {
    if (isPaid && !hasFiredConfetti.current) {
      const duration = 2 * 1000;
      const end = Date.now() + duration;

      (function frame() {
        confetti({
          particleCount: 2,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
        });
        confetti({
          particleCount: 2,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      })();
      hasFiredConfetti.current = true;
    }
  }, [isPaid]);

  // --- DYNAMIC CONTENT & STYLING ---
  const details = useMemo(() => {
    if (bill.paymentMethod === "counter" && !isPaid) {
      return {
        title: "Pay at Counter",
        subtitle: "Show this screen to the cashier",
        Icon: Wallet,
        color: "text-amber-500",
        gradient: "from-amber-400 to-amber-500",
        progress: 5,
      };
    }
    switch (status) {
      case "pending":
        return {
          title: "Awaiting Confirmation",
          subtitle: isPaid
            ? "Payment received, thank you!"
            : "Your order is in the queue...",
          Icon: Hourglass,
          color: "text-slate-500",
          gradient: "from-slate-400 to-slate-500",
          progress: 10,
        };
      case "accepted":
        return {
          title: "Order Accepted",
          subtitle: "Our kitchen has started working on it.",
          Icon: ThumbsUp,
          color: "text-blue-500",
          gradient: "from-blue-500 to-cyan-500",
          progress: 33,
        };
      case "preparing":
        return {
          title: "Preparing Your Food",
          subtitle: "Freshly made, just for you.",
          Icon: CookingPot,
          color: "text-orange-500",
          gradient: "from-orange-500 to-amber-500",
          progress: 33 + percentage * 0.34,
          isPreparing: true,
        };
      case "ready":
        return {
          title: "Ready for Pickup",
          subtitle: "Don't let it get cold!",
          Icon: Bell,
          color: "text-green-500",
          gradient: "from-green-500 to-emerald-500",
          progress: 100,
        };
      case "completed":
        return {
          title: "Order Completed",
          subtitle: "Hope you enjoyed your meal!",
          Icon: CheckCircle2,
          color: "text-indigo-500",
          gradient: "from-indigo-500 to-violet-500",
          progress: 100,
        };
      default:
        return {
          title: "Awaiting Status",
          subtitle: "Getting things ready...",
          Icon: Hourglass,
          color: "text-gray-500",
          gradient: "from-gray-400 to-gray-500",
          progress: 0,
        };
    }
  }, [status, isPaid, percentage, bill.paymentMethod]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md font-sans p-6 rounded-3xl border border-black/10 dark:border-white/10 space-y-5 shadow-2xl shadow-black/10 bg-gray-50/80 dark:bg-black/20 backdrop-blur-lg"
    >
      {/* Header with Title, Subtitle, and Icon */}
      <div className="flex justify-between items-center">
        <div className="flex-1">
          <AnimatePresence mode="wait">
            <motion.h3
              key={details.title}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="font-bold text-xl text-gray-900 dark:text-white"
            >
              {details.title}
            </motion.h3>
          </AnimatePresence>
          <AnimatePresence mode="wait">
            <motion.p
              key={details.subtitle}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="text-sm text-gray-500 dark:text-gray-400"
            >
              {details.subtitle}
            </motion.p>
          </AnimatePresence>
        </div>
        <motion.div
          key={status} // Animate when the status changes
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
          className={`flex-shrink-0 ml-4 p-3 rounded-full bg-white dark:bg-black/20 shadow-md ${details.color}`}
        >
          <details.Icon size={24} />
        </motion.div>
      </div>

      {/* Countdown Timer (only when preparing) */}
      <AnimatePresence>
        {details.isPreparing && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="text-left"
          >
            <p
              className={`font-mono font-bold text-4xl tracking-tighter ${details.color}`}
            >
              {String(minutes).padStart(2, "0")}:
              {String(seconds).padStart(2, "0")}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="w-full bg-gray-200/80 dark:bg-gray-800/80 rounded-full h-2">
          <motion.div
            className={`h-2 rounded-full bg-gradient-to-r ${details.gradient}`}
            initial={{ width: "0%" }}
            animate={{ width: `${details.progress}%` }}
            transition={{ duration: 1, ease: "circOut" }}
          />
        </div>
        <div className="flex justify-between text-xs font-medium text-gray-400 dark:text-gray-500">
          <span>Placed</span>
          <span>Ready</span>
        </div>
      </div>

      {/* Payment Status */}
      <div className="flex justify-between items-center text-sm pt-4 border-t border-gray-200 dark:border-gray-700/60">
        <p className="font-semibold text-gray-600 dark:text-gray-300">
          Payment Status
        </p>
        <motion.div
          key={String(isPaid)}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className={`font-bold px-3 py-1 rounded-full text-xs ${
            isPaid
              ? "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300"
              : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300"
          }`}
        >
          {isPaid ? "PAID" : "PENDING"}
        </motion.div>
      </div>
    </motion.div>
  );
};

// --- Helper Hook: Countdown Timer ---
const useCountdown = (initialMinutes: number, isActive: boolean) => {
  const [totalSeconds, setTotalSeconds] = useState(initialMinutes * 60);
  const [percentage, setPercentage] = useState(0);
  const totalInitialSeconds = initialMinutes * 60;

  useEffect(() => {
    if (isActive) {
      setPercentage(
        totalSeconds > 0
          ? ((totalInitialSeconds - totalSeconds) / totalInitialSeconds) * 100
          : 100
      );
      if (totalSeconds <= 0) return;

      const timer = setInterval(() => {
        setTotalSeconds((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);

      return () => clearInterval(timer);
    } else {
      setTotalSeconds(initialMinutes * 60);
      setPercentage(0);
    }
  }, [isActive, totalSeconds, initialMinutes, totalInitialSeconds]);

  return {
    minutes: Math.floor(totalSeconds / 60),
    seconds: totalSeconds % 60,
    percentage,
  };
};
