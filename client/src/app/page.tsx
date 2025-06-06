
// components/Home.tsx
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button"; // if using Shadcn UI, else replace with <button>

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-12">
      {/* Hero Section */}
      <section className="w-full max-w-2xl text-center">
        <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4 font-serif">
          Welcome to <span className="text-[#e63946]">Hungrr</span>
        </h1>
        <p className="text-lg md:text-xl text-gray-600 mb-8 font-light">
          Scan. Order. Relax. 🍽️ <br />A seamless café experience at your
          fingertips.
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link href="/sign-in">
            <Button className="px-6 py-3 bg-black text-white rounded-full shadow hover:bg-gray-900">
              Sign In
            </Button>
          </Link>
          <Link href="#scan">
            <Button
              variant="outline"
              className="px-6 py-3 border-black rounded-full hover:bg-gray-100"
            >
              Scan QR ➡️
            </Button>
          </Link>
        </div>
      </section>

      {/* Image or Illustration */}
      <section className="mt-10 w-full max-w-sm">
        <Image
          src="/icon.png" // Replace with your image (keep it under /public)
          alt="Scan QR demo"
          width={500}
          height={500}
          className="w-full rounded-2xl shadow-lg"
        />
      </section>

      {/* Tagline */}
      <p className="mt-10 text-sm text-gray-400">
        Built with 💖 by Chandrashekhar — GenZ café tech ☕
      </p>
    </main>
  );
}
