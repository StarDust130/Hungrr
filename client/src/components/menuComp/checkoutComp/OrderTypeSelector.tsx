"use client";

type Props = {
  orderType: "dinein" | "takeaway";
  onChange: (type: "dinein" | "takeaway") => void;
};
  

const OrderTypeSelector = ({ orderType, onChange }: Props) => {
  const options: {
    type: "dinein" | "takeaway";
    label: string;
    emoji: string;
  }[] = [
    { type: "dinein", label: "Dine In", emoji: "🍽️" },
    { type: "takeaway", label: "Takeaway", emoji: "🥡" },
  ];

  return (
    <div className="flex justify-start sm:justify-start gap-2 sm:gap-3">
      {options.map(({ type, label, emoji }) => (
        <button
          key={type}
          onClick={() => onChange(type)}
          className={`flex items-center gap-1 text-xs px-3 py-1.5  rounded-full border font-medium transition-all
            ${
              orderType === type
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-muted text-muted-foreground border-border"
            }`}
        >
          <span>{emoji}</span>
          <span>{label}</span>
        </button>
      ))}
    </div>
  );
};

export default OrderTypeSelector;
