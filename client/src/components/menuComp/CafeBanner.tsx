// components/menuComp/CafeBanner.tsx
import Image from "next/image";
import { Star, Clock } from "lucide-react";

interface Cafe {
  name: string;
  tagline: string;
  bannerUrl: string;
  rating: number;
  reviews: number;
  openingTime: string;
}

const CafeBanner = ({ cafe }: { cafe: Cafe }) => (
  <div className="relative w-full h-60 md:h-80 rounded-b-3xl overflow-hidden">
    <Image
      src={cafe.bannerUrl || "/placeholder.jpg"}
      alt="Cafe Banner"
      fill
      className="object-cover object-center"
    />

    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent px-4 py-6 flex flex-col justify-end">
      <h1 className="text-white text-3xl md:text-5xl font-bold tracking-tight">
        {cafe.name}
      </h1>
      <p className="text-white/80 text-sm md:text-base font-bold mt-1">
        {cafe.tagline}
      </p>
      <div className="flex flex-wrap items-center gap-4 mt-3 text-white text-sm font-bold">
        <div className="flex items-center gap-1.5">
          <Star size={16} className="text-amber-400 fill-amber-400" />
          <span>{cafe.rating}</span>
          <span className="text-white/70">{cafe.reviews} reviews</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock size={16} className="text-white/70" />
          <span>Opens at {cafe.openingTime}</span>
        </div>
      </div>
    </div>
  </div>
);

export default CafeBanner;
