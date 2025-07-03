"use client";

import { useState, useEffect, useRef } from "react";

interface DescriptionToggleProps {
  text: string;
  maxLines?: number;
}

export default function DescriptionToggle({
  text,
  maxLines = 2,
}: DescriptionToggleProps) {
  const [expanded, setExpanded] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const ref = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    const el = ref.current;
    const lineHeight = parseFloat(getComputedStyle(el).lineHeight);
    const maxHeight = lineHeight * maxLines;

    // Wait for rendering
    requestAnimationFrame(() => {
      if (el.scrollHeight > maxHeight) {
        setIsOverflowing(true);
      }
    });
  }, [text, maxLines]);

  return (
    <div className="text-sm mt-1">
      <p
        ref={ref}
        className={isOverflowing && !expanded ? `line-clamp-${maxLines}` : ""}
      >
        {text}
      </p>

      {isOverflowing && (
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
