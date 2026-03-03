"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  LineChart,
  Line,
  Tooltip,
} from "recharts";
import { TrendingUp, TrendingDown } from "lucide-react";
import { AnimatedNumber } from "@/components/common/animated-number";
import { PercentageBadge } from "@/components/common/percentage-badge";
import { CardSkeleton } from "@/components/common/loading-skeleton";
import { cn } from "@fintelligence/ui/lib/utils";
import type { PortfolioSummary as PortfolioSummaryType, AssetType } from "@fintelligence/shared";

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

const MOCK_SUMMARY: PortfolioSummaryType = {
  totalValue: 284_567.89,
  totalCostBasis: 245_000,
  totalUnrealisedPnl: 39_567.89,
  totalUnrealisedPnlPercent: 16.15,
  totalRealisedPnl: 12_340.5,
  dailyChange: 3_421.45,
  dailyChangePercent: 1.22,
  currency: "USD",
  allocationByType: {
    CRYPTO: 45,
    INDEX: 30,
    COMMODITY: 15,
    FOREX: 10,
  } as Record<AssetType, number>,
  holdingsCount: 12,
  holdings: [
    {
      id: "h1",
      userId: "u1",
      symbol: "BTC",
      name: "Bitcoin",
      assetType: "CRYPTO" as AssetType,
      quantity: 1.5,
      averageEntryPrice: 62000,
      currentPrice: 94521,
      marketValue: 141781.5,
      unrealisedPnl: 48781.5,
      unrealisedPnlPercent: 52.42,
      allocationPercent: 49.8,
      currency: "USD",
      openedAt: new Date(Date.now() - 180 * 86400000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "h2",
      userId: "u1",
      symbol: "ETH",
      name: "Ethereum",
      assetType: "CRYPTO" as AssetType,
      quantity: 15,
      averageEntryPrice: 2800,
      currentPrice: 3413,
      marketValue: 51195,
      unrealisedPnl: 9195,
      unrealisedPnlPercent: 21.89,
      allocationPercent: 18.0,
      currency: "USD",
      openedAt: new Date(Date.now() - 120 * 86400000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "h3",
      userId: "u1",
      symbol: "SPX",
      name: "S&P 500 ETF",
      assetType: "INDEX" as AssetType,
      quantity: 50,
      averageEntryPrice: 575,
      currentPrice: 598,
      marketValue: 29900,
      unrealisedPnl: 1150,
      unrealisedPnlPercent: 4.0,
      allocationPercent: 10.5,
      currency: "USD",
      openedAt: new Date(Date.now() - 90 * 86400000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
  updatedAt: new Date().toISOString(),
};

const ALLOCATION_COLORS: Record<string, string> = {
  CRYPTO: "#00D4FF",
  INDEX: "#00FF88",
  COMMODITY: "#FFCC00",
  FOREX: "#FF8844",
};

const PERFORMANCE_SPARK = [
  { v: 260000 },
  { v: 262000 },
  { v: 258000 },
  { v: 265000 },
  { v: 268000 },
  { v: 266000 },
  { v: 270000 },
  { v: 273000 },
  { v: 269000 },
  { v: 275000 },
  { v: 278000 },
  { v: 274000 },
  { v: 280000 },
  { v: 282000 },
  { v: 284568 },
];

// ---------------------------------------------------------------------------
// Components
// ---------------------------------------------------------------------------

function AllocationChart({ data }: { data: Record<string, number> }) {
  const chartData = useMemo(
    () =>
      Object.entries(data).map(([type, value]) => ({
        name: type,
        value,
        color: ALLOCATION_COLORS[type] || "#666",
      })),
    [data]
  );

  return (
    <div className="relative h-32 w-32">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={38}
            outerRadius={55}
            paddingAngle={3}
            dataKey="value"
            strokeWidth={0}
          >
            {chartData.map((entry, i) => (
              <Cell key={i} fill={entry.color} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <p className="text-[10px] text-slate-500">Assets</p>
        <p className="text-sm font-bold text-slate-200">
          {Object.keys(data).length}
        </p>
      </div>
    </div>
  );
}

function PerformanceSparkline() {
  return (
    <div className="h-12 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={PERFORMANCE_SPARK}>
          <Line
            type="monotone"
            dataKey="v"
            stroke="#00D4FF"
            strokeWidth={1.5}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

interface PortfolioSummaryProps {
  summary?: PortfolioSummaryType;
  isLoading?: boolean;
}

export function PortfolioSummary({
  summary = MOCK_SUMMARY,
  isLoading = false,
}: PortfolioSummaryProps) {
  if (isLoading) {
    return <CardSkeleton />;
  }

  const isPositive = summary.dailyChangePercent >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-5"
    >
      {/* Total value */}
      <div>
        <p className="text-xs text-slate-500">Total Portfolio Value</p>
        <AnimatedNumber
          value={summary.totalValue}
          prefix="$"
          decimals={2}
          className="text-3xl font-bold text-slate-100"
        />
        <div className="mt-1 flex items-center gap-2">
          <PercentageBadge value={summary.dailyChangePercent} size="sm" />
          <span className={cn("text-xs tabular-nums", isPositive ? "text-[#00FF88]" : "text-[#FF4444]")}>
            {isPositive ? "+" : ""}${Math.abs(summary.dailyChange).toLocaleString("en-US", { minimumFractionDigits: 2 })} today
          </span>
        </div>
      </div>

      {/* P&L row */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-lg bg-white/[0.03] p-3">
          <p className="text-[10px] text-slate-500">Unrealised P&L</p>
          <p
            className={cn(
              "text-sm font-semibold tabular-nums",
              summary.totalUnrealisedPnl >= 0 ? "text-[#00FF88]" : "text-[#FF4444]"
            )}
          >
            {summary.totalUnrealisedPnl >= 0 ? "+" : ""}$
            {Math.abs(summary.totalUnrealisedPnl).toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </p>
          <p className="text-[10px] text-slate-500">
            {summary.totalUnrealisedPnlPercent >= 0 ? "+" : ""}
            {summary.totalUnrealisedPnlPercent.toFixed(2)}%
          </p>
        </div>
        <div className="rounded-lg bg-white/[0.03] p-3">
          <p className="text-[10px] text-slate-500">Realised P&L</p>
          <p
            className={cn(
              "text-sm font-semibold tabular-nums",
              summary.totalRealisedPnl >= 0 ? "text-[#00FF88]" : "text-[#FF4444]"
            )}
          >
            {summary.totalRealisedPnl >= 0 ? "+" : ""}$
            {Math.abs(summary.totalRealisedPnl).toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      {/* Allocation + top holdings */}
      <div className="flex items-start gap-4">
        <AllocationChart data={summary.allocationByType} />

        <div className="flex-1 space-y-2">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
            Top Holdings
          </p>
          {summary.holdings.slice(0, 3).map((holding, i) => (
            <motion.div
              key={holding.id}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }}
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <div
                  className="h-2 w-2 rounded-full"
                  style={{
                    backgroundColor:
                      ALLOCATION_COLORS[holding.assetType] || "#666",
                  }}
                />
                <span className="text-xs font-medium text-slate-300">
                  {holding.symbol}
                </span>
              </div>
              <div className="text-right">
                <p className="text-xs tabular-nums text-slate-200">
                  ${holding.marketValue.toLocaleString("en-US", { maximumFractionDigits: 0 })}
                </p>
                <p
                  className={cn(
                    "text-[10px] tabular-nums",
                    holding.unrealisedPnlPercent >= 0
                      ? "text-[#00FF88]"
                      : "text-[#FF4444]"
                  )}
                >
                  {holding.unrealisedPnlPercent >= 0 ? "+" : ""}
                  {holding.unrealisedPnlPercent.toFixed(1)}%
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Mini sparkline */}
      <div>
        <p className="mb-1 text-[10px] text-slate-500">30-Day Performance</p>
        <PerformanceSparkline />
      </div>
    </motion.div>
  );
}
