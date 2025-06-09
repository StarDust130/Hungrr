
import AddToCartButton from "./AddToCartButton";
import SafeImage from "../elements/SafeImage";
import { MenuItem } from "@/types/menu";



const BestsellerCard = ({ item }: { item: MenuItem }) => (
  <div className="flex-shrink-0 w-60 md:w-64 border bg-card rounded-xl overflow-hidden shadow-sm transition-shadow hover:shadow-md">
    <SafeImage
      src={item.image ?? ""}
      alt={item.name}
      className="w-full h-32 object-cover"
    />
    <div className="p-3">
      <h3 className="font-bold text-foreground truncate">{item.name}</h3>
      <p className="text-sm font-semibold text-muted-foreground mt-0.5">
        ₹{item.price.toFixed(2)}
      </p>
      <div className="pt-3">
        <AddToCartButton item={item} />
      </div>
    </div>
  </div>
);

export default BestsellerCard;