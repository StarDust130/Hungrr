"use client";

import { useEffect, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import confetti from "canvas-confetti";

const PremiumLoader = () => {
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    const duration = 5500;
    const animationEnd = Date.now() + duration;

    const colors = [
      "#a855f7", // violet
      "#22d3ee", // cyan
      "#facc15", // yellow
      "#4ade80", // green
      "#f43f5e", // pink-red
      "#f97316", // orange
    ];

    const shoot = () => {
      confetti({
        particleCount: 20,
        startVelocity: 40,
        angle: 60,
        spread: 160,
        origin: { x: 0, y: 0.1 },
        gravity: 0.5,
        scalar: 0.9, // Smaller size
        ticks: 200,
        colors,
      });

      confetti({
        particleCount: 20,
        startVelocity: 40,
        angle: 120,
        spread: 160,
        origin: { x: 1, y: 0.1 },
        gravity: 0.5,
        scalar: 0.9,
        ticks: 200,
        colors,
      });
    };

    const interval = setInterval(() => {
      if (Date.now() > animationEnd) {
        clearInterval(interval);
        return;
      }
      shoot();
    }, 300);

    const timeout = setTimeout(() => {
      setConfirmed(true);
    }, duration);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []);

  return (
    <main className="flex justify-center items-center h-[30vh] md:h-[60vh] px-4">
      <div className="flex flex-col items-center gap-6 text-center">
        {/* Clean professional spinner */}
        {!confirmed && (
          <>
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-base font-medium text-gray-500 tracking-wide">
              Loading your bill...
            </p>
            <p className="text-sm text-gray-400">
              Hang tight! We’re preparing your receipt 🧾
            </p>
          </>
        )}

        {confirmed && (
          <div className="flex flex-col items-center gap-1 animate-fade-in text-center">
            <CheckCircle2 className="h-10 w-10 text-green-500 drop-shadow" />
            <p className="text-lg font-semibold text-blue-700">
              Order Confirmed!
            </p>
            <p className="text-sm text-gray-600">
              Your bill is being generated securely.
            </p>
            <p className="text-xs text-gray-400 italic">
              🎉 Thanks for shopping with us!
            </p>
            <p className="text-xs text-muted">
              You’ll receive a copy shortly via email or download.
            </p>
          </div>
        )}
      </div>
    </main>
  );
};

export default PremiumLoader;
