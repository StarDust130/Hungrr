/* eslint-disable @typescript-eslint/no-require-imports */
import type { Config } from "tailwindcss";

const config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx}",
    "./src/pages/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [
    require("@tailwindcss/line-clamp"), // 👍 Line clamp plugin
  ],
  safelist: [
    "line-clamp-1",
    "line-clamp-2",
    "line-clamp-3",
    "line-clamp-4",
    "line-clamp-5",
    "line-clamp-none",
  ],
} as Config;

export default config;
