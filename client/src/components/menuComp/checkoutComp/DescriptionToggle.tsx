"use client";

import { useState } from "react";

interface DescriptionToggleProps {
  text: string;
  maxLines?: number;
}

export default function DescriptionToggle({
  text,
  maxLines = 2,
}: DescriptionToggleProps) {

  
  const [expanded, setExpanded] = useState(false);
  const isLong = text.length > 80;

  return (
    <div className="text-sm  mt-1">
      <p className={isLong && !expanded ? `line-clamp-${maxLines}` : ""}>{text}</p>
      {isLong && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-xs text-sky-500 mt-1 hover:underline"
        >
          {expanded ? "Show less" : "Show more"}
        </button>
      )}
    </div>
  );
}
