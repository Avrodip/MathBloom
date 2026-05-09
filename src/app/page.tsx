"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Github, ExternalLink } from "lucide-react";

import Hero from "@/components/Hero";
import ControlPanel from "@/components/ControlPanel";
import PresetGallery from "@/components/PresetGallery";
import ThemeSelector from "@/components/ThemeSelector";
import type { GraphCanvasHandle } from "@/components/GraphCanvas";

import { EQUATIONS, EquationConfig, findEquationByKeyword, getRandomEquation } from "@/lib/equations";
import { THEMES, Theme } from "@/lib/themes";
import { hexToRgb } from "@/lib/utils";

// Dynamic import to avoid SSR issues with canvas APIs
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
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-2 border-t-transparent border-cyan-400 animate-spin" />
          <div className="absolute inset-2 rounded-full border-2 border-b-transparent border-purple-400 animate-spin-reverse" />
        </div>
        <span className="text-xs font-mono text-cyan-400/50">Initializing Canvas...</span>
      </div>
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

  const canvasRef = useRef<GraphCanvasHandle>(null);
  const appSectionRef = useRef<HTMLDivElement>(null);

  const rgb = hexToRgb(theme.colors.primary) ?? { r: 0, g: 255, b: 255 };

  const handleEnterApp = useCallback(() => {
    setShowApp(true);
    setTimeout(() => {
      appSectionRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  }, []);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    const found = findEquationByKeyword(query);
    if (found) {
      setEquation(found);
      setIsAnimating(true);
      setAnimationComplete(false);
      canvasRef.current?.restartAnimation();
    }
  }, []);

  const handlePresetSelect = useCallback((config: EquationConfig) => {
    setEquation(config);
    setSearchQuery(config.name);
    setIsAnimating(true);
    setAnimationComplete(false);
    canvasRef.current?.restartAnimation();
  }, []);

  const handleRandomize = useCallback(() => {
    const random = getRandomEquation();
    setEquation(random);
    setSearchQuery(random.name);
    setIsAnimating(true);
    setAnimationComplete(false);
    canvasRef.current?.restartAnimation();
  }, []);

  const handleExport = useCallback(() => {
    canvasRef.current?.exportPNG();
  }, []);

  const handleRestart = useCallback(() => {
    setIsAnimating(true);
    setAnimationComplete(false);
    canvasRef.current?.restartAnimation();
  }, []);

  const handleThemeChange = useCallback((newTheme: Theme) => {
    setTheme(newTheme);
  }, []);

  const handleAnimationComplete = useCallback(() => {
    setAnimationComplete(true);
  }, []);

  // Load a default equation after entering app
  useEffect(() => {
    if (showApp && !equation) {
      const timer = setTimeout(() => {
        handlePresetSelect(EQUATIONS.rose);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [showApp, equation, handlePresetSelect]);

  return (
    <div
      className="relative min-h-screen overflow-x-hidden"
      style={{ background: theme.colors.background }}
    >
      {/* Particle background */}
      <ParticleBackground theme={theme} />

      {/* Scanline overlay */}
      <div
        className="fixed inset-0 pointer-events-none z-[1]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.025) 2px, rgba(0,0,0,0.025) 4px)",
        }}
      />

      {/* Hero Section */}
      <div className="relative z-10">
        <Hero theme={theme} onEnterApp={handleEnterApp} />
      </div>

      {/* App Section */}
      <AnimatePresence>
        {showApp && (
          <motion.div
            ref={appSectionRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="relative z-10 min-h-screen px-4 py-8 md:px-8"
          >
            {/* Top bar */}
            <div className="flex items-center justify-between mb-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-3"
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{
                    background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})`,
                    boxShadow: `0 0 20px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.4)`,
                  }}
                >
                  <Sparkles size={16} color={theme.colors.background} />
                </div>
                <span
                  className="font-black text-xl tracking-tight"
                  style={{ color: theme.colors.primary }}
                >
                  MathBloom
                </span>

                {/* Status indicator */}
                <AnimatePresence>
                  {equation && (
                    <motion.span
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="text-xs font-mono px-2 py-0.5 rounded-full flex items-center gap-1.5"
                      style={{
                        color: animationComplete ? theme.colors.accent : theme.colors.primary,
                        background: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.08)`,
                        border: `1px solid rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.2)`,
                      }}
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full"
                        style={{
                          background: animationComplete ? theme.colors.accent : theme.colors.primary,
                          boxShadow: `0 0 6px ${animationComplete ? theme.colors.accent : theme.colors.primary}`,
                          animation: animationComplete ? "none" : "pulse 1s infinite",
                        }}
                      />
                      {animationComplete ? "Complete" : "Drawing..."}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <ThemeSelector
                  currentTheme={theme}
                  onThemeChange={handleThemeChange}
                />
              </motion.div>
            </div>

            {/* Main layout */}
            <div className="grid grid-cols-1 lg:grid-cols-[300px,1fr] gap-5 mb-6">
              {/* Left: Control Panel */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="rounded-2xl p-5 border"
                style={{
                  background: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.03)`,
                  backdropFilter: "blur(20px)",
                  borderColor: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.12)`,
                  boxShadow: `0 20px 60px rgba(0,0,0,0.3)`,
                }}
              >
                <ControlPanel
                  theme={theme}
                  equation={equation}
                  searchQuery={searchQuery}
                  onSearchChange={handleSearch}
                  onRandomize={handleRandomize}
                  onExport={handleExport}
                  onRestart={handleRestart}
                />
              </motion.div>

              {/* Right: Canvas */}
              <motion.div
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.15 }}
                className="relative rounded-2xl overflow-hidden border"
                style={{
                  height: "clamp(400px, 60vh, 700px)",
                  borderColor: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.15)`,
                  boxShadow: `0 0 60px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.05), 0 20px 60px rgba(0,0,0,0.4)`,
                }}
              >
                {/* Corner accents */}
                {["tl", "tr", "bl", "br"].map((pos) => (
                  <div
                    key={pos}
                    className={`absolute w-6 h-6 pointer-events-none z-10 ${
                      pos === "tl" ? "top-0 left-0 border-t-2 border-l-2 rounded-tl-2xl" :
                      pos === "tr" ? "top-0 right-0 border-t-2 border-r-2 rounded-tr-2xl" :
                      pos === "bl" ? "bottom-0 left-0 border-b-2 border-l-2 rounded-bl-2xl" :
                      "bottom-0 right-0 border-b-2 border-r-2 rounded-br-2xl"
                    }`}
                    style={{ borderColor: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.4)` }}
                  />
                ))}

                <GraphCanvas
                  ref={canvasRef}
                  equation={equation}
                  theme={theme}
                  isAnimating={isAnimating}
                  onAnimationComplete={handleAnimationComplete}
                />

                {/* Equation label overlay */}
                <AnimatePresence>
                  {equation && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute top-4 right-4 font-mono text-xs px-3 py-1.5 rounded-lg border pointer-events-none"
                      style={{
                        background: `rgba(0, 0, 0, 0.6)`,
                        backdropFilter: "blur(10px)",
                        borderColor: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.2)`,
                        color: theme.colors.primary,
                      }}
                    >
                      {equation.formula}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>

            {/* Preset Gallery */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="rounded-2xl p-5 border"
              style={{
                background: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.03)`,
                backdropFilter: "blur(20px)",
                borderColor: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.1)`,
              }}
            >
              <PresetGallery
                theme={theme}
                activeEquation={equation}
                onSelect={handlePresetSelect}
              />
            </motion.div>

            {/* Footer */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex items-center justify-between mt-6 pt-4 border-t text-xs font-mono"
              style={{
                borderColor: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.1)`,
                color: theme.colors.textMuted,
              }}
            >
              <span>MathBloom — Mathematical Art Generator</span>
              <div className="flex items-center gap-4">
                <a
                  href="https://github.com"
                  className="flex items-center gap-1 hover:opacity-70 transition-opacity"
                  style={{ color: theme.colors.textMuted }}
                >
                  <Github size={13} />
                  GitHub
                </a>
                <span style={{ color: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.4)` }}>
                  Built with Next.js 15 · p5.js · Framer Motion
                </span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Enter app hint when not yet shown */}
      {!showApp && (
        <div className="fixed bottom-4 right-4 z-20">
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 2 }}
            onClick={handleEnterApp}
            className="text-xs font-mono px-3 py-2 rounded-lg border flex items-center gap-2"
            style={{
              color: theme.colors.primary,
              borderColor: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.3)`,
              background: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.08)`,
            }}
          >
            <ExternalLink size={12} />
            Open Studio
          </motion.button>
        </div>
      )}
    </div>
  );
}
