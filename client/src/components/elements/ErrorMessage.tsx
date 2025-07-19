import Image from "next/image";

function ErrorMessage({
  img,
  message,
  highlight,
  sub,
}: {
  img?: string;
  message: string;
  highlight?: string;
  sub?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center h-[60vh] px-4 text-center">
      <p className="text-xl font-semibold mb-4">
        {message}
        {highlight && (
          <span className="text-red-600 italic ml-1">{highlight}</span>
        )}
      </p>

      <Image
        src={img || "/anime-girl-sad-1.png"}
        alt="Error"
        width={180}
        height={180}
        className="mb-4"
        priority
      />

      {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}

  
export default ErrorMessage;