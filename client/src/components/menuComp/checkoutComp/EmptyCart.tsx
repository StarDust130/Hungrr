// components/checkout/EmptyCart.tsx
"use client";

import { ShoppingBag } from "lucide-react";

const EmptyCart = () => {
  return (
    <div className="flex-grow flex flex-col items-center justify-center text-center p-8">
      <ShoppingBag
        size={80}
        className="text-muted-foreground/20 mb-6"
        strokeWidth={1}
      />
      <h3 className="text-2xl font-semibold tracking-tight">
        Your cart is empty
      </h3>
      <p className="text-muted-foreground mt-2 max-w-xs">
        Add some delicious items from the menu to see them here.
      </p>
    </div>
  );
};

export default EmptyCart;
