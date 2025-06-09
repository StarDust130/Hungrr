import Image from "next/image";
import Link from "next/link";

const Footer = () => (
  <footer className="w-full py-8 px-6 border-t border-border">
    <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center md:justify-between gap-6">
      {/* Logo */}
      <Link href="/" className="flex items-center space-x-3">
        <div className="w-12 h-12 rounded-full overflow-hidden shadow-md bg-white/10 dark:bg-black/20">
          <Image
            src="/icon.png"
            alt="Hungrr Logo"
            width={48}
            height={48}
            className="object-contain rounded-full border"
            priority
          />
        </div>
      </Link>

      {/* Links and copyright */}
      <div className="flex flex-col sm:flex-row items-center gap-6 text-sm text-muted-foreground text-center md:text-left md:flex-1 md:justify-end md:gap-12">
        <span className="whitespace-nowrap">
          © {new Date().getFullYear()} 🌟{" "}
          <Link
            href="https://chandrashekhar.life"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold hover:underline text-primary"
          >
            Chandrashekhar
          </Link>
          . All rights reserved.
        </span>

        <nav className="flex gap-6 whitespace-nowrap">
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

        <span className="font-medium select-none whitespace-nowrap md:hidden">
          🇮🇳 Made with ❤️ in India
        </span>
      </div>
    </div>
  </footer>
);

export default Footer;
