"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import type { MenuItem } from "@/types/menu.d.ts";
import menuData from "@/lib/data";

import SearchBar from "./SearchBar";
import CategoryNav from "./CategoryNav";
import BestSellers from "./BestSellers";
import CategorySection from "./CategorySection";
import CartWidget from "@/components/menuComp/CartWidget";
import { AnimatePresence } from "framer-motion";

const MenuPageContent = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState(
    Object.keys(menuData)[0] || ""
  );

  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});
  const observerRef = useRef<IntersectionObserver | null>(null);
  const navRef = useRef<HTMLDivElement>(null);

  const allItems = useMemo(() => {
    return Object.values(menuData).flat() as MenuItem[];
  }, []);

  const isSpecial = useMemo(() => {
    return allItems.filter((item) => item.isSpecial);
  }, [allItems]);

  const filteredMenuData = useMemo(() => {
    if (!searchTerm.trim()) return menuData;
    const lower = searchTerm.toLowerCase();
    const filtered: typeof menuData = {};
    for (const [category, items] of Object.entries(menuData)) {
      const matched = items.filter(
        (item) =>
          item.name.toLowerCase().includes(lower) ||
          item.description.toLowerCase().includes(lower) ||
          item.tags.some((tag) => tag.toLowerCase().includes(lower))
      );
      if (matched.length > 0) {
        filtered[category] = matched;
      }
    }
    return filtered;
  }, [searchTerm]);

  const visibleCategories = Object.keys(filteredMenuData);

  const scrollToCategory = (category: string) => {
    if (searchTerm.trim()) return; // ⛔ Disable scroll during search

    observerRef.current?.disconnect();

    const el = sectionRefs.current[category];
    if (el) {
      const offset = el.getBoundingClientRect().top + window.scrollY - 140;
      window.scrollTo({ top: offset, behavior: "smooth" });
    }

    setActiveCategory(category);

    // Reattach observers after scroll
    setTimeout(() => {
      Object.values(sectionRefs.current).forEach((ref) => {
        if (ref) observerRef.current?.observe(ref);
      });
    }, 800);
  };

  useEffect(() => {
    if (searchTerm.trim()) return;

    const activeEl = document.getElementById(`nav-${activeCategory}`);
    if (activeEl && navRef.current) {
      navRef.current.scrollTo({
        left:
          activeEl.offsetLeft -
          navRef.current.offsetWidth / 2 +
          activeEl.offsetWidth / 2,
        behavior: "smooth",
      });
    }
  }, [activeCategory, searchTerm]);

  useEffect(() => {
    if (searchTerm.trim()) {
      observerRef.current?.disconnect();
      return;
    }

    observerRef.current?.disconnect();

    const callback: IntersectionObserverCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveCategory(entry.target.id);
        }
      });
    };

    observerRef.current = new IntersectionObserver(callback, {
      rootMargin: "-40% 0px -60% 0px",
      threshold: 0,
    });

    Object.values(sectionRefs.current).forEach((ref) => {
      if (ref) observerRef.current?.observe(ref);
    });

    return () => {
      observerRef.current?.disconnect();
    };
  }, [filteredMenuData, searchTerm]);

  return (
    <div
      className="font-sans bg-background text-foreground min-h-screen"
      suppressHydrationWarning
    >
      <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

      <CategoryNav
        categories={visibleCategories}
        activeCategory={activeCategory}
        scrollToCategory={scrollToCategory}
        navRef={navRef}
      />

      <main className="max-w-4xl mx-auto px-4 pb-32">
        <BestSellers items={isSpecial} show={!searchTerm.trim()} />
        <CategorySection
          filteredMenuData={filteredMenuData}
          visibleCategories={visibleCategories}
          searchTerm={searchTerm}
          sectionRefs={sectionRefs}
        />
      </main>

      <AnimatePresence>
        <CartWidget />
      </AnimatePresence>
    </div>
  );
};

export default MenuPageContent;
