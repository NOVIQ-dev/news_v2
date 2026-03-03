"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import {
  Calendar as CalendarIcon,
  Clock,
  Flag,
  ChevronDown,
  Filter,
  AlertTriangle,
  Minus,
  ArrowDown,
} from "lucide-react";

type TimeFilter = "today" | "thisWeek" | "upcoming";
type ImportanceFilter = "all" | "high" | "medium" | "low";

const MOCK_EVENTS = [
  {
    id: "1",
    title: "US Non-Farm Payrolls",
    country: "US",
    datetime: "2025-03-07T14:30:00Z",
    importance: "high" as const,
    actual: undefined,
    forecast: "185K",
    previous: "175K",
  },
  {
    id: "2",
    title: "ECB Interest Rate Decision",
    country: "EU",
    datetime: "2025-03-06T13:45:00Z",
    importance: "high" as const,
    actual: undefined,
    forecast: "4.50%",
    previous: "4.50%",
  },
  {
    id: "3",
    title: "China CPI (YoY)",
    country: "CN",
    datetime: "2025-03-09T01:30:00Z",
    importance: "medium" as const,
    actual: undefined,
    forecast: "0.4%",
    previous: "0.3%",
  },
  {
    id: "4",
    title: "UK GDP (QoQ)",
    country: "GB",
    datetime: "2025-03-08T07:00:00Z",
    importance: "high" as const,
    actual: undefined,
    forecast: "0.2%",
    previous: "0.1%",
  },
  {
    id: "5",
    title: "Japan BOJ Rate Decision",
    country: "JP",
    datetime: "2025-03-12T03:00:00Z",
    importance: "high" as const,
    actual: undefined,
    forecast: "0.25%",
    previous: "0.25%",
  },
  {
    id: "6",
    title: "US Retail Sales (MoM)",
    country: "US",
    datetime: "2025-03-14T13:30:00Z",
    importance: "medium" as const,
    actual: undefined,
    forecast: "0.3%",
    previous: "-0.2%",
  },
  {
    id: "7",
    title: "German ZEW Economic Sentiment",
    country: "DE",
    datetime: "2025-03-11T10:00:00Z",
    importance: "medium" as const,
    actual: undefined,
    forecast: "15.0",
    previous: "10.3",
  },
  {
    id: "8",
    title: "Australia Employment Change",
    country: "AU",
    datetime: "2025-03-13T00:30:00Z",
    importance: "low" as const,
    actual: undefined,
    forecast: "25.0K",
    previous: "30.5K",
  },
];

function CountdownTimer({ datetime }: { datetime: string }) {
  const target = new Date(datetime).getTime();
  const now = Date.now();
  const diff = target - now;

  if (diff <= 0) return <span className="text-positive font-mono text-xs">RELEASED</span>;

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  return (
    <span className="font-mono text-xs text-accent">
      {days > 0 && `${days}d `}
      {hours}h {minutes}m
    </span>
  );
}

function ImportanceBadge({ importance }: { importance: string }) {
  const config = {
    high: {
      icon: AlertTriangle,
      bg: "bg-negative/10 text-negative",
    },
    medium: {
      icon: Minus,
      bg: "bg-warning/10 text-warning",
    },
    low: {
      icon: ArrowDown,
      bg: "bg-surface-light text-text-muted",
    },
  };

  const c = config[importance as keyof typeof config] || config.low;
  const Icon = c.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
        c.bg
      )}
    >
      <Icon className="h-3 w-3" />
      {importance}
    </span>
  );
}

export default function CalendarPage() {
  const t = useTranslations("calendar");

  const [timeFilter, setTimeFilter] = useState<TimeFilter>("upcoming");
  const [importanceFilter, setImportanceFilter] =
    useState<ImportanceFilter>("all");

  const filteredEvents = MOCK_EVENTS.filter(
    (event) =>
      importanceFilter === "all" || event.importance === importanceFilter
  );

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
          {/* Time tabs */}
          <div className="flex gap-1">
            {(["today", "thisWeek", "upcoming"] as TimeFilter[]).map((f) => (
              <button
                key={f}
                onClick={() => setTimeFilter(f)}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                  timeFilter === f
                    ? "bg-accent/10 text-accent"
                    : "text-text-secondary hover:bg-surface-hover hover:text-text-primary"
                )}
              >
                {t(f)}
              </button>
            ))}
          </div>

          {/* Importance filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-text-muted">{t("importance")}:</span>
            {(["all", "high", "medium", "low"] as ImportanceFilter[]).map(
              (f) => (
                <button
                  key={f}
                  onClick={() => setImportanceFilter(f)}
                  className={cn(
                    "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                    importanceFilter === f
                      ? "bg-accent/10 text-accent ring-1 ring-accent/30"
                      : "bg-surface-light text-text-secondary hover:bg-surface-hover"
                  )}
                >
                  {f === "all" ? "All" : t(f)}
                </button>
              )
            )}
          </div>
        </div>
      </div>

      {/* Events list */}
      {filteredEvents.length === 0 ? (
        <div className="glass flex items-center justify-center rounded-xl p-20">
          <div className="text-center">
            <CalendarIcon className="mx-auto h-10 w-10 text-text-muted mb-3" />
            <p className="text-sm text-text-secondary">{t("noEvents")}</p>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredEvents.map((event) => (
            <div
              key={event.id}
              className="glass group cursor-pointer rounded-xl p-4 transition-all hover:border-border-light"
            >
              <div className="flex items-center gap-4">
                {/* Country & time */}
                <div className="flex flex-col items-center gap-1 w-16 shrink-0">
                  <span className="text-lg font-bold text-text-primary">
                    {event.country}
                  </span>
                  <span className="text-[10px] text-text-muted font-mono">
                    {new Date(event.datetime).toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: false,
                    })}
                  </span>
                </div>

                {/* Divider */}
                <div className="h-10 w-px bg-border" />

                {/* Event info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-medium text-text-primary truncate">
                      {event.title}
                    </h3>
                    <ImportanceBadge importance={event.importance} />
                  </div>
                  <div className="flex items-center gap-4 text-xs text-text-muted">
                    <span className="flex items-center gap-1">
                      <CalendarIcon className="h-3 w-3" />
                      {new Date(event.datetime).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <CountdownTimer datetime={event.datetime} />
                    </span>
                  </div>
                </div>

                {/* Data columns */}
                <div className="hidden sm:flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-[10px] text-text-muted uppercase tracking-wider mb-0.5">
                      {t("forecast")}
                    </p>
                    <p className="font-mono text-sm text-text-primary">
                      {event.forecast || "-"}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] text-text-muted uppercase tracking-wider mb-0.5">
                      {t("previous")}
                    </p>
                    <p className="font-mono text-sm text-text-secondary">
                      {event.previous || "-"}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] text-text-muted uppercase tracking-wider mb-0.5">
                      {t("actual")}
                    </p>
                    <p className="font-mono text-sm text-text-primary">
                      {event.actual || "-"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
