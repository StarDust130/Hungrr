import { MenuItem } from "@/types/menu";
import { Plus, Minus, Sparkles } from "lucide-react";
import useCart from "@/hooks/useCart";
import DietaryIcon from "./DietaryIcon";
import { Button } from "@/components/ui/button";
import SafeImage from "../elements/SafeImage";
import TagBadge from "./TagBadge";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function VariantSelectorDrawer({ item }: { item: MenuItem }) {
  const { addToCart, removeFromCart, getQuantity } = useCart();

  return (
    <div className="w-full max-w-md mx-auto flex flex-col gap-4">
      <div
        aria-describedby={item.description ? "drawer-description" : undefined}
        className="p-4 pt-5 space-y-5 border rounded-3xl bg-background shadow-sm"
      >
        {/* Item Header */}
        <div className="flex items-start gap-4">
          {item.food_image_url && (
            <div className="w-16 h-16 rounded-md overflow-hidden flex-shrink-0 border">
              <SafeImage
                src={item.food_image_url}
                alt={item.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="flex flex-col gap-1 w-full">
            <div className="flex items-center gap-2 text-base font-semibold text-foreground leading-tight">
              {item.dietary && <DietaryIcon type={item.dietary} />}
              <span>{item.name}</span>
            </div>

            {item.isSpecial && (
              <div className="flex items-center gap-1 text-xs font-bold text-[#fbcb3a] dark:text-[#fcd253]">
                <Sparkles size={14} className="fill-current" />
                Must Try
              </div>
            )}

            {item.tags && (
              <div className="flex flex-wrap gap-1">
                <TagBadge tag={item.tags} />
              </div>
            )}
          </div>
        </div>

        {/* Accordion Variants */}
        <Accordion type="multiple" defaultValue={["item-1"]}>
          <AccordionItem value="item-1">
            <AccordionTrigger className="text-sm font-semibold">
              How hungry are you? 😎
            </AccordionTrigger>
            <AccordionContent>
              {item.variants && item.variants.length > 0 && (
                <div className="space-y-3">
                  {item.variants.map((variant) => {
                    // ✅ Fetch quantity using the correct numeric IDs
                    const quantity = getQuantity(item.id, variant.id);

                    return (
                      <div
                        key={variant.id} // Use the unique variant ID for the key
                        className="flex items-center justify-between border border-border/30 rounded-lg px-3 py-2"
                      >
                        <div className="flex flex-col flex-1 pr-2">
                          <span className="text-sm font-medium text-foreground">
                            {variant.name}
                          </span>
                          <span className="text-xs font-semibold text-primary mt-0.5">
                            ₹{Number(variant.price).toFixed(2)}
                          </span>
                        </div>

                        {/* Quantity Controls */}
                        {quantity === 0 ? (
                          <Button
                            // ✅ Pass original item and the specific variant
                            onClick={() => addToCart(item, variant)}
                            className="h-8 px-3 text-xs font-medium border border-primary text-primary rounded-full"
                            variant="outline"
                          >
                            <Plus size={12} /> Add
                          </Button>
                        ) : (
                          <div className="flex items-center gap-1 border border-primary rounded-full px-2 py-1">
                            <button
                              // ✅ Pass numeric IDs to remove
                              onClick={() =>
                                removeFromCart(item.id, variant.id)
                              }
                              className="w-5 h-5 rounded-full flex items-center justify-center hover:bg-muted transition"
                            >
                              <Minus size={10} strokeWidth={2} />
                            </button>
                            <span className="px-1 font-semibold text-xs">
                              {quantity}
                            </span>
                            <button
                              // ✅ Pass original item and the specific variant to add
                              onClick={() => addToCart(item, variant)}
                              className="w-5 h-5 rounded-full flex items-center justify-center hover:bg-muted transition"
                            >
                              <Plus size={10} strokeWidth={2} />
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
}
