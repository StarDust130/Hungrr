import { Search, X } from "lucide-react";

type Props = {
  searchTerm: string;
  setSearchTerm: (val: string) => void;
};

const SearchBar = ({ searchTerm, setSearchTerm }: Props) => (
  <header className="sticky top-0 z-20 bg-background/80 backdrop-blur-md p-4 border-b border-border">
    <div className="max-w-4xl mx-auto">
      <div className="relative">
        <input
          type="text"
          placeholder="Search for dishes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-secondary border border-transparent rounded-full focus:ring-2 focus:ring-primary outline-none"
        />
        <Search
          size={20}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X size={20} />
          </button>
        )}
      </div>
    </div>
  </header>
);

export default SearchBar;
