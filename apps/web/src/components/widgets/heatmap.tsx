"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { cn } from "@fintelligence/ui/lib/utils";
import type { HeatmapEntry, AssetType } from "@fintelligence/shared";

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

const MOCK_HEATMAP: HeatmapEntry[] = [
  { symbol: "BTC", name: "Bitcoin", type: "CRYPTO" as AssetType, changePercent: 1.98, weight: 1850, price: 94521 },
  { symbol: "ETH", name: "Ethereum", type: "CRYPTO" as AssetType, changePercent: -1.31, weight: 410, price: 3413 },
  { symbol: "SOL", name: "Solana", type: "CRYPTO" as AssetType, changePercent: 4.25, weight: 85, price: 198 },
  { symbol: "BNB", name: "Binance", type: "CRYPTO" as AssetType, changePercent: 0.82, weight: 95, price: 635 },
  { symbol: "XRP", name: "Ripple", type: "CRYPTO" as AssetType, changePercent: -2.14, weight: 72, price: 1.32 },
  { symbol: "ADA", name: "Cardano", type: "CRYPTO" as AssetType, changePercent: -0.45, weight: 35, price: 0.98 },
  { symbol: "DOGE", name: "Dogecoin", type: "CRYPTO" as AssetType, changePercent: 3.67, weight: 28, price: 0.19 },
  { symbol: "AVAX", name: "Avalanche", type: "CRYPTO" as AssetType, changePercent: -3.21, weight: 18, price: 45 },
  { symbol: "AAPL", name: "Apple", type: "INDEX" as AssetType, changePercent: 0.54, weight: 3200, price: 228 },
  { symbol: "MSFT", name: "Microsoft", type: "INDEX" as AssetType, changePercent: 1.23, weight: 3100, price: 425 },
  { symbol: "NVDA", name: "NVIDIA", type: "INDEX" as AssetType, changePercent: 2.87, weight: 2800, price: 890 },
  { symbol: "GOOG", name: "Alphabet", type: "INDEX" as AssetType, changePercent: -0.78, weight: 2100, price: 175 },
  { symbol: "AMZN", name: "Amazon", type: "INDEX" as AssetType, changePercent: 0.35, weight: 2000, price: 205 },
  { symbol: "TSLA", name: "Tesla", type: "INDEX" as AssetType, changePercent: -4.56, weight: 850, price: 265 },
  { symbol: "META", name: "Meta", type: "INDEX" as AssetType, changePercent: 1.67, weight: 1500, price: 590 },
  { symbol: "XAU", name: "Gold", type: "COMMODITY" as AssetType, changePercent: 0.42, weight: 400, price: 2935 },
  { symbol: "WTI", name: "Crude Oil", type: "COMMODITY" as AssetType, changePercent: -1.66, weight: 300, price: 73 },
  { symbol: "XAG", name: "Silver", type: "COMMODITY" as AssetType, changePercent: 1.12, weight: 150, price: 32.5 },
  { symbol: "EUR/USD", name: "EUR/USD", type: "FOREX" as AssetType, changePercent: 0.21, weight: 200, price: 1.084 },
  { symbol: "GBP/USD", name: "GBP/USD", type: "FOREX" as AssetType, changePercent: -0.35, weight: 180, price: 1.267 },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getHeatColor(percent: number): string {
  const clamped = Math.max(-5, Math.min(5, percent));
  const ratio = (clamped + 5) / 10; // 0 = deep red, 0.5 = neutral, 1 = deep green

  if (ratio < 0.5) {
    // Red range
    const intensity = (0.5 - ratio) / 0.5;
    const r = Math.round(255 * (0.3 + 0.7 * intensity));
    const g = Math.round(30 * (1 - intensity));
    const b = Math.round(30 * (1 - intensity));
    return `rgb(${r}, ${g}, ${b})`;
  } else {
    // Green range
    const intensity = (ratio - 0.5) / 0.5;
    const r = Math.round(30 * (1 - intensity));
    const g = Math.round(255 * (0.3 + 0.7 * intensity));
    const b = Math.round(60 * intensity);
    return `rgb(${r}, ${g}, ${b})`;
  }
}

function getCellSize(weight: number, maxWeight: number): number {
  const minSize = 1;
  const maxSize = 4;
  return minSize + (weight / maxWeight) * (maxSize - minSize);
}

// ---------------------------------------------------------------------------
// Components
// ---------------------------------------------------------------------------

interface HeatmapCellProps {
  entry: HeatmapEntry;
  relativeSize: number;
  index: number;
}

function HeatmapCell({ entry, relativeSize, index }: HeatmapCellProps) {
  const bgColor = getHeatColor(entry.changePercent);
  const isPositive = entry.changePercent >= 0;
  const isLarge = relativeSize > 2.5;

  return (
    <TooltipPrimitive.Provider delayDuration={200}>
      <TooltipPrimitive.Root>
        <TooltipPrimitive.Trigger asChild>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: index * 0.02 }}
            className="relative cursor-pointer overflow-hidden rounded-md transition-all duration-200 hover:brightness-125 hover:ring-1 hover:ring-white/20"
            style={{
              backgroundColor: bgColor,
              gridColumn: `span ${Math.round(relativeSize)}`,
              gridRow: `span ${Math.ceil(relativeSize / 2)}`,
              minHeight: isLarge ? "80px" : "56px",
            }}
          >
            <div className="flex h-full flex-col items-center justify-center p-2">
              <p
                className={cn(
                  "font-bold text-white/90",
                  isLarge ? "text-sm" : "text-xs"
                )}
              >
                {entry.symbol}
              </p>
              <p
                className={cn(
                  "font-semibold tabular-nums",
                  isPositive ? "text-white/90" : "text-white/80",
                  isLarge ? "text-xs" : "text-[10px]"
                )}
              >
                {isPositive ? "+" : ""}
                {entry.changePercent.toFixed(2)}%
              </p>
              {isLarge && (
                <p className="mt-0.5 text-[10px] text-white/60">{entry.name}</p>
              )}
            </div>
          </motion.div>
        </TooltipPrimitive.Trigger>
        <TooltipPrimitive.Content
          side="top"
          sideOffset={6}
          className="z-50 rounded-lg border border-white/[0.08] bg-[#0A0E1A]/95 px-3 py-2 shadow-xl backdrop-blur-xl"
        >
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-200">
                {entry.symbol}
              </span>
              <span className="text-xs text-slate-500">{entry.name}</span>
            </div>
            <div className="grid grid-cols-2 gap-x-4 text-xs">
              <span className="text-slate-500">Price</span>
              <span className="text-right text-slate-200">
                ${entry.price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className="text-slate-500">Change</span>
              <span
                className={cn(
                  "text-right font-medium tabular-nums",
                  isPositive ? "text-[#00FF88]" : "text-[#FF4444]"
                )}
              >
                {isPositive ? "+" : ""}
                {entry.changePercent.toFixed(2)}%
              </span>
              <span className="text-slate-500">Weight</span>
              <span className="text-right text-slate-200">
                {entry.weight >= 1000
                  ? `$${(entry.weight / 1000).toFixed(1)}T`
                  : `$${entry.weight}B`}
              </span>
            </div>
          </div>
          <TooltipPrimitive.Arrow className="fill-[#0A0E1A]/95" />
        </TooltipPrimitive.Content>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

type SizeBy = "marketCap" | "volume";

interface HeatmapProps {
  entries?: HeatmapEntry[];
  isLoading?: boolean;
}

export function Heatmap({
  entries = MOCK_HEATMAP,
  isLoading = false,
}: HeatmapProps) {
  const [sizeBy, setSizeBy] = useState<SizeBy>("marketCap");

  const maxWeight = useMemo(
    () => Math.max(...entries.map((e) => e.weight), 1),
    [entries]
  );

  if (isLoading) {
    return (
      <div className="grid grid-cols-6 gap-1.5">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="h-14 animate-pulse rounded-md bg-white/[0.04]"
          />
        ))}
      </div>
    );
  }

  // Sort entries by weight descending for better visual layout
  const sorted = [...entries].sort((a, b) => b.weight - a.weight);

  return (
    <div className="space-y-3">
      {/* Size toggle */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-slate-500">Size by:</span>
        <div className="flex gap-1 rounded-md bg-white/[0.04] p-0.5">
          {(["marketCap", "volume"] as SizeBy[]).map((option) => (
            <button
              key={option}
              onClick={() => setSizeBy(option)}
              className={cn(
                "rounded px-2 py-1 text-[10px] font-medium transition-colors duration-200",
                sizeBy === option
                  ? "bg-white/10 text-slate-200"
                  : "text-slate-500 hover:text-slate-300"
              )}
            >
              {option === "marketCap" ? "Market Cap" : "Volume"}
            </button>
          ))}
        </div>
      </div>

      {/* Heatmap grid */}
      <div className="grid auto-rows-auto grid-cols-6 gap-1.5">
        {sorted.map((entry, i) => (
          <HeatmapCell
            key={entry.symbol}
            entry={entry}
            relativeSize={getCellSize(entry.weight, maxWeight)}
            index={i}
          />
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-2 pt-1">
        <span className="text-[10px] text-slate-500">-5%</span>
        <div className="flex h-2 w-32 overflow-hidden rounded-full">
          <div className="flex-1" style={{ background: "linear-gradient(to right, #FF2020, #803030, #333333, #308030, #20FF60)" }} />
        </div>
        <span className="text-[10px] text-slate-500">+5%</span>
      </div>
    </div>
  );
}
