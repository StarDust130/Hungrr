"use client";

import { useEffect, useState } from "react";
import { ChevronsUp } from "lucide-react";

const BackToTopButton = () => {
  const [show, setShow] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScroll = window.scrollY;
      const isScrollingUp = currentScroll < lastScrollY;
      const isFarDown = currentScroll > window.innerHeight * 0.8;

      setShow(isScrollingUp && isFarDown);
      setLastScrollY(currentScroll);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (!show) return null;

  return (
    <button
      onClick={scrollToTop}
      className="fixed top-18 left-1/2 -translate-x-1/2 z-50 font-bold flex items-center gap-2 px-4 py-1.5  
        text-foreground bg-card backdrop-blur-md border border-border rounded-full shadow-md transition-all text-[10px]"
    >
      <ChevronsUp className="w-3 h-3 text-primary font-bold " />
      Back to top
    </button>
  );
};

export default BackToTopButton;
