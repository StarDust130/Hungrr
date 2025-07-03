
import { PDFBuilder } from "@/lib/PDFBuilder";
import { BillData } from "@/types/menu";
import QRCode from "qrcode";

// Helper function to fetch an image and convert it to a Base64 Data URL
const getImageAsDataUrl = (url: string): Promise<string> => {
  // This check ensures the function only runs in the browser
  if (typeof window === "undefined") return Promise.resolve("");

  return fetch(url)
    .then((response) => response.blob())
    .then(
      (blob) =>
        new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        })
    );
};

/**
 * The main orchestrator function to generate the PDF.
 */
const generatePdf = async ({ bill }: { bill: BillData }) => {
  const CAFE_LOGO_URL = bill.logoUrl;
  try {
    // 1. Prepare async data (QR Code and Logo Data URL)
    const qrCodeDataUrl = await QRCode.toDataURL(window.location.href, {
      width: 256,
      margin: 1,
      errorCorrectionLevel: "H",
    });

    let logoDataUrl: string | undefined;
    if (CAFE_LOGO_URL) {
      try {
        logoDataUrl = await getImageAsDataUrl(CAFE_LOGO_URL);
      } catch (e) {
        console.error("Could not fetch logo, skipping.", e);
      }
    }

    // 2. Use the builder to construct the PDF step-by-step
    const builder = new PDFBuilder(bill);
    builder.drawHeader(logoDataUrl);
    builder.drawBillDetails();
    builder.drawItemsTable();
    builder.drawTotals();
    builder.drawFooter(qrCodeDataUrl);

    // 3. Save the final document
    builder.save();
  } catch (error) {
    console.error("A critical error occurred while generating the PDF:", error);
    alert("Sorry, there was an error creating your bill PDF.");
  }
};

export default generatePdf;
