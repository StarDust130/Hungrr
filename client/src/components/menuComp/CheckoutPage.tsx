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
import { toast } from "sonner";
import { useSessionToken } from "@/hooks/useSessionToken";
import { log } from "@/lib/helper";

const CheckoutPage = () => {
  const sessionToken = useSessionToken();

 
  const router = useRouter();
  // ✅ Simplified state: We only need one 'isLoading' state.
  const [isLoading, setIsLoading] = useState(false);
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [orderType, setOrderType] = useState<"dinein" | "takeaway">("dinein");
  const [tableNo, setTableNo] = useState("");
  const [orderStatus, setOrderStatus] = useState<OrderStatus>("idle");

  const {
    cart,
    addToCart,
    removeFromCart,
    clearItemFromCart,
    totalPrice = 0,
    cafeId,
  } = useCart();

  const validCartItems: CartItem[] = Object.values(cart || {}).filter(
    (cartItem): cartItem is CartItem =>
      cartItem &&
      cartItem.item &&
      !isNaN(Number(cartItem.item.price)) &&
      typeof cartItem.quantity === "number"
  );


  const gstRate = 0.18;
  const gstAmount = totalPrice * gstRate;
  const grandTotal = totalPrice + gstAmount;

  type OrderStatus = "idle" | "placing" | "confirmed" | "error";

  if (!sessionToken) {
    toast.error(
      "Error: Session token is missing. Please refresh the page.  "
    );
    return;
  }

  //! ✅ This function is now cleaner and more robust.
  const handlePlaceOrder = async (paymentMethod: "counter" | "online") => {
    // Prevent double-clicks
    if (orderStatus !== "idle") return;



    // Add a check to make sure the cafeId has been set
    if (!cafeId) {
      alert(
        "Error: Cafe information is missing. Please refresh the page."
      );
      return;
    }

    // 1. Immediately set the status to 'placing' to show the loader
    setOrderStatus("placing");

    const billData = {
      cafeId,
      items: validCartItems.map((item) => ({
        itemId: item.item.id,
        quantity: item.quantity,
      })),
      tableNo: Number(tableNo),
      paymentMethod,
      specialInstructions,
      orderType,
      sessionToken: sessionToken,
    };

    try {
      // 2. The component is already showing the loader while this runs.
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/bill`,
        billData
      );
      const { order } = response.data;

      if (!order || !order.publicId) {
        throw new Error("Backend did not return a valid publicId.");
      }

      // 3. On success, redirect. The loader will disappear when the new page loads.
      // 3. On success, set status to 'confirmed' to show the checkmark
      setOrderStatus("confirmed");

      // 4. Wait 1.5 seconds for the user to see the confirmation, then redirect
      setTimeout(() => {
        router.push(`/bills/${order.publicId}`);
      }, 1500);
    } catch (error) {
      log("❌ Failed to place order:", error);

      toast.error("😵‍💫 Something went wrong. Please try again shortly.");

      setIsLoading(false);
      setOrderStatus("error");
    }
  };

  // ✅ This is the new rendering logic based on the order status
  if (orderStatus === "placing" || orderStatus === "confirmed") {
    return <PremiumLoader status={orderStatus} />;
  }

  // Show EmptyCart component if the cart is empty.
  if (validCartItems.length === 0) {
    return <EmptyCart />;
  }

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
              disabled={isLoading || !tableNo}
            >
              <Wallet size={20} className="mr-2.5" />
              Pay at Counter
            </Button>
            <Button
              size="default"
              className="font-bold h-12 text-base rounded-xl"
              onClick={() => handlePlaceOrder("online")}
              disabled={isLoading || !tableNo}
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
