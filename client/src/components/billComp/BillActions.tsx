"use client";

import { useState, useEffect } from "react";
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
  BadgeIndianRupee,
} from "lucide-react";
import QRCode from "react-qr-code";
import GenerateReliablePdf from "./GenerateReliablePdf";
import { useRouter } from "next/navigation";
import { BillData } from "@/types/menu";
import { log } from "@/lib/helper";

const YOUR_UPI_ID = "9302903537-2@ybl";
const YOUR_NAME = "Chandrashekhar";

interface BillActionsProps {
  bill: BillData;
}

export function BillActions({ bill }: BillActionsProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const router = useRouter();

  log("BillActions rendered with bill 😛:", bill);
  

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

  const handleRedirectToMenu = () => {
    router.back();
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      await GenerateReliablePdf({ bill });
    } catch (error) {
      console.error("Failed to generate PDF:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  // ✅ CORRECT LOGIC: This defines exactly when each button should show.
  const showPayButton =
    bill.paymentMethod === "online" && bill.paymentStatus === "pending";
  const showDownloadButton = bill.paymentStatus === "paid";

  // --- Reusable Button Components ---
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
      onClick={handleDownload}
      disabled={isDownloading}
    >
      {isDownloading ? (
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
      ) : (
        <Download size={18} className="mr-2" />
      )}
      {isDownloading ? "Generating..." : "Download Bill"}
    </Button>
  );

  const PayAtCounterInfo = () => (
    <div className="flex-1 h-12 flex gap-2 items-center justify-center rounded-xl border-2 border-zinc-300 dark:border-zinc-900 text-sm font-semibold tracking-wide text-zinc-800 dark:text-zinc-100 shadow-sm">
      <BadgeIndianRupee size={20} className="mr-2" />
      Pay at Counter
    </div>
  );
  
  

  return (
    <>
      {/* Desktop and Tablet View */}
      <div className="hidden sm:block w-full max-w-lg p-4 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            variant="outline"
            className="flex-1 h-12"
            onClick={handleRedirectToMenu}
          >
            <Home size={18} className="mr-2" />
            Back to Menu
          </Button>

          {/* Correctly renders buttons based on the logic */}
          {showPayButton && <PayButton />}
          {showDownloadButton && <DownloadButton />}
          {!showDownloadButton && <PayAtCounterInfo />}
        </div>
      </div>

      {/* //! Fixed Bottom Bar for Mobile */}
      <div className="fixed bottom-0 left-0 right-0 sm:hidden bg-background border-t shadow-[0_-2px_8px_rgba(0,0,0,0.08)] px-4 py-3 rounded-t-2xl z-50 flex gap-3">
        <Button
          variant="outline"
          size="lg"
          className="flex-1 h-12 rounded-xl"
          onClick={handleRedirectToMenu}
        >
          <ArrowLeft size={18} className="mr-2" />
          Menu
        </Button>

        {/* Correctly renders buttons based on the logic */}
        {showPayButton && <PayButton isMobile />}
        {showDownloadButton && <DownloadButton isMobile />}
        {bill.paymentMethod === "counter" && bill.paymentStatus !== "paid" && (
          <PayAtCounterInfo />
        )}
      </div>

      {/* QR Code Modal for Desktop */}
      {isDesktop && (
        <Dialog open={showQrModal} onOpenChange={setShowQrModal}>
          <DialogContent className="sm:max-w-xs">
            <DialogHeader>
              <DialogTitle className="text-center">Scan to Pay</DialogTitle>
              <DialogDescription className="text-center">
                Use any UPI app to pay ₹{amount}.
              </DialogDescription>
            </DialogHeader>
            <div className="p-4 bg-white rounded-lg">
              <QRCode
                value={upiUrl}
                style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                viewBox={`0 0 256 256`}
              />
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
