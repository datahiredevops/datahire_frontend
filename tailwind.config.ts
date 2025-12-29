import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Your Custom Palette
        primary: "#0FA3B1",    // The Deep Teal (Buttons, Logos)
        secondary: "#B5E2FA",  // Light Blue (Background accents)
        background: "#F9F7F3", // Off-White (Main Page Background)
        surface: "#FFFFFF",    // Pure White (Cards)
        sand: "#EDDEA4",       // Beige (Highlights)
        accent: "#F7A072",     // Salmon/Orange (Call to Actions)
        
        // Standard Grays for text
        dark: "#1A202C",
        muted: "#718096",
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'], // Clean modern font
      },
    },
  },
  plugins: [],
};
export default config;