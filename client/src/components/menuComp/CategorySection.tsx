import MenuItemCard from "@/components/menuComp/MenuItemCard";
import Image from "next/image";
import type { MenuData, MenuItem } from "@/types/menu.d.ts";

type Props = {
  filteredMenuData: MenuData;
  visibleCategories: string[];
  searchTerm: string;
  sectionRefs: React.MutableRefObject<Record<string, HTMLElement | null>>;
};

const CategorySection = ({
  filteredMenuData,
  visibleCategories,
  searchTerm,
  sectionRefs,
}: Props) => {
  if (visibleCategories.length === 0) {
    return (
      <div className="text-center flex flex-col justify-start items-center py-8">
        <h3 className="text-xl font-semibold text-foreground">
          No Dishes Found 😿
        </h3>
        <Image
          src="/anime-girl-sad.png"
          alt="Not Found"
          width={200}
          height={150}
        />
        <p className="text-muted-foreground text-xs mt-2">
          Your search for{" "}
          <span className="text-red-400 font-bold">“{searchTerm}”</span> did not
          match any dishes.
        </p>
      </div>
    );
  }

  return (
    <>
      {Object.entries(filteredMenuData).map(([category, items]) => (
        <section
          key={category}
          id={category}
          ref={(el) => {
            sectionRefs.current[category] = el;
          }}
          className="pt-8"
        >
          <h2 className="text-2xl font-extrabold text-foreground mb-2 tracking-tight">
            {category}
          </h2>
          <div className="divide-y divide-border">
            {items.map((item: MenuItem) => (
              <MenuItemCard key={`item-${item.id}`} item={item} />
            ))}
          </div>
        </section>
      ))}
    </>
  );
};

export default CategorySection;
