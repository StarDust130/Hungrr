"use client";

import { useRef, useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import SearchBar from "./SearchBar";
import CategoryNav from "./CategoryNav";
import CategorySection from "./CategorySection";
import CartWidget from "@/components/menuComp/CartWidget";
import { useMenu } from "@/hooks/useMenu";
import SpecialCardSkeleton from "./SpecialCardSkeleton";
import MenuItemCardSkeleton from "./MenuItemCardSkeleton";
import SpecialCardBox from "./SpecialCardBox";
import axios from "axios";
import { ActiveOrder, OrderFromServer } from "@/types/menu";
import { ActiveOrdersSection } from "./ActiveOrdersBar";
import { useSearchParams } from "next/navigation";
import { log } from "@/lib/helper";
import useCart from "@/hooks/useCart";
import { useSessionToken } from "@/hooks/useSessionToken";
import SpecialLabel from "./SpecialLabel";

interface Props {
  cafeSlug: string;
  cafeId: string;
}

const MenuPageContent = ({ cafeSlug, cafeId }: Props) => {
  const [hasMounted, setHasMounted] = useState(false);

  const sessionToken = useSessionToken();
  const {
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
  } = useMenu({ cafeSlug });

  const [activeOrders, setActiveOrders] = useState<ActiveOrder[]>([]);
  const [openAccordions, setOpenAccordions] = useState<string[]>([]);
  const searchParams = useSearchParams();

  const { loadOrderIntoCart, setCafeId } = useCart();

  const navRef = useRef<HTMLDivElement | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Prevent hydration error
  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    if (cafeId) setCafeId(Number(cafeId));
  }, [cafeId, setCafeId]);

  useEffect(() => {
    const tableNo = searchParams.get("tableNo");
    if (!cafeId || !tableNo || !sessionToken) return;

    const fetchActiveOrders = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/orders/active/${cafeId}/${tableNo}`,
          {
            headers: {
              "x-session-token": sessionToken,
            },
          }
        );
        log("Active orders fetched 🤑:", response.data.activeOrders);
        if (response.data.activeOrders) {
          setActiveOrders(response.data.activeOrders);
        }
      } catch (error) {
        console.error("❌ Could not fetch active orders.", error);
      }
    };

    fetchActiveOrders();
  }, [cafeId, searchParams, sessionToken]);

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
        if (order && order.paid === false) {
          loadOrderIntoCart(order.items);
        }
      } catch (error) {
        console.warn("❌ Could not sync cart with server.", error);
      }
    };

    syncCartWithServer();
  }, [loadOrderIntoCart]);

  const scrollToCategory = async (category: string) => {
    if (searchTerm.trim()) return;
    if (observerRef.current) observerRef.current.disconnect();
    setActiveCategory(category);

    setOpenAccordions((prev) =>
      prev.includes(category) ? prev : [...prev, category]
    );

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
      setTimeout(async () => {
        const el = await waitForElement();
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

  useEffect(() => {
    if (!filteredMenuData) return;
    const categories = Object.keys(filteredMenuData);
    setOpenAccordions(categories);
  }, [filteredMenuData]);

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

  const loadingSpecials = isSpecial.length === 0 && isLoading;

  if (!hasMounted) return <div className="min-h-screen" />; // prevent flash

  return (
    <div className="font-sans bg-background text-foreground min-h-screen">
      <div className="sticky top-0 z-30 w-full bg-background/80 backdrop-blur-md border-b border-border">
        <div className="flex items-center px-3">
          <div className="flex-1">
            <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
          </div>
          <div className="w-auto mr-1">
            <CategoryNav
              categories={visibleCategories}
              activeCategory={activeCategory}
              scrollToCategory={scrollToCategory}
              navRef={navRef}
            />
          </div>
        </div>
      </div>

      {hasMounted && (
        <>
          <main className="max-w-4xl mx-auto px-4 pb-32">
            <AnimatePresence>
              {activeOrders.length > 0 && (
                <ActiveOrdersSection activeOrders={activeOrders} />
              )}
            </AnimatePresence>

            {loadingSpecials ? (
              <section className="py-6">
                <SpecialLabel />
                <div
                  className="flex overflow-x-auto gap-4 px-2 pt-1 no-scrollbar"
                  style={{ WebkitOverflowScrolling: "touch" }}
                >
                  {[...Array(4)].map((_, i) => (
                    <div key={`skeleton-${i}`} className="flex-shrink-0">
                      <SpecialCardSkeleton />
                    </div>
                  ))}
                </div>
              </section>
            ) : (
              <SpecialCardBox items={isSpecial} show={!searchTerm} />
            )}

            {isLoading ? (
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
                openAccordions={openAccordions}
                setOpenAccordions={setOpenAccordions}
              />
            )}

            <div ref={loadMoreRef} className="h-8 w-full" />
          </main>

          <AnimatePresence>
            <CartWidget />
          </AnimatePresence>
        </>
      )}
    </div>
  );
  
}  

export default MenuPageContent;
