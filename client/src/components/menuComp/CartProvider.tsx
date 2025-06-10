"use client";
import { Cart, CartContextType, MenuItem } from "@/types/menu";
import { useMemo, useState, useEffect, createContext } from "react";

//! Create Context for Cart 🛒
export const CartContext = createContext<CartContextType | null>(null);

const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [cart, setCart] = useState<Cart>({});

  //! Load cart from localStorage on first render
  useEffect(() => {
    const storedCart = localStorage.getItem("cart");
    if (storedCart) {
      setCart(JSON.parse(storedCart));
    }
  }, []);

  //! Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  //! Add or increase quantity of item in cart
  const addToCart = (item: MenuItem) => {
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
  };

  //! Remove 1 quantity or delete item if 1 left
  const removeFromCart = (itemId: number) => {
    setCart((prev) => {
      const existing = prev[itemId];
      if (!existing) return prev;

      if (existing.quantity > 1) {
        return {
          ...prev,
          [itemId]: {
            ...existing,
            quantity: existing.quantity - 1,
          },
        };
      } else {
        const newCart = { ...prev };
        delete newCart[itemId];
        return newCart;
      }
    });
  };

  //! Clear item completely
  const clearItemFromCart = (itemId: number) => {
    setCart((prev) => {
      const newCart = { ...prev };
      delete newCart[itemId];
      return newCart;
    });
  };

  //! Get item quantity
  const getQuantity = (itemId: number) => {
    return cart[itemId]?.quantity || 0;
  };

  //! Total items and total price
  const { totalItems, totalPrice } = useMemo(() => {
    let items = 0;
    let price = 0;
    for (const id in cart) {
      const entry = cart[id];
      items += entry.quantity;
      price += entry.item.price * entry.quantity;
    }
    return { totalItems: items, totalPrice: price };
  }, [cart]);

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

export default CartProvider;
