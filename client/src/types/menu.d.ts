// Import Prisma types to ensure frontend and backend are always in sync
import type { OrderStatus, PaymentMethod } from "@prisma/client";

// --- Your Custom Types ---

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
}

// --- Core Data Models ---

export interface MenuItem {
  id: number;
  name: string;
  price: number;
  description: string;
  food_image_url?: string;
  rating: number;
  dietary: DietaryType;
  tags: string[];
  isSpecial?: boolean;
}

export interface MenuData {
  [category: string]: MenuItem[];
}

// --- Cart-Related Types ---

export type CartItem = {
  item: MenuItem;
  quantity: number;
};

export type Cart = Record<number, CartItem>;

export interface CartContextType {
  cart: Cart;
  addToCart: (item: MenuItem) => void;
  removeFromCart: (itemId: number) => void;
  clearItemFromCart: (itemId: number) => void;
  getQuantity: (itemId: number) => number;
  totalItems: number;
  totalPrice: number;
  clearCart: () => void;
  loadOrderIntoCart: (orderItems: BillData["items"]) => void;
}

// --- Bill & Order Types ---

export interface BillData {
  id: number;
  timestamp: string;
  items: {
    item: {
      id: number;
      name: string;
      price: number;
      // You can add more properties from MenuItem here if needed
      description?: string;
      rating?: number;
      dietary?: DietaryType;
      tags?: string[];
      isSpecial?: boolean;
    };
    quantity: number;
  }[];
  totalPrice: number;
  gstAmount: number;
  grandTotal: number;
  paymentMethod: PaymentMethod; // Using Prisma type
  paymentStatus: "paid" | "pending";
  status: OrderStatus; // Using Prisma type
  tableNo?: number;
  orderType?: string;
}

// This is the improved type for the object returned from your API
export interface OrderFromServer {
  id: number;
  paid: boolean;
  status: OrderStatus;
  items: CartItem[]; // Reusing CartItem makes this clean and consistent
}


export type OrderStatus = | "pending" | "accepted" | "preparing" | "ready" | "completed";
