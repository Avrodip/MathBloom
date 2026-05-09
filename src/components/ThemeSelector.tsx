"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Palette, ChevronDown } from "lucide-react";
import { THEMES, Theme } from "@/lib/themes";
import { hexToRgb } from "@/lib/utils";

interface ThemeSelectorProps {
  currentTheme: Theme;
  onThemeChange: (theme: Theme) => void;
}

export default function ThemeSelector({
  currentTheme,
  onThemeChange,
}: ThemeSelectorProps) {
  const [open, setOpen] = useState(false);
  const rgb = hexToRgb(currentTheme.colors.primary) ?? { r: 0, g: 255, b: 255 };

  return (
    <div className="relative">
      <motion.button
        onClick={() => setOpen((v) => !v)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all"
        style={{
          color: currentTheme.colors.primary,
          borderColor: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.3)`,
          background: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.08)`,
        }}
      >
        <Palette size={15} />
        <span>{currentTheme.emoji} {currentTheme.name}</span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown size={14} />
        </motion.span>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.18 }}
            className="absolute top-full mt-2 right-0 z-50 min-w-[200px] rounded-xl border overflow-hidden"
            style={{
              background: `rgba(5, 5, 20, 0.95)`,
              backdropFilter: "blur(20px)",
              borderColor: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.2)`,
              boxShadow: `0 20px 60px rgba(0,0,0,0.5), 0 0 40px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.1)`,
            }}
          >
            {Object.values(THEMES).map((theme) => {
              const tRgb = hexToRgb(theme.colors.primary) ?? { r: 0, g: 255, b: 255 };
              const isActive = theme.id === currentTheme.id;

              return (
                <motion.button
                  key={theme.id}
                  onClick={() => {
                    onThemeChange(theme);
                    setOpen(false);
                  }}
                  whileHover={{ x: 4 }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors"
                  style={{
                    background: isActive
                      ? `rgba(${tRgb.r}, ${tRgb.g}, ${tRgb.b}, 0.12)`
                      : "transparent",
                  }}
                >
                  {/* Color swatch */}
                  <div className="flex gap-1">
                    {[theme.colors.primary, theme.colors.secondary, theme.colors.accent].map(
                      (c, i) => (
                        <div
                          key={i}
                          className="w-3 h-3 rounded-full"
                          style={{
                            background: c,
                            boxShadow: `0 0 6px ${c}`,
                          }}
                        />
                      )
                    )}
                  </div>

                  <div className="flex-1">
                    <div
                      className="text-sm font-semibold"
                      style={{
                        color: isActive ? theme.colors.primary : "rgba(255,255,255,0.8)",
                      }}
                    >
                      {theme.emoji} {theme.name}
                    </div>
                    <div className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>
                      {theme.description}
                    </div>
                  </div>

                  {isActive && (
                    <div
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ background: theme.colors.primary }}
                    />
                  )}
                </motion.button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
