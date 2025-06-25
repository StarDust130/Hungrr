"use client";

import { BillData } from "@/types/menu";
import {  Capitalize, log } from "@/lib/helper"; // Assuming capitalize is a function like 'text' => 'Text'
import { Calendar, Clock, Hash, ShoppingBag } from "lucide-react";
import Image from "next/image";

// A small, reusable component for displaying details like Order #, Date, etc.
const DetailItem = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) => (
  <div className="flex flex-col">
    <dt className="text-xs text-muted-foreground flex items-center gap-1.5">
      {icon}
      {label}
    </dt>
    <dd className="font-semibold text-sm text-foreground">{value}</dd>
  </div>
);

export const BillDetails = ({ bill }: { bill: BillData }) => {
  log("Bill Details Rendered With:", bill);

  // Fallback for missing logo: A colored circle with the first letter of the cafe name
  const CafeLogoFallback = () => (
    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
      <span className="text-2xl font-bold">
        {bill.cafeName?.charAt(0).toUpperCase()}
      </span>
    </div>
  );

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6 rounded-2xl border border-border bg-background p-6 sm:p-8 shadow-sm font-sans">
      {/* --- HEADER --- */}
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">
            {bill.cafeName}
          </h1>
          <p className="text-muted-foreground">Table No. {bill.tableNo}</p>
        </div>
        {bill.logoUrl ? (
          <Image
            src={bill.logoUrl}
            alt={`${bill.cafeName} Logo`}
            className="h-16 w-16 rounded-full object-cover border-2 border-border"
            width={64}
            height={64}
          />
        ) : (
          <CafeLogoFallback />
        )}
      </header>

      {/* --- ORDER & DATE DETAILS --- */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-4 rounded-lg bg-muted/50 p-4 border border-border">
        <DetailItem
          icon={<Hash size={14} />}
          label="Order #"
          value={String(bill.id).padStart(6, "0")}
        />
        <DetailItem
          icon={<ShoppingBag size={14} />}
          label="Order Type"
          value={Capitalize(bill.orderType || "Dine-In")}
        />
        <DetailItem
          icon={<Calendar size={14} />}
          label="Date"
          value={new Date(bill.timestamp).toLocaleDateString("en-GB")}
        />
        <DetailItem
          icon={<Clock size={14} />}
          label="Time"
          value={new Date(bill.timestamp).toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        />
      </section>

      {/* --- ITEMS TABLE --- */}
      <section>
        <div className="flex pb-2 text-sm font-semibold text-muted-foreground border-b border-border">
          <p className="flex-grow">DESCRIPTION</p>
          <p className="w-24 text-right">TOTAL</p>
        </div>
        <div className="space-y-4 pt-4">
          {bill.items.map(({ item, quantity }) => (
            <div
              key={item.id}
              className="flex items-start justify-between gap-4 text-sm"
            >
              <div className="flex-grow">
                <p className="font-semibold text-foreground">{item.name}</p>
                <p className="text-muted-foreground font-mono text-xs">
                  {quantity} x ₹{Number(item.price).toFixed(2)}
                </p>
              </div>
              <p className="w-24 text-right font-mono text-foreground">
                ₹{(Number(item.price) * quantity).toFixed(2)}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* --- TOTALS SECTION --- */}
      <section className="space-y-2 pt-4 border-t-2 border-dashed border-border">
        <div className="flex justify-between text-sm">
          <p className="text-muted-foreground">Subtotal</p>
          <p className="font-mono">₹{Number(bill.totalPrice).toFixed(2)}</p>
        </div>
        <div className="flex justify-between text-sm">
          <p className="text-muted-foreground">GST</p>
          <p className="font-mono">₹{Number(bill.gstAmount).toFixed(2)}</p>
        </div>
        <div className="flex justify-between items-center text-lg font-bold p-4 mt-2 rounded-lg bg-primary/10 text-primary">
          <p>Grand Total</p>
          <p className="font-mono">₹{Number(bill.grandTotal).toFixed(2)}</p>
        </div>
      </section>

      {/* --- FOOTER DETAILS --- */}
      <footer className="text-center text-xs text-muted-foreground pt-4 border-t border-border">
        <p>GSTIN: {bill.gstNo || "N/A"}</p>
        <p className="mt-1">Thank you for your order!</p>
      </footer>
    </div>
  );
};
