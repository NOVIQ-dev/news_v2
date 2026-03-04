"use client";

import { ArrowDown, ArrowUp, Minus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface PercentageBadgeProps {
  value: number;
  className?: string;
  showIcon?: boolean;
  size?: "sm" | "md" | "lg";
}

export function PercentageBadge({
  value,
  className,
  showIcon = true,
  size = "md",
}: PercentageBadgeProps) {
  const isPositive = value > 0;
  const isNegative = value < 0;
  const isNeutral = value === 0;

  const sizeClasses = {
    sm: "text-xs px-1.5 py-0.5 gap-0.5",
    md: "text-sm px-2 py-1 gap-1",
    lg: "text-base px-3 py-1.5 gap-1.5",
  };

  const iconSizes = {
    sm: "h-3 w-3",
    md: "h-3.5 w-3.5",
    lg: "h-4 w-4",
  };

  const Icon = isPositive ? ArrowUp : isNegative ? ArrowDown : Minus;

  return (
    <AnimatePresence mode="wait">
      <motion.span
        key={value}
        initial={{ opacity: 0, y: isPositive ? 4 : -4 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: isPositive ? -4 : 4 }}
        transition={{ duration: 0.2 }}
        className={cn(
          "inline-flex items-center rounded-md font-medium tabular-nums",
          sizeClasses[size],
          isPositive && "bg-[#00FF88]/10 text-[#00FF88]",
          isNegative && "bg-[#FF4444]/10 text-[#FF4444]",
          isNeutral && "bg-white/5 text-slate-400",
          className
        )}
      >
        {showIcon && <Icon className={iconSizes[size]} />}
        {isPositive && "+"}
        {value.toFixed(2)}%
      </motion.span>
    </AnimatePresence>
  );
}
