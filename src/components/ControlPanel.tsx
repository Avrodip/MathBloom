"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Shuffle,
  Download,
  RotateCcw,
  Sparkles,
  Info,
} from "lucide-react";
import { EquationConfig, findEquationByKeyword } from "@/lib/equations";
import { Theme } from "@/lib/themes";
import { hexToRgb, getCurveStats, debounce } from "@/lib/utils";

interface ControlPanelProps {
  theme: Theme;
  equation: EquationConfig | null;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onRandomize: () => void;
  onExport: () => void;
  onRestart: () => void;
}

export default function ControlPanel({
  theme,
  equation,
  searchQuery,
  onSearchChange,
  onRandomize,
  onExport,
  onRestart,
}: ControlPanelProps) {
  const [inputValue, setInputValue] = useState(searchQuery);
  const [isFocused, setIsFocused] = useState(false);
  const [suggestion, setSuggestion] = useState<EquationConfig | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const rgb = hexToRgb(theme.colors.primary) ?? { r: 0, g: 255, b: 255 };

  const debouncedSearch = useRef(
    debounce((q: string) => {
      onSearchChange(q);
    }, 300)
  ).current;

  useEffect(() => {
    setInputValue(searchQuery);
  }, [searchQuery]);

  const handleInput = (val: string) => {
    setInputValue(val);
    const found = findEquationByKeyword(val);
    setSuggestion(found);
    debouncedSearch(val);
  };

  const stats = equation ? getCurveStats(equation.id) : null;

  const keywords = [
    "rose", "heart", "butterfly", "spiral", "galaxy", "wave", "lissajous",
  ];

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Search box */}
      <motion.div
        animate={{
          boxShadow: isFocused
            ? `0 0 0 1px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.6), 0 0 30px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.2)`
            : `0 0 0 1px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.15)`,
        }}
        className="relative rounded-xl overflow-hidden"
        style={{ background: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.04)` }}
      >
        <div className="flex items-center px-4 py-3 gap-3">
          <Search
            size={18}
            style={{ color: isFocused ? theme.colors.primary : theme.colors.textMuted }}
          />
          <input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => handleInput(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onKeyDown={(e) => {
              if (e.key === "Enter") onSearchChange(inputValue);
              if (e.key === "Escape") {
                setInputValue("");
                onSearchChange("");
                setSuggestion(null);
              }
            }}
            placeholder="Type: rose, heart, spiral..."
            className="flex-1 bg-transparent outline-none text-sm font-mono placeholder:opacity-40"
            style={{
              color: theme.colors.text,
              caretColor: theme.colors.primary,
            }}
          />
          {inputValue && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={() => { setInputValue(""); onSearchChange(""); setSuggestion(null); }}
              className="text-xs opacity-40 hover:opacity-70 transition-opacity"
              style={{ color: theme.colors.text }}
            >
              ✕
            </motion.button>
          )}
        </div>

        {/* Suggestion pill */}
        <AnimatePresence>
          {suggestion && inputValue && suggestion.id !== equation?.id && (
            <motion.button
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              onClick={() => { setInputValue(suggestion.name); onSearchChange(suggestion.name); }}
              className="w-full px-4 py-2 text-left text-xs font-mono border-t flex items-center gap-2"
              style={{
                borderColor: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.1)`,
                color: theme.colors.primary,
                background: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.05)`,
              }}
            >
              <Sparkles size={11} />
              Match: {suggestion.emoji} {suggestion.name}
            </motion.button>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Keyword chips */}
      <div className="flex flex-wrap gap-2">
        {keywords.map((kw) => (
          <motion.button
            key={kw}
            onClick={() => { setInputValue(kw); onSearchChange(kw); }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-3 py-1 rounded-full text-xs font-mono border transition-all"
            style={{
              borderColor:
                equation?.keywords.includes(kw)
                  ? theme.colors.primary
                  : `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.15)`,
              color:
                equation?.keywords.includes(kw)
                  ? theme.colors.primary
                  : theme.colors.textMuted,
              background:
                equation?.keywords.includes(kw)
                  ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.1)`
                  : "transparent",
            }}
          >
            {kw}
          </motion.button>
        ))}
      </div>

      {/* Action buttons */}
      <div className="grid grid-cols-3 gap-2">
        <ActionButton
          icon={<Shuffle size={15} />}
          label="Random"
          onClick={onRandomize}
          accent={theme.colors.secondary}
        />
        <ActionButton
          icon={<RotateCcw size={15} />}
          label="Replay"
          onClick={onRestart}
          accent={theme.colors.primary}
        />
        <ActionButton
          icon={<Download size={15} />}
          label="Export"
          onClick={onExport}
          accent={theme.colors.accent}
        />
      </div>

      {/* Equation info card */}
      <AnimatePresence mode="wait">
        {equation && stats && (
          <motion.div
            key={equation.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="rounded-xl p-4 border"
            style={{
              background: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.04)`,
              borderColor: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.12)`,
            }}
          >
            <div className="flex items-start gap-3 mb-3">
              <span className="text-2xl">{equation.emoji}</span>
              <div>
                <h3
                  className="font-bold text-sm"
                  style={{ color: theme.colors.primary }}
                >
                  {equation.name}
                </h3>
                <p className="text-xs leading-relaxed mt-0.5" style={{ color: theme.colors.textMuted }}>
                  {equation.description}
                </p>
              </div>
            </div>

            <div
              className="font-mono text-xs px-3 py-2 rounded-lg mb-3"
              style={{
                background: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.06)`,
                color: theme.colors.primary,
                borderLeft: `2px solid ${theme.colors.primary}`,
              }}
            >
              {equation.formula}
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              {[
                { label: "Type", value: stats.type },
                { label: "Domain", value: stats.domain },
                { label: "Complexity", value: stats.complexity },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  className="rounded-lg p-2"
                  style={{ background: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.05)` }}
                >
                  <div className="text-xs font-semibold" style={{ color: theme.colors.primary }}>
                    {value}
                  </div>
                  <div className="text-xs opacity-40" style={{ color: theme.colors.text }}>
                    {label}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {!equation && (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="rounded-xl p-4 border text-center"
            style={{
              borderColor: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.08)`,
              background: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.02)`,
            }}
          >
            <Info size={20} className="mx-auto mb-2 opacity-30" style={{ color: theme.colors.primary }} />
            <p className="text-xs font-mono" style={{ color: theme.colors.textMuted }}>
              Search a keyword or pick a preset to render a mathematical curve
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ActionButton({
  icon,
  label,
  onClick,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  accent: string;
}) {
  const rgb = hexToRgb(accent) ?? { r: 0, g: 255, b: 255 };
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.96 }}
      className="flex flex-col items-center gap-1.5 py-3 rounded-xl border text-xs font-medium transition-all"
      style={{
        color: accent,
        borderColor: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.25)`,
        background: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.06)`,
      }}
    >
      {icon}
      {label}
    </motion.button>
  );
}
