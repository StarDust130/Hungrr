// components/menuComp/NoResults.tsx
"use client";

import Image from "next/image";
import { useMemo } from "react";

type Props = {
  query: string;
};

const NoResults = ({ query }: Props) => {
  // ✅ Randomly choose 1 of 3 images on each mount
  const imageNumber = useMemo(() => Math.floor(Math.random() * 3) + 1, []);
  const imageSrc = `/anime-girl-sad-${imageNumber}.png`;

  return (
    <div className="flex flex-col items-center justify-center text-center px-4 py-8 sm:py-20">
      <h2 className="text-xl font-semibold text-foreground mb-3">
        No items found for{" "}
        <span className="text-sky-500">&quot;{query}&quot;</span>
      </h2>
      <Image
        src={imageSrc}
        alt="No results found"
        width={180}
        height={180}
        className="mb-6 opacity-80"
      />
    <p className="text-sm text-muted-foreground max-w-md">
      Oops! 🤷‍♀️ We couldn&apos;t find that on the menu. <br /> Maybe try a
      different search?
    </p>
    </div>
  );
};

export default NoResults;
