"use client";

import { useState, useRef, useMemo } from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Newspaper } from "lucide-react";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface TickerItem {
  id: string;
  type: "price" | "news";
  // Price fields
  symbol?: string;
  price?: number;
  changePercent?: number;
  // News fields
  headline?: string;
  source?: string;
  url?: string;
}

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

const MOCK_TICKER_ITEMS: TickerItem[] = [
  { id: "t1", type: "price", symbol: "BTC", price: 94521.34, changePercent: 1.98 },
  { id: "t2", type: "news", headline: "ECB signals potential rate cut amid slowdown", source: "Reuters", url: "#" },
  { id: "t3", type: "price", symbol: "ETH", price: 3412.87, changePercent: -1.31 },
  { id: "t4", type: "price", symbol: "XAU", price: 2934.5, changePercent: 0.42 },
  { id: "t5", type: "news", headline: "Fed minutes reveal divided rate path views", source: "WSJ", url: "#" },
  { id: "t6", type: "price", symbol: "SPX", price: 5987.32, changePercent: 0.58 },
  { id: "t7", type: "price", symbol: "WTI", price: 72.84, changePercent: -1.66 },
  { id: "t8", type: "news", headline: "China announces $50B AI investment initiative", source: "FT", url: "#" },
  { id: "t9", type: "price", symbol: "DAX", price: 22145.67, changePercent: -0.39 },
  { id: "t10", type: "price", symbol: "EUR/USD", price: 1.0842, changePercent: 0.21 },
  { id: "t11", type: "news", headline: "S&P 500 approaches all-time high on earnings", source: "MarketWatch", url: "#" },
  { id: "t12", type: "news", headline: "Russia-Ukraine ceasefire talks show progress", source: "BBC", url: "#" },
];

// ---------------------------------------------------------------------------
// Components
// ---------------------------------------------------------------------------

function TickerPriceItem({ item }: { item: TickerItem }) {
  const isPositive = (item.changePercent ?? 0) >= 0;

  return (
    <span className="inline-flex items-center gap-2 whitespace-nowrap">
      <span className="font-semibold text-slate-300">{item.symbol}</span>
      <span className="tabular-nums text-slate-100">
        ${item.price?.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </span>
      <span
        className={cn(
          "inline-flex items-center gap-0.5 text-xs font-medium tabular-nums",
          isPositive ? "text-[#00FF88]" : "text-[#FF4444]"
        )}
      >
        {isPositive ? (
          <TrendingUp className="h-3 w-3" />
        ) : (
          <TrendingDown className="h-3 w-3" />
        )}
        {isPositive ? "+" : ""}
        {item.changePercent?.toFixed(2)}%
      </span>
    </span>
  );
}

function TickerNewsItem({ item }: { item: TickerItem }) {
  return (
    <a
      href={item.url || "#"}
      className="inline-flex items-center gap-2 whitespace-nowrap transition-colors duration-200 hover:text-[#00D4FF]"
    >
      <Newspaper className="h-3 w-3 text-[#00D4FF]/60" />
      <span className="text-slate-400">{item.source}:</span>
      <span className="text-slate-200">{item.headline}</span>
    </a>
  );
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

interface LiveTickerProps {
  items?: TickerItem[];
  speed?: number; // pixels per second
}

export function LiveTicker({
  items = MOCK_TICKER_ITEMS,
  speed = 50,
}: LiveTickerProps) {
  const [isPaused, setIsPaused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Duplicate items for seamless loop
  const allItems = useMemo(() => [...items, ...items], [items]);

  // Estimate total width for animation
  const estimatedItemWidth = 320; // average px per item
  const totalWidth = items.length * estimatedItemWidth;
  const duration = totalWidth / speed;

  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden rounded-lg border border-white/[0.04] bg-[#0A0E1A]/80 backdrop-blur-xl"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Fade edges */}
      <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-12 bg-gradient-to-r from-[#0A0E1A] to-transparent" />
      <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-12 bg-gradient-to-l from-[#0A0E1A] to-transparent" />

      <div className="flex items-center py-2.5">
        <motion.div
          className="flex items-center gap-8 text-sm"
          animate={{
            x: isPaused ? undefined : [0, -totalWidth],
          }}
          transition={{
            x: {
              repeat: Infinity,
              repeatType: "loop",
              duration,
              ease: "linear",
            },
          }}
          style={{
            animationPlayState: isPaused ? "paused" : "running",
          }}
        >
          {allItems.map((item, i) => (
            <span key={`${item.id}-${i}`} className="shrink-0">
              {item.type === "price" ? (
                <TickerPriceItem item={item} />
              ) : (
                <TickerNewsItem item={item} />
              )}
            </span>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
