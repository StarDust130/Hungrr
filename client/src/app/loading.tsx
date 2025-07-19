import { Loader } from "lucide-react";
import Image from "next/image";

export default function Loading() {
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
         </div>

      <div className="flex items-center gap-2 animate-fade-in">
        <p className="text-lg font-medium ">Loading...</p>{" "}
        <Loader className="h-5 w-5 animate-spin text-primary" />
      </div>
      <p className="text-sm text-muted-foreground">
        Please wait while we prepare your content.
      </p>
    </div>
  );
}
