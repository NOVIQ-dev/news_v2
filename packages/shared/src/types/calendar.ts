// ---------------------------------------------------------------------------
// Economic calendar types
// ---------------------------------------------------------------------------

import type { ISODateString, UUID } from './common';

/** Importance level of an economic event. */
export enum EventImportance {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}

/**
 * A single economic calendar event (e.g. interest rate decision, CPI
 * release, employment report).
 */
export interface EconomicEvent {
  /** Unique event identifier. */
  id: UUID;
  /** Event title (e.g. `'FOMC Interest Rate Decision'`). */
  title: string;
  /** ISO-3166-1 alpha-2 country code (e.g. `'US'`, `'DE'`). */
  country: string;
  /** Currency most affected by this event. */
  currency: string;
  /** Impact classification. */
  importance: EventImportance;
  /** ISO-8601 scheduled date/time of the event. */
  scheduledAt: ISODateString;
  /** Actual released value (populated after release). */
  actual?: string;
  /** Market consensus forecast. */
  forecast?: string;
  /** Previous period value. */
  previous?: string;
  /** Unit of measurement (e.g. `'%'`, `'K'`, `'B'`). */
  unit?: string;
  /** Brief description of what the indicator measures. */
  description?: string;
  /** Source institution (e.g. `'Federal Reserve'`, `'Eurostat'`). */
  source?: string;
  /** URL to the official release page. */
  sourceUrl?: string;
  /** Whether this event has already occurred and `actual` is available. */
  isReleased: boolean;
  /** Asset symbols likely to be impacted. */
  relatedAssets: string[];
  /** ISO-8601 timestamp of the last data update. */
  updatedAt: ISODateString;
}
