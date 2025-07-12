import {  DateFormat, log } from "@/lib/helper";
import { BillData } from "@/types/menu";
import { Atom } from "lucide-react";
import Image from "next/image";

export const BillDetails = ({ bill }: { bill: BillData }) => {
  log("Bill 🥰", bill);

  return (
    <div className="p-6 sm:p-8 space-y-6 rounded-2xl border border-border shadow-md w-full max-w-2xl mx-auto bg-background transition-all duration-300">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-dashed pb-5">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{bill.cafeName}</h2>
          <p className="text-sm mt-1 text-muted-foreground">
            Table No. <span className="font-semibold">{bill.tableNo}</span>
          </p>
        </div>
        {bill.logoUrl ? (
          <Image
            src={bill.logoUrl}
            alt={`${bill.cafeName} Logo`}
            className="h-14 w-14 rounded-lg object-cover ring-1 ring-border shadow-sm"
            width={56}
            height={56}
          />
        ) : (
          <Atom className="h-10 w-10 text-primary" />
        )}
      </div>

      {/* Order Info */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
        <p className="text-muted-foreground">Order ID</p>
        <p className="text-right font-medium">
          #{bill.id?.toString().slice(0, 8)}
        </p>

        <p className="text-muted-foreground">Order Type</p>
        <p className="text-right font-medium">
          {bill.orderType === "takeaway" ? "Takeaway" : "Dine In"}
        </p>

        <p className="text-muted-foreground">Date</p>
        <p className="text-right font-medium">
          {DateFormat(bill.timestamp, "date")}
        </p>

        <p className="text-muted-foreground">Time</p>
        <p className="text-right font-medium">
          {DateFormat(bill.timestamp, "time")}
        </p>
      </div>

      {/* Items List */}
      <div className="space-y-3">
        <div className="flex text-sm font-semibold border-b border-dashed pb-2 text-muted-foreground">
          <p className="flex-grow">Item</p>
          <p className="w-16 text-center">Qty</p>
          <p className="w-20 text-right">Amount</p>
        </div>

        {bill.items.map((item) => (
          <div
            key={`${item.itemId}-${item.variantId || ""}`}
            className="flex text-sm items-center"
          >
            <p className="flex-grow">{item.item.name}</p>
            <p className="w-16 text-center">{item.quantity}</p>
            <p className="w-20 text-right font-mono">
              ₹{(Number(item.item.price) * item.quantity).toFixed(2)}
            </p>
          </div>
        ))}
      </div>

      {/* Grand Total */}
      <div className="pt-5 border-t border-dashed">
        <div className="flex justify-between items-center text-lg font-semibold">
          <p className="text-muted-foreground">Amount to Pay</p>
          <p className="font-mono text-primary text-xl">
            ₹{Number(bill.totalPrice || 0).toFixed(2)}
          </p>
        </div>
        <p className="text-[8px] text-muted-foreground text-right mt-1">
          (Includes GST)
        </p>
      </div>

      {/* Thank You Footer */}
      <div className="pt-6 text-center text-xs text-muted-foreground space-y-1">
        <p className="font-medium">Thank you for dining with us!</p>
        {bill.gstNo && <p className="text-[10px]">GST No: {bill.gstNo}</p>}
      </div>
    </div>
  );
};
