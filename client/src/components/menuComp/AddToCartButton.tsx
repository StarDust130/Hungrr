"use client";

import { useMemo } from "react";
import { Minus, Plus, Check } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { MenuItem } from "@/types/menu";
import useCart from "@/hooks/useCart";
import VariantSelectorDrawer from "./VariantSelectorDrawer";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
  DrawerTrigger,
  DrawerClose,
} from "@/components/ui/drawer";
import { Button } from "../ui/button";

const AddToCartButton = ({
  item,
  className,
}: {
  item: MenuItem;
  className?: string;
}) => {
  const { addToCart, removeFromCart, getQuantity } = useCart();
  const hasVariants = item.variants && item.variants.length > 0;

  const simpleQuantity = getQuantity(item.id);

  const totalQuantity = useMemo(() => {
    if (!hasVariants) {
      return getQuantity(item.id, undefined); // For simple items
    }
    // For items with variants, sum up the quantity of each variant
    return item.variants.reduce((total, variant) => {
      return total + getQuantity(item.id, variant.id);
    }, 0);
  }, [getQuantity, item, hasVariants]);


 const isSelected = totalQuantity > 0;

  return (
    <Drawer>
      <div className={`relative ${className || ""} w-28`}>
        <AnimatePresence mode="wait" initial={false}>
          {hasVariants ? (
            <DrawerTrigger asChild>
              {!isSelected ? (
                <motion.button
                  key="add"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2, ease: "easeInOut" }}
                  className="w-full h-10 border border-primary text-primary text-sm font-semibold rounded-full shadow-sm hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-center justify-center gap-1">
                    <Plus size={16} strokeWidth={3} />
                    <span>Add</span>
                  </div>
                </motion.button>
              ) : (
                <motion.button
                  key="variant-selected"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2, ease: "easeInOut" }}
                  className="w-full h-10 rounded-full border border-primary text-primary flex items-center justify-center gap-1 text-[12px] font-semibold hover:shadow-sm hover:border-primary/80 transition"
                >
                  <Check size={12} strokeWidth={2.2} className="text-primary" />
                  <span>Selected ({totalQuantity})</span>
                </motion.button>
              )}
            </DrawerTrigger>
          ) : simpleQuantity === 0 ? (
            <motion.button
              key="simple-add"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              onClick={() => addToCart(item)}
              className="w-full h-10 border border-primary text-primary text-sm font-semibold rounded-full shadow-sm hover:shadow-md transition"
            >
              <div className="flex items-center justify-center gap-1">
                <Plus size={16} strokeWidth={3} />
                <span>Add</span>
              </div>
            </motion.button>
          ) : (
            <motion.div
              key="simple-qty"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="flex items-center justify-between border border-primary rounded-full px-1.5 h-10 text-primary text-[13px] font-medium"
            >
              <button
                onClick={() => removeFromCart(item.id)}
                className="w-9 h-9 flex items-center justify-center hover:bg-muted rounded-full transition"
              >
                <Minus size={16} strokeWidth={2} />
              </button>
              <span className="font-semibold">{simpleQuantity}</span>
              <button
                onClick={() => addToCart(item)}
                className="w-9 h-9 flex items-center justify-center hover:bg-muted rounded-full transition"
              >
                <Plus size={16} strokeWidth={2} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {hasVariants && (
          <span className="absolute left-1/2 -bottom-3.5 translate-x-[-50%] text-[9px] dark:text-muted-foreground opacity-70 font-light pointer-events-none">
            Customizable
          </span>
        )}
      </div>

      {/* Drawer content */}
      {hasVariants && (
        <DrawerContent className="p-0 bg-background rounded-t-2xl max-h-[85vh] flex flex-col mx-auto">
          <DrawerTitle></DrawerTitle>
          <DrawerHeader></DrawerHeader>

          {/* Scrollable content */}
          <div className="overflow-y-auto flex-1 p-4 pt-5 space-y-4">
            <VariantSelectorDrawer item={item} />
          </div>

          {/* Fixed footer */}
          <DrawerFooter className="p-4 border-t bg-background ">
            <DrawerClose asChild>
              <Button className=" w-full mx-auto text-center rounded-full text-sm font-semibold">
                {totalQuantity === 0
                  ? "Pick something yummy 🤤"
                  : "Looks tasty! Add now  😋"}
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      )}
    </Drawer>
  );
};

export default AddToCartButton;
