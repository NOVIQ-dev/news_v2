"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { cn, formatCurrency, formatPercentage } from "@/lib/utils";
import {
  Briefcase,
  Plus,
  Download,
  FileText,
  TrendingUp,
  TrendingDown,
  PieChart,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

const MOCK_HOLDINGS = [
  {
    id: "1",
    symbol: "BTC",
    name: "Bitcoin",
    amount: 1.5,
    buyPrice: 52000,
    currentPrice: 67432.18,
    pnl: 23148.27,
    pnlPercent: 29.67,
    allocation: 42.3,
  },
  {
    id: "2",
    symbol: "ETH",
    name: "Ethereum",
    amount: 12.0,
    buyPrice: 3200,
    currentPrice: 3891.42,
    pnl: 8297.04,
    pnlPercent: 21.61,
    allocation: 19.5,
  },
  {
    id: "3",
    symbol: "SOL",
    name: "Solana",
    amount: 100.0,
    buyPrice: 98.0,
    currentPrice: 142.18,
    pnl: 4418.0,
    pnlPercent: 45.08,
    allocation: 5.9,
  },
  {
    id: "4",
    symbol: "XAU",
    name: "Gold",
    amount: 10.0,
    buyPrice: 2200.0,
    currentPrice: 2341.5,
    pnl: 1415.0,
    pnlPercent: 6.43,
    allocation: 9.8,
  },
  {
    id: "5",
    symbol: "SPX",
    name: "S&P 500 ETF",
    amount: 20.0,
    buyPrice: 480.0,
    currentPrice: 523.42,
    pnl: 868.4,
    pnlPercent: 9.05,
    allocation: 4.4,
  },
];

const TOTAL_VALUE = 239145.82;
const TOTAL_PNL = 38146.71;
const TOTAL_PNL_PERCENT = 18.97;

// Allocation bar
function AllocationBar({
  holdings,
}: {
  holdings: typeof MOCK_HOLDINGS;
}) {
  const colors = [
    "bg-accent",
    "bg-info",
    "bg-positive",
    "bg-warning",
    "bg-negative",
    "bg-text-muted",
  ];

  return (
    <div className="space-y-3">
      <div className="flex h-3 overflow-hidden rounded-full bg-surface-light">
        {holdings.map((h, i) => (
          <div
            key={h.id}
            className={cn("h-full transition-all", colors[i % colors.length])}
            style={{ width: `${h.allocation}%` }}
          />
        ))}
        <div
          className="h-full bg-surface-hover"
          style={{
            width: `${100 - holdings.reduce((s, h) => s + h.allocation, 0)}%`,
          }}
        />
      </div>
      <div className="flex flex-wrap gap-3">
        {holdings.map((h, i) => (
          <div key={h.id} className="flex items-center gap-1.5">
            <div
              className={cn(
                "h-2.5 w-2.5 rounded-full",
                colors[i % colors.length]
              )}
            />
            <span className="text-xs text-text-secondary">
              {h.symbol} {h.allocation}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function PortfolioPage() {
  const t = useTranslations("portfolio");
  const [activeTab, setActiveTab] = useState<"holdings" | "transactions">(
    "holdings"
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
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm text-text-secondary hover:bg-surface-hover transition-colors">
            <Download className="h-3.5 w-3.5" />
            {t("exportCsv")}
          </button>
          <button className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm text-text-secondary hover:bg-surface-hover transition-colors">
            <FileText className="h-3.5 w-3.5" />
            {t("exportPdf")}
          </button>
          <button className="flex items-center gap-2 rounded-lg bg-accent px-3 py-2 text-sm font-medium text-background hover:bg-accent-dim transition-colors">
            <Plus className="h-3.5 w-3.5" />
            {t("addAsset")}
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="glass rounded-xl p-5">
          <p className="text-sm text-text-secondary">{t("totalValue")}</p>
          <p className="mt-1 text-2xl font-bold font-mono text-text-primary">
            {formatCurrency(TOTAL_VALUE)}
          </p>
        </div>
        <div className="glass rounded-xl p-5">
          <p className="text-sm text-text-secondary">{t("totalPnL")}</p>
          <div className="mt-1 flex items-center gap-2">
            <p className="text-2xl font-bold font-mono text-positive">
              {formatCurrency(TOTAL_PNL)}
            </p>
            <span className="flex items-center gap-0.5 rounded-md bg-positive/10 px-2 py-0.5 text-xs font-medium text-positive font-mono">
              <ArrowUpRight className="h-3 w-3" />
              {formatPercentage(TOTAL_PNL_PERCENT)}
            </span>
          </div>
        </div>
        <div className="glass rounded-xl p-5">
          <p className="mb-3 text-sm text-text-secondary">{t("allocation")}</p>
          <AllocationBar holdings={MOCK_HOLDINGS} />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border">
        <button
          onClick={() => setActiveTab("holdings")}
          className={cn(
            "border-b-2 px-4 py-2 text-sm font-medium transition-colors",
            activeTab === "holdings"
              ? "border-accent text-accent"
              : "border-transparent text-text-secondary hover:text-text-primary"
          )}
        >
          {t("holdings")}
        </button>
        <button
          onClick={() => setActiveTab("transactions")}
          className={cn(
            "border-b-2 px-4 py-2 text-sm font-medium transition-colors",
            activeTab === "transactions"
              ? "border-accent text-accent"
              : "border-transparent text-text-secondary hover:text-text-primary"
          )}
        >
          {t("transactions")}
        </button>
      </div>

      {/* Holdings table */}
      {activeTab === "holdings" && (
        <div className="glass overflow-hidden rounded-xl">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">
                    {t("symbol")}
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-text-muted uppercase tracking-wider">
                    {t("amount")}
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-text-muted uppercase tracking-wider">
                    {t("buyPrice")}
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-text-muted uppercase tracking-wider">
                    {t("currentPrice")}
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-text-muted uppercase tracking-wider">
                    {t("pnl")}
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-text-muted uppercase tracking-wider">
                    {t("allocation")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {MOCK_HOLDINGS.map((holding) => (
                  <tr
                    key={holding.id}
                    className="border-b border-border/50 transition-colors hover:bg-surface-hover"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/5 text-xs font-bold text-accent font-mono">
                          {holding.symbol.slice(0, 3)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-text-primary">
                            {holding.symbol}
                          </p>
                          <p className="text-xs text-text-muted">
                            {holding.name}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-sm text-text-primary">
                      {holding.amount}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-sm text-text-secondary">
                      {formatCurrency(holding.buyPrice)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-sm text-text-primary">
                      {formatCurrency(holding.currentPrice)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div>
                        <span
                          className={cn(
                            "font-mono text-sm font-medium",
                            holding.pnl >= 0
                              ? "text-positive"
                              : "text-negative"
                          )}
                        >
                          {holding.pnl >= 0 ? "+" : ""}
                          {formatCurrency(holding.pnl)}
                        </span>
                        <p
                          className={cn(
                            "text-xs font-mono",
                            holding.pnlPercent >= 0
                              ? "text-positive"
                              : "text-negative"
                          )}
                        >
                          {formatPercentage(holding.pnlPercent)}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="h-1.5 w-16 rounded-full bg-surface-light">
                          <div
                            className="h-full rounded-full bg-accent"
                            style={{ width: `${holding.allocation}%` }}
                          />
                        </div>
                        <span className="font-mono text-xs text-text-secondary">
                          {holding.allocation}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Transactions tab placeholder */}
      {activeTab === "transactions" && (
        <div className="glass flex items-center justify-center rounded-xl p-20">
          <div className="text-center">
            <BarChart3 className="mx-auto h-10 w-10 text-text-muted mb-3" />
            <p className="text-sm text-text-secondary">
              {t("noHoldings")}
            </p>
            <button className="mt-4 flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-background hover:bg-accent-dim transition-colors mx-auto">
              <Plus className="h-4 w-4" />
              {t("addTransaction")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
