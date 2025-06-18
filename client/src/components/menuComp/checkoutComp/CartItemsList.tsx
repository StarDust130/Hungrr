"use client";

import { Button } from "@/components/ui/button";
import { Minus, Plus, Trash2 } from "lucide-react";
import SafeImage from "@/components/elements/SafeImage";
import { CartItem, MenuItem } from "@/types/menu";
import useCart from "@/hooks/useCart";

interface Props {
  items: CartItem[];
  onAdd: (item: MenuItem) => void;
  onRemove: (itemId: number) => void;
  onClear: (itemId: number) => void;
}


const CartItemsList = ({ items }: Props) => {
  const { addToCart, removeFromCart, clearItemFromCart } = useCart();

  return (
    <ul className="space-y-3">
      {items.map(({ item, quantity }) => (
        <li
          key={item.id}
          className="flex p-3 bg-muted/40 rounded-xl shadow-sm border border-border/50"
        >
          <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border">
            <SafeImage
              src={item.food_image_url || ""}
              alt={item.name}
              className="h-full w-full object-cover"
            />
          </div>

          <div className="ml-3 flex flex-1 flex-col justify-between">
            <div className="flex justify-between items-start gap-2">
              <div className="flex flex-col">
                <h3 className="text-sm font-semibold leading-tight">
                  {item.name}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  ₹{Number(item.price).toFixed(2)} each
                </p>
              </div>
              <p className="text-sm font-mono font-medium whitespace-nowrap">
                ₹{(item.price * quantity).toFixed(2)}
              </p>
            </div>

            <div className="flex justify-between items-center mt-3">
              <div className="flex items-center gap-2">
                <Button
                  size="icon"
                  variant="outline"
                  className="w-8 h-8 rounded-full"
                  onClick={() => removeFromCart(item.id)}
                >
                  <Minus size={14} />
                </Button>
                <span className="text-sm font-semibold w-6 text-center">
                  {quantity}
                </span>
                <Button
                  size="icon"
                  variant="outline"
                  className="w-8 h-8 rounded-full"
                  onClick={() => addToCart(item)}
                >
                  <Plus size={14} />
                </Button>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-red-500"
                onClick={() => clearItemFromCart(item.id)}
              >
                <Trash2 size={16} />
              </Button>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
};

export default CartItemsList;
