// ---------------------------------------------------------------------------
// Portfolio & P&L types
// ---------------------------------------------------------------------------

import type { CurrencyCode, ISODateString, UUID } from './common';
import type { AssetType } from './market';

/**
 * A single holding inside a user's portfolio.
 */
export interface PortfolioItem {
  /** Unique record identifier. */
  id: UUID;
  /** Owning user ID. */
  userId: UUID;
  /** Asset symbol (e.g. `'BTC'`, `'AAPL'`). */
  symbol: string;
  /** Human-readable asset name. */
  name: string;
  /** Asset classification. */
  assetType: AssetType;
  /** Number of units held. */
  quantity: number;
  /** Weighted average entry price per unit. */
  averageEntryPrice: number;
  /** Current market price per unit. */
  currentPrice: number;
  /** Total current market value (`quantity * currentPrice`). */
  marketValue: number;
  /** Unrealised P&L in quote currency. */
  unrealisedPnl: number;
  /** Unrealised P&L as a percentage of cost basis. */
  unrealisedPnlPercent: number;
  /** Percentage weight of this holding in the total portfolio. */
  allocationPercent: number;
  /** Currency in which prices are denominated. */
  currency: CurrencyCode;
  /** Optional URL to the asset logo. */
  logoUrl?: string;
  /** ISO-8601 date when the position was first opened. */
  openedAt: ISODateString;
  /** ISO-8601 last-update timestamp. */
  updatedAt: ISODateString;
}

/**
 * Aggregated portfolio summary shown on the dashboard overview.
 */
export interface PortfolioSummary {
  /** Total portfolio market value. */
  totalValue: number;
  /** Total cost basis (sum of all entry costs). */
  totalCostBasis: number;
  /** Total unrealised P&L. */
  totalUnrealisedPnl: number;
  /** Total unrealised P&L percentage. */
  totalUnrealisedPnlPercent: number;
  /** Total realised P&L (closed positions). */
  totalRealisedPnl: number;
  /** Value change over the last 24 h. */
  dailyChange: number;
  /** Percentage change over the last 24 h. */
  dailyChangePercent: number;
  /** Base currency used for all monetary values. */
  currency: CurrencyCode;
  /** Breakdown of allocation by asset type. */
  allocationByType: Record<AssetType, number>;
  /** Number of distinct holdings. */
  holdingsCount: number;
  /** Ordered list of individual holdings. */
  holdings: PortfolioItem[];
  /** ISO-8601 timestamp of the last recalculation. */
  updatedAt: ISODateString;
}

// ---------------------------------------------------------------------------
// Profit & Loss history
// ---------------------------------------------------------------------------

/** A single data-point on the P&L chart. */
export interface PnLDataPoint {
  /** ISO-8601 date (or datetime for intraday). */
  date: ISODateString;
  /** Cumulative portfolio value at this point. */
  value: number;
  /** Cumulative P&L at this point. */
  pnl: number;
  /** Cumulative P&L percentage. */
  pnlPercent: number;
}

/** Selectable time range for P&L charts. */
export type PnLTimeRange = '1D' | '1W' | '1M' | '3M' | '6M' | '1Y' | 'ALL';

/**
 * Full P&L dataset returned by the portfolio performance endpoint.
 */
export interface PnLData {
  /** Requested time range. */
  timeRange: PnLTimeRange;
  /** Ordered data points. */
  series: PnLDataPoint[];
  /** Period start value. */
  startValue: number;
  /** Period end (current) value. */
  endValue: number;
  /** Absolute change over the period. */
  periodChange: number;
  /** Percentage change over the period. */
  periodChangePercent: number;
  /** Highest portfolio value during the period. */
  highWaterMark: number;
  /** Lowest portfolio value during the period. */
  lowWaterMark: number;
  /** Maximum drawdown percentage during the period. */
  maxDrawdownPercent: number;
  /** Base currency. */
  currency: CurrencyCode;
}
