"use client";

import { useMemo, Suspense } from "react";
import { useTranslations } from "next-intl";
import { useMarketStore, type AssetType } from "@/stores/market";
import { cn, formatCurrency, formatPercentage, formatCompactNumber } from "@/lib/utils";
import { LineChart, Line, ResponsiveContainer } from "recharts";
import {
  Search,
  LayoutGrid,
  List,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Filter,
} from "lucide-react";
import { ListSkeleton } from "@/components/common/loading-skeleton";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface MockAsset {
  symbol: string;
  name: string;
  type: "stocks" | "crypto" | "forex" | "commodities" | "indices";
  price: number;
  change24h: number;
  volume24h: number;
  marketCap: number;
  high24h: number;
  low24h: number;
  exchange: string;
  sector: string;
  sparkline: number[];
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const ASSET_TABS: { key: AssetType; label: string }[] = [
  { key: "all", label: "allAssets" },
  { key: "stocks", label: "stocks" },
  { key: "crypto", label: "crypto" },
  { key: "forex", label: "forex" },
  { key: "commodities", label: "commodities" },
  { key: "indices", label: "indices" },
];

const EXCHANGES = ["NYSE", "NASDAQ", "LSE", "TSE", "MOEX", "Euronext"] as const;
const SECTORS = ["Tech", "Energy", "Healthcare", "Finance", "Materials", "Consumer"] as const;

// ---------------------------------------------------------------------------
// Mock data — 25+ assets across all categories
// ---------------------------------------------------------------------------

function generateSparkline(base: number, volatility: number): number[] {
  const points: number[] = [];
  let price = base;
  for (let i = 0; i < 24; i++) {
    price += (Math.random() - 0.48) * volatility;
    points.push(price);
  }
  return points;
}

const MOCK_ASSETS: MockAsset[] = [
  // Crypto (never mixed with stocks)
  { symbol: "BTC", name: "Bitcoin", type: "crypto", price: 94521.32, change24h: 1.98, volume24h: 42_800_000_000, marketCap: 1_860_000_000_000, high24h: 95200, low24h: 92800, exchange: "Binance", sector: "Crypto", sparkline: generateSparkline(94521, 800) },
  { symbol: "ETH", name: "Ethereum", type: "crypto", price: 3891.42, change24h: 3.21, volume24h: 18_200_000_000, marketCap: 468_000_000_000, high24h: 3950, low24h: 3780, exchange: "Binance", sector: "Crypto", sparkline: generateSparkline(3891, 40) },
  { symbol: "SOL", name: "Solana", type: "crypto", price: 142.18, change24h: 8.2, volume24h: 3_400_000_000, marketCap: 62_000_000_000, high24h: 148, low24h: 131, exchange: "Binance", sector: "Crypto", sparkline: generateSparkline(142, 5) },
  { symbol: "XRP", name: "Ripple", type: "crypto", price: 0.614, change24h: 4.3, volume24h: 1_800_000_000, marketCap: 33_000_000_000, high24h: 0.63, low24h: 0.59, exchange: "Binance", sector: "Crypto", sparkline: generateSparkline(0.614, 0.02) },
  { symbol: "ADA", name: "Cardano", type: "crypto", price: 0.452, change24h: -1.2, volume24h: 580_000_000, marketCap: 16_000_000_000, high24h: 0.47, low24h: 0.44, exchange: "Binance", sector: "Crypto", sparkline: generateSparkline(0.452, 0.01) },
  { symbol: "AVAX", name: "Avalanche", type: "crypto", price: 38.91, change24h: 6.4, volume24h: 820_000_000, marketCap: 14_200_000_000, high24h: 40.5, low24h: 36.2, exchange: "Binance", sector: "Crypto", sparkline: generateSparkline(38.91, 1.5) },
  { symbol: "DOGE", name: "Dogecoin", type: "crypto", price: 0.121, change24h: -5.1, volume24h: 1_200_000_000, marketCap: 17_400_000_000, high24h: 0.13, low24h: 0.115, exchange: "Binance", sector: "Crypto", sparkline: generateSparkline(0.121, 0.005) },

  // Stocks
  { symbol: "AAPL", name: "Apple Inc.", type: "stocks", price: 189.42, change24h: 0.84, volume24h: 52_000_000, marketCap: 2_950_000_000_000, high24h: 190.1, low24h: 187.6, exchange: "NASDAQ", sector: "Tech", sparkline: generateSparkline(189, 2) },
  { symbol: "MSFT", name: "Microsoft Corp.", type: "stocks", price: 421.56, change24h: 1.12, volume24h: 28_000_000, marketCap: 3_130_000_000_000, high24h: 423.8, low24h: 418.2, exchange: "NASDAQ", sector: "Tech", sparkline: generateSparkline(421, 3) },
  { symbol: "GOOGL", name: "Alphabet Inc.", type: "stocks", price: 162.35, change24h: -0.45, volume24h: 22_000_000, marketCap: 2_010_000_000_000, high24h: 163.8, low24h: 161.2, exchange: "NASDAQ", sector: "Tech", sparkline: generateSparkline(162, 1.5) },
  { symbol: "JPM", name: "JPMorgan Chase", type: "stocks", price: 198.74, change24h: 0.32, volume24h: 8_500_000, marketCap: 571_000_000_000, high24h: 199.5, low24h: 197.1, exchange: "NYSE", sector: "Finance", sparkline: generateSparkline(198, 1) },
  { symbol: "XOM", name: "Exxon Mobil", type: "stocks", price: 104.82, change24h: -1.15, volume24h: 15_000_000, marketCap: 440_000_000_000, high24h: 106.2, low24h: 104.1, exchange: "NYSE", sector: "Energy", sparkline: generateSparkline(104, 1.2) },
  { symbol: "JNJ", name: "Johnson & Johnson", type: "stocks", price: 156.21, change24h: 0.22, volume24h: 6_200_000, marketCap: 376_000_000_000, high24h: 157, low24h: 155.5, exchange: "NYSE", sector: "Healthcare", sparkline: generateSparkline(156, 0.8) },
  { symbol: "SHEL", name: "Shell plc", type: "stocks", price: 31.45, change24h: -0.72, volume24h: 4_100_000, marketCap: 198_000_000_000, high24h: 31.9, low24h: 31.1, exchange: "LSE", sector: "Energy", sparkline: generateSparkline(31.45, 0.3) },
  { symbol: "SBER", name: "Sberbank", type: "stocks", price: 281.4, change24h: 1.45, volume24h: 12_000_000, marketCap: 6_300_000_000_000, high24h: 284, low24h: 278, exchange: "MOEX", sector: "Finance", sparkline: generateSparkline(281, 3) },
  { symbol: "TTE", name: "TotalEnergies", type: "stocks", price: 62.18, change24h: -0.38, volume24h: 3_800_000, marketCap: 145_000_000_000, high24h: 62.8, low24h: 61.5, exchange: "Euronext", sector: "Energy", sparkline: generateSparkline(62, 0.5) },

  // Forex
  { symbol: "EUR/USD", name: "Euro / US Dollar", type: "forex", price: 1.0842, change24h: -0.12, volume24h: 0, marketCap: 0, high24h: 1.0868, low24h: 1.0815, exchange: "Forex", sector: "Currency", sparkline: generateSparkline(1.0842, 0.002) },
  { symbol: "GBP/USD", name: "British Pound / Dollar", type: "forex", price: 1.2654, change24h: 0.08, volume24h: 0, marketCap: 0, high24h: 1.2680, low24h: 1.2625, exchange: "Forex", sector: "Currency", sparkline: generateSparkline(1.2654, 0.003) },
  { symbol: "USD/JPY", name: "US Dollar / Japanese Yen", type: "forex", price: 149.82, change24h: 0.34, volume24h: 0, marketCap: 0, high24h: 150.1, low24h: 149.2, exchange: "Forex", sector: "Currency", sparkline: generateSparkline(149.82, 0.5) },
  { symbol: "USD/RUB", name: "US Dollar / Russian Ruble", type: "forex", price: 92.45, change24h: -0.55, volume24h: 0, marketCap: 0, high24h: 93.1, low24h: 92.0, exchange: "MOEX", sector: "Currency", sparkline: generateSparkline(92.45, 0.4) },

  // Commodities
  { symbol: "XAU", name: "Gold", type: "commodities", price: 2341.5, change24h: 0.42, volume24h: 180_000_000_000, marketCap: 0, high24h: 2355, low24h: 2330, exchange: "COMEX", sector: "Materials", sparkline: generateSparkline(2341, 10) },
  { symbol: "XAG", name: "Silver", type: "commodities", price: 27.84, change24h: 1.15, volume24h: 5_200_000_000, marketCap: 0, high24h: 28.2, low24h: 27.5, exchange: "COMEX", sector: "Materials", sparkline: generateSparkline(27.84, 0.3) },
  { symbol: "WTI", name: "Crude Oil WTI", type: "commodities", price: 78.42, change24h: -2.31, volume24h: 340_000_000, marketCap: 0, high24h: 80.1, low24h: 77.8, exchange: "NYMEX", sector: "Energy", sparkline: generateSparkline(78.42, 1) },

  // Indices
  { symbol: "SPX", name: "S&P 500", type: "indices", price: 5234.18, change24h: 0.72, volume24h: 3_800_000_000, marketCap: 0, high24h: 5250, low24h: 5210, exchange: "NYSE", sector: "Index", sparkline: generateSparkline(5234, 15) },
  { symbol: "DJI", name: "Dow Jones", type: "indices", price: 39142.52, change24h: 0.45, volume24h: 2_100_000_000, marketCap: 0, high24h: 39250, low24h: 38980, exchange: "NYSE", sector: "Index", sparkline: generateSparkline(39142, 100) },
  { symbol: "IMOEX", name: "MOEX Russia Index", type: "indices", price: 3245.8, change24h: 1.12, volume24h: 890_000_000, marketCap: 0, high24h: 3270, low24h: 3220, exchange: "MOEX", sector: "Index", sparkline: generateSparkline(3245, 20) },
];

// ---------------------------------------------------------------------------
// Mini sparkline component using Recharts
// ---------------------------------------------------------------------------

function SparklineChart({ data, positive }: { data: number[]; positive: boolean }) {
  const chartData = data.map((value, i) => ({ v: value, i }));
  return (
    <ResponsiveContainer width={80} height={32}>
      <LineChart data={chartData}>
        <Line
          type="monotone"
          dataKey="v"
          stroke={positive ? "#00ff88" : "#ff4444"}
          strokeWidth={1.5}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

// ---------------------------------------------------------------------------
// Asset card (grid view)
// ---------------------------------------------------------------------------

function AssetCard({ asset }: { asset: MockAsset }) {
  const isPositive = asset.change24h >= 0;

  return (
    <div className="glass rounded-xl p-4 transition-all hover:border-border-light cursor-pointer">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/5 text-[10px] font-bold text-accent font-mono">
            {asset.symbol.slice(0, 4)}
          </div>
          <div>
            <p className="text-sm font-semibold text-text-primary">{asset.symbol}</p>
            <p className="text-[10px] text-text-muted truncate max-w-[100px]">{asset.name}</p>
          </div>
        </div>
        <span className="rounded-md bg-white/[0.04] px-1.5 py-0.5 text-[9px] font-medium text-text-muted">
          {asset.exchange}
        </span>
      </div>

      <div className="flex items-end justify-between">
        <div>
          <p className="text-lg font-bold font-mono text-text-primary">
            {asset.price < 10 ? `$${asset.price.toFixed(4)}` : formatCurrency(asset.price)}
          </p>
          <div className="flex items-center gap-1 mt-0.5">
            {isPositive ? (
              <TrendingUp className="h-3 w-3 text-positive" />
            ) : (
              <TrendingDown className="h-3 w-3 text-negative" />
            )}
            <span
              className={cn(
                "text-xs font-mono font-medium",
                isPositive ? "text-positive" : "text-negative"
              )}
            >
              {formatPercentage(asset.change24h)}
            </span>
          </div>
        </div>
        <SparklineChart data={asset.sparkline} positive={isPositive} />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Asset row (list view)
// ---------------------------------------------------------------------------

function AssetRow({ asset }: { asset: MockAsset }) {
  const isPositive = asset.change24h >= 0;

  return (
    <div className="flex items-center gap-4 rounded-lg px-4 py-3 transition-colors hover:bg-surface-hover cursor-pointer">
      <div className="flex items-center gap-3 w-48 shrink-0">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/5 text-[10px] font-bold text-accent font-mono">
          {asset.symbol.slice(0, 4)}
        </div>
        <div>
          <p className="text-sm font-medium text-text-primary">{asset.symbol}</p>
          <p className="text-[10px] text-text-muted">{asset.name}</p>
        </div>
      </div>
      <div className="w-28 text-right">
        <p className="text-sm font-mono text-text-primary">
          {asset.price < 10 ? `$${asset.price.toFixed(4)}` : formatCurrency(asset.price)}
        </p>
      </div>
      <div className="w-24 text-right">
        <span
          className={cn(
            "rounded-md px-2 py-0.5 text-xs font-mono font-medium",
            isPositive ? "bg-positive/10 text-positive" : "bg-negative/10 text-negative"
          )}
        >
          {formatPercentage(asset.change24h)}
        </span>
      </div>
      <div className="w-20 flex justify-center">
        <SparklineChart data={asset.sparkline} positive={isPositive} />
      </div>
      <div className="w-24 text-right hidden md:block">
        <span className="rounded-md bg-white/[0.04] px-1.5 py-0.5 text-[10px] font-medium text-text-muted">
          {asset.exchange}
        </span>
      </div>
      <div className="w-28 text-right hidden lg:block">
        <p className="text-xs font-mono text-text-secondary">
          {asset.volume24h > 0 ? formatCompactNumber(asset.volume24h) : "—"}
        </p>
      </div>
      <div className="w-28 text-right hidden lg:block">
        <p className="text-xs font-mono text-text-secondary">
          {asset.marketCap > 0 ? formatCompactNumber(asset.marketCap) : "—"}
        </p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Market page content
// ---------------------------------------------------------------------------

function MarketPageContent() {
  const t = useTranslations("market");
  const tCommon = useTranslations("common");
  const {
    assetType,
    exchange,
    sector,
    searchQuery,
    viewMode,
    setAssetType,
    setExchange,
    setSector,
    setSearchQuery,
    setViewMode,
  } = useMarketStore();

  const filteredAssets = useMemo(() => {
    return MOCK_ASSETS.filter((asset) => {
      // Asset type filter — crypto never mixed with stocks
      if (assetType !== "all" && asset.type !== assetType) return false;

      // Exchange filter
      if (exchange && asset.exchange !== exchange) return false;

      // Sector filter
      if (sector && asset.sector !== sector) return false;

      // Search filter
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (
          !asset.symbol.toLowerCase().includes(q) &&
          !asset.name.toLowerCase().includes(q)
        ) {
          return false;
        }
      }

      return true;
    });
  }, [assetType, exchange, sector, searchQuery]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary font-[family-name:var(--font-display)]">
            {t("title")}
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            {filteredAssets.length} assets
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode("grid")}
            className={cn(
              "rounded-lg p-2 transition-colors",
              viewMode === "grid" ? "bg-accent/10 text-accent" : "text-text-muted hover:bg-surface-hover"
            )}
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={cn(
              "rounded-lg p-2 transition-colors",
              viewMode === "list" ? "bg-accent/10 text-accent" : "text-text-muted hover:bg-surface-hover"
            )}
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="glass rounded-xl p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder={tCommon("search") + " by symbol or name..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-border bg-background py-2 pl-9 pr-4 text-sm text-text-primary placeholder:text-text-muted focus:border-accent/50 focus:outline-none focus:ring-1 focus:ring-accent/50 transition-colors"
          />
        </div>
      </div>

      {/* Asset type tabs */}
      <div className="flex gap-1 overflow-x-auto border-b border-border pb-px">
        {ASSET_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setAssetType(tab.key)}
            className={cn(
              "whitespace-nowrap border-b-2 px-4 py-2 text-sm font-medium transition-colors",
              assetType === tab.key
                ? "border-accent text-accent"
                : "border-transparent text-text-secondary hover:text-text-primary"
            )}
          >
            {t(tab.label as "allAssets" | "stocks" | "crypto" | "forex" | "indices" | "commodities")}
          </button>
        ))}
      </div>

      {/* Secondary filters: Exchange + Sector */}
      <div className="flex flex-wrap items-center gap-4">
        {/* Exchange filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-text-muted flex items-center gap-1">
            <Filter className="h-3 w-3" />
            {t("exchanges")}:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {EXCHANGES.map((ex) => (
              <button
                key={ex}
                onClick={() => setExchange(exchange === ex ? null : ex)}
                className={cn(
                  "rounded-md px-2 py-1 text-[10px] font-medium transition-colors",
                  exchange === ex
                    ? "bg-accent/10 text-accent ring-1 ring-accent/30"
                    : "bg-surface-light text-text-secondary hover:bg-surface-hover"
                )}
              >
                {ex}
              </button>
            ))}
          </div>
        </div>

        {/* Sector filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-text-muted flex items-center gap-1">
            <BarChart3 className="h-3 w-3" />
            {t("sectors")}:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {SECTORS.map((s) => (
              <button
                key={s}
                onClick={() => setSector(sector === s ? null : s)}
                className={cn(
                  "rounded-md px-2 py-1 text-[10px] font-medium transition-colors",
                  sector === s
                    ? "bg-accent/10 text-accent ring-1 ring-accent/30"
                    : "bg-surface-light text-text-secondary hover:bg-surface-hover"
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Assets display */}
      {filteredAssets.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-text-muted">
          <Search className="h-8 w-8 mb-3 opacity-50" />
          <p className="text-sm">{tCommon("noData")}</p>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredAssets.map((asset) => (
            <AssetCard key={asset.symbol} asset={asset} />
          ))}
        </div>
      ) : (
        <div className="glass rounded-xl overflow-hidden">
          {/* List header */}
          <div className="flex items-center gap-4 border-b border-border px-4 py-2 text-[10px] font-semibold uppercase tracking-wider text-text-muted">
            <div className="w-48">{t("name")}</div>
            <div className="w-28 text-right">{t("price")}</div>
            <div className="w-24 text-right">{t("change")}</div>
            <div className="w-20 text-center">{t("sparkline")}</div>
            <div className="w-24 text-right hidden md:block">{t("exchange")}</div>
            <div className="w-28 text-right hidden lg:block">{t("volume")}</div>
            <div className="w-28 text-right hidden lg:block">{t("marketCap")}</div>
          </div>
          {filteredAssets.map((asset) => (
            <AssetRow key={asset.symbol} asset={asset} />
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Export with Suspense boundary
// ---------------------------------------------------------------------------

export default function MarketPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6 animate-fade-in p-6">
          <div className="h-8 w-48 rounded bg-surface-light animate-pulse" />
          <ListSkeleton rows={8} />
        </div>
      }
    >
      <MarketPageContent />
    </Suspense>
  );
}
