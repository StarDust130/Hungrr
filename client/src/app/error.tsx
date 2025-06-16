"use client"; // Error boundaries must be Client Components

import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
})  {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  const  router = useRouter();

  return (
    <div className="p-10 flex flex-col justify-center items-center h-[80vh] text-center  font-bold ">
      <Image
        src={"/anime-girl-error.png"}
        alt="Not Found"
        width={200}
        height={200}
      />
      <h2 className="mt-5 text-bold text-2xl mb-2 text-red-500">
        Something went wrong!
      </h2>

      <div className="flex justify-center items-center gap-3">
        <Button
          variant={"outline"}
          onClick={() => router.back()}
          className="mt-5 flex items-center gap-2"
        >
          <ArrowLeft /> Go Back
        </Button>
        <Button
          className="mt-5"
          onClick={
            // Attempt to recover by trying to re-render the segment
            () => reset()
          }
        >
          Try again
        </Button>
      </div>
    </div>
  );
}
