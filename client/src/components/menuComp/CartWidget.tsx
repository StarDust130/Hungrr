"use client";

import useCart from "@/hooks/useCart";
import { ChevronRight, ShoppingCart } from "lucide-react";
import { motion } from "framer-motion";
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

  if (totalItems === 0) return null;

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
                <div className="absolute -top-3 -left-2  backdrop-blur-sm w-8 h-8 rounded-full"></div>
                <ShoppingCart size={24} className="relative z-10" />
              </div>
              <p className="font-bold text-lg">₹{totalPrice.toFixed(2)}</p>
            </div>
            <div className="flex items-center gap-1 font-semibold text-base pr-2 cursor-pointer">
              View Cart <ChevronRight size={20} />
            </div>
          </Button>
        </DrawerTrigger>

        {/* --- THIS IS THE KEY FIX FOR SCROLLING --- 
                    We define the flexbox layout here on the DrawerContent itself.
                    This ensures the header and the summary footer are fixed, and only the item list scrolls.
                */}
        <DrawerContent className="flex flex-col bg-background max-h-[95vh] w-full md:max-w-6xl mx-auto rounded-lg shadow-lg overflow-hidden">
          <DrawerHeader className="text-left flex-shrink-0">
            <DrawerTitle className="text-2xl font-bold tracking-tight">
              Your Order Summary
            </DrawerTitle>
          </DrawerHeader>
          {/* The CheckoutPage now just provides the content, not the layout */}
          <CheckoutPage />
        </DrawerContent>
      </Drawer>
    </motion.div>
  );
};

export default CartWidget;
