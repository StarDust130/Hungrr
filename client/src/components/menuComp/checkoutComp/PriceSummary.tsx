// components/checkout/PriceSummary.tsx
"use client";

import { Separator } from "@/components/ui/separator";

interface Props {
  totalPrice: number;
  gst: number;
  total: number;
}

const PriceSummary = ({ totalPrice, gst, total }: Props) => {
  return (
    <div className="space-y-2 text-sm font-medium">
      <div className="flex justify-between">
        <p className="text-muted-foreground">Subtotal</p>
        <p className="font-mono text-foreground">₹{totalPrice.toFixed(2)}</p>
      </div>
      <div className="flex justify-between">
        <p className="text-muted-foreground">Taxes & Charges (GST)</p>
        <p className="font-mono text-foreground">+ ₹{gst.toFixed(2)}</p>
      </div>
      <Separator className="my-3" />
      <div className="flex justify-between text-base font-bold">
        <p>Grand Total</p>
        <p className="font-mono">₹{total.toFixed(2)}</p>
      </div>
    </div>
  );
};

export default PriceSummary;
