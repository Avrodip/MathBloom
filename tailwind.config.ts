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
        mono: ["var(--font-jetbrains)", "monospace"],
      },
      colors: {
        neon: {
          cyan: "#00ffff",
          pink: "#ff00ff",
          purple: "#bf00ff",
          green: "#00ff88",
        },
        glass: {
          white: "rgba(255, 255, 255, 0.05)",
          border: "rgba(255, 255, 255, 0.1)",
        },
      },
      animation: {
        "gradient-x": "gradient-x 8s ease infinite",
        "gradient-shift": "gradient-shift 15s ease infinite",
        float: "float 6s ease-in-out infinite",
        "float-delayed": "float 6s ease-in-out 3s infinite",
        "glow-pulse": "glow-pulse 2s ease-in-out infinite",
        "spin-slow": "spin 12s linear infinite",
        "spin-reverse": "spin-reverse 8s linear infinite",
        "fade-in-up": "fade-in-up 0.8s ease-out forwards",
        "fade-in": "fade-in 1s ease-out forwards",
        scanline: "scanline 8s linear infinite",
        flicker: "flicker 3s linear infinite",
      },
      keyframes: {
        "gradient-x": {
          "0%, 100%": { "background-position": "0% 50%" },
          "50%": { "background-position": "100% 50%" },
        },
        "gradient-shift": {
          "0%": { "background-position": "0% 50%" },
          "50%": { "background-position": "100% 50%" },
          "100%": { "background-position": "0% 50%" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-20px)" },
        },
        "glow-pulse": {
          "0%, 100%": {
            "box-shadow": "0 0 20px rgba(0, 255, 255, 0.3), 0 0 40px rgba(0, 255, 255, 0.1)",
          },
          "50%": {
            "box-shadow": "0 0 40px rgba(0, 255, 255, 0.8), 0 0 80px rgba(0, 255, 255, 0.3)",
          },
        },
        "spin-reverse": {
          from: { transform: "rotate(360deg)" },
          to: { transform: "rotate(0deg)" },
        },
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(30px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        scanline: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100vh)" },
        },
        flicker: {
          "0%, 95%, 100%": { opacity: "1" },
          "96%": { opacity: "0.8" },
          "97%": { opacity: "1" },
          "98%": { opacity: "0.6" },
          "99%": { opacity: "1" },
        },
      },
      backgroundImage: {
        "radial-glow": "radial-gradient(ellipse at center, rgba(0,255,255,0.15) 0%, transparent 70%)",
      },
      backdropBlur: {
        xs: "2px",
      },
      boxShadow: {
        neon: "0 0 20px rgba(0, 255, 255, 0.5), 0 0 40px rgba(0, 255, 255, 0.2)",
        "neon-pink": "0 0 20px rgba(255, 0, 255, 0.5), 0 0 40px rgba(255, 0, 255, 0.2)",
        "neon-purple": "0 0 20px rgba(139, 0, 255, 0.5), 0 0 40px rgba(139, 0, 255, 0.2)",
        glass: "0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
      },
    },
  },
  plugins: [],
};

export default config;
