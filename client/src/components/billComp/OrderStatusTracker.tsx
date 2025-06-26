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
import { Button } from "../ui/button";
import { useSessionToken } from "@/hooks/useSessionToken";
import axios from "axios";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";



const handleCancelOrder = async (
  orderPublicId: string,
  sessionToken: string,
  callback: () => void
) => {
    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/orders/${orderPublicId}`,
        {
          headers: { "x-session-token": sessionToken },
        }
      );
      toast("Your order has been canceled!");
      callback();
      // You would then redirect the user or refresh the active orders list.
    } catch (error) {
      console.error("Failed to cancel order:", error);
      toast(
        "Could not cancel this order. It may have already been accepted by the kitchen."
      );
    }
};

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

  const sessionToken = useSessionToken();
  const orderPublicId = bill.publicId;
  const router = useRouter();

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

  if (!bill || !bill.id) {
    return (
      <div className="w-full max-w-md p-6 rounded-3xl border border-border dark:border-white/10 space-y-5 shadow-xl bg-gray-50/80 dark:bg-black/20 backdrop-blur-lg">
        <p className="text-center text-gray-500 dark:text-gray-400">
          No order details available.
        </p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md p-6 rounded-3xl border border-border dark:border-white/10 space-y-5 shadow-xl bg-gray-50/80 dark:bg-black/20 backdrop-blur-lg"
    >
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <motion.h3
            key={details.title}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="font-bold text-xl text-gray-900 dark:text-white"
          >
            {details.title}
          </motion.h3>
          <motion.p
            key={details.subtitle}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="text-sm text-gray-500 dark:text-gray-400"
          >
            {details.subtitle}
          </motion.p>
        </div>
        <motion.div
          key={status}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
          className={`p-3 rounded-full bg-white dark:bg-black/20 shadow-md ${details.color}`}
        >
          <details.Icon size={24} />
        </motion.div>
      </div>

      {/* Countdown Timer */}
      <AnimatePresence>
        {details.isPreparing && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.4 }}
          >
            <p className={`font-mono font-bold text-4xl ${details.color}`}>
              {String(minutes).padStart(2, "0")}:
              {String(seconds).padStart(2, "0")}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress */}
      <div className="space-y-2">
        <div className="w-full bg-gray-200/80 dark:bg-gray-800/80 rounded-full h-2">
          <motion.div
            className={`h-2 rounded-full bg-gradient-to-r ${details.gradient}`}
            initial={{ width: "0%" }}
            animate={{ width: `${details.progress}%` }}
            transition={{ duration: 1 }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-400 dark:text-gray-500">
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

      {/* Cancel Button if NOT paid */}
      {!isPaid && (
        <div className="pt-1 text-right w-full mx-auto flex flex-col items-center">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                size="sm"
                className="text-sm"
              >
                Cancel Order
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="text-xl">
                  Payment pending 💸
                </AlertDialogTitle>
                <AlertDialogDescription className="text-sm text-muted-foreground">
                  You haven’t paid yet, so your order isn’t accepted. Feel free
                  to cancel — the kitchen’s still chillin&apos; 😌
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Keep My Order</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() =>
                    handleCancelOrder(orderPublicId!, sessionToken!, () =>
                      router.back()
                    )
                  }
                  className="bg-destructive"
                >
                  Yes, Cancel It
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <p className="text-xs mt-2 text-gray-500 dark:text-gray-400 text-center">
            Orders can’t be canceled after payment 💳
          </p>
        </div>
      )}
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
