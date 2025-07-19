"use client";

import { useRef, useState, useEffect, ReactNode } from "react";
import { AnimatePresence } from "framer-motion";
import axios from "axios";
import { useSearchParams } from "next/navigation";
import useCart from "@/hooks/useCart";
import { useSessionToken } from "@/hooks/useSessionToken";
import { MenuItem, ActiveOrder } from "@/types/menu";
import SearchBar from "./SearchBar";
import CategoryNav from "./CategoryNav";
import CartWidget from "./CartWidget";
import NoResults from "./NoResults";
import CategorySection from "./CategorySection";
import { ActiveOrdersSection } from "./ActiveOrdersBar";

interface Props {
  cafeId: string;
  children: ReactNode;
  initialMenuData: Record<string, MenuItem[]>;
}

export default function MenuPageContent({
  cafeId,
  children,
  initialMenuData,
}: Props) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredData, setFilteredData] = useState<Record<
    string,
    MenuItem[]
  > | null>(null);
  const [activeOrders, setActiveOrders] = useState<ActiveOrder[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("");

  const { setCafeId } = useCart();
  const sessionToken = useSessionToken();
  const searchParams = useSearchParams();
  const allCategories = Object.keys(initialMenuData);
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (cafeId) setCafeId(Number(cafeId));
  }, [cafeId, setCafeId]);

  useEffect(() => {
    const tableNo = searchParams.get("tableNo");
    if (!cafeId || !tableNo || !sessionToken) return;
    axios
      .get(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/orders/active/${cafeId}/${tableNo}`,
        { headers: { "x-session-token": sessionToken } }
      )
      .then((res) => {
        if (res.data.activeOrders) setActiveOrders(res.data.activeOrders);
      })
      .catch((err) => console.error("❌ Could not fetch active orders.", err));
  }, [cafeId, searchParams, sessionToken]);

  // ✅ This is the final, robust scroll-watching logic.
  useEffect(() => {
    const sections = Array.from(
      document.querySelectorAll("section[id^='category-']")
    );
    if (sections.length === 0) return;

    // Set the first category as active by default.
    setActiveCategory(sections[0].id.replace("category-", ""));

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          // When a section is in view, set it as the active category.
          if (entry.isIntersecting) {
            const categoryId = entry.target.id.replace("category-", "");
            setActiveCategory(categoryId);
          }
        });
      },
      // This creates an "activation line" 150px from the top of the screen.
      { rootMargin: "-150px 0px -80% 0px" }
    );

    sections.forEach((section) => observer.observe(section));

    return () => sections.forEach((section) => observer.unobserve(section));
  }, [children]); // We depend on `children` to know when the server-rendered content is available.

  // Client-side search logic
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredData(null);
      return;
    }
    const lower = searchTerm.toLowerCase();
    const filtered: Record<string, MenuItem[]> = {};
    Object.entries(initialMenuData).forEach(([category, items]) => {
      if (Array.isArray(items)) {
        const match = items.filter(
          (item) =>
            item.name.toLowerCase().includes(lower) ||
            item.description?.toLowerCase().includes(lower)
        );
        if (match.length > 0) filtered[category] = match;
      }
    });
    setFilteredData(filtered);
  }, [searchTerm, initialMenuData]);

  const scrollToCategory = (category: string) => {
    setSearchTerm("");
    setTimeout(() => {
      const element = document.getElementById(`category-${category}`);
      if (element) {
        const offset =
          element.getBoundingClientRect().top + window.scrollY - 140;
        window.scrollTo({ top: offset, behavior: "smooth" });
      }
    }, 0);
  };

  return (
    <div className="font-sans bg-background text-foreground min-h-screen">
      <div className="sticky top-0 z-30 w-full bg-background/80 backdrop-blur-md border-b border-border">
        <div className="flex items-center px-3">
          <div className="flex-1">
            <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
          </div>
          <div className="w-auto mr-1">
            <CategoryNav
              categories={allCategories}
              activeCategory={activeCategory}
              scrollToCategory={scrollToCategory}
              navRef={navRef}
              setSearchTerm={setSearchTerm}
            />
          </div>
        </div>
      </div>
      <AnimatePresence>
        {activeOrders.length > 0 && (
          <ActiveOrdersSection activeOrders={activeOrders} />
        )}
      </AnimatePresence>
      {searchTerm.trim() ? (
        <main className="max-w-4xl mx-auto px-4 pb-32">
          {filteredData && Object.keys(filteredData).length > 0 ? (
            <CategorySection serverRenderedMenuData={filteredData} />
          ) : (
            <NoResults query={searchTerm} />
          )}
        </main>
      ) : (
        children
      )}
      <AnimatePresence>
        <CartWidget />
      </AnimatePresence>
    </div>
  );
}
