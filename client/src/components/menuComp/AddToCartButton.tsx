import { Minus, Plus } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { MenuItem } from "@/types/menu";
import useCart from "@/hooks/useCart";

const AddToCartButton = ({
  item,
  className,
}: {
  item: MenuItem;
  className?: string | undefined;
}) => {
  const { addToCart, removeFromCart, getQuantity } = useCart();
  const quantity = getQuantity(item.id);

  return (
    <div className={`relative w-28 h-10 ${className || ""}`}>
      <AnimatePresence mode="wait" initial={false}>
        {quantity === 0 ? (
          <motion.button
            key="add"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            onClick={() => addToCart(item)}
            className="absolute inset-0 flex items-center justify-center gap-1 rounded-full border border-primary text-primary font-semibold text-[13px] shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_1px_4px_rgba(0,0,0,0.06)] hover:shadow-[0_2px_8px_rgba(0,0,0,0.1)] active:scale-95 transition-all duration-200 px-4"
          >
            <Plus size={16} strokeWidth={3} />
            <span>Add</span>
          </motion.button>
        ) : (
          <motion.div
            key="quantity"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="absolute inset-0 flex items-center justify-between border border-primary rounded-full text-primary px-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_1px_4px_rgba(0,0,0,0.05)] text-[13px] font-medium"
          >
            <button
              onClick={() => removeFromCart(item.id)}
              className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-muted transition-colors duration-150"
              aria-label="Remove"
            >
              <Minus size={16} strokeWidth={2} />
            </button>
            <span className="font-semibold">{quantity}</span>
            <button
              onClick={() => addToCart(item)}
              className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-muted transition-colors duration-150"
              aria-label="Add"
            >
              <Plus size={16} strokeWidth={2} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AddToCartButton;
