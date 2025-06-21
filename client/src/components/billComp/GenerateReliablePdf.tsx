import jsPDF from "jspdf";
import QRCode from "qrcode";
import AmountInWords from "./AmountInWords"; // Your existing utility
import { BillData } from "@/types/menu"; // Your existing type


// --- CONFIGURATION ---
const COMPANY_NAME = "The Great Cafe";
// ✅ ADD YOUR LOGO URL HERE. Leave as "" to hide the logo.
const CAFE_LOGO_URL =
  "https://images.unsplash.com/photo-1602934445884-da0fa1c9d3b3?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTh8fGxvZ298ZW58MHx8MHx8fDA%3D"; // 👈 e.g., "https://i.imgur.com/yourlogo.png"

const COMPANY_DETAILS = {
  address: "123 Cafe Lane, Food City, Raipur, 492001",
  GST_NO : "22AABCT1234F1Z5", // 👈 Replace with your actual GST number
};
const STYLING = {
  fontColorNormal: "#1f2937",
  fontColorLight: "#6b7280",
  fontSizes: { XL: 12, L: 9, M: 8, S: 7, XS: 6 },
};
// --------------------

export interface GenerateReliablePdfProps {
  bill: BillData;
  pageUrl: string; // The URL of the page to link in the QR code
}

const GenerateReliablePdf = async ({
  bill,
  pageUrl,
}: GenerateReliablePdfProps) => {
  try {
    // --- 1. PREPARE DATA ---
    let tableNumber = bill.tableNo;
    if (typeof window !== "undefined") {
      try {
        const sessionData = JSON.parse(
          sessionStorage.getItem("currentBill") || "{}"
        );
        if (sessionData.tableNo) tableNumber = sessionData.tableNo;
      } catch (e) {
        console.error("Could not parse session storage for table number:", e);
      }
    }

    const billUrl = pageUrl;
    const billUrlQrCodeImage = await QRCode.toDataURL(billUrl, {
      width: 256,
      margin: 1,
      errorCorrectionLevel: "H",
    });

    // --- 2. INITIALIZE PDF DOCUMENT ---
    // The height is calculated dynamically based on content + logo
    const logoHeight = CAFE_LOGO_URL ? 20 : 0; // Add 20mm height for the logo if it exists
    const baseHeight = 150 + logoHeight;
    const heightPerItem = 9;
    const calculatedHeight = baseHeight + bill.items.length * heightPerItem;

    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: [80, calculatedHeight],
    });
    const pageWidth = 72;
    const margin = 4;
    let y = 10;
    const lineSpacing = 4.2;
    const smallLineSpacing = 3.2;

    const drawLine = (yPos: number) => {
      doc.setLineDashPattern([0.5, 0.5], 0);
      doc.setDrawColor(STYLING.fontColorLight);
      doc.line(margin, yPos, margin + pageWidth, yPos);
      doc.setLineDashPattern([], 0);
    };

    // --- 3. RENDER PDF CONTENT ---

    // --- NEW: Cafe Logo (Conditional) ---
    if (CAFE_LOGO_URL) {
      try {
        const logoDimensions = { width: 18, height: 18 };
        const logoX = margin + pageWidth / 2 - logoDimensions.width / 2;
        doc.addImage(
          CAFE_LOGO_URL,
          "PNG",
          logoX,
          y,
          logoDimensions.width,
          logoDimensions.height
        );
        y += logoDimensions.height + 4; // Add space after the logo
      } catch (e) {
        console.error("Failed to load or add logo image. Skipping logo.", e);
      }
    }

    // Header
    doc.setFont("courier", "bold");
    doc.setFontSize(STYLING.fontSizes.XL);
    doc.setTextColor(STYLING.fontColorNormal);
    doc.text(COMPANY_NAME, margin + pageWidth / 2, y, { align: "center" });
    y += lineSpacing;
    doc.setFont("courier", "normal");
    doc.setFontSize(STYLING.fontSizes.S);
    doc.setTextColor(STYLING.fontColorLight);
    doc.text("TAX INVOICE", margin + pageWidth / 2, y, { align: "center" });
    y += lineSpacing;
    doc.text(COMPANY_DETAILS.address, margin + pageWidth / 2, y, {
      align: "center",
    });
    y += smallLineSpacing;
    doc.text(COMPANY_DETAILS.GST_NO, margin + pageWidth / 2, y, {
      align: "center",
    });
    y += lineSpacing;
    drawLine(y);
    y += lineSpacing;

    // (The rest of the code is identical to the previous version)

    // Bill Details
    doc.setFontSize(STYLING.fontSizes.M);
    doc.setTextColor(STYLING.fontColorNormal);
    const billDate = new Date(bill.timestamp).toLocaleString("en-GB", {
      dateStyle: "short",
      timeStyle: "short",
    });
    doc.text(`Bill #: ${String(bill.id).slice(-6)}`, margin, y);
    doc.text(`Table: ${tableNumber}`, margin + pageWidth, y, {
      align: "right",
    });
    y += lineSpacing;
    doc.text(`Date: ${billDate}`, margin, y);
    y += lineSpacing;
    drawLine(y);
    y += smallLineSpacing;

    // Table Header
    doc.setFont("courier", "bold");
    const itemX = margin;
    const qtyX = margin + 42;
    const rateX = margin + 55;
    const amountX = margin + pageWidth;
    doc.text("ITEM(S)", itemX, y);
    doc.text("QTY", qtyX, y);
    doc.text("RATE", rateX, y, { align: "right" });
    doc.text("AMOUNT", amountX, y, { align: "right" });
    y += smallLineSpacing;
    drawLine(y);
    y += lineSpacing;

    // Table Items
    doc.setFont("courier", "normal");
    bill.items.forEach((cartItem) => {
      const name = cartItem.item.name;
      const quantity = cartItem.quantity ?? 1;
      const rate = cartItem.item.price;
      const amount = quantity * rate;
      const itemLines = doc.splitTextToSize(name, 38);

      doc.text(itemLines[0], itemX, y);
      doc.text(String(quantity), qtyX + 1, y, { align: "center" });
      doc.text(rate.toFixed(2), rateX, y, { align: "right" });
      doc.text(amount.toFixed(2), amountX, y, { align: "right" });
      y += lineSpacing;
      if (itemLines.length > 1) {
        for (let i = 1; i < itemLines.length; i++) {
          doc.text(itemLines[i], itemX, y);
          y += smallLineSpacing;
        }
        y += lineSpacing - smallLineSpacing;
      }
    });
    drawLine(y);
    y += lineSpacing;

    // Totals
    const totalsXLabel = margin + 30;
    const totalsXValue = margin + pageWidth;
    const addTotalLine = (
      label: string,
      value: string,
      isBold: boolean = false
    ) => {
      doc.setFont("courier", isBold ? "bold" : "normal");
      doc.text(label, totalsXLabel, y);
      doc.text(value, totalsXValue, y, { align: "right" });
      y += lineSpacing;
    };

    addTotalLine("Subtotal", (bill.totalPrice ?? 0).toFixed(2));
    addTotalLine("GST (18%)", (bill.gstAmount ?? 0).toFixed(2));
    y += smallLineSpacing / 2;
    drawLine(y);
    y += lineSpacing;
    doc.setFontSize(STYLING.fontSizes.L);
    addTotalLine(
      "GRAND TOTAL",
      `Rs. ${(bill.grandTotal ?? 0).toFixed(2)}`,
      true
    );
    doc.setFontSize(STYLING.fontSizes.M);

    // Amount in Words
    const grandTotalInWords = AmountInWords(bill.grandTotal ?? 0);
    if (grandTotalInWords) {
      doc.setFont("courier", "normal");
      doc.setFontSize(STYLING.fontSizes.S);
      const words = `In Words: Rupees ${grandTotalInWords} Only`;
      const splitWords = doc.splitTextToSize(words, pageWidth);
      doc.text(splitWords, margin, y);
      y += splitWords.length * smallLineSpacing;
    }
    y += lineSpacing;
    drawLine(y);
    y += lineSpacing;

    // QR Code Section
    const qrSize = 28;
    const qrX = margin + pageWidth / 2 - qrSize / 2;
    const qrY = y;

    doc.addImage(billUrlQrCodeImage, "PNG", qrX, qrY, qrSize, qrSize);
    doc.link(qrX, qrY, qrSize, qrSize, { url: billUrl });
    y += qrSize + 3;

    doc.setFont("courier", "bold");
    doc.setFontSize(STYLING.fontSizes.S);
    doc.setTextColor(STYLING.fontColorNormal);
    const ctaText = "Click or Scan for Digital Bill";
    doc.textWithLink(ctaText, margin + pageWidth / 2, y, {
      align: "center",
      url: billUrl,
    });
    y += lineSpacing * 2;

    // Footer
    doc.setFont("courier", "italic");
    doc.setFontSize(STYLING.fontSizes.M);
    doc.setTextColor(STYLING.fontColorNormal);
    doc.text("Thank You & Visit Again!", margin + pageWidth / 2, y, {
      align: "center",
    });
    y += smallLineSpacing;

    doc.setFont("courier", "normal");
    doc.setFontSize(STYLING.fontSizes.XS);
    doc.setTextColor(STYLING.fontColorLight);
    doc.text("Terms & Conditions Apply.", margin + pageWidth / 2, y, {
      align: "center",
    });
    y += smallLineSpacing;
    doc.text("Bill created by hungrr", margin + pageWidth / 2, y, {
      align: "center",
    });

    // --- SAVE PDF ---
    doc.save(`Bill-${tableNumber}-${String(bill.id).slice(-6)}.pdf`);
  } catch (error) {
    console.error("A critical error occurred while generating the PDF:", error);
    throw error;
  }
};

export default GenerateReliablePdf;
