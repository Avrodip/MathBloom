export type RenderType = "polar" | "parametric" | "cartesian";

export type CurveId =
  | "rose"
  | "heart"
  | "butterfly"
  | "spiral"
  | "galaxy"
  | "wave"
  | "lissajous"
  | "astroid"
  | "spirograph"
  | "custom";

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
  customFn?: (t: number) => number;
}

export const EQUATIONS: Partial<Record<CurveId, EquationConfig>> = {
  rose: {
    id: "rose",
    name: "Rose Curve",
    description: "A polar rose with k petals",
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
    description: "The classic mathematical heart curve",
    formula: "x=16sin³t, y=13cos t−5cos 2t−2cos 3t−cos 4t",
    renderType: "parametric",
    keywords: ["heart", "love", "valentine", "amor", "passion"],
    params: { scale: 9 },
    tRange: [0, Math.PI * 2],
    tStep: 0.025,
    emoji: "❤️",
    color: "#ff4466",
  },
  butterfly: {
    id: "butterfly",
    name: "Butterfly Curve",
    description: "A transcendental butterfly-shaped polar curve",
    formula: "r = e^sin(θ) − 2cos(4θ) + sin⁵((2θ−π)/24)",
    renderType: "polar",
    keywords: ["butterfly", "wings", "flutter", "moth"],
    params: { scale: 65 },
    tRange: [0, Math.PI * 12],
    tStep: 0.02,
    emoji: "🦋",
    color: "#aa44ff",
  },
  spiral: {
    id: "spiral",
    name: "Archimedean Spiral",
    description: "A classic spiral expanding at constant rate",
    formula: "r = aθ",
    renderType: "polar",
    keywords: ["spiral", "vortex", "swirl", "whirl", "spin", "coil"],
    params: { a: 8 },
    tRange: [0, Math.PI * 8],
    tStep: 0.04,
    emoji: "🌀",
    color: "#00d4ff",
  },
  galaxy: {
    id: "galaxy",
    name: "Galaxy Spiral",
    description: "A logarithmic spiral like galactic arms",
    formula: "r = ae^(bθ)",
    renderType: "polar",
    keywords: ["galaxy", "cosmos", "universe", "nebula", "space", "star"],
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
    keywords: ["wave", "sine", "ocean", "flow", "ripple", "water"],
    params: { A: 110, B: 0.018, C: 1 },
    emoji: "〰️",
    color: "#00ffbb",
  },
  lissajous: {
    id: "lissajous",
    name: "Lissajous Curve",
    description: "Harmonograph-style parametric figure",
    formula: "x=A·sin(at+δ), y=B·sin(bt)",
    renderType: "parametric",
    keywords: ["lissajous", "harmonograph", "harmonic", "figure", "loop"],
    params: { a: 3, b: 2, delta: Math.PI / 4, scale: 155 },
    tRange: [0, Math.PI * 2],
    tStep: 0.008,
    emoji: "∞",
    color: "#ffaa00",
  },
  astroid: {
    id: "astroid",
    name: "Astroid",
    description: "A 4-cusped hypocycloid — a perfect star curve",
    formula: "x = cos³(t), y = sin³(t)",
    renderType: "parametric",
    keywords: ["astroid", "star", "hypocycloid", "cusp", "four"],
    params: { scale: 155 },
    tRange: [0, Math.PI * 2],
    tStep: 0.02,
    emoji: "⭐",
    color: "#ffdd00",
  },
  spirograph: {
    id: "spirograph",
    name: "Spirograph",
    description: "Epitrochoid — the classic Spirograph toy pattern",
    formula: "x=(R+r)cos t−d·cos((R+r)t/r)",
    renderType: "parametric",
    keywords: ["spirograph", "epitrochoid", "hypotrochoid", "pantograph"],
    params: { R: 80, r: 30, d: 50 },
    tRange: [0, Math.PI * 14],
    tStep: 0.025,
    emoji: "🎡",
    color: "#ff7700",
  },
};

export function findEquationByKeyword(keyword: string): EquationConfig | null {
  const lower = keyword.toLowerCase().trim();
  if (!lower) return null;
  for (const eq of Object.values(EQUATIONS) as EquationConfig[]) {
    if (eq.keywords.some((k) => lower.includes(k) || k.includes(lower))) return eq;
  }
  return null;
}

export function getRandomEquation(): EquationConfig {
  const all = Object.values(EQUATIONS) as EquationConfig[];
  return all[Math.floor(Math.random() * all.length)];
}

export function makeCustomPolarEquation(formulaStr: string, scale: number = 120): EquationConfig | null {
  try {
    const fn = new Function("t", `with(Math) { return ${formulaStr}; }`) as (t: number) => number;
    fn(0); // test call
    return {
      id: "custom",
      name: "Custom Polar",
      description: `r = ${formulaStr}`,
      formula: `r = ${formulaStr}`,
      renderType: "polar",
      keywords: ["custom"],
      params: { scale },
      tRange: [0, Math.PI * 4],
      tStep: 0.015,
      emoji: "✏️",
      color: "#ffffff",
      customFn: fn,
    };
  } catch {
    return null;
  }
}

export function computePoints(
  config: EquationConfig,
  canvasW: number,
  canvasH: number
): [number, number][] {
  const cx = canvasW / 2;
  const cy = canvasH / 2;
  const points: [number, number][] = [];
  const p = config.params;

  if (config.renderType === "polar") {
    const [tMin, tMax] = config.tRange!;
    for (let t = tMin; t <= tMax; t += config.tStep!) {
      let r = 0;
      if (config.id === "rose") {
        r = Math.cos(p.k * t) * p.scale;
      } else if (config.id === "butterfly") {
        r = (Math.exp(Math.sin(t)) - 2 * Math.cos(4 * t) + Math.pow(Math.sin((2 * t - Math.PI) / 24), 5)) * p.scale;
      } else if (config.id === "spiral") {
        r = p.a * t;
      } else if (config.id === "galaxy") {
        r = p.a * Math.exp(p.b * t);
      } else if (config.id === "custom" && config.customFn) {
        try { r = config.customFn(t) * (p.scale ?? 120); } catch { r = 0; }
      }
      points.push([cx + r * Math.cos(t), cy + r * Math.sin(t)]);
    }
  } else if (config.renderType === "parametric") {
    const [tMin, tMax] = config.tRange!;
    for (let t = tMin; t <= tMax; t += config.tStep!) {
      let x = 0, y = 0;
      if (config.id === "heart") {
        x = 16 * Math.pow(Math.sin(t), 3) * p.scale;
        y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) * p.scale;
      } else if (config.id === "lissajous") {
        x = p.scale * Math.sin(p.a * t + p.delta);
        y = p.scale * Math.sin(p.b * t);
      } else if (config.id === "astroid") {
        x = p.scale * Math.pow(Math.cos(t), 3);
        y = p.scale * Math.pow(Math.sin(t), 3);
      } else if (config.id === "spirograph") {
        x = (p.R + p.r) * Math.cos(t) - p.d * Math.cos(((p.R + p.r) / p.r) * t);
        y = (p.R + p.r) * Math.sin(t) - p.d * Math.sin(((p.R + p.r) / p.r) * t);
      }
      points.push([cx + x, cy + y]);
    }
  }

  return points;
}
