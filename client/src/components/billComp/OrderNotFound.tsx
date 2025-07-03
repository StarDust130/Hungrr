import Image from "next/image"
import { Button } from "../ui/button"
import { ArrowLeft } from "lucide-react";

const OrderNotFound = ({error}: {error: string}) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 gap-3">
      <Image
        src="/anime-girl-sad-3.png"
        alt="Order Not Found"
        width={200}
        height={200}
      />
      <h1 className="text-xl font-bold ">Please place a new order. 😿</h1>
      <p className="text-xs text-red-600">{error}</p>

      <div className="flex gap-4 mt-2">
        <Button
          className="flex gap-2 items-center px-6 py-2 rounded-lg shadow hover:bg-gray-100 transition"
          variant="outline"
          onClick={() => window.history.back()}
        >
          <ArrowLeft /> Go Back
        </Button>
        <Button
          className="flex gap-2 items-center px-6 py-2 rounded-lg shadow "
          variant="default"
          onClick={() => window.location.reload()}
        >
          Try Again
        </Button>
      </div>
    </div>
  );
}
export default OrderNotFound