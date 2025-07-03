import SpecialCard from "@/components/menuComp/SpecialCard";
import SpecialLabel from "./SpecialLabel";
import type { MenuItem } from "@/types/menu.d.ts";

type Props = {
  items: MenuItem[];
  show: boolean;
};

const SpecialCardBox = ({ items, show }: Props) => {
  if (!show || items.length === 0) return null;

  return (
    <section className="py-6">
      <SpecialLabel />
      <div
        className="flex overflow-x-auto gap-4 scrollbar-hide px-2 pt-1"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        {items.map((item) => (
          <div key={`bestseller-${item.id}`} className="flex-shrink-0">
            <SpecialCard item={item} />
          </div>
        ))}
      </div>
    </section>
  );
};

export default SpecialCardBox;
