// app/menu/[tableId]/page.tsx
import CafeBanner from "@/components/menuComp/CafeBanner";
import CartProvider from "@/components/menuComp/CartProvider";
import MenuPageContent from "@/components/menuComp/MenuPageContent";

interface Props {
  params: {
    tableId: string;
  };
}

export default async function MenuPage({ params }: Props) {
  const slug = params.tableId;

  console.log(`Fetching data for cafe with slug: ${slug}`);
  

  const res = await fetch(`http://localhost:5000/api/cafe/${slug}`, {
    next: { revalidate: 60 }, // Optional caching
  });

  console.log(`Response status: ${res.status}`);
  console.log(`Response URL: ${res.url}`);
  if (!res.ok) {
    throw new Error("Failed to fetch cafe data");
  }

  const { data } = await res.json();

  console.log("Fetched cafe data:", data);
  

  return (
    <CartProvider>
      <CafeBanner cafe={data} />
      <MenuPageContent />
    </CartProvider>
  );
}
