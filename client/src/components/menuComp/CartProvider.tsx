"use client";
import menuData from "@/lib/data";
import { Cart, CartContextType, MenuItem } from "@/types/menu";
import { useMemo, useState, createContext } from "react";


export const CartContext = createContext<CartContextType | null>(null);

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

export default CartProvider;