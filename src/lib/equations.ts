export type RenderType = "polar" | "parametric" | "cartesian";

export type CurveId =
  | "rose"
  | "heart"
  | "butterfly"
  | "spiral"
  | "galaxy"
  | "wave"
  | "lissajous";

export interface EquationConfig {
  id: CurveId;
  name: string;
  description: string;
  formula: string;
  renderType: RenderType;
  keywords: string[];
  params: Record<string, number>;
  tRange?: [number, number];
  tStep?: number;
  emoji: string;
  color: string;
}

export const EQUATIONS: Record<CurveId, EquationConfig> = {
  rose: {
    id: "rose",
    name: "Rose Curve",
    description: "A polar rose with k petals radiating symmetrically",
    formula: "r = cos(kθ)",
    renderType: "polar",
    keywords: ["rose", "flower", "petal", "bloom", "floral", "blossom", "daisy"],
    params: { k: 5, scale: 160 },
    tRange: [0, Math.PI * 2],
    tStep: 0.015,
    emoji: "🌹",
    color: "#ff2d78",
  },
  heart: {
    id: "heart",
    name: "Heart Curve",
    description: "The classic mathematical heart parametric curve",
    formula: "x=16sin³t, y=13cos t−5cos 2t−2cos 3t−cos 4t",
    renderType: "parametric",
    keywords: ["heart", "love", "valentine", "amor", "passion", "romance"],
    params: { scale: 9 },
    tRange: [0, Math.PI * 2],
    tStep: 0.025,
    emoji: "❤️",
    color: "#ff4466",
  },
  butterfly: {
    id: "butterfly",
    name: "Butterfly Curve",
    description: "An intricate transcendental butterfly-shaped polar curve",
    formula: "r = e^sin(θ) − 2cos(4θ) + sin⁵((2θ−π)/24)",
    renderType: "polar",
    keywords: [
      "butterfly",
      "wings",
      "flutter",
      "moth",
      "insect",
      "fly",
      "beauty",
    ],
    params: { scale: 65 },
    tRange: [0, Math.PI * 12],
    tStep: 0.02,
    emoji: "🦋",
    color: "#aa44ff",
  },
  spiral: {
    id: "spiral",
    name: "Archimedean Spiral",
    description: "A classic spiral expanding at a constant rate",
    formula: "r = aθ",
    renderType: "polar",
    keywords: ["spiral", "vortex", "swirl", "whirl", "spin", "coil", "helix"],
    params: { a: 8 },
    tRange: [0, Math.PI * 8],
    tStep: 0.04,
    emoji: "🌀",
    color: "#00d4ff",
  },
  galaxy: {
    id: "galaxy",
    name: "Galaxy Spiral",
    description: "A logarithmic spiral resembling galactic arms",
    formula: "r = ae^(bθ)",
    renderType: "polar",
    keywords: [
      "galaxy",
      "cosmos",
      "universe",
      "nebula",
      "space",
      "star",
      "milky",
      "astro",
    ],
    params: { a: 2, b: 0.18 },
    tRange: [0, Math.PI * 5],
    tStep: 0.03,
    emoji: "🌌",
    color: "#7744ff",
  },
  wave: {
    id: "wave",
    name: "Sine Wave",
    description: "A flowing harmonic sinusoidal wave",
    formula: "y = A·sin(Bx + Ct)",
    renderType: "cartesian",
    keywords: [
      "wave",
      "sine",
      "ocean",
      "flow",
      "ripple",
      "water",
      "harmonic",
      "oscillate",
    ],
    params: { A: 110, B: 0.018, C: 1 },
    emoji: "〰️",
    color: "#00ffbb",
  },
  lissajous: {
    id: "lissajous",
    name: "Lissajous Curve",
    description: "Harmonograph-style parametric Lissajous figure",
    formula: "x=A·sin(at+δ), y=B·sin(bt)",
    renderType: "parametric",
    keywords: [
      "lissajous",
      "harmonograph",
      "harmonic",
      "figure",
      "knot",
      "infinity",
      "loop",
    ],
    params: { a: 3, b: 2, delta: Math.PI / 4, scale: 155 },
    tRange: [0, Math.PI * 2],
    tStep: 0.008,
    emoji: "∞",
    color: "#ffaa00",
  },
};

export function findEquationByKeyword(keyword: string): EquationConfig | null {
  const lower = keyword.toLowerCase().trim();
  if (!lower) return null;

  for (const eq of Object.values(EQUATIONS)) {
    if (eq.keywords.some((k) => lower.includes(k) || k.includes(lower))) {
      return eq;
    }
  }
  return null;
}

export function getRandomEquation(): EquationConfig {
  const all = Object.values(EQUATIONS);
  return all[Math.floor(Math.random() * all.length)];
}

export function computePoints(
  config: EquationConfig,
  canvasW: number,
  canvasH: number
): [number, number][] {
  const cx = canvasW / 2;
  const cy = canvasH / 2;
  const points: [number, number][] = [];

  if (config.renderType === "polar") {
    const [tMin, tMax] = config.tRange!;
    for (let t = tMin; t <= tMax; t += config.tStep!) {
      let r = 0;

      if (config.id === "rose") {
        r = Math.cos(config.params.k * t) * config.params.scale;
      } else if (config.id === "butterfly") {
        r =
          (Math.exp(Math.sin(t)) -
            2 * Math.cos(4 * t) +
            Math.pow(Math.sin((2 * t - Math.PI) / 24), 5)) *
          config.params.scale;
      } else if (config.id === "spiral") {
        r = config.params.a * t;
      } else if (config.id === "galaxy") {
        r = config.params.a * Math.exp(config.params.b * t);
      }

      const x = cx + r * Math.cos(t);
      const y = cy + r * Math.sin(t);
      points.push([x, y]);
    }
  } else if (config.renderType === "parametric") {
    const [tMin, tMax] = config.tRange!;

    for (let t = tMin; t <= tMax; t += config.tStep!) {
      let x = 0,
        y = 0;

      if (config.id === "heart") {
        x = 16 * Math.pow(Math.sin(t), 3) * config.params.scale;
        y =
          -(
            13 * Math.cos(t) -
            5 * Math.cos(2 * t) -
            2 * Math.cos(3 * t) -
            Math.cos(4 * t)
          ) * config.params.scale;
      } else if (config.id === "lissajous") {
        x =
          config.params.scale *
          Math.sin(config.params.a * t + config.params.delta);
        y = config.params.scale * Math.sin(config.params.b * t);
      }

      points.push([cx + x, cy + y]);
    }
  }

  return points;
}
