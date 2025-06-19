"use client";
import Image from "next/image";
import { ModeToggle } from "../ui/ModeToggle";
import { useState, useEffect } from "react";
import { Menu,  X } from "lucide-react";
import Link from "next/link";


const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) setIsMenuOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <nav className=" top-0 left-0 right-0 z-50 backdrop-blur-md border-b border-border bg-background/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href={`/`} className="flex items-center space-x-3">
            <Image
              src="/icon.png"
              alt="Logo"
              width={40}
              height={32}
              className="rounded-full border"
            />
          </Link>

          {/* Center Nav (Desktop only) */}
          <div className="hidden md:flex flex-1 justify-center items-center space-x-8 text-sm font-medium">
            {["features", "how-it-works", "pricing"].map((section) => (
              <Link
                key={section}
                href={`#${section}`}
                className="hover:text-primary hover:underline underline-offset-4 transition-all"
              >
                {section
                  .split("-")
                  .map((word) => word[0].toUpperCase() + word.slice(1))
                  .join(" ")}
              </Link>
            ))}
          </div>

          {/* Right Controls */}
          <div className="flex items-center space-x-3">
            <ModeToggle />

          

          

            {/* Hamburger menu for mobile */}
            <button
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 border-t border-border pt-4 space-y-4 animate-in fade-in duration-200 text-sm">
            {["features", "how-it-works", "pricing"].map((section) => (
              <Link
                key={section}
                href={`#${section}`}
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="block hover:text-primary transition-colors"
              >
                {section
                  .split("-")
                  .map((word) => word[0].toUpperCase() + word.slice(1))
                  .join(" ")}
              </Link>
            ))}
            
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
