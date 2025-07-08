import CafeBanner from "@/components/menuComp/CafeBanner";
import MenuPageContent from "@/components/menuComp/MenuPageContent";
import { fetchCafeData, fetchMenuData } from "@/lib/api_calling";
import ErrorMessage from "@/components/elements/ErrorMessage";
import CartProvider from "@/components/menuComp/CartProvider";

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
          message="❌ No cafe found with name"
          highlight={cafe_slug}
        />
      );
    }

    // ✅ FIX: Check if the cafe is active before showing the menu.
    if (!cafeData.is_active) {
      return (
        <>
          {/* Show the banner so the user knows which cafe is closed */}
          <CafeBanner cafe={cafeData} />
          <ErrorMessage
            img="/anime-girl-close.png" // Use a relevant image
            message="😴 This cafe is currently closed."
            sub="We're not serving at the moment. Please visit us again soon!"
          />
        </>
      );
    }

    const menuData = await fetchMenuData(cafe_slug);

    if (!menuData || Object.keys(menuData).length === 0) {
      // Show banner here too for context
      return (
        <>
          <CafeBanner cafe={cafeData} />
          <ErrorMessage
            img="/anime-girl-sad-2.png"
            message="🍽️ No menu items found for"
            highlight={cafeData.name}
          />
        </>
      );
    }

    return (
      <CartProvider>
        <CafeBanner cafe={cafeData} />
        <MenuPageContent cafeSlug={cafe_slug} cafeId={cafeData.id} />
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
