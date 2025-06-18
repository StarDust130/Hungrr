
export const DIETARY_OPTIONS = ["veg", "non-veg", "vegan"] as const;
export type DietaryType = (typeof DIETARY_OPTIONS)[number];

export interface CafeInfo {
  name: string;
  tagline: string;
  bannerUrl: string;
  rating: number;
  reviews: number;
  openingTime: string;
  currency: string; // Added for currency flexibility
}

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

// Inside /types/menu.ts (or define here)
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
  clearCart: () => void; // ✨ New: Essential for clearing the cart post-order
}


export interface BillData {
  id: string;
  timestamp: string;
  items: CartItem[];
  totalPrice: number; // subtotal
  gstAmount: number; // tax
  grandTotal: number; // final total
  paymentMethod: "counter" | "online";
  paymentStatus: "pending" | "paid";
}