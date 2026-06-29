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
        // Antes "cono" (naranja). Ahora "cono" = azul del escudo del logo,
        // se mantiene el mismo nombre de variable para no romper componentes existentes.
        cono: {
          light: "#9FD7E8",
          DEFAULT: "#1C5A82",
          dark: "#0F3A57",
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
