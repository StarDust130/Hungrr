"use client";
// @ts-nocheck


import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  Search,
  Star,
  Plus,
  Minus,
  ChevronRight,
  ShoppingCart,
} from "lucide-react";
import Image from "next/image";

// --- ENHANCED DUMMY DATA ---
// (No changes to the data structure, it's already well-formed)
const menuData = {
  Recommended: [
    {
      id: 1,
      name: "Sea Salt Caramel Cold Brew",
      price: 12.5,
      description:
        "Our signature cold brew, sweetened with caramel and a hint of sea salt.",
      image:
        "https://images.unsplash.com/photo-1517701550927-27cf9de0a375?w=500&q=80",
      rating: 4.9,
      tags: ["Bestseller", "Must-Try"],
      dietary: "veg",
      isBestseller: true,
    },
    {
      id: 2,
      name: "Avocado Toast",
      price: 15.0,
      description:
        "Smashed avocado on toasted sourdough, topped with feta and chili flakes.",
      image:
        "https://images.unsplash.com/photo-1484723051597-626151586e56?w=500&q=80",
      rating: 4.8,
      tags: ["Bestseller"],
      dietary: "veg",
      isBestseller: true,
    },
    {
      id: 3,
      name: "Spanish Latté",
      price: 11.0,
      description:
        "Rich espresso with condensed milk for a sweet, creamy finish.",
      image:
        "https://images.unsplash.com/photo-1558030007-4224b6c31775?w=500&q=80",
      rating: 4.8,
      tags: [],
      dietary: "veg",
      isBestseller: true,
    },
  ],
  "Signature Lattes": [
    {
      id: 3, // Note: Duplicate ID, our code will handle this gracefully
      name: "Spanish Latté",
      price: 11.0,
      description:
        "Rich espresso with condensed milk for a sweet, creamy finish.",
      image:
        "https://images.unsplash.com/photo-1558030007-4224b6c31775?w=500&q=80",
      rating: 4.8,
      tags: [],
      dietary: "veg",
    },
    {
      id: 4,
      name: "Rose & Cardamom Latté",
      price: 12.0,
      description:
        "An aromatic and floral latté, perfect for an afternoon treat.",
      image:
        "https://images.unsplash.com/photo-1542990253-a781463c2b5c?w=500&q=80",
      rating: 4.7,
      tags: ["New"],
      dietary: "veg",
    },
  ],
  "Espresso & Brews": [
    {
      id: 5,
      name: "Americano",
      price: 8.0,
      description: "A classic. Rich espresso shots topped with hot water.",
      image:
        "https://images.unsplash.com/photo-1587734561126-75a0f1d5e021?w=500&q=80",
      rating: 4.6,
      tags: [],
      dietary: "veg",
    },
    {
      id: 6,
      name: "Pour Over - Kenya AA",
      price: 9.5,
      description:
        "A bright and complex single-origin brew with notes of berry and citrus.",
      image:
        "https://images.unsplash.com/photo-1511920170033-f8396924c348?w=500&q=80",
      rating: 4.9,
      tags: ["Single Origin"],
      dietary: "veg",
    },
    {
      id: 7,
      name: "Nitro Cold Brew",
      price: 8.5,
      description:
        "Our classic cold brew infused with nitrogen for a creamy, stout-like texture.",
      image:
        "https://images.unsplash.com/photo-1621592487114-7993b5c5d3f5?w=500&q=80",
      rating: 4.8,
      tags: [],
      dietary: "veg",
    },
  ],
  "Bakery & Sweets": [
    {
      id: 8,
      name: "Almond Croissant",
      price: 6.0,
      description:
        "Flaky croissant with a rich almond paste filling, topped with toasted almonds.",
      image:
        "https://images.unsplash.com/photo-1621939514649-280e25f80a18?w=500&q=80",
      rating: 4.9,
      tags: ["Staff Pick"],
      dietary: "veg",
    },
    {
      id: 9,
      name: "Basque Cheesecake",
      price: 9.0,
      description:
        "A slice of rustic, crustless cheesecake with a caramelized top.",
      image:
        "https://images.unsplash.com/photo-1604391859247-fac53c80a295?w=500&q=80",
      rating: 4.9,
      tags: [],
      dietary: "veg",
    },
  ],
};

// --- REFINED COMPONENTS ---

type DietaryIconProps = {
  type: string;
};

const DietaryIcon = ({ type }: DietaryIconProps) => (
  <div
    className={`w-5 h-5 border-2 ${
      type === "veg" ? "border-emerald-600" : "border-red-600"
    } flex items-center justify-center p-0.5`}
  >
    <div
      className={`w-2.5 h-2.5 rounded-full ${
        type === "veg" ? "bg-emerald-600" : "bg-red-600"
      }`}
    ></div>
  </div>
);

const AddToCartButton = ({ item, cart, setCart }) => {
  const quantity = cart[item.id] || 0;

  const handleAdd = (e) => {
    e.stopPropagation(); // Prevent card click events
    setCart((prev) => ({ ...prev, [item.id]: (prev[item.id] || 0) + 1 }));
  };

  const handleSubtract = (e) => {
    e.stopPropagation();
    setCart((prev) => {
      const newCart = { ...prev };
      if (newCart[item.id] > 1) {
        newCart[item.id] -= 1;
      } else {
        delete newCart[item.id];
      }
      return newCart;
    });
  };

  if (quantity === 0) {
    return (
      <button
        onClick={handleAdd}
        className="text-sm font-bold text-emerald-600 border border-slate-300 rounded-lg px-6 py-2 bg-white hover:bg-emerald-50/50 transition-all shadow-sm"
      >
        ADD
      </button>
    );
  }

  return (
    <div className="flex items-center justify-center bg-white border border-slate-300 rounded-lg shadow-sm">
      <button
        onClick={handleSubtract}
        className="px-3 py-2 text-emerald-600 hover:bg-emerald-50/50 rounded-l-lg"
        aria-label="Remove one item"
      >
        <Minus size={16} />
      </button>
      <span className="px-3 py-2 text-sm font-bold text-emerald-600 tabular-nums">
        {quantity}
      </span>
      <button
        onClick={handleAdd}
        className="px-3 py-2 text-emerald-600 hover:bg-emerald-50/50 rounded-r-lg"
        aria-label="Add one more item"
      >
        <Plus size={16} />
      </button>
    </div>
  );
};

const MenuItemCard = ({ item, cart, setCart }) => (
  <div className="relative grid grid-cols-3 gap-x-4 border-b border-slate-100 py-6">
    <div className="col-span-2 flex flex-col space-y-2 pr-4">
      <DietaryIcon type={item.dietary} />
      <h3 className="font-bold text-base text-slate-800">{item.name}</h3>
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Star size={16} className="text-amber-500 fill-amber-500" />
        <span className="font-semibold">{item.rating}</span>
      </div>
      <p className="text-sm text-slate-600 leading-relaxed line-clamp-2">
        {item.description}
      </p>
      <p className="text-sm font-bold text-slate-900 pt-1">
        ${item.price.toFixed(2)}
      </p>
      <div className="flex flex-wrap gap-2 pt-2">
        {item.tags.map((tag) => (
          <span
            key={tag}
            className="text-xs font-semibold text-amber-800 bg-amber-100 px-2 py-1 rounded-md"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
    <div className="relative col-span-1">
      {item.image && (
        <Image
          src={"https://picsum.photos/200/300?random=" + item.id}
          alt={item.name}
          className="w-full h-32 object-cover rounded-lg"
          loading="lazy"
          width={200}
          height={300}
        />
      )}
      <div className="absolute bottom-[-10px] left-1/2 -translate-x-1/2 w-[calc(100%-20px)]">
        <AddToCartButton item={item} cart={cart} setCart={setCart} />
      </div>
    </div>
  </div>
);

const BestsellerCard = ({ item, cart, setCart }) => (
  <div className="w-56 flex-shrink-0 relative border border-slate-200/80 rounded-lg shadow-sm bg-white">
    <Image
      src={"https://picsum.photos/200/300?random=" + item.id}
      alt={item.name}
      className="w-full h-32 object-cover rounded-t-lg"
      loading="lazy"
      width={200}
      height={300}
    />
    <div className="p-3">
      <h3 className="font-bold text-sm text-slate-800 truncate">{item.name}</h3>
      <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
        <Star size={14} className="text-amber-500 fill-amber-500" />
        <span>{item.rating}</span>
      </div>
      <div className="flex justify-between items-center mt-3">
        <p className="text-sm font-semibold text-slate-800">
          ${item.price.toFixed(2)}
        </p>
        <AddToCartButton item={item} cart={cart} setCart={setCart} />
      </div>
    </div>
  </div>
);

// --- NEW COMPONENT: Floating Cart Widget ---
const CartWidget = ({ cart, menuItems }) => {
  const { totalItems, totalPrice } = useMemo(() => {
    let totalItems = 0;
    let totalPrice = 0;
    for (const id in cart) {
      const item = menuItems.find((i) => i.id === parseInt(id));
      if (item) {
        totalItems += cart[id];
        totalPrice += item.price * cart[id];
      }
    }
    return { totalItems, totalPrice };
  }, [cart, menuItems]);

  if (totalItems === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 p-4 flex justify-center">
      <div className="w-full max-w-3xl bg-emerald-600 text-white rounded-lg shadow-2xl flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <ShoppingCart size={20} />
          <span className="font-bold">
            {totalItems} {totalItems > 1 ? "Items" : "Item"}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="font-extrabold text-lg">
            ${totalPrice.toFixed(2)}
          </span>
          <button className="font-bold flex items-center gap-2">
            View Cart <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

// --- MAIN PAGE COMPONENT ---
const ZomatoStyleMenuPage = () => {
  const [cart, setCart] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState(
    Object.keys(menuData)[0]
  );

  const sectionRefs = useRef({});
  const observerRef = useRef(null);

  // Flatten all menu items into a single array for easier lookup
  const allItems = useMemo(() => Object.values(menuData).flat(), []);

  // Memoized and deduplicated list of bestsellers
  const bestsellers = useMemo(() => {
    const uniqueBestsellers = new Map();
    allItems.forEach((item) => {
      if (item.isBestseller) {
        uniqueBestsellers.set(item.id, item);
      }
    });
    return Array.from(uniqueBestsellers.values());
  }, [allItems]);

  // Filtered menu data based on search term
  const filteredMenuData = useMemo(() => {
    if (!searchTerm.trim()) return menuData;

    const lowercasedFilter = searchTerm.toLowerCase();
    const filtered = {};

    Object.entries(menuData).forEach(([category, items]) => {
      const matchingItems = items.filter(
        (item) =>
          item.name.toLowerCase().includes(lowercasedFilter) ||
          item.description.toLowerCase().includes(lowercasedFilter)
      );
      if (matchingItems.length > 0) {
        filtered[category] = matchingItems;
      }
    });
    return filtered;
  }, [searchTerm]);

  const visibleCategories = Object.keys(filteredMenuData);

  // Scroll to category logic
  const scrollToCategory = (category) => {
    sectionRefs.current[category]?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  // Intersection Observer for active category highlighting
  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect();

    const observerOptions = {
      rootMargin: "-120px 0px -60% 0px", // Top offset for sticky header, bottom offset to trigger earlier
      threshold: 0,
    };

    const callback = (entries) => {
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

    return () => {
      if (observer) observer.disconnect();
    };
  }, [filteredMenuData]); // Rerun when search term changes the layout

  return (
    <div className="bg-slate-50 min-h-screen font-sans" suppressHydrationWarning>
      {/* Header */}
      <header className="sticky top-0 z-20 bg-white p-4 border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto">
          <div className="relative">
            <input
              type="text"
              placeholder="Search for dishes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition"
            />
            <Search
              size={20}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
          </div>
        </div>
      </header>

      {/* Mobile Category Navigation */}
      <nav className="lg:hidden sticky top-[81px] z-10 bg-white/80 backdrop-blur-sm p-2 border-b border-slate-200">
        <div className="flex gap-2 overflow-x-auto whitespace-nowrap pb-2">
          {visibleCategories.map((category) => (
            <button
              key={category}
              onClick={() => scrollToCategory(category)}
              className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-colors ${
                activeCategory === category
                  ? "bg-emerald-600 text-white"
                  : "bg-slate-100 text-slate-700"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </nav>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 px-4">
        {/* Main Menu Content (Center) */}
        <main className="lg:col-span-8 py-8">
          {/* Bestsellers Section */}
          {bestsellers.length > 0 && !searchTerm && (
            <section className="mb-10">
              <h2 className="text-3xl font-extrabold text-slate-900 mb-4 tracking-tight">
                Bestsellers
              </h2>
              <div className="flex gap-4 pb-4 -mx-4 px-4 overflow-x-auto">
                {bestsellers.map((item) => (
                  <BestsellerCard
                    key={`bestseller-${item.id}`}
                    item={item}
                    cart={cart}
                    setCart={setCart}
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
                ref={(el) => (sectionRefs.current[category] = el)}
                className="pt-8 -mt-8" // Padding/margin trick for accurate scroll-spy
              >
                <h2 className="text-3xl font-extrabold text-slate-900 my-6 tracking-tight">
                  {category}
                </h2>
                <div className="divide-y divide-slate-100">
                  {items.map((item) => (
                    <MenuItemCard
                      key={`item-${item.id}`}
                      item={item}
                      cart={cart}
                      setCart={setCart}
                    />
                  ))}
                </div>
              </section>
            ))
          ) : (
            <div className="text-center py-20">
              <h3 className="text-xl font-semibold text-slate-700">
                No Dishes Found
              </h3>
              <p className="text-slate-500 mt-2">
                Try searching for something else!
              </p>
            </div>
          )}
        </main>

        {/* Right Side Category Navigation (Desktop) */}
        <aside className="hidden lg:block lg:col-span-4 py-8">
          <nav className="sticky top-24">
            <h3 className="font-bold text-lg mb-4 text-slate-800">Menu</h3>
            <ul className="space-y-1">
              {visibleCategories.map((category) => (
                <li key={category}>
                  <button
                    onClick={() => scrollToCategory(category)}
                    className={`w-full text-left px-4 py-2.5 rounded-lg transition-all text-sm font-semibold flex justify-between items-center ${
                      activeCategory === category
                        ? "bg-emerald-100/80 text-emerald-800"
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <span>{category}</span>
                    {activeCategory === category && <ChevronRight size={16} />}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </aside>
      </div>

      {/* Floating Cart Widget */}
      <CartWidget cart={cart} menuItems={allItems} />
    </div>
  );
};

export default ZomatoStyleMenuPage;
