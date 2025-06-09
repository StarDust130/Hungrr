"use client";

import React, {
  useState,
  useRef,
  useEffect,
  useMemo,
  createContext,
  useContext,
} from "react";
import {
  Search,
  Star,
  ChevronRight,
  ShoppingCart,
  X,
  Clock,
  Minus,
  Plus,
  CupSoda,
  Sandwich,
  Soup,
} from "lucide-react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";

// MOCK DATA - Replace with your actual data import
import menuData, { cafeInfo } from "@/lib/data";
// NEW: Import types from your dedicated types file
import type { MenuItem, MenuData, Cart, CartContextType } from "@/types/menu.d.ts";


import { Coffee } from "lucide-react"; // Add this to your imports

// Helper component to render an icon based on category name
const CategoryIcon = ({ categoryName, className }: { categoryName: string, className?: string }) => {
  const iconProps = {
    className: className || "w-5 h-5",
    strokeWidth: 2.5
  };

  switch (categoryName.toLowerCase()) {
    case 'recommended':
      return <Star {...iconProps} />;
    case 'signature lattes':
      return <Coffee {...iconProps} />;
    case 'espresso & brews':
        return <CupSoda {...iconProps} />;
    case 'bakery & sweets':
        return <Sandwich {...iconProps} />;
    default:
      return <Soup {...iconProps} />;
  }
};

// A stylish placeholder for items without an image
const ImagePlaceholder = ({ className }: { className?: string }) => (
  <div
    className={`flex items-center justify-center bg-muted rounded-lg ${className}`}
  >
    <Coffee className="w-8 h-8 text-muted-foreground/50" />
  </div>
);

// New Component for displaying item tags like "New", "Staff Pick" etc.
const TagBadge = ({ tag }: { tag: string }) => {
  // Define colors for specific tags for more visual flair
  const tagColor = useMemo(() => {
      switch (tag.toLowerCase()) {
          case 'new':
              return 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300';
          case 'staff pick':
              return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300';
          case 'single origin':
              return 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300';
          default:
              return 'bg-muted text-muted-foreground';
      }
  }, [tag]);

  return (
      <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${tagColor}`}>
          {tag}
      </span>
  );
};

// --- CART CONTEXT for Global State Management ---
const CartContext = createContext<CartContextType | null>(null);

const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [cart, setCart] = useState<Cart>({});

  // Memoize all items for efficient lookups in cart calculations
  const allItems = useMemo(() => Object.values(menuData).flat(), []);

  const addToCart = (item: MenuItem) => {
    setCart((prev) => ({ ...prev, [item.id]: (prev[item.id] || 0) + 1 }));
  };

  const removeFromCart = (itemId: number) => {
    setCart((prev) => {
      const newCart = { ...prev };
      if (newCart[itemId] > 1) {
        newCart[itemId]--;
      } else {
        delete newCart[itemId];
      }
      return newCart;
    });
  };

  const clearItemFromCart = (itemId: number) => {
    setCart((prev) => {
      const newCart = { ...prev };
      delete newCart[itemId];
      return newCart;
    });
  };

  const getQuantity = (itemId: number) => cart[itemId] || 0;

  const { totalItems, totalPrice } = useMemo(() => {
    let itemsCount = 0;
    let price = 0;
    for (const id in cart) {
      const item = allItems.find((i) => i.id === parseInt(id));
      if (item) {
        itemsCount += cart[id];
        price += item.price * cart[id];
      }
    }
    return { totalItems: itemsCount, totalPrice: price };
  }, [cart, allItems]);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        clearItemFromCart,
        getQuantity,
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};

// --- REFINED UI COMPONENTS ---

const DietaryIcon = ({ type }: { type: MenuItem["dietary"] }) => {
  const style = useMemo(() => {
    switch (type) {
      case "veg":
        return {
          borderColor: "border-green-600",
          bgColor: "bg-green-600",
          textColor: "text-green-600",
        };
      case "non-veg":
        return {
          borderColor: "border-red-600",
          bgColor: "bg-red-600",
          textColor: "text-red-600",
        };
      case "vegan":
        return {
          borderColor: "border-blue-500",
          bgColor: "bg-blue-500",
          textColor: "text-blue-500",
        };
      default:
        return {
          borderColor: "border-gray-400",
          bgColor: "bg-gray-400",
          textColor: "text-gray-500",
        };
    }
  }, [type]);

  return (
    <div
      className={`w-5 h-5 border ${style.borderColor} rounded-sm flex items-center justify-center`}
    >
      <div className={`w-2.5 h-2.5 ${style.bgColor} rounded-full`}></div>
    </div>
  );
};

const AddToCartButton = ({ item }: { item: MenuItem }) => {
  const { addToCart, removeFromCart, getQuantity } = useCart();
  const quantity = getQuantity(item.id);

  return (
    <div className="relative w-28 h-10">
      <AnimatePresence>
        {quantity === 0 ? (
          <motion.button
            key="add"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => addToCart(item)}
            className="absolute inset-0 bg-card border border-primary text-primary font-bold py-2 px-4 rounded-lg shadow-sm hover:bg-primary/10 transition-colors duration-200 flex items-center justify-center"
          >
            Add
          </motion.button>
        ) : (
          <motion.div
            key="quantity"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute inset-0 flex items-center justify-between bg-primary text-primary-foreground font-bold rounded-lg shadow-sm"
          >
            <button
              onClick={() => removeFromCart(item.id)}
              className="w-10 h-full flex items-center justify-center text-lg rounded-l-lg hover:bg-primary/80 transition-colors"
            >
              <Minus size={16} />
            </button>
            <span className="text-sm font-bold">{quantity}</span>
            <button
              onClick={() => addToCart(item)}
              className="w-10 h-full flex items-center justify-center text-lg rounded-r-lg hover:bg-primary/80 transition-colors"
            >
              <Plus size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- Updated MenuItemCard with Tags ---
const MenuItemCard = ({ item }: { item: MenuItem }) => (
  <div className="flex gap-4 py-6">
    <div className="flex-grow flex flex-col">
      <div className="flex items-center gap-2 mb-1">
        <DietaryIcon type={item.dietary} />
        {item.isBestseller && (
           <div className="flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-500">
             <Star size={14} className="fill-current" />
             <span>Bestseller</span>
           </div>
        )}
      </div>
      <h3 className="font-bold text-lg text-foreground mb-1.5">{item.name}</h3>
      
      {/* --- NEW: Display Item Tags --- */}
      {item.tags && item.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
              {item.tags.map(tag => <TagBadge key={tag} tag={tag} />)}
          </div>
      )}

      <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 mt-auto">
        {item.description}
      </p>
       <p className="text-base font-bold text-foreground mt-2">
         {cafeInfo.currency}{item.price.toFixed(2)}
       </p>
    </div>
    <div className="flex-shrink-0 w-32 flex flex-col items-end justify-between">
       {item.image ? (
         <Image
           src={item.image}
           alt={item.name}
           className="w-full aspect-[4/3] object-cover rounded-lg"
           loading="lazy"
           width={128}
           height={96}
         />
       ) : (
         <ImagePlaceholder className="w-full aspect-[4/3]" />
       )}
       <div className="mt-2">
         <AddToCartButton item={item} />
       </div>
    </div>
  </div>
);

const BestsellerCard = ({ item }: { item: MenuItem }) => (
  <div className="flex-shrink-0 w-60 md:w-64 border bg-card rounded-xl overflow-hidden shadow-sm transition-shadow hover:shadow-md">
    {/* --- IMAGE SECTION (MODIFIED) --- */}
    {item.image ? (
      <Image
        src={item.image}
        alt={item.name}
        className="w-full h-32 object-cover"
        width={256}
        height={128}
      />
    ) : (
      // Use the new placeholder component
      <ImagePlaceholder className="w-full h-32" />
    )}

    <div className="p-3">
      <h3 className="font-bold text-foreground truncate">{item.name}</h3>
      <p className="text-sm font-semibold text-muted-foreground mt-0.5">
        {cafeInfo.currency}
        {item.price.toFixed(2)}
      </p>
      <div className="pt-3">
        <AddToCartButton item={item} />
      </div>
    </div>
  </div>
);

const CafeBanner = () => (
  <div className="relative h-56 md:h-64 w-full">
    <Image
      src={cafeInfo.bannerUrl}
      alt="Cafe Banner"
      layout="fill"
      objectFit="cover"
      className="brightness-50"
    />
    <div className="absolute inset-0 flex flex-col justify-end p-4 md:p-6 bg-gradient-to-t from-black/70 to-transparent">
      <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
        {cafeInfo.name}
      </h1>
      <p className="text-white/90 mt-1 text-sm md:text-base">
        {cafeInfo.tagline}
      </p>
      <div className="flex items-center gap-4 mt-3 text-sm text-white">
        <div className="flex items-center gap-1.5">
          <Star size={16} className="text-amber-400 fill-amber-400" />
          <span className="font-bold">{cafeInfo.rating}</span>
          <span className="text-white/70">({cafeInfo.reviews} reviews)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock size={16} className="text-white/70" />
          <span className="font-medium">Open from {cafeInfo.openingTime}</span>
        </div>
      </div>
    </div>
  </div>
);

const CartWidget = () => {
  const { totalItems, totalPrice } = useCart();

  if (totalItems === 0) return null;

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      transition={{ type: "spring", stiffness: 50 }}
      className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[92%] max-w-md z-50"
    >
      <div className="bg-primary text-primary-foreground rounded-xl shadow-2xl flex items-center justify-between p-4 font-bold">
        <div className="flex items-center gap-3">
          <ShoppingCart size={20} />
          <div>
            <span className="block text-sm">
              {totalItems} {totalItems > 1 ? "Items" : "Item"}
            </span>
            <span className="block text-xs opacity-80">
              {cafeInfo.currency}
              {totalPrice.toFixed(2)}
            </span>
          </div>
        </div>
        <button className="flex items-center gap-2 text-sm">
          View Cart <ChevronRight size={18} />
        </button>
      </div>
    </motion.div>
  );
};

//! --- MAIN PAGE COMPONENT ---
const MenuPageContent = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const allItems = useMemo(() => Object.values(menuData).flat(), []);
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
        filtered[category] = matchingItems;
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
      {/* REVAMPED Mobile Category Navigation */}
      {/* --- REVAMPED Category Navigation with Icons --- */}
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
              className={`flex items-center gap-2.5 px-4 py-2 text-sm font-bold rounded-full transition-all duration-300 ease-in-out transform hover:scale-105 ${
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
                <BestsellerCard key={`bestseller-${item.id}`} item={item} />
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
              ref={(el) => (sectionRefs.current[category] = el)}
              className="pt-8"
            >
              <h2 className="text-2xl font-extrabold text-foreground mb-2 tracking-tight">
                {category}
              </h2>
              <div className="divide-y divide-border">
                {items.map((item) => (
                  <MenuItemCard key={`item-${item.id}`} item={item} />
                ))}
              </div>
            </section>
          ))
        ) : (
          <div className="text-center py-20">
            <h3 className="text-xl font-semibold text-foreground">
              No Dishes Found
            </h3>
            <p className="text-muted-foreground mt-2">
              Your search for &quot;{searchTerm}&quot; did not match any dishes.
              😿
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

const MenuPage = () => (
  <CartProvider>
    <MenuPageContent />
  </CartProvider>
);

export default MenuPage;
