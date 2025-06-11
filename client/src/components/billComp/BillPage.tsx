/* eslint-disable @typescript-eslint/no-unused-vars */
// /app/bill/page.tsx

"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, QrCode, Atom, ReceiptIndianRupee } from "lucide-react";
import { CartItem } from "@/types/menu"; // Make sure you have this type defined
import { BillActions } from "./BillActions";
import { OrderStatusTracker } from "./OrderStatusTracker";

// This interface is used by both the page and its child components
export interface BillData {
  id: string;
  timestamp: string;
  items: CartItem[];
  totalPrice: number; // Subtotal
  gstAmount: number;
  grandTotal: number;
  paymentMethod: "counter" | "online";
  paymentStatus: "pending" | "paid";
}

// This type defines the possible stages of the order for the UI
type OrderStatus = "payment-pending" | "confirmed" | "preparing" | "ready";

export default function BillPage() {
  // --- STATE MANAGEMENT ---
  const [bill, setBill] = useState<BillData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [orderStatus, setOrderStatus] =
    useState<OrderStatus>("payment-pending");

  // The ref for printing is no longer needed as the PDF is generated from data

  // --- EFFECTS ---

  // Effect 1: Get bill from session storage and simulate payment
  useEffect(() => {
    const billJson = sessionStorage.getItem("currentBill");
    if (billJson) {
      try {
        const parsedBill: BillData = JSON.parse(billJson);

        // For demonstration: simulate an "online" payment being completed after 5 seconds
        if (
          parsedBill.paymentMethod === "online" &&
          parsedBill.paymentStatus === "pending"
        ) {
          setTimeout(() => {
            setBill({ ...parsedBill, paymentStatus: "paid" });
          }, 5000); // 5-second delay to simulate a real payment process
        } else {
          setBill(parsedBill);
        }
      } catch (e) {
        setError("Failed to read bill data. It might be corrupted.");
      }
    } else {
      setError("Bill not found. Your session may have expired.");
    }
  }, []);

  // Effect 2: Simulate the food preparation progress after payment is confirmed
  useEffect(() => {
    // This effect runs whenever the bill's payment status changes
    if (bill?.paymentStatus === "paid") {
      setOrderStatus("confirmed");
      // Chain setTimeouts to simulate the order progressing through the kitchen
      setTimeout(() => setOrderStatus("preparing"), 2000); // Move to 'preparing' after 2 seconds
      setTimeout(() => setOrderStatus("ready"), 12000); // Move to 'ready' 10 seconds after that (total 12s)
    } else {
      setOrderStatus("payment-pending");
    }
  }, [bill?.paymentStatus]);

  // --- RENDER LOGIC ---

  // 1. Render Error State
  if (error) {
    return (
      <main className="flex justify-center items-center min-h-screen p-4">
        <div className="text-center p-8 bg-background rounded-lg shadow-md max-w-sm">
          <AlertTriangle className="mx-auto h-12 w-12 text-destructive" />
          <h1 className="mt-4 text-xl font-bold">Unable to Load Bill</h1>
          <p className="mt-2 text-muted-foreground">{error}</p>
        </div>
      </main>
    );
  }

  if (!bill) {
    return (
      <main className="flex flex-col justify-center items-center min-h-screen px-4 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
  
            <ReceiptIndianRupee className="h-12 w-12 text-gray-500" />
          </div>

          <div className="flex items-center gap-2 animate-fade-in">
            <p className="text-lg font-medium ">Loading Bill...</p>
          </div>

          <p className="text-xs mt-8 text-muted-foreground">
            Fetching your order details, please hang tight. 😉
          </p>
        </div>
      </main>
    );
  }

  // 3. Render the Full Bill Page
  return (
    <main className="font-sans w-full min-h-screen flex flex-col items-center bg-gray-50 dark:bg-black p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-md mx-auto space-y-6">
        {/* Component 1: The Live Order Status Tracker */}
        <OrderStatusTracker status={orderStatus} />

        {/* Component 2: The On-Screen Bill Display */}
        <div className="bg-background p-6 sm:p-8 space-y-6 rounded-lg border border-border shadow-sm">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">The Great Cafe</h1>
              <p className="text-sm text-muted-foreground">
                Order #{bill.id.slice(-6)}
              </p>
            </div>
            <Atom className="h-10 w-10 text-primary" />
          </div>

          {/* Details */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Billed To</p>
              <p className="font-medium">Valued Customer</p>
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
              <div key={item.id} className="flex items-center text-sm">
                <p className="flex-grow font-medium">{item.name}</p>
                <p className="w-16 text-center text-muted-foreground">
                  {quantity}
                </p>
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
              <p className="font-mono">₹{bill.totalPrice.toFixed(2)}</p>
            </div>
            <div className="flex justify-between text-sm">
              <p className="text-muted-foreground">Taxes & Charges (GST)</p>
              <p className="font-mono">₹{bill.gstAmount.toFixed(2)}</p>
            </div>
            <div className="flex justify-between items-center text-xl font-bold">
              <p>Grand Total</p>
              <p className="font-mono text-primary">
                ₹{bill.grandTotal.toFixed(2)}
              </p>
            </div>
          </div>

          {/* Footer with QR Code */}
          <div className="flex items-center justify-between pt-6 border-t border-border">
            <div className="text-xs text-muted-foreground">
              <p className="font-bold">Thank you for your order!</p>
            </div>
            <QrCode className="h-16 w-16 text-muted-foreground" />
          </div>
        </div>

        {/* Component 3: The Action Buttons (Pay, Download, etc.) */}
        <BillActions bill={bill} />
      </div>
    </main>
  );
}
