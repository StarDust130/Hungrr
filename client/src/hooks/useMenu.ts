import { useState, useEffect, useRef, useMemo } from "react";
import type { MenuItem } from "@/types/menu";

interface UseMenuProps {
  cafeSlug: string;
}

export function useMenu({ cafeSlug }: UseMenuProps) {
  const [menuData, setMenuData] = useState<Record<string, MenuItem[]>>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("");
  const [allCategories, setAllCategories] = useState<string[]>([]);
  const [specialItems, setSpecialItems] = useState<MenuItem[]>([]);

  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});
  const observerRef = useRef<IntersectionObserver | null>(null);

  //! ✅ Fetch all categories and menu data in parallel
  useEffect(() => {
    const fetchAllMenus = async () => {
      try {
        const catRes = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/menu/category/${cafeSlug}`
        );
        const catJson = await catRes.json();
        const categories: string[] = catJson.categories;
        setAllCategories(categories);

        const promises = categories.map(async (_, index) => {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/menu/${cafeSlug}?category_index=${index}`
          );
          if (!res.ok) return null;
          const data = await res.json();
          return data;
        });

        const results = await Promise.all(promises);

        const combined: Record<string, MenuItem[]> = {};
        results.forEach((result) => {
          if (result) {
            const category = Object.keys(result)[0];
            combined[category] = result[category];
          }
        });

        setMenuData(combined);
        setActiveCategory(Object.keys(combined)[0] || "");

        // ✅ Set specials early
        const allInitialItems = Object.values(combined).flat();
        const specialFiltered = allInitialItems.filter(
          (item) => item?.isSpecial
        );
        setSpecialItems(specialFiltered);
      } catch (error) {
        console.error("❌ Failed to fetch full menu:", error);
      }
    };

    fetchAllMenus();
  }, [cafeSlug]);

  // ✅ Calculate loading state
  const isLoading = useMemo(() => {
    return Object.keys(menuData).length === 0;
  }, [menuData]);

  // ✅ Filtered menu data by search term
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

  // ✅ Track visible category using IntersectionObserver
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute("data-category");
            if (id) {
              setActiveCategory(id); // ✅ This triggers highlight change
            }
          }
        });
      },
      {
        rootMargin: "-100px 0px -70% 0px", // tweak this to your layout
        threshold: 0.1,
      }
    );

    observerRef.current = observer;

    // Observe all sections
    Object.entries(sectionRefs.current).forEach(([category, ref]) => {
      if (ref) {
        ref.setAttribute("data-category", category); // ✅ Required
        observer.observe(ref);
      }
    });

    return () => {
      observer.disconnect();
    };
  }, [filteredMenuData]);
  

  // ✅ List of visible categories depending on search
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
