
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
  image?: string;
  rating: number;
  dietary: DietaryType;
  tags: string[];
  isBestseller?: boolean;
}

export interface MenuData {
  [category: string]: MenuItem[];
}

export type Cart = { [itemId: number]: number };

export interface CartContextType {
  cart: Cart;
  addToCart: (item: MenuItem) => void;
  removeFromCart: (itemId: number) => void; // Changed to accept itemId for simplicity
  clearItemFromCart: (itemId: number) => void; // New: to completely remove an item
  getQuantity: (itemId: number) => number;
  totalItems: number;
  totalPrice: number;
}
