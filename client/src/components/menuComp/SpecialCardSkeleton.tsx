import { Skeleton } from "@/components/ui/skeleton";
import { Sparkles } from "lucide-react";

const SpecialCardSkeleton = () => (
  <div className="relative flex-shrink-0 w-44 md:w-52 rounded-2xl border dark:border-zinc-200/20 backdrop-blur-xl overflow-hidden">
    {/* Must Try badge */}
    <div className="absolute top-2 left-2 bg-gradient-to-br from-[#ffe8a0] to-[#fcd253] text-[#5b4510] text-[8px] px-2 py-1 rounded-full font-bold border border-[#fcd253] flex items-center gap-1 shadow z-10 tracking-wider uppercase">
      <Sparkles className="w-3 h-3" />
      Must Try
    </div>

    {/* Image placeholder */}
    <Skeleton className="w-full h-40 md:h-32 rounded-t-2xl" />

    {/* Content */}
    <div className="p-3 space-y-1">
      <Skeleton className="h-4 w-3/4 rounded" /> {/* Title */}
      <Skeleton className="h-3 w-1/2 rounded" /> {/* Price */}
      <Skeleton className="h-9 w-full rounded-md mt-2" /> {/* Add to Cart */}
    </div>
  </div>
);

export default SpecialCardSkeleton;
