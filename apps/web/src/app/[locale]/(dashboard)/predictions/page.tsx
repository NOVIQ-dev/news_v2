"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { cn, formatCompactNumber, formatDate } from "@/lib/utils";
import {
  TrendingUp,
  Target,
  Clock,
  BarChart3,
  Filter,
  CheckCircle2,
  Circle,
} from "lucide-react";

const MOCK_PREDICTIONS = [
  {
    id: "1",
    title: "Will the Federal Reserve cut rates by June 2025?",
    description:
      "Market expects at least one 25bp rate cut from the Federal Reserve before the end of June 2025.",
    category: "Monetary Policy",
    probability: 73,
    volume: 12500000,
    closingDate: "2025-06-30T23:59:59Z",
    status: "active" as const,
    resolution: undefined,
  },
  {
    id: "2",
    title: "Will Bitcoin reach $100K before April 2025?",
    description:
      "Bitcoin must trade above $100,000 on any major exchange before April 1, 2025.",
    category: "Crypto",
    probability: 35,
    volume: 8400000,
    closingDate: "2025-04-01T23:59:59Z",
    status: "active" as const,
    resolution: undefined,
  },
  {
    id: "3",
    title: "Will EU expand sanctions in Q1 2025?",
    description:
      "The European Union will adopt a new comprehensive sanctions package in Q1 2025.",
    category: "Geopolitics",
    probability: 82,
    volume: 3200000,
    closingDate: "2025-03-31T23:59:59Z",
    status: "active" as const,
    resolution: undefined,
  },
  {
    id: "4",
    title: "Oil prices above $85/barrel by mid-2025?",
    description:
      "WTI Crude Oil futures will trade above $85 per barrel at any point before July 1, 2025.",
    category: "Commodities",
    probability: 48,
    volume: 5600000,
    closingDate: "2025-07-01T23:59:59Z",
    status: "active" as const,
    resolution: undefined,
  },
  {
    id: "5",
    title: "S&P 500 to reach 5,500 by end of 2025?",
    description:
      "The S&P 500 index will close above 5,500 at least once before December 31, 2025.",
    category: "Equities",
    probability: 61,
    volume: 9800000,
    closingDate: "2025-12-31T23:59:59Z",
    status: "active" as const,
    resolution: undefined,
  },
];

function ProbabilityBar({ probability }: { probability: number }) {
  const color =
    probability >= 70
      ? "bg-positive"
      : probability >= 40
      ? "bg-warning"
      : "bg-negative";

  return (
    <div className="space-y-1">
      <div className="flex h-2 overflow-hidden rounded-full bg-surface-light">
        <div
          className={cn("h-full rounded-full transition-all", color)}
          style={{ width: `${probability}%` }}
        />
      </div>
      <div className="flex justify-between text-[10px] font-mono text-text-muted">
        <span>0%</span>
        <span>100%</span>
      </div>
    </div>
  );
}

export default function PredictionsPage() {
  const t = useTranslations("predictions");

  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "resolved">("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const categories = [
    "all",
    ...new Set(MOCK_PREDICTIONS.map((p) => p.category)),
  ];

  const filteredPredictions = MOCK_PREDICTIONS.filter((p) => {
    const matchesStatus = statusFilter === "all" || p.status === statusFilter;
    const matchesCategory =
      categoryFilter === "all" || p.category === categoryFilter;
    return matchesStatus && matchesCategory;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary font-[family-name:var(--font-display)]">
            {t("title")}
          </h1>
        </div>
      </div>

      {/* Filters */}
      <div className="glass rounded-xl p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Status */}
          <div className="flex gap-1">
            {(["all", "active", "resolved"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                  statusFilter === s
                    ? "bg-accent/10 text-accent"
                    : "text-text-secondary hover:bg-surface-hover"
                )}
              >
                {s === "all"
                  ? t("allMarkets")
                  : s === "active"
                  ? t("active")
                  : t("resolved")}
              </button>
            ))}
          </div>

          {/* Category */}
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                  categoryFilter === cat
                    ? "bg-accent/10 text-accent ring-1 ring-accent/30"
                    : "bg-surface-light text-text-secondary hover:bg-surface-hover"
                )}
              >
                {cat === "all" ? t("allMarkets") : cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Predictions grid */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {filteredPredictions.map((prediction) => (
          <div
            key={prediction.id}
            className="glass cursor-pointer rounded-xl p-5 transition-all hover:border-border-light"
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-4 mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="rounded-md bg-surface-light px-2 py-0.5 text-[10px] font-medium text-text-muted uppercase tracking-wider">
                    {prediction.category}
                  </span>
                  <span
                    className={cn(
                      "flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
                      prediction.status === "active"
                        ? "bg-positive/10 text-positive"
                        : "bg-surface-light text-text-muted"
                    )}
                  >
                    {prediction.status === "active" ? (
                      <Circle className="h-2 w-2 fill-current" />
                    ) : (
                      <CheckCircle2 className="h-3 w-3" />
                    )}
                    {t(prediction.status)}
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-text-primary leading-snug">
                  {prediction.title}
                </h3>
                <p className="mt-1 text-xs text-text-muted line-clamp-2">
                  {prediction.description}
                </p>
              </div>

              {/* Probability circle */}
              <div className="flex flex-col items-center shrink-0">
                <div
                  className={cn(
                    "flex h-14 w-14 items-center justify-center rounded-full border-2",
                    prediction.probability >= 70
                      ? "border-positive text-positive"
                      : prediction.probability >= 40
                      ? "border-warning text-warning"
                      : "border-negative text-negative"
                  )}
                >
                  <span className="text-lg font-bold font-mono">
                    {prediction.probability}
                  </span>
                </div>
                <span className="mt-1 text-[10px] text-text-muted">
                  {t("probability")}
                </span>
              </div>
            </div>

            {/* Progress bar */}
            <ProbabilityBar probability={prediction.probability} />

            {/* Footer */}
            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center gap-4 text-xs text-text-muted">
                <span className="flex items-center gap-1">
                  <BarChart3 className="h-3 w-3" />
                  ${formatCompactNumber(prediction.volume)}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatDate(prediction.closingDate, "MMM d, yyyy")}
                </span>
              </div>

              <div className="flex gap-2">
                <button className="rounded-lg bg-positive/10 px-3 py-1.5 text-xs font-semibold text-positive hover:bg-positive/20 transition-colors">
                  {t("yes")}
                </button>
                <button className="rounded-lg bg-negative/10 px-3 py-1.5 text-xs font-semibold text-negative hover:bg-negative/20 transition-colors">
                  {t("no")}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
