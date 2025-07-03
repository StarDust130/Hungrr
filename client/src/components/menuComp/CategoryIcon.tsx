import * as LucideIcons from "lucide-react";

const categoryIconMap: Record<string, keyof typeof LucideIcons> = {
  recommend: "Star",
  chef: "ChefHat",
  chief: "ChefHat",
  special: "Sparkles",
  latte: "Coffee",
  coffee: "Coffee",
  tea: "Martini",
  drink: "CupSoda",
  juice: "Apple",
  healthy: "Apple",
  beer: "Beer",
  wine: "Wine",
  starter: "Flame",
  appetizer: "Flame",
  main: "Utensils",
  course: "Utensils",
  meal: "Utensils",
  pizza: "Pizza",
  burger: "Hamburger",
  sandwich: "Sandwich",
  wrap: "WrapText",
  dessert: "Cake",
  cake: "Cake",
  bakery: "Cake",
  cookie: "Cookie",
  "ice cream": "IceCream",
  candy: "Candy",
  sweet: "Candy",
  soup: "Soup",
  salad: "Salad",
  egg: "Egg",
  chicken: "Drumstick",
  meat: "Drumstick",
  fish: "Fish",
  seafood: "Fish",
};

const CategoryIcon = ({
  categoryName,
  className,
}: {
  categoryName: string;
  className?: string;
}) => {
  const iconProps = {
    className: className || "w-5 h-5",
    strokeWidth: 2.5,
  };

  const name = categoryName.toLowerCase();
  const foundKey = Object.keys(categoryIconMap).find((key) =>
    name.includes(key)
  );
  const Icon =
    foundKey && LucideIcons[categoryIconMap[foundKey]]
      ? LucideIcons[categoryIconMap[foundKey]]
      : LucideIcons.Utensils;

  return <Icon {...iconProps} />;
};

export default CategoryIcon;
