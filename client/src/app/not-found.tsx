"use client";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useRouter } from "next/navigation";


export default function NotFound() {
   const  router = useRouter();
  return (
   <div className="p-10 flex flex-col justify-center items-center h-[80vh] text-center  font-bold ">
             <Image
               src={"/anime-girl-not-found.png"}
               alt="Not Found"
               width={200}
               height={200}
             />
      <h2 className="mt-5 text-bold text-3xl mb-2">Not Found</h2>
      <p >Could not find requested resource</p>
      <Button variant={"outline"} onClick={() => router.back()} className="mt-5">
        Go Back
      </Button>
    </div>
  );
}
