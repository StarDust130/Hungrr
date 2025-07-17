// SearchBar.tsx
import { Search, X } from "lucide-react";

type Props = {
  searchTerm: string;
  setSearchTerm: (val: string) => void;
};

const SearchBar = ({ searchTerm, setSearchTerm }: Props) => (
  <header className="sticky top-0 z-30">
    <div className=" w-full mx-auto px-2.5 py-2 flex items-center gap-3">
      {/* Search Input */}
      <div className="flex-1 relative">
        <input
          type="text"
          placeholder="Search for dishes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-10 py-2.5 bg-secondary border border-transparent rounded-full focus:ring-2 focus:ring-primary outline-none text-sm sm:text-base"
        />
        {/* Icon Left */}
        <Search
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
        {/* Clear */}
        {searchTerm && (
          <button
            onClick={() => setSearchTerm("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X size={18} />
          </button>
        )}
      </div>
    </div>
  </header>
);

export default SearchBar;
