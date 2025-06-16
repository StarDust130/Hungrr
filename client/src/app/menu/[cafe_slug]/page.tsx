// app/menu/[cafe_slug]/page.tsx

import Image from "next/image";
import CafeBanner from "@/components/menuComp/CafeBanner";
import CartProvider from "@/components/menuComp/CartProvider";
import MenuPageContent from "@/components/menuComp/MenuPageContent";

interface Props {
  params: Promise<{
    cafe_slug: string;
  }>;
}

async function fetchCafeData(slug: string) {
  const res = await fetch(
    `${process.env.BACKEND_API_URL}/api/cafe_banner/${slug}`,
    { cache: "no-store" }
  );

  if (res.status === 404) return null;
  if (!res.ok) throw new Error("Failed to fetch cafe");

  const { data } = await res.json();
  return data;
}

async function fetchMenuData(slug: string) {
  const res = await fetch(`${process.env.BACKEND_API_URL}/api/menu/${slug}`, {
    cache: "no-store",
  });

  if (!res.ok) throw new Error("Failed to fetch menu");

  const data = await res.json();
  return data;
}

export default async function MenuPage(props: Props) {
  const { cafe_slug } = await props.params;

  try {
    const cafeData = await fetchCafeData(cafe_slug);

    if (!cafeData) {
      return (
        <ErrorMessage
          img="/anime-girl-not-found.png"
          message="❌ No cafe found with name "
          highlight={cafe_slug}
        />
      );
    }

    const menuData = await fetchMenuData(cafe_slug);

    if (!menuData || Object.keys(menuData).length === 0) {
      return (
        <ErrorMessage
          img="/anime-girl-sad.png"
          message="🍽️ No menu items found for cafe "
          highlight={cafeData.name}
        />
      );
    }

    return (
      <CartProvider>
        <CafeBanner cafe={cafeData} />
        {/* <MenuPageContent menuData={menuData} /> */}
        <MenuPageContent  />
      </CartProvider>
    );
  } catch (error) {
    console.error("MenuPage error:", error);
    return (
      <ErrorMessage
        img="/anime-girl-error.png"
        message="😢 Something went wrong"
        sub="Please try again later."
      />
    );
  }
}

function ErrorMessage({
  img,
  message,
  highlight,
  sub,
}: {
  img: string;
  message: string;
  highlight?: string;
  sub?: string;
}) {
  return (
    <div className="p-10 flex flex-col justify-center items-center h-[80vh] text-center font-bold">
      <Image src={img} alt="Error" width={200} height={200} />
      <p className="text-base mt-3">
        {message}
        {highlight && <span className="italic text-red-600">{highlight}</span>}
      </p>
      {sub && <p className="text-sm mt-2">{sub}</p>}
    </div>
  );
}
