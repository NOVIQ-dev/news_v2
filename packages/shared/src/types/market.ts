// ---------------------------------------------------------------------------
// Market data types
// ---------------------------------------------------------------------------

import type { ISODateString, UUID } from './common';

/** Broad asset classification. */
export enum AssetType {
  CRYPTO = 'CRYPTO',
  FOREX = 'FOREX',
  INDEX = 'INDEX',
  COMMODITY = 'COMMODITY',
}

/**
 * Lightweight time-series representation used to render inline sparkline
 * charts (e.g. 24 h price movement).
 */
export interface SparklineData {
  /** Ordered unix-epoch timestamps (seconds). */
  timestamps: number[];
  /** Price values corresponding to each timestamp. */
  values: number[];
}

/**
 * A single tradeable or trackable market asset as displayed in dashboards
 * and watchlists.
 */
export interface MarketAsset {
  /** Internal identifier. */
  id: UUID;
  /** Ticker / symbol (e.g. `'BTC'`, `'EUR/USD'`, `'SPX'`). */
  symbol: string;
  /** Human-readable name (e.g. `'Bitcoin'`, `'Euro / US Dollar'`). */
  name: string;
  /** Asset classification. */
  type: AssetType;
  /** Current or last-known price in the quote currency. */
  price: number;
  /** Quote currency code (e.g. `'USD'`). */
  quoteCurrency: string;
  /** Absolute price change over the last 24 h. */
  change24h: number;
  /** Percentage price change over the last 24 h. */
  changePercent24h: number;
  /** 24 h trading volume in quote currency (may be `null` for indices). */
  volume24h: number | null;
  /** Market capitalisation in quote currency (may be `null`). */
  marketCap: number | null;
  /** Inline sparkline data for the last 24 h. */
  sparkline7d: SparklineData;
  /** Optional URL to the asset logo / icon. */
  logoUrl?: string;
  /** ISO-8601 timestamp of the last price update. */
  updatedAt: ISODateString;
}

// ---------------------------------------------------------------------------
// Real-time price updates (WebSocket payload)
// ---------------------------------------------------------------------------

/** Payload for the `PRICE_UPDATE` WebSocket event. */
export interface PriceUpdate {
  /** Asset symbol. */
  symbol: string;
  /** Asset type. */
  type: AssetType;
  /** Updated price. */
  price: number;
  /** Absolute change since previous tick. */
  change: number;
  /** Percentage change since previous tick. */
  changePercent: number;
  /** Tick volume (number of trades in this update window). */
  volume: number;
  /** Unix-epoch timestamp in milliseconds. */
  timestamp: number;
}

// ---------------------------------------------------------------------------
// Heatmap
// ---------------------------------------------------------------------------

/** Single entry rendered inside the market heatmap grid. */
export interface HeatmapEntry {
  /** Asset symbol. */
  symbol: string;
  /** Human-readable label. */
  name: string;
  /** Asset classification. */
  type: AssetType;
  /** Percentage change used to determine the cell colour. */
  changePercent: number;
  /** Market cap or volume used to determine relative cell size. */
  weight: number;
  /** Current price. */
  price: number;
}

// ---------------------------------------------------------------------------
// OHLCV candle data
// ---------------------------------------------------------------------------

/** Standard time interval for OHLCV candles. */
export type CandleInterval =
  | '1m'
  | '5m'
  | '15m'
  | '30m'
  | '1h'
  | '4h'
  | '1d'
  | '1w'
  | '1M';

/** A single Open-High-Low-Close-Volume candlestick. */
export interface OHLCV {
  /** Candle open time (unix-epoch ms). */
  openTime: number;
  /** Opening price. */
  open: number;
  /** Highest price during the interval. */
  high: number;
  /** Lowest price during the interval. */
  low: number;
  /** Closing price. */
  close: number;
  /** Trading volume during the interval. */
  volume: number;
  /** Candle close time (unix-epoch ms). */
  closeTime: number;
}
