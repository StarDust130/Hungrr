"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import useCart from "@/hooks/useCart";
import { Button } from "@/components/ui/button";
import { Wallet, CreditCard } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { CartItem } from "@/types/menu";
import PremiumLoader from "./PremiumLoader";
import axios from "axios";

import CartItemsList from "./checkoutComp/CartItemsList";
import EmptyCart from "./checkoutComp/EmptyCart";
import SpecialInstructions from "./checkoutComp/SpecialInstructions";
import PriceSummary from "./checkoutComp/PriceSummary";
import OrderTypeSelector from "./checkoutComp/OrderTypeSelector";
import TableSelector from "./checkoutComp/TableSelector";
import { log } from "@/lib/helper";

const CheckoutPage = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [orderType, setOrderType] = useState<"dinein" | "takeaway">("dinein");
  const [tableNo, setTableNo] = useState("");


  const {
    cart,
    addToCart,
    removeFromCart,
    clearItemFromCart,
    totalPrice = 0,
  } = useCart();

  //! Filter out invalid cart items 😼
  const validCartItems: CartItem[] = Object.values(cart || {}).filter(
    (cartItem): cartItem is CartItem =>
      cartItem &&
      cartItem.item &&
      !isNaN(Number(cartItem.item.price)) &&
      typeof cartItem.quantity === "number"
  );
//! GST Calculation (Waah Modi ji Waah) 😎
  const gstRate = 0.18;
  const gstAmount = totalPrice * gstRate;
  const grandTotal = totalPrice + gstAmount;

  //! Handle place order 🤩
  const handlePlaceOrder = async (paymentMethod: "counter" | "online") => {
    setIsLoading(true);
    setIsRedirecting(true);

    const tempBillId = Date.now().toString();

    const billData = {
      cafeId: 1, // ✅ Replace this with the actual cafeId
      items: validCartItems.map((item) => ({
        itemId: item.item.id,
        quantity: item.quantity,
      })),
      tableNo: Number(tableNo), // Ensure it's a number
      paymentMethod,
      specialInstructions,
      orderType,
    };

    // 💾 Save to session
    sessionStorage.setItem("currentBill", JSON.stringify(billData));

    // 🚀 Send to backend
    axios
      .post(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/bill`, billData)
      .catch((error) => console.error("Failed to save bill:", error));

    log("Placing order with data 🤭:", billData);

    // 🔁 Redirect 
    router.push(`/bills/${tempBillId}`);
  };
  
  

  if (!isRedirecting && validCartItems.length === 0) return <EmptyCart />;
  if (isRedirecting) return <PremiumLoader />;

  return (
    <div className="relative flex flex-col md:flex-row h-screen overflow-hidden">
      {/* Scrollable Cart Area */}
      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-48 sm:px-6 mb-46 md:mb-0">
        <CartItemsList
          items={validCartItems}
          onAdd={addToCart}
          onRemove={removeFromCart}
          onClear={clearItemFromCart}
        />
      </div>

      {/* Sticky Bottom Summary */}
      <div className="absolute bottom-0 left-0 right-0 bg-background shadow-[0_-4px_20px_rgba(0,0,0,0.1)] border-t p-4 space-y-4 z-10">
        <div className="mx-auto max-w-lg space-y-4">
          <div className="flex items-center justify-between gap-3">
            <OrderTypeSelector orderType={orderType} onChange={setOrderType} />
            <TableSelector tableNo={tableNo} onChange={setTableNo} />
          </div>

          <SpecialInstructions
            value={specialInstructions}
            onChange={(value: string) => setSpecialInstructions(value)}
          />

          <PriceSummary
            totalPrice={totalPrice}
            gst={gstAmount}
            total={grandTotal}
          />

          <Separator />

          <div className="grid grid-cols-2 gap-3">
            <Button
              size="default"
              variant="secondary"
              className="font-bold h-12 text-base rounded-xl"
              onClick={() => handlePlaceOrder("counter")}
              disabled={isLoading}
            >
              <Wallet size={20} className="mr-2.5" />
              Pay at Counter
            </Button>
            <Button
              size="default"
              className="font-bold h-12 text-base rounded-xl"
              onClick={() => handlePlaceOrder("online")}
              disabled={isLoading}
            >
              <CreditCard size={20} className="mr-2.5" />
              Pay Online
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
