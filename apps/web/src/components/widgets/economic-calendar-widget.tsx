"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, Clock, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { ListSkeleton } from "@/components/common/loading-skeleton";
import { EmptyState } from "@/components/common/empty-state";
import type { EconomicEvent, EventImportance } from "@fintelligence/shared";

// ---------------------------------------------------------------------------
// Country flag emojis
// ---------------------------------------------------------------------------

const COUNTRY_FLAGS: Record<string, string> = {
  US: "\uD83C\uDDFA\uD83C\uDDF8",
  DE: "\uD83C\uDDE9\uD83C\uDDEA",
  GB: "\uD83C\uDDEC\uD83C\uDDE7",
  JP: "\uD83C\uDDEF\uD83C\uDDF5",
  CN: "\uD83C\uDDE8\uD83C\uDDF3",
  EU: "\uD83C\uDDEA\uD83C\uDDFA",
  CA: "\uD83C\uDDE8\uD83C\uDDE6",
  AU: "\uD83C\uDDE6\uD83C\uDDFA",
  CH: "\uD83C\uDDE8\uD83C\uDDED",
  RU: "\uD83C\uDDF7\uD83C\uDDFA",
};

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

const now = Date.now();
const HOUR = 3600000;
const DAY = 86400000;

const MOCK_EVENTS: EconomicEvent[] = [
  {
    id: "e1",
    title: "FOMC Interest Rate Decision",
    country: "US",
    currency: "USD",
    importance: "HIGH" as unknown as EventImportance,
    scheduledAt: new Date(now + 2 * HOUR).toISOString(),
    forecast: "5.25%",
    previous: "5.50%",
    description: "The Federal Open Market Committee announces its target for the federal funds rate.",
    source: "Federal Reserve",
    isReleased: false,
    relatedAssets: ["SPX", "EUR/USD", "XAU"],
    updatedAt: new Date().toISOString(),
  },
  {
    id: "e2",
    title: "ECB Press Conference",
    country: "EU",
    currency: "EUR",
    importance: "HIGH" as unknown as EventImportance,
    scheduledAt: new Date(now + 5 * HOUR).toISOString(),
    forecast: undefined,
    previous: undefined,
    description: "ECB President holds press conference following the monetary policy decision.",
    source: "European Central Bank",
    isReleased: false,
    relatedAssets: ["EUR/USD", "DAX"],
    updatedAt: new Date().toISOString(),
  },
  {
    id: "e3",
    title: "US Non-Farm Payrolls",
    country: "US",
    currency: "USD",
    importance: "HIGH" as unknown as EventImportance,
    scheduledAt: new Date(now + DAY + 3 * HOUR).toISOString(),
    forecast: "180K",
    previous: "216K",
    description: "Monthly employment change in non-agricultural sectors.",
    source: "Bureau of Labor Statistics",
    isReleased: false,
    relatedAssets: ["SPX", "EUR/USD"],
    updatedAt: new Date().toISOString(),
  },
  {
    id: "e4",
    title: "German CPI (MoM)",
    country: "DE",
    currency: "EUR",
    importance: "MEDIUM" as unknown as EventImportance,
    scheduledAt: new Date(now + DAY + 6 * HOUR).toISOString(),
    forecast: "0.3%",
    previous: "0.1%",
    description: "Monthly change in consumer prices in Germany.",
    source: "Destatis",
    isReleased: false,
    relatedAssets: ["DAX", "EUR/USD"],
    updatedAt: new Date().toISOString(),
  },
  {
    id: "e5",
    title: "UK GDP (QoQ)",
    country: "GB",
    currency: "GBP",
    importance: "MEDIUM" as unknown as EventImportance,
    scheduledAt: new Date(now + 2 * DAY + 4 * HOUR).toISOString(),
    forecast: "0.2%",
    previous: "-0.1%",
    description: "Quarterly change in UK gross domestic product.",
    source: "ONS",
    isReleased: false,
    relatedAssets: ["GBP/USD"],
    updatedAt: new Date().toISOString(),
  },
  {
    id: "e6",
    title: "Japan BOJ Rate Decision",
    country: "JP",
    currency: "JPY",
    importance: "HIGH" as unknown as EventImportance,
    scheduledAt: new Date(now + 3 * DAY + 2 * HOUR).toISOString(),
    forecast: "0.25%",
    previous: "0.25%",
    description: "Bank of Japan announces its monetary policy rate decision.",
    source: "Bank of Japan",
    isReleased: false,
    relatedAssets: [],
    updatedAt: new Date().toISOString(),
  },
  {
    id: "e7",
    title: "US ISM Manufacturing PMI",
    country: "US",
    currency: "USD",
    importance: "LOW" as unknown as EventImportance,
    scheduledAt: new Date(now + 4 * DAY).toISOString(),
    forecast: "49.5",
    previous: "47.8",
    description: "Institute for Supply Management manufacturing purchasing managers index.",
    source: "ISM",
    isReleased: false,
    relatedAssets: ["SPX"],
    updatedAt: new Date().toISOString(),
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getCountdown(dateStr: string): string {
  const diff = new Date(dateStr).getTime() - Date.now();
  if (diff <= 0) return "Now";

  const hours = Math.floor(diff / HOUR);
  const minutes = Math.floor((diff % HOUR) / 60000);

  if (hours >= 24) {
    const days = Math.floor(hours / 24);
    return `${days}d ${hours % 24}h`;
  }
  return `${hours}h ${minutes}m`;
}

function getDateGroup(dateStr: string): string {
  const eventDate = new Date(dateStr);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (eventDate.toDateString() === today.toDateString()) return "Today";
  if (eventDate.toDateString() === tomorrow.toDateString()) return "Tomorrow";
  return "This Week";
}

const IMPORTANCE_STYLES = {
  HIGH: "bg-[#FF4444]/15 text-[#FF4444] ring-1 ring-[#FF4444]/20",
  MEDIUM: "bg-yellow-500/15 text-yellow-400 ring-1 ring-yellow-500/20",
  LOW: "bg-white/[0.06] text-slate-400 ring-1 ring-white/[0.06]",
};

// ---------------------------------------------------------------------------
// Components
// ---------------------------------------------------------------------------

interface EventItemProps {
  event: EconomicEvent;
  index: number;
}

function EventItem({ event, index }: EventItemProps) {
  const [expanded, setExpanded] = useState(false);
  const [countdown, setCountdown] = useState(getCountdown(event.scheduledAt));

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown(getCountdown(event.scheduledAt));
    }, 60000);
    return () => clearInterval(interval);
  }, [event.scheduledAt]);

  const flag = COUNTRY_FLAGS[event.country] || event.country;

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="border-b border-white/[0.04] last:border-b-0"
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center gap-3 py-3 text-left transition-colors duration-200 hover:bg-white/[0.02]"
      >
        {/* Countdown */}
        <div className="flex w-16 shrink-0 flex-col items-center">
          <div className="flex items-center gap-1 text-[10px] text-[#00D4FF]">
            <Clock className="h-3 w-3" />
            <span className="font-mono tabular-nums">{countdown}</span>
          </div>
        </div>

        {/* Event info */}
        <div className="flex flex-1 flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="text-base">{flag}</span>
            <p className="text-sm font-medium text-slate-200">{event.title}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-500">{event.currency}</span>
          </div>
        </div>

        {/* Importance badge */}
        <span
          className={cn(
            "shrink-0 rounded-md px-2 py-0.5 text-[10px] font-semibold",
            IMPORTANCE_STYLES[event.importance]
          )}
        >
          {event.importance}
        </span>

        <div className="shrink-0 text-slate-500">
          {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="space-y-3 pb-3 pl-[76px] pr-2">
              {event.description && (
                <p className="text-xs leading-relaxed text-slate-400">
                  {event.description}
                </p>
              )}

              <div className="grid grid-cols-3 gap-3">
                {event.forecast !== undefined && (
                  <div className="rounded-lg bg-white/[0.03] p-2 text-center">
                    <p className="text-[10px] text-slate-500">Forecast</p>
                    <p className="text-sm font-semibold text-slate-200">{event.forecast}</p>
                  </div>
                )}
                {event.previous !== undefined && (
                  <div className="rounded-lg bg-white/[0.03] p-2 text-center">
                    <p className="text-[10px] text-slate-500">Previous</p>
                    <p className="text-sm font-semibold text-slate-200">{event.previous}</p>
                  </div>
                )}
                {event.actual !== undefined && (
                  <div className="rounded-lg bg-[#00D4FF]/5 p-2 text-center ring-1 ring-[#00D4FF]/20">
                    <p className="text-[10px] text-[#00D4FF]">Actual</p>
                    <p className="text-sm font-bold text-[#00D4FF]">{event.actual}</p>
                  </div>
                )}
              </div>

              {event.relatedAssets.length > 0 && (
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-slate-500">Affected:</span>
                  {event.relatedAssets.map((asset) => (
                    <span
                      key={asset}
                      className="rounded bg-white/[0.06] px-1.5 py-0.5 text-[10px] font-medium text-slate-300"
                    >
                      {asset}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

interface EconomicCalendarWidgetProps {
  events?: EconomicEvent[];
  isLoading?: boolean;
}

export function EconomicCalendarWidget({
  events = MOCK_EVENTS,
  isLoading = false,
}: EconomicCalendarWidgetProps) {
  if (isLoading) {
    return (
      <div className="p-4">
        <ListSkeleton rows={5} />
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <EmptyState
        icon={AlertCircle}
        title="No upcoming events"
        description="Economic events will appear here when scheduled."
      />
    );
  }

  // Group by date
  const grouped = useMemo(() => {
    const groups: Record<string, EconomicEvent[]> = {};
    events.forEach((event) => {
      const group = getDateGroup(event.scheduledAt);
      if (!groups[group]) groups[group] = [];
      groups[group].push(event);
    });
    return groups;
  }, [events]);

  return (
    <div className="space-y-2">
      {Object.entries(grouped).map(([groupName, groupEvents]) => (
        <div key={groupName}>
          <p className="mb-1 px-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
            {groupName}
          </p>
          {groupEvents.map((event, i) => (
            <EventItem key={event.id} event={event} index={i} />
          ))}
        </div>
      ))}
    </div>
  );
}
