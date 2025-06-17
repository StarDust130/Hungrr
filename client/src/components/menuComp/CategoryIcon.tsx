import {
  Star,
  ChefHat,
  Coffee,
  Martini,
  Beer,
  Wine,
  Flame,
  Utensils,
  Pizza,
  Sandwich,
  Cake,
  Cookie,
  IceCream,
  Soup,
  Salad,
  Egg,
  Drumstick,
  Fish,
  Apple,
  Sparkles,
  Candy,
  Hamburger,
  WrapText,
} from "lucide-react";

const CategoryIcon = ({
  categoryName,
  className,
}: {
  categoryName: string;
  className?: string;
}) => {
  const iconProps = {
    className: className || "w-5 h-5",
    strokeWidth: 2.5,
  };

  const name = categoryName.toLowerCase();

  // 🎯 Unique icons only (no reuse)
  if (name.includes("recommend")) return <Star {...iconProps} />;
  if (name.includes("chef")) return <ChefHat {...iconProps} />;
  if (name.includes("special")) return <Sparkles {...iconProps} />;

  // ☕️ Drinks
  if (name.includes("latte") || name.includes("coffee"))
    return <Coffee {...iconProps} />;
  if (name.includes("tea")) return <Martini {...iconProps} />;
  if (name.includes("juice")) return <Apple {...iconProps} />;
  if (name.includes("beer")) return <Beer {...iconProps} />;
  if (name.includes("wine")) return <Wine {...iconProps} />;

  // 🍽️ Meals / Starters
  if (name.includes("starter") || name.includes("appetizer"))
    return <Flame {...iconProps} />;
  if (name.includes("main") || name.includes("course") || name.includes("meal"))
    return <Utensils {...iconProps} />;

  // 🍕 Fast foods (all distinct)
  if (name.includes("pizza")) return <Pizza {...iconProps} />;
  if (name.includes("burger")) return <Hamburger {...iconProps} />;
  if (name.includes("sandwich")) return <Sandwich {...iconProps} />;
  if (name.includes("wrap")) return <WrapText {...iconProps} />;

  // 🍰 Desserts (all distinct)
  if (
    name.includes("dessert") ||
    name.includes("cake") ||
    name.includes("bakery")
  )
    return <Cake {...iconProps} />;
  if (name.includes("cookie")) return <Cookie {...iconProps} />;
  if (name.includes("ice cream")) return <IceCream {...iconProps} />;
  if (name.includes("candy") || name.includes("sweet"))
    return <Candy {...iconProps} />;

  // 🥣 Others
  if (name.includes("soup")) return <Soup {...iconProps} />;
  if (name.includes("salad")) return <Salad {...iconProps} />;
  if (name.includes("egg")) return <Egg {...iconProps} />;
  if (name.includes("chicken") || name.includes("meat"))
    return <Drumstick {...iconProps} />;
  if (name.includes("fish") || name.includes("seafood"))
    return <Fish {...iconProps} />;

  // 🔁 Fallback
  return <Utensils {...iconProps} />;
};

export default CategoryIcon;
