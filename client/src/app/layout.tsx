import type { Metadata } from "next";
import { Caudex, Roboto } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider"
import Footer from "@/components/elements/Footer";
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next";
import Navbar from "@/components/elements/Navbar";
import { CafeProvider } from "@/context/CafeContext";

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
    <html lang="en" suppressHydrationWarning>
      <body className={`${caudex.variable} ${roboto.variable} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <main className="flex min-h-screen flex-col w-full max-w-3xl mx-auto rounded-2xl md:border md:border-gray-500 md:border-dotted">
            <CafeProvider>
              {/* ✅ Render the Navbar here so it appears on all pages */}
              <Navbar />
              {children}
            <Analytics />
            <SpeedInsights />
            <Footer />
            </CafeProvider>
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
