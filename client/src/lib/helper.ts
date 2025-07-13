/* eslint-disable @typescript-eslint/no-explicit-any */
// utils/log.ts
export const log = (...args: any[]) => {
  // if (process.env.NODE_ENV === "development") {
    console.log(...args);
  // }
};


export const formatPrice = (price: number | string): string => {
  const priceNumber = typeof price === "string" ? parseFloat(price) : price;
  return `₹${priceNumber.toFixed(2)}`;
}


export const gstCalculation = (amount: number, rate: number = 0.18): number => {
  return parseFloat((amount * rate).toFixed(2));
}

export const Capitalize = (str: string): string => {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export function DateFormat(
  date: string | Date,
  format: "full" | "date" | "time" = "full"
) {
  const d = new Date(date);
  const options: Intl.DateTimeFormatOptions =
    format === "date"
      ? { year: "numeric", month: "short", day: "numeric" }
      : format === "time"
      ? { hour: "2-digit", minute: "2-digit" }
      : {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        };
  return d.toLocaleString("en-IN", options);
}

export const GST_CALCULATION = (
  amount: number
): { gstAmount: number; grandTotal: number } => {
  const gstPercentage = 6; // Fixed at 6%
  const rate = gstPercentage / 100;
  const gstAmount = Math.round(amount * rate);
  const grandTotal = Math.round(amount + gstAmount);
  return { gstAmount, grandTotal };
};
