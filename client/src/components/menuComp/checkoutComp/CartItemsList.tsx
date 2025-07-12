"use client";

import { Button } from "@/components/ui/button";
import { Minus, Plus, Trash2 } from "lucide-react";
import SafeImage from "@/components/elements/SafeImage";
import { CartItem, MenuItem } from "@/types/menu";

interface Props {
  items: CartItem[];
  onAdd: (item: MenuItem, variantId?: number) => void;
  onRemove: (itemId: number, variantId?: number) => void;
  onClear: (itemId: number, variantId?: number) => void;
}

const CartItemsList = ({ items, onAdd, onRemove, onClear }: Props) => {
  return (
    <ul className="space-y-4">
      {items.map(({ item, quantity, variant }) => {
        const hasImage = !!item.food_image_url;
        const price = Number(item.price) || 0;

        return (
          <li
            key={`${item.id}-${variant?.id || "base"}`}
            className={`flex w-full gap-4 rounded-xl border border-border/50 shadow-sm transition-all ${
              hasImage
                ? "bg-muted/40 p-3 items-start"
                : "bg-background p-4 items-center"
            }`}
          >
            {hasImage && (
              <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border">
                <SafeImage
                  src={item.food_image_url || ""}
                  alt={item.name}
                  className="h-full w-full object-cover"
                />
              </div>
            )}

            <div className="flex-1 flex flex-col justify-between gap-2">
              <div className="flex justify-between items-start gap-3">
                <div className="flex flex-col gap-0.5">
                  <h3 className="text-base font-semibold text-foreground">
                    {item.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    ₹{price.toFixed(2)} each
                  </p>
                </div>
                <p className="text-sm font-mono font-semibold whitespace-nowrap">
                  ₹{(price * quantity).toFixed(2)}
                </p>
              </div>

              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Button
                    size="icon"
                    variant="outline"
                    className="w-8 h-8 rounded-full"
                    onClick={() => onRemove(item.id, variant?.id)}
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
                    onClick={() => onAdd(item, variant?.id)}
                  >
                    <Plus size={14} />
                  </Button>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-red-500"
                  onClick={() => onClear(item.id, variant?.id)}
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
};

export default CartItemsList;
