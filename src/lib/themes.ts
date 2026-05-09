export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  glow: string;
  background: string;
  surface: string;
  text: string;
  textMuted: string;
  border: string;
  canvasBg: string;
  particleColor: string;
  gradientFrom: string;
  gradientVia: string;
  gradientTo: string;
}

export interface Theme {
  id: string;
  name: string;
  emoji: string;
  description: string;
  colors: ThemeColors;
}

export const THEMES: Record<string, Theme> = {
  neon: {
    id: "neon",
    name: "Neon",
    emoji: "⚡",
    description: "Electric cyan & magenta",
    colors: {
      primary: "#00ffff",
      secondary: "#ff00ff",
      accent: "#bf00ff",
      glow: "rgba(0, 255, 255, 0.8)",
      background: "#050510",
      surface: "rgba(0, 255, 255, 0.05)",
      text: "#e0f7ff",
      textMuted: "rgba(224, 247, 255, 0.5)",
      border: "rgba(0, 255, 255, 0.2)",
      canvasBg: "#030308",
      particleColor: "#00ffff",
      gradientFrom: "#00ffff",
      gradientVia: "#bf00ff",
      gradientTo: "#ff00ff",
    },
  },
  galaxy: {
    id: "galaxy",
    name: "Galaxy",
    emoji: "🌌",
    description: "Deep space indigo & violet",
    colors: {
      primary: "#a78bfa",
      secondary: "#3b82f6",
      accent: "#ec4899",
      glow: "rgba(167, 139, 250, 0.8)",
      background: "#030312",
      surface: "rgba(99, 102, 241, 0.08)",
      text: "#e8e0ff",
      textMuted: "rgba(232, 224, 255, 0.5)",
      border: "rgba(99, 102, 241, 0.25)",
      canvasBg: "#020210",
      particleColor: "#a78bfa",
      gradientFrom: "#a78bfa",
      gradientVia: "#3b82f6",
      gradientTo: "#ec4899",
    },
  },
  cyberpunk: {
    id: "cyberpunk",
    name: "Cyberpunk",
    emoji: "🤖",
    description: "Neon yellow & hot orange",
    colors: {
      primary: "#f5d800",
      secondary: "#ff6b00",
      accent: "#ff0055",
      glow: "rgba(245, 216, 0, 0.8)",
      background: "#060304",
      surface: "rgba(245, 216, 0, 0.05)",
      text: "#fff8e0",
      textMuted: "rgba(255, 248, 224, 0.5)",
      border: "rgba(245, 216, 0, 0.2)",
      canvasBg: "#040202",
      particleColor: "#f5d800",
      gradientFrom: "#f5d800",
      gradientVia: "#ff6b00",
      gradientTo: "#ff0055",
    },
  },
  aurora: {
    id: "aurora",
    name: "Aurora",
    emoji: "🌿",
    description: "Northern lights green & teal",
    colors: {
      primary: "#00ff88",
      secondary: "#00d4ff",
      accent: "#b344ff",
      glow: "rgba(0, 255, 136, 0.8)",
      background: "#020e08",
      surface: "rgba(0, 255, 136, 0.05)",
      text: "#e0fff4",
      textMuted: "rgba(224, 255, 244, 0.5)",
      border: "rgba(0, 255, 136, 0.2)",
      canvasBg: "#010804",
      particleColor: "#00ff88",
      gradientFrom: "#00ff88",
      gradientVia: "#00d4ff",
      gradientTo: "#b344ff",
    },
  },
};

export const DEFAULT_THEME = THEMES.neon;

export function getThemeById(id: string): Theme {
  return THEMES[id] ?? DEFAULT_THEME;
}
