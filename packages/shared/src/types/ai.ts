// ---------------------------------------------------------------------------
// AI assistant & analysis types
// ---------------------------------------------------------------------------

import type { ISODateString, UUID } from './common';

/** Role of a participant in an AI chat. */
export type AiMessageRole = 'user' | 'assistant' | 'system';

/** Possible states while the AI is producing a response. */
export type AiMessageStatus = 'pending' | 'streaming' | 'completed' | 'error';

/** Type of content block within an AI message. */
export type AiContentBlockType = 'text' | 'chart' | 'table' | 'code';

/** A single content block inside an AI message. */
export interface AiContentBlock {
  /** Discriminant for the content block type. */
  type: AiContentBlockType;
  /** The textual or serialised content. */
  content: string;
  /** Optional programming language (relevant when `type === 'code'`). */
  language?: string;
  /** Optional descriptive label (e.g. chart title). */
  label?: string;
}

/**
 * A single message within an AI chat conversation.
 */
export interface AiMessage {
  /** Unique message identifier. */
  id: UUID;
  /** Chat this message belongs to. */
  chatId: UUID;
  /** Who produced this message. */
  role: AiMessageRole;
  /** Ordered content blocks that compose this message. */
  content: AiContentBlock[];
  /** Current delivery status. */
  status: AiMessageStatus;
  /** Asset symbols referenced in the message. */
  referencedAssets: string[];
  /** Tokens consumed by this message (prompt + completion). */
  tokenUsage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  /** ISO-8601 creation timestamp. */
  createdAt: ISODateString;
}

/**
 * A persisted AI chat session.
 */
export interface AiChat {
  /** Unique chat identifier. */
  id: UUID;
  /** Owning user ID. */
  userId: UUID;
  /** User-editable chat title (auto-generated if not set). */
  title: string;
  /** Ordered list of messages (may be lazy-loaded). */
  messages: AiMessage[];
  /** Number of messages in this chat. */
  messageCount: number;
  /** Whether the chat has been pinned by the user. */
  pinned: boolean;
  /** ISO-8601 creation timestamp. */
  createdAt: ISODateString;
  /** ISO-8601 last-activity timestamp. */
  updatedAt: ISODateString;
}

// ---------------------------------------------------------------------------
// Analysis request / response (non-chat, one-shot)
// ---------------------------------------------------------------------------

/** The type of structured analysis the user is requesting. */
export type AiAnalysisType =
  | 'sentiment'
  | 'technical'
  | 'fundamental'
  | 'risk'
  | 'correlation'
  | 'summary';

/**
 * Request payload for a one-shot AI analysis (not part of a chat).
 */
export interface AiAnalysisRequest {
  /** The kind of analysis to perform. */
  analysisType: AiAnalysisType;
  /** Primary asset symbol(s) to analyse. */
  symbols: string[];
  /** Optional free-form prompt / question from the user. */
  prompt?: string;
  /** Optional time horizon for the analysis. */
  timeHorizon?: '1D' | '1W' | '1M' | '3M' | '1Y';
  /** Whether to include chart visualisations in the response. */
  includeCharts: boolean;
}

/**
 * Response payload for a one-shot AI analysis.
 */
export interface AiAnalysisResponse {
  /** Unique analysis identifier. */
  id: UUID;
  /** The analysis type that was performed. */
  analysisType: AiAnalysisType;
  /** Asset symbols that were analysed. */
  symbols: string[];
  /** Structured content blocks (text, charts, tables). */
  content: AiContentBlock[];
  /** Overall confidence score from 0 to 1. */
  confidence: number;
  /** Key data sources referenced in the analysis. */
  dataSources: string[];
  /** Token usage for billing/quota tracking. */
  tokenUsage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  /** ISO-8601 timestamp when the analysis was generated. */
  createdAt: ISODateString;
}
