import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        secondaryBackground: "var(--secondary-background)",
        gray: "var(--gray)",
        primary: "var(--primary)",
        secondary: "var(--secondary)",
        textDefault: "var(--text-default)",
        border: "var(--border)",
      },
    },
  },
  plugins: [],
};

export default config;
