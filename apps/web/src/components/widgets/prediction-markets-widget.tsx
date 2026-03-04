"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { ArrowUpDown, Calendar, DollarSign, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { ListSkeleton } from "@/components/common/loading-skeleton";
import type { PredictionMarket } from "@fintelligence/shared";

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

const MOCK_PREDICTIONS: PredictionMarket[] = [
  {
    id: "p1",
    question: "Will the Fed cut rates in Q2 2026?",
    description: "Resolves YES if the Federal Reserve reduces the federal funds rate target between April-June 2026.",
    category: "economics",
    outcomes: [
      { id: "o1", label: "Yes", probability: 0.72, volume: 8500000 },
      { id: "o2", label: "No", probability: 0.28, volume: 3200000 },
    ],
    totalVolume: 11700000,
    participantCount: 14520,
    resolution: "unresolved",
    source: "Polymarket",
    sourceUrl: "https://polymarket.com",
    relatedAssets: ["SPX", "EUR/USD"],
    resolvesAt: new Date(Date.now() + 90 * 86400000).toISOString(),
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "p2",
    question: "Bitcoin above $100K by end of March 2026?",
    description: "Resolves YES if Bitcoin's price exceeds $100,000 USD at any point before April 1, 2026.",
    category: "crypto",
    outcomes: [
      { id: "o3", label: "Yes", probability: 0.58, volume: 15200000 },
      { id: "o4", label: "No", probability: 0.42, volume: 11000000 },
    ],
    totalVolume: 26200000,
    participantCount: 32100,
    resolution: "unresolved",
    source: "Polymarket",
    sourceUrl: "https://polymarket.com",
    relatedAssets: ["BTC"],
    resolvesAt: new Date("2026-04-01").toISOString(),
    createdAt: new Date(Date.now() - 60 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "p3",
    question: "EU imposes new Russia sanctions by April 2026?",
    description: "Resolves YES if the European Union enacts additional sanction packages targeting Russia before April 30, 2026.",
    category: "geopolitics",
    outcomes: [
      { id: "o5", label: "Yes", probability: 0.45, volume: 3100000 },
      { id: "o6", label: "No", probability: 0.55, volume: 3800000 },
    ],
    totalVolume: 6900000,
    participantCount: 8400,
    resolution: "unresolved",
    source: "Kalshi",
    sourceUrl: "https://kalshi.com",
    relatedAssets: ["XAU", "WTI"],
    resolvesAt: new Date("2026-05-01").toISOString(),
    createdAt: new Date(Date.now() - 14 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "p4",
    question: "Oil above $80/barrel by June 2026?",
    description: "Resolves YES if WTI crude oil spot price exceeds $80 at any point before July 1, 2026.",
    category: "energy",
    outcomes: [
      { id: "o7", label: "Yes", probability: 0.34, volume: 5400000 },
      { id: "o8", label: "No", probability: 0.66, volume: 10500000 },
    ],
    totalVolume: 15900000,
    participantCount: 18200,
    resolution: "unresolved",
    source: "Polymarket",
    sourceUrl: "https://polymarket.com",
    relatedAssets: ["WTI"],
    resolvesAt: new Date("2026-07-01").toISOString(),
    createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "p5",
    question: "Germany enters recession in 2026?",
    description: "Resolves YES if Germany reports two consecutive quarters of negative GDP growth in 2026.",
    category: "economics",
    outcomes: [
      { id: "o9", label: "Yes", probability: 0.31, volume: 2800000 },
      { id: "o10", label: "No", probability: 0.69, volume: 6200000 },
    ],
    totalVolume: 9000000,
    participantCount: 11300,
    resolution: "unresolved",
    source: "Kalshi",
    sourceUrl: "https://kalshi.com",
    relatedAssets: ["DAX", "EUR/USD"],
    resolvesAt: new Date("2027-01-01").toISOString(),
    createdAt: new Date(Date.now() - 45 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

type SortBy = "probability" | "volume" | "closingDate";

function getProbabilityColor(prob: number): string {
  if (prob < 0.3) return "#FF4444";
  if (prob < 0.5) return "#FF8844";
  if (prob < 0.7) return "#FFCC00";
  return "#00FF88";
}

function formatVolume(vol: number): string {
  if (vol >= 1_000_000) return `$${(vol / 1_000_000).toFixed(1)}M`;
  if (vol >= 1_000) return `$${(vol / 1_000).toFixed(0)}K`;
  return `$${vol}`;
}

function daysUntil(dateStr: string): string {
  const diff = new Date(dateStr).getTime() - Date.now();
  const days = Math.ceil(diff / 86400000);
  if (days < 0) return "Expired";
  if (days === 0) return "Today";
  if (days === 1) return "1 day";
  return `${days} days`;
}

// ---------------------------------------------------------------------------
// Components
// ---------------------------------------------------------------------------

interface ProbabilityBarProps {
  probability: number;
}

function ProbabilityBar({ probability }: ProbabilityBarProps) {
  const percent = probability * 100;
  const color = getProbabilityColor(probability);

  return (
    <div className="relative h-5 w-full overflow-hidden rounded-full bg-white/[0.04]">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${percent}%` }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="h-full rounded-full"
        style={{
          background: `linear-gradient(90deg, ${color}33, ${color}88)`,
        }}
      />
      <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold tabular-nums text-white/90">
        {percent.toFixed(0)}%
      </span>
    </div>
  );
}

interface PredictionItemProps {
  market: PredictionMarket;
  index: number;
}

function PredictionItem({ market, index }: PredictionItemProps) {
  const yesOutcome = market.outcomes.find((o) => o.label === "Yes");
  const probability = yesOutcome?.probability ?? 0.5;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.06 }}
      className="group rounded-lg border border-white/[0.04] bg-white/[0.02] p-3 transition-all duration-200 hover:border-white/[0.08] hover:bg-white/[0.04]"
    >
      <p className="mb-2 text-sm font-medium leading-snug text-slate-200">
        {market.question}
      </p>

      <ProbabilityBar probability={probability} />

      <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500">
        <div className="flex items-center gap-1">
          <DollarSign className="h-3 w-3" />
          <span>{formatVolume(market.totalVolume)}</span>
        </div>
        <div className="flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          <span>{daysUntil(market.resolvesAt)}</span>
        </div>
        <span className="rounded bg-white/[0.06] px-1.5 py-0.5 text-[9px] font-medium text-slate-400">
          {market.source}
        </span>
      </div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

interface PredictionMarketsWidgetProps {
  markets?: PredictionMarket[];
  isLoading?: boolean;
}

export function PredictionMarketsWidget({
  markets = MOCK_PREDICTIONS,
  isLoading = false,
}: PredictionMarketsWidgetProps) {
  const [sortBy, setSortBy] = useState<SortBy>("probability");

  const sortedMarkets = useMemo(() => {
    const sorted = [...markets];
    switch (sortBy) {
      case "probability":
        sorted.sort((a, b) => {
          const aProb = a.outcomes.find((o) => o.label === "Yes")?.probability ?? 0;
          const bProb = b.outcomes.find((o) => o.label === "Yes")?.probability ?? 0;
          return bProb - aProb;
        });
        break;
      case "volume":
        sorted.sort((a, b) => b.totalVolume - a.totalVolume);
        break;
      case "closingDate":
        sorted.sort(
          (a, b) =>
            new Date(a.resolvesAt).getTime() - new Date(b.resolvesAt).getTime()
        );
        break;
    }
    return sorted;
  }, [markets, sortBy]);

  if (isLoading) {
    return (
      <div className="p-4">
        <ListSkeleton rows={5} />
      </div>
    );
  }

  const sortOptions: { key: SortBy; label: string; icon: typeof TrendingUp }[] = [
    { key: "probability", label: "Prob", icon: TrendingUp },
    { key: "volume", label: "Volume", icon: DollarSign },
    { key: "closingDate", label: "Date", icon: Calendar },
  ];

  return (
    <div className="space-y-3">
      {/* Sort toggle */}
      <div className="flex items-center gap-2">
        <ArrowUpDown className="h-3 w-3 text-slate-500" />
        <span className="text-[10px] text-slate-500">Sort:</span>
        <div className="flex gap-1 rounded-md bg-white/[0.04] p-0.5">
          {sortOptions.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setSortBy(key)}
              className={cn(
                "rounded px-2 py-1 text-[10px] font-medium transition-colors duration-200",
                sortBy === key
                  ? "bg-white/10 text-slate-200"
                  : "text-slate-500 hover:text-slate-300"
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Market list */}
      <div className="space-y-2">
        {sortedMarkets.slice(0, 5).map((market, i) => (
          <PredictionItem key={market.id} market={market} index={i} />
        ))}
      </div>
    </div>
  );
}
