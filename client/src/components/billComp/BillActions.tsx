"use client";

import { useState, useEffect } from "react";
// import Link from "next/link"; // --- REMOVED this line
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Download,
  Home,
  Loader2,
  ArrowLeft,
  Wallet,
  Copy,
  Check,
} from "lucide-react";
import QRCode from "react-qr-code";
import { BillData } from "./BillPage";
import GenerateReliablePdf from "./GenerateReliablePdf";


// --- Configuration for Your UPI Details ---
const YOUR_UPI_ID = "9302903537-2@ybl";
const YOUR_NAME = "Chandrashekhar";
// -----------------------------------------

interface BillActionsProps {
  bill: BillData;
}

export function BillActions({ bill }: BillActionsProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const userAgent = navigator.userAgent;
    const mobileRegex =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
    setIsDesktop(!mobileRegex.test(userAgent));
  }, []);

  const amount = bill.grandTotal.toFixed(2);
  const upiUrl = `upi://pay?pa=${YOUR_UPI_ID}&pn=${encodeURIComponent(
    YOUR_NAME
  )}&am=${amount}&cu=INR`;

  const handlePayment = () => {
    if (isDesktop) {
      setShowQrModal(true);
    } else {
      window.location.href = upiUrl;
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(YOUR_UPI_ID);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // This function now handles the redirect
  const handleRedirectToMenu = () => {
    window.location.href = "/";
  };

  const showPayOnlineButton =
    bill.paymentMethod === "online" && bill.paymentStatus === "pending";

  const PayButton = ({ isMobile = false }) => (
    <Button
      size={isMobile ? "lg" : undefined}
      className={`flex-1 h-12 ${isMobile ? "rounded-xl" : ""}`}
      onClick={handlePayment}
    >
      <Wallet size={18} className="mr-2" />
      Pay Now
    </Button>
  );

  const DownloadButton = ({ isMobile = false }) => (
    <Button
      variant="secondary"
      size={isMobile ? "lg" : undefined}
      className={`flex-1 h-12 ${isMobile ? "rounded-xl" : ""}`}
      onClick={() => GenerateReliablePdf({ bill, setIsDownloading })}
      disabled={isDownloading}
    >
      {isDownloading ? (
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
      ) : (
        <Download size={18} className="mr-2" />
      )}
      {isDownloading
        ? "Generating..."
        : `Download ${isMobile ? "Bill" : "Invoice"}`}
    </Button>
  );

  return (
    <>
      {/* --- ACTION BUTTONS --- */}

      {/* Desktop and Tablet View */}
      <div className="hidden sm:block p-4 space-y-4 rounded-lg border">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* MODIFIED: Using onClick for redirect */}
          <Button
            variant="outline"
            className="flex-1 h-12"
            onClick={handleRedirectToMenu}
          >
            <Home size={18} className="mr-2" />
            Back to Menu
          </Button>
          {showPayOnlineButton ? <PayButton /> : <DownloadButton />}
        </div>
      </div>

      {/* Fixed Bottom Bar for Mobile */}
      <div className="fixed bottom-0 left-0 right-0 sm:hidden bg-background border-t shadow-[0_-2px_8px_rgba(0,0,0,0.08)] px-4 py-3 rounded-t-2xl z-50 flex gap-3">
        {/* MODIFIED: Using onClick for redirect */}
        <Button
          variant="outline"
          size="lg"
          className="flex-1 h-12 rounded-xl"
          onClick={handleRedirectToMenu}
        >
          <ArrowLeft size={18} className="mr-2" />
          Menu
        </Button>
        {showPayOnlineButton ? (
          <PayButton isMobile />
        ) : (
          <DownloadButton isMobile />
        )}
      </div>

      {/* --- QR Code Modal for Desktop (No changes here) --- */}
      {isDesktop && (
        <Dialog open={showQrModal} onOpenChange={setShowQrModal}>
          <DialogContent className="sm:max-w-xs">
            <DialogHeader>
              <DialogTitle className="text-center">Scan to Pay</DialogTitle>
              <DialogDescription className="text-center">
                Use any UPI app to pay the bill amount of ₹{amount}.
              </DialogDescription>
            </DialogHeader>
            <div className="p-4">
              <div className=" p-4 rounded-lg w-full max-w-[200px] mx-auto">
                <QRCode
                  value={upiUrl}
                  style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                  viewBox={`0 0 256 256`}
                />
              </div>
            </div>
            <div className="text-center text-sm text-muted-foreground">OR</div>
            <div className="flex flex-col gap-2 px-4 pb-4">
              <p className="text-xs text-muted-foreground text-center">
                Pay directly to the UPI ID:
              </p>
              <div className="flex items-center gap-2 rounded-md border bg-muted/50 pl-3">
                <span className="flex-1 text-sm font-mono truncate">
                  {YOUR_UPI_ID}
                </span>
                <Button size="icon" variant="ghost" onClick={handleCopy}>
                  {copied ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
