import type { Config } from "tailwindcss";

export default {
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
        secondaryBackground: "var(--secondaryBackground)",
        gray: "var(--gray)",
        primary: "var(--primary)",
        secondary: "var(--secondary)",
        textDefault: "var(--textDefault)",
      },
    },
  },
  plugins: [],
} satisfies Config;


// import type { Config } from "tailwindcss";

// const config: Config = {
//   darkMode: "class",
//   content: [
//     "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
//     "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
//     "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
//   ],
//   theme: {
//     extend: {
//       colors: {
//         background: "var(--background)",
//         foreground: "var(--foreground)",
//         secondaryBackground: "var(--secondaryBackground)",
//         gray: "var(--gray)",
//         primary: "var(--primary)",
//         secondary: "var(--secondary)",
//         textDefault: "var(--textDefault)",
//       },
//     },
//   },
//   plugins: [],
// };
// export default config;
