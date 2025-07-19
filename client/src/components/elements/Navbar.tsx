"use client";

import Image from "next/image";
import Link from "next/link";
import { ModeToggle } from "../ui/ModeToggle"; // Make sure this path is correct
import { useCafe } from "@/context/CafeContext"; // Using context to get cafe info

export default function Navbar() {
  const { cafeInfo } = useCafe();

  // Set default/fallback values for when not on a cafe-specific page
  const logoUrl = cafeInfo?.logoUrl || "/icon.png";
  const name = cafeInfo?.name || "";
  const link = cafeInfo ? `/menu/${cafeInfo.slug}` : "/";

  return (
    <nav className="backdrop-blur-lg border-b border-border bg-background/80 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5">
        <div className="flex items-center justify-between">
          {/* Logo and Cafe Name */}
          <Link
            href={link}
            className="flex items-center space-x-3 group transition-opacity hover:opacity-80"
          >
            {/* Robust Circular Logo Container */}
            <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden border-2 border-transparent group-hover:border-primary transition-all duration-300 group-hover:shadow-lg group-hover:shadow-primary/30">
              <Image
                src={logoUrl}
                alt={`${name} Logo`}
                layout="fill"
                objectFit="cover"
              />
            </div>
            {name && (
              // Premium Gradient Text for Branding
              <p className="text-base sm:text-xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent truncate">
                {name}
              </p>
            )}
          </Link>

          {/* Right Controls */}
          <div className="flex items-center space-x-3">
            <ModeToggle />
          </div>
        </div>
      </div>
    </nav>
  );
}
