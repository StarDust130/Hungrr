import { useState, useEffect, useRef, useMemo } from "react";
import type { MenuItem } from "@/types/menu";

interface UseMenuProps {
  cafeSlug: string;
}

// ✅ Safely resolve the backend API URL at the top once
const BACKEND_API_URL =
  process.env.NEXT_PUBLIC_BACKEND_API_URL || "https://api.hungrr.in";

export function useMenu({ cafeSlug }: UseMenuProps) {
  const [menuData, setMenuData] = useState<Record<string, MenuItem[]>>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("");
  const [allCategories, setAllCategories] = useState<string[]>([]);
  const [specialItems, setSpecialItems] = useState<MenuItem[]>([]);

  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});
  const observerRef = useRef<IntersectionObserver | null>(null);

useEffect(() => {
  const fetchAllMenus = async () => {
    try {
      // ✅ Fetch categories
      const catRes = await fetch(
        `${BACKEND_API_URL}/api/menu/category/${cafeSlug}`
      );

      if (!catRes.ok) throw new Error("Failed to fetch categories");

      const catJson = await catRes.json();
      const categories: string[] = catJson.categories;
      setAllCategories(categories);

      // ✅ Fetch menus in batches (5 at a time)
      const combined: Record<string, MenuItem[]> = {};

      for (let i = 0; i < categories.length; i += 5) {
        const batch = categories.slice(i, i + 5);
        const batchPromises = batch.map((_, idx) => {
          const actualIndex = i + idx;
          return fetch(
            `${BACKEND_API_URL}/api/menu/${cafeSlug}?category_index=${actualIndex}`
          )
            .then((res) => (res.ok ? res.json() : null))
            .catch(() => null);
        });

        const batchResults = await Promise.all(batchPromises);

        batchResults.forEach((result) => {
          if (result) {
            const category = Object.keys(result)[0];
            combined[category] = result[category];
          }
        });

        // Slight delay between batches to avoid CPU/DB spike
        await new Promise((res) => setTimeout(res, 300));
      }

      // ✅ Save to state
      setMenuData(combined);
      setActiveCategory(Object.keys(combined)[0] || "");

      // ✅ Special items
      const allItems = Object.values(combined).flat();
      const specials = allItems.filter((item) => item?.isSpecial);
      setSpecialItems(specials);
    } catch (error) {
      console.error("❌ Failed to fetch full menu:", error);
    }
  };

  fetchAllMenus();
}, [cafeSlug]);


  const isLoading = useMemo(() => {
    return Object.keys(menuData).length === 0;
  }, [menuData]);

  const filteredMenuData = useMemo(() => {
    if (!searchTerm.trim()) return menuData;
    const lower = searchTerm.toLowerCase();
    const filtered: Record<string, MenuItem[]> = {};

    Object.entries(menuData).forEach(([category, items]) => {
      const match = items.filter(
        (item) =>
          item.name.toLowerCase().includes(lower) ||
          item.description.toLowerCase().includes(lower)
      );
      if (match.length > 0) filtered[category] = match;
    });

    return filtered;
  }, [searchTerm, menuData]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute("data-category");
            if (id) {
              setActiveCategory(id);
            }
          }
        });
      },
      {
        rootMargin: "-100px 0px -70% 0px",
        threshold: 0.1,
      }
    );

    observerRef.current = observer;

    Object.entries(sectionRefs.current).forEach(([category, ref]) => {
      if (ref) {
        ref.setAttribute("data-category", category);
        observer.observe(ref);
      }
    });

    return () => {
      observer.disconnect();
    };
  }, [filteredMenuData]);

  const visibleCategories = searchTerm
    ? Object.keys(filteredMenuData)
    : allCategories;

  return {
    searchTerm,
    setSearchTerm,
    activeCategory,
    setActiveCategory,
    visibleCategories,
    filteredMenuData,
    sectionRefs,
    observerRef,
    isSpecial: specialItems,
    isLoading,
  };
}
