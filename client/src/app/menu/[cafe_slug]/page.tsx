import CafeBanner from "@/components/menuComp/CafeBanner";
import MenuPageContent from "@/components/menuComp/MenuPageContent";
import { fetchCafeData, getFullMenuData } from "@/lib/api_calling";
import ErrorMessage from "@/components/elements/ErrorMessage";
import CartProvider from "@/components/menuComp/CartProvider";
import { Metadata } from "next";
import SpecialCardBox from "@/components/menuComp/SpecialCardBox";
import CategorySection from "@/components/menuComp/CategorySection";
import BackToTopButton from "@/components/menuComp/BacktoTopButton";
import Navbar from "@/components/elements/Navbar";

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

// ✅ Menu Page component
export default async function MenuPage({
  params,
}: {
  params: { cafe_slug: string };
}) {
  const { cafe_slug } = params;
  const [cafeData, menuData] = await Promise.all([
    fetchCafeData(cafe_slug),
    getFullMenuData(cafe_slug),
  ]);

  if (!cafeData)
    return <ErrorMessage message="❌ Cafe not found" highlight={cafe_slug} />;
  if (!cafeData.is_active) {
    return (
      <>
        <CafeBanner cafe={cafeData} />
        <ErrorMessage message="😴 This cafe is currently closed." />
      </>
    );
  }
  if (!menuData || Object.keys(menuData).length === 0) {
    return (
      <>
        <CafeBanner cafe={cafeData} />
        <ErrorMessage
          message="🍽️ No menu items found for"
          highlight={cafeData.name}
        />
      </>
    );
  }

  const specialItems = Object.values(menuData)
    .flat()
    .filter((item) => item?.isSpecial);

  return (
    <>
      <Navbar logoURL={cafeData.logoUrl} name={cafeData.name} />
      <CafeBanner cafe={cafeData} />
      <CartProvider>
        <MenuPageContent cafeId={cafeData.id} initialMenuData={menuData}>
          <main className="max-w-4xl mx-auto px-2.5 mb-10 " suppressHydrationWarning>
            {specialItems.length > 0 && (
              <section className="py-6">
                <SpecialCardBox items={specialItems} show={true} />
              </section>
            )}
            <CategorySection serverRenderedMenuData={menuData} />
            <BackToTopButton />
          </main>
        </MenuPageContent>
      </CartProvider>
    </>
  );
}
