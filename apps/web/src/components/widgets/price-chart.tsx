"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
} from "recharts";
import { cn } from "@fintelligence/ui/lib/utils";
import { ChartSkeleton } from "@/components/common/loading-skeleton";
import type { OHLCV } from "@fintelligence/shared";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type TimeRange = "1H" | "24H" | "7D" | "30D" | "1Y";

interface PriceDataPoint {
  time: number;
  price: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  label: string;
}

// ---------------------------------------------------------------------------
// Mock data generator
// ---------------------------------------------------------------------------

function generateMockData(range: TimeRange): PriceDataPoint[] {
  const now = Date.now();
  const configs: Record<TimeRange, { count: number; interval: number }> = {
    "1H": { count: 60, interval: 60 * 1000 },
    "24H": { count: 96, interval: 15 * 60 * 1000 },
    "7D": { count: 168, interval: 60 * 60 * 1000 },
    "30D": { count: 120, interval: 6 * 60 * 60 * 1000 },
    "1Y": { count: 365, interval: 24 * 60 * 60 * 1000 },
  };

  const { count, interval } = configs[range];
  let basePrice = 94000;
  const points: PriceDataPoint[] = [];

  for (let i = 0; i < count; i++) {
    const time = now - (count - i) * interval;
    const volatility = basePrice * 0.005;
    const change = (Math.random() - 0.48) * volatility;
    const open = basePrice;
    const close = basePrice + change;
    const high = Math.max(open, close) + Math.random() * volatility * 0.5;
    const low = Math.min(open, close) - Math.random() * volatility * 0.5;
    const volume = Math.floor(Math.random() * 5000 + 1000) * 1000000;

    const date = new Date(time);
    let label: string;
    if (range === "1H" || range === "24H") {
      label = date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
    } else if (range === "7D") {
      label = date.toLocaleDateString("en-US", { weekday: "short", hour: "2-digit" });
    } else {
      label = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    }

    points.push({
      time,
      price: close,
      open,
      high,
      low,
      close,
      volume,
      label,
    });

    basePrice = close;
  }

  return points;
}

// ---------------------------------------------------------------------------
// Custom tooltip
// ---------------------------------------------------------------------------

interface TooltipPayload {
  payload: PriceDataPoint;
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  const data = payload[0].payload;

  return (
    <div className="rounded-lg border border-white/[0.08] bg-[#0A0E1A]/95 px-3 py-2 shadow-xl backdrop-blur-xl">
      <p className="text-[10px] text-slate-500">{data.label}</p>
      <p className="text-sm font-bold text-slate-100">
        ${data.price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </p>
      <div className="mt-1 grid grid-cols-2 gap-x-4 gap-y-0.5 text-[10px]">
        <span className="text-slate-500">O: <span className="text-slate-300">${data.open.toFixed(2)}</span></span>
        <span className="text-slate-500">H: <span className="text-[#00FF88]">${data.high.toFixed(2)}</span></span>
        <span className="text-slate-500">C: <span className="text-slate-300">${data.close.toFixed(2)}</span></span>
        <span className="text-slate-500">L: <span className="text-[#FF4444]">${data.low.toFixed(2)}</span></span>
      </div>
      <p className="mt-1 text-[10px] text-slate-500">
        Vol: <span className="text-slate-300">${(data.volume / 1_000_000).toFixed(1)}M</span>
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

interface PriceChartProps {
  symbol?: string;
  name?: string;
  ohlcvData?: OHLCV[];
  isLoading?: boolean;
}

export function PriceChart({
  symbol = "BTC",
  name = "Bitcoin",
  isLoading = false,
}: PriceChartProps) {
  const [activeRange, setActiveRange] = useState<TimeRange>("24H");
  const ranges: TimeRange[] = ["1H", "24H", "7D", "30D", "1Y"];

  const data = useMemo(() => generateMockData(activeRange), [activeRange]);

  const priceChange = data.length >= 2 ? data[data.length - 1].price - data[0].price : 0;
  const isPositive = priceChange >= 0;
  const gradientColor = isPositive ? "#00FF88" : "#FF4444";

  // Compute Y domain with some padding
  const prices = data.map((d) => d.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const padding = (maxPrice - minPrice) * 0.1;

  if (isLoading) {
    return <ChartSkeleton />;
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-slate-500">{name}</p>
          <p className="text-2xl font-bold tabular-nums text-slate-100">
            ${data[data.length - 1]?.price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>

        {/* Time range selector */}
        <div className="flex items-center gap-1 rounded-lg bg-white/[0.04] p-1">
          {ranges.map((range) => (
            <button
              key={range}
              onClick={() => setActiveRange(range)}
              className={cn(
                "relative rounded-md px-3 py-1.5 text-xs font-medium transition-colors duration-200",
                activeRange === range
                  ? "text-white"
                  : "text-slate-500 hover:text-slate-300"
              )}
            >
              {activeRange === range && (
                <motion.div
                  layoutId="price-chart-range"
                  className="absolute inset-0 rounded-md bg-white/10"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                />
              )}
              <span className="relative z-10">{range}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Price area chart */}
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 5, bottom: 0, left: 5 }}>
            <defs>
              <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={gradientColor} stopOpacity={0.2} />
                <stop offset="100%" stopColor={gradientColor} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.04)"
              vertical={false}
            />
            <XAxis
              dataKey="label"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#64748b", fontSize: 10 }}
              interval="preserveStartEnd"
              minTickGap={50}
            />
            <YAxis
              domain={[minPrice - padding, maxPrice + padding]}
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#64748b", fontSize: 10 }}
              tickFormatter={(v: number) => `$${(v / 1000).toFixed(1)}k`}
              width={55}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{
                stroke: "rgba(255,255,255,0.1)",
                strokeDasharray: "4 4",
              }}
            />
            <Area
              type="monotone"
              dataKey="price"
              stroke={gradientColor}
              strokeWidth={2}
              fill="url(#priceGradient)"
              dot={false}
              activeDot={{
                r: 4,
                fill: gradientColor,
                stroke: "#0A0E1A",
                strokeWidth: 2,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Volume bars */}
      <div className="h-16">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 0, right: 5, bottom: 0, left: 5 }}>
            <XAxis dataKey="label" hide />
            <YAxis hide />
            <Bar
              dataKey="volume"
              fill="rgba(0,212,255,0.15)"
              radius={[2, 2, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
