import Image from "next/image";
import { Button } from "../ui/button";
import { ArrowRight, Check } from "lucide-react";

const Hero = () => {
  return (
    <section className="pt-24 pb-16 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left content */}
          <div className="max-w-full lg:max-w-[50vw] mx-auto lg:mx-0 px-4 sm:px-0 text-center lg:text-left space-y-8">
            <div className="inline-flex items-center rounded-full px-5 py-2 border border-gray-300 max-w-max mx-auto lg:mx-0">
              <div className="w-2.5 h-2.5 bg-green-500 rounded-full mr-3"></div>
              <span className="text-sm font-medium">
                Now serving 500+ cafes
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight">
              Modern cafe
              <br />
              <span>ordering</span>
            </h1>

            <p className="text-lg sm:text-xl max-w-md mx-auto lg:mx-0 leading-relaxed">
              Transform your cafe with seamless QR code ordering. Customers
              scan, browse your menu, and order directly from their phone.
            </p>

            <div className="flex flex-col sm:flex-row gap-5 max-w-md mx-auto lg:mx-0 justify-center lg:justify-start">
              <Button
                size={"lg"}
                className="flex items-center gap-3 px-8 transition-transform hover:scale-[1.07] active:scale-95"
              >
                Start free trial
                <ArrowRight className="w-5 h-5" />
              </Button>
              <Button
                size={"lg"}
                variant={"outline"}
                className="px-8 transition-transform hover:scale-[1.07] active:scale-95"
              >
                See demo
              </Button>
            </div>

            <div className="flex flex-row items-center gap-8 max-w-md mx-auto lg:mx-0 justify-center lg:justify-start text-sm">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                <span>Setup in 5 minutes</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                <span>No monthly fees</span>
              </div>
            </div>
          </div>

          {/* Right side with big anime girl */}
          <div className="relative w-full max-w-lg mx-auto lg:mx-0 h-84 sm:h-80 md:h-[450px] lg:h-[600px]">
            <Image
              src="/anime-girl.png"
              alt="Anime Girl"
              fill
              className="object-contain rounded-3xl"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
