import { JSX, useMemo } from "react";
import {
  Flame,
  Candy,
  ChefHat,
  HeartPulse,
  TrendingUp,
  Sparkles,
  Leaf,
  Tag as TagIcon,
  ThumbsUp,
  Wand2,
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
    color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
    icon: <Flame size={16} className="mr-1" />,
    label: "Spicy AF",
  },
  [ItemTag.Sweet]: {
    color: "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300",
    icon: <Candy size={16} className="mr-1" />,
    label: "Sweet Delight",
  },
  [ItemTag.Bestseller]: {
    color:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
    icon: <ThumbsUp size={16} className="mr-1" />,
    label: "Bestseller ",
  },
  [ItemTag.Chefs_Special]: {
    color:
      "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
    icon: <ChefHat size={16} className="mr-1" />,
    label: "Chef's Special",
  },
  [ItemTag.Healthy]: {
    color:
      "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
    icon: <HeartPulse size={16} className="mr-1" />,
    label: "Healthy",
  },
  [ItemTag.Popular]: {
    color: "bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-300",
    icon: <TrendingUp size={16} className="mr-1" />,
    label: "Popular",
  },
  [ItemTag.New]: {
    color:
      "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
    icon: <Sparkles size={16} className="mr-1" />,
    label: "New",
  },
  [ItemTag.Jain_Food]: {
    color: "bg-lime-100 text-lime-800 dark:bg-lime-900/30 dark:text-lime-300",
    icon: <Leaf size={16} className="mr-1" />,
    label: "Jain Special",
  },
  [ItemTag.Signature_Dish]: {
    color:
      "bg-gradient-to-r from-teal-100 to-indigo-100 text-indigo-900 dark:from-teal-800/30 dark:to-indigo-800/30 dark:text-indigo-300",
    icon: <Wand2 size={16} className="mr-1" />,
    label: "Signature Dish",
  },
};

const TagBadge = ({ tag }: { tag?: string }) => {
  const tagKey = Object.values(ItemTag).includes(tag as ItemTag)
    ? (tag as ItemTag)
    : undefined;

  const { color, icon, label } = useMemo(() => {
    if (tagKey && tagStyles[tagKey]) return tagStyles[tagKey];
    return {
      color:
        "bg-muted text-muted-foreground dark:bg-muted/20 dark:text-muted-foreground",
      icon: <TagIcon size={16} className="mr-1" />,
      label: tag ?? "Tag",
    };
  }, [tagKey, tag]);

  return (
    <span
      className={`inline-flex items-center px-3 py-1 mb-1 mr-2 text-xs font-medium rounded-full transition-all duration-200 hover:scale-105 ring-1 ring-black/5 dark:ring-white/10 ${color}`}
      style={{ letterSpacing: "0.03em" }}
    >
      {icon}
      {label}
    </span>
  );
};

export default TagBadge;
