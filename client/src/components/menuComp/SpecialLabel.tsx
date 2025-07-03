import React from "react";

const genZLabels = [
  "🔥 Absolute Banger",
  "🌟 Must-Try Today",
  "💥 Epic Flavor",
  "😋 Crave of the Day",
  "✨ Today’s Special",
];

const SpecialLabel = () => {
  const today = new Date().getDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat
  const label = genZLabels[today % genZLabels.length];

  let fullLabel = label;

  if (today === 0) {
    fullLabel = `🌞 Sunday Vibes`;
  }


  return (
    <p className="text-2xl md:text-4xl font-bold tracking-tight text-start-foreground mb-2">
      {fullLabel}
    </p>
  );
};

export default SpecialLabel;
