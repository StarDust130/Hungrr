import useCart from "@/hooks/useCart";
import { ChevronRight, ShoppingCart } from "lucide-react";
import {  motion } from "framer-motion";


const CartWidget = () => {
  const { totalItems, totalPrice } = useCart();

  if (totalItems === 0) return null;

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      transition={{ type: "spring", stiffness: 50 }}
      className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[92%] max-w-md z-50"
    >
      <div className="bg-primary text-primary-foreground rounded-xl shadow-2xl flex items-center justify-between p-4 font-bold">
        <div className="flex items-center gap-3">
          <ShoppingCart size={20} />
          <div>
            <span className="block text-sm">
              {totalItems} {totalItems > 1 ? "Items" : "Item"}
            </span>
            <span className="block text-xs opacity-80">
            ₹{totalPrice}
            </span>
          </div>
        </div>
        <button className="flex items-center gap-2 text-sm">
          View Cart <ChevronRight size={18} />
        </button>
      </div>
    </motion.div>
  );
};

export default CartWidget;