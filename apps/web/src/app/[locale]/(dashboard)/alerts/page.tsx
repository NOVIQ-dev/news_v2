"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { cn, formatCurrency } from "@/lib/utils";
import {
  Bell,
  Plus,
  TrendingUp,
  TrendingDown,
  Newspaper,
  ToggleLeft,
  ToggleRight,
  Trash2,
  Edit3,
  AlertTriangle,
  CheckCircle2,
  XCircle,
} from "lucide-react";

interface AlertItem {
  id: string;
  type: "price" | "news";
  asset?: string;
  condition?: "above" | "below";
  targetPrice?: number;
  currentPrice?: number;
  keywords?: string[];
  active: boolean;
  triggered: boolean;
  createdAt: string;
  triggeredAt?: string;
}

const MOCK_ALERTS: AlertItem[] = [
  {
    id: "1",
    type: "price",
    asset: "BTC",
    condition: "above",
    targetPrice: 70000,
    currentPrice: 67432.18,
    active: true,
    triggered: false,
    createdAt: "2025-03-01T10:00:00Z",
  },
  {
    id: "2",
    type: "price",
    asset: "ETH",
    condition: "below",
    targetPrice: 3500,
    currentPrice: 3891.42,
    active: true,
    triggered: false,
    createdAt: "2025-02-28T15:00:00Z",
  },
  {
    id: "3",
    type: "news",
    keywords: ["sanctions", "energy", "EU"],
    active: true,
    triggered: true,
    createdAt: "2025-02-25T09:00:00Z",
    triggeredAt: "2025-03-02T14:22:00Z",
  },
  {
    id: "4",
    type: "price",
    asset: "XAU",
    condition: "above",
    targetPrice: 2400,
    currentPrice: 2341.5,
    active: false,
    triggered: false,
    createdAt: "2025-02-20T11:00:00Z",
  },
  {
    id: "5",
    type: "news",
    keywords: ["Federal Reserve", "rate cut"],
    active: true,
    triggered: true,
    createdAt: "2025-02-18T08:00:00Z",
    triggeredAt: "2025-03-01T18:45:00Z",
  },
];

export default function AlertsPage() {
  const t = useTranslations("alerts");

  const [filter, setFilter] = useState<"all" | "active" | "triggered">("all");

  const filteredAlerts = MOCK_ALERTS.filter((alert) => {
    if (filter === "active") return alert.active && !alert.triggered;
    if (filter === "triggered") return alert.triggered;
    return true;
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
        <button className="flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-background hover:bg-accent-dim transition-colors">
          <Plus className="h-4 w-4" />
          {t("createAlert")}
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="glass rounded-xl p-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-positive/10">
            <CheckCircle2 className="h-5 w-5 text-positive" />
          </div>
          <div>
            <p className="text-2xl font-bold text-text-primary font-mono">
              {MOCK_ALERTS.filter((a) => a.active).length}
            </p>
            <p className="text-xs text-text-secondary">{t("active")}</p>
          </div>
        </div>
        <div className="glass rounded-xl p-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
            <AlertTriangle className="h-5 w-5 text-warning" />
          </div>
          <div>
            <p className="text-2xl font-bold text-text-primary font-mono">
              {MOCK_ALERTS.filter((a) => a.triggered).length}
            </p>
            <p className="text-xs text-text-secondary">{t("triggered")}</p>
          </div>
        </div>
        <div className="glass rounded-xl p-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-light">
            <XCircle className="h-5 w-5 text-text-muted" />
          </div>
          <div>
            <p className="text-2xl font-bold text-text-primary font-mono">
              {MOCK_ALERTS.filter((a) => !a.active).length}
            </p>
            <p className="text-xs text-text-secondary">{t("inactive")}</p>
          </div>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 border-b border-border">
        {(["all", "active", "triggered"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "border-b-2 px-4 py-2 text-sm font-medium transition-colors",
              filter === f
                ? "border-accent text-accent"
                : "border-transparent text-text-secondary hover:text-text-primary"
            )}
          >
            {f === "all"
              ? `All (${MOCK_ALERTS.length})`
              : f === "active"
              ? `${t("active")} (${MOCK_ALERTS.filter((a) => a.active && !a.triggered).length})`
              : `${t("triggered")} (${MOCK_ALERTS.filter((a) => a.triggered).length})`}
          </button>
        ))}
      </div>

      {/* Alerts list */}
      {filteredAlerts.length === 0 ? (
        <div className="glass flex items-center justify-center rounded-xl p-20">
          <div className="text-center">
            <Bell className="mx-auto h-10 w-10 text-text-muted mb-3" />
            <p className="text-sm text-text-secondary">{t("noAlerts")}</p>
            <button className="mt-4 flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-background hover:bg-accent-dim transition-colors mx-auto">
              <Plus className="h-4 w-4" />
              {t("createAlert")}
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              className={cn(
                "glass rounded-xl p-4 transition-all",
                alert.triggered && "border-warning/30",
                !alert.active && "opacity-60"
              )}
            >
              <div className="flex items-center gap-4">
                {/* Icon */}
                <div
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                    alert.type === "price"
                      ? "bg-accent/10"
                      : "bg-info/10"
                  )}
                >
                  {alert.type === "price" ? (
                    alert.condition === "above" ? (
                      <TrendingUp className="h-5 w-5 text-accent" />
                    ) : (
                      <TrendingDown className="h-5 w-5 text-accent" />
                    )
                  ) : (
                    <Newspaper className="h-5 w-5 text-info" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={cn(
                        "rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
                        alert.type === "price"
                          ? "bg-accent/10 text-accent"
                          : "bg-info/10 text-info"
                      )}
                    >
                      {alert.type === "price"
                        ? t("priceAlert")
                        : t("newsAlert")}
                    </span>
                    {alert.triggered && (
                      <span className="flex items-center gap-1 rounded-md bg-warning/10 px-2 py-0.5 text-[10px] font-semibold text-warning uppercase tracking-wider">
                        <AlertTriangle className="h-2.5 w-2.5" />
                        {t("triggered")}
                      </span>
                    )}
                  </div>

                  {alert.type === "price" ? (
                    <p className="text-sm text-text-primary">
                      <span className="font-mono font-bold">{alert.asset}</span>{" "}
                      {alert.condition === "above"
                        ? t("above")
                        : t("below")}{" "}
                      <span className="font-mono font-bold text-accent">
                        {formatCurrency(alert.targetPrice || 0)}
                      </span>
                      {alert.currentPrice && (
                        <span className="text-text-muted ml-2">
                          (now: {formatCurrency(alert.currentPrice)})
                        </span>
                      )}
                    </p>
                  ) : (
                    <p className="text-sm text-text-primary">
                      {t("keywords")}:{" "}
                      {alert.keywords?.map((kw) => (
                        <span
                          key={kw}
                          className="ml-1 inline-block rounded bg-surface-light px-1.5 py-0.5 text-xs font-mono text-text-secondary"
                        >
                          {kw}
                        </span>
                      ))}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    className={cn(
                      "transition-colors",
                      alert.active
                        ? "text-positive hover:text-positive-dim"
                        : "text-text-muted hover:text-text-secondary"
                    )}
                  >
                    {alert.active ? (
                      <ToggleRight className="h-6 w-6" />
                    ) : (
                      <ToggleLeft className="h-6 w-6" />
                    )}
                  </button>
                  <button className="rounded-lg p-1.5 text-text-muted hover:bg-surface-hover hover:text-text-secondary transition-colors">
                    <Edit3 className="h-4 w-4" />
                  </button>
                  <button className="rounded-lg p-1.5 text-text-muted hover:bg-negative/10 hover:text-negative transition-colors">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
