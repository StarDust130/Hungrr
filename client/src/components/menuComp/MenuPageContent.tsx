"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { Search } from "lucide-react";

import { AnimatePresence } from "framer-motion";
import type { MenuData, MenuItem } from "@/types/menu.d.ts";

import CafeBanner from "@/components/menuComp/CafeBanner";
import CartWidget from "@/components/menuComp/CartWidget";
import CategoryIcon from "@/components/menuComp/CategoryIcon";
import BestsellerCard from "@/components/menuComp/BestsellerCard";
import menuData from "@/lib/data";
import MenuItemCard from "@/components/menuComp/MenuItemCard";
import Image from "next/image";

const MenuPageContent = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const allItems = useMemo(() => {
    return Object.values(menuData).flat() as MenuItem[];
  }, []);
  

  const [activeCategory, setActiveCategory] = useState(
    Object.keys(menuData)[0]
  );

  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});
  const observerRef = useRef<IntersectionObserver | null>(null);
  const navRef = useRef<HTMLDivElement>(null); // Ref for the nav container

  const bestsellers = useMemo(
    () => allItems.filter((item) => item.isBestseller),
    [allItems]
  );

  const filteredMenuData = useMemo(() => {
    if (!searchTerm.trim()) return menuData;
    const lowercasedFilter = searchTerm.toLowerCase();
    const filtered: MenuData = {};
    Object.entries(menuData).forEach(([category, items]) => {
      const matchingItems = items.filter(
        (item) =>
          item.name.toLowerCase().includes(lowercasedFilter) ||
          item.description.toLowerCase().includes(lowercasedFilter) ||
          item.tags.some((tag) => tag.toLowerCase().includes(lowercasedFilter))
      );
      if (matchingItems.length > 0) {
        filtered[category] = matchingItems.map((item) => ({
          ...item,
          dietary: item.dietary as "veg" | "non-veg" | "vegan",
        })) as MenuItem[];;
      }
    });
    return filtered;
  }, [searchTerm]);

  const visibleCategories = Object.keys(filteredMenuData);

  const scrollToCategory = (category: string) => {
    if (observerRef.current) observerRef.current.disconnect();

    const element = sectionRefs.current[category];
    if (element) {
      const offset = element.getBoundingClientRect().top + window.scrollY;
      const navHeight = 140; // Adjust this based on your header + nav height

      window.scrollTo({
        top: offset - navHeight,
        behavior: "smooth",
      });
    }

    setActiveCategory(category);

    setTimeout(() => {
      Object.values(sectionRefs.current).forEach((ref) => {
        if (ref) observerRef.current?.observe(ref);
      });
    }, 800);
  };

  // Auto-scroll the active category into view in the nav bar
  useEffect(() => {
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
  }, [activeCategory]);

  // Intersection Observer for active category
  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect();
    const observerOptions = { rootMargin: "-40% 0px -60% 0px", threshold: 0 };

    const callback: IntersectionObserverCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveCategory(entry.target.id);
        }
      });
    };

    observerRef.current = new IntersectionObserver(callback, observerOptions);
    const observer = observerRef.current;
    Object.values(sectionRefs.current).forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer?.disconnect();
  }, [filteredMenuData]);

  return (
    <div
      className="font-sans bg-background text-foreground min-h-screen"
      suppressHydrationWarning
    >
      <CafeBanner />
      {/* Search 😜 */}
      <header className="sticky top-0 z-20 bg-background/80 backdrop-blur-md p-4 border-b border-border">
        <div className="max-w-4xl mx-auto">
          <div className="relative">
            <input
              type="text"
              placeholder="Search for dishes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-secondary border border-transparent rounded-full focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
            />
            <Search
              size={20}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
          </div>
        </div>
      </header>
      {/* Category 🍜 */}
      <nav className="sticky top-[75px] z-10 bg-background/80 backdrop-blur-md">
        <div
          ref={navRef}
          className="max-w-4xl mx-auto flex gap-3 overflow-x-auto whitespace-nowrap p-4 border-b border-border no-scrollbar"
        >
          {visibleCategories.map((category) => (
            <button
              key={category}
              id={`nav-${category}`}
              onClick={() => scrollToCategory(category)}
              className={`flex  items-center gap-2.5 px-4 py-2 text-[10px] font-bold rounded-full transition-all duration-300 ease-in-out transform hover:scale-105 ${
                activeCategory === category
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-secondary text-secondary-foreground hover:bg-muted"
              }`}
            >
              <CategoryIcon categoryName={category} />
              <span>{category}</span>
            </button>
          ))}
        </div>
      </nav>
      <main className="max-w-4xl mx-auto px-4 pb-32">
        {/* Bestsellers Section */}
        {bestsellers.length > 0 && !searchTerm && (
          <section className="py-8">
            <h2 className="text-2xl font-extrabold text-foreground mb-4 tracking-tight">
              Chef&apos;s Picks
            </h2>
            <div className="flex gap-4 pb-4 -mx-4 px-4 overflow-x-auto no-scrollbar">
              {bestsellers.map((item) => (
                <BestsellerCard
                  key={`bestseller-${item.id}`}
                  item={item as MenuItem}
                />
              ))}
            </div>
          </section>
        )}

        {/* Menu Items by Category */}
        {visibleCategories.length > 0 ? (
          Object.entries(filteredMenuData).map(([category, items]) => (
            <section
              key={category}
              id={category}
              ref={(el) => {
                sectionRefs.current[category] = el;
              }}
              className="pt-8"
            >
              <h2 className="text-2xl font-extrabold text-foreground mb-2 tracking-tight">
                {category}
              </h2>
              <div className="divide-y divide-border">
                {items.map((item: MenuItem) => (
                  <MenuItemCard key={`item-${item.id}`} item={item} />
                ))}
              </div>
            </section>
          ))
        ) : (
          <div className="text-center flex flex-col justify-start items-center py-8">
            <h3 className="text-xl font-semibold text-foreground">
              No Dishes Found 😿
            </h3>
            <Image
              src={"/anime-girl-sad.png"}
              alt="Not Found"
              width={"200"}
              height={"150"}
            />
            <p className="text-muted-foreground text-xs mt-2">
              Your search for <span className="text-blue-500 font-bold">&quot;{searchTerm}&quot;</span> did not
              match any dishes.
            </p>
          </div>
        )}
      </main>

      <AnimatePresence>
        <CartWidget />
      </AnimatePresence>
      <AnimatePresence>
        <CartWidget />
      </AnimatePresence>
    </div>
  );
};

export default MenuPageContent;