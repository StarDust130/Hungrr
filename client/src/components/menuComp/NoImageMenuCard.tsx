import AddToCartButton from "./AddToCartButton";
import TagBadge from "./TagBadge";
import DietaryIcon from "./DietaryIcon";
import { Sparkles } from "lucide-react";
import { MenuItem } from "@/types/menu";
import DescriptionToggle from "./checkoutComp/DescriptionToggle";

const NoImageMenuCard = ({ item }: { item: MenuItem }) => {
  return (
    <article className="border-b border-gray-500  last:border-b-0 border-dashed py-4">
      <div className="flex items-center justify-between gap-4">
        {/* Left Content */}
        <div className="flex flex-col gap-1">
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
            <div className="flex flex-wrap gap-2 mt-1">
              <TagBadge tag={item.tags} />
            </div>
          )}

          <p className="text-sm font-semibold text-foreground mt-2">
            ₹{item.price}
          </p>
        </div>

        {/* Right Button */}
        <div className="flex justify-center items-center  h-full mt-1">
          <AddToCartButton item={item} />
        </div>
      </div>
    </article>
  );
};

export default NoImageMenuCard;
