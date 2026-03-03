"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp, TrendingDown } from "lucide-react";
import { AnimatedNumber } from "@/components/common/animated-number";
import { PercentageBadge } from "@/components/common/percentage-badge";
import { CardSkeleton } from "@/components/common/loading-skeleton";
import type { MarketAsset, AssetType } from "@fintelligence/shared";

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

const MOCK_ASSETS: MarketAsset[] = [
  {
    id: "1",
    symbol: "BTC",
    name: "Bitcoin",
    type: "CRYPTO" as AssetType,
    price: 94521.34,
    quoteCurrency: "USD",
    change24h: 1834.12,
    changePercent24h: 1.98,
    volume24h: 38_400_000_000,
    marketCap: 1_850_000_000_000,
    sparkline7d: {
      timestamps: Array.from({ length: 24 }, (_, i) => Date.now() - (23 - i) * 3600000),
      values: [91200, 91800, 92100, 91500, 92400, 93100, 92800, 93400, 93900, 93200, 93800, 94100, 93600, 94200, 94800, 94500, 93900, 94300, 94700, 95100, 94800, 94600, 94900, 94521],
    },
    updatedAt: new Date().toISOString(),
  },
  {
    id: "2",
    symbol: "ETH",
    name: "Ethereum",
    type: "CRYPTO" as AssetType,
    price: 3412.87,
    quoteCurrency: "USD",
    change24h: -45.21,
    changePercent24h: -1.31,
    volume24h: 18_200_000_000,
    marketCap: 410_000_000_000,
    sparkline7d: {
      timestamps: Array.from({ length: 24 }, (_, i) => Date.now() - (23 - i) * 3600000),
      values: [3480, 3460, 3440, 3470, 3450, 3430, 3410, 3440, 3420, 3400, 3430, 3450, 3420, 3400, 3380, 3410, 3430, 3400, 3390, 3420, 3400, 3410, 3420, 3413],
    },
    updatedAt: new Date().toISOString(),
  },
  {
    id: "3",
    symbol: "XAU",
    name: "Gold",
    type: "COMMODITY" as AssetType,
    price: 2934.5,
    quoteCurrency: "USD",
    change24h: 12.3,
    changePercent24h: 0.42,
    volume24h: null,
    marketCap: null,
    sparkline7d: {
      timestamps: Array.from({ length: 24 }, (_, i) => Date.now() - (23 - i) * 3600000),
      values: [2920, 2922, 2918, 2925, 2930, 2928, 2932, 2935, 2930, 2928, 2933, 2936, 2932, 2930, 2934, 2938, 2935, 2932, 2930, 2933, 2936, 2934, 2932, 2935],
    },
    updatedAt: new Date().toISOString(),
  },
  {
    id: "4",
    symbol: "WTI",
    name: "Crude Oil",
    type: "COMMODITY" as AssetType,
    price: 72.84,
    quoteCurrency: "USD",
    change24h: -1.23,
    changePercent24h: -1.66,
    volume24h: null,
    marketCap: null,
    sparkline7d: {
      timestamps: Array.from({ length: 24 }, (_, i) => Date.now() - (23 - i) * 3600000),
      values: [74.1, 73.8, 73.5, 73.9, 73.6, 73.2, 73.0, 73.4, 73.1, 72.8, 73.2, 73.5, 73.1, 72.9, 72.6, 73.0, 72.7, 72.4, 72.8, 73.1, 72.7, 72.5, 72.9, 72.84],
    },
    updatedAt: new Date().toISOString(),
  },
  {
    id: "5",
    symbol: "SPX",
    name: "S&P 500",
    type: "INDEX" as AssetType,
    price: 5987.32,
    quoteCurrency: "USD",
    change24h: 34.56,
    changePercent24h: 0.58,
    volume24h: null,
    marketCap: null,
    sparkline7d: {
      timestamps: Array.from({ length: 24 }, (_, i) => Date.now() - (23 - i) * 3600000),
      values: [5950, 5955, 5960, 5952, 5958, 5965, 5970, 5963, 5968, 5975, 5980, 5972, 5978, 5985, 5980, 5975, 5982, 5988, 5983, 5978, 5985, 5990, 5985, 5987],
    },
    updatedAt: new Date().toISOString(),
  },
  {
    id: "6",
    symbol: "DAX",
    name: "DAX 40",
    type: "INDEX" as AssetType,
    price: 22145.67,
    quoteCurrency: "EUR",
    change24h: -87.34,
    changePercent24h: -0.39,
    volume24h: null,
    marketCap: null,
    sparkline7d: {
      timestamps: Array.from({ length: 24 }, (_, i) => Date.now() - (23 - i) * 3600000),
      values: [22230, 22210, 22190, 22220, 22200, 22180, 22160, 22190, 22170, 22150, 22180, 22200, 22170, 22150, 22130, 22160, 22140, 22120, 22150, 22170, 22140, 22130, 22150, 22146],
    },
    updatedAt: new Date().toISOString(),
  },
  {
    id: "7",
    symbol: "EUR/USD",
    name: "Euro / Dollar",
    type: "FOREX" as AssetType,
    price: 1.0842,
    quoteCurrency: "USD",
    change24h: 0.0023,
    changePercent24h: 0.21,
    volume24h: null,
    marketCap: null,
    sparkline7d: {
      timestamps: Array.from({ length: 24 }, (_, i) => Date.now() - (23 - i) * 3600000),
      values: [1.082, 1.0825, 1.083, 1.0822, 1.0828, 1.0835, 1.0832, 1.0838, 1.0835, 1.0830, 1.0836, 1.0840, 1.0835, 1.0832, 1.0838, 1.0842, 1.0838, 1.0835, 1.084, 1.0845, 1.084, 1.0838, 1.0842, 1.0842],
    },
    updatedAt: new Date().toISOString(),
  },
];

const SYMBOL_ICONS: Record<string, string> = {
  BTC: "\u20BF",
  ETH: "\u039E",
  XAU: "\uD83E\uDD47",
  WTI: "\uD83D\uDEE2\uFE0F",
  SPX: "\uD83D\uDCC8",
  DAX: "\uD83C\uDDE9\uD83C\uDDEA",
  "EUR/USD": "\uD83D\uDCB1",
};

// ---------------------------------------------------------------------------
// Components
// ---------------------------------------------------------------------------

interface SparklineProps {
  data: number[];
  positive: boolean;
}

function MiniSparkline({ data, positive }: SparklineProps) {
  const chartData = useMemo(
    () => data.map((v, i) => ({ idx: i, value: v })),
    [data]
  );

  return (
    <div className="h-10 w-20">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <Line
            type="monotone"
            dataKey="value"
            stroke={positive ? "#00FF88" : "#FF4444"}
            strokeWidth={1.5}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

interface MarketCardProps {
  asset: MarketAsset;
  index: number;
}

function MarketCard({ asset, index }: MarketCardProps) {
  const isPositive = asset.changePercent24h >= 0;
  const symbolIcon = SYMBOL_ICONS[asset.symbol] || asset.symbol.charAt(0);
  const prefix = asset.type === "FOREX" ? "" : "$";
  const decimals = asset.type === "FOREX" ? 4 : asset.price < 10 ? 4 : 2;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
      className="group relative overflow-hidden rounded-xl border border-white/[0.08] bg-[#0F1629]/60 p-4 backdrop-blur-xl transition-all duration-300 hover:border-white/[0.15] hover:bg-[#0F1629]/80 hover:shadow-lg hover:shadow-cyan-500/5"
    >
      {/* Subtle gradient overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: `radial-gradient(circle at 50% 0%, ${
            isPositive ? "rgba(0,255,136,0.04)" : "rgba(255,68,68,0.04)"
          }, transparent 70%)`,
        }}
      />

      <div className="relative flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/[0.06] text-lg">
            {symbolIcon}
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-200">{asset.symbol}</p>
            <p className="text-[10px] text-slate-500">{asset.name}</p>
          </div>
        </div>
        <MiniSparkline data={asset.sparkline7d.values} positive={isPositive} />
      </div>

      <div className="relative mt-3 flex items-end justify-between">
        <AnimatedNumber
          value={asset.price}
          decimals={decimals}
          prefix={prefix}
          className="text-lg font-bold text-slate-100"
        />
        <PercentageBadge value={asset.changePercent24h} size="sm" />
      </div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

interface MarketOverviewProps {
  assets?: MarketAsset[];
  isLoading?: boolean;
}

export function MarketOverview({
  assets = MOCK_ASSETS,
  isLoading = false,
}: MarketOverviewProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 7 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {assets.map((asset, i) => (
        <MarketCard key={asset.id} asset={asset} index={i} />
      ))}
    </div>
  );
}
