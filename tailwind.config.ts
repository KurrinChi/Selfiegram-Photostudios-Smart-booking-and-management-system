import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sf: ['"SF Pro Display"', "sans-serif"],
      },
      animation: {
        fadeIn: "fadeIn 0.3s ease-out",
        slideInLeft: "slideInLeft 0.3s ease-out forwards", // ✅ Added
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        slideInLeft: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(0)" },
        }, // ✅ Added
      },
    },
  },
  plugins: [],
};

export default config;
