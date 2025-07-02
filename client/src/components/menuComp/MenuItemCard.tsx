import { MenuItem } from "@/types/menu";
import ImageMenuCard from "./ImageMenuCard";
import NoImageMenuCard from "./NoImageMenuCard";

const MenuItemCard = ({ item }: { item: MenuItem }) => {
  return item.food_image_url ? (
    <ImageMenuCard item={item} />
  ) : (
    <NoImageMenuCard item={item} />
  );
};

export default MenuItemCard;
