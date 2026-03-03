"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { cn, formatCurrency, formatPercentage } from "@/lib/utils";
import {
  TrendingUp,
  DollarSign,
  Bell,
  Target,
  Newspaper,
  Calendar,
  Brain,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  RefreshCcw,
} from "lucide-react";

// Dynamic imports with ssr: false for heavy components
const GeopoliticalMap = dynamic(
  () =>
    import("@/components/widgets/geopolitical-map").then((m) => ({
      default: m.GeopoliticalMap,
    })),
  {
    ssr: false,
    loading: () => <MapSkeleton />,
  }
);

const AiQuickAnalyze = dynamic(
  () =>
    import("@/components/widgets/ai-quick-analyze").then((m) => ({
      default: m.AiQuickAnalyze,
    })),
  {
    ssr: false,
    loading: () => <WidgetSkeleton />,
  }
);

// ---------------------------------------------------------------------------
// Animation variants
// ---------------------------------------------------------------------------

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" },
  },
};

// ---------------------------------------------------------------------------
// Skeleton components
// ---------------------------------------------------------------------------

function WidgetSkeleton() {
  return (
    <div className="glass rounded-xl p-5 animate-pulse">
      <div className="h-4 w-24 rounded bg-surface-light mb-4" />
      <div className="h-8 w-32 rounded bg-surface-light mb-2" />
      <div className="h-3 w-20 rounded bg-surface-light" />
    </div>
  );
}

function MapSkeleton() {
  return (
    <div className="glass rounded-xl p-5 animate-pulse min-h-[320px]">
      <div className="h-4 w-40 rounded bg-surface-light mb-4" />
      <div className="h-64 w-full rounded bg-surface-light" />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Stat card widget
// ---------------------------------------------------------------------------

function StatCard({
  title,
  value,
  change,
  icon: Icon,
  iconColor = "text-accent",
}: {
  title: string;
  value: string;
  change?: number;
  icon: React.ElementType;
  iconColor?: string;
}) {
  return (
    <div className="glass rounded-xl p-5 transition-all hover:border-border-light">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-text-secondary">{title}</span>
        <div
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-lg",
            iconColor === "text-accent"
              ? "bg-accent/10"
              : iconColor === "text-positive"
              ? "bg-positive/10"
              : iconColor === "text-negative"
              ? "bg-negative/10"
              : "bg-info/10"
          )}
        >
          <Icon className={cn("h-4 w-4", iconColor)} />
        </div>
      </div>
      <p className="text-2xl font-bold text-text-primary font-mono">{value}</p>
      {change !== undefined && (
        <div className="mt-1 flex items-center gap-1">
          {change >= 0 ? (
            <ArrowUpRight className="h-3.5 w-3.5 text-positive" />
          ) : (
            <ArrowDownRight className="h-3.5 w-3.5 text-negative" />
          )}
          <span
            className={cn(
              "text-xs font-medium",
              change >= 0 ? "text-positive" : "text-negative"
            )}
          >
            {formatPercentage(change)}
          </span>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Market overview widget (ticker row)
// ---------------------------------------------------------------------------

function MarketOverviewWidget() {
  const t = useTranslations("dashboard");

  const mockAssets = [
    { symbol: "BTC", name: "Bitcoin", price: 67432.18, change: 2.4 },
    { symbol: "ETH", name: "Ethereum", price: 3891.42, change: 1.8 },
    { symbol: "SPX", name: "S&P 500", price: 5234.18, change: 0.7 },
    { symbol: "GLD", name: "Gold", price: 2341.5, change: -0.3 },
    { symbol: "EUR/USD", name: "Euro/Dollar", price: 1.0842, change: -0.12 },
  ];

  return (
    <div className="glass rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-text-primary">
          {t("marketOverview")}
        </h3>
        <BarChart3 className="h-4 w-4 text-text-muted" />
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
        {mockAssets.map((asset) => (
          <div
            key={asset.symbol}
            className="flex flex-col items-center rounded-lg p-3 transition-colors hover:bg-surface-hover"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/5 text-xs font-bold text-accent font-mono">
              {asset.symbol.slice(0, 3)}
            </div>
            <p className="mt-2 text-xs font-medium text-text-primary font-mono">
              {asset.symbol}
            </p>
            <p className="text-sm font-mono text-text-primary">
              {asset.price < 10
                ? asset.price.toFixed(4)
                : formatCurrency(asset.price)}
            </p>
            <p
              className={cn(
                "text-xs font-mono",
                asset.change >= 0 ? "text-positive" : "text-negative"
              )}
            >
              {formatPercentage(asset.change)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Top movers widget
// ---------------------------------------------------------------------------

function TopMoversWidget() {
  const t = useTranslations("dashboard");

  const movers = [
    { symbol: "SOL", change: 8.2, price: 142.18 },
    { symbol: "AVAX", change: 6.4, price: 38.91 },
    { symbol: "DOGE", change: -5.1, price: 0.121 },
    { symbol: "XRP", change: 4.3, price: 0.614 },
  ];

  return (
    <div className="glass rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-text-primary">
          {t("topMovers")}
        </h3>
        <TrendingUp className="h-4 w-4 text-text-muted" />
      </div>
      <div className="space-y-2">
        {movers.map((m) => (
          <div
            key={m.symbol}
            className="flex items-center justify-between rounded-lg p-2"
          >
            <span className="text-sm font-medium text-text-primary font-mono">
              {m.symbol}
            </span>
            <div className="flex items-center gap-3">
              <span className="text-sm font-mono text-text-secondary">
                ${m.price}
              </span>
              <span
                className={cn(
                  "rounded-md px-2 py-0.5 text-xs font-medium font-mono",
                  m.change >= 0
                    ? "bg-positive/10 text-positive"
                    : "bg-negative/10 text-negative"
                )}
              >
                {formatPercentage(m.change)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Latest news widget
// ---------------------------------------------------------------------------

function LatestNewsWidget() {
  const t = useTranslations("dashboard");

  const news = [
    {
      id: "1",
      title: "Federal Reserve signals potential rate cut in Q2 2025",
      source: "Reuters",
      time: "2h ago",
      sentiment: "positive" as const,
    },
    {
      id: "2",
      title: "EU announces new sanctions package targeting energy sector",
      source: "Bloomberg",
      time: "4h ago",
      sentiment: "negative" as const,
    },
    {
      id: "3",
      title: "OPEC+ production cuts extended through end of year",
      source: "Financial Times",
      time: "6h ago",
      sentiment: "neutral" as const,
    },
  ];

  const sentimentDot = (s: string) =>
    s === "positive"
      ? "bg-positive"
      : s === "negative"
      ? "bg-negative"
      : "bg-text-muted";

  return (
    <div className="glass rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-text-primary">
          {t("latestNews")}
        </h3>
        <Newspaper className="h-4 w-4 text-text-muted" />
      </div>
      <div className="space-y-3">
        {news.map((item) => (
          <div
            key={item.id}
            className="group cursor-pointer rounded-lg p-3 transition-colors hover:bg-surface-hover"
          >
            <div className="flex items-start gap-2">
              <div
                className={cn(
                  "mt-1.5 h-2 w-2 shrink-0 rounded-full",
                  sentimentDot(item.sentiment)
                )}
              />
              <div>
                <p className="text-sm text-text-primary leading-snug group-hover:text-accent transition-colors">
                  {item.title}
                </p>
                <p className="mt-1 text-xs text-text-muted">
                  {item.source} &middot; {item.time}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Upcoming events widget
// ---------------------------------------------------------------------------

function UpcomingEventsWidget() {
  const t = useTranslations("dashboard");

  const events = [
    {
      id: "1",
      title: "US Non-Farm Payrolls",
      time: "Mar 7, 14:30",
      importance: "high" as const,
    },
    {
      id: "2",
      title: "ECB Interest Rate Decision",
      time: "Mar 6, 13:45",
      importance: "high" as const,
    },
    {
      id: "3",
      title: "China CPI (YoY)",
      time: "Mar 9, 01:30",
      importance: "medium" as const,
    },
  ];

  const importanceColor = (i: string) =>
    i === "high"
      ? "bg-negative/10 text-negative"
      : i === "medium"
      ? "bg-warning/10 text-warning"
      : "bg-surface-light text-text-muted";

  return (
    <div className="glass rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-text-primary">
          {t("upcomingEvents")}
        </h3>
        <Calendar className="h-4 w-4 text-text-muted" />
      </div>
      <div className="space-y-3">
        {events.map((event) => (
          <div
            key={event.id}
            className="flex items-center justify-between rounded-lg p-3 transition-colors hover:bg-surface-hover"
          >
            <div>
              <p className="text-sm text-text-primary">{event.title}</p>
              <p className="text-xs text-text-muted font-mono">{event.time}</p>
            </div>
            <span
              className={cn(
                "rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
                importanceColor(event.importance)
              )}
            >
              {event.importance}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// AI Insights widget
// ---------------------------------------------------------------------------

function AiInsightsWidget() {
  const t = useTranslations("dashboard");

  return (
    <div className="glass rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-text-primary">
          {t("aiInsights")}
        </h3>
        <Brain className="h-4 w-4 text-info" />
      </div>
      <Suspense fallback={<WidgetSkeleton />}>
        <AiQuickAnalyze />
      </Suspense>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Dashboard page
// ---------------------------------------------------------------------------

export default function DashboardPage() {
  const t = useTranslations("dashboard");

  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Page header */}
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary font-[family-name:var(--font-display)]">
            {t("title")}
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            {t("welcome")}. {t("overview")}.
          </p>
        </div>
        <button className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm text-text-secondary hover:bg-surface-hover hover:text-text-primary transition-colors">
          <RefreshCcw className="h-3.5 w-3.5" />
          {t("recentActivity")}
        </button>
      </motion.div>

      {/* Full-width Geopolitical Map at top */}
      <motion.div variants={itemVariants}>
        <Suspense fallback={<MapSkeleton />}>
          <GeopoliticalMap />
        </Suspense>
      </motion.div>

      {/* Market ticker row — full width */}
      <motion.div variants={itemVariants}>
        <Suspense fallback={<WidgetSkeleton />}>
          <MarketOverviewWidget />
        </Suspense>
      </motion.div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <motion.div variants={itemVariants}>
          <Suspense fallback={<WidgetSkeleton />}>
            <StatCard
              title={t("totalPortfolioValue")}
              value={formatCurrency(124563.42)}
              change={3.24}
              icon={DollarSign}
              iconColor="text-accent"
            />
          </Suspense>
        </motion.div>
        <motion.div variants={itemVariants}>
          <Suspense fallback={<WidgetSkeleton />}>
            <StatCard
              title={t("dayChange")}
              value={formatCurrency(2847.18)}
              change={2.34}
              icon={TrendingUp}
              iconColor="text-positive"
            />
          </Suspense>
        </motion.div>
        <motion.div variants={itemVariants}>
          <Suspense fallback={<WidgetSkeleton />}>
            <StatCard
              title={t("activeAlerts")}
              value="12"
              icon={Bell}
              iconColor="text-warning"
            />
          </Suspense>
        </motion.div>
        <motion.div variants={itemVariants}>
          <Suspense fallback={<WidgetSkeleton />}>
            <StatCard
              title={t("predictionAccuracy")}
              value="78%"
              change={4.2}
              icon={Target}
              iconColor="text-info"
            />
          </Suspense>
        </motion.div>
      </div>

      {/* 3-column widget grid */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <motion.div variants={itemVariants}>
          <Suspense fallback={<WidgetSkeleton />}>
            <LatestNewsWidget />
          </Suspense>
        </motion.div>
        <motion.div variants={itemVariants}>
          <Suspense fallback={<WidgetSkeleton />}>
            <TopMoversWidget />
          </Suspense>
        </motion.div>
        <motion.div variants={itemVariants}>
          <Suspense fallback={<WidgetSkeleton />}>
            <UpcomingEventsWidget />
          </Suspense>
        </motion.div>
      </div>

      {/* AI Insights — full width */}
      <motion.div variants={itemVariants}>
        <AiInsightsWidget />
      </motion.div>
    </motion.div>
  );
}
