import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { MenuItem } from "@/types/menu";
import MenuItemCard from "./MenuItemCard";

// ✅ 1. Define the component's Props interface to correctly accept the menu data.
// This solves the TypeScript error.
interface Props {
  serverRenderedMenuData: Record<string, MenuItem[]>;
}

// ✅ 2. Use the 'Props' type in the component's function signature.
export default function CategorySection({ serverRenderedMenuData }: Props) {
  // ✅ 3. Add a primary safety check. If for any reason the data is missing,
  // the component will render nothing instead of crashing.
  if (!serverRenderedMenuData) {
    return null;
  }

  // Get the list of categories from the data object.
  const categories = Object.keys(serverRenderedMenuData);

  return (
    <div className="space-y-4 pt-6">
      <Accordion
        type="multiple"
        defaultValue={categories} // Automatically open all sections
        className="w-full space-y-5"
      >
        {categories.map((category) => {
          const items = serverRenderedMenuData[category];

          // ✅ 4. Add a second safety check. This ensures that we only try to map over
          // a category's items if it's a valid list (an array). This is the definitive
          // fix for the "Cannot read properties of undefined (reading 'map')" runtime error.
          if (!Array.isArray(items) || items.length === 0) {
            return null;
          }

          return (
            <section
              key={category}
              id={`category-${category}`}
              data-category={category}
              className="scroll-m-24"
            >
              <AccordionItem value={category} className="border-none">
                <AccordionTrigger className="text-xl sm:text-2xl font-bold capitalize tracking-tight hover:no-underline py-2">
                  {category}
                </AccordionTrigger>
                <AccordionContent>
                  <div className="flex flex-col">
                    {items.map((item) => (
                      <MenuItemCard
                        key={`${item.id}-${item.name}`}
                        item={item}
                      />
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </section>
          );
        })}
      </Accordion>
    </div>
  );
}
