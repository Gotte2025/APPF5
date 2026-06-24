import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cancha: {
          950: "#08201450",
          900: "#0B2B1C",
          800: "#0F3A24",
          700: "#15502F",
          600: "#1C6A3D",
          500: "#258A4F",
        },
        cono: {
          light: "#FBD7BF",
          DEFAULT: "#E8602C",
          dark: "#A8410F",
        },
        linea: {
          DEFAULT: "#F4F1E6",
          dim: "#CFCBB8",
        },
        amarillo: "#E8B931",
        rojo: "#C73B3B",
      },
      fontFamily: {
        display: ["var(--font-anton)", "sans-serif"],
        sans: ["var(--font-inter)", "sans-serif"],
      },
      borderRadius: {
        lg: "12px",
        md: "8px",
      },
    },
  },
  plugins: [],
};

export default config;
