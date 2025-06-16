import SafeImage from "../elements/SafeImage";
import AddToCartButton from "./AddToCartButton";
import TagBadge from "./TagBadge";
import DietaryIcon from "./DietaryIcon";
import { Star } from "lucide-react";
import { MenuItem } from "@/types/menu";



const MenuItemCard = ({ item }: { item: MenuItem }) => (
  <div className="flex gap-4 py-6">
    <div className="flex-grow flex flex-col">
      <div className="flex items-center gap-2 mb-1">
        {item.dietary && (
          <span className="text-xs ml-2 text-muted-foreground">
            <DietaryIcon type={item.dietary} />
          </span>
        )}
        {item.isSpecial && (
          <div className="flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-500">
            <Star size={14} className="fill-current" />
            <span>Bestseller</span>
          </div>
        )}
      </div>

      <h3 className="font-bold text-lg text-foreground mb-1.5">{item.name}</h3>

      {item.tags && item.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {item.tags.map((tag) => (
            <TagBadge key={tag} tag={tag} />
          ))}
        </div>
      )}

      <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 mt-auto">
        {item.description}
      </p>

      <p className="text-base font-bold text-foreground mt-2">₹{item.price}</p>
    </div>

    <div className="flex-shrink-0 w-32 flex flex-col items-end justify-between">
      <SafeImage
        src={item.image ?? ""}
        alt={item.name}
        className="w-full aspect-[4/3] object-cover rounded-lg"
      />
      <div className="mt-2">
        <AddToCartButton item={item} />
      </div>
    </div>
  </div>
);

export default MenuItemCard;