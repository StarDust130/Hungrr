"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import useCart from "@/hooks/useCart";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Minus,
  Plus,
  Wallet,
  CreditCard,
  ShoppingBag,
  MessageSquareQuote,
  Trash2, // A cleaner icon for removing items
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { CartItem } from "@/types/menu";
import SafeImage from "../elements/SafeImage";
import PremiumLoader from "./PremiumLoader";

const CheckoutPage = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  // ✨ State to control the full-page loader for redirection
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [specialInstructions, setSpecialInstructions] = useState("");
  const {
    cart,
    addToCart,
    removeFromCart,
    clearItemFromCart,
    clearCart,
    totalPrice = 0,
  } = useCart();

  const validCartItems: CartItem[] = Object.values(cart || {}).filter(
    (cartItem): cartItem is CartItem =>
      cartItem && cartItem.item && typeof cartItem.item.price === "number"
  );

  if (!isRedirecting && validCartItems.length === 0) {
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
  }

  const gstRate = 0.18;
  const gstAmount = totalPrice * gstRate;
  const grandTotal = totalPrice + gstAmount;

  const handlePlaceOrder = (paymentMethod: "counter" | "online") => {
    setIsLoading(true);
    setIsRedirecting(true); // ✨ Trigger the full-page loader

    // Simulate a quick process before redirecting so the user sees the loader
    setTimeout(() => {
      const tempBillId = Date.now().toString();
      const billData = {
        id: tempBillId,
        timestamp: new Date().toISOString(),
        items: validCartItems,
        totalPrice,
        gstAmount,
        grandTotal,
        paymentMethod,
        paymentStatus: "pending",
        specialInstructions,
      };

      sessionStorage.setItem("currentBill", JSON.stringify(billData));
      router.push(`/bills/${tempBillId}`);
      clearCart();
    }, 1500); // 1.5-second delay for a smooth UX
  };

  // ✨ --- FULL PAGE LOADER --- ✨
  // This will overlay the entire screen when the order is being placed.
  if (isRedirecting) {
    return <PremiumLoader />;
  }

  return (
    <>
      {/* --- SCROLLABLE PART --- */}
      {/* ✨ Added more padding for better spacing on all devices */}
      <div className="flex-grow overflow-y-auto px-4 sm:px-6 pt-6 pb-96">
        <ul role="list" className="space-y-4">
          {validCartItems.map(({ item, quantity }) => ( 
            // ✨ --- PREMIUM ITEM CARD --- ✨
            // This is the enhanced version of your original item card UI.
            <li
              key={item.id}
              className="flex p-4 bg-background rounded-2xl shadow-sm border border-border/50"
            >
              <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl">
                <SafeImage
                  src={item.image || ""}
                  alt={item.name}
                  className="h-full w-full object-cover object-center"
                />
              </div>
              <div className="ml-4 flex flex-1 flex-col">
                <div>
                  <div className="flex justify-between text-base font-medium">
                    <h3 className="pr-2 font-semibold">{item.name}</h3>
                    <p className="ml-4 flex-shrink-0 font-mono">
                      ₹{(item.price * quantity).toFixed(2)}
                    </p>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground font-mono">
                    ₹{item.price.toFixed(2)} / unit
                  </p>
                </div>
                <div className="flex flex-1 items-end justify-between text-sm">
                  <div className="flex items-center gap-3">
                    <Button
                      size="icon"
                      variant="outline"
                      className="w-9 h-9 rounded-full"
                      onClick={() => removeFromCart(item.id)}
                    >
                      <Minus size={16} />
                    </Button>
                    <span className="font-bold text-base w-6 text-center">
                      {quantity}
                    </span>
                    <Button
                      size="icon"
                      variant="outline"
                      className="w-9 h-9 rounded-full"
                      onClick={() => addToCart(item)}
                    >
                      <Plus size={16} />
                    </Button>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-red-500 -mr-2"
                    onClick={() => clearItemFromCart(item.id)}
                  >
                    <Trash2 size={18} />
                  </Button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* --- STICKY FOOTER PART --- */}
      {/* ✨ The footer is now fixed to the bottom for an app-like feel on mobile */}
      <div className="fixed bottom-0 left-0 right-0 p-4 pt-5 bg-background border-t shadow-[0_-8px_24px_-10px_rgba(0,0,0,0.08)] dark:shadow-[0_-8px_24px_-10px_rgba(0,0,0,0.4)]">
        <div className="mx-auto max-w-lg space-y-4">
          {/* Special Instructions */}
          <div>
            <label
              htmlFor="instructions"
              className="flex items-center mb-2 text-sm font-medium"
            >
              <MessageSquareQuote
                size={16}
                className="mr-2 text-muted-foreground"
              />
              Special Instructions
            </label>
            <Textarea
              id="instructions"
              placeholder="e.g., Make it extra spicy, no onions etc."
              className="text-sm bg-muted/50"
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
            />
          </div>

          {/* Pricing */}
          <div className="space-y-2 text-sm font-medium">
            <div className="flex justify-between">
              <p className="text-muted-foreground">Subtotal</p>
              <p className="font-mono text-foreground">
                ₹{totalPrice.toFixed(2)}
              </p>
            </div>
            <div className="flex justify-between">
              <p className="text-muted-foreground">Taxes & Charges (GST)</p>
              <p className="font-mono text-foreground">
                + ₹{gstAmount.toFixed(2)}
              </p>
            </div>
            <Separator className="my-3" />
            <div className="flex justify-between text-lg font-bold">
              <p>Grand Total</p>
              <p className="font-mono">₹{grandTotal.toFixed(2)}</p>
            </div>
          </div>

          <Separator />

          {/* ACTION BUTTONS */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <Button
              size="lg"
              variant="secondary"
              className="h-14 font-bold text-base rounded-xl"
              onClick={() => handlePlaceOrder("counter")}
              disabled={isLoading}
            >
              <Wallet size={20} className="mr-2.5" />
              Pay at Counter
            </Button>
            <Button
              size="lg"
              className="h-14 font-bold text-base rounded-xl"
              onClick={() => handlePlaceOrder("online")}
              disabled={isLoading}
            >
              <CreditCard size={20} className="mr-2.5" />
              Pay Online
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default CheckoutPage;
