/* eslint-disable @typescript-eslint/no-explicit-any */
import type { OrderStatus } from "@prisma/client";

export const DIETARY_OPTIONS = ["veg", "non_veg", "vegan"] as const;
export type DietaryType = (typeof DIETARY_OPTIONS)[number];

export interface CafeInfo {
  name: string;
  tagline: string;
  bannerUrl: string;
  rating: number;
  reviews: number;
  openingTime: string;
  currency: string;
  id: string;
  is_active: boolean;
  logoUrl: string;
  slug: string;
}

export interface ItemVariant {
  id: number;
  itemId: number;
  name: string;
  price: number;
}

export interface MenuItem {
  id: number;
  name: string;
  price: number;
  description?: string;
  food_image_url?: string;
  isSpecial?: boolean;
  dietary?: DietaryType;
  tags?: string;
  is_available?: boolean;
  is_active?: boolean;
  categoryId?: number;
  cafeId: number;
  variants: ItemVariant[];
}

export interface CartItem {
  item: MenuItem;
  quantity: number;
  variant?: ItemVariant;
}

export interface Cart {
  [key: string]: CartItem;
}

export interface CartContextType {
  cart: Cart;
  totalItems: number;
  totalPrice: number;
  addToCart: (item: MenuItem, variant?: ItemVariant) => void;
  removeFromCart: (itemId: number, variantId?: number) => void;
  clearItemFromCart: (itemId: number, variantId?: number) => void;
  clearCart: () => void;
  getQuantity: (itemId: number, variantId?: number) => number;
  loadOrderIntoCart: (orderItems: any[]) => void;
  cafeId: number | null;
  setCafeId: (id: number) => void;
}

export interface MenuData {
  [category: string]: MenuItem[];
}

export interface BillData {
  id: number;
  timestamp: string;
  items: {
    id: number;
    itemId: number;
    quantity: number;
    variantId?: number;
    item: MenuItem;
    variant?: ItemVariant;
  }[];
  totalPrice: number;
  paymentMethod: PaymentMethod;
  paymentStatus: "paid" | "pending";
  status: OrderStatus;
  tableNo: number;
  orderType: "dinein" | "takeaway";
  cafeName: string;
  logoUrl: string;
  gstNo: string;
  payment_url: string;
  address: string;
  publicId: string;
}

export interface OrderFromServer {
  id: number;
  paid: boolean;
  status: OrderStatus;
  items: CartItem[];
}

export interface ActiveOrder {
  id: number;
  publicId: string;
  status: string;
}

export type OrderStatus =
  | "pending"
  | "accepted"
  | "preparing"
  | "ready"
  | "completed";
