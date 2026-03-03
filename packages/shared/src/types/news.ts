// ---------------------------------------------------------------------------
// News & geopolitical feed types
// ---------------------------------------------------------------------------

import type { ISODateString, PaginatedResponse, UUID } from './common';

/** Geopolitical region associated with a news article. */
export enum NewsRegion {
  EUROPE = 'EUROPE',
  MIDDLE_EAST = 'MIDDLE_EAST',
  ASIA = 'ASIA',
  AMERICAS = 'AMERICAS',
  CIS = 'CIS',
}

/** Thematic tag for news classification. */
export enum NewsTag {
  WAR = 'WAR',
  SANCTIONS = 'SANCTIONS',
  ENERGY = 'ENERGY',
  ELECTIONS = 'ELECTIONS',
  TRADE = 'TRADE',
}

/** Sentiment polarity derived from NLP analysis of a news article. */
export type NewsSentiment = 'positive' | 'negative' | 'neutral';

/**
 * A single news article as returned by the feed API.
 */
export interface NewsArticle {
  /** Unique article identifier. */
  id: UUID;
  /** Headline / title. */
  title: string;
  /** Short plain-text summary (1-3 sentences). */
  summary: string;
  /** Full article body in Markdown. */
  body: string;
  /** Original source name (e.g. `'Reuters'`, `'Bloomberg'`). */
  source: string;
  /** Original article URL. */
  sourceUrl: string;
  /** Optional hero image URL. */
  imageUrl?: string;
  /** Author byline, if known. */
  author?: string;
  /** Primary region the article relates to. */
  region: NewsRegion;
  /** Additional regions mentioned in the article. */
  additionalRegions: NewsRegion[];
  /** Thematic tags. */
  tags: NewsTag[];
  /** NLP-derived sentiment score. */
  sentiment: NewsSentiment;
  /** Sentiment confidence from 0 to 1. */
  sentimentScore: number;
  /** Asset symbols mentioned in the article (e.g. `['BTC', 'OIL']`). */
  relatedAssets: string[];
  /** ISO-8601 publication timestamp. */
  publishedAt: ISODateString;
  /** ISO-8601 timestamp when the article was ingested into the platform. */
  createdAt: ISODateString;
}

// ---------------------------------------------------------------------------
// Filtering & pagination
// ---------------------------------------------------------------------------

/** Filter parameters accepted by the news feed endpoint. */
export interface NewsFilter {
  /** Free-text search query. */
  query?: string;
  /** Restrict results to these regions. */
  regions?: NewsRegion[];
  /** Restrict results to these tags. */
  tags?: NewsTag[];
  /** Only return articles with this sentiment. */
  sentiment?: NewsSentiment;
  /** Only return articles mentioning these asset symbols. */
  relatedAssets?: string[];
  /** Only return articles published after this ISO-8601 date. */
  from?: ISODateString;
  /** Only return articles published before this ISO-8601 date. */
  to?: ISODateString;
  /** Only return articles from these sources. */
  sources?: string[];
}

/** Paginated news response. */
export type PaginatedNews = PaginatedResponse<NewsArticle>;
