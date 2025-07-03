"use client";

import { useState } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "../ui/button";
import {  BookOpenText } from "lucide-react";
import { DialogDescription } from "@radix-ui/react-dialog";


type Props = {
  categories: string[];
  activeCategory: string;
  scrollToCategory: (cat: string) => void;
  navRef: React.RefObject<HTMLDivElement>;
};

const CategoryNav = ({
  categories,
  activeCategory,
  scrollToCategory,
  navRef,
}: Props) => {
  const [open, setOpen] = useState(false);

  const handleClick = (category: string) => {
    setOpen(false);
    setTimeout(() => scrollToCategory(category), 150);
  };

  return (
    <div ref={navRef} className="w-full flex justify-center">
      <Dialog open={open} onOpenChange={setOpen}>
        {/* === Trigger Button (New Premium Version) === */}
        <DialogTrigger asChild>
          <Button
            variant="outline"
            className="flex items-center gap-2 px-4 py-2 rounded-full "
          >
            <BookOpenText className="w-4 h-4 transition-transform duration-300 group-hover:-rotate-6" />
            <span>Menu</span>
          </Button>
        </DialogTrigger>

        {/* === Dialog Content (Production Ready - Unchanged) === */}
        <DialogContent
          className="max-w-xs p-2 rounded-2xl shadow-2xl 
                                  border border-white/10 dark:border-neutral-800
                                  bg-neutral-100/90 backdrop-blur-lg
                                  dark:bg-neutral-950/80"
        >
          <DialogHeader className="p-3">
            <DialogTitle className="text-base font-semibold text-neutral-800 dark:text-neutral-200 text-center">
              😋 Choose a Category
            </DialogTitle>
            <DialogDescription className="text-xs text-neutral-600 dark:text-neutral-400 text-center mb-2">
              Select a category to explore delicious options! ✨
            </DialogDescription>

          </DialogHeader>

          {/* === Category List with Custom Scrollbar === */}
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
                  {/* === Active Background === */}
                  {activeCategory === category && (
                    <div
                      className="absolute inset-0 rounded-lg -z-10 
                                 bg-neutral-500/10
                                 dark:bg-neutral-500/10"
                    />
                  )}

                  {/* === Category Name === */}
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
