import { Skeleton } from "@/components/ui/skeleton";

const MenuItemCardSkeleton = () => (
  <div className="flex gap-4 animate-pulse">
    {/* Left Column - Text Section */}
    <div className="flex flex-col flex-grow gap-2">
      {/* Dietary & Bestseller badges */}
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-4 rounded-full" />
        <Skeleton className="h-4 w-20 rounded" />
      </div>

      {/* Dish name */}
      <Skeleton className="h-5 w-3/4 rounded" />

      {/* Tags row */}
      <div className="flex gap-2 flex-wrap">
        <Skeleton className="h-5 w-16 rounded-full" />
        <Skeleton className="h-5 w-14 rounded-full" />
        <Skeleton className="h-5 w-20 rounded-full" />
      </div>

      {/* Description lines */}
      <Skeleton className="h-4 w-full rounded" />
      <Skeleton className="h-4 w-5/6 rounded" />

      {/* Price */}
      <Skeleton className="h-5 w-16 mt-2 rounded" />
    </div>

    {/* Right Column - Image & Button */}
    <div className="flex flex-col items-end justify-between w-32">
      <Skeleton className="w-full aspect-[4/3] rounded-lg" />
      <Skeleton className="w-20 h-8 mt-2 rounded-md" />
    </div>
  </div>
);

export default MenuItemCardSkeleton;
