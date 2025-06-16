// app/menu/[tableId]/page.tsx
import CafeBanner from "@/components/menuComp/CafeBanner";
import CartProvider from "@/components/menuComp/CartProvider";
import MenuPageContent from "@/components/menuComp/MenuPageContent";
import Image from "next/image";

interface Props {
  params: {
    tableId: string;
  };
}

export default async function MenuPage({ params }: Props) {
  const slug = params.tableId;

  let cafeData = null;

  try {
    const res = await fetch(`${process.env.BACKEND_API_URL}/api/cafe/${slug}`, {
      cache: "no-store",
    });

    if (res.status === 404) {
      // Cafe not found
      return (
        <div className="p-10 flex flex-col justify-center items-center h-[80vh] text-center  font-bold ">
          <Image
            src={"/anime-girl-not-found.png"}
            alt="Not Found"
            width={200}
            height={200}
          />
          <p className="text-base mt-3">
            ❌ No cafe found with name{" "}
            <span className="italic text-red-600">{slug}</span>{" "}
          </p>
        </div>
      );
    }

    if (!res.ok) {
      throw new Error("Failed to fetch cafe data");
    }

    const { data } = await res.json();
    cafeData = data;
  } catch (error) {
    console.error("Error loading cafe:", error);
    return (
      <div className="p-10 flex flex-col justify-center items-center h-[80vh] text-center  font-bold ">
        <Image
          src={"/anime-girl-error.png"}
          alt="Not Found"
          width={200}
          height={200}
        />
        <p className="text-xl mt-5">
          Some went Wrong 😢 <br />{" "}
          <span className="text-sm mt-3">Please try again later.</span>
        </p>
      </div>
    );
  }

  return (
    <CartProvider>
      <CafeBanner cafe={cafeData} />
      <MenuPageContent />
    </CartProvider>
  );
}
