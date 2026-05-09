"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { EQUATIONS, EquationConfig, computePoints } from "@/lib/equations";
import { Theme } from "@/lib/themes";
import { hexToRgb } from "@/lib/utils";

interface PresetCardProps {
  config: EquationConfig;
  theme: Theme;
  isActive: boolean;
  onClick: () => void;
}

function PresetCard({ config, theme, isActive, onClick }: PresetCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const accentRgb = hexToRgb(theme.colors.primary) ?? { r: 0, g: 255, b: 255 };

  // Draw once — no animation loop (performance)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;
    const rgb = hexToRgb(config.color) ?? { r: 0, g: 255, b: 255 };
    const bgRgb = hexToRgb(theme.colors.canvasBg) ?? { r: 3, g: 3, b: 8 };

    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = `rgb(${bgRgb.r}, ${bgRgb.g}, ${bgRgb.b})`;
    ctx.fillRect(0, 0, W, H);

    // Center glow
    const grad = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, W * 0.5);
    grad.addColorStop(0, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.12)`);
    grad.addColorStop(1, "transparent");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    let points: [number, number][];

    if (config.renderType === "cartesian") {
      const { A, B } = config.params;
      const scale = 0.38;
      points = [];
      for (let px = 0; px <= W; px += 2) {
        const x = px - W / 2;
        points.push([px, H / 2 + A * scale * Math.sin(B * x * 3)]);
      }
    } else {
      points = computePoints(config, W, H);
    }

    if (points.length > 1) {
      // Glow pass
      ctx.save();
      ctx.shadowBlur = 14;
      ctx.shadowColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.9)`;
      ctx.strokeStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.35)`;
      ctx.lineWidth = 4;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.beginPath();
      ctx.moveTo(points[0][0], points[0][1]);
      for (let i = 1; i < points.length; i++) ctx.lineTo(points[i][0], points[i][1]);
      ctx.stroke();
      ctx.restore();

      // Core pass
      ctx.save();
      ctx.shadowBlur = 4;
      ctx.shadowColor = config.color;
      ctx.strokeStyle = config.color;
      ctx.lineWidth = 1.5;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.beginPath();
      ctx.moveTo(points[0][0], points[0][1]);
      for (let i = 1; i < points.length; i++) ctx.lineTo(points[i][0], points[i][1]);
      ctx.stroke();
      ctx.restore();
    }
  }, [config, theme]);

  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.05, y: -3 }}
      whileTap={{ scale: 0.96 }}
      className="relative flex-shrink-0 rounded-2xl overflow-hidden border transition-colors cursor-pointer"
      style={{
        width: 130,
        height: 130,
        borderColor: isActive
          ? theme.colors.primary
          : `rgba(${accentRgb.r}, ${accentRgb.g}, ${accentRgb.b}, 0.12)`,
        boxShadow: isActive
          ? `0 0 18px rgba(${accentRgb.r}, ${accentRgb.g}, ${accentRgb.b}, 0.35)`
          : "none",
      }}
    >
      <canvas ref={canvasRef} width={130} height={130} className="block" />
      <div
        className="absolute bottom-0 left-0 right-0 px-2 py-1.5"
        style={{ background: "linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%)" }}
      >
        <div
          className="text-xs font-semibold"
          style={{ color: isActive ? theme.colors.primary : "rgba(255,255,255,0.8)" }}
        >
          {config.emoji} {config.name}
        </div>
      </div>
      {isActive && (
        <div
          className="absolute inset-0 rounded-2xl pointer-events-none"
          style={{ border: `2px solid ${theme.colors.primary}` }}
        />
      )}
    </motion.button>
  );
}

interface PresetGalleryProps {
  theme: Theme;
  activeEquation: EquationConfig | null;
  onSelect: (config: EquationConfig) => void;
}

export default function PresetGallery({ theme, activeEquation, onSelect }: PresetGalleryProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 1);
  };

  useEffect(() => { checkScroll(); }, []);

  const rgb = hexToRgb(theme.colors.primary) ?? { r: 0, g: 255, b: 255 };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-bold tracking-widest uppercase font-mono"
          style={{ color: theme.colors.primary }}>
          ✦ Presets
        </h2>
        <span className="text-xs font-mono" style={{ color: theme.colors.textMuted }}>
          {Object.keys(EQUATIONS).length} curves
        </span>
      </div>

      <div className="relative">
        {canScrollRight && (
          <div className="absolute right-0 top-0 bottom-0 w-10 z-10 pointer-events-none"
            style={{ background: `linear-gradient(to left, ${theme.colors.background}, transparent)` }} />
        )}
        <div
          ref={scrollRef}
          onScroll={checkScroll}
          className="flex gap-3 overflow-x-auto pb-2 no-scrollbar"
        >
          {Object.values(EQUATIONS).map((config, i) => (
            <motion.div
              key={config.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.3 }}
            >
              <PresetCard
                config={config}
                theme={theme}
                isActive={activeEquation?.id === config.id}
                onClick={() => onSelect(config)}
              />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Formula hint bar */}
      <div className="mt-3 flex flex-wrap gap-2">
        {Object.values(EQUATIONS).map((eq) => (
          <button
            key={eq.id}
            onClick={() => onSelect(eq)}
            className="text-xs font-mono px-2 py-0.5 rounded transition-colors"
            style={{
              color: activeEquation?.id === eq.id ? theme.colors.primary : `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.35)`,
              background: activeEquation?.id === eq.id ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.08)` : "transparent",
            }}
          >
            {eq.formula}
          </button>
        ))}
      </div>
    </div>
  );
}
