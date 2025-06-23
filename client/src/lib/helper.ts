/* eslint-disable @typescript-eslint/no-explicit-any */
// utils/log.ts
export const log = (...args: any[]) => {
  if (process.env.NODE_ENV === "development") {
    console.log(...args);
  }
};


export const formatPrice = (price: number | string): string => {
  const priceNumber = typeof price === "string" ? parseFloat(price) : price;
  return `₹${priceNumber.toFixed(2)}`;
}


export const gstCalculation = (amount: number, rate: number = 0.18): number => {
  return parseFloat((amount * rate).toFixed(2));
}

export const Capitilize = (str: string): string => {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}