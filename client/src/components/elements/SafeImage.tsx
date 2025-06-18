"use client";
import { useState } from "react";
import Image from "next/image";
import { Coffee } from "lucide-react";

const ImagePlaceholder = ({ className }: { className?: string }) => (
  <div
    className={`flex items-center justify-center bg-muted rounded-lg ${className}`}
  >
    <Coffee className="w-8 h-8 text-muted-foreground/50" />
  </div>
);

type SafeImageProps = {
  src: string;
  alt: string;
  className?: string;
};

const SafeImage = ({ src, alt, className }: SafeImageProps) => {
  const [error, setError] = useState(false);

  // blank src or load error → placeholder
  if (!src?.trim() || error) {
    return <ImagePlaceholder className={className} />;
  }

  return (
    <Image
      src={src}
      width={500}
      height={500}
      alt={alt}
      className={className}
      loading="lazy"
      unoptimized // -> PROD: REOmove it in production
      onError={() => setError(true)}
    />
  );
};

export default SafeImage;
