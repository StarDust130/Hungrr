"use client";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";


export default function NotFound() {
   const  router = useRouter();
  return (
    <div className="p-10 flex flex-col justify-center items-center h-[80vh] text-center  font-bold ">
      <Image
        src={"/anime-girl-hot.png"}
        alt="Not Found"
        width={200}
        height={200}
      />
      <h2 className="mt-5 text-2xl font-bold mb-5">Oops! Page Not Found 😉</h2>
      <p className="text-xs text-gray-500 dark:text-gray-300">
        We couldn&apos;t find what you were looking for. <br /> It may have been moved
        or deleted.
      </p>

      <Button
        variant={"outline"}
        onClick={() => router.back()}
        className="mt-5 flex items-center gap-2"
      >
        <ArrowLeft /> Go Back
      </Button>
    </div>
  );
}
