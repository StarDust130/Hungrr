// /app/bill/BillActions.tsx (Final Reliable Version)

"use client";

import { JSX, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Download,
  Home,
  Loader2,
} from "lucide-react";
import { BillData } from "./BillPage"; // Import the BillData type from the BillPage component


interface BillActionsProps {
  bill: BillData;
}

export function BillActions({ bill }: BillActionsProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  // This is the new, reliable, and manually-crafted PDF generator.
  const generateReliablePdf = async () => {
    setIsDownloading(true);
    try {
      // --- DYNAMIC IMPORT ---
      // This ensures jsPDF is only loaded in the browser when needed.
      const { default: jsPDF } = await import("jspdf");
      const doc = new jsPDF("p", "mm", "a4");

      // --- DOCUMENT SETUP ---
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 15;
      let y = 20; // Vertical position tracker

      // --- HELPER TO DRAW HEADER ON EACH PAGE ---
      const drawHeader = () => {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(22);
        doc.text("The Great Cafe", margin, y);
        doc.setFontSize(16);
        doc.text("INVOICE", pageWidth - margin, y, { align: "right" });
        y += 15;
        doc.setDrawColor("#E0E0E0");
        doc.line(margin, y, pageWidth - margin, y);
        y += 10;
      };

      // --- HELPER TO DRAW TABLE HEAD ---
      const drawTableHead = () => {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.text("ITEM DESCRIPTION", margin + 2, y);
        doc.text("QTY", margin + 110, y);
        doc.text("RATE", margin + 135, y, { align: "right" });
        doc.text("AMOUNT", pageWidth - margin, y, { align: "right" });
        y += 7;
        doc.setDrawColor("#333333");
        doc.line(margin, y, pageWidth - margin, y);
        y += 8;
      };

      // --- DRAW INITIAL PAGE HEADER & TABLE HEAD ---
      drawHeader();
      drawTableHead();

      // --- DRAW TABLE ITEMS ---
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);

      (bill.items || []).forEach((cartItem) => {
        const item = cartItem?.item;
        const quantity = cartItem?.quantity ?? 0;
        const price = item?.price ?? 0;
        const total = price * quantity;
        const itemName = item?.name ?? "N/A";

        const itemColumnWidth = 105; // Max width for item name
        const itemLines = doc.splitTextToSize(itemName, itemColumnWidth);
        const rowHeight = itemLines.length * 5 + 4; // Calculate required height for this row

        // --- AUTOMATIC PAGE BREAK LOGIC ---
        if (y + rowHeight > pageHeight - margin - 20) {
          // Check if space is left on the page
          doc.addPage();
          y = 20; // Reset y for new page
          drawHeader();
          drawTableHead();
        }

        // Draw the text for the current row
        doc.text(itemLines, margin + 2, y);
        doc.text(quantity.toString(), margin + 110, y);
        doc.text(`Rs. ${price.toFixed(2)}`, margin + 135, y, {
          align: "right",
        });
        doc.text(`Rs. ${total.toFixed(2)}`, pageWidth - margin, y, {
          align: "right",
        });

        y += rowHeight; // Move y down by the calculated row height
      });

      // --- DRAW TOTALS SECTION ---
      const totalsY = y > pageHeight - 60 ? pageHeight - 50 : y + 10; // Position totals
      doc.setDrawColor("#E0E0E0");
      doc.line(margin, totalsY - 5, pageWidth - margin, totalsY - 5);

      const totalsXLabel = pageWidth - margin - 50;
      const totalsXValue = pageWidth - margin;
      const subtotal = bill.totalPrice ?? 0;
      const gst = bill.gstAmount ?? 0;
      const grandTotal = bill.grandTotal ?? 0;

      doc.setFont("helvetica", "normal");
      doc.text("Subtotal:", totalsXLabel, totalsY);
      doc.text(`Rs. ${subtotal.toFixed(2)}`, totalsXValue, totalsY, {
        align: "right",
      });

      doc.text("GST:", totalsXLabel, totalsY + 7);
      doc.text(`Rs. ${gst.toFixed(2)}`, totalsXValue, totalsY + 7, {
        align: "right",
      });

      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text("Grand Total:", totalsXLabel, totalsY + 14);
      doc.text(`Rs. ${grandTotal.toFixed(2)}`, totalsXValue, totalsY + 14, {
        align: "right",
      });

      // --- DRAW FOOTER ---
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor("#808080");
      doc.text("Thank you for your business!", pageWidth / 2, pageHeight - 10, {
        align: "center",
      });

      // --- SAVE THE DOCUMENT ---
      doc.save(`Invoice-${bill.id.slice(-6)}.pdf`);
    } catch (error) {
      console.error(
        "A critical error occurred while generating the PDF:",
        error
      );
      alert("PDF generation failed. Please check the console for details.");
    } finally {
      setIsDownloading(false);
    }
  };

  // --- UI RENDERING LOGIC (UNCHANGED) ---
  const renderPaymentUI = (): JSX.Element | null => {
    if (bill.paymentStatus === "paid") {
      /* ... */
    }
    if (bill.paymentMethod === "online" && bill.paymentStatus === "pending") {
      /* ... */
    }
    return null;
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-900/50 p-4 space-y-4 rounded-lg border">
      {/* The UI part is unchanged, only the onClick function is new */}
      {renderPaymentUI()}
      {bill.paymentStatus === "pending" && <hr className="border-border" />}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          variant="secondary"
          className="flex-1 h-12"
          onClick={generateReliablePdf}
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
  );
}
