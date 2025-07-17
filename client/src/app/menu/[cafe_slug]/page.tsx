import CafeBanner from "@/components/menuComp/CafeBanner";
import MenuPageContent from "@/components/menuComp/MenuPageContent";
import { fetchCafeData, fetchMenuData } from "@/lib/api_calling";
import ErrorMessage from "@/components/elements/ErrorMessage";
import CartProvider from "@/components/menuComp/CartProvider";
import { Metadata } from "next";

// ✅ FULLY FIXED generateMetadata
export async function generateMetadata({
  params,
}: {
  params: Promise<{ cafe_slug: string }>; // ✅ required for Next 15+
}): Promise<Metadata> {
  const { cafe_slug } = await params; // ✅ await required here

  const cafeData = await fetchCafeData(cafe_slug);

  if (!cafeData) {
    return {
      title: "Cafe not found - Hungrr",
      description: "No cafe with that name was found.",
      icons: {
        icon: "/icon.png",
      },
    };
  }

  const title = `${cafeData.name} - Menu | Hungrr`;
  const description = `${
    cafeData.tagline || "Delicious food and drinks"
  } · Order now from ${cafeData.name} on Hungrr. Fresh, fast, and affordable.`;

  const logoUrl = cafeData.logoUrl?.startsWith("http")
    ? cafeData.logoUrl
    : "https://hungrr.in/icon.png";

  return {
    title,
    description,
    icons: {
      icon: logoUrl,
    },
    openGraph: {
      title,
      description,
      images: [{ url: logoUrl }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [logoUrl],
    },
  };
}

// ✅ FULLY FIXED Page component
export default async function MenuPage({
  params,
}: {
  params: Promise<{ cafe_slug: string }>; // ✅ must match dynamic routing behavior
}) {
  const { cafe_slug } = await params; // ✅ await is required

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

    if (!cafeData.is_active) {
      return (
        <>
          <CafeBanner cafe={cafeData} />
          <ErrorMessage
            img="/anime-girl-close.png"
            message="😴 This cafe is currently closed."
            sub="We're not serving at the moment. Please visit us again soon!"
          />
        </>
      );
    }

    const menuData = await fetchMenuData(cafe_slug);

    if (!menuData || Object.keys(menuData).length === 0) {
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
