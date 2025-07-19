import { CafeInfo, MenuItem } from "@/types/menu";

// --- Server-Side Data Fetching ---
const API_URL = process.env.BACKEND_API_URL || "https://api.hungrr.in";

export async function fetchCafeData(slug: string): Promise<CafeInfo | null> {
  const res = await fetch(`${API_URL}/api/cafe_banner/${slug}`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) return null;
  return (await res.json()).data;
}

export async function fetchCategoryNames(slug: string): Promise<string[]> {
  const res = await fetch(`${API_URL}/api/menu/category/${slug}`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) return [];
  const { categories } = await res.json();
  return Array.isArray(categories) ? categories : [];
}

export async function fetchMenuDataForIndex(slug: string, index: number) {
  const res = await fetch(
    `${API_URL}/api/menu/${slug}?category_index=${index}`,
    { next: { revalidate: 60 } }
  );
  if (!res.ok) return null;
  return await res.json();
}

export async function getFullMenuData(
  slug: string
): Promise<Record<string, MenuItem[]> | null> {
  try {
    const categoryNames = await fetchCategoryNames(slug);
    if (categoryNames.length === 0) return {};

    const menuPromises = categoryNames.map((_, index) =>
      fetchMenuDataForIndex(slug, index)
    );
    const allCategoryData = await Promise.all(menuPromises);

    const menuData: Record<string, MenuItem[]> = {};

    // ✅ This is the updated, smarter logic
    allCategoryData.forEach((result) => {
      if (result) {
        // Loop through each key in the API response (e.g., "Appetizers", "hasMore")
        Object.entries(result).forEach(([key, value]) => {
          // ONLY add it to our menuData if the value is a list (array).
          // This automatically ignores keys like "hasMore" where the value is not a list.
          if (Array.isArray(value)) {
            menuData[key] = value;
          }
        });
      }
    });

    return menuData;
  } catch (error) {
    console.error("Server-side menu fetch failed:", error);
    return null;
  }
}
