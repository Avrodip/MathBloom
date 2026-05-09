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
  const animRef = useRef<number>(0);
  const progressRef = useRef(0);
  const waveOffRef = useRef(0);
  const accentRgb = hexToRgb(theme.colors.primary) ?? { r: 0, g: 255, b: 255 };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rgb = hexToRgb(config.color) ?? { r: 0, g: 255, b: 255 };
    const W = canvas.width;
    const H = canvas.height;

    const points =
      config.renderType !== "cartesian" ? computePoints(config, W, H) : [];
    progressRef.current = 0;
    let running = true;

    const draw = () => {
      if (!running) return;

      ctx.clearRect(0, 0, W, H);

      // Background
      const bgRgb = hexToRgb(theme.colors.canvasBg) ?? { r: 3, g: 3, b: 8 };
      ctx.fillStyle = `rgb(${bgRgb.r}, ${bgRgb.g}, ${bgRgb.b})`;
      ctx.fillRect(0, 0, W, H);

      // Radial glow
      const grad = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, W * 0.5);
      grad.addColorStop(0, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.1)`);
      grad.addColorStop(1, "transparent");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);

      if (config.renderType === "cartesian") {
        waveOffRef.current += 0.04;
        const { A, B, C } = config.params;
        const scale = 0.35;
        ctx.save();
        ctx.shadowBlur = 10;
        ctx.shadowColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.8)`;
        ctx.strokeStyle = config.color;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        for (let px = 0; px <= W; px += 1.5) {
          const x = px - W / 2;
          const y = A * scale * Math.sin(B * x * 3 + C * waveOffRef.current);
          if (px === 0) ctx.moveTo(px, H / 2 + y);
          else ctx.lineTo(px, H / 2 + y);
        }
        ctx.stroke();
        ctx.restore();
      } else {
        const SPEED = Math.ceil(points.length / 120);
        progressRef.current = Math.min(
          progressRef.current + SPEED,
          points.length
        );

        if (progressRef.current >= points.length) {
          // Stay at full after completion — keep re-drawing to keep glow fresh
          progressRef.current = points.length;
        }

        const visible = points.slice(0, Math.floor(progressRef.current));

        if (visible.length > 1) {
          ctx.save();
          ctx.shadowBlur = 15;
          ctx.shadowColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.8)`;
          ctx.strokeStyle = config.color;
          ctx.lineWidth = 1.5;
          ctx.lineCap = "round";
          ctx.lineJoin = "round";
          ctx.beginPath();
          ctx.moveTo(visible[0][0], visible[0][1]);
          for (let i = 1; i < visible.length; i++) {
            ctx.lineTo(visible[i][0], visible[i][1]);
          }
          ctx.stroke();
          ctx.restore();
        }
      }

      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);
    return () => {
      running = false;
      cancelAnimationFrame(animRef.current);
    };
  }, [config, theme]);

  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.04, y: -4 }}
      whileTap={{ scale: 0.96 }}
      className="relative flex-shrink-0 rounded-2xl overflow-hidden border transition-all cursor-pointer"
      style={{
        width: 140,
        height: 140,
        borderColor: isActive
          ? theme.colors.primary
          : `rgba(${accentRgb.r}, ${accentRgb.g}, ${accentRgb.b}, 0.15)`,
        boxShadow: isActive
          ? `0 0 20px rgba(${accentRgb.r}, ${accentRgb.g}, ${accentRgb.b}, 0.4), 0 0 40px rgba(${accentRgb.r}, ${accentRgb.g}, ${accentRgb.b}, 0.15)`
          : "none",
      }}
    >
      <canvas ref={canvasRef} width={140} height={140} className="block" />

      {/* Label overlay */}
      <div
        className="absolute bottom-0 left-0 right-0 px-2 py-2"
        style={{
          background: `linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 100%)`,
        }}
      >
        <div
          className="text-xs font-bold"
          style={{ color: isActive ? theme.colors.primary : "rgba(255,255,255,0.85)" }}
        >
          {config.emoji} {config.name}
        </div>
      </div>

      {/* Active indicator ring */}
      {isActive && (
        <motion.div
          layoutId="active-ring"
          className="absolute inset-0 rounded-2xl pointer-events-none"
          style={{
            border: `2px solid ${theme.colors.primary}`,
            boxShadow: `inset 0 0 20px rgba(${accentRgb.r}, ${accentRgb.g}, ${accentRgb.b}, 0.15)`,
          }}
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

export default function PresetGallery({
  theme,
  activeEquation,
  onSelect,
}: PresetGalleryProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 1);
  };

  useEffect(() => {
    checkScroll();
  }, []);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <h2
          className="text-sm font-bold tracking-widest uppercase font-mono"
          style={{ color: theme.colors.primary }}
        >
          ✦ Presets
        </h2>
        <span className="text-xs font-mono" style={{ color: theme.colors.textMuted }}>
          {Object.keys(EQUATIONS).length} curves
        </span>
      </div>

      <div className="relative">
        {/* Gradient fade edges */}
        {canScrollLeft && (
          <div
            className="absolute left-0 top-0 bottom-0 w-8 z-10 pointer-events-none"
            style={{
              background: `linear-gradient(to right, ${theme.colors.background}, transparent)`,
            }}
          />
        )}
        {canScrollRight && (
          <div
            className="absolute right-0 top-0 bottom-0 w-8 z-10 pointer-events-none"
            style={{
              background: `linear-gradient(to left, ${theme.colors.background}, transparent)`,
            }}
          />
        )}

        <div
          ref={scrollRef}
          onScroll={checkScroll}
          className="flex gap-3 overflow-x-auto pb-2"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {Object.values(EQUATIONS).map((config, i) => (
            <motion.div
              key={config.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07, duration: 0.4 }}
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
    </div>
  );
}
