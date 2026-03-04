"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Sun, Moon } from "lucide-react";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

interface ThemeToggleProps {
  defaultTheme?: "dark" | "light";
  onThemeChange?: (theme: "dark" | "light") => void;
}

export function ThemeToggle({
  defaultTheme = "dark",
  onThemeChange,
}: ThemeToggleProps) {
  const [theme, setTheme] = useState<"dark" | "light">(defaultTheme);
  const isDark = theme === "dark";

  const toggle = useCallback(() => {
    const next = isDark ? "light" : "dark";
    setTheme(next);
    onThemeChange?.(next);

    // Persist preference
    if (typeof document !== "undefined") {
      document.cookie = `theme=${next}; path=/; max-age=31536000; SameSite=Lax`;
    }
  }, [isDark, onThemeChange]);

  return (
    <button
      onClick={toggle}
      className={cn(
        "relative flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.08] transition-colors duration-200",
        "bg-white/[0.03] hover:bg-white/[0.06]"
      )}
      title={`Switch to ${isDark ? "light" : "dark"} mode`}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
    >
      <motion.div
        initial={false}
        animate={{
          rotate: isDark ? 0 : 180,
          scale: isDark ? 1 : 0,
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="absolute"
      >
        <Moon className="h-4 w-4 text-slate-300" />
      </motion.div>

      <motion.div
        initial={false}
        animate={{
          rotate: isDark ? -180 : 0,
          scale: isDark ? 0 : 1,
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="absolute"
      >
        <Sun className="h-4 w-4 text-amber-400" />
      </motion.div>
    </button>
  );
}
