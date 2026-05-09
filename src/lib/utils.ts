import { CurveId, EquationConfig } from "./equations";
import { Theme } from "./themes";

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function hexToRgb(
  hex: string
): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

export function hexToRgba(hex: string, alpha: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return `rgba(0, 0, 0, ${alpha})`;
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
}

export function getGlowColor(theme: Theme, intensity: number = 0.7): string {
  return hexToRgba(theme.colors.primary, intensity);
}

export function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function debounce<T extends (...args: any[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function buildGradientString(
  colors: string[],
  angle: number = 45
): string {
  return `linear-gradient(${angle}deg, ${colors.join(", ")})`;
}

export function getCurveStats(id: CurveId): {
  complexity: string;
  type: string;
  domain: string;
} {
  const stats: Partial<Record<CurveId, { complexity: string; type: string; domain: string }>> = {
    rose: { complexity: "Low", type: "Polar", domain: "0 → 2π" },
    heart: { complexity: "Medium", type: "Parametric", domain: "0 → 2π" },
    butterfly: { complexity: "High", type: "Polar", domain: "0 → 12π" },
    spiral: { complexity: "Low", type: "Polar", domain: "0 → 8π" },
    galaxy: { complexity: "Medium", type: "Polar", domain: "0 → 5π" },
    wave: { complexity: "Low", type: "Cartesian", domain: "−∞ → ∞" },
    lissajous: { complexity: "Medium", type: "Parametric", domain: "0 → 2π" },
    astroid: { complexity: "Low", type: "Parametric", domain: "0 → 2π" },
    spirograph: { complexity: "Medium", type: "Parametric", domain: "0 → 14π" },
    custom: { complexity: "Custom", type: "Polar", domain: "0 → 4π" },
  };
  return stats[id] ?? { complexity: "—", type: "—", domain: "—" };
}

export function formatEquationForDisplay(config: EquationConfig): string {
  return config.formula;
}

export function isMobile(): boolean {
  if (typeof window === "undefined") return false;
  return window.innerWidth < 768;
}
