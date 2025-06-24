"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";

const placingMessages = [
  "Getting your order ready... 🍔",
  "Double-checking everything... ✅",
  "Packing it up nice and neat... 📦",
  "Sending you to the bill... 🧾",
];


interface PremiumLoaderProps {
  status: "placing" | "confirmed";
}

export default function PremiumLoader({ status }: PremiumLoaderProps) {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    if (status === "placing") {
      const interval = setInterval(() => {
        setMessageIndex((prev) => (prev + 1) % placingMessages.length);
      }, 2500);
      return () => clearInterval(interval);
    }
  }, [status]);

  return (
    <div className="flex flex-col items-center justify-center w-full h-full min-h-[50vh] py-10 px-4">
      <AnimatePresence mode="wait">
        {status === "placing" && (
          <motion.div
            key="placing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-6"
          >
            {/* Elegant spinner circle */}
            <motion.div
              initial={{ rotate: 0 }}
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
              className="w-10 h-10 border-4 border-neutral-300 border-t-blue-500 rounded-full"
            />

            {/* Classy messages */}
            <motion.p
              key={messageIndex}
              className="text-base sm:text-lg font-medium  text-center"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.4 }}
            >
              {placingMessages[messageIndex]}
            </motion.p>

            <p className="text-sm  text-center">
              Just a moment...
            </p>
          </motion.div>
        )}

        {status === "confirmed" && (
          <motion.div
            key="confirmed"
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="flex flex-col items-center gap-4"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 12 }}
              className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center shadow-md"
            >
              <Check className="w-10 h-10 text-white" strokeWidth={3} />
            </motion.div>
            <p className="text-2xl font-bold  text-center">
              Order Confirmed
            </p>
            <p className="text-sm  text-center">
              Redirecting to your bill...
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
