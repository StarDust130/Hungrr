import { JSX, useMemo } from "react";
import {
  Flame,
  Sparkles,
  Star,
  UtensilsCrossed,
  ThumbsUp,
  Snowflake,
  Smile,
  Candy,
  Clock,
  Tag as TagIcon,
} from "lucide-react";

const tagStyles: Record<string, { color: string; icon: JSX.Element }> = {
  "chief special": {
    color:
      "bg-orange-100 text-orange-900 dark:bg-orange-900/30 dark:text-orange-300",
    icon: <UtensilsCrossed size={16} className="mr-1" />,
  },
  new: {
    color: "bg-blue-100 text-blue-900 dark:bg-blue-900/30 dark:text-blue-300",
    icon: <Sparkles size={16} className="mr-1" />,
  },
  spicy: {
    color: "bg-red-100 text-red-900 dark:bg-red-900/30 dark:text-red-300",
    icon: <Flame size={16} className="mr-1" />,
  },
  tasty: {
    color:
      "bg-yellow-100 text-yellow-900 dark:bg-yellow-900/30 dark:text-yellow-300",
    icon: <Smile size={16} className="mr-1" />,
  },
  "best seller": {
    color: "bg-pink-100 text-pink-900 dark:bg-pink-900/30 dark:text-pink-300",
    icon: <Star size={16} className="mr-1" />,
  },
  hot: {
    color: "bg-rose-100 text-rose-900 dark:bg-rose-900/30 dark:text-rose-300",
    icon: <Flame size={16} className="mr-1" />,
  },
  cold: {
    color: "bg-cyan-100 text-cyan-900 dark:bg-cyan-900/30 dark:text-cyan-300",
    icon: <Snowflake size={16} className="mr-1" />,
  },
  sweet: {
    color:
      "bg-fuchsia-100 text-fuchsia-900 dark:bg-fuchsia-900/30 dark:text-fuchsia-300",
    icon: <Candy size={16} className="mr-1" />,
  },
  "must try": {
    color:
      "bg-emerald-100 text-emerald-900 dark:bg-emerald-900/30 dark:text-emerald-300",
    icon: <ThumbsUp size={16} className="mr-1" />,
  },
  limited: {
    color: "bg-gray-100 text-gray-900 dark:bg-gray-900/30 dark:text-gray-300",
    icon: <Clock size={16} className="mr-1" />,
  },
};

const TagBadge = ({ tag }: { tag?: string }) => {
  const displayTag = tag?.toLowerCase().trim() || "tag";
  const { color, icon } = useMemo(() => {
    return (
      tagStyles[displayTag] || {
        color:
          "bg-muted text-muted-foreground dark:bg-muted/20 dark:text-muted-foreground",
        icon: <TagIcon size={16} className="mr-1" />,
      }
    );
  }, [displayTag]);

  return (
    <span
      className={`inline-flex items-center px-3 py-1 mb-1 mr-2 text-[10px] font-semibold rounded-full shadow-sm ring-1 ring-black/5 dark:ring-white/10 transition-all duration-200 hover:scale-[1.05] hover:ring-opacity-40 ${color}`}
    >
      {icon}
      {tag || "Tag"}
    </span>
  );
};

export default TagBadge;
