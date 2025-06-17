import CategoryIcon from "@/components/menuComp/CategoryIcon";

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
}: Props) => (
  <nav className="sticky top-[75px] z-10 bg-background/80 backdrop-blur-md">
    <div
      ref={navRef}
      className="max-w-4xl mx-auto flex gap-3 overflow-x-auto whitespace-nowrap p-4 border-b border-border no-scrollbar"
    >
      {categories.map((category) => (
        <button
          key={category}
          id={`nav-${category}`}
          onClick={() => scrollToCategory(category)}
          className={`flex items-center gap-2.5 px-4 py-2 text-[10px] font-bold rounded-full transition-all duration-300 hover:scale-105 ${
            activeCategory === category
              ? "bg-primary text-primary-foreground shadow-md"
              : "bg-secondary text-secondary-foreground hover:bg-muted"
          }`}
        >
          <CategoryIcon categoryName={category} />
          <span>{category}</span>
        </button>
      ))}
    </div>
  </nav>
);

export default CategoryNav;
