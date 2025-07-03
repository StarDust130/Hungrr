import AddToCartButton from "./AddToCartButton";
import SafeImage from "../elements/SafeImage";
import { MenuItem } from "@/types/menu";
import { Sparkles } from "lucide-react";
import DietaryIcon from "./DietaryIcon";
import DescriptionToggle from "./checkoutComp/DescriptionToggle";

const SpecialCard = ({ item }: { item: MenuItem }) => {
  return (
    <div className="relative w-52 rounded-2xl border border-zinc-300/20 dark:border-white/10 transition-all duration-300 hover:scale-[1.03] hover:shadow-xl overflow-hidden flex flex-col">
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

      {/* Content (40%) */}
      <div className="flex flex-col justify-between px-3 pt-3 pb-4 flex-1">
        <div className="space-y-0.5">
          <h3 className="text-base sm:text-lg font-semibold text-foreground flex items-center gap-2">
            {item.dietary && <DietaryIcon type={item.dietary} />} {item.name}
          </h3>
          {item.description && <DescriptionToggle text={item.description} />}
            <div className="flex items-center gap-2 mt-3">
            ₹{item.price}
           
            </div>
            
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
