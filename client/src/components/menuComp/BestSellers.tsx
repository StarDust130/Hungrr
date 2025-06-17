import SpecialCard from "@/components/menuComp/SpecialCard";
import SpecialLabel from "./SpecialLabel";
import type { MenuItem } from "@/types/menu.d.ts";

type Props = {
  items: MenuItem[];
  show: boolean;
};

const BestSellers = ({ items, show }: Props) => {
  if (!show || items.length === 0) return null;

  return (
    <section className="py-8">
      <SpecialLabel />
      <div className="flex gap-4 pb-4 -mx-4 px-4 overflow-x-auto no-scrollbar">
        {items.map((item) => (
          <SpecialCard key={`bestseller-${item.id}`} item={item} />
        ))}
      </div>
    </section>
  );
};

export default BestSellers;
