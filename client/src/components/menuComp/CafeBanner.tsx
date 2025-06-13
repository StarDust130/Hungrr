import Image from "next/image";
import { cafeInfo } from "@/lib/data";
import { Star, Clock } from "lucide-react";

const CafeBanner = () => (
  <div className="relative w-full h-60 md:h-80 rounded-b-3xl overflow-hidden">
    {/* Bright and clean banner image */}
    <Image
      src={cafeInfo.bannerUrl}
      alt="Cafe Banner"
      layout="fill"
      objectFit="cover"
      className="object-center"
    />

    {/* Only bottom gradient to support text readability */}
    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent px-4 py-6 flex flex-col justify-end">
      {/* Cafe Name */}
      <h1 className="text-white text-3xl md:text-5xl font-bold tracking-tight">
        {cafeInfo.name}
      </h1>

      {/* Tagline */}
      <p className="text-white/80 text-sm md:text-base font-bold mt-1">
        {cafeInfo.tagline}
      </p>

      {/* Ratings + Time */}
      <div className="flex flex-wrap items-center gap-4 mt-3 text-white text-sm font-bold">
        <div className="flex items-center gap-1.5">
          <Star size={16} className="text-amber-400 fill-amber-400" />
          <span>{cafeInfo.rating}</span>
          <span className="text-white/70">({cafeInfo.reviews} reviews)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock size={16} className="text-white/70" />
          <span>Opens at {cafeInfo.openingTime}</span>
        </div>
      </div>
    </div>
  </div>
);

export default CafeBanner;
