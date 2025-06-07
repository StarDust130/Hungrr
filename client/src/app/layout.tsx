import type { Metadata } from "next";
import { Caudex, Roboto } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider"
import { ClerkProvider } from "@clerk/nextjs";
import Navbar from "@/components/elements/Navbar";
import Footer from "@/components/elements/Footer";

// Serif for headings
const caudex = Caudex({
  variable: "--font-caudex",
  subsets: ["latin"],
  weight: ["400", "700"],
});

// Sans-serif for body
const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "Hungrr",
  description:
    "QR-based cafe ordering system for fast, seamless dining experiences. Scan, order, relax.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={`${caudex.variable} ${roboto.variable} antialiased`}>
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <Navbar />
          {children}
          <Footer />
        </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
