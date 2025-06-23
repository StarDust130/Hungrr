// app/bill/[publicId]/page.tsx

"use client"; // ✅ only if needed for client-side hooks like useState, useEffect, useParams

import { useParams } from "next/navigation";
import BillPage from "@/components/billComp/BillPage";
import { log } from "@/lib/helper";

const BillPageRoute = () => {
  const params = useParams();
  const publicId = params.publicId as string;

  log("😇 BillPageRoute: publicId from URL:", publicId);

  return <BillPage publicId={publicId} />;
};

export default BillPageRoute;
