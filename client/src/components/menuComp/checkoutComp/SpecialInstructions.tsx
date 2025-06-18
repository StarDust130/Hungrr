// components/checkout/SpecialInstructions.tsx
"use client";

import { Textarea } from "@/components/ui/textarea";
import { MessageSquareQuote } from "lucide-react";

interface Props {
  value: string;
  onChange: (value: string) => void;
}

const SpecialInstructions = ({ value, onChange }: Props) => {
  return (
    <div>
      <label
        htmlFor="instructions"
        className="flex items-center mb-2 text-sm font-medium"
      >
        <MessageSquareQuote size={16} className="mr-2 text-muted-foreground" />
        Special Instructions
      </label>
      <Textarea
        id="instructions"
        placeholder="e.g., Make it extra spicy, no onions etc."
        className="text-sm bg-muted/50"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
};

export default SpecialInstructions;
