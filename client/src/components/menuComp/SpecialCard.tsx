import AddToCartButton from "./AddToCartButton";
import SafeImage from "../elements/SafeImage";
import { MenuItem } from "@/types/menu";
import { Sparkles } from "lucide-react";
import DietaryIcon from "./DietaryIcon";
import DescriptionToggle from "./checkoutComp/DescriptionToggle";

const SpecialCard = ({ item }: { item: MenuItem }) => {

  return (
    <div className="group relative w-50 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:scale-[1.02] flex flex-col">
      {item.isSpecial && (
        <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold uppercase rounded-full border border-yellow-400 text-yellow-800 bg-yellow-100 dark:text-yellow-200 dark:bg-yellow-800/30 backdrop-blur">
          <Sparkles className="w-3 h-3" />
          Must Try
        </div>
      )}

      <div className="w-full h-36 overflow-hidden ">
        <SafeImage
          src={item.food_image_url ?? ""}
          alt={item.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
      </div>

      <div className="flex flex-col justify-between flex-1 px-4 pt-3 pb-4 space-y-3">
        <div className="space-y-1 min-h-[84px]">
          <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
            {item.dietary && <DietaryIcon type={item.dietary} />} {item.name}
          </h3>
          {item.description && <DescriptionToggle text={item.description} />}
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-zinc-900 dark:text-white tracking-wide">
              ₹{item.price}
            </span>
          </div>

          <AddToCartButton
            item={item}
            className="w-full text-xs transition-all duration-300 hover:scale-[1.015]"
          />
        </div>
      </div>
    </div>
  );
};

export default SpecialCard;
