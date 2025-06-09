import { Minus, Plus } from "lucide-react";

interface AddToCartButtonProps {
  item: {
    id: string;
    name: string;
    price: number;
  };
  cart: Record<string, number>;
  setCart: React.Dispatch<React.SetStateAction<Record<string, number>>>;
}

const AddToCartButton = ({ item, cart, setCart }: AddToCartButtonProps) => {
  const quantity = cart[item.id] || 0;

  const handleAdd = (e: { stopPropagation: () => void; }) => {
    e.stopPropagation(); // Prevent card click events
    setCart((prev) => ({ ...prev, [item.id]: (prev[item.id] || 0) + 1 }));
  };

  const handleSubtract = (e: { stopPropagation: () => void; }) => {
    e.stopPropagation();
    setCart((prev) => {
      const newCart = { ...prev };
      if (newCart[item.id] > 1) {
        newCart[item.id] -= 1;
      } else {
        delete newCart[item.id];
      }
      return newCart;
    });
  };

  if (quantity === 0) {
    return (
      <button
        onClick={handleAdd}
        className="text-sm font-bold text-emerald-600 border border-slate-300 rounded-lg px-6 py-2 bg-white hover:bg-emerald-50/50 transition-all shadow-sm"
      >
        ADD
      </button>
    );
  }

  return (
    <div className="flex items-center justify-center bg-white border border-slate-300 rounded-lg shadow-sm">
      <button
        onClick={handleSubtract}
        className="px-3 py-2 text-emerald-600 hover:bg-emerald-50/50 rounded-l-lg"
        aria-label="Remove one item"
      >
        <Minus size={16} />
      </button>
      <span className="px-3 py-2 text-sm font-bold text-emerald-600 tabular-nums">
        {quantity}
      </span>
      <button
        onClick={handleAdd}
        className="px-3 py-2 text-emerald-600 hover:bg-emerald-50/50 rounded-r-lg"
        aria-label="Add one more item"
      >
        <Plus size={16} />
      </button>
    </div>
  );
};

export default AddToCartButton;