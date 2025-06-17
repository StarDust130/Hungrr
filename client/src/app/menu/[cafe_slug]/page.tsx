// app/menu/[cafe_slug]/page.tsx


import CafeBanner from "@/components/menuComp/CafeBanner";
import CartProvider from "@/components/menuComp/CartProvider";
import MenuPageContent from "@/components/menuComp/MenuPageContent";
import { fetchCafeData, fetchMenuData } from "@/lib/api_calling";
import ErrorMessage from "@/components/elements/ErrorMessage";

interface Props {
  params: Promise<{
    cafe_slug: string;
  }>;
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

    console.log(`Fetching menu for cafe: ${cafe_slug}`, menuData);
    

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
        <MenuPageContent cafeSlug={cafe_slug} />
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


