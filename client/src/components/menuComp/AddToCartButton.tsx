"use client";

import { useState, useMemo } from "react";
import { Minus, Plus, Check } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { MenuItem } from "@/types/menu";
import useCart from "@/hooks/useCart";
import VariantSelectorDrawer from "./VariantSelectorDrawer";
import { Button } from "../ui/button";

const AddToCartButton = ({
  item,
  className,
}: {
  item: MenuItem;
  className?: string;
}) => {
  const { addToCart, removeFromCart, getQuantity, cart } = useCart();
  const [showDrawer, setShowDrawer] = useState(false);
  const hasVariants = item.variants && item.variants.length > 0;

  const simpleQuantity = getQuantity(item.id);

  const totalVariantQuantity = useMemo(() => {
    if (!hasVariants) return 0;
    return item.variants.reduce((total, variant) => {
      const composedId = `${item.id}-${variant.name}`;
      return total + getQuantity(composedId, variant.name);
    }, 0);
  }, [cart, item]);

  const isSelected = hasVariants
    ? totalVariantQuantity > 0
    : simpleQuantity > 0;

  return (
    <>
      <div className={`relative ${className || ""} w-28`}>
        <AnimatePresence mode="wait" initial={false}>
          {hasVariants ? (
            !isSelected ? (
              <motion.button
                key="add"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
                onClick={() => setShowDrawer(true)}
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
                onClick={() => setShowDrawer(true)}
                className="w-full h-10 rounded-full border border-primary text-primary flex items-center justify-center gap-1 text-[13px] font-semibold hover:shadow-sm hover:border-primary/80 transition"
              >
                <Check size={16} strokeWidth={2.2} className="text-primary" />
                <span>Selected ({totalVariantQuantity})</span>
              </motion.button>
            )
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

        {/* Label below for variants only (not when selected) */}
        {hasVariants && (
          <span className="absolute left-1/2 -bottom-3.5 translate-x-[-50%] text-[9px] text-muted-foreground opacity-70 font-light pointer-events-none">
            Customizable
          </span>
        )}
      </div>

      {hasVariants && (
        <VariantSelectorDrawer
          item={item}
          isOpen={showDrawer}
          setIsOpen={setShowDrawer}
        />
      )}
    </>
  );
};

export default AddToCartButton;
