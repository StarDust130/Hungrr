

import React, { useMemo } from "react";
import { MenuItem } from "@/types/menu";
const DietaryIcon = ({ type }: { type: MenuItem["dietary"] }) => {
  const style = useMemo(() => {
    switch (type) {
      case "veg":
        return {
          borderColor: "border-green-600",
          bgColor: "bg-green-600",
          textColor: "text-green-600",
        };
      case "non_veg":
        return {
          borderColor: "border-red-600",
          bgColor: "bg-red-600",
          textColor: "text-red-600",
        };
      case "vegan":
        return {
          borderColor: "border-blue-500",
          bgColor: "bg-blue-500",
          textColor: "text-blue-500",
        };
    }
  }, [type]);

  return (
    <div
      className={`w-5 h-5 border ${style.borderColor} rounded-sm flex items-center justify-center`}
    >
      <div className={`w-2.5 h-2.5 ${style.bgColor} rounded-full`}></div>
    </div>
  );
};

export default DietaryIcon;