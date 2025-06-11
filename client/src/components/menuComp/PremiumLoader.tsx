'use client';

import { useEffect, useState } from "react";
import { Atom, CheckCircle2 } from "lucide-react";
import confetti from "canvas-confetti";

const PremiumLoader = () => {
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    const duration = 5500;
    const animationEnd = Date.now() + duration;

    const premiumColors = [
      "#6b21a8",
      "#a855f7",
      "#c026d3",
      "#eab308",
      "#0ea5e9",
      "#059669",
    ];

    const interval = setInterval(() => {
      if (Date.now() > animationEnd) {
        clearInterval(interval);
        return;
      }

      // Left side burst
      confetti({
        particleCount: 7,
        startVelocity: 30,
        angle: 60,
        spread: 90,
        origin: { x: 0, y: 0.6 },
        gravity: 0.6,
        ticks: 120,
        scalar: 0.8,
        colors: premiumColors,
      });

      // Right side burst
      confetti({
        particleCount: 7,
        startVelocity: 30,
        angle: 120,
        spread: 90,
        origin: { x: 1, y: 0.6 },
        gravity: 0.6,
        ticks: 120,
        scalar: 0.8,
        colors: premiumColors,
      });
    }, 300);

    const timeout = setTimeout(() => {
      setConfirmed(true);
    }, 5500);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []);
  

  return (
    <main className="flex justify-center items-center h-[40vh]">
      <div className="flex flex-col items-center gap-4">
        {/* Atom Spinner always visible */}
        <div className="relative">
          <div className="absolute inset-0 rounded-full border-2 border-dashed border-muted-foreground animate-spin-slow" />
          <Atom className="h-8 w-8 animate-spin text-muted-foreground drop-shadow" />
        </div>

        {!confirmed ? (
          <p className="text-base font-medium text-muted-foreground tracking-wide">
            Loading Bill...
          </p>
        ) : (
          <div className="flex flex-col items-center gap-1 animate-fade-in text-center">
            <CheckCircle2 className="h-10 w-10 text-green-500 drop-shadow" />
            <p className="text-lg font-semibold text-muted-foreground">
              Order Confirmed!
            </p>
            <p className="text-sm text-muted-foreground">Generating your bill...</p>
            <span className="text-xs opacity-70">Thanks for shopping with us 🎉</span>
          </div>
        )}
      </div>
    </main>
  );
};

export default PremiumLoader;
