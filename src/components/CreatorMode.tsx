"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sliders, Code2, Play, AlertCircle, ChevronDown } from "lucide-react";
import { EquationConfig, makeCustomPolarEquation, CurveId } from "@/lib/equations";
import { Theme } from "@/lib/themes";
import { hexToRgb, debounce } from "@/lib/utils";

// Parameter slider definitions per curve
const SLIDER_CONFIGS: Partial<Record<CurveId, { key: string; label: string; min: number; max: number; step: number }[]>> = {
  rose: [{ key: "k", label: "Petals (k)", min: 1, max: 12, step: 1 }],
  spiral: [{ key: "a", label: "Spacing (a)", min: 2, max: 25, step: 1 }],
  galaxy: [{ key: "b", label: "Expansion (b)", min: 0.05, max: 0.4, step: 0.01 }],
  wave: [
    { key: "A", label: "Amplitude", min: 30, max: 180, step: 5 },
    { key: "B", label: "Frequency", min: 0.005, max: 0.05, step: 0.005 },
  ],
  lissajous: [
    { key: "a", label: "X Frequency", min: 1, max: 8, step: 1 },
    { key: "b", label: "Y Frequency", min: 1, max: 8, step: 1 },
  ],
  butterfly: [{ key: "scale", label: "Scale", min: 30, max: 110, step: 5 }],
  heart: [{ key: "scale", label: "Size", min: 4, max: 16, step: 0.5 }],
  astroid: [{ key: "scale", label: "Size", min: 60, max: 210, step: 10 }],
  spirograph: [
    { key: "R", label: "Outer Radius", min: 40, max: 130, step: 5 },
    { key: "r", label: "Inner Radius", min: 10, max: 60, step: 5 },
    { key: "d", label: "Pen Distance", min: 10, max: 80, step: 5 },
  ],
};

const POLAR_EXAMPLES = [
  "cos(3*t)",
  "sin(5*t)",
  "cos(2*t)*sin(3*t)",
  "exp(sin(t))-2*cos(4*t)",
  "sin(t)*cos(t)",
  "1+cos(t)",
];

interface CreatorModeProps {
  theme: Theme;
  equation: EquationConfig | null;
  overrideParams: Record<string, number>;
  onParamChange: (key: string, value: number) => void;
  onCustomEquation: (eq: EquationConfig) => void;
}

export default function CreatorMode({
  theme,
  equation,
  overrideParams,
  onParamChange,
  onCustomEquation,
}: CreatorModeProps) {
  const [activeTab, setActiveTab] = useState<"tune" | "custom">("tune");
  const [customFormula, setCustomFormula] = useState("cos(3*t)");
  const [formulaError, setFormulaError] = useState("");
  const [open, setOpen] = useState(true);

  const rgb = hexToRgb(theme.colors.primary) ?? { r: 0, g: 255, b: 255 };
  const sliders = equation ? (SLIDER_CONFIGS[equation.id] ?? []) : [];

  // Debounce param changes so rapid slider drags don't thrash recompute
  const debouncedParamChange = useRef(
    debounce((key: string, value: number) => onParamChange(key, value), 60)
  ).current;

  const handleSlider = useCallback((key: string, value: number) => {
    debouncedParamChange(key, value);
  }, [debouncedParamChange]);

  const handleCustomRender = () => {
    setFormulaError("");
    const result = makeCustomPolarEquation(customFormula, 120);
    if (!result) {
      setFormulaError("Invalid formula. Use: cos(3*t), sin(5*t), etc.");
      return;
    }
    onCustomEquation(result);
  };

  const getCurrentValue = (key: string, defaultVal: number) =>
    overrideParams[key] ?? defaultVal;

  return (
    <div className="w-full">
      {/* Header — collapsible */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between mb-0"
      >
        <h2
          className="text-sm font-bold tracking-widest uppercase font-mono flex items-center gap-2"
          style={{ color: theme.colors.primary }}
        >
          <Sliders size={14} />
          Creator Mode
        </h2>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          style={{ color: theme.colors.textMuted }}
        >
          <ChevronDown size={15} />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{ overflow: "hidden" }}
          >
            <div className="pt-4">
              {/* Tabs */}
              <div
                className="flex rounded-lg p-0.5 mb-4"
                style={{ background: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.06)` }}
              >
                {(["tune", "custom"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-medium transition-all"
                    style={{
                      background: activeTab === tab ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.15)` : "transparent",
                      color: activeTab === tab ? theme.colors.primary : theme.colors.textMuted,
                    }}
                  >
                    {tab === "tune" ? <><Sliders size={12} /> Tune</> : <><Code2 size={12} /> Custom Formula</>}
                  </button>
                ))}
              </div>

              <AnimatePresence mode="wait">
                {activeTab === "tune" && (
                  <motion.div
                    key="tune"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.18 }}
                  >
                    {sliders.length === 0 ? (
                      <p className="text-xs text-center py-4" style={{ color: theme.colors.textMuted }}>
                        Select a curve to tune its parameters
                      </p>
                    ) : (
                      <div className="space-y-4">
                        {sliders.map((s) => {
                          const val = getCurrentValue(s.key, equation!.params[s.key] ?? s.min);
                          return (
                            <div key={s.key}>
                              <div className="flex justify-between mb-1.5">
                                <label className="text-xs font-mono" style={{ color: theme.colors.textMuted }}>
                                  {s.label}
                                </label>
                                <span className="text-xs font-mono font-semibold" style={{ color: theme.colors.primary }}>
                                  {Number.isInteger(s.step) ? val : val.toFixed(3)}
                                </span>
                              </div>
                              <input
                                type="range"
                                min={s.min}
                                max={s.max}
                                step={s.step}
                                value={val}
                                onChange={(e) => handleSlider(s.key, parseFloat(e.target.value))}
                                className="w-full h-1 rounded-full appearance-none cursor-pointer"
                                style={{
                                  background: `linear-gradient(to right, ${theme.colors.primary} 0%, ${theme.colors.primary} ${((val - s.min) / (s.max - s.min)) * 100}%, rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.15) ${((val - s.min) / (s.max - s.min)) * 100}%, rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.15) 100%)`,
                                  accentColor: theme.colors.primary,
                                }}
                              />
                              <div className="flex justify-between mt-0.5">
                                <span className="text-xs opacity-30" style={{ color: theme.colors.text }}>{s.min}</span>
                                <span className="text-xs opacity-30" style={{ color: theme.colors.text }}>{s.max}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </motion.div>
                )}

                {activeTab === "custom" && (
                  <motion.div
                    key="custom"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.18 }}
                    className="space-y-3"
                  >
                    <p className="text-xs" style={{ color: theme.colors.textMuted }}>
                      Enter a polar formula using <code style={{ color: theme.colors.primary }}>t</code> as the angle. Math functions available.
                    </p>

                    {/* Formula input */}
                    <div
                      className="flex items-center gap-2 rounded-lg px-3 py-2.5 border"
                      style={{
                        background: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.04)`,
                        borderColor: formulaError ? "#ff4466" : `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.2)`,
                      }}
                    >
                      <span className="text-xs font-mono shrink-0" style={{ color: theme.colors.textMuted }}>r =</span>
                      <input
                        value={customFormula}
                        onChange={(e) => { setCustomFormula(e.target.value); setFormulaError(""); }}
                        onKeyDown={(e) => e.key === "Enter" && handleCustomRender()}
                        placeholder="cos(3*t)"
                        className="flex-1 bg-transparent outline-none text-sm font-mono"
                        style={{ color: theme.colors.text, caretColor: theme.colors.primary }}
                        spellCheck={false}
                      />
                    </div>

                    {formulaError && (
                      <div className="flex items-center gap-1.5 text-xs" style={{ color: "#ff4466" }}>
                        <AlertCircle size={12} /> {formulaError}
                      </div>
                    )}

                    <motion.button
                      onClick={handleCustomRender}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold"
                      style={{
                        background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})`,
                        color: theme.colors.background,
                      }}
                    >
                      <Play size={14} />
                      Render Curve
                    </motion.button>

                    {/* Examples */}
                    <div>
                      <p className="text-xs mb-2" style={{ color: theme.colors.textMuted }}>Quick examples:</p>
                      <div className="flex flex-wrap gap-1.5">
                        {POLAR_EXAMPLES.map((ex) => (
                          <button
                            key={ex}
                            onClick={() => { setCustomFormula(ex); setFormulaError(""); }}
                            className="px-2 py-1 rounded text-xs font-mono border transition-colors"
                            style={{
                              color: customFormula === ex ? theme.colors.primary : `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.5)`,
                              borderColor: customFormula === ex
                                ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.4)`
                                : `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.12)`,
                              background: customFormula === ex ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.08)` : "transparent",
                            }}
                          >
                            {ex}
                          </button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
