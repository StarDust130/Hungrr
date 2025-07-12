/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  useState,
  useEffect,
  createContext,
  useCallback,
  useMemo,
} from "react";
import { Cart, CartContextType, MenuItem, ItemVariant } from "@/types/menu";
import { log } from "@/lib/helper";

export const CartContext = createContext<CartContextType | null>(null);

const getCartItemId = (itemId: number, variantId?: number): string =>
  `${itemId}-${variantId || "base"}`;

const getInitialCart = (): Cart => {
  if (typeof window === "undefined") return {};
  try {
    const storedCart = sessionStorage.getItem("cart");
    return storedCart ? JSON.parse(storedCart) : {};
  } catch (error) {
    console.error("Failed to parse cart from sessionStorage", error);
    return {};
  }
};

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [cart, setCart] = useState<Cart>(getInitialCart);
  const [cafeId, setCafeId] = useState<number | null>(null);

  useEffect(() => {
    sessionStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  const addToCart = useCallback((item: MenuItem, variant?: ItemVariant) => {
    setCart((prev) => {
      const cartItemId = getCartItemId(item.id, variant?.id);
      const existingEntry = prev[cartItemId];
      return {
        ...prev,
        [cartItemId]: {
          item,
          variant,
          quantity: existingEntry ? existingEntry.quantity + 1 : 1,
        },
      };
    });
  }, []);

  const removeFromCart = useCallback((itemId: number, variantId?: number) => {
    setCart((prev) => {
      const cartItemId = getCartItemId(itemId, variantId);
      const newCart = { ...prev };
      if (newCart[cartItemId]?.quantity > 1) {
        newCart[cartItemId].quantity -= 1;
      } else {
        delete newCart[cartItemId];
      }
      return newCart;
    });
  }, []);

  const clearItemFromCart = useCallback(
    (itemId: number, variantId?: number) => {
      setCart((prev) => {
        const cartItemId = getCartItemId(itemId, variantId);
        const newCart = { ...prev };
        delete newCart[cartItemId];
        return newCart;
      });
    },
    []
  );

  const clearCart = useCallback(() => {
    setCart({});
  }, []);

  const getQuantity = useCallback(
    (itemId: number, variantId?: number) => {
      const cartItemId = getCartItemId(itemId, variantId);
      return cart[cartItemId]?.quantity || 0;
    },
    [cart]
  );

  const loadOrderIntoCart = useCallback((orderItems: any[]) => {
    const newCart: Cart = {};
    orderItems.forEach((serverItem) => {
      if (serverItem.item && serverItem.item.id) {
        const cartItemId = getCartItemId(
          serverItem.item.id,
          serverItem.variant?.id
        );
        newCart[cartItemId] = {
          item: {
            ...serverItem.item,
            variants: serverItem.variant
              ? [
                  {
                    id: serverItem.variant.id,
                    itemId: serverItem.item.id,
                    name: serverItem.variant.name,
                    price: Number(serverItem.variant.price),
                  },
                ]
              : [],
          },
          variant: serverItem.variant,
          quantity: serverItem.quantity,
        };
      }
    });
    setCart(newCart);
    log("🛒 Cart synced with active server order.");
  }, []);

  const { totalItems, totalPrice } = useMemo(() => {
    return Object.values(cart).reduce(
      (acc, entry) => {
        const price = Number(entry.variant?.price ?? entry.item?.price);
        if (!isNaN(price)) {
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
      value={{
        cart,
        totalItems,
        totalPrice,
        addToCart,
        removeFromCart,
        clearItemFromCart,
        clearCart,
        getQuantity,
        loadOrderIntoCart,
        cafeId,
        setCafeId,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export default CartProvider;
