"use client";

import { useRef, useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import SearchBar from "./SearchBar";
import CategoryNav from "./CategoryNav";
import CategorySection from "./CategorySection";
import CartWidget from "@/components/menuComp/CartWidget";
import { useMenu } from "@/hooks/useMenu"; // ✅ Your custom hook
import SpecialCardSkeleton from "./SpecialCardSkeleton";
import MenuItemCardSkeleton from "./MenuItemCardSkeleton";
import SpecialCardBox from "./SpecialCardBox";
import axios from "axios";
import { ActiveOrder, OrderFromServer } from "@/types/menu";
import {  ActiveOrdersSection } from "./ActiveOrdersBar";
import { useSearchParams } from "next/navigation";
import { log } from "@/lib/helper";
import useCart from "@/hooks/useCart";

interface Props {
  cafeSlug: string;
  cafeId: string; 
}

const MenuPageContent = ({ cafeSlug, cafeId }: Props) => {
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
  } = useMenu({ cafeSlug });
  const [activeOrders, setActiveOrders] = useState<ActiveOrder[]>([]);
  const searchParams = useSearchParams();
  const [hasMounted, setHasMounted] = useState(false);

  // ✅ Get the new 'setCafeId' function from our cart context
  const { loadOrderIntoCart, setCafeId } = useCart();

  // ✅ ADD THIS useEffect to set the cafe ID in the context when the page loads
  useEffect(() => {
    if (cafeId) {
      setCafeId(Number(cafeId));
    }
  }, [cafeId, setCafeId]);

  const navRef = useRef<HTMLDivElement | null>(
    null
  ) as React.RefObject<HTMLDivElement>;
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  // ✅ Derive loadingSpecials
  const loadingSpecials = isSpecial.length === 0 && !searchTerm;

  // This hook runs when the page loads to check for active orders
  useEffect(() => {
    const tableNo = searchParams.get("tableNo");

    if (!cafeId || !tableNo) return; // Cannot search without this info

    const fetchActiveOrders = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/orders/active/${cafeId}/${tableNo}`
        );

        log("Active orders fetched 🤑:", response.data.activeOrders);
        if (response.data.activeOrders) {
          setActiveOrders(response.data.activeOrders);
        }
      } catch (error) {
        console.error("Could not fetch active orders.", error);
      }
    };

    fetchActiveOrders();
  }, [cafeId, searchParams]); // Re-run if params change

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

  // ✅ Add this effect to sync the cart when the page loads
  useEffect(() => {
    const syncCartWithServer = async () => {
      const rawBillData = sessionStorage.getItem("currentBill");
      if (!rawBillData) return;

      try {
        const { cafeId, tableNo } = JSON.parse(rawBillData);
        if (!cafeId || !tableNo) return;

        const response = await axios.get<{ order: OrderFromServer | null }>(
          `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/bill/${cafeId}/${tableNo}`
        );

        const order = response.data.order;

        // If an unpaid order exists, sync the cart with its items.
        if (order && order.paid === false) {
          loadOrderIntoCart(order.items);
        }
      } catch (error) {
        // This is not a critical error, just means there's no active order to sync.
        console.warn("Could not sync cart with server.", error);
      }
    };

    syncCartWithServer();
  }, [loadOrderIntoCart]); // The dependency ensures this runs once when the component mounts.

  //! ✅ Scroll to category logic
  const scrollToCategory = async (category: string) => {
    if (searchTerm.trim()) return;

    if (observerRef.current) observerRef.current.disconnect();

    setActiveCategory(category);

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
      setTimeout(() => {
        const offset = el.getBoundingClientRect().top + window.scrollY - 140;
        window.scrollTo({ top: offset, behavior: "smooth" });

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

  // ✅ Scroll active category nav into view
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



  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) return null; // ⛔️ Prevent SSR rendering

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
        <AnimatePresence>
          {activeOrders.length > 0 && (
            <ActiveOrdersSection activeOrders={activeOrders} />
          )}
        </AnimatePresence>
        {loadingSpecials ? (
          <div className="flex gap-4 pb-4 -mx-4 px-4 overflow-x-auto no-scrollbar">
            {[...Array(4)].map((_, i) => (
              <SpecialCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <SpecialCardBox items={isSpecial} show={!searchTerm} />
        )}

        {loadingSpecials ? (
          <div className="flex flex-col gap-6 py-6">
            {[...Array(6)].map((_, i) => (
              <MenuItemCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <CategorySection
            filteredMenuData={filteredMenuData}
            visibleCategories={visibleCategories}
            searchTerm={searchTerm}
            sectionRefs={sectionRefs}
          />
        )}

        <div ref={loadMoreRef} className="h-8 w-full" />
      </main>
      <AnimatePresence>
        <CartWidget />
      </AnimatePresence>
    </div>
  );
};

export default MenuPageContent;
