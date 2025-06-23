"use client";
import { useParams } from "next/navigation"; // Import useParams
import BillPage from "@/components/billComp/BillPage"; // Assuming BillPage is your main component

const BillPageRoute = () => {
  const params = useParams();
  const orderId = params.orderId as string; // Get orderId from URL

  // Pass the orderId to your actual page component
  return <BillPage orderId={orderId} />;
};

export default BillPageRoute;
