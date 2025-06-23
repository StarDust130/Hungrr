// components/ClientOnlyCart.tsx
"use client";
import CartProvider from "@/components/menuComp/CartProvider";

export default function ClientOnlyCart({
  children,
}: {
  children: React.ReactNode;
}) {
  return <CartProvider>{children}</CartProvider>;
}
