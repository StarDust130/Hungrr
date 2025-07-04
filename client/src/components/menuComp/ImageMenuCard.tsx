import SafeImage from "../elements/SafeImage";
import AddToCartButton from "./AddToCartButton";
import TagBadge from "./TagBadge";
import DietaryIcon from "./DietaryIcon";
import { Sparkles } from "lucide-react";
import { MenuItem } from "@/types/menu";
import DescriptionToggle from "./checkoutComp/DescriptionToggle";

const ImageMenuCard = ({ item }: { item: MenuItem }) => {
  return (
    <article className="border-b border-gray-500  last:border-b-0 border-dashed">
      <div className="flex items-start gap-4 py-6 pb-[60px] relative">
        {/* Left Section */}
        <div className="flex flex-col flex-grow">
          {item.isSpecial && (
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#fbcb3a] dark:text-[#fcd253] mb-1">
              <Sparkles size={14} className="fill-current" />
              <span>Must Try</span>
            </div>
          )}

          <h3 className="text-base sm:text-lg font-semibold text-foreground flex items-center gap-2">
            {item.dietary && <DietaryIcon type={item.dietary} />} {item.name}
          </h3>

          {item.description && <DescriptionToggle text={item.description} />}

          {item.tags && (
            <div className="flex flex-wrap gap-2 mt-2">
              <TagBadge tag={item.tags} />
            </div>
          )}

          <p className="text-sm font-semibold text-foreground mt-3">
            ₹{item.price}
          </p>
        </div>

        {/* Right Section */}
        <div className="relative flex-shrink-0 w-32 sm:w-36">
          <div className="aspect-[4/3] w-full">
            <SafeImage
              src={item.food_image_url ?? ""}
              alt={item.name}
              className="w-full h-full object-cover rounded-xl shadow-sm"
            />
          </div>
          <div className="absolute bottom-[-50px] left-1/2 -translate-x-1/2 w-[calc(100%-1rem)]">
            <AddToCartButton item={item} />
          </div>
        </div>
      </div>
    </article>
  );
};

export default ImageMenuCard;
