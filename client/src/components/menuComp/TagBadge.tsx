import { useMemo } from "react";


const TagBadge = ({ tag }: { tag: string }) => {
  // Define colors for specific tags for more visual flair
  const tagColor = useMemo(() => {
      switch (tag.toLowerCase()) {
          case 'new':
              return 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300';
          case 'staff pick':
              return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300';
          case 'single origin':
              return 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300';
          default:
              return 'bg-muted text-muted-foreground';
      }
  }, [tag]);

  return (
      <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${tagColor}`}>
          {tag}
      </span>
  );
};

export default TagBadge;