// components/bill/BillDetails.tsx

import { Capitilize, log } from "@/lib/helper";
import { BillData } from "@/types/menu";
import { Atom } from "lucide-react";


export const BillDetails = ({ bill }: { bill: BillData }) => {
  log("Bill 🥰" , bill);
  
  return (
    <div className="bg-background p-6 sm:p-8 space-y-6 rounded-lg border border-border shadow-sm w-full max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">The Great Cafe</h1>
          <p className="text-muted-foreground">Table No. {bill.tableNo}</p>
        </div>
        <Atom className="h-10 w-10 text-primary" />
      </div>

      {/* Details */}
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-sm text-muted-foreground">
            Order #{bill.id?.toString().slice(0, 8)}
          </p>
          <p className="text-sm text-muted-foreground">
            Order Type: {Capitilize(bill.orderType || 'unknown')}
          </p>
        </div>
        <div className="text-right">
          <p className="text-muted-foreground">Date of Issue</p>
          <p className="font-medium">
            {new Date(bill.timestamp).toLocaleDateString()}
          </p>
        </div>
      </div>

      <hr className="border-dashed border-border" />

      {/* Items Table */}
      <div className="space-y-4">
        <div className="flex text-sm font-medium text-muted-foreground">
          <p className="flex-grow">Description</p>
          <p className="w-16 text-center">Qty</p>
          <p className="w-20 text-right">Amount</p>
        </div>
        {bill.items.map(({ item, quantity }) => (
          <div
            key={`${item.id}-${quantity}`}
            className="flex items-center text-sm"
          >
            <p className="flex-grow font-medium">{item.name}</p>
            <p className="w-16 text-center text-muted-foreground">{quantity}</p>
            <p className="w-20 text-right font-mono">
              ₹{(item.price * quantity).toFixed(2)}
            </p>
          </div>
        ))}
      </div>

      {/* Totals Section */}
      <div className="space-y-4 pt-4 border-t border-dashed border-border">
        <div className="flex justify-between text-sm">
          <p className="text-muted-foreground">Subtotal</p>
          <p className="font-mono">
            ₹{bill.totalPrice ? Number(bill.totalPrice).toFixed(2) : "0.00"}
          </p>
        </div>
        <div className="flex justify-between text-sm">
          <p className="text-muted-foreground">Taxes & Charges (GST)</p>
          <p className="font-mono">
            ₹{bill.totalPrice ? Number(bill.gstAmount).toFixed(2) : "0.00"}
          </p>
        </div>
        <div className="flex justify-between items-center text-xl font-bold">
          <p>Grand Total</p>
          <p className="font-mono text-primary">
            ₹{bill.totalPrice ? Number(bill.grandTotal).toFixed(2) : "0.00"}
          </p>
        </div>
      </div>
    </div>
  );
};
