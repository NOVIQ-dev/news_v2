// ---------------------------------------------------------------------------
// Prediction market types
// ---------------------------------------------------------------------------

import type { ISODateString, UUID } from './common';

/** Broad category for a prediction market question. */
export type PredictionCategory =
  | 'geopolitics'
  | 'economics'
  | 'crypto'
  | 'energy'
  | 'climate'
  | 'technology'
  | 'elections';

/** Resolution status of a prediction market. */
export type PredictionResolution = 'unresolved' | 'yes' | 'no' | 'cancelled';

/** A single outcome option in a multi-outcome market. */
export interface PredictionOutcome {
  /** Unique outcome identifier. */
  id: UUID;
  /** Human-readable label for this outcome (e.g. `'Yes'`, `'No'`, or a named option). */
  label: string;
  /** Current probability from 0 to 1. */
  probability: number;
  /** Total volume traded on this outcome. */
  volume: number;
}

/**
 * A prediction market question that users can browse, follow, or reference
 * in AI analyses.
 */
export interface PredictionMarket {
  /** Unique market identifier. */
  id: UUID;
  /** The question being predicted (e.g. `'Will the Fed cut rates in Q2 2026?'`). */
  question: string;
  /** Longer description providing context and resolution criteria. */
  description: string;
  /** Thematic category. */
  category: PredictionCategory;
  /** Possible outcomes with current probabilities. */
  outcomes: PredictionOutcome[];
  /** Total trading volume across all outcomes (in USD). */
  totalVolume: number;
  /** Number of unique participants. */
  participantCount: number;
  /** Current resolution status. */
  resolution: PredictionResolution;
  /** External platform source (e.g. `'Polymarket'`, `'Kalshi'`). */
  source: string;
  /** URL to the original market on the source platform. */
  sourceUrl: string;
  /** Asset symbols related to this prediction. */
  relatedAssets: string[];
  /** ISO-8601 date when the market is scheduled to resolve. */
  resolvesAt: ISODateString;
  /** ISO-8601 creation timestamp. */
  createdAt: ISODateString;
  /** ISO-8601 last-update timestamp. */
  updatedAt: ISODateString;
}
