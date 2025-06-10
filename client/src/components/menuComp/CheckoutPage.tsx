"use client";

import { useState } from "react";
import useCart from "@/hooks/useCart";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Minus,
  Plus,
  Wallet,
  CreditCard,
  ShoppingBag,
  Clock,
  MessageSquareQuote,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { CartItem } from "@/types/menu";
import SafeImage from "../elements/SafeImage";
import BillModal from "./BillModal"; 
import Link from "next/link";

const CheckoutPage = () => {
  const [isBillVisible, setIsBillVisible] = useState(false); // <-- State to control the bill modal
  const {
    cart,
    addToCart,
    removeFromCart,
    clearItemFromCart, // Make sure you have this function in your hook
    totalPrice = 0,
  } = useCart();

  const validCartItems: CartItem[] = Object.values(cart || {}).filter(
    (cartItem): cartItem is CartItem =>
      cartItem && cartItem.item && typeof cartItem.item.price === "number"
  );

  if (validCartItems.length === 0) {
    return (
      <div className="flex-grow flex flex-col items-center justify-center text-center p-4">
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

  return (
    <>
      {/* --- SCROLLABLE PART --- */}
      <div className="flex-grow overflow-y-auto px-4 sm:px-6">
        <div className="flow-root">
          <ul
            role="list"
            className="-my-6 divide-y divide-gray-200 dark:divide-gray-800" // Softer divider
          >
            {validCartItems.map(({ item, quantity }) => (
              <li key={item.id} className="flex py-6">
                <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200 dark:border-gray-800">
                  <SafeImage
                    src={item.image || ""}
                    alt={item.name}
                    className="h-full w-full object-cover object-center"
                  />
                </div>

                <div className="ml-4 flex flex-1 flex-col">
                  <div>
                    <div className="flex justify-between text-base font-medium text-gray-900 dark:text-gray-50">
                      <h3 className="pr-2">
                        <a href="#">{item.name}</a>
                      </h3>
                      <p className="ml-4 flex-shrink-0 font-mono">
                        ₹{(item.price * quantity).toFixed(2)}
                      </p>
                    </div>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 font-mono">
                      ₹{item.price.toFixed(2)} / unit
                    </p>
                  </div>
                  <div className="flex flex-1 items-end justify-between text-sm">
                    <div className="flex items-center gap-3">
                      <Button
                        size="icon"
                        variant="outline"
                        className="w-8 h-8 rounded-full border-gray-300 dark:border-gray-700"
                        onClick={() => removeFromCart(item.id)}
                      >
                        <Minus size={16} />
                      </Button>
                      <span className="font-bold text-base w-5 text-center text-gray-900 dark:text-gray-50">
                        {quantity}
                      </span>
                      <Button
                        size="icon"
                        variant="outline"
                        className="w-8 h-8 rounded-full border-gray-300 dark:border-gray-700"
                        onClick={() => addToCart(item)}
                      >
                        <Plus size={16} />
                      </Button>
                    </div>

                    <div className="flex">
                      {/* Cleaner remove button */}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground"
                        onClick={() => clearItemFromCart(item.id)}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* --- STICKY FOOTER PART --- */}
      <div className="flex-shrink-0 p-4 space-y-5 border-t border-gray-200 dark:border-gray-800 bg-background shadow-[0_-4px_12px_-5px_rgba(0,0,0,0.04)] dark:shadow-[0_-4px_12px_-5px_rgba(0,0,0,0.2)]">
        <div className="flex items-center justify-center text-sm text-muted-foreground bg-muted/50 p-2.5 rounded-lg">
          <Clock size={16} className="mr-2 flex-shrink-0" />
          Estimated preparation time:
          <span className="font-bold text-foreground ml-1.5">15-20 mins</span>
        </div>

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
            className="text-sm bg-muted/30"
          />
        </div>

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

        <div className="grid grid-cols-2 gap-3">
          <Button
            size="lg"
            variant="secondary"
            className="h-14 font-bold text-base rounded-xl"
            onClick={() => setIsBillVisible(true)} // <-- Show the modal on click
          >
            <Wallet size={20} className="mr-2.5" /> Pay at Counter
          </Button>
          <Button size="lg" className="h-14 font-bold text-base rounded-xl">
            <Link
              href={`upi://pay?pa=9302903537-2@ybl&pn=Chandrashekhar&am=${grandTotal}&cu=INR&tn=Thanks%20for%20shopping`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center w-full h-full"
            >
              <CreditCard size={20} className="mr-2.5" /> Pay Online
            </Link>
          </Button>
        </div>
      </div>

      {/* Conditionally render the bill modal */}
      {isBillVisible && (
        <BillModal
          cartItems={validCartItems}
          totals={{ totalPrice, gstAmount, grandTotal }}
          onClose={() => setIsBillVisible(false)}
        />
      )}
    </>
  );
};

export default CheckoutPage;
