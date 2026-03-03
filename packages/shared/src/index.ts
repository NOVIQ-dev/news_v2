// ---------------------------------------------------------------------------
// @fintelligence/shared — barrel export
// ---------------------------------------------------------------------------

// Common / utility types
export type {
  ApiError,
  CurrencyCode,
  ISODateString,
  Locale,
  PaginatedResponse,
  PaginationParams,
  Theme,
  UUID,
  WebSocketEvent,
  WebSocketEventType,
} from './types/common';

// User & authentication
export type {
  AuthTokens,
  LoginDto,
  NotificationPreferences,
  RegisterDto,
  User,
  UserPreferences,
} from './types/user';

// Market data
export { AssetType } from './types/market';
export type {
  CandleInterval,
  HeatmapEntry,
  MarketAsset,
  OHLCV,
  PriceUpdate,
  SparklineData,
} from './types/market';

// News
export { NewsRegion, NewsTag } from './types/news';
export type {
  NewsArticle,
  NewsFilter,
  NewsSentiment,
  PaginatedNews,
} from './types/news';

// Portfolio
export type {
  PnLData,
  PnLDataPoint,
  PnLTimeRange,
  PortfolioItem,
  PortfolioSummary,
} from './types/portfolio';

// Alerts
export type {
  Alert,
  AlertChannel,
  AlertCondition,
  AlertStatus,
  NewsAlert,
  PriceAlert,
} from './types/alert';

// AI assistant
export type {
  AiAnalysisRequest,
  AiAnalysisResponse,
  AiAnalysisType,
  AiChat,
  AiContentBlock,
  AiContentBlockType,
  AiMessage,
  AiMessageRole,
  AiMessageStatus,
} from './types/ai';

// Economic calendar
export { EventImportance } from './types/calendar';
export type { EconomicEvent } from './types/calendar';

// Prediction markets
export type {
  PredictionCategory,
  PredictionMarket,
  PredictionOutcome,
  PredictionResolution,
} from './types/prediction';
