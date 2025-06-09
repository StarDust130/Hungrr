import { Minus, Plus } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { MenuItem } from "@/types/menu";
import useCart from "@/hooks/useCart";

const AddToCartButton = ({ item }: { item: MenuItem }) => {
  const { addToCart, removeFromCart, getQuantity } = useCart();
  const quantity = getQuantity(item.id);

  return (
    <div className="relative w-28 h-10">
      <AnimatePresence mode="wait" initial={false}>
        {quantity === 0 ? (
          <motion.button
            key="add"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            onClick={() => addToCart(item)}
            className="absolute inset-0 flex items-center justify-center rounded-3xl border border-primary text-primary font-medium shadow-sm hover:shadow-md transition-all duration-200 hover:scale-[1.03] text-sm px-4"
          >
            Add
          </motion.button>
        ) : (
          <motion.div
            key="quantity"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="absolute inset-0 flex items-center justify-between bg-primary text-primary-foreground rounded-xl overflow-hidden shadow-md"
          >
            <button
              onClick={() => removeFromCart(item.id)}
              className="w-10 h-full flex items-center justify-center hover:bg-primary/90 transition-colors"
              aria-label="Remove"
            >
              <Minus size={16} />
            </button>
            <span className="text-sm font-semibold">{quantity}</span>
            <button
              onClick={() => addToCart(item)}
              className="w-10 h-full flex items-center justify-center hover:bg-primary/90 transition-colors"
              aria-label="Add"
            >
              <Plus size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AddToCartButton;
