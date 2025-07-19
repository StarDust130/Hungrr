"use client";

import { useState, useEffect } from "react";
import useCart from "@/hooks/useCart";
import { ChevronRight, ShoppingCart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion"; // ✅ Import AnimatePresence
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import CheckoutPage from "./CheckoutPage";
import { Button } from "@/components/ui/button";

const CartWidget = () => {
  const { totalItems, totalPrice } = useCart();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient || totalItems === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      transition={{ type: "spring", stiffness: 50, damping: 15 }}
      className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[92%] max-w-md z-50"
    >
      <Drawer>
        <DrawerTrigger asChild>
          <Button
            variant="default"
            className="w-full h-16 rounded-2xl shadow-2xl shadow-primary/30 flex items-center justify-between p-3 text-primary-foreground bg-gradient-to-r from-primary via-primary to-primary/80 transition-all duration-300 transform hover:scale-[1.03]"
          >
            <div className="flex items-center gap-4">
              <div className="relative">
                {/* Shopping Cart Icon */}
                <div className="p-1 rounded-md">
                  <ShoppingCart
                    size={60} // slightly bigger
                    strokeWidth={3} // makes it bolder
                    className="text-black" // change color if needed
                  />
                </div>

                {/* Animated Item Count Badge */}
                <AnimatePresence mode="wait">
                  {totalItems > 0 && (
                    <motion.div
                      key={totalItems}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      transition={{
                        duration: 0.35,
                        ease: "easeOut", // clean and soft
                      }}
                      className="absolute -top-[8px] -right-2.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-white text-[10px] font-extrabold leading-none shadow-lg border border-white"
                    >
                      {totalItems}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Total Price */}
              <p className="text-xl font-bold tracking-tight text-black">
                ₹{totalPrice.toFixed(2)}
              </p>
            </div>

            <div className="flex items-center gap-1 font-semibold text-base pr-2 cursor-pointer">
              View Cart <ChevronRight size={20} />
            </div>
          </Button>
        </DrawerTrigger>

        <DrawerContent className="flex flex-col bg-background max-h-[95dvh] h-auto w-full md:max-w-6xl mx-auto rounded-lg shadow-lg">
          <DrawerHeader className="text-left flex-shrink-0">
            <DrawerTitle className="text-2xl font-bold tracking-tight">
              Your Order Summary
            </DrawerTitle>

            {/* ✅ 2. Total Item Count Subtitle */}
            <p className="text-sm text-muted-foreground">
              Total of {totalItems} item{totalItems > 1 ? "s" : ""}
            </p>
          </DrawerHeader>

          <CheckoutPage />
        </DrawerContent>
      </Drawer>
    </motion.div>
  );
};

export default CartWidget;
