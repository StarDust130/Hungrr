import jsPDF from "jspdf";
import AmountInWords from "./AmountInWords";
import { BillData } from "@/types/menu";

export interface GenerateReliablePdfProps {
  bill: BillData;
}

const GenerateReliablePdf = async ({ bill }: GenerateReliablePdfProps) => {
  try {
    // --- PAGE SETUP for 80mm POS Receipt Style ---
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: [80, 200], // 80mm width, 200mm initial height
    });

    const pageWidth = 70; // Usable width within 80mm paper, leaving margins
    const margin = 5;
    let y = 10;
    const lineSpacing = 5;
    const smallLineSpacing = 4;

    // --- HELPER for dotted lines ---
    const drawDottedLine = (yPos: number) => {
      doc.setLineDashPattern([0.5, 0.5], 0);
      doc.line(margin, yPos, margin + pageWidth, yPos);
      doc.setLineDashPattern([], 0); // Reset dash pattern
    };

    // --- HEADER ---
    doc.setFont("courier", "bold");
    doc.setFontSize(14);
    doc.text("The Great Cafe", margin + pageWidth / 2, y, { align: "center" });
    y += lineSpacing;

    doc.setFont("courier", "normal");
    doc.setFontSize(8);
    doc.text("123 Cafe Lane, Food City", margin + pageWidth / 2, y, {
      align: "center",
    });
    y += smallLineSpacing;
    doc.text("Raipur, Chhattisgarh, 492001", margin + pageWidth / 2, y, {
      align: "center",
    });
    y += smallLineSpacing;
    doc.text("GSTIN: 22AAAAA0000A1Z5", margin + pageWidth / 2, y, {
      align: "center",
    });
    y += lineSpacing;
    drawDottedLine(y);
    y += lineSpacing;

    // --- BILL DETAILS ---
    const billNo = `Bill No: #${String(bill.id).slice(-6)}`;
    const billDate = `Date: ${new Date(bill.timestamp).toLocaleDateString(
      "en-GB"
    )}`;
    doc.text(billNo, margin, y);
    doc.text(billDate, margin + pageWidth, y, { align: "right" });
    y += smallLineSpacing;
    doc.text(`Table: ${bill.tableNo || "N/A"}`, margin, y);
    y += lineSpacing;
    drawDottedLine(y);
    y += lineSpacing;

    // --- TABLE HEADER ---
    doc.setFont("courier", "bold");
    doc.text("Item", margin, y);
    doc.text("Qty", margin + 45, y, { align: "center" });
    doc.text("Price", margin + pageWidth, y, { align: "right" });
    y += smallLineSpacing;
    drawDottedLine(y);
    y += lineSpacing;

    // --- TABLE ITEMS ---
    doc.setFont("courier", "normal");
    bill.items.forEach((cartItem) => {
      const price = cartItem.item.price;
      const quantity = cartItem.quantity ?? 1;
      const total = price * quantity;

      // Handle long item names by splitting them
      const itemNameLines = doc.splitTextToSize(cartItem.item.name, 40); // 40mm width for item name

      doc.text(itemNameLines[0], margin, y); // Print first line of item name
      doc.text(String(quantity), margin + 47, y, { align: "center" });
      doc.text(total.toFixed(2), margin + pageWidth, y, { align: "right" });

      // If item name was split, print subsequent lines
      if (itemNameLines.length > 1) {
        for (let i = 1; i < itemNameLines.length; i++) {
          y += smallLineSpacing;
          doc.text(itemNameLines[i], margin, y);
        }
      }
      y += lineSpacing;
    });
    drawDottedLine(y);
    y += lineSpacing;

    // --- TOTALS ---
    const totalsXLabel = margin + 35;
    const totalsXValue = margin + pageWidth;

    const addTotalLine = (label: string, value: number) => {
      doc.text(label, totalsXLabel, y);
      doc.text(value.toFixed(2), totalsXValue, y, { align: "right" });
      y += lineSpacing;
    };

    addTotalLine("Subtotal", bill.totalPrice ?? 0);
    addTotalLine("GST", bill.gstAmount ?? 0);
    drawDottedLine(y);
    y += lineSpacing;

    doc.setFont("courier", "bold");
    addTotalLine("GRAND TOTAL", bill.grandTotal ?? 0);
    y += lineSpacing;

    // --- AMOUNT IN WORDS ---
    const grandTotalInWords = AmountInWords(bill.grandTotal ?? 0);
    if (grandTotalInWords) {
      doc.setFont("courier", "normal");
      const words = `In Words: Rupees ${grandTotalInWords} Only`;
      const splitWords = doc.splitTextToSize(words, pageWidth); // Wrap if needed
      doc.text(splitWords, margin, y);
      y += splitWords.length * smallLineSpacing;
    }
    y += lineSpacing;

    // --- FOOTER ---
    doc.setFont("courier", "italic");
    doc.text("Thank you for your visit!", margin + pageWidth / 2, y, {
      align: "center",
    });
    y += smallLineSpacing;
    doc.text(
      "We look forward to seeing you again.",
      margin + pageWidth / 2,
      y,
      { align: "center" }
    );

    doc.save(`Bill-${String(bill.id).slice(-6)}.pdf`);
  } catch (error) {
    console.error("A critical error occurred while generating the PDF:", error);
    throw error;
  }
};

export default GenerateReliablePdf;
