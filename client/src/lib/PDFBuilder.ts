import jsPDF from "jspdf";
import { BillData } from "@/types/menu";
import { DateFormat } from "./helper";

const STYLING = {
  fontColorNormal: "#1f2937",
  fontColorLight: "#6b7280",
};

/**
 * A robust class for building the bill PDF document, designed for professional results.
 * Note: Assumes `BillData` type includes an `orderType` property.
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
        const logoDim = { width: 20, height: 20 };
        const logoX = this.margin + this.pageWidth / 2 - logoDim.width / 2;
        this.doc.addImage(
          logoDataUrl,
          "PNG",
          logoX,
          this.y,
          logoDim.width,
          logoDim.height
        );
        this.y += logoDim.height + 1;
      } catch (e) {
        console.error("Failed to add logo image.", e);
      }
    }

    this.doc
      .setFont("helvetica", "bold")
      .setFontSize(12)
      .setTextColor(STYLING.fontColorNormal);
    this.doc.text(
      this.bill.cafeName!,
      this.margin + this.pageWidth / 2,
      this.y,
      {
        align: "center",
      }
    );
    this.y += this.lineSpacing;

    this.doc
      .setFont("helvetica", "normal")
      .setFontSize(7)
      .setTextColor(STYLING.fontColorLight);

    const addressLines = this.doc.splitTextToSize(
      this.bill.address!,
      this.pageWidth
    );

    this.doc.text(addressLines, this.margin + this.pageWidth / 2, this.y, {
      align: "center",
    });
    this.y += addressLines.length * this.smallLineSpacing;

    this.doc.text(
      `GSTIN: ${this.bill.gstNo || "N/A"}`,
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
    this.doc.text(
      `Order: ${this.bill.orderType}`,
      this.margin + this.pageWidth,
      this.y,
      { align: "right" }
    );
    this.y += this.lineSpacing;

    this.drawLine();
    this.y += this.smallLineSpacing;
  }

  drawItemsTable() {
    this.doc.setFont("helvetica", "bold").setFontSize(8);
    const itemX = this.margin;
    const qtyX = this.margin + 38;
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

      const labelX = this.margin + 48;
      this.doc.text(label, labelX, this.y, { align: "right" });

      const valueX = this.margin + this.pageWidth;
      this.doc.text(value, valueX, this.y, { align: "right" });
    };

    const grandTotalString = `Rs. ${(this.bill.totalPrice ?? 0).toFixed(2)}`;
    drawTotalLine("GRAND TOTAL", grandTotalString, {
      isBold: true,
      isLarge: true,
    });

    this.doc
      .setFont("helvetica", "italic")
      .setFontSize(6)
      .setTextColor(STYLING.fontColorLight);
    this.doc.text(
      "(incl. of all taxes)",
      this.margin + this.pageWidth,
      this.y + 2,
      { align: "right" }
    );
    this.y += this.lineSpacing;
  }

  // ✅ UPDATED: Final, robust footer logic to permanently fix overlapping text.
  drawFooter(qrCodeDataUrl: string) {
    // This part flows naturally after the totals
    this.y += this.lineSpacing;

    const qrSize = 22;
    const qrX = this.margin + this.pageWidth / 2 - qrSize / 2;
    if (qrCodeDataUrl) {
      this.doc.addImage(qrCodeDataUrl, "PNG", qrX, this.y, qrSize, qrSize);
      this.doc.link(qrX, this.y, qrSize, qrSize, { url: window.location.href });
      this.y += qrSize + 3;
    }

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
    this.y += this.lineSpacing;

    this.doc.setFont("helvetica", "normal").setFontSize(7);
    this.doc.text(
      "Thank You & Visit Again!",
      this.margin + this.pageWidth / 2,
      this.y,
      { align: "center" }
    );

    // --- Absolute Bottom Footer ---
    const pageHeight = this.doc.internal.pageSize.getHeight();
    let currentFooterY = pageHeight - 4;

    // 1. Draw "Terms & Conditions"
    this.doc
      .setFont("helvetica", "italic")
      .setFontSize(5)
      .setTextColor(STYLING.fontColorLight);
    this.doc.text(
      "T&Cs apply",
      this.margin + this.pageWidth / 2,
      currentFooterY,
      { align: "center" }
    );

    // 2. Move up for the "Powered by" line
    currentFooterY -= this.smallLineSpacing;

    // ✨ FIX: This new logic correctly measures and places the styled text.
    const part1 = "Powered by ";
    const part2 = "Hungrr";

    // Measure widths with the correct styles applied
    this.doc.setFont("helvetica", "italic").setFontSize(7);
    const part1Width = this.doc.getTextWidth(part1);
    this.doc.setFont("helvetica", "bold").setFontSize(7.5);
    const part2Width = this.doc.getTextWidth(part2);

    const totalWidth = part1Width + part2Width;
    let currentX = this.margin + (this.pageWidth - totalWidth) / 2;

    // Draw part 1 with its style
    this.doc
      .setFont("helvetica", "italic")
      .setFontSize(7)
      .setTextColor(STYLING.fontColorLight);
    this.doc.text(part1, currentX, currentFooterY);

    // Move X position for the next part
    currentX += part1Width;

    // Draw part 2 with its style
    this.doc
      .setFont("helvetica", "bold")
      .setFontSize(7.5)
      .setTextColor(STYLING.fontColorNormal);
    this.doc.text(part2, currentX, currentFooterY);

    // Add a single link over the whole phrase
    const linkStartX = this.margin + (this.pageWidth - totalWidth) / 2;
    const textHeight = 2;
    this.doc.link(
      linkStartX,
      currentFooterY - textHeight,
      totalWidth,
      textHeight + 1,
      { url: "https://hungrr.in" }
    );

    // 3. Move up for the separator line
    currentFooterY -= 3;
    this.doc.setLineDashPattern([0.5, 0.5], 0);
    this.doc.setDrawColor(STYLING.fontColorLight);
    this.doc.line(
      this.margin,
      currentFooterY,
      this.margin + this.pageWidth,
      currentFooterY
    );
    this.doc.setLineDashPattern([], 0);
  }

  save() {
    this.doc.save(
      `${this.bill.cafeName} Bill ${DateFormat(
        new Date().toLocaleDateString()
      )}.pdf`
    );
  }
}
