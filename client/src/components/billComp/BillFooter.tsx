import Image from "next/image";
import { Separator } from "@/components/ui/separator";

export const BillFooter = () => {
  return (
    <>
      {/* Girl Message Footer */}
      <div className="flex flex-col justify-center items-center text-center px-6 py-10 space-y-4">
        <Image
          src="/anime-girl-thanks-2.png"
          alt="Thanks for ordering"
          width={160}
          height={160}
          className="mb-2"
        />
        <Separator className="w-full mt-2" />

        <p className="text-base font-medium leading-relaxed">
          Your order is on the way. <br />
          <span className="text-sm">
            Track it above and enjoy your meal
          </span>{" "}
          <span className="ml-1 text-sm">😋</span>
        </p>
        <Separator className="w-full" />

        <p className="text-xs text-muted-foreground">
          Need help? Please reach out to our staff.
        </p>
      </div>
    </>
  );
};
