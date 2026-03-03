// ---------------------------------------------------------------------------
// Common shared types used across the fintelligence platform
// ---------------------------------------------------------------------------

/** Supported application locales. */
export type Locale = 'en' | 'de' | 'ru';

/** Application color-scheme preference. */
export type Theme = 'dark' | 'light' | 'system';

// ---------------------------------------------------------------------------
// Pagination
// ---------------------------------------------------------------------------

/** Query parameters for any paginated endpoint. */
export interface PaginationParams {
  /** 1-based page number. */
  page: number;
  /** Number of items per page (max 100). */
  limit: number;
  /** Optional field name to sort by. */
  sortBy?: string;
  /** Sort direction. Defaults to `'desc'`. */
  sortOrder?: 'asc' | 'desc';
}

/**
 * Generic wrapper returned by every paginated API endpoint.
 *
 * @typeParam T - The type of items contained in this page.
 */
export interface PaginatedResponse<T> {
  /** The items for the current page. */
  data: T[];
  /** Metadata about the full result set. */
  meta: {
    /** Current 1-based page number. */
    page: number;
    /** Requested page size. */
    limit: number;
    /** Total number of items across all pages. */
    totalItems: number;
    /** Total number of pages. */
    totalPages: number;
    /** Whether a next page exists. */
    hasNextPage: boolean;
    /** Whether a previous page exists. */
    hasPreviousPage: boolean;
  };
}

// ---------------------------------------------------------------------------
// API errors
// ---------------------------------------------------------------------------

/** Standardised API error payload returned by the backend. */
export interface ApiError {
  /** HTTP status code. */
  statusCode: number;
  /** Machine-readable error code (e.g. `'VALIDATION_ERROR'`). */
  code: string;
  /** Human-readable error message. */
  message: string;
  /** Optional per-field validation errors. */
  errors?: Record<string, string[]>;
  /** ISO-8601 timestamp of when the error occurred. */
  timestamp: string;
  /** The request path that produced the error. */
  path: string;
}

// ---------------------------------------------------------------------------
// WebSocket
// ---------------------------------------------------------------------------

/** Discriminated union tag for real-time WebSocket events. */
export type WebSocketEventType =
  | 'PRICE_UPDATE'
  | 'NEWS_ALERT'
  | 'PORTFOLIO_UPDATE'
  | 'ALERT_TRIGGERED'
  | 'AI_STREAM_CHUNK'
  | 'CALENDAR_REMINDER'
  | 'CONNECTION_ACK'
  | 'ERROR';

/**
 * Envelope for every message sent over the WebSocket connection.
 *
 * @typeParam T - Payload type (varies per `type` discriminant).
 */
export interface WebSocketEvent<T = unknown> {
  /** Discriminant identifying the kind of event. */
  type: WebSocketEventType;
  /** Event payload whose shape depends on `type`. */
  payload: T;
  /** ISO-8601 timestamp of when the server emitted this event. */
  timestamp: string;
  /** Optional correlation ID linking this event to a client request. */
  correlationId?: string;
}

// ---------------------------------------------------------------------------
// Misc helpers
// ---------------------------------------------------------------------------

/** ISO-8601 date-time string (alias for documentation clarity). */
export type ISODateString = string;

/** Unique identifier (UUID v4). */
export type UUID = string;

/** Currency code following ISO 4217 (e.g. `'USD'`, `'EUR'`). */
export type CurrencyCode = string;
