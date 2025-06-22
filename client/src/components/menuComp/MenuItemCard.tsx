import SafeImage from "../elements/SafeImage";
import AddToCartButton from "./AddToCartButton";
import TagBadge from "./TagBadge";
import DietaryIcon from "./DietaryIcon";
import { Sparkles } from "lucide-react";
import { MenuItem } from "@/types/menu";

const MenuItemCard = ({ item }: { item: MenuItem }) => {
  return (
    <article className="border-b border-gray-200 dark:border-gray-800 last:border-b-0 border-dashed">
      <div className="flex items-start gap-4 py-6">
        {/* Left Section: Details */}
        <div className="flex flex-col flex-grow">
          <div className="flex items-center gap-2">
            {item.isSpecial && (
              <div className="flex items-center gap-1.5 text-xs  font-bold text-[#fbcb3a] dark:text-[#fcd253]">
                <Sparkles size={14} className="fill-current" />
                <span>Must Try</span>
              </div>
            )}
          </div>

          <h3 className="text-lg flex items-center justify-start gap-2 font-bold text-gray-900 dark:text-white mt-1.5">
            {item.dietary && <DietaryIcon type={item.dietary} />} {item.name}
          </h3>

          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 leading-snug line-clamp-2">
            {item.description}
          </p>

          {item.tags && item.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {item.tags.map((tag) => (
                <TagBadge key={tag} tag={tag} />
              ))}
            </div>
          )}

          <p className="text-base font-semibold text-gray-800 dark:text-gray-200 mt-4">
            ₹{item.price}
          </p>
        </div>

        {/* Right Section: Image and Add to Cart */}
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

export default MenuItemCard;
