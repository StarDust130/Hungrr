import jsPDF from "jspdf";
import { BillData } from "@/types/menu";
import AmountInWords from "./AmountInWords";

// --- CONFIGURATION ---
const COMPANY_NAME = "The Great Cafe";
const COMPANY_DETAILS = {
  address: "123 Cafe Lane, Food City, Raipur, 492001",
  GST_NO: "22AABCT1234F1Z5",
};
const STYLING = {
  fontColorNormal: "#1f2937",
  fontColorLight: "#6b7280",
};

/**
 * A robust class for building the bill PDF document, designed for professional results.
 */
export class PDFBuilder {
  private doc: jsPDF;
  private bill: BillData;
  private y: number;
  private pageWidth = 72;
  private margin = 4;
  private lineSpacing = 4.2;
  private smallLineSpacing = 3.2;

  constructor(bill: BillData) {
    this.bill = bill;
    const calculatedHeight = this.calculatePdfHeight();
    this.doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: [80, calculatedHeight],
    });
    this.y = 10;
  }

  private calculatePdfHeight(): number {
    const logoHeight = 20;
    const baseHeight = 150 + logoHeight;
    const heightPerItem = 9;
    return baseHeight + this.bill.items.length * heightPerItem;
  }

  private drawLine() {
    this.doc.setLineDashPattern([0.5, 0.5], 0);
    this.doc.setDrawColor(STYLING.fontColorLight);
    this.doc.line(this.margin, this.y, this.margin + this.pageWidth, this.y);
    this.doc.setLineDashPattern([], 0);
  }

  drawHeader(logoDataUrl?: string) {
    if (logoDataUrl) {
      try {
        const logoDim = { width: 18, height: 18 };
        const logoX = this.margin + this.pageWidth / 2 - logoDim.width / 2;
        this.doc.addImage(
          logoDataUrl,
          "PNG",
          logoX,
          this.y,
          logoDim.width,
          logoDim.height
        );
        this.y += logoDim.height + 4;
      } catch (e) {
        console.error("Failed to add logo image.", e);
      }
    }

    this.doc
      .setFont("helvetica", "bold")
      .setFontSize(12)
      .setTextColor(STYLING.fontColorNormal);
    this.doc.text(COMPANY_NAME, this.margin + this.pageWidth / 2, this.y, {
      align: "center",
    });
    this.y += this.lineSpacing;
    this.doc
      .setFont("helvetica", "normal")
      .setFontSize(7)
      .setTextColor(STYLING.fontColorLight);
    this.doc.text("TAX INVOICE", this.margin + this.pageWidth / 2, this.y, {
      align: "center",
    });
    this.y += this.lineSpacing;
    this.doc.text(
      COMPANY_DETAILS.address,
      this.margin + this.pageWidth / 2,
      this.y,
      { align: "center" }
    );
    this.y += this.smallLineSpacing;
    this.doc.text(
      `GSTIN: ${COMPANY_DETAILS.GST_NO}`,
      this.margin + this.pageWidth / 2,
      this.y,
      { align: "center" }
    );
    this.y += this.lineSpacing;
    this.drawLine();
    this.y += this.lineSpacing;
  }

  drawBillDetails() {
    this.doc
      .setFont("helvetica", "normal")
      .setFontSize(8)
      .setTextColor(STYLING.fontColorNormal);
    const billDate = new Date(this.bill.timestamp).toLocaleString("en-GB", {
      dateStyle: "short",
      timeStyle: "short",
    });
    this.doc.text(
      `Bill #: ${String(this.bill.id).slice(-6)}`,
      this.margin,
      this.y
    );
    this.doc.text(
      `Table: ${this.bill.tableNo}`,
      this.margin + this.pageWidth,
      this.y,
      { align: "right" }
    );
    this.y += this.lineSpacing;
    this.doc.text(`Date: ${billDate}`, this.margin, this.y);
    this.y += this.lineSpacing;
    this.drawLine();
    this.y += this.smallLineSpacing;
  }

  drawItemsTable() {
    this.doc.setFont("helvetica", "bold").setFontSize(8);
    const itemX = this.margin;
    const qtyX = this.margin + 42;
    const rateX = this.margin + 55;
    const amountX = this.margin + this.pageWidth;
    this.doc.text("ITEM(S)", itemX, this.y);
    this.doc.text("QTY", qtyX, this.y);
    this.doc.text("RATE", rateX, this.y, { align: "right" });
    this.doc.text("AMOUNT", amountX, this.y, { align: "right" });
    this.y += this.smallLineSpacing;
    this.drawLine();
    this.y += this.lineSpacing;

    this.doc.setFont("helvetica", "normal").setFontSize(8);
    this.bill.items.forEach((cartItem) => {
      const rate = Number(cartItem.item.price);
      const amount = cartItem.quantity * rate;
      const itemLines = this.doc.splitTextToSize(cartItem.item.name, 38);

      this.doc.text(itemLines[0], itemX, this.y);
      this.doc.text(String(cartItem.quantity), qtyX + 1, this.y, {
        align: "center",
      });
      this.doc.text(rate.toFixed(2), rateX, this.y, { align: "right" });
      this.doc.text(amount.toFixed(2), amountX, this.y, { align: "right" });
      this.y += this.lineSpacing;

      if (itemLines.length > 1) {
        for (let i = 1; i < itemLines.length; i++) {
          this.doc.text(itemLines[i], itemX, this.y);
          this.y += this.smallLineSpacing;
        }
        this.y += this.lineSpacing - this.smallLineSpacing;
      }
    });
    this.drawLine();
    this.y += this.lineSpacing;
  }

  // ✅ This method has been completely rewritten for perfect alignment.
  drawTotals() {
    const drawTotalLine = (
      label: string,
      value: string,
      options: { isBold?: boolean; isLarge?: boolean } = {}
    ) => {
      const { isBold = false, isLarge = false } = options;
      this.doc
        .setFont("helvetica", isBold ? "bold" : "normal")
        .setFontSize(isLarge ? 9.5 : 8);

      // Position the labels in a "column" on the left side of the totals block
      const labelX = this.margin + 48;
      this.doc.text(label, labelX, this.y, { align: "right" });

      // Position the values perfectly aligned to the right edge of the page
      const valueX = this.margin + this.pageWidth;
      this.doc.text(value, valueX, this.y, { align: "right" });
      this.y += this.lineSpacing;
    };

    drawTotalLine("Subtotal", (this.bill.totalPrice ?? 0).toFixed(2));
    drawTotalLine("GST (18%)", (this.bill.gstAmount ?? 0).toFixed(2));
    this.y += this.smallLineSpacing / 2;
    this.drawLine();
    this.y += this.lineSpacing;

    // We construct the value string with "Rs. " for guaranteed compatibility and spacing.
    const grandTotalString = `Rs. ${(this.bill.grandTotal ?? 0).toFixed(2)}`;
    drawTotalLine("GRAND TOTAL", grandTotalString, {
      isBold: true,
      isLarge: true,
    });
  }

  drawFooter(qrCodeDataUrl: string) {
    // This logic remains the same, but we ensure the font is consistent.
    this.doc.setFont("helvetica", "normal");
    const grandTotalInWords = AmountInWords(this.bill.grandTotal ?? 0);
    if (grandTotalInWords) {
      this.doc.setFontSize(7);
      const words = `In Words: Rupees ${grandTotalInWords} Only`;
      const splitWords = this.doc.splitTextToSize(words, this.pageWidth);
      this.doc.text(splitWords, this.margin, this.y);
      this.y += splitWords.length * this.smallLineSpacing;
    }
    this.y += this.lineSpacing;
    this.drawLine();
    this.y += this.lineSpacing;

    const qrSize = 28;
    const qrX = this.margin + this.pageWidth / 2 - qrSize / 2;
    this.doc.addImage(qrCodeDataUrl, "PNG", qrX, this.y, qrSize, qrSize);
    this.doc.link(qrX, this.y, qrSize, qrSize, { url: window.location.href });
    this.y += qrSize + 3;

    this.doc
      .setFont("helvetica", "bold")
      .setFontSize(7)
      .setTextColor(STYLING.fontColorNormal);
    this.doc.textWithLink(
      "Click or Scan for Digital Bill",
      this.margin + this.pageWidth / 2,
      this.y,
      { align: "center", url: window.location.href }
    );
    this.y += this.lineSpacing * 2;

    this.doc.setFont("helvetica", "italic").setFontSize(8);
    this.doc.text(
      "Thank You & Visit Again!",
      this.margin + this.pageWidth / 2,
      this.y,
      { align: "center" }
    );
  }

  save() {
    this.doc.save(
      `Bill-${this.bill.tableNo}-${String(this.bill.id).slice(-6)}.pdf`
    );
  }
}
