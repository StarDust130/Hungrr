
import Image from "next/image";
import {cafeInfo} from "@/lib/data";
import { Star, Clock } from "lucide-react";

const CafeBanner = () => (
  <div className="relative h-56 md:h-64 w-full">
    <Image
      src={cafeInfo.bannerUrl}
      alt="Cafe Banner"
      layout="fill"
      objectFit="cover"
      className="brightness-50"
    />
    <div className="absolute inset-0 flex flex-col justify-end p-4 md:p-6 bg-gradient-to-t from-black/70 to-transparent">
      <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
        {cafeInfo.name}
      </h1>
      <p className="text-white/90 mt-1 text-sm md:text-base">
        {cafeInfo.tagline}
      </p>
      <div className="flex items-center gap-4 mt-3 text-sm text-white">
        <div className="flex items-center gap-1.5">
          <Star size={16} className="text-amber-400 fill-amber-400" />
          <span className="font-bold">{cafeInfo.rating}</span>
          <span className="text-white/70">({cafeInfo.reviews} reviews)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock size={16} className="text-white/70" />
          <span className="font-medium">Open from {cafeInfo.openingTime}</span>
        </div>
      </div>
    </div>
  </div>
);



export default CafeBanner;