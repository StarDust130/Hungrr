// /app/bill/BillActions.tsx (Final Polished & Type-Safe Version)

"use client";

import { JSX, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Download,
  CreditCard,
  CheckCircle,
  Home,
  Loader2,
} from "lucide-react";
import { BillData } from "./BillPage"; // Import the BillData type from the BillPage component
import type { jsPDF } from "jspdf"; // Import type for explicit annotation

interface BillActionsProps {
  bill: BillData;
}

// --- NEW (IMPROVED): Helper function to convert number to words ---
// This version is safer and handles edge cases gracefully.
const amountInWords = (number: number): string => {
  // Handle non-numeric or negative inputs
  if (isNaN(number) || number < 0) return "";

  // Discard decimal part
  const num = Math.floor(number);

  // Numbers greater than 99,99,999 are not handled and will return an empty string
  if (num > 9999999) return "";

  const a = [
    "",
    "one ",
    "two ",
    "three ",
    "four ",
    "five ",
    "six ",
    "seven ",
    "eight ",
    "nine ",
    "ten ",
    "eleven ",
    "twelve ",
    "thirteen ",
    "fourteen ",
    "fifteen ",
    "sixteen ",
    "seventeen ",
    "eighteen ",
    "nineteen ",
  ];
  const b = [
    "",
    "",
    "twenty",
    "thirty",
    "forty",
    "fifty",
    "sixty",
    "seventy",
    "eighty",
    "ninety",
  ];

  const numStr = ("0000000" + num)
    .substr(-7)
    .match(/^(\d{2})(\d{2})(\d{1})(\d{2})$/);
  if (!numStr) return "";

  let str = "";
  str +=
    parseInt(numStr[1]) != 0
      ? (a[Number(numStr[1])] || b[Number(numStr[1][0])] + " " + a[Number(numStr[1][1])]) +
        "lakh "
      : "";
  str +=
    parseInt(numStr[2]) != 0
      ? (a[Number(numStr[2])] || b[Number(numStr[2][0])] + " " + a[Number(numStr[2][1])]) +
        "thousand "
      : "";
  str +=
    parseInt(numStr[3]) != 0
      ? (a[Number(numStr[3])] || b[Number(numStr[3][0])] + " " + a[Number(numStr[3][1])]) +
        "hundred "
      : "";
  str +=
    parseInt(numStr[4]) != 0
      ? (str != "" ? "and " : "") +
        (a[Number(numStr[4])] ||
          b[Number(numStr[4][0])] + " " + a[Number(numStr[4][1])])
      : "";

  if (str.trim() === "") return "";

  // Capitalize first letter and add "Rupees Only"
  str = str.charAt(0).toUpperCase() + str.slice(1);
  return str.trim() + " Rupees Only";
};

export function BillActions({ bill }: BillActionsProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  const generateReliablePdf = async () => {
    setIsDownloading(true);
    try {
      const { default: jsPDF } = await import("jspdf");

      // Explicitly type the document for better type safety
      const doc: jsPDF = new jsPDF("p", "mm", "a4");

      // --- DOCUMENT SETUP ---
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 15;
      let y = 15;

      // --- HEADER ---
      doc.setFont("helvetica", "bold");
      doc.setFontSize(20);
      doc.text("The Great Cafe", margin, y);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      y += 6;
      doc.text(
        "123 Cafe Lane, Food City, Raipur, Chhattisgarh, 492001",
        margin,
        y
      );
      y += 5;
      doc.text("Phone: +91 98765 43210", margin, y);
      y += 5;
      doc.setFont("helvetica", "bold");
      doc.text("GSTIN: 22AAAAA0000A1Z5", margin, y); // <-- REPLACE WITH YOUR GSTIN

      // --- INVOICE DETAILS ---
      doc.setFont("helvetica", "normal");
      doc.text(
        `Invoice No: #${bill.id.slice(-6)}`,
        pageWidth - margin,
        y - 16,
        { align: "right" }
      );
      doc.text(
        `Date: ${new Date(bill.timestamp).toLocaleDateString("en-GB")}`,
        pageWidth - margin,
        y - 11,
        { align: "right" }
      );
      y += 10;
      doc.setDrawColor("#E0E0E0");
      doc.line(margin, y, pageWidth - margin, y);
      y += 10;

      const drawTableHead = (yPos: number) => {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setFillColor("#F0F0F0");
        doc.rect(margin, yPos - 5, pageWidth - margin * 2, 8, "F");
        doc.setTextColor("#000000");
        doc.text("ITEM DESCRIPTION", margin + 2, yPos);
        doc.text("QTY", margin + 110, yPos);
        doc.text("RATE", margin + 135, yPos, { align: "right" });
        doc.text("AMOUNT", pageWidth - margin, yPos, { align: "right" });
        return yPos + 8;
      };

      y = drawTableHead(y);

      // --- DRAW TABLE ITEMS ---
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor("#333333");

      (bill.items || []).forEach((cartItem) => {
        const item = cartItem?.item;
        const quantity = cartItem?.quantity ?? 0;
        const price = item?.price ?? 0;
        const total = price * quantity;
        const itemName = item?.name ?? "N/A";

        const itemColumnWidth = 105;
        const itemLines = doc.splitTextToSize(itemName, itemColumnWidth);
        const rowHeight = itemLines.length * 5 + 6;

        if (y + rowHeight > pageHeight - 40) {
          doc.addPage();
          y = 20;
          y = drawTableHead(y);
        }

        doc.text(itemLines, margin + 2, y);
        doc.text(quantity.toString(), margin + 110, y);
        doc.text(`Rs. ${price.toFixed(2)}`, margin + 135, y, {
          align: "right",
        });
        doc.text(`Rs. ${total.toFixed(2)}`, pageWidth - margin, y, {
          align: "right",
        });
        y += rowHeight;
      });

      // --- DRAW TOTALS SECTION ---
      let totalsY = y > pageHeight - 70 ? pageHeight - 70 : y + 10;
      doc.setDrawColor("#E0E0E0");
      doc.line(margin, totalsY, pageWidth - margin, totalsY);
      totalsY += 8;

      const totalsXLabel = pageWidth - margin - 50;
      const totalsXValue = pageWidth - margin;
      const subtotal = bill.totalPrice ?? 0;
      const gst = bill.gstAmount ?? 0;
      const grandTotal = bill.grandTotal ?? 0;

      doc.setFontSize(10);
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
      totalsY += 22;

      // --- NEW (IMPROVED): Conditionally draw Amount in Words ---
      const grandTotalInWords = amountInWords(grandTotal);
      if (grandTotalInWords) {
        // Only draw if the string is not empty
        doc.setFont("helvetica", "italic");
        doc.setFontSize(9);
        doc.setTextColor("#555555");
        doc.text(`In Words: ${grandTotalInWords}`, margin, totalsY);
      }

      // --- FORMAL FOOTER ---
      let footerY = pageHeight - 25;
      doc.setDrawColor("#E0E0E0");
      doc.line(margin, footerY, pageWidth - margin, footerY);
      footerY += 8;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor("#808080");
      doc.text(
        "Terms & Conditions: All disputes subject to Raipur jurisdiction.",
        margin,
        footerY
      );
      footerY += 10;

      doc.text("For The Great Cafe", pageWidth - margin, footerY, {
        align: "right",
      });
      footerY += 4;
      doc.text("Authorized Signatory", pageWidth - margin, footerY, {
        align: "right",
      });

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

  const renderPaymentUI = (): JSX.Element | null => {
    if (bill.paymentStatus === "paid") {
      return (
        <div className="text-center p-4 space-y-2">
          {" "}
          <CheckCircle className="mx-auto h-10 w-10 text-green-500" />{" "}
          <h3 className="font-semibold text-lg">Payment Complete!</h3>{" "}
        </div>
      );
    }
    if (bill.paymentMethod === "online" && bill.paymentStatus === "pending") {
      return (
        <div className="p-4 text-center space-y-3">
          {" "}
          <h3 className="font-semibold text-lg">Complete Your Payment</h3>{" "}
          <Button asChild size="lg" className="w-full h-14 font-bold text-base">
            {" "}
            <Link
              href={`upi://pay?pa=YOUR_UPI_ID@okhdfcbank&pn=The%20Great%20Cafe&am=${bill.grandTotal.toFixed(
                2
              )}&cu=INR&tn=Order%20${bill.id.slice(-6)}`}
            >
              {" "}
              <CreditCard size={20} className="mr-2.5" /> Pay ₹
              {bill.grandTotal.toFixed(2)} Securely{" "}
            </Link>{" "}
          </Button>{" "}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-900/50 p-4 space-y-4 rounded-lg border">
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
