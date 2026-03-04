"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  BellRing,
  TrendingUp,
  TrendingDown,
  Newspaper,
  Plus,
  Check,
  AlertCircle,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ListSkeleton } from "@/components/common/loading-skeleton";
import { EmptyState } from "@/components/common/empty-state";
import type { Alert, AlertStatus, AssetType, NewsRegion, NewsTag } from "@fintelligence/shared";

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

const MOCK_ALERTS: Alert[] = [
  {
    id: "a1",
    userId: "u1",
    kind: "price",
    symbol: "BTC",
    assetName: "Bitcoin",
    assetType: "CRYPTO" as unknown as AssetType,
    condition: "ABOVE",
    targetValue: 95000,
    status: "active" as AlertStatus,
    channels: ["in_app", "email"],
    recurring: false,
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: "a2",
    userId: "u1",
    kind: "price",
    symbol: "ETH",
    assetName: "Ethereum",
    assetType: "CRYPTO" as unknown as AssetType,
    condition: "BELOW",
    targetValue: 3300,
    status: "active" as AlertStatus,
    channels: ["in_app", "push"],
    recurring: true,
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
  {
    id: "a3",
    userId: "u1",
    kind: "price",
    symbol: "XAU",
    assetName: "Gold",
    assetType: "COMMODITY" as unknown as AssetType,
    condition: "ABOVE",
    targetValue: 3000,
    status: "triggered" as AlertStatus,
    channels: ["in_app", "email"],
    recurring: false,
    createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
    triggeredAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: "a4",
    userId: "u1",
    kind: "news",
    label: "Russia sanctions",
    keywords: ["Russia", "sanctions", "SWIFT"],
    regions: ["CIS" as unknown as NewsRegion, "EUROPE" as unknown as NewsRegion],
    tags: ["SANCTIONS" as unknown as NewsTag],
    relatedAssets: ["XAU", "WTI"],
    status: "active" as AlertStatus,
    channels: ["in_app", "email", "push"],
    createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
  },
  {
    id: "a5",
    userId: "u1",
    kind: "price",
    symbol: "WTI",
    assetName: "Crude Oil",
    assetType: "COMMODITY" as unknown as AssetType,
    condition: "PERCENT_CHANGE_DOWN",
    targetValue: 5,
    status: "triggered" as AlertStatus,
    channels: ["in_app"],
    recurring: true,
    createdAt: new Date(Date.now() - 14 * 86400000).toISOString(),
    triggeredAt: new Date(Date.now() - 2 * 3600000).toISOString(),
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getAlertIcon(alert: Alert) {
  if (alert.kind === "news") return Newspaper;
  if (alert.kind === "price") {
    if (alert.condition.includes("ABOVE") || alert.condition.includes("UP")) {
      return TrendingUp;
    }
    return TrendingDown;
  }
  return AlertCircle;
}

function getAlertDescription(alert: Alert): string {
  if (alert.kind === "news") {
    return `News: "${alert.label}"`;
  }
  const conditions: Record<string, string> = {
    ABOVE: "above",
    BELOW: "below",
    CROSSES_ABOVE: "crosses above",
    CROSSES_BELOW: "crosses below",
    PERCENT_CHANGE_UP: "up by",
    PERCENT_CHANGE_DOWN: "down by",
  };
  const condText = conditions[alert.condition] || alert.condition;
  const valueText = alert.condition.includes("PERCENT")
    ? `${alert.targetValue}%`
    : `$${alert.targetValue.toLocaleString()}`;

  return `${alert.symbol} ${condText} ${valueText}`;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return `${Math.floor(diff / 60000)}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

const STATUS_STYLES: Record<AlertStatus, { bg: string; text: string; label: string }> = {
  active: { bg: "bg-[#00D4FF]/10", text: "text-[#00D4FF]", label: "Active" },
  triggered: { bg: "bg-[#FFCC00]/10", text: "text-[#FFCC00]", label: "Triggered" },
  expired: { bg: "bg-white/5", text: "text-slate-500", label: "Expired" },
  disabled: { bg: "bg-white/5", text: "text-slate-500", label: "Disabled" },
};

// ---------------------------------------------------------------------------
// Components
// ---------------------------------------------------------------------------

interface AlertItemProps {
  alert: Alert;
  index: number;
}

function AlertItem({ alert, index }: AlertItemProps) {
  const Icon = getAlertIcon(alert);
  const description = getAlertDescription(alert);
  const statusStyle = STATUS_STYLES[alert.status];

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="flex items-center gap-3 rounded-lg border border-white/[0.04] bg-white/[0.02] p-3 transition-all duration-200 hover:border-white/[0.08] hover:bg-white/[0.04]"
    >
      {/* Icon */}
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
          alert.status === "triggered"
            ? "bg-[#FFCC00]/10"
            : "bg-white/[0.06]"
        )}
      >
        <Icon
          className={cn(
            "h-4 w-4",
            alert.status === "triggered" ? "text-[#FFCC00]" : "text-slate-400"
          )}
        />
      </div>

      {/* Description */}
      <div className="flex-1 min-w-0">
        <p className="truncate text-sm font-medium text-slate-200">
          {description}
        </p>
        <div className="flex items-center gap-2 text-[10px] text-slate-500">
          {alert.status === "triggered" && alert.kind === "price" && alert.triggeredAt ? (
            <>
              <BellRing className="h-3 w-3 text-[#FFCC00]" />
              <span>Triggered {timeAgo(alert.triggeredAt)}</span>
            </>
          ) : (
            <>
              <Clock className="h-3 w-3" />
              <span>Created {timeAgo(alert.createdAt)}</span>
            </>
          )}
        </div>
      </div>

      {/* Status badge */}
      <span
        className={cn(
          "shrink-0 rounded-md px-2 py-0.5 text-[10px] font-semibold",
          statusStyle.bg,
          statusStyle.text
        )}
      >
        {statusStyle.label}
      </span>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

interface AlertsWidgetProps {
  alerts?: Alert[];
  isLoading?: boolean;
  onAddAlert?: () => void;
}

export function AlertsWidget({
  alerts = MOCK_ALERTS,
  isLoading = false,
  onAddAlert,
}: AlertsWidgetProps) {
  const activeCount = alerts.filter((a) => a.status === "active").length;
  const triggeredCount = alerts.filter((a) => a.status === "triggered").length;

  if (isLoading) {
    return (
      <div className="p-4">
        <ListSkeleton rows={4} />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Summary bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="relative">
              <Bell className="h-4 w-4 text-slate-400" />
              {activeCount > 0 && (
                <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#00D4FF] text-[8px] font-bold text-[#0A0E1A]">
                  {activeCount}
                </span>
              )}
            </div>
            <span className="text-xs text-slate-400">
              {activeCount} active
            </span>
          </div>
          {triggeredCount > 0 && (
            <div className="flex items-center gap-1 text-xs text-[#FFCC00]">
              <BellRing className="h-3.5 w-3.5" />
              <span>{triggeredCount} triggered</span>
            </div>
          )}
        </div>

        <button
          onClick={onAddAlert}
          className="inline-flex items-center gap-1 rounded-md bg-[#00D4FF]/10 px-2.5 py-1.5 text-[10px] font-medium text-[#00D4FF] transition-colors duration-200 hover:bg-[#00D4FF]/20"
        >
          <Plus className="h-3 w-3" />
          Add Alert
        </button>
      </div>

      {/* Alerts list */}
      {alerts.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No alerts configured"
          description="Set up price or news alerts to stay informed."
          actionLabel="Create Alert"
          onAction={onAddAlert}
        />
      ) : (
        <div className="space-y-2">
          {alerts.map((alert, i) => (
            <AlertItem key={alert.id} alert={alert} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
