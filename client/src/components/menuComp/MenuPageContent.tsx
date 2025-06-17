"use client";

import { useRef, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import SearchBar from "./SearchBar";
import CategoryNav from "./CategoryNav";
import BestSellers from "./BestSellers";
import CategorySection from "./CategorySection";
import CartWidget from "@/components/menuComp/CartWidget";
import { useMenu } from "@/hooks/useMenu"; // ✅ use your custom hook

interface Props {
  cafeSlug: string;
}

const MenuPageContent = ({ cafeSlug }: Props) => {
  const {
    searchTerm,
    setSearchTerm,
    activeCategory,
    setActiveCategory,
    visibleCategories,
    filteredMenuData,
    sectionRefs,
    observerRef,
    fetchNextMenuCategory,
    isSpecial,
    hasMore,
    loadingCategories,
  } = useMenu({ cafeSlug });

  const navRef = useRef<HTMLDivElement>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  //! ✅ Infinite Scroll to fetch next menu category on scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !searchTerm) {
          fetchNextMenuCategory();
        }
      },
      { rootMargin: "100px" }
    );

    if (loadMoreRef.current) observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [fetchNextMenuCategory, hasMore, searchTerm]);

  //! Scroll to active category
  const scrollToCategory = async (category: string) => {
    if (searchTerm.trim()) return;

    if (observerRef.current) observerRef.current.disconnect();

    setActiveCategory(category);

    // Wait for the element to be available and layout to settle
    let retries = 0;
    const maxRetries = 30;

    const waitForElement = (): Promise<HTMLElement> => {
      return new Promise((resolve, reject) => {
        const check = () => {
          const el = sectionRefs.current[category];
          if (el && el.offsetHeight > 0) {
            resolve(el);
          } else if (retries < maxRetries) {
            retries++;
            requestAnimationFrame(check);
          } else {
            reject(new Error("Category element not found"));
          }
        };
        check();
      });
    };

    try {
      const el = await waitForElement();
      // Delay slightly to let layout settle
      setTimeout(() => {
        const offset = el.getBoundingClientRect().top + window.scrollY - 140;
        window.scrollTo({ top: offset, behavior: "smooth" });

        // Reattach observer after scroll
        setTimeout(() => {
          Object.values(sectionRefs.current).forEach((ref) => {
            if (ref) observerRef.current?.observe(ref);
          });
        }, 600);
      }, 50);
    } catch (error) {
      console.warn("Failed to scroll to category:", error);
    }
  };
  
  

  // ✅ Scroll active category into view on nav bar
  useEffect(() => {
    if (searchTerm) return;
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
  

  return (
    <div className="font-sans bg-background text-foreground min-h-screen">
      <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      <CategoryNav
        categories={visibleCategories}
        activeCategory={activeCategory}
        scrollToCategory={scrollToCategory}
        navRef={navRef}
      />
      <main className="max-w-4xl mx-auto px-4 pb-32">
        <BestSellers items={isSpecial} show={!searchTerm} />
        <CategorySection
          filteredMenuData={filteredMenuData}
          visibleCategories={visibleCategories}
          searchTerm={searchTerm}
          sectionRefs={sectionRefs}
          loadingCategories={loadingCategories} // ✅ Show skeletons if still loading
        />
        <div ref={loadMoreRef} className="h-8 w-full" />
      </main>
      <AnimatePresence>
        <CartWidget />
      </AnimatePresence>
    </div>
  );
};

export default MenuPageContent;
