import { JSX, useMemo } from "react";
import {
  Flame,
  Candy,
  Star,
  ChefHat,
  HeartPulse,
  TrendingUp,
  Sparkles,
  Leaf,
  Medal,
  Tag as TagIcon,
} from "lucide-react";

export enum ItemTag {
  Spicy = "Spicy",
  Sweet = "Sweet",
  Bestseller = "Bestseller",
  Chefs_Special = "Chefs_Special",
  Healthy = "Healthy",
  Popular = "Popular",
  New = "New",
  Jain_Food = "Jain_Food",
  Signature_Dish = "Signature_Dish",
}

const tagStyles: Record<
  ItemTag,
  { color: string; icon: JSX.Element; label: string }
> = {
  [ItemTag.Spicy]: {
    color: "bg-red-100 text-red-900 dark:bg-red-900/30 dark:text-red-300",
    icon: <Flame size={16} className="mr-1" />,
    label: "Spicy",
  },
  [ItemTag.Sweet]: {
    color: "bg-pink-100 text-pink-900 dark:bg-pink-900/30 dark:text-pink-300",
    icon: <Candy size={16} className="mr-1" />,
    label: "Sweet",
  },
  [ItemTag.Bestseller]: {
    color:
      "bg-yellow-100 text-yellow-900 dark:bg-yellow-900/30 dark:text-yellow-300",
    icon: <Star size={16} className="mr-1" />,
    label: "Bestseller",
  },
  [ItemTag.Chefs_Special]: {
    color:
      "bg-orange-100 text-orange-900 dark:bg-orange-900/30 dark:text-orange-300",
    icon: <ChefHat size={16} className="mr-1" />,
    label: "Chef's Special",
  },
  [ItemTag.Healthy]: {
    color:
      "bg-green-100 text-green-900 dark:bg-green-900/30 dark:text-green-300",
    icon: <HeartPulse size={16} className="mr-1" />,
    label: "Healthy",
  },
  [ItemTag.Popular]: {
    color: "bg-blue-100 text-blue-900 dark:bg-blue-900/30 dark:text-blue-300",
    icon: <TrendingUp size={16} className="mr-1" />,
    label: "Popular",
  },
  [ItemTag.New]: {
    color:
      "bg-purple-100 text-purple-900 dark:bg-purple-900/30 dark:text-purple-300",
    icon: <Sparkles size={16} className="mr-1" />,
    label: "New",
  },
  [ItemTag.Jain_Food]: {
    color: "bg-lime-100 text-lime-900 dark:bg-lime-900/30 dark:text-lime-300",
    icon: <Leaf size={16} className="mr-1" />,
    label: "Jain Special",
  },
  [ItemTag.Signature_Dish]: {
    color: "bg-teal-100 text-teal-900 dark:bg-teal-900/30 dark:text-teal-300",
    icon: <Medal size={16} className="mr-1" />,
    label: "Signature Dish",
  },
};

const TagBadge = ({ tag }: { tag?: ItemTag }) => {
  const { color, icon, label } = useMemo(() => {
    if (tag && tagStyles[tag]) return tagStyles[tag];
    return {
      color: "bg-muted text-muted-foreground dark:bg-muted/20 dark:text-muted-foreground",
      icon: <TagIcon size={16} className="mr-1" />,
      label: "Tag",
    };
  }, [tag]);

  return (
    <span
      className={`inline-flex items-center px-3 py-1 mb-1 mr-2 text-xs font-semibold rounded-full shadow-sm ring-1 ring-black/5 dark:ring-white/10 transition-all duration-200 hover:scale-105 hover:ring-opacity-40 ${color}`}
      style={{ letterSpacing: "0.03em" }}
    >
      {icon}
      {label}
    </span>
  );
};

export default TagBadge;
