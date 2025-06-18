"use client";

import { Package, UtensilsCrossed } from "lucide-react";
import { JSX } from "react";

type Props = {
  orderType: "dinein" | "takeaway";
  onChange: (type: "dinein" | "takeaway") => void;
};
  

const OrderTypeSelector = ({ orderType, onChange }: Props) => {
    const options: Array<{type: "dinein" | "takeaway", label: string, icon: JSX.Element}> = [
      { type: "dinein", label: "Dine In", icon: <UtensilsCrossed size={16} /> },
      { type: "takeaway", label: "Takeaway", icon: <Package size={16} /> },
    ];

  return (
    <div className="flex justify-start sm:justify-start gap-2 sm:gap-3">
      {options.map(({ type, label, icon }) => (
        <button
          key={type}
          onClick={() => onChange(type)}
          className={`flex items-center gap-1 text-xs px-3 py-1.5 rounded-full border font-medium transition-all
      ${
        orderType === type
          ? "bg-primary text-primary-foreground border-primary"
          : "bg-muted text-muted-foreground border-border"
      }`}
        >
          {icon}
          <span>{label}</span>
        </button>
      ))}
    </div>
  );
};

export default OrderTypeSelector;
