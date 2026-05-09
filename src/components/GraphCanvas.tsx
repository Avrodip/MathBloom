"use client";

import {
  useEffect,
  useRef,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from "react";
import { EquationConfig, computePoints } from "@/lib/equations";
import { Theme } from "@/lib/themes";
import { hexToRgb } from "@/lib/utils";

export interface GraphCanvasHandle {
  exportPNG: () => void;
  restartAnimation: () => void;
}

interface GraphCanvasProps {
  equation: EquationConfig | null;
  theme: Theme;
  isAnimating: boolean;
  overrideParams?: Record<string, number>;
  onAnimationComplete?: () => void;
}

const GraphCanvas = forwardRef<GraphCanvasHandle, GraphCanvasProps>(
  function GraphCanvas({ equation, theme, isAnimating, overrideParams, onAnimationComplete }, ref) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animFrameRef = useRef<number>(0);
    const progressRef = useRef<number>(0);
    const pointsRef = useRef<[number, number][]>([]);
    const waveOffsetRef = useRef<number>(0);
    const equationRef = useRef(equation);
    const themeRef = useRef(theme);
    const overrideRef = useRef(overrideParams);
    const completedRef = useRef(false);
    // Store CSS display dimensions (not canvas.width which is physical pixels * dpr)
    const displayRef = useRef({ w: 0, h: 0 });

    useEffect(() => { equationRef.current = equation; }, [equation]);
    useEffect(() => { themeRef.current = theme; }, [theme]);
    useEffect(() => { overrideRef.current = overrideParams; }, [overrideParams]);

    const getMergedParams = useCallback((config: EquationConfig) => ({
      ...config.params,
      ...(overrideRef.current ?? {}),
    }), []);

    const drawGlowLine = useCallback(
      (ctx: CanvasRenderingContext2D, points: [number, number][], color: string) => {
        if (points.length < 2) return;
        const rgb = hexToRgb(color) ?? { r: 0, g: 255, b: 255 };

        // Build path once, reuse for both passes
        const path = new Path2D();
        path.moveTo(points[0][0], points[0][1]);
        for (let i = 1; i < points.length; i++) path.lineTo(points[i][0], points[i][1]);

        // Glow pass
        ctx.save();
        ctx.shadowBlur = 22;
        ctx.shadowColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.7)`;
        ctx.strokeStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.22)`;
        ctx.lineWidth = 8;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.stroke(path);
        ctx.restore();

        // Core pass
        ctx.save();
        ctx.shadowBlur = 6;
        ctx.shadowColor = color;
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.8;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.stroke(path);
        ctx.restore();
      },
      []
    );

    const drawGrid = useCallback(
      (ctx: CanvasRenderingContext2D, w: number, h: number, color: string) => {
        const rgb = hexToRgb(color) ?? { r: 255, g: 255, b: 255 };
        ctx.save();
        ctx.strokeStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.04)`;
        ctx.lineWidth = 1;
        const sp = 50;
        for (let x = 0; x < w; x += sp) {
          ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
        }
        for (let y = 0; y < h; y += sp) {
          ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
        }
        ctx.strokeStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.1)`;
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(w / 2, 0); ctx.lineTo(w / 2, h); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, h / 2); ctx.lineTo(w, h / 2); ctx.stroke();
        ctx.restore();
      },
      []
    );

    const renderFrame = useCallback(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // ✅ Use CSS display size (not canvas.width which is physical pixels)
      const w = displayRef.current.w || canvas.clientWidth;
      const h = displayRef.current.h || canvas.clientHeight;
      if (!w || !h) return;

      const eq = equationRef.current;
      const t = themeRef.current;
      const bgRgb = hexToRgb(t.colors.canvasBg) ?? { r: 3, g: 3, b: 8 };
      const primaryRgb = hexToRgb(t.colors.primary) ?? { r: 0, g: 255, b: 255 };

      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = `rgb(${bgRgb.r}, ${bgRgb.g}, ${bgRgb.b})`;
      ctx.fillRect(0, 0, w, h);

      // Radial center glow
      const grad = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, Math.min(w, h) * 0.45);
      grad.addColorStop(0, `rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, 0.05)`);
      grad.addColorStop(1, "transparent");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      drawGrid(ctx, w, h, t.colors.primary);

      if (!eq) {
        ctx.save();
        ctx.font = "bold 16px var(--font-jetbrains, monospace)";
        ctx.fillStyle = `rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, 0.25)`;
        ctx.textAlign = "center";
        ctx.fillText("Type a keyword to begin...", w / 2, h / 2 - 10);
        ctx.font = "13px var(--font-jetbrains, monospace)";
        ctx.fillStyle = `rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, 0.12)`;
        ctx.fillText("rose · heart · spiral · galaxy · wave", w / 2, h / 2 + 18);
        ctx.restore();
        return;
      }

      const mergedParams = getMergedParams(eq);

      if (eq.renderType === "cartesian") {
        waveOffsetRef.current += 0.025;
        const off = waveOffsetRef.current;
        const { A, B, C } = mergedParams;
        const cx = w / 2;
        const cy = h / 2;

        const wave1: [number, number][] = [];
        const wave2: [number, number][] = [];
        for (let px = 0; px <= w; px += 2) {
          const x = px - cx;
          wave1.push([px, cy + A * Math.sin(B * x + C * off)]);
          wave2.push([px, cy + A * 0.45 * Math.sin(B * 2.3 * x + C * off * 1.4 + 1)]);
        }
        const rgb2 = hexToRgb(eq.color) ?? { r: 0, g: 255, b: 136 };
        ctx.save();
        ctx.globalAlpha = 0.45;
        ctx.restore();
        drawGlowLine(ctx, wave2, `rgba(${rgb2.r}, ${rgb2.g}, ${rgb2.b}, 0.5)`);
        drawGlowLine(ctx, wave1, eq.color);
      } else {
        const SPEED = 5;
        if (isAnimating && progressRef.current < pointsRef.current.length) {
          progressRef.current = Math.min(progressRef.current + SPEED, pointsRef.current.length);
        }

        if (progressRef.current >= pointsRef.current.length && !completedRef.current && pointsRef.current.length > 0) {
          completedRef.current = true;
          onAnimationComplete?.();
        }

        const visible = pointsRef.current.slice(0, Math.floor(progressRef.current));
        if (visible.length > 1) drawGlowLine(ctx, visible, eq.color);

        // Leading dot
        if (visible.length > 0 && progressRef.current < pointsRef.current.length) {
          const [tx, ty] = visible[visible.length - 1];
          const dotRgb = hexToRgb(eq.color) ?? { r: 255, g: 255, b: 255 };
          ctx.save();
          ctx.shadowBlur = 18;
          ctx.shadowColor = eq.color;
          ctx.fillStyle = `rgb(${dotRgb.r}, ${dotRgb.g}, ${dotRgb.b})`;
          ctx.beginPath();
          ctx.arc(tx, ty, 3.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      }
    }, [drawGlowLine, drawGrid, isAnimating, getMergedParams, onAnimationComplete]);

    // Recompute points when equation or override params change
    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas || !equation) {
        progressRef.current = 0;
        pointsRef.current = [];
        return;
      }
      progressRef.current = 0;
      completedRef.current = false;
      if (equation.renderType !== "cartesian") {
        const { w, h } = displayRef.current;
        const mergedConfig = { ...equation, params: { ...equation.params, ...(overrideParams ?? {}) } };
        pointsRef.current = computePoints(mergedConfig, w || canvas.clientWidth, h || canvas.clientHeight);
      }
    }, [equation, overrideParams]);

    // Animation loop
    useEffect(() => {
      let active = true;
      const loop = () => {
        if (!active || document.hidden) { animFrameRef.current = requestAnimationFrame(loop); return; }
        renderFrame();
        animFrameRef.current = requestAnimationFrame(loop);
      };
      animFrameRef.current = requestAnimationFrame(loop);
      return () => { active = false; cancelAnimationFrame(animFrameRef.current); };
    }, [renderFrame]);

    // Resize — uses setTransform to avoid DPR accumulation
    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const resize = () => {
        const parent = canvas.parentElement;
        if (!parent) return;
        const dpr = Math.min(window.devicePixelRatio ?? 1, 2); // Cap at 2x for perf
        const w = parent.clientWidth;
        const h = parent.clientHeight;
        displayRef.current = { w, h }; // Store CSS display dimensions
        canvas.width = w * dpr;
        canvas.height = h * dpr;
        canvas.style.width = `${w}px`;
        canvas.style.height = `${h}px`;
        // ✅ setTransform (not scale) prevents accumulation across resizes
        const ctx = canvas.getContext("2d");
        if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        // Recompute with CSS pixel dimensions
        if (equationRef.current && equationRef.current.renderType !== "cartesian") {
          const merged = { ...equationRef.current, params: { ...equationRef.current.params, ...(overrideRef.current ?? {}) } };
          pointsRef.current = computePoints(merged, w, h);
        }
      };

      resize();
      const ro = new ResizeObserver(resize);
      ro.observe(canvas.parentElement!);
      return () => ro.disconnect();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    useImperativeHandle(ref, () => ({
      exportPNG() {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const link = document.createElement("a");
        link.download = `mathbloom-${equationRef.current?.id ?? "art"}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
      },
      restartAnimation() {
        progressRef.current = 0;
        completedRef.current = false;
        waveOffsetRef.current = 0;
      },
    }));

    return <canvas ref={canvasRef} className="w-full h-full block" />;
  }
);

export default GraphCanvas;
