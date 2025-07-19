"use client";

import { createContext, useState, useContext, ReactNode } from "react";

// Define the shape of the cafe info we want to share
type CafeInfo = {
  name: string;
  logoUrl: string;
  slug: string;
};

// Define the shape of the context
type CafeContextType = {
  cafeInfo: CafeInfo | null;
  setCafeInfo: (info: CafeInfo) => void;
};

// Create the context with a default value
const CafeContext = createContext<CafeContextType | null>(null);

// Create the Provider component
export const CafeProvider = ({ children }: { children: ReactNode }) => {
  const [cafeInfo, setCafeInfo] = useState<CafeInfo | null>(null);

  return (
    <CafeContext.Provider value={{ cafeInfo, setCafeInfo }}>
      {children}
    </CafeContext.Provider>
  );
};

// Create a custom hook to easily access the context
export const useCafe = () => {
  const context = useContext(CafeContext);
  if (!context) {
    throw new Error("useCafe must be used within a CafeProvider");
  }
  return context;
};
