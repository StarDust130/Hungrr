"use client";

import { Separator } from "@/components/ui/separator";

interface Props {
  totalPrice: number;
  gst: number; // this is actually your platform fee
}

const PriceSummary = ({ totalPrice, gst }: Props) => {
  const itemTotal = totalPrice;
  const platformFee = gst;

  return (
    <div className="space-y-2 text-sm font-medium text-foreground">
      <div className="flex justify-between">
        <span className="text-muted-foreground">Item Total</span>
        <span className="font-mono">₹{itemTotal.toFixed(2)}</span>
      </div>

      <div className="flex justify-between">
        <span className="text-muted-foreground">Platform Fee</span>
        <div className="flex items-center gap-2">
          <span className="font-mono text-muted-foreground line-through">
        ₹{platformFee.toFixed(2)}
          </span>
          <span className="font-mono text-sm font-semibold text-green-600 dark:text-green-500">
        FREE
          </span>
        </div>
      </div>

      <Separator className="my-3" />

      <div className="flex justify-between text-base font-semibold">
        <span>Total Payable</span>
        <span className="font-mono">₹{itemTotal.toFixed(2)}</span>
      </div>
    </div>
  );
};

export default PriceSummary;
