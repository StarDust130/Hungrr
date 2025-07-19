"use client";

import {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
} from "react";

// ✅ 1. Add tableNo to the CafeInfo type
type CafeInfo = {
  name: string;
  logoUrl: string;
  slug: string;
  tableNo: string | null;
};

type CafeContextType = {
  cafeInfo: CafeInfo | null;
  setCafeInfo: (info: Omit<CafeInfo, "tableNo">, tableNo?: string) => void;
};

const CafeContext = createContext<CafeContextType | null>(null);

export const CafeProvider = ({ children }: { children: ReactNode }) => {
  const [cafeInfo, setCafeInfo] = useState<CafeInfo | null>(null);

  // This effect will run once on the client to load any saved info
  useEffect(() => {
    const savedInfo = sessionStorage.getItem("cafeInfo");
    if (savedInfo) {
      setCafeInfo(JSON.parse(savedInfo));
    }
  }, []);

  // ✅ 2. Update the set function to handle tableNo
  const setAndStoreCafeInfo = (
    info: Omit<CafeInfo, "tableNo">,
    tableNo?: string
  ) => {
    const newInfo = { ...info, tableNo: tableNo || null };
    setCafeInfo(newInfo);
    // Also save to sessionStorage so it persists on page refresh
    sessionStorage.setItem("cafeInfo", JSON.stringify(newInfo));
  };

  return (
    <CafeContext.Provider
      value={{ cafeInfo, setCafeInfo: setAndStoreCafeInfo }}
    >
      {children}
    </CafeContext.Provider>
  );
};

export const useCafe = () => {
  const context = useContext(CafeContext);
  if (!context) {
    throw new Error("useCafe must be used within a CafeProvider");
  }
  return context;
};
