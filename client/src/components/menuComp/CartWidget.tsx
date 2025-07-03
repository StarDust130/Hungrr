"use client";

import { useState, useEffect } from "react"; // Import useState and useEffect
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
  const [isClient, setIsClient] = useState(false);

  // This hook ensures that the component will re-render after it has "mounted" on the client.
  // By default, `isClient` is false. After the initial render, this effect runs and sets it to true.
  useEffect(() => {
    setIsClient(true);
  }, []);


  // 1. On the server, isClient is false, so we return null.
  // 2. On the client, we wait for isClient to be true AND totalItems > 0 before rendering.
  if (!isClient || totalItems === 0 ) {
    return null;
  }

  // This check prevents errors if totalPrice is somehow not a number.
  const isPriceValid = typeof totalPrice === "number";

  const gstRate = 0.18;
  const gstAmount = totalPrice * gstRate;
  const grandTotal = totalPrice + gstAmount;


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
                  <div className="absolute -top-3 -left-2 backdrop-blur-sm w-8 h-8 rounded-full"></div>
                  <ShoppingCart size={24} className="relative z-10" />
                </div>
                {/* Only show the price if it's a valid number */}
                {isPriceValid && (
                  <p className="font-bold text-lg">₹{grandTotal.toFixed(2)}</p>
                )}
              </div>
              <div className="flex items-center gap-1 font-semibold text-base pr-2 cursor-pointer">
                View Cart <ChevronRight size={20} />
              </div>
            </Button>
          </DrawerTrigger>

          <DrawerContent className="flex flex-col bg-background max-h-[95vh] w-full md:max-w-6xl mx-auto rounded-lg shadow-lg overflow-hidden">
            <DrawerHeader className="text-left flex-shrink-0">
              <DrawerTitle className="text-2xl font-bold tracking-tight">
                Your Order Summary
              </DrawerTitle>
            </DrawerHeader>
            <CheckoutPage />
          </DrawerContent>
        </Drawer>
      </motion.div>
    );
};

export default CartWidget;
