"use client";

import { motion } from "framer-motion";
import {
  ChefHat,
  ShoppingBasket,
  ChevronRight,
  Hourglass,
  Check,
} from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";

// The shape of the order data this component expects
interface ActiveOrder {
  id: number;
  publicId: string;
  status: string;
}

interface ActiveOrdersSectionProps {
  activeOrders: ActiveOrder[];
}

// A single, self-contained, and beautifully styled row for each active order.
const OrderRow = ({ order }: { order: ActiveOrder }) => {
  const statusInfo = useMemo(() => {
    switch (order.status) {
      case "accepted":
        return {
          icon: Check,
          text: "Your order is confirmed!",
          color: "text-blue-500",
          bg: "bg-blue-100 dark:bg-blue-500/20",
          progress: "25%",
          progressColor: "bg-blue-500",
        };
      case "preparing":
        return {
          icon: ChefHat,
          text: "The chefs are preparing your meal.",
          color: "text-orange-500",
          bg: "bg-orange-100 dark:bg-orange-500/20",
          progress: "60%",
          progressColor: "bg-orange-500",
        };
      case "ready":
        return {
          icon: ShoppingBasket,
          text: "Your order is ready for pickup!",
          color: "text-green-500",
          bg: "bg-green-100 dark:bg-green-500/20",
          progress: "100%",
          progressColor: "bg-green-500",
        };
      default:
        return {
          icon: Hourglass,
          text: "Awaiting confirmation...",
          color: "text-slate-500",
          bg: "bg-slate-100 dark:bg-slate-700",
          progress: "5%",
          progressColor: "bg-slate-500",
        };
    }
  }, [order.status]);

  const Icon = statusInfo.icon;

  // Animation for the icon based on status
  const iconAnimation = {
    initial: { scale: 1 },
    animate:
      order.status === "preparing"
        ? {
            rotate: [0, 5, -5, 5, 0],
            transition: { duration: 1.2, repeat: Infinity },
          }
        : order.status === "ready"
        ? { scale: [1, 1.2, 1], transition: { duration: 0.5 } }
        : { scale: 1 },
  };

  return (
    <Link
      href={`/bills/${order.publicId}`}
      passHref
      className="block outline-none"
    >
      <div className="group relative flex items-center gap-4 overflow-hidden rounded-2xl border border-slate-200/50 bg-gradient-to-br from-white/80 to-white/50 p-4 shadow-lg shadow-black/5 backdrop-blur-lg transition-all duration-300 hover:scale-[1.03] hover:shadow-xl dark:border-slate-700/50 dark:from-slate-800/80 dark:to-slate-900/70 dark:shadow-black/20">
        {/* Status Icon */}
        <motion.div
          className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full ${statusInfo.bg}`}
          variants={iconAnimation}
          initial="initial"
          animate="animate"
        >
          <Icon className={`h-7 w-7 ${statusInfo.color}`} />
        </motion.div>

        {/* Text Content */}
        <div className="flex-grow text-left">
          <p className="font-semibold text-md text-slate-800 dark:text-slate-100">
            {statusInfo.text}
          </p>
          <p className="font-mono text-xs text-slate-500 dark:text-slate-400">
            Order #{String(order.id).padStart(6, "0")}
          </p>
        </div>

        {/* Chevron */}
        <ChevronRight className="h-6 w-6 flex-shrink-0 text-slate-400 transition-transform duration-300 group-hover:translate-x-1" />

        {/* Animated Progress Bar */}
        <div className="absolute bottom-0 left-0 h-1 w-full bg-slate-200/50 dark:bg-slate-700/50">
          <motion.div
            className={`h-full rounded-r-full ${statusInfo.progressColor}`}
            initial={{ width: 0 }}
            animate={{ width: statusInfo.progress }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
          />
        </div>
      </div>
    </Link>
  );
};

// This is the main component container.
// Its job is to animate the rows as they appear.
export const ActiveOrdersSection = ({
  activeOrders,
}: ActiveOrdersSectionProps) => {
  if (!activeOrders || activeOrders.length === 0) {
    return null;
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 25 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex w-full flex-col gap-4 p-2"
    >
      {activeOrders.map((order) => (
        <motion.div key={order.publicId} variants={itemVariants}>
          <OrderRow order={order} />
        </motion.div>
      ))}
    </motion.div>
  );
};
