import { useState, useEffect, useRef, useMemo } from "react";
import type { MenuItem } from "@/types/menu";

interface UseMenuProps {
  initialData: Record<string, MenuItem[]>;
}

export function useMenu({ initialData }: UseMenuProps) {
  const [menuData] = useState<Record<string, MenuItem[]>>(initialData || {});
  const [searchTerm, setSearchTerm] = useState("");
  const allCategories = useMemo(
    () => Object.keys(initialData || {}),
    [initialData]
  );
  const [activeCategory, setActiveCategory] = useState<string>(
    allCategories[0] || ""
  );
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});
  const observerRef = useRef<IntersectionObserver | null>(null);

  const isLoading = useMemo(
    () => !initialData || Object.keys(initialData).length === 0,
    [initialData]
  );

  const isSpecial = useMemo(() => {
    return Object.values(menuData)
      .flat()
      .filter((item) => item?.isSpecial);
  }, [menuData]);

  const filteredMenuData = useMemo(() => {
    if (!searchTerm.trim()) return menuData;
    const lower = searchTerm.toLowerCase();
    const filtered: Record<string, MenuItem[]> = {};
    Object.entries(menuData).forEach(([category, items]) => {
      if (Array.isArray(items)) {
        const match = items.filter(
          (item) =>
            item.name.toLowerCase().includes(lower) ||
            item.description?.toLowerCase().includes(lower)
        );
        if (match.length > 0) filtered[category] = match;
      }
    });
    return filtered;
  }, [searchTerm, menuData]);

  const visibleCategories = searchTerm
    ? Object.keys(filteredMenuData)
    : allCategories;

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute("data-category");
            if (id) setActiveCategory(id);
          }
        });
      },
      { rootMargin: "-100px 0px -70% 0px", threshold: 0.1 }
    );
    observerRef.current = observer;
    Object.entries(sectionRefs.current).forEach(([, ref]) => {
      if (ref) observer.observe(ref);
    });
    return () => {
      if (observerRef.current) observerRef.current.disconnect();
    };
  }, [filteredMenuData]);

  return {
    searchTerm,
    setSearchTerm,
    activeCategory,
    setActiveCategory,
    visibleCategories,
    filteredMenuData,
    sectionRefs,
    observerRef,
    isSpecial,
    isLoading,
  };
}
