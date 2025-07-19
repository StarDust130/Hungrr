"use client";

import { RefObject } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { BookOpenText } from "lucide-react";

type Props = {
  categories: string[];
  activeCategory: string;
  scrollToCategory: (cat: string) => void;
  // ✅ FIX: Allow the navRef prop to be nullable to match the useRef hook.
  navRef: RefObject<HTMLDivElement | null>;
  setSearchTerm?: (val: string) => void;
};

const CategoryNav = ({
  categories,
  activeCategory,
  scrollToCategory,
  setSearchTerm,
  navRef,
}: Props) => {
  const handleClick = (category: string) => {
    // DialogClose handles closing the dialog
    scrollToCategory(category);
  };

  return (
    <div ref={navRef} className="w-full flex justify-center">
      <Dialog>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            className="flex items-center gap-2 px-4 py-2 rounded-full"
            onClick={() => setSearchTerm?.("")}
          >
            <BookOpenText className="w-4 h-4" />
            <span>Menu</span>
          </Button>
        </DialogTrigger>

        <DialogContent className="max-w-xs p-2 rounded-2xl">
          <DialogHeader className="p-3">
            <DialogTitle className="text-base font-semibold text-center text-neutral-800 dark:text-neutral-200">
              😋 Choose a Category
            </DialogTitle>
            <DialogDescription className="text-xs text-neutral-600 dark:text-neutral-400 text-center mb-2">
              Select a category to explore delicious options! ✨
            </DialogDescription>
          </DialogHeader>

          <div className="py-2 max-h-[60vh] overflow-y-auto custom-scrollbar">
            {categories.map((category) => (
              <DialogClose asChild key={category}>
                <button
                  onClick={() => handleClick(category)}
                  className={`relative flex items-center gap-3 w-full p-2.5 rounded-lg text-sm font-medium capitalize text-left transition-colors duration-200 outline-none group
                    ${
                      activeCategory === category
                        ? "text-neutral-900 dark:text-neutral-300 font-bold"
                        : "text-neutral-500 hover:bg-black/5 dark:text-neutral-400 dark:hover:bg-white/5"
                    }`}
                >
                  {activeCategory === category && (
                    <div className="absolute inset-0 rounded-lg -z-10 bg-neutral-500/10 dark:bg-neutral-500/10" />
                  )}
                  <span className="truncate">{category}</span>
                </button>
              </DialogClose>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CategoryNav;
