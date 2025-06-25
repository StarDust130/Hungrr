import {  DateFormat, log } from "@/lib/helper";
import { BillData } from "@/types/menu";
import { Atom } from "lucide-react";
import Image from "next/image";

export const BillDetails = ({ bill }: { bill: BillData }) => {
  log("Bill 🥰", bill);

  return (
    <div className="p-6 sm:p-8 space-y-6 rounded-xl border border-border shadow-sm w-full max-w-2xl mx-auto transition-all">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-dashed pb-5">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{bill.cafeName}</h2>
          <p className="text-sm mt-1 dark:text-muted-foreground">
            Table No. <span className="font-medium">{bill.tableNo}</span>
          </p>
        </div>
        {bill.logoUrl ? (
          <Image
            src={bill.logoUrl}
            alt={`${bill.cafeName} Logo`}
            className="h-14 w-14 rounded-md object-cover ring-1 ring-border"
            width={56}
            height={56}
          />
        ) : (
          <Atom className="h-10 w-10 text-primary" />
        )}
      </div>

      {/* Order Meta */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
        <p className="dark:text-muted-foreground">Order ID</p>
        <p className="text-right font-medium">
          #{bill.id?.toString().slice(0, 8)}
        </p>

        <p className="dark:text-muted-foreground">Order Type</p>
        <p className="text-right font-medium">
          {" "}
          {bill.orderType === "takeaway" ? "Takeaway" : "Dine In"}
        </p>

        <p className="dark:text-muted-foreground">Date</p>
        <p className="text-right font-medium">
          {DateFormat(bill.timestamp, "date")}
        </p>

        <p className="dark:text-muted-foreground">Time</p>
        <p className="text-right font-medium">
          {DateFormat(bill.timestamp, "time")}
        </p>
      </div>

      {/* Items */}
      <div className="space-y-4">
        <div className="flex text-sm font-medium border-b border-dashed pb-2">
          <p className="flex-grow">Item</p>
          <p className="w-16 text-center">Qty</p>
          <p className="w-20 text-right">Amount</p>
        </div>

        {bill.items.map(({ item, quantity }) => (
          <div
            key={`${item.id}-${quantity}`}
            className="flex text-sm items-center"
          >
            <p className="flex-grow">{item.name}</p>
            <p className="w-16 text-center">{quantity}</p>
            <p className="w-20 text-right font-mono">
              ₹{(item.price * quantity).toFixed(2)}
            </p>
          </div>
        ))}
      </div>

      {/* Totals */}
      <div className="pt-5 border-t border-dashed space-y-2">
        <div className="flex justify-between text-sm">
          <p className="dark:text-muted-foreground">Subtotal</p>
          <p className="font-mono">
            ₹{Number(bill.totalPrice || 0).toFixed(2)}
          </p>
        </div>
        <div className="flex justify-between text-sm">
          <p className="dark:text-muted-foreground">Taxes & Charges (GST)</p>
          <p className="font-mono">₹{Number(bill.gstAmount || 0).toFixed(2)}</p>
        </div>
        <div className="flex justify-between border-t border-dashed  items-center pt-2 mt-2 text-lg font-semibold">
          <p>Grand Total</p>
          <p className="font-mono text-primary text-xl">
            ₹{Number(bill.grandTotal || 0).toFixed(2)}
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="pt-6 text-center text-xs space-y-1">
        <p>Thank you for your visit!</p>
        {bill.gstNo && <p>GST No: {bill.gstNo}</p>}
      </div>
    </div>
  );
};
