"use client";

import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Github, Maximize2, Minimize2 } from "lucide-react";

import Hero from "@/components/Hero";
import ControlPanel from "@/components/ControlPanel";
import PresetGallery from "@/components/PresetGallery";
import ThemeSelector from "@/components/ThemeSelector";
import CreatorMode from "@/components/CreatorMode";
import type { GraphCanvasHandle } from "@/components/GraphCanvas";

import {
  EQUATIONS,
  EquationConfig,
  findEquationByKeyword,
  getRandomEquation,
} from "@/lib/equations";
import { THEMES, Theme } from "@/lib/themes";
import { hexToRgb } from "@/lib/utils";

const GraphCanvas = dynamic(() => import("@/components/GraphCanvas"), {
  ssr: false,
  loading: () => <CanvasLoader />,
});

const ParticleBackground = dynamic(
  () => import("@/components/ParticleBackground"),
  { ssr: false }
);

function CanvasLoader() {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
        style={{ borderColor: "rgba(0,255,255,0.4)", borderTopColor: "transparent" }} />
    </div>
  );
}

export default function MathBloomApp() {
  const [showApp, setShowApp] = useState(false);
  const [equation, setEquation] = useState<EquationConfig | null>(null);
  const [theme, setTheme] = useState<Theme>(THEMES.neon);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationComplete, setAnimationComplete] = useState(false);
  const [overrideParams, setOverrideParams] = useState<Record<string, number>>({});

  const canvasRef = useRef<GraphCanvasHandle>(null);
  const appSectionRef = useRef<HTMLDivElement>(null);
  const canvasWrapRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const rgb = hexToRgb(theme.colors.primary) ?? { r: 0, g: 255, b: 255 };

  // Merge equation params with overrides (memoized to avoid infinite loops)
  const effectiveEquation = useMemo(() => {
    if (!equation) return null;
    if (Object.keys(overrideParams).length === 0) return equation;
    return { ...equation, params: { ...equation.params, ...overrideParams } };
  }, [equation, overrideParams]);

  const startCurve = useCallback((eq: EquationConfig) => {
    setEquation(eq);
    setOverrideParams({});
    setIsAnimating(true);
    setAnimationComplete(false);
    canvasRef.current?.restartAnimation();
  }, []);

  const handleEnterApp = useCallback(() => {
    setShowApp(true);
    setTimeout(() => appSectionRef.current?.scrollIntoView({ behavior: "smooth" }), 80);
  }, []);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    const found = findEquationByKeyword(query);
    if (found) startCurve(found);
  }, [startCurve]);

  const handleRandomize = useCallback(() => {
    const random = getRandomEquation();
    setSearchQuery(random.name);
    startCurve(random);
  }, [startCurve]);

  const handleExport = useCallback(() => canvasRef.current?.exportPNG(), []);

  const handleRestart = useCallback(() => {
    setIsAnimating(true);
    setAnimationComplete(false);
    canvasRef.current?.restartAnimation();
  }, []);

  const handleParamChange = useCallback((key: string, value: number) => {
    setOverrideParams((prev) => ({ ...prev, [key]: value }));
    setIsAnimating(true);
    setAnimationComplete(false);
    canvasRef.current?.restartAnimation();
  }, []);

  const handleCustomEquation = useCallback((eq: EquationConfig) => {
    setEquation(eq);
    setOverrideParams({});
    setSearchQuery(eq.name);
    setIsAnimating(true);
    setAnimationComplete(false);
    canvasRef.current?.restartAnimation();
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      canvasWrapRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }, []);

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  // Load rose on entry
  useEffect(() => {
    if (showApp && !equation) {
      const timer = setTimeout(() => startCurve(EQUATIONS.rose!), 500);
      return () => clearTimeout(timer);
    }
  }, [showApp, equation, startCurve]);

  return (
    <div className="relative min-h-screen overflow-x-hidden" style={{ background: theme.colors.background }}>
      <ParticleBackground theme={theme} />

      {/* Subtle scanline */}
      <div className="fixed inset-0 pointer-events-none z-[1]"
        style={{
          backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.018) 3px, rgba(0,0,0,0.018) 4px)",
        }}
      />

      {/* Hero */}
      <div className="relative z-10">
        <Hero theme={theme} onEnterApp={handleEnterApp} />
      </div>

      {/* App section */}
      <AnimatePresence>
        {showApp && (
          <motion.div
            ref={appSectionRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="relative z-10 min-h-screen px-4 py-8 md:px-6"
          >
            {/* Top bar */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                  style={{
                    background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})`,
                    boxShadow: `0 0 16px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.35)`,
                  }}
                >
                  <Sparkles size={16} color={theme.colors.background} />
                </div>
                <span className="font-black text-xl tracking-tight" style={{ color: theme.colors.primary }}>
                  MathBloom
                </span>

                <AnimatePresence>
                  {equation && (
                    <motion.span
                      initial={{ opacity: 0, scale: 0.85 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.85 }}
                      className="hidden sm:flex items-center gap-1.5 text-xs font-mono px-2 py-0.5 rounded-full"
                      style={{
                        color: animationComplete ? theme.colors.accent : theme.colors.primary,
                        background: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.08)`,
                        border: `1px solid rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.18)`,
                      }}
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full"
                        style={{
                          background: animationComplete ? theme.colors.accent : theme.colors.primary,
                          animation: animationComplete ? "none" : "pulse 1.2s infinite",
                        }}
                      />
                      {animationComplete ? "Complete" : "Drawing..."}
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>

              <ThemeSelector currentTheme={theme} onThemeChange={setTheme} />
            </div>

            {/* Main grid */}
            <div className="grid grid-cols-1 lg:grid-cols-[290px,1fr] gap-4 mb-4">
              {/* Left panel */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 }}
                className="rounded-2xl p-4 border flex flex-col gap-4"
                style={{
                  background: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.03)`,
                  backdropFilter: "blur(16px)",
                  borderColor: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.1)`,
                }}
              >
                <ControlPanel
                  theme={theme}
                  equation={effectiveEquation}
                  searchQuery={searchQuery}
                  onSearchChange={handleSearch}
                  onRandomize={handleRandomize}
                  onExport={handleExport}
                  onRestart={handleRestart}
                />

                {/* Divider */}
                <div className="border-t" style={{ borderColor: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.08)` }} />

                <CreatorMode
                  theme={theme}
                  equation={equation}
                  overrideParams={overrideParams}
                  onParamChange={handleParamChange}
                  onCustomEquation={handleCustomEquation}
                />
              </motion.div>

              {/* Canvas */}
              <motion.div
                ref={canvasWrapRef}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="canvas-wrap relative rounded-2xl overflow-hidden border"
                style={{
                  height: "clamp(380px, 58vh, 680px)",
                  borderColor: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.12)`,
                  boxShadow: `0 0 50px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.04), 0 20px 50px rgba(0,0,0,0.35)`,
                }}
              >
                {/* Corner accents */}
                {(["tl", "tr", "bl", "br"] as const).map((pos) => (
                  <div
                    key={pos}
                    className={`absolute w-5 h-5 pointer-events-none z-10 ${
                      pos === "tl" ? "top-0 left-0 border-t-2 border-l-2 rounded-tl-2xl" :
                      pos === "tr" ? "top-0 right-0 border-t-2 border-r-2 rounded-tr-2xl" :
                      pos === "bl" ? "bottom-0 left-0 border-b-2 border-l-2 rounded-bl-2xl" :
                      "bottom-0 right-0 border-b-2 border-r-2 rounded-br-2xl"
                    }`}
                    style={{ borderColor: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.35)` }}
                  />
                ))}

                {/* Fullscreen toggle button */}
                <motion.button
                  onClick={toggleFullscreen}
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.92 }}
                  className="absolute top-3 left-3 z-20 p-2 rounded-lg border transition-all"
                  style={{
                    background: "rgba(0,0,0,0.55)",
                    backdropFilter: "blur(8px)",
                    borderColor: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.2)`,
                    color: theme.colors.primary,
                  }}
                  title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
                >
                  {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
                </motion.button>

                <GraphCanvas
                  ref={canvasRef}
                  equation={effectiveEquation}
                  theme={theme}
                  isAnimating={isAnimating}
                  overrideParams={overrideParams}
                  onAnimationComplete={() => setAnimationComplete(true)}
                />

                {/* Formula overlay */}
                <AnimatePresence>
                  {effectiveEquation && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute top-3 right-3 font-mono text-xs px-3 py-1.5 rounded-lg border pointer-events-none"
                      style={{
                        background: "rgba(0,0,0,0.55)",
                        backdropFilter: "blur(8px)",
                        borderColor: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.18)`,
                        color: theme.colors.primary,
                      }}
                    >
                      {effectiveEquation.formula}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>

            {/* Preset gallery */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="rounded-2xl p-4 border"
              style={{
                background: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.02)`,
                backdropFilter: "blur(16px)",
                borderColor: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.08)`,
              }}
            >
              <PresetGallery
                theme={theme}
                activeEquation={equation}
                onSelect={startCurve}
              />
            </motion.div>

            {/* Footer */}
            <div
              className="flex items-center justify-between mt-5 pt-4 border-t text-xs font-mono"
              style={{ borderColor: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.08)`, color: theme.colors.textMuted }}
            >
              <span>MathBloom</span>
              <div className="flex items-center gap-4">
                <a
                  href="https://github.com/Avrodip/MathBloom"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 hover:opacity-70 transition-opacity"
                  style={{ color: theme.colors.textMuted }}
                >
                  <Github size={13} /> GitHub
                </a>
                <span style={{ color: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.3)` }}>
                  Next.js 15 · Framer Motion · Canvas 2D
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
