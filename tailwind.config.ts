import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Surfaces & Structural Layers
        canvas: "#080B11",
        card: "#0F1523",
        drawer: "#161F33",
        "border-subtle": "rgba(255, 255, 255, 0.08)",
        "border-elevated": "rgba(255, 255, 255, 0.14)",

        // Brand & Interactive Accents
        cobalt: "#2563EB",
        "accent-primary": "#2563EB",
        "accent-hover": "#1D4ED8",
        "accent-active": "#1E40AF",
        "accent-ring": "#3B82F6",

        // Semantic State & Match Score Tints
        "status-top": "#10B981",
        "status-mid": "#0284C7",
        "status-mid-alt": "#38BDF8",
        "status-low": "#64748B",
        "status-action": "#0D9488",
        "status-action-alt": "#14B8A6",
        "status-danger": "#EF4444",

        // High-Contrast Text Hierarchy
        "text-primary": "#F8FAFC",
        "text-secondary": "#94A3B8",
        "text-muted": "#475569",
      },
      fontFamily: {
        sans: ["Inter Variable", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
