import useCart from "@/hooks/useCart";
import { ChevronRight, ShoppingCart } from "lucide-react";
import { motion } from "framer-motion";

const CartWidget = () => {
  const { totalItems, totalPrice } = useCart();

  if (totalItems === 0) return null;

  return (
    <motion.div
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 80, opacity: 0 }}
      transition={{ type: "spring", stiffness: 60, damping: 12 }}
      className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[92%] max-w-md z-50"
    >
      <div className="bg-primary text-primary-foreground backdrop-blur-md border border-border/40 shadow-xl rounded-full px-5 py-3 flex items-center justify-between gap-4 cursor-pointer hover:shadow-2xl transition-all duration-200">
        <div className="flex items-center gap-3">
          <div className="bg-primary  p-2 rounded-full">
            <ShoppingCart size={18} className="text-primary-foreground" />
          </div>
          <div className="leading-tight">
            <p className="text-xs font-medium opacity-90">
              {totalItems} {totalItems > 1 ? "Items" : "Item"}
            </p>
            <p className="text-sm font-semibold">
              ₹{totalPrice}{" "}
              <span className="text-[10px] text-gray-300 dark:text-gray-500 font-medium">+ GST</span>
            </p>
          </div>
        </div>
        <button className="flex items-center gap-1 text-sm font-medium hover:underline underline-offset-4 transition-all">
          View Cart <ChevronRight size={16} />
        </button>
      </div>
    </motion.div>
  );
};

export default CartWidget;
