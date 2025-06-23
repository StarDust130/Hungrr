"use client";

import { motion } from "framer-motion";
import {
  ChefHat,
  ShoppingBasket,
  ChevronRight,
  Hourglass,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";

interface ActiveOrder {
  id: number;
  publicId: string;
  status: string;
}

interface ActiveOrdersSectionProps {
  activeOrders: ActiveOrder[];
}

const OrderRow = ({ order }: { order: ActiveOrder }) => {
  const statusInfo = useMemo(() => {
    switch (order.status) {
      case "accepted":
        return {
          icon: CheckCircle2,
          text: "Order Confirmed",
          baseClasses:
            "border-emerald-600 text-emerald-600 dark:border-emerald-400 dark:text-emerald-400",
          bgClasses: "bg-emerald-500/10",
          iconAnim: "check-anim",
        };
      case "preparing":
        return {
          icon: ChefHat,
          text: "Your order is being prepared",
          baseClasses:
            "border-orange-500 text-orange-600 dark:border-orange-400 dark:text-orange-400",
          bgClasses: "bg-orange-500/10",
          iconAnim: "chef-anim",
        };
      case "ready":
        return {
          icon: ShoppingBasket,
          text: "Ready for Pickup",
          baseClasses:
            "border-sky-600 text-sky-600 dark:border-sky-400 dark:text-sky-400",
          bgClasses: "bg-sky-500/10",
          iconAnim: "basket-anim",
        };
      default:
        return {
          icon: Hourglass,
          text: "Awaiting Confirmation.",
          desc: "👀 We’re watching... for that payment!",
          baseClasses: "border-slate-500  dark:border-slate-400 ",
          bgClasses: "bg-slate-400/10",
          iconAnim: "hourglass-anim",
        };
    }
  }, [order.status]);

  const Icon = statusInfo.icon;

  return (
    <Link
      href={`/bills/${order.publicId}`}
      passHref
      className="block outline-none"
    >
      <motion.div
        className={`group flex items-center gap-4 rounded-xl border-l-4 ${statusInfo.baseClasses} ${statusInfo.bgClasses} p-3.5 shadow-sm transition-all duration-300 hover:shadow-lg`}
      >
        <div
          className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${statusInfo.bgClasses}`}
        >
          <Icon
            className={`h-5 w-5 ${statusInfo.baseClasses} ${statusInfo.iconAnim}`}
          />
        </div>

        <div className="flex-grow text-left">
          <p className="font-medium ">
            {statusInfo.text}
          </p>
          {statusInfo.desc && (
            <p className="text-xs ">
              {statusInfo.desc}
            </p>
          )}
          <p className="text-sm ">
            Order Id #{order.id}
          </p>
        </div>

        <ChevronRight className="h-5 w-5 flex-shrink-0 text-slate-400 transition-transform group-hover:translate-x-1" />
      </motion.div>
    </Link>
  );
};

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
      transition: { staggerChildren: 0.12 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex w-full flex-col gap-2.5 p-2"
    >
      {activeOrders.map((order) => (
        <motion.div key={order.publicId} variants={itemVariants}>
          <OrderRow order={order} />
        </motion.div>
      ))}
    </motion.div>
  );
};
