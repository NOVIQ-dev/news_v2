"use client";

import { useState, useCallback, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useVirtualizer } from "@tanstack/react-virtual";
import {
  ChevronDown,
  ChevronUp,
  Sparkles,
  ExternalLink,
  Clock,
  Globe,
  Tag,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton, ListSkeleton } from "@/components/common/loading-skeleton";
import { EmptyState } from "@/components/common/empty-state";
import type { NewsArticle, NewsRegion, NewsSentiment, NewsTag } from "@fintelligence/shared";

// ---------------------------------------------------------------------------
// Mock data factory (avoids hydration mismatch from Date.now() at module scope)
// ---------------------------------------------------------------------------

function createMockNews(): NewsArticle[] {
  const now = Date.now();
  return [
    {
      id: "n1",
      title: "ECB Signals Potential Rate Cut Amid Slowing Eurozone Growth",
      summary: "The European Central Bank hinted at a possible interest rate reduction in Q2 as inflation pressures ease and economic growth in the eurozone continues to decelerate.",
      body: "",
      source: "Reuters",
      sourceUrl: "https://reuters.com",
      region: "EUROPE" as NewsRegion,
      additionalRegions: [],
      tags: ["ENERGY" as NewsTag],
      sentiment: "negative" as NewsSentiment,
      sentimentScore: 0.72,
      relatedAssets: ["EUR/USD", "DAX"],
      publishedAt: new Date(now - 12 * 60000).toISOString(),
      createdAt: new Date(now - 12 * 60000).toISOString(),
    },
    {
      id: "n2",
      title: "Bitcoin Surges Past $94K as Institutional Demand Accelerates",
      summary: "Bitcoin reached a new monthly high, driven by increased ETF inflows and corporate treasury allocations. Analysts predict continued upward momentum.",
      body: "",
      source: "Bloomberg",
      sourceUrl: "https://bloomberg.com",
      region: "AMERICAS" as NewsRegion,
      additionalRegions: [],
      tags: ["TRADE" as NewsTag],
      sentiment: "positive" as NewsSentiment,
      sentimentScore: 0.85,
      relatedAssets: ["BTC", "ETH"],
      publishedAt: new Date(now - 34 * 60000).toISOString(),
      createdAt: new Date(now - 34 * 60000).toISOString(),
    },
    {
      id: "n3",
      title: "Oil Prices Drop on Increased OPEC+ Production Expectations",
      summary: "Crude oil fell as markets priced in higher production quotas from OPEC+ nations starting next month.",
      body: "",
      source: "CNBC",
      sourceUrl: "https://cnbc.com",
      region: "MIDDLE_EAST" as NewsRegion,
      additionalRegions: [],
      tags: ["ENERGY" as NewsTag],
      sentiment: "negative" as NewsSentiment,
      sentimentScore: 0.68,
      relatedAssets: ["WTI"],
      publishedAt: new Date(now - 58 * 60000).toISOString(),
      createdAt: new Date(now - 58 * 60000).toISOString(),
    },
    {
      id: "n4",
      title: "Fed Minutes Reveal Divided Views on Future Rate Path",
      summary: "Federal Reserve officials showed disagreement on the pace of future interest rate adjustments, with some favoring a more cautious approach.",
      body: "",
      source: "WSJ",
      sourceUrl: "https://wsj.com",
      region: "AMERICAS" as NewsRegion,
      additionalRegions: [],
      tags: ["TRADE" as NewsTag],
      sentiment: "neutral" as NewsSentiment,
      sentimentScore: 0.51,
      relatedAssets: ["SPX", "EUR/USD"],
      publishedAt: new Date(now - 2 * 3600000).toISOString(),
      createdAt: new Date(now - 2 * 3600000).toISOString(),
    },
    {
      id: "n5",
      title: "China Tech Stocks Rally on New AI Investment Plans",
      summary: "Major Chinese technology companies surged after Beijing announced a $50B initiative to accelerate domestic AI development and semiconductor production.",
      body: "",
      source: "FT",
      sourceUrl: "https://ft.com",
      region: "ASIA" as NewsRegion,
      additionalRegions: [],
      tags: ["TRADE" as NewsTag],
      sentiment: "positive" as NewsSentiment,
      sentimentScore: 0.79,
      relatedAssets: [],
      publishedAt: new Date(now - 3 * 3600000).toISOString(),
      createdAt: new Date(now - 3 * 3600000).toISOString(),
    },
    {
      id: "n6",
      title: "Gold Holds Steady as Geopolitical Tensions Support Safe Haven Demand",
      summary: "Gold prices remained elevated as ongoing geopolitical uncertainties in Eastern Europe and the Middle East continued to drive safe-haven buying.",
      body: "",
      source: "Reuters",
      sourceUrl: "https://reuters.com",
      region: "EUROPE" as NewsRegion,
      additionalRegions: ["MIDDLE_EAST" as NewsRegion],
      tags: ["WAR" as NewsTag, "SANCTIONS" as NewsTag],
      sentiment: "neutral" as NewsSentiment,
      sentimentScore: 0.55,
      relatedAssets: ["XAU"],
      publishedAt: new Date(now - 4 * 3600000).toISOString(),
      createdAt: new Date(now - 4 * 3600000).toISOString(),
    },
    {
      id: "n7",
      title: "DAX Drops as German Manufacturing PMI Disappoints",
      summary: "Germany's manufacturing PMI came in below expectations, weighing on the DAX index and raising concerns about the country's industrial recovery.",
      body: "",
      source: "Bloomberg",
      sourceUrl: "https://bloomberg.com",
      region: "EUROPE" as NewsRegion,
      additionalRegions: [],
      tags: ["TRADE" as NewsTag],
      sentiment: "negative" as NewsSentiment,
      sentimentScore: 0.74,
      relatedAssets: ["DAX"],
      publishedAt: new Date(now - 5 * 3600000).toISOString(),
      createdAt: new Date(now - 5 * 3600000).toISOString(),
    },
    {
      id: "n8",
      title: "Ethereum Layer 2 Adoption Hits Record Highs",
      summary: "Transaction volumes on Ethereum Layer 2 networks surpassed $15B this week, signaling growing adoption of scalability solutions.",
      body: "",
      source: "CoinDesk",
      sourceUrl: "https://coindesk.com",
      region: "AMERICAS" as NewsRegion,
      additionalRegions: [],
      tags: ["TRADE" as NewsTag],
      sentiment: "positive" as NewsSentiment,
      sentimentScore: 0.81,
      relatedAssets: ["ETH"],
      publishedAt: new Date(now - 6 * 3600000).toISOString(),
      createdAt: new Date(now - 6 * 3600000).toISOString(),
    },
    {
      id: "n9",
      title: "Russia-Ukraine Ceasefire Negotiations Show Progress",
      summary: "Diplomatic sources report cautious optimism as both sides agree to a framework for continued peace talks, though significant differences remain.",
      body: "",
      source: "BBC",
      sourceUrl: "https://bbc.com",
      region: "CIS" as NewsRegion,
      additionalRegions: ["EUROPE" as NewsRegion],
      tags: ["WAR" as NewsTag],
      sentiment: "positive" as NewsSentiment,
      sentimentScore: 0.62,
      relatedAssets: ["XAU", "WTI"],
      publishedAt: new Date(now - 7 * 3600000).toISOString(),
      createdAt: new Date(now - 7 * 3600000).toISOString(),
    },
    {
      id: "n10",
      title: "S&P 500 Approaches All-Time High on Strong Earnings Season",
      summary: "The S&P 500 is within striking distance of its record high as Q4 corporate earnings have broadly exceeded analyst expectations.",
      body: "",
      source: "MarketWatch",
      sourceUrl: "https://marketwatch.com",
      region: "AMERICAS" as NewsRegion,
      additionalRegions: [],
      tags: ["TRADE" as NewsTag],
      sentiment: "positive" as NewsSentiment,
      sentimentScore: 0.88,
      relatedAssets: ["SPX"],
      publishedAt: new Date(now - 8 * 3600000).toISOString(),
      createdAt: new Date(now - 8 * 3600000).toISOString(),
    },
  ];
}

const REGIONS = ["global", "europe", "middleEast", "asia", "americas", "cis"] as const;
const TAGS = ["war", "sanctions", "energy", "elections", "trade"] as const;

const REGION_MAP: Record<string, string> = {
  global: "GLOBAL",
  europe: "EUROPE",
  middleEast: "MIDDLE_EAST",
  asia: "ASIA",
  americas: "AMERICAS",
  cis: "CIS",
};

const TAG_MAP: Record<string, string> = {
  war: "WAR",
  sanctions: "SANCTIONS",
  energy: "ENERGY",
  elections: "ELECTIONS",
  trade: "TRADE",
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

const REGION_LABELS: Record<string, string> = {
  EUROPE: "EU",
  MIDDLE_EAST: "ME",
  ASIA: "Asia",
  AMERICAS: "US",
  CIS: "CIS",
};

const SENTIMENT_COLORS: Record<string, string> = {
  positive: "text-[#00FF88]",
  negative: "text-[#FF4444]",
  neutral: "text-slate-400",
};

// ---------------------------------------------------------------------------
// Components
// ---------------------------------------------------------------------------

interface NewsItemProps {
  article: NewsArticle;
  index: number;
}

function NewsItem({ article, index }: NewsItemProps) {
  const [summarizing, setSummarizing] = useState(false);
  const [aiSummary, setAiSummary] = useState<string | null>(null);

  const handleSummarize = useCallback(() => {
    setSummarizing(true);
    setTimeout(() => {
      setAiSummary(article.summary);
      setSummarizing(false);
    }, 1500);
  }, [article.summary]);

  const handleOpenSource = useCallback(() => {
    if (article.sourceUrl) {
      window.open(article.sourceUrl, "_blank", "noopener");
    }
  }, [article.sourceUrl]);

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.04, 0.4) }}
      className="group border-b border-white/[0.04] last:border-b-0 cursor-pointer"
      onClick={handleOpenSource}
    >
      <div className="flex w-full items-start gap-3 px-1 py-3 text-left transition-colors duration-200 hover:bg-white/[0.02]">
        <div className="flex flex-1 flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <span className="inline-flex shrink-0 items-center rounded bg-white/[0.06] px-1.5 py-0.5 text-[10px] font-medium text-slate-400">
              {article.source}
            </span>
            <span className="inline-flex shrink-0 items-center rounded bg-[#00D4FF]/10 px-1.5 py-0.5 text-[10px] font-medium text-[#00D4FF]">
              {REGION_LABELS[article.region] || article.region}
            </span>
          </div>
          <p className="text-sm font-medium leading-snug text-slate-200 transition-colors duration-200 group-hover:text-white">
            {article.title}
          </p>
          <p className="text-xs leading-relaxed text-slate-400 line-clamp-2">
            {article.summary}
          </p>
          <div className="flex items-center gap-2 text-[10px] text-slate-500">
            <Clock className="h-3 w-3" />
            <span>{timeAgo(article.publishedAt)}</span>
            <span className={SENTIMENT_COLORS[article.sentiment]}>
              {article.sentiment}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleSummarize();
              }}
              disabled={summarizing || !!aiSummary}
              className="inline-flex items-center gap-1.5 rounded-md bg-[#00D4FF]/10 px-2.5 py-1.5 text-[10px] font-medium text-[#00D4FF] transition-colors duration-200 hover:bg-[#00D4FF]/20 disabled:opacity-50"
            >
              <Sparkles className="h-3 w-3" />
              {summarizing ? "Summarizing..." : aiSummary ? "Summarized" : "AI Summarize"}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleOpenSource();
              }}
              className="inline-flex items-center gap-1 rounded-md bg-white/5 px-2.5 py-1.5 text-[10px] font-medium text-slate-400 transition-colors duration-200 hover:bg-white/10 hover:text-slate-200"
            >
              <ExternalLink className="h-3 w-3" />
              Read More
            </button>
          </div>
          {aiSummary && (
            <div className="rounded-lg border border-[#00D4FF]/20 bg-[#00D4FF]/5 p-3 mt-1">
              <p className="mb-1 text-[10px] font-semibold text-[#00D4FF]">
                AI Summary
              </p>
              <p className="text-xs leading-relaxed text-slate-300">
                {aiSummary}
              </p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

interface NewsFeedWidgetProps {
  articles?: NewsArticle[];
  isLoading?: boolean;
}

export function NewsFeedWidget({
  articles: externalArticles,
  isLoading = false,
}: NewsFeedWidgetProps) {
  const [mockArticles] = useState(createMockNews);
  const articles = externalArticles ?? mockArticles;

  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const parentRef = useRef<HTMLDivElement>(null);

  const filteredArticles = useMemo(() => {
    return articles.filter((article) => {
      if (selectedRegion && selectedRegion !== "global") {
        const regionKey = REGION_MAP[selectedRegion];
        if (regionKey && article.region !== regionKey) return false;
      }
      if (selectedTag) {
        const tagKey = TAG_MAP[selectedTag];
        if (tagKey && !article.tags?.includes(tagKey as NewsTag)) return false;
      }
      return true;
    });
  }, [articles, selectedRegion, selectedTag]);

  const virtualizer = useVirtualizer({
    count: filteredArticles.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 160,
    overscan: 5,
  });

  if (isLoading) {
    return (
      <div className="p-4">
        <ListSkeleton rows={6} />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Region filter chips */}
      <div className="flex flex-wrap items-center gap-1.5 px-2">
        <Globe className="h-3.5 w-3.5 text-slate-500" />
        {REGIONS.map((region) => (
          <button
            key={region}
            onClick={() => setSelectedRegion(selectedRegion === region ? null : region)}
            className={cn(
              "rounded-md px-2 py-1 text-[10px] font-medium transition-colors",
              selectedRegion === region
                ? "bg-[#00D4FF]/10 text-[#00D4FF] ring-1 ring-[#00D4FF]/30"
                : "bg-white/[0.04] text-slate-400 hover:bg-white/[0.08]"
            )}
          >
            {region === "global" ? "Global" : region === "middleEast" ? "Middle East" : region.charAt(0).toUpperCase() + region.slice(1)}
          </button>
        ))}
      </div>

      {/* Tag filter chips */}
      <div className="flex flex-wrap items-center gap-1.5 px-2">
        <Tag className="h-3.5 w-3.5 text-slate-500" />
        {TAGS.map((tag) => (
          <button
            key={tag}
            onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
            className={cn(
              "rounded-md px-2 py-1 text-[10px] font-medium transition-colors",
              selectedTag === tag
                ? "bg-[#00D4FF]/10 text-[#00D4FF] ring-1 ring-[#00D4FF]/30"
                : "bg-white/[0.04] text-slate-400 hover:bg-white/[0.08]"
            )}
          >
            {tag.charAt(0).toUpperCase() + tag.slice(1)}
          </button>
        ))}
      </div>

      {/* Virtualized article list */}
      {filteredArticles.length === 0 ? (
        <EmptyState title="No news yet" description="News articles will appear here as they come in." />
      ) : (
        <div ref={parentRef} className="h-[480px] overflow-y-auto px-2">
          <div
            style={{ height: `${virtualizer.getTotalSize()}px`, width: "100%", position: "relative" }}
          >
            {virtualizer.getVirtualItems().map((virtualItem) => (
              <div
                key={virtualItem.key}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  transform: `translateY(${virtualItem.start}px)`,
                }}
                data-index={virtualItem.index}
                ref={virtualizer.measureElement}
              >
                <NewsItem
                  article={filteredArticles[virtualItem.index]!}
                  index={virtualItem.index}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
