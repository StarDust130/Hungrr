import jsPDF from "jspdf";
import AmountInWords from "./AmountInWords";

export interface GenerateReliablePdfProps {
  bill: {
    id: string;
    timestamp: string;
    items: Array<{
      item: {
        name: string;
        price: number;
      };
      quantity?: number;
    }>;
    totalPrice?: number;
    gstAmount?: number;
    grandTotal?: number;
  };
    setIsDownloading: (isDownloading: boolean) => void;
}

const GenerateReliablePdf = async ({
  bill,
  setIsDownloading,
}: GenerateReliablePdfProps) => {
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
    doc.text(`Invoice No: #${bill.id.slice(-6)}`, pageWidth - margin, y - 16, {
      align: "right",
    });
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
    const grandTotalInWords = AmountInWords(grandTotal);
    if (grandTotalInWords) {
      // Only draw if the string is not empty
      doc.setFont("helvetica", "italic");
      doc.setFontSize(9);
      doc.setTextColor("#555555");
      doc.text(`In Words: ${grandTotalInWords}`, margin, totalsY);
    }

    // --- FORMAL FOOTER ---(Fix it not llok good and not aligin in same line)
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
    console.error("A critical error occurred while generating the PDF:", error);
    alert("PDF generation failed. Please check the console for details.");
  } finally {
    setIsDownloading(false);
  }
};

export default GenerateReliablePdf;