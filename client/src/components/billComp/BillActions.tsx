"use client";

import {  useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Download,
  Home,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import { BillData } from "./BillPage"; // Import the BillData type from the BillPage component

import GenerateReliablePdf from "./GenerateReliablePdf";

interface BillActionsProps {
  bill: BillData;
}

export function BillActions({ bill }: BillActionsProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  return (
    <>
    {/* Action Buttons */}
      {/* Desktop and Tablet View (Normal Flow) */}
      <div className="hidden sm:block p-4 space-y-4 rounded-lg border">
        {bill.paymentStatus === "pending" && <hr className="border-border" />}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            variant="secondary"
            className="flex-1 h-12"
            onClick={() => GenerateReliablePdf({ bill, setIsDownloading })}
            disabled={isDownloading}
          >
            {isDownloading ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <Download size={18} className="mr-2" />
            )}
            {isDownloading ? "Generating..." : "Download Invoice"}
          </Button>
          <Button asChild variant="outline" className="flex-1 h-12">
            <Link href="/">
              <Home size={18} className="mr-2" />
              Back to Menu
            </Link>
          </Button>
        </div>
      </div>

      {/* Fixed Bottom Bar for Mobile */}
      <div className="fixed bottom-0 left-0 right-0 sm:hidden bg-background border-t shadow-[0_-2px_8px_rgba(0,0,0,0.08)] px-4 py-3 rounded-t-2xl z-50 flex gap-3">
        <Button
          variant="outline"
          size="lg"
          className="flex-1 h-12 rounded-xl text-base font-medium transition-transform hover:scale-[1.02]"
          asChild
        >
          <Link href="/">
            <ArrowLeft size={18} className="mr-2" />
            Menu
          </Link>
        </Button>
        <Button
          variant="secondary"
          size="lg"
          className="flex-1 h-12 rounded-xl text-base font-medium transition-transform hover:scale-[1.02]"
          onClick={() => GenerateReliablePdf({ bill, setIsDownloading })}
          disabled={isDownloading}
        >
          {isDownloading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Download size={18} className="mr-2" />
              Download Bill
            </>
          )}
        </Button>
      </div>
    </>
  );
}
