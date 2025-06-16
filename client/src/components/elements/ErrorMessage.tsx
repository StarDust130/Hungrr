import Image from "next/image";

function ErrorMessage({
  img,
  message,
  highlight,
  sub,
}: {
  img: string;
  message: string;
  highlight?: string;
  sub?: string;
}) {
  return (
    <div className="p-10 flex flex-col justify-center items-center h-[80vh] text-center font-bold">
      <Image src={img} alt="Error" width={200} height={200} />
      <p className="text-base mt-3">
        {message}
        {highlight && <span className="italic text-red-600">{highlight}</span>}
      </p>
      {sub && <p className="text-sm mt-2">{sub}</p>}
    </div>
  );
}

  
export default ErrorMessage;