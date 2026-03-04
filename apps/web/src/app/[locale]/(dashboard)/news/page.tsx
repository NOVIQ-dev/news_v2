"use client";

import { useState, useRef, useCallback, useMemo, Suspense } from "react";
import { useTranslations } from "next-intl";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useNews } from "@/hooks/use-news";
import { cn, formatRelativeTime } from "@/lib/utils";
import {
  Search,
  Globe,
  Tag,
  Sparkles,
  ExternalLink,
  Clock,
  Loader2,
  TrendingUp,
} from "lucide-react";
import { ListSkeleton } from "@/components/common/loading-skeleton";

const REGIONS = ["global", "europe", "middleEast", "asia", "americas", "cis"] as const;
const TAGS = ["war", "sanctions", "energy", "elections", "trade"] as const;

const REGION_KEY_MAP: Record<string, string> = {
  europe: "europe",
  middleEast: "middleEast",
  asia: "asia",
  americas: "americas",
  cis: "cis",
  global: "global",
};

function createMockArticles() {
  const now = Date.now();
  return [
    {
      id: "1",
      title: "Federal Reserve signals potential rate adjustments amid economic uncertainty",
      summary: "The Federal Reserve has indicated it may adjust interest rates in the coming months as economic indicators show mixed signals about the direction of the US economy.",
      content: "",
      source: "Reuters",
      url: "https://reuters.com",
      imageUrl: undefined,
      publishedAt: new Date(now - 2 * 3600000).toISOString(),
      region: "americas",
      tags: ["trade"],
      sentiment: "positive" as const,
    },
    {
      id: "2",
      title: "EU expands sanctions framework with new energy sector restrictions",
      summary: "The European Union has adopted a comprehensive new sanctions package targeting energy infrastructure and financial flows.",
      content: "",
      source: "Bloomberg",
      url: "https://bloomberg.com",
      publishedAt: new Date(now - 5 * 3600000).toISOString(),
      region: "europe",
      tags: ["sanctions", "energy"],
      sentiment: "negative" as const,
    },
    {
      id: "3",
      title: "Asian markets rally on positive trade data from China",
      summary: "Stock markets across Asia posted significant gains following better-than-expected trade figures from China.",
      content: "",
      source: "Financial Times",
      url: "https://ft.com",
      publishedAt: new Date(now - 8 * 3600000).toISOString(),
      region: "asia",
      tags: ["trade"],
      sentiment: "positive" as const,
    },
    {
      id: "4",
      title: "OPEC+ weighs production strategy amid volatile oil prices",
      summary: "OPEC+ members are deliberating on production levels as crude oil prices continue to fluctuate based on geopolitical developments.",
      content: "",
      source: "Al Jazeera",
      url: "https://aljazeera.com",
      publishedAt: new Date(now - 12 * 3600000).toISOString(),
      region: "middleEast",
      tags: ["energy"],
      sentiment: "neutral" as const,
    },
    {
      id: "5",
      title: "CIS economic integration talks progress with new trade agreements",
      summary: "Member states of the CIS have reached preliminary agreements on enhanced trade cooperation and reduced tariffs.",
      content: "",
      source: "TASS",
      url: "https://tass.com",
      publishedAt: new Date(now - 18 * 3600000).toISOString(),
      region: "cis",
      tags: ["trade"],
      sentiment: "positive" as const,
    },
  ];
}

function NewsPageContent() {
  const t = useTranslations("news");
  const tCommon = useTranslations("common");

  const [selectedRegion, setSelectedRegion] = useState<string | undefined>();
  const [selectedTag, setSelectedTag] = useState<string | undefined>();
  const [searchQuery, setSearchQuery] = useState("");
  const [mockArticles] = useState(createMockArticles);
  const parentRef = useRef<HTMLDivElement>(null);

  const {
    articles,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useNews({
    region: selectedRegion === "global" ? undefined : selectedRegion,
    tag: selectedTag,
    search: searchQuery || undefined,
  });

  // Intersection observer for infinite scroll
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (isFetchingNextPage) return;
      if (observerRef.current) observerRef.current.disconnect();

      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0]?.isIntersecting && hasNextPage) {
          fetchNextPage();
        }
      });

      if (node) observerRef.current.observe(node);
    },
    [isFetchingNextPage, hasNextPage, fetchNextPage]
  );

  const sentimentBadge = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return "bg-positive/10 text-positive";
      case "negative":
        return "bg-negative/10 text-negative";
      default:
        return "bg-surface-light text-text-muted";
    }
  };

  const displayArticles = articles.length > 0 ? articles : mockArticles;

  const filteredArticles = useMemo(() => {
    return displayArticles.filter((article) => {
      if (selectedRegion && selectedRegion !== "global" && article.region !== selectedRegion) {
        return false;
      }
      if (selectedTag && !article.tags.includes(selectedTag)) {
        return false;
      }
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (
          !article.title.toLowerCase().includes(q) &&
          !article.summary.toLowerCase().includes(q)
        ) {
          return false;
        }
      }
      return true;
    });
  }, [displayArticles, selectedRegion, selectedTag, searchQuery]);

  const virtualizer = useVirtualizer({
    count: filteredArticles.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 200,
    overscan: 5,
  });

  const getRegionLabel = (region: string): string => {
    const key = REGION_KEY_MAP[region];
    if (key) {
      return t(`regions.${key}` as "regions.europe" | "regions.middleEast" | "regions.asia" | "regions.americas" | "regions.cis" | "regions.global");
    }
    return region;
  };

  const handleArticleClick = (url: string) => {
    if (url && url !== "#") {
      window.open(url, "_blank", "noopener");
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary font-[family-name:var(--font-display)]">
            {t("title")}
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            {t("liveUpdates")}
          </p>
        </div>
      </div>

      {/* Search bar */}
      <div className="glass rounded-xl p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder={tCommon("search") + "..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-border bg-background py-2 pl-9 pr-4 text-sm text-text-primary placeholder:text-text-muted focus:border-accent/50 focus:outline-none focus:ring-1 focus:ring-accent/50 transition-colors"
          />
        </div>

        {/* Region filter chips — always visible */}
        <div className="mt-4 space-y-3">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-medium text-text-muted">
              <Globe className="h-3.5 w-3.5" />
              {t("filterByRegion")}
            </div>
            <div className="flex flex-wrap gap-2">
              {REGIONS.map((region) => (
                <button
                  key={region}
                  onClick={() =>
                    setSelectedRegion(
                      selectedRegion === region ? undefined : region
                    )
                  }
                  className={cn(
                    "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                    selectedRegion === region
                      ? "bg-accent/10 text-accent ring-1 ring-accent/30"
                      : "bg-surface-light text-text-secondary hover:bg-surface-hover"
                  )}
                >
                  {getRegionLabel(region)}
                </button>
              ))}
            </div>
          </div>

          {/* Tag filter chips — always visible */}
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-medium text-text-muted">
              <Tag className="h-3.5 w-3.5" />
              {t("filterByTag")}
            </div>
            <div className="flex flex-wrap gap-2">
              {TAGS.map((tag) => (
                <button
                  key={tag}
                  onClick={() =>
                    setSelectedTag(selectedTag === tag ? undefined : tag)
                  }
                  className={cn(
                    "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                    selectedTag === tag
                      ? "bg-accent/10 text-accent ring-1 ring-accent/30"
                      : "bg-surface-light text-text-secondary hover:bg-surface-hover"
                  )}
                >
                  {t(`tags.${tag}` as "tags.war" | "tags.sanctions" | "tags.energy" | "tags.elections" | "tags.trade")}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border">
        <button className="border-b-2 border-accent px-4 py-2 text-sm font-medium text-accent">
          {t("latest")}
        </button>
        <button className="border-b-2 border-transparent px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors">
          <span className="flex items-center gap-1.5">
            <TrendingUp className="h-3.5 w-3.5" />
            {t("trending")}
          </span>
        </button>
      </div>

      {/* Articles list — virtualized */}
      {isLoading ? (
        <div className="space-y-3">
          <ListSkeleton rows={5} />
        </div>
      ) : isError ? (
        <div className="flex items-center justify-center py-20 text-sm text-negative">
          {tCommon("error")}
        </div>
      ) : (
        <div ref={parentRef} className="h-[calc(100vh-400px)] min-h-[400px] overflow-y-auto">
          <div
            style={{ height: `${virtualizer.getTotalSize()}px`, width: "100%", position: "relative" }}
          >
            {virtualizer.getVirtualItems().map((virtualItem) => {
              const article = filteredArticles[virtualItem.index];
              if (!article) return null;
              return (
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
                  <article
                    onClick={() => handleArticleClick(article.url)}
                    className="glass group cursor-pointer rounded-xl p-5 mb-3 transition-all hover:border-border-light"
                  >
                    <div className="flex gap-4">
                      <div className="flex-1 min-w-0">
                        {/* Tags */}
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                          <span
                            className={cn(
                              "rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
                              sentimentBadge(article.sentiment)
                            )}
                          >
                            {t("sentiment")}: {article.sentiment}
                          </span>
                          <span className="rounded-md bg-surface-light px-2 py-0.5 text-[10px] font-medium text-text-muted uppercase tracking-wider">
                            {getRegionLabel(article.region)}
                          </span>
                          {article.tags.map((tag: string) => (
                            <span
                              key={tag}
                              className="rounded-md bg-surface-light px-2 py-0.5 text-[10px] text-text-muted"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>

                        {/* Title */}
                        <h2 className="text-base font-semibold text-text-primary leading-snug group-hover:text-accent transition-colors">
                          {article.title}
                        </h2>

                        {/* Summary */}
                        <p className="mt-2 text-sm text-text-secondary line-clamp-2">
                          {article.summary}
                        </p>

                        {/* Meta */}
                        <div className="mt-3 flex items-center gap-4 text-xs text-text-muted">
                          <span className="font-medium">{article.source}</span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatRelativeTime(article.publishedAt)}
                          </span>
                          <button
                            onClick={(e) => e.stopPropagation()}
                            className="flex items-center gap-1 text-info hover:text-accent transition-colors"
                          >
                            <Sparkles className="h-3 w-3" />
                            {t("summarize")}
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleArticleClick(article.url);
                            }}
                            className="flex items-center gap-1 hover:text-accent transition-colors"
                          >
                            <ExternalLink className="h-3 w-3" />
                            {t("readMore")}
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                </div>
              );
            })}
          </div>

          {/* Load more trigger */}
          <div ref={loadMoreRef} className="py-4">
            {isFetchingNextPage && (
              <div className="flex items-center justify-center">
                <Loader2 className="h-5 w-5 animate-spin text-accent" />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function NewsPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6 animate-fade-in p-6">
          <div className="h-8 w-48 rounded bg-surface-light animate-pulse" />
          <ListSkeleton rows={5} />
        </div>
      }
    >
      <NewsPageContent />
    </Suspense>
  );
}
