import { Atom } from "lucide-react";
import Image from "next/image";

export default function Loading() {
  // Or a custom loading skeleton component
  return (
    <div className="flex justify-center items-center h-[90vh] md:h-screen  flex-col space-y-4">
<div className="relative">
        <Image
          src="/anime-girl-loading.png"
          alt="Loading"
          width={150}
          height={150}
          priority={true} // Good practice for images that load immediately
          // ✅ This style automatically adjusts the height to maintain the
          // correct aspect ratio, fixing the warning.
          style={{ height: "auto" }}
        />
      </div>      <div className="flex items-center space-x-2 text-muted-foreground">
        <Atom className="h-6 w-6 animate-spin" />
        <span className="font-medium">Loading Bills ...</span>
      </div>
      <p className="text-sm text-muted-foreground">
        Please wait while we prepare your content.
      </p>
    </div>
  );
}
