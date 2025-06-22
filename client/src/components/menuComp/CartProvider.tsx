"use client";

import { log } from "@/lib/helper";
import { Cart, CartContextType, MenuItem } from "@/types/menu";
import {
  useMemo,
  useState,
  useEffect,
  createContext,
  useCallback,
} from "react";

//! Create Context for Cart 🛒
export const CartContext = createContext<CartContextType | null>(null);

const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [cart, setCart] = useState<Cart>({});

  //! Load cart from localStorage on component mount (client-side only)
  useEffect(() => {
    try {
      const storedCart = localStorage.getItem("cart");
      if (storedCart) {
        setCart(JSON.parse(storedCart));
      }
    } catch (error) {
      console.error("Failed to parse cart from localStorage", error);
    }
  }, []);

  //! Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

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

  //! Remove an item from the cart
  const removeFromCart = useCallback((itemId: number) => {
    setCart((prev) => {
      const existing = prev[itemId];
      if (!existing) return prev;

      if (existing.quantity > 1) {
        return {
          ...prev,
          [itemId]: { ...existing, quantity: existing.quantity - 1 },
        };
      }
      const newCart = { ...prev };
      delete newCart[itemId];
      return newCart;
    });
  }, []);

//! Clear a specific item from the cart
  const clearItemFromCart = useCallback((itemId: number) => {
    setCart((prev) => {
      const newCart = { ...prev };
      delete newCart[itemId];
      return newCart;
    });
  }, []);

  //! ✨ NEW: Function to clear the entire cart
  const clearCart = useCallback(() => {
    setCart({});
  }, []);

  const getQuantity = useCallback(
    (itemId: number) => {
      return cart[itemId]?.quantity || 0;
    },
    [cart]
  );

  //! Calculate total items and total price using useMemo for performance optimization
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
  
  

  log("CartProvider state 😇:", {
    cart,
    addToCart,
    removeFromCart,
    clearItemFromCart,
    getQuantity,
    totalItems,
    totalPrice,
    clearCart,
  });

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
        clearCart, // Provide the new function to your app
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export default CartProvider;
