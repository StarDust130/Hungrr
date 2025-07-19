"use client";

import { useRef, useState, useEffect, ReactNode } from "react";
import { AnimatePresence } from "framer-motion";
import axios from "axios";
import { useSearchParams } from "next/navigation";
import useCart from "@/hooks/useCart";
import { useSessionToken } from "@/hooks/useSessionToken";
import { MenuItem, ActiveOrder } from "@/types/menu";
import { useCafe } from "@/context/CafeContext";
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
  // Pass the full cafeData to set the context for the navbar
  cafeData: {
    name: string;
    logoUrl: string;
    slug: string;
  };
}

export default function MenuPageContent({
  cafeId,
  children,
  initialMenuData,
  cafeData,
}: Props) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredData, setFilteredData] = useState<Record<
    string,
    MenuItem[]
  > | null>(null);
  const [activeOrders, setActiveOrders] = useState<ActiveOrder[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("");

  const { setCafeId } = useCart();
  const { setCafeInfo } = useCafe();
  const sessionToken = useSessionToken();
  const searchParams = useSearchParams();
  const allCategories = Object.keys(initialMenuData);
  const navRef = useRef<HTMLDivElement>(null);

  // ✅ This is your correct logic.
  // It runs once to set the shared Navbar info, including the table number from the URL.
  useEffect(() => {
    if (cafeData) {
      const tableNumber = searchParams.get("tableNo");
      setCafeInfo(cafeData, tableNumber || undefined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cafeData, searchParams]); // This runs when data is available.

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

  // Final, robust scroll-watching logic
  useEffect(() => {
    const sections = Array.from(
      document.querySelectorAll("section[id^='category-']")
    );
    if (sections.length === 0) return;

    if (!activeCategory) {
      setActiveCategory(sections[0].id.replace("category-", ""));
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const categoryId = entry.target.id.replace("category-", "");
            setActiveCategory(categoryId);
          }
        });
      },
      { rootMargin: "-150px 0px -70% 0px" }
    );

    sections.forEach((section) => observer.observe(section));
    return () => sections.forEach((section) => observer.unobserve(section));
  }, [children, activeCategory]); // Depend on `children` to re-attach observer if the server content changes.

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
