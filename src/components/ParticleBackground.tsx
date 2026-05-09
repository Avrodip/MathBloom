"use client";

import { useEffect, useState } from "react";
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

  if (!engineReady) return null;

  const rgb = hexToRgb(theme.colors.particleColor) ?? { r: 0, g: 255, b: 255 };

  return (
    <Particles
      id="tsparticles"
      className="fixed inset-0 pointer-events-none z-0"
      options={{
        background: { color: { value: "transparent" } },
        fpsLimit: 40, // Reduced from 60
        interactivity: {
          events: {
            onHover: { enable: true, mode: "repulse" },
          },
          modes: { repulse: { distance: 80, duration: 0.3 } },
        },
        particles: {
          color: { value: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})` },
          links: { enable: false }, // Disabled — big perf win
          move: {
            enable: true,
            speed: 0.4,
            direction: "none" as const,
            random: true,
            straight: false,
            outModes: { default: "bounce" as const },
          },
          number: { value: 28, density: { enable: true, width: 1400, height: 1400 } },
          opacity: { value: { min: 0.05, max: 0.35 } },
          shape: { type: "circle" },
          size: { value: { min: 1, max: 2 } },
        },
        detectRetina: false, // Disabled for perf
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any}
    />
  );
}
