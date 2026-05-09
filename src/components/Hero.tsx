"use client";

import { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Sparkles, ChevronDown, Zap } from "lucide-react";
import { Theme } from "@/lib/themes";
import { hexToRgb } from "@/lib/utils";

interface HeroProps {
  theme: Theme;
  onEnterApp: () => void;
}

function MiniCanvas({ theme }: { theme: Theme }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const tRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;
    const cx = W / 2;
    const cy = H / 2;

    let running = true;

    const draw = () => {
      if (!running) return;
      tRef.current += 0.012;
      const t = tRef.current;

      ctx.clearRect(0, 0, W, H);
      const rgb = hexToRgb(theme.colors.primary) ?? { r: 0, g: 255, b: 255 };
      const rgb2 = hexToRgb(theme.colors.secondary) ?? { r: 255, g: 0, b: 255 };

      // Rose curve — animated k
      const k = 5;
      const scale = Math.min(W, H) * 0.38;

      const points: [number, number][] = [];
      for (let theta = 0; theta <= Math.PI * 2; theta += 0.02) {
        const r = scale * Math.cos(k * theta);
        points.push([cx + r * Math.cos(theta + t * 0.2), cy + r * Math.sin(theta + t * 0.2)]);
      }

      if (points.length > 1) {
        // Outer glow
        ctx.save();
        ctx.shadowBlur = 25;
        ctx.shadowColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.7)`;
        ctx.strokeStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.3)`;
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(points[0][0], points[0][1]);
        for (const [px, py] of points) ctx.lineTo(px, py);
        ctx.closePath();
        ctx.stroke();
        ctx.restore();

        // Core
        ctx.save();
        ctx.shadowBlur = 8;
        ctx.shadowColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 1)`;
        ctx.strokeStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.9)`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(points[0][0], points[0][1]);
        for (const [px, py] of points) ctx.lineTo(px, py);
        ctx.closePath();
        ctx.stroke();
        ctx.restore();
      }

      // Secondary spiral overlay
      ctx.save();
      ctx.shadowBlur = 12;
      ctx.shadowColor = `rgba(${rgb2.r}, ${rgb2.g}, ${rgb2.b}, 0.5)`;
      ctx.strokeStyle = `rgba(${rgb2.r}, ${rgb2.g}, ${rgb2.b}, 0.2)`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let theta = 0; theta <= Math.PI * 6; theta += 0.05) {
        const r2 = theta * 5;
        const x = cx + r2 * Math.cos(theta - t * 0.3);
        const y = cy + r2 * Math.sin(theta - t * 0.3);
        if (theta === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.restore();

      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);
    return () => {
      running = false;
      cancelAnimationFrame(animRef.current);
    };
  }, [theme]);

  return (
    <canvas
      ref={canvasRef}
      width={280}
      height={280}
      className="rounded-full opacity-80"
    />
  );
}

export default function Hero({ theme, onEnterApp }: HeroProps) {
  const rgb = hexToRgb(theme.colors.primary) ?? { r: 0, g: 255, b: 255 };
  const rgb2 = hexToRgb(theme.colors.secondary) ?? { r: 255, g: 0, b: 255 };

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-6 py-20 overflow-hidden">
      {/* Background radial glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 80% 60% at 50% 50%, rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.08) 0%, transparent 70%)`,
        }}
      />

      {/* Animated grid lines */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.06) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative z-10 flex flex-col items-center text-center max-w-5xl mx-auto">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <span
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-mono font-semibold tracking-widest uppercase border"
            style={{
              color: theme.colors.primary,
              borderColor: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.3)`,
              background: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.08)`,
            }}
          >
            <Zap size={12} />
            Mathematical Art Generator
          </span>
        </motion.div>

        {/* Main title */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="text-7xl sm:text-8xl md:text-9xl font-black tracking-tighter mb-6 leading-none"
        >
          <span
            className="block"
            style={{
              background: `linear-gradient(135deg, ${theme.colors.gradientFrom}, ${theme.colors.gradientVia}, ${theme.colors.gradientTo})`,
              backgroundSize: "200% 200%",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              filter: `drop-shadow(0 0 30px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.4))`,
            }}
          >
            Math
          </span>
          <span
            className="block"
            style={{
              background: `linear-gradient(135deg, ${theme.colors.gradientVia}, ${theme.colors.gradientTo}, ${theme.colors.gradientFrom})`,
              backgroundSize: "200% 200%",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              filter: `drop-shadow(0 0 30px rgba(${rgb2.r}, ${rgb2.g}, ${rgb2.b}, 0.4))`,
            }}
          >
            Bloom
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-lg sm:text-xl max-w-xl mb-4 font-light leading-relaxed"
          style={{ color: theme.colors.textMuted }}
        >
          Type a word. Watch mathematics bloom into art.
          <br />
          Powered by polar equations, parametric curves & pure geometry.
        </motion.p>

        {/* Formula showcase */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="flex flex-wrap justify-center gap-3 mb-12 font-mono text-xs"
        >
          {["r=cos(kθ)", "x=16sin³t", "r=ae^(bθ)", "y=A·sin(Bt)"].map(
            (f, i) => (
              <motion.span
                key={f}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 + i * 0.1 }}
                className="px-3 py-1 rounded-md border"
                style={{
                  color: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.7)`,
                  borderColor: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.15)`,
                  background: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.05)`,
                }}
              >
                {f}
              </motion.span>
            )
          )}
        </motion.div>

        {/* Canvas preview + CTA */}
        <div className="flex flex-col lg:flex-row items-center gap-12">
          {/* Mini canvas */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 1, delay: 0.4, type: "spring" }}
            className="relative"
          >
            <div
              className="rounded-full p-1"
              style={{
                background: `conic-gradient(from 0deg, ${theme.colors.primary}, ${theme.colors.secondary}, ${theme.colors.accent}, ${theme.colors.primary})`,
              }}
            >
              <div
                className="rounded-full p-1"
                style={{ background: theme.colors.canvasBg }}
              >
                <MiniCanvas theme={theme} />
              </div>
            </div>
            {/* Orbiting dot */}
            <motion.div
              className="absolute top-0 left-1/2 w-3 h-3 rounded-full -translate-x-1/2 -translate-y-1/2"
              style={{ background: theme.colors.primary, boxShadow: `0 0 12px ${theme.colors.primary}` }}
              animate={{ rotate: 360 }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              transformTemplate={({ rotate }) =>
                `rotate(${rotate}) translateX(150px) rotate(-${rotate})`
              }
            />
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col items-center lg:items-start gap-4"
          >
            <motion.button
              onClick={onEnterApp}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative overflow-hidden px-8 py-4 rounded-xl font-bold text-lg tracking-wide"
              style={{
                background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})`,
                color: theme.colors.background,
                boxShadow: `0 0 30px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.4), 0 0 60px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.15)`,
              }}
            >
              <span className="relative z-10 flex items-center gap-2">
                <Sparkles size={18} />
                Start Creating
              </span>
            </motion.button>

            <p className="text-sm font-mono" style={{ color: theme.colors.textMuted }}>
              6 curves · 4 themes · infinite art
            </p>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.button
        onClick={onEnterApp}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, y: [0, 8, 0] }}
        transition={{ opacity: { delay: 1.5 }, y: { repeat: Infinity, duration: 2 } }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 cursor-pointer"
        style={{ color: theme.colors.textMuted }}
      >
        <span className="text-xs font-mono tracking-widest uppercase">Explore</span>
        <ChevronDown size={20} />
      </motion.button>
    </section>
  );
}
