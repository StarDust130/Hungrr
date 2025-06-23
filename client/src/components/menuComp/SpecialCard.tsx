import AddToCartButton from "./AddToCartButton";
import SafeImage from "../elements/SafeImage";
import { MenuItem } from "@/types/menu";
import { Sparkles } from "lucide-react";

const SpecialCard = ({ item }: { item: MenuItem }) => {
  
  return (
    <div className="relative flex-shrink-0 w-44 md:w-52 rounded-2xl border dark:border-zinc-200/20 backdrop-blur-xl hover:shadow-[0_8px_24px_rgba(0,0,0,0.25)] hover:scale-[1.03] transition-all duration-300 overflow-hidden">
      {/* Must Try Badge */}
      <div className="absolute top-2 left-2 bg-gradient-to-br from-[#ffe8a0] to-[#fcd253] text-[#5b4510] text-[8px] px-2 py-1 rounded-full font-bold border border-[#fcd253] flex items-center gap-1 shadow z-10 tracking-wider uppercase">
        <Sparkles className="w-3 h-3" />
        Must Try
      </div>

      {/* Image: top-rounded only */}
      <SafeImage
        src={item.food_image_url ?? ""}
        alt={item.name}
        className="w-full h-40 md:h-32 object-cover rounded-t-2xl transition duration-300 group-hover:scale-105"
      />

      {/* Content */}
      <div className="p-3 flex flex-col justify-between h-[130px]">
        <div className="space-y-0.5">
          <h3 className="text-[15px] font-semibold font-serif truncate">
            {item.name}
          </h3>
          <p className="text-[13px] font-medium">
            ₹{item.price}
          </p>
        </div>

        {/* Add to Cart */}
        <AddToCartButton item={item} className="mt-2 w-full" />
      </div>
    </div>
  );
};

export default SpecialCard;
