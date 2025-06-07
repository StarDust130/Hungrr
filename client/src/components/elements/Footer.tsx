import Image from "next/image";
import Link from "next/link";

const Footer = () => (
  <footer className="w-full py-12 px-6 border-t border-border bg-background/90 backdrop-blur-sm rounded-t-2xl">
    <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
      {/* Logo and Brand */}
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-full overflow-hidden shadow-md bg-white/20">
          <Image
            src="/icon.png"
            alt="Hungrr Logo"
            width={40}
            height={40}
            className="object-contain"
            priority
          />
        </div>
        <span className="text-xl font-bold tracking-tight select-none text-primary">
          Hungrr
        </span>
      </div>

      {/* Copyright and Links */}
      <div className="flex flex-col sm:flex-row items-center gap-4 text-sm text-muted-foreground">
        <span className="select-none">
          © 2025{" "}🌟
          <Link
            href="https://chandrashekhar.life"
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold hover:underline"
          >
            Chandrashekhar
          </Link>
          . All rights reserved.
        </span>
        <nav className="flex gap-6">
          <Link
            href="#"
            className="hover:text-primary transition-colors"
            aria-label="Privacy Policy"
          >
            Privacy
          </Link>
          <Link
            href="#"
            className="hover:text-primary transition-colors"
            aria-label="Terms of Service"
          >
            Terms
          </Link>
          <Link
            href="#"
            className="hover:text-primary transition-colors"
            aria-label="Support"
          >
            Support
          </Link>
        </nav>
      </div>
    </div>
  </footer>
);

export default Footer;
