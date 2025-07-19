import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { MenuItem } from "@/types/menu";
import MenuItemCard from "./MenuItemCard";

interface Props {
  serverRenderedMenuData: Record<string, MenuItem[]>;
}

export default function CategorySection({ serverRenderedMenuData }: Props) {
  if (!serverRenderedMenuData) {
    return null;
  }

  return (
    <div className="space-y-4 pt-6">
      <Accordion
        type="multiple"
        defaultValue={Object.keys(serverRenderedMenuData)}
        className="w-full space-y-5"
      >
        {Object.entries(serverRenderedMenuData).map(([category, items]) => (
          <section
            key={category}
            id={`category-${category}`}
            className="scroll-m-24"
          >
            <AccordionItem value={category} className="border-none">
              <AccordionTrigger className="text-xl sm:text-2xl font-bold capitalize tracking-tight hover:no-underline py-2">
                {category}
              </AccordionTrigger>
              <AccordionContent>
                <div className="flex flex-col">
                  {/* ✅ This check ensures we only map over valid arrays, preventing the crash. */}
                  {Array.isArray(items) &&
                    items.map((item) => (
                      <MenuItemCard
                        key={`${item.id}-${item.name}`}
                        item={item}
                      />
                    ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          </section>
        ))}
      </Accordion>
    </div>
  );
}
