// ---------------------------------------------------------------------------
// Alert types
// ---------------------------------------------------------------------------

import type { ISODateString, UUID } from './common';
import type { AssetType } from './market';
import type { NewsRegion, NewsTag } from './news';

/** Condition operator for price-based alerts. */
export type AlertCondition =
  | 'ABOVE'
  | 'BELOW'
  | 'CROSSES_ABOVE'
  | 'CROSSES_BELOW'
  | 'PERCENT_CHANGE_UP'
  | 'PERCENT_CHANGE_DOWN';

/** Notification channel through which an alert is delivered. */
export type AlertChannel = 'in_app' | 'email' | 'push' | 'sms';

/** Current lifecycle status of an alert. */
export type AlertStatus = 'active' | 'triggered' | 'expired' | 'disabled';

// ---------------------------------------------------------------------------
// Price alerts
// ---------------------------------------------------------------------------

/**
 * A price-based alert configured by the user for a specific asset.
 */
export interface PriceAlert {
  /** Unique alert identifier. */
  id: UUID;
  /** Owning user ID. */
  userId: UUID;
  /** Discriminant for the alert union. */
  kind: 'price';
  /** Target asset symbol. */
  symbol: string;
  /** Target asset name. */
  assetName: string;
  /** Asset classification. */
  assetType: AssetType;
  /** Condition that triggers the alert. */
  condition: AlertCondition;
  /**
   * Threshold value whose meaning depends on `condition`:
   * - For `ABOVE` / `BELOW` / `CROSSES_*`: an absolute price.
   * - For `PERCENT_CHANGE_*`: a percentage (e.g. `5` = 5 %).
   */
  targetValue: number;
  /** Current status. */
  status: AlertStatus;
  /** Channels through which the user wants to be notified. */
  channels: AlertChannel[];
  /** Optional user-provided note. */
  note?: string;
  /** Whether the alert should re-arm after being triggered. */
  recurring: boolean;
  /** ISO-8601 creation timestamp. */
  createdAt: ISODateString;
  /** ISO-8601 timestamp when the alert was triggered (if applicable). */
  triggeredAt?: ISODateString;
  /** ISO-8601 expiration timestamp (if applicable). */
  expiresAt?: ISODateString;
}

// ---------------------------------------------------------------------------
// News alerts
// ---------------------------------------------------------------------------

/**
 * A news/geopolitical alert triggered by keyword or filter matches in the
 * news feed.
 */
export interface NewsAlert {
  /** Unique alert identifier. */
  id: UUID;
  /** Owning user ID. */
  userId: UUID;
  /** Discriminant for the alert union. */
  kind: 'news';
  /** Human-readable label for this alert (e.g. `'Russia sanctions'`). */
  label: string;
  /** Keywords that must appear in the article title or body. */
  keywords: string[];
  /** Only match articles from these regions (empty = all). */
  regions: NewsRegion[];
  /** Only match articles with these tags (empty = all). */
  tags: NewsTag[];
  /** Only match articles mentioning these asset symbols. */
  relatedAssets: string[];
  /** Current status. */
  status: AlertStatus;
  /** Delivery channels. */
  channels: AlertChannel[];
  /** Optional user-provided note. */
  note?: string;
  /** ISO-8601 creation timestamp. */
  createdAt: ISODateString;
  /** ISO-8601 timestamp when last triggered (if applicable). */
  triggeredAt?: ISODateString;
}

// ---------------------------------------------------------------------------
// Discriminated union
// ---------------------------------------------------------------------------

/**
 * Discriminated union of all alert types.
 *
 * Use the `kind` field to narrow:
 * ```ts
 * if (alert.kind === 'price') { alert.symbol; }
 * if (alert.kind === 'news')  { alert.keywords; }
 * ```
 */
export type Alert = PriceAlert | NewsAlert;
