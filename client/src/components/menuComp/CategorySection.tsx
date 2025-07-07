import MenuItemCard from "@/components/menuComp/MenuItemCard";
import Image from "next/image";
import type { MenuData, MenuItem } from "@/types/menu.d.ts";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import BackToTopButton from "./BacktoTopButton";

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
  const hasSearched = searchTerm.trim() !== "";
  const hasNoResults = visibleCategories.length === 0;
  const hasFetchedDataOnce = Object.keys(filteredMenuData).length > 0;

  if (hasSearched && hasNoResults && hasFetchedDataOnce) {
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
      <Accordion
        type="multiple"
        defaultValue={Object.keys(filteredMenuData)}
        className="space-y-4"
      >
        {Object.entries(filteredMenuData).map(([category, items]) => (
          <AccordionItem
            value={category}
            key={category}
            className="rounded-xl border border-muted shadow-sm"
          >
            <AccordionTrigger className="px-4 py-3 hover:bg-muted/50 transition rounded-t-xl">
              <h2 className="text-lg font-semibold text-muted-foreground tracking-wide">
                {category}
              </h2>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4 pt-2 rounded-b-xl">
              <div
                ref={(el) => {
                  sectionRefs.current[category] = el;
                }}
                className="flex flex-col gap-4"
              >
                {items.map((item: MenuItem) => (
                  <MenuItemCard key={`item-${item.id}`} item={item} />
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
      <BackToTopButton />
    </>
  );
};

export default CategorySection;
