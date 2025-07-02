import AddToCartButton from "./AddToCartButton";
import SafeImage from "../elements/SafeImage";
import { MenuItem } from "@/types/menu";
import { Sparkles } from "lucide-react";
import TagBadge from "./TagBadge";

const SpecialCard = ({ item }: { item: MenuItem }) => {
  return (
    <div className="relative w-44 md:w-52 rounded-2xl border border-zinc-300/20 dark:border-white/10 transition-all duration-300 hover:scale-[1.03] hover:shadow-xl overflow-hidden flex flex-col">
      {/* Must Try Badge */}
      {item.isSpecial && (
        <div className="absolute top-2 left-2  flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold uppercase rounded-full border border-yellow-400 text-yellow-800 bg-yellow-100 dark:text-yellow-200 dark:bg-yellow-800/30 backdrop-blur">
          <Sparkles className="w-3 h-3" />
          Must Try
        </div>
      )}

      {/* Image */}
      <div className="w-full h-36 md:h-32 overflow-hidden rounded-t-2xl">
        <SafeImage
          src={item.food_image_url ?? ""}
          alt={item.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>

      {/* Content */}
      <div className="flex flex-col justify-between px-3 pt-3 pb-4 flex-1">
        <div className="space-y-1">
          <h3 className="text-[15px] leading-tight font-semibold text-foreground truncate">
            {item.name}
          </h3>
          <p className="text-sm font-medium text-muted-foreground">
            ₹{item.price}
          </p>

          {/* Tag */}
          {item.tags && (
            <div className="pt-1">
              <TagBadge tag={item.tags} />
            </div>
          )}
        </div>

        {/* Add to Cart */}
        <div className="mt-3">
          <AddToCartButton item={item} className="w-full text-sm" />
        </div>
      </div>
    </div>
  );
};

export default SpecialCard;
