

type DietaryIconProps = {
  type: string;
};

const DietaryIcon = ({ type }: DietaryIconProps) => (
    <div
      className={`w-5 h-5 border-2 ${
        type === "veg" ? "border-emerald-600" : "border-red-600"
      } flex items-center justify-center p-0.5`}
    >
      <div
        className={`w-2.5 h-2.5 rounded-full ${
          type === "veg" ? "bg-emerald-600" : "bg-red-600"
        }`}
      ></div>
    </div>
  );

export default DietaryIcon;  