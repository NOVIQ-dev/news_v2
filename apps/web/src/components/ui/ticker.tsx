"use client";

import { useEffect, useState, useRef } from "react";
import { useTranslations } from "next-intl";
import { connectSocket, type TickerItem } from "@/lib/socket";
import { useUiStore } from "@/stores/ui";
import { cn } from "@/lib/utils";
import { Radio } from "lucide-react";

const MOCK_TICKER_ITEMS: TickerItem[] = [
  {
    type: "market",
    text: "BTC $67,432.18 +2.4%",
    sentiment: "positive",
    timestamp: new Date().toISOString(),
  },
  {
    type: "market",
    text: "ETH $3,891.42 +1.8%",
    sentiment: "positive",
    timestamp: new Date().toISOString(),
  },
  {
    type: "news",
    text: "Federal Reserve holds interest rates steady at 5.25-5.50%",
    sentiment: "neutral",
    timestamp: new Date().toISOString(),
  },
  {
    type: "market",
    text: "Gold $2,341.50 -0.3%",
    sentiment: "negative",
    timestamp: new Date().toISOString(),
  },
  {
    type: "news",
    text: "EU announces new energy diversification strategy for 2025",
    sentiment: "positive",
    timestamp: new Date().toISOString(),
  },
  {
    type: "market",
    text: "S&P 500 5,234.18 +0.7%",
    sentiment: "positive",
    timestamp: new Date().toISOString(),
  },
  {
    type: "news",
    text: "OPEC+ extends production cuts through Q2",
    sentiment: "negative",
    timestamp: new Date().toISOString(),
  },
  {
    type: "market",
    text: "EUR/USD 1.0842 -0.12%",
    sentiment: "negative",
    timestamp: new Date().toISOString(),
  },
];

export function LiveTicker() {
  const t = useTranslations("ticker");
  const [items, setItems] = useState<TickerItem[]>(MOCK_TICKER_ITEMS);
  const tickerPaused = useUiStore((s) => s.tickerPaused);
  const setTickerPaused = useUiStore((s) => s.setTickerPaused);

  useEffect(() => {
    const socket = connectSocket();

    socket.on("ticker:update", (item: TickerItem) => {
      setItems((prev) => [...prev.slice(-20), item]);
    });

    return () => {
      socket.off("ticker:update");
    };
  }, []);

  const sentimentColor = (sentiment?: string) => {
    switch (sentiment) {
      case "positive":
        return "text-positive";
      case "negative":
        return "text-negative";
      default:
        return "text-text-secondary";
    }
  };

  return (
    <div
      className="relative flex h-8 items-center overflow-hidden border-b border-border bg-surface/80 backdrop-blur-sm"
      onMouseEnter={() => setTickerPaused(true)}
      onMouseLeave={() => setTickerPaused(false)}
    >
      {/* LIVE badge */}
      <div className="z-10 flex shrink-0 items-center gap-1.5 border-r border-border bg-surface px-3">
        <Radio className="h-3 w-3 text-negative animate-pulse-dot" />
        <span className="text-[10px] font-bold tracking-wider text-negative">
          {t("live")}
        </span>
      </div>

      {/* Scrolling content */}
      <div className="flex overflow-hidden">
        <div
          className={cn(
            "flex shrink-0 items-center gap-6 px-4",
            !tickerPaused && "animate-ticker"
          )}
        >
          {[...items, ...items].map((item, idx) => (
            <div
              key={idx}
              className="flex shrink-0 items-center gap-2 text-xs"
            >
              <span
                className={cn(
                  "rounded px-1.5 py-0.5 text-[9px] font-bold tracking-wider",
                  item.type === "news"
                    ? "bg-info/10 text-info"
                    : "bg-accent/10 text-accent"
                )}
              >
                {item.type === "news"
                  ? t("breakingNews")
                  : t("marketUpdate")}
              </span>
              <span className={sentimentColor(item.sentiment)}>
                {item.text}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Fade edges */}
      <div className="pointer-events-none absolute left-[72px] top-0 h-full w-8 bg-gradient-to-r from-surface/80 to-transparent" />
      <div className="pointer-events-none absolute right-0 top-0 h-full w-8 bg-gradient-to-l from-surface/80 to-transparent" />
    </div>
  );
}
