"use client";

import {
  useState,
  useEffect,
  createContext,
  useCallback,
  useMemo,
} from "react";
import { Cart, CartContextType, MenuItem, BillData } from "@/types/menu";
import { log } from "@/lib/helper";

// The context is created expecting the CartContextType shape
export const CartContext = createContext<CartContextType | null>(null);

const getInitialCart = (): Cart => {
  if (typeof window === "undefined") return {};
  try {
    const storedCart = localStorage.getItem("cart");
    return storedCart ? JSON.parse(storedCart) : {};
  } catch (error) {
    console.error("Failed to parse cart from localStorage", error);
    return {};
  }
};

const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [cart, setCart] = useState<Cart>(getInitialCart);

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  // The type BillData['items'] ensures we expect an array of items
  // with the exact shape defined in your BillData interface.
  const loadOrderIntoCart = useCallback((orderItems: BillData["items"]) => {
    const newCart: Cart = {};
    orderItems.forEach((serverItem) => {
      // The item from the server might have a simpler structure,
      // so we rebuild it into a full MenuItem for consistency in the cart.
      if (serverItem.item && serverItem.item.id) {
        const fullMenuItem: MenuItem = {
          ...serverItem.item,
          // Add default/empty values for fields that might not be sent by the server
          // to fully satisfy the MenuItem type definition.
          description: serverItem.item.description || "",
          rating: serverItem.item.rating || 0,
          dietary: serverItem.item.dietary || "veg",
          tags: serverItem.item.tags || [],
          isSpecial: serverItem.item.isSpecial || false,
        };

        newCart[serverItem.item.id] = {
          item: fullMenuItem,
          quantity: serverItem.quantity,
        };
      }
    });
    setCart(newCart);
    log("🛒 Cart synced with active server order.");
  }, []);

  const addToCart = useCallback((item: MenuItem) => {
    setCart((prev) => {
      const existing = prev[item.id];
      return {
        ...prev,
        [item.id]: {
          item,
          quantity: existing ? existing.quantity + 1 : 1,
        },
      };
    });
  }, []);

  const removeFromCart = useCallback((itemId: number) => {
    setCart((prev) => {
      const newCart = { ...prev };
      if (newCart[itemId]?.quantity > 1) {
        newCart[itemId].quantity -= 1;
      } else {
        delete newCart[itemId];
      }
      return newCart;
    });
  }, []);

  const clearItemFromCart = useCallback((itemId: number) => {
    setCart((prev) => {
      const newCart = { ...prev };
      delete newCart[itemId];
      return newCart;
    });
  }, []);

  const clearCart = useCallback(() => {
    setCart({});
  }, []);

  const getQuantity = useCallback(
    (itemId: number) => cart[itemId]?.quantity || 0,
    [cart]
  );

  const { totalItems, totalPrice } = useMemo(() => {
    return Object.values(cart).reduce(
      (acc, entry) => {
        const price = Number(entry.item?.price);
        if (entry && entry.item && !isNaN(price)) {
          acc.totalItems += entry.quantity;
          acc.totalPrice += price * entry.quantity;
        }
        return acc;
      },
      { totalItems: 0, totalPrice: 0 }
    );
  }, [cart]);

  return (
    <CartContext.Provider
      // ✅ FIX: The 'value' prop must be an object with the actual functions,
      // not their type definitions.
      value={{
        cart,
        totalItems,
        totalPrice,
        addToCart,
        removeFromCart,
        clearItemFromCart,
        clearCart,
        getQuantity,
        // We pass the actual function 'loadOrderIntoCart' here.
        loadOrderIntoCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export default CartProvider;
