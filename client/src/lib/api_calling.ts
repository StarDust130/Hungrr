
export async function fetchCafeData(slug: string) {
  const res = await fetch(
    `${process.env.BACKEND_API_URL}/api/cafe_banner/${slug}`,
    { cache: "no-store" }
  );

  if (res.status === 404) return null;
  if (!res.ok) throw new Error("Failed to fetch cafe");

  const { data } = await res.json();
  return data;
}

export async function fetchMenuData(slug: string) {
  const res = await fetch(`${process.env.BACKEND_API_URL}/api/menu/${slug}`, {
    cache: "no-store",
  });

  if (!res.ok) throw new Error("Failed to fetch menu");

  const data = await res.json();

  return data;
}