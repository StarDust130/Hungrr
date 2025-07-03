import Image from "next/image";
import { Clock } from "lucide-react";
import DietaryIcon from "./DietaryIcon";
import { log } from "@/lib/helper";
import Link from "next/link";

interface Cafe {
  name: string;
  tagline: string;
  bannerUrl: string;
  rating: number;
  openingTime: string;
  instaID?: string;
  isPureVeg?: boolean;
}

const CafeBanner = ({ cafe }: { cafe: Cafe }) => (
  log("CafeBanner", cafe),
  (
    <div className="relative w-full h-60 md:h-80 rounded-b-md overflow-hidden">
      {/* Banner Image */}
      {cafe.bannerUrl && (
        <Image
          src={cafe.bannerUrl}
          alt={`${cafe.name} banner`}
          fill
          className="object-cover object-center"
          priority
        />
      )}

      {/* Gradient Overlay for Contrast */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

      {/* Text Content */}
      <div className="absolute bottom-0 w-full px-5 py-6 flex flex-col gap-1 z-10">
        <h1 className="text-white text-2xl sm:text-3xl font-bold leading-snug tracking-tight">
          {cafe.name}
        </h1>
        <p className="text-white/90 text-sm sm:text-base font-medium leading-tight">
          {cafe.tagline}
        </p>

        <div className="flex flex-wrap items-center gap-4 mt-3 text-white text-xs sm:text-sm font-medium">
          {/* Pure Veg */}
          {cafe.isPureVeg && (
            <div className="flex items-center gap-1.5">
              <DietaryIcon type="veg" />
              <span className="text-white/90">Pure Veg</span>
            </div>
          )}

          {/* Opening Time */}
          {cafe.openingTime && (
            <div className="flex items-center gap-1.5">
              <Clock size={16} className="text-white/70" />
              <span>{cafe.openingTime}</span>
            </div>
          )}

          {/* Instagram */}
          {cafe.instaID && (
            <div className="flex items-center gap-1.5">
              <Image
                width="48"
                height="48"
                src="/instagram-new.png"
                alt="instagram-new"
                className="w-4 h-4"
              />
              <Link
                href={`https://instagram.com/${cafe.instaID}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline hover:text-white/90"
              >
                Follow us @{cafe.instaID}
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
);

export default CafeBanner;
