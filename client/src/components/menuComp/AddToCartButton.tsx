import { Minus, Plus } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { MenuItem } from "@/types/menu";
import useCart from "@/hooks/useCart";

const AddToCartButton = ({ item }: { item: MenuItem }) => {
  const { addToCart, removeFromCart, getQuantity } = useCart();
  const quantity = getQuantity(item.id);

  return (
    <div className="relative w-28 h-10">
      <AnimatePresence>
        {quantity === 0 ? (
          <motion.button
            key="add"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => addToCart(item)}
            className="absolute inset-0 bg-card border border-primary text-primary font-bold py-2 px-4 rounded-lg shadow-sm hover:bg-primary/10 transition-colors duration-200 flex items-center justify-center"
          >
            Add
          </motion.button>
        ) : (
          <motion.div
            key="quantity"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute inset-0 flex items-center justify-between bg-primary text-primary-foreground font-bold rounded-lg shadow-sm"
          >
            <button
              onClick={() => removeFromCart(item.id)}
              className="w-10 h-full flex items-center justify-center text-lg rounded-l-lg hover:bg-primary/80 transition-colors"
            >
              <Minus size={16} />
            </button>
            <span className="text-sm font-bold">{quantity}</span>
            <button
              onClick={() => addToCart(item)}
              className="w-10 h-full flex items-center justify-center text-lg rounded-r-lg hover:bg-primary/80 transition-colors"
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