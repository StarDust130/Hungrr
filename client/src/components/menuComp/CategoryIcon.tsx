
import { Star, Coffee, CupSoda, Sandwich, Soup } from "lucide-react";

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

  switch (categoryName.toLowerCase()) {
    case "recommended":
      return <Star {...iconProps} />;
    case "signature lattes":
      return <Coffee {...iconProps} />;
    case "espresso & brews":
      return <CupSoda {...iconProps} />;
    case "bakery & sweets":
      return <Sandwich {...iconProps} />;
    default:
      return <Soup {...iconProps} />;
  }
};



export default CategoryIcon;