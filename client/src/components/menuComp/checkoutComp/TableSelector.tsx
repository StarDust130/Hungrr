"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { HandPlatter } from "lucide-react";

type Props = {
  tableNo: string;
  onChange: (value: string) => void;
};

const TableSelector = ({ tableNo, onChange }: Props) => {
  const searchParams = useSearchParams();
  const param = searchParams.get("tableNo");

  useEffect(() => {
    if (param && !tableNo) {
      onChange(param);
    }
  }, [param, tableNo, onChange]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*$/.test(value)) {
      onChange(value);
    }
  };

  return (
    <div className="flex items-center gap-1.5 w-fit px-3 py-1.5 rounded-full border border-border bg-muted shadow-sm text-xs">
      <HandPlatter className="w-4 h-4 text-muted-foreground" />
      <span className="text-muted-foreground">Table No.</span>
      {param ? (
        <span className="font-medium text-foreground">{tableNo}</span>
      ) : (
        <input
          id="table-number"
          type="text"
          inputMode="numeric"
          placeholder="XX"
          value={tableNo}
          onChange={handleChange}
          className="w-10 sm:w-16 bg-transparent border-none text-foreground placeholder:text-muted-foreground focus:outline-none text-center"
        />
      )}
    </div>
  );
};

export default TableSelector;
