"use client";

import Image from "next/image";
import { Button } from "../ui/button";
import { ArrowRight, Check } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

const Hero = () => {
  return (
    <section className="pt-10 pb-20 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left side content (Text only) */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center lg:text-left px-4 sm:px-0 space-y-6 lg:space-y-10"
          >

            {/* Main Heading */}
            <div>
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold leading-tight">
                Modern cafe
                <br />
                <span className="text-transparent text-2xl sm:text-5xl lg:text-6xl bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600">
                  ordering experience
                </span>
              </h1>
              <p className="mt-4 text-xs text-muted-foreground max-w-md mx-auto lg:mx-0 leading-relaxed">
                Transform your cafe with seamless QR ordering. Let customers
                scan, browse, and order – effortlessly.
              </p>
            </div>

            {/* Mobile image below heading */}
            {/* Mobile image below heading */}
            <div className="relative w-full block md:hidden max-w-sm mx-auto h-[300px] sm:h-[400px]">
              <Image
                src="/anime-girl.png"
                alt="Anime Girl"
                fill
                className="object-contain rounded-3xl"
                priority
              />
            </div>

            {/* CTA Buttons */}
            <div className="flex w-full flex-col sm:flex-row gap-4 sm:gap-5 mx-auto lg:mx-0 justify-center lg:justify-start">
              <Button
                size="lg"
                className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 transition-transform hover:scale-[1.07] active:scale-95"
              >
                <Link href="/menu/123">Start free trial</Link>
                <ArrowRight className="w-5 h-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto px-8 transition-transform hover:scale-[1.07] active:scale-95"
              >
                See demo
              </Button>
            </div>

            {/* Features */}
            <div className="flex items-center text-[12px] md:text-[16px] gap-6 text-sm mx-auto lg:mx-0 justify-center lg:justify-start whitespace-nowrap overflow-x-auto">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                <span>Setup in 5 minutes</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                <span>No monthly fees</span>
              </div>
            </div>
          </motion.div>

          {/* Image on right in desktop */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, x: 50 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="relative w-full hidden md:block max-w-lg mx-auto md:h-[450px] lg:h-[600px]"
          >
            <Image
              src="/anime-girl.png"
              alt="Anime Girl"
              fill
              className="object-contain rounded-3xl"
              priority
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
