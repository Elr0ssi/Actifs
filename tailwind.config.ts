import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#fcf5f1",
          100: "#f8e7df",
          200: "#f0cdbd",
          300: "#e3a88f",
          400: "#d4825f",
          500: "#c4673f",
          600: "#b05538",
          700: "#914430",
          800: "#74372a",
          900: "#5e2f25",
        },
        canvas: "#f7f3ee",
        line: "#ebe4dc",
        ink: "#0b0e1a",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      keyframes: {
        float: { "0%,100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-12px)" } },
        fadeUp: { "0%": { opacity: "0", transform: "translateY(24px)" }, "100%": { opacity: "1", transform: "translateY(0)" } },
        gradientShift: { "0%,100%": { backgroundPosition: "0% 50%" }, "50%": { backgroundPosition: "100% 50%" } },
        pageIn: { "0%": { opacity: "0", transform: "translateY(6px)" }, "100%": { opacity: "1", transform: "translateY(0)" } },
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        fadeUp: "fadeUp 0.7s ease-out both",
        gradientShift: "gradientShift 8s ease infinite",
        pageIn: "pageIn 0.25s ease-out both",
      },
    },
  },
  plugins: [],
};
export default config;
