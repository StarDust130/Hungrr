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
  openAccordions: string[];
  setOpenAccordions: React.Dispatch<React.SetStateAction<string[]>>;
};

const CategorySection = ({
  filteredMenuData,
  visibleCategories,
  searchTerm,
  sectionRefs,
  openAccordions,
  setOpenAccordions,
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
          src="/anime-girl-sad-2.png"
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
        value={openAccordions}
        onValueChange={setOpenAccordions}
        className="space-y-4"
      >
        {Object.entries(filteredMenuData).map(([category, items]) => (
          <AccordionItem
            key={category}
            value={category}
            className="bg-transparent shadow-none"
          >
            <AccordionTrigger className="group px-2 md:px-4 py-3 hover:bg-muted/40 rounded-lg transition-all">
              <div className="flex items-center justify-between w-full">
                <h2 className="text-[18px] font-semibold tracking-tight text-foreground group-hover:text-primary transition-colors">
                  {category}
                </h2>
              </div>
            </AccordionTrigger>

            <AccordionContent
              ref={(el) => {
                if (el) {
                  el.setAttribute("data-category", category); // ✅ This is required for IntersectionObserver
                  sectionRefs.current[category] = el; // ✅ This makes scrollToCategory work
                }
              }}
              className="px-2 md:px-4 pt-2 pb-4 transition-all"
            >
              <div className="flex flex-col gap-4">
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
