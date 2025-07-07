// components/menuComp/NoResults.tsx
import Image from "next/image";

type Props = {
  query: string;
};

const NoResults = ({ query }: Props) => {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <Image
        src="/anime-girl-hot-3.png" // ✅ Add this image in `public/` folder
        alt="No results"
        width={160}
        height={160}
        className="mb-6 opacity-80"
      />
      <h2 className="text-lg font-semibold text-foreground">
        No items found for &quot;<span className="text-sky-500">{query}</span>
        &quot;
      </h2>
      <p className="text-muted-foreground text-sm mt-2">
        Try searching with a different name or check for typos.
      </p>
    </div>
  );
};

export default NoResults;
