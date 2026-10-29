import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: "#080B11",
        card: "#0F1523",
        drawer: "#161F33",
        "border-subtle": "rgba(255, 255, 255, 0.08)",
        "border-elevated": "rgba(255, 255, 255, 0.14)",
      },
    },
  },
  plugins: [],
};
export default config;
