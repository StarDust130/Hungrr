// components/menuComp/NoResults.tsx
import Image from "next/image";

type Props = {
  query: string;
};

const NoResults = ({ query }: Props) => {
  return (
    <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
      <h2 className="text-xl mb-3 font-semibold text-foreground">
        Nothing found for{" "}
        <span className="text-sky-500">&quot;{query}&quot;</span>
      </h2>
      <Image
        src="/anime-girl-sad-3.png" // Put your image inside /public folder
        alt="No results found"
        width={180}
        height={180}
        className="mb-6 opacity-80"
      />
      <p className="text-muted-foreground text-sm mt-2 max-w-md">
        We couldn’t find any matching items. <br />
        Try searching something else or check your spelling.
      </p>
    </div>
  );
};

export default NoResults;
