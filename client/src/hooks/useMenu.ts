// ✅ useMenu.ts (Custom Hook) with staged fetching and active category scroll fix

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import type { MenuItem } from "@/types/menu.d.ts";

interface UseMenuProps {
  cafeSlug: string;
}

export function useMenu({ cafeSlug }: UseMenuProps) {
  const [menuData, setMenuData] = useState<Record<string, MenuItem[]>>({});
  const [hasMore, setHasMore] = useState(true);
  const [categoryIndex, setCategoryIndex] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("");
  const [allCategories, setAllCategories] = useState<string[]>([]);
  const [loadingCategories, setLoadingCategories] = useState<string[]>([]);

  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});
  const observerRef = useRef<IntersectionObserver | null>(null);

  // ✅ Fetch all categories once
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/menu/category/${cafeSlug}`
        );
        if (!res.ok) throw new Error("Failed to fetch categories");
        const result = await res.json();
        setAllCategories(result.categories);
      } catch (error) {
        console.error("Failed to fetch all categories:", error);
      }
    };
    fetchCategories();
  }, [cafeSlug]);

  // ✅ Staged Fetching: load initial 10 at once, then next 10s with delay
  const fetchCategoryByIndex = useCallback(
    async (index: number) => {
      if (index >= allCategories.length) return;
      const category = allCategories[index];
      if (!category || menuData[category]) return;

      setLoadingCategories((prev) => [...prev, category]);

      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/menu/${cafeSlug}?category_index=${index}`
        );
        if (!res.ok) throw new Error("Failed to fetch menu");
        const result = await res.json();

        const [categoryName] = Object.keys(result);
        const items = result[categoryName];

        setMenuData((prev) => ({
          ...prev,
          [categoryName]: items,
        }));

        // Set first active category if not set
        if (!activeCategory) setActiveCategory(categoryName);

        // After a short delay, fetch next category
        setTimeout(() => setCategoryIndex((prev) => prev + 1), 500);
      } catch (error) {
        console.error("Failed to fetch menu:", error);
      } finally {
        setLoadingCategories((prev) => prev.filter((c) => c !== category));
      }
    },
    [cafeSlug, allCategories, menuData, activeCategory]
  );

  useEffect(() => {
    if (categoryIndex < allCategories.length) {
      fetchCategoryByIndex(categoryIndex);
    } else {
      setHasMore(false);
    }
  }, [categoryIndex, allCategories.length, fetchCategoryByIndex]);

  // ✅ Search-based filter
  const filteredMenuData = useMemo(() => {
    if (!searchTerm.trim()) return menuData;
    const lowerFilter = searchTerm.toLowerCase();
    const filtered: Record<string, MenuItem[]> = {};
    Object.entries(menuData).forEach(([category, items]) => {
      const matches = items.filter(
        (item) =>
          item.name.toLowerCase().includes(lowerFilter) ||
          item.description.toLowerCase().includes(lowerFilter)
      );
      if (matches.length > 0) filtered[category] = matches;
    });
    return filtered;
  }, [searchTerm, menuData]);

  // ✅ Set activeCategory on scroll using observer
  useEffect(() => {
    if (searchTerm) return;
    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveCategory(entry.target.id);
          }
        });
      },
      {
        rootMargin: "-40% 0px -60% 0px",
        threshold: 0,
      }
    );

    Object.values(sectionRefs.current).forEach((ref) => {
      if (ref) observerRef.current?.observe(ref);
    });

    return () => observerRef.current?.disconnect();
  }, [filteredMenuData, searchTerm]);

  const visibleCategories = searchTerm
    ? Object.keys(filteredMenuData)
    : allCategories;

  const allItems = useMemo(() => {
    return Object.values(menuData).flat();
  }, [menuData]);

  const isSpecial = useMemo(() => {
    return allItems.filter((item) => item?.isSpecial);
  }, [allItems]);

  return {
    searchTerm,
    setSearchTerm,
    activeCategory,
    setActiveCategory,
    visibleCategories,
    filteredMenuData,
    sectionRefs,
    observerRef,
    fetchNextMenuCategory: () => fetchCategoryByIndex(categoryIndex),
    isSpecial,
    hasMore,
    loadingCategories,
  };
}
