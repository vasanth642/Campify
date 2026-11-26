import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      colors: {
        surface: {
          DEFAULT: "#09090b",
          raised: "#18181b",
          subtle: "#0f0f12",
          overlay: "rgba(255, 255, 255, 0.04)",
        },
        accent: {
          DEFAULT: "#7877c6",
          bright: "#8b8adf",
        },
        muted: {
          DEFAULT: "#a1a1aa",
          dark: "#71717a",
        },
      },
    },
  },
  plugins: [],
};

export default config;
