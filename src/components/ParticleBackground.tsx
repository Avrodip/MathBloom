"use client";

import { useCallback, useEffect, useState } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import type { Engine } from "@tsparticles/engine";
import { Theme } from "@/lib/themes";
import { hexToRgb } from "@/lib/utils";

interface ParticleBackgroundProps {
  theme: Theme;
}

export default function ParticleBackground({ theme }: ParticleBackgroundProps) {
  const [engineReady, setEngineReady] = useState(false);

  useEffect(() => {
    initParticlesEngine(async (engine: Engine) => {
      await loadSlim(engine);
    }).then(() => setEngineReady(true));
  }, []);

  const getOptions = useCallback(() => {
    const rgb = hexToRgb(theme.colors.particleColor) ?? { r: 0, g: 255, b: 255 };
    const rgb2 = hexToRgb(theme.colors.secondary) ?? { r: 255, g: 0, b: 255 };

    return {
      background: { color: { value: "transparent" } },
      fpsLimit: 60,
      interactivity: {
        events: {
          onHover: { enable: true, mode: "repulse" },
          onClick: { enable: true, mode: "push" },
        },
        modes: {
          repulse: { distance: 120, duration: 0.4 },
          push: { quantity: 3 },
        },
      },
      particles: {
        color: {
          value: [
            `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`,
            `rgb(${rgb2.r}, ${rgb2.g}, ${rgb2.b})`,
          ],
        },
        links: {
          enable: true,
          color: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.15)`,
          distance: 120,
          opacity: 0.15,
          width: 1,
        },
        move: {
          enable: true,
          speed: 0.6,
          direction: "none" as const,
          random: true,
          straight: false,
          outModes: { default: "bounce" as const },
        },
        number: {
          value: 55,
          density: { enable: true, width: 1200, height: 1200 },
        },
        opacity: {
          value: { min: 0.1, max: 0.5 },
          animation: { enable: true, speed: 0.5 },
        },
        shape: { type: "circle" },
        size: {
          value: { min: 1, max: 2.5 },
          animation: { enable: true, speed: 1 },
        },
        shadow: {
          enable: true,
          color: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`,
          blur: 6,
        },
      },
      detectRetina: true,
    };
  }, [theme]);

  if (!engineReady) return null;

  return (
    <Particles
      id="tsparticles"
      className="fixed inset-0 pointer-events-none z-0"
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      options={getOptions() as any}
    />
  );
}
