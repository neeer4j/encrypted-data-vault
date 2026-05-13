import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"] ,
  theme: {
    extend: {
      colors: {
        ink: {
          50: "#EEF1F6",
          100: "#D6DAE4",
          200: "#A8B1C4",
          300: "#7D879D",
          400: "#576075",
          500: "#3E4657",
          600: "#2A2F3D",
          700: "#1D212C",
          800: "#141820",
          900: "#0B0E14"
        },
        glass: {
          100: "rgba(255, 255, 255, 0.12)",
          200: "rgba(255, 255, 255, 0.08)",
          300: "rgba(255, 255, 255, 0.04)"
        }
      },
      borderRadius: {
        xl: "20px",
        "2xl": "28px"
      },
      boxShadow: {
        glow: "0 0 30px rgba(120, 150, 255, 0.18)",
        card: "0 20px 60px rgba(8, 12, 20, 0.45)"
      },
      fontFamily: {
        sans: [
          "Tahoma",
          "MS Sans Serif",
          "Segoe UI",
          "Arial",
          "sans-serif"
        ],
        mono: ["Cascadia Code", "SF Mono", "Menlo", "monospace"]
      }
    }
  },
  plugins: []
} satisfies Config;
