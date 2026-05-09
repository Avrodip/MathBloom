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
  onAnimationComplete?: () => void;
}

const GraphCanvas = forwardRef<GraphCanvasHandle, GraphCanvasProps>(
  function GraphCanvas({ equation, theme, isAnimating, onAnimationComplete }, ref) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animFrameRef = useRef<number>(0);
    const progressRef = useRef<number>(0);
    const pointsRef = useRef<[number, number][]>([]);
    const waveOffsetRef = useRef<number>(0);
    const equationRef = useRef(equation);
    const themeRef = useRef(theme);
    const completedRef = useRef(false);

    useEffect(() => { equationRef.current = equation; }, [equation]);
    useEffect(() => { themeRef.current = theme; }, [theme]);

    const drawGlowLine = useCallback(
      (
        ctx: CanvasRenderingContext2D,
        points: [number, number][],
        color: string,
        glowColor: string,
        lineWidth: number = 2
      ) => {
        if (points.length < 2) return;
        const rgb = hexToRgb(glowColor) ?? { r: 0, g: 255, b: 255 };

        // Outer glow pass
        ctx.save();
        ctx.shadowBlur = 30;
        ctx.shadowColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.6)`;
        ctx.strokeStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.25)`;
        ctx.lineWidth = lineWidth + 8;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.beginPath();
        ctx.moveTo(points[0][0], points[0][1]);
        for (let i = 1; i < points.length; i++) {
          ctx.lineTo(points[i][0], points[i][1]);
        }
        ctx.stroke();
        ctx.restore();

        // Middle glow pass
        ctx.save();
        ctx.shadowBlur = 16;
        ctx.shadowColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.8)`;
        ctx.strokeStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.5)`;
        ctx.lineWidth = lineWidth + 3;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.beginPath();
        ctx.moveTo(points[0][0], points[0][1]);
        for (let i = 1; i < points.length; i++) {
          ctx.lineTo(points[i][0], points[i][1]);
        }
        ctx.stroke();
        ctx.restore();

        // Core line
        ctx.save();
        ctx.shadowBlur = 6;
        ctx.shadowColor = color;
        ctx.strokeStyle = color;
        ctx.lineWidth = lineWidth;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.beginPath();
        ctx.moveTo(points[0][0], points[0][1]);
        for (let i = 1; i < points.length; i++) {
          ctx.lineTo(points[i][0], points[i][1]);
        }
        ctx.stroke();
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
        const spacing = 40;
        for (let x = 0; x < w; x += spacing) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, h);
          ctx.stroke();
        }
        for (let y = 0; y < h; y += spacing) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(w, y);
          ctx.stroke();
        }
        // Axes
        ctx.strokeStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.12)`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(w / 2, 0);
        ctx.lineTo(w / 2, h);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, h / 2);
        ctx.lineTo(w, h / 2);
        ctx.stroke();
        ctx.restore();
      },
      []
    );

    const renderFrame = useCallback(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const w = canvas.width;
      const h = canvas.height;
      const eq = equationRef.current;
      const t = themeRef.current;

      // Clear with dark background
      ctx.clearRect(0, 0, w, h);
      const bgRgb = hexToRgb(t.colors.canvasBg) ?? { r: 3, g: 3, b: 8 };
      ctx.fillStyle = `rgb(${bgRgb.r}, ${bgRgb.g}, ${bgRgb.b})`;
      ctx.fillRect(0, 0, w, h);

      // Radial glow center
      const gradient = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, Math.min(w, h) * 0.5);
      const primaryRgb = hexToRgb(t.colors.primary) ?? { r: 0, g: 255, b: 255 };
      gradient.addColorStop(0, `rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, 0.06)`);
      gradient.addColorStop(1, "transparent");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, w, h);

      drawGrid(ctx, w, h, t.colors.primary);

      if (!eq) {
        // Idle placeholder
        ctx.save();
        ctx.font = "bold 18px 'JetBrains Mono', monospace";
        ctx.fillStyle = `rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, 0.3)`;
        ctx.textAlign = "center";
        ctx.fillText("Type a keyword to begin...", w / 2, h / 2 - 10);
        ctx.font = "14px 'JetBrains Mono', monospace";
        ctx.fillStyle = `rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, 0.15)`;
        ctx.fillText("rose · heart · spiral · galaxy · wave", w / 2, h / 2 + 20);
        ctx.restore();
        return;
      }

      if (eq.renderType === "cartesian") {
        // Animated sine wave — runs continuously
        waveOffsetRef.current += 0.03;
        const wavePoints: [number, number][] = [];
        const cx = w / 2;
        const cy = h / 2;
        const { A, B, C } = eq.params;
        for (let px = 0; px <= w; px += 2) {
          const x = px - cx;
          const y = A * Math.sin(B * x + C * waveOffsetRef.current);
          wavePoints.push([px, cy + y]);
        }
        // Harmonic overlay
        const wave2: [number, number][] = [];
        for (let px = 0; px <= w; px += 2) {
          const x = px - cx;
          const y = (A * 0.4) * Math.sin(B * 2.1 * x + C * waveOffsetRef.current * 1.3 + 1);
          wave2.push([px, cy + y]);
        }
        const secondRgb = hexToRgb(eq.color) ?? { r: 0, g: 255, b: 136 };
        drawGlowLine(ctx, wave2, `rgba(${secondRgb.r}, ${secondRgb.g}, ${secondRgb.b}, 0.5)`, eq.color, 1.5);
        drawGlowLine(ctx, wavePoints, eq.color, eq.color, 2.5);
      } else {
        // Progressive drawing for polar/parametric
        const SPEED = 6;
        if (isAnimating && progressRef.current < pointsRef.current.length) {
          progressRef.current = Math.min(
            progressRef.current + SPEED,
            pointsRef.current.length
          );
        }

        if (progressRef.current >= pointsRef.current.length && !completedRef.current) {
          completedRef.current = true;
          onAnimationComplete?.();
        }

        const visible = pointsRef.current.slice(0, Math.floor(progressRef.current));
        if (visible.length > 1) {
          drawGlowLine(ctx, visible, eq.color, eq.color, 2);
        }

        // Draw trailing dot at front
        if (visible.length > 0 && progressRef.current < pointsRef.current.length) {
          const [tx, ty] = visible[visible.length - 1];
          const dotRgb = hexToRgb(eq.color) ?? { r: 255, g: 255, b: 255 };
          ctx.save();
          ctx.shadowBlur = 20;
          ctx.shadowColor = eq.color;
          ctx.fillStyle = `rgba(${dotRgb.r}, ${dotRgb.g}, ${dotRgb.b}, 0.9)`;
          ctx.beginPath();
          ctx.arc(tx, ty, 4, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      }
    }, [drawGlowLine, drawGrid, isAnimating, onAnimationComplete]);

    // Recompute points when equation changes
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
        pointsRef.current = computePoints(equation, canvas.width, canvas.height);
      }
    }, [equation]);

    // Animation loop
    useEffect(() => {
      let running = true;

      const loop = () => {
        if (!running) return;
        renderFrame();
        animFrameRef.current = requestAnimationFrame(loop);
      };

      animFrameRef.current = requestAnimationFrame(loop);
      return () => {
        running = false;
        cancelAnimationFrame(animFrameRef.current);
      };
    }, [renderFrame]);

    // Resize handler
    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const resize = () => {
        const parent = canvas.parentElement;
        if (!parent) return;
        const dpr = window.devicePixelRatio ?? 1;
        const w = parent.clientWidth;
        const h = parent.clientHeight;
        canvas.width = w * dpr;
        canvas.height = h * dpr;
        canvas.style.width = `${w}px`;
        canvas.style.height = `${h}px`;
        const ctx = canvas.getContext("2d");
        if (ctx) ctx.scale(dpr, dpr);
        // Recompute points after resize
        if (equationRef.current && equationRef.current.renderType !== "cartesian") {
          pointsRef.current = computePoints(equationRef.current, w, h);
        }
      };

      resize();
      const ro = new ResizeObserver(resize);
      ro.observe(canvas.parentElement!);
      return () => ro.disconnect();
    }, []);

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

    return (
      <canvas
        ref={canvasRef}
        className="w-full h-full block"
        style={{ display: "block" }}
      />
    );
  }
);

export default GraphCanvas;
