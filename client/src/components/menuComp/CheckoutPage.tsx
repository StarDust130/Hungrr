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
import { GST_CALCULATION, log } from "@/lib/helper";

type OrderStatus = "idle" | "placing" | "confirmed" | "error";

const CheckoutPage = () => {
  const sessionToken = useSessionToken();
  const router = useRouter();
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
      !isNaN(Number(cartItem.variant?.price ?? cartItem.item.price)) &&
      typeof cartItem.quantity === "number"
  );

  const { gstAmount } = GST_CALCULATION(totalPrice);

  const handlePlaceOrder = async (paymentMethod: "cash" | "online") => {
    if (orderStatus !== "idle") return;

    if (!cafeId) {
      toast.error(
        "🚫 Error: Cafe information is missing! Please refresh the page."
      );
      return;
    }

    setOrderStatus("placing");
    setIsLoading(true);

    const billData = {
      cafeId,
      tableNo: Number(tableNo),
      paymentMethod,
      specialInstructions,
      orderType,
      sessionToken,
      items: validCartItems.map(({ item, quantity, variant }) => ({
        itemId: item.id,
        quantity,
        variantId: variant?.id,
      })),
    };

    log("📦 Placing order with data:", billData);

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/bill`,
        billData
      );
      const { order } = response.data;

      if (!order || !order.publicId) {
        throw new Error("Backend did not return a valid publicId.");
      }

      log("✅ Order placed successfully:", order);
      setOrderStatus("confirmed");

      setTimeout(() => {
        router.push(`/bills/${order.publicId}`);
      }, 1000);
    } catch (error) {
      log("❌ Failed to place order:", error);
      toast.error("😵‍💫 Something went wrong. Please try again shortly.");
      setIsLoading(false);
      setOrderStatus("error");
    }
  };

  if (orderStatus === "placing" || orderStatus === "confirmed") {
    return <PremiumLoader status={orderStatus} />;
  }

  if (validCartItems.length === 0) {
    return <EmptyCart />;
  }

  // Transform cart items for display with variant names and prices
  const displayCartItems = validCartItems.map((cartItem) => ({
    ...cartItem,
    item: {
      ...cartItem.item,
      name: cartItem.variant
        ? `${cartItem.item.name} (${cartItem.variant.name})`
        : cartItem.item.name,
      price: cartItem.variant?.price ?? cartItem.item.price,
    },
  }));

  return (
    <div className="relative flex flex-col md:flex-row h-[95dvh] overflow-hidden">
      {/* All above all all items */}
      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-48 sm:px-6 mb-46 md:mb-0">
        <CartItemsList
          items={displayCartItems}
          onAdd={(item, variantId) =>
            addToCart(
              item,
              item.variants?.find((v) => v.id === variantId)
            )
          }
          onRemove={(itemId, variantId) => removeFromCart(itemId, variantId)}
          onClear={(itemId, variantId) => clearItemFromCart(itemId, variantId)}
        />
      </div>

     {/* Below Part Info + Button */}
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

          <PriceSummary totalPrice={totalPrice} gst={gstAmount} />

          <Separator />

          <div className="grid grid-cols-2 gap-3">
            <Button
              size="default"
              variant="secondary"
              className="font-bold h-12 text-base rounded-xl"
              onClick={() => handlePlaceOrder("cash")}
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
