const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export class ApiError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    public data?: unknown
  ) {
    super(`API Error: ${status} ${statusText}`);
    this.name = "ApiError";
  }
}

interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  params?: Record<string, string | number | boolean | undefined>;
}

async function request<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { body, params, headers: customHeaders, ...rest } = options;

  let url = `${API_BASE_URL}${endpoint}`;

  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
  }

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...customHeaders,
  };

  const response = await fetch(url, {
    credentials: "include",
    headers,
    body: body ? JSON.stringify(body) : undefined,
    ...rest,
  });

  if (!response.ok) {
    let errorData: unknown;
    try {
      errorData = await response.json();
    } catch {
      // Response body may not be JSON
    }
    throw new ApiError(response.status, response.statusText, errorData);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

export const api = {
  get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return request<T>(endpoint, { ...options, method: "GET" });
  },

  post<T>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return request<T>(endpoint, { ...options, method: "POST", body });
  },

  put<T>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return request<T>(endpoint, { ...options, method: "PUT", body });
  },

  patch<T>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return request<T>(endpoint, { ...options, method: "PATCH", body });
  },

  delete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return request<T>(endpoint, { ...options, method: "DELETE" });
  },
};

// Auth endpoints
export const authApi = {
  login(email: string, password: string) {
    return api.post<{ user: User; token: string }>("/auth/login", {
      email,
      password,
    });
  },

  register(data: { name: string; email: string; password: string }) {
    return api.post<{ user: User; token: string }>("/auth/register", data);
  },

  logout() {
    return api.post("/auth/logout");
  },

  me() {
    return api.get<User>("/auth/me");
  },
};

// Market endpoints
export const marketApi = {
  getAssets(params?: { type?: string; search?: string; page?: number; limit?: number }) {
    return api.get<PaginatedResponse<MarketAsset>>("/market/assets", { params });
  },

  getAsset(symbol: string) {
    return api.get<MarketAsset>(`/market/assets/${symbol}`);
  },

  getHeatmap() {
    return api.get<HeatmapData[]>("/market/heatmap");
  },
};

// News endpoints
export const newsApi = {
  getArticles(params?: {
    page?: number;
    limit?: number;
    region?: string;
    tag?: string;
    search?: string;
  }) {
    return api.get<PaginatedResponse<NewsArticle>>("/news", { params });
  },

  getArticle(id: string) {
    return api.get<NewsArticle>(`/news/${id}`);
  },

  summarize(id: string) {
    return api.post<{ summary: string }>(`/news/${id}/summarize`);
  },
};

// Portfolio endpoints
export const portfolioApi = {
  getPortfolio() {
    return api.get<Portfolio>("/portfolio");
  },

  addHolding(data: { symbol: string; amount: number; buyPrice: number }) {
    return api.post<Holding>("/portfolio/holdings", data);
  },

  removeHolding(id: string) {
    return api.delete(`/portfolio/holdings/${id}`);
  },

  exportCsv() {
    return api.get<Blob>("/portfolio/export/csv");
  },
};

// Calendar endpoints
export const calendarApi = {
  getEvents(params?: { from?: string; to?: string; importance?: string }) {
    return api.get<CalendarEvent[]>("/calendar/events", { params });
  },
};

// Predictions endpoints
export const predictionsApi = {
  getMarkets(params?: { category?: string; status?: string }) {
    return api.get<PaginatedResponse<PredictionMarket>>("/predictions", { params });
  },

  makePrediction(marketId: string, data: { position: "yes" | "no"; amount: number }) {
    return api.post(`/predictions/${marketId}/predict`, data);
  },
};

// AI endpoints
export const aiApi = {
  analyze(prompt: string, chatId?: string) {
    return api.post<AiResponse>("/ai/analyze", { prompt, chatId });
  },

  getChatHistory() {
    return api.get<AiChat[]>("/ai/chats");
  },

  getChat(id: string) {
    return api.get<AiChat>(`/ai/chats/${id}`);
  },

  deleteChat(id: string) {
    return api.delete(`/ai/chats/${id}`);
  },
};

// Alerts endpoints
export const alertsApi = {
  getAlerts() {
    return api.get<Alert[]>("/alerts");
  },

  createAlert(data: Partial<Alert>) {
    return api.post<Alert>("/alerts", data);
  },

  updateAlert(id: string, data: Partial<Alert>) {
    return api.put<Alert>(`/alerts/${id}`, data);
  },

  deleteAlert(id: string) {
    return api.delete(`/alerts/${id}`);
  },
};

// Type definitions
export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface MarketAsset {
  symbol: string;
  name: string;
  type: "crypto" | "forex" | "index" | "commodity";
  price: number;
  change24h: number;
  changePercent24h: number;
  volume24h: number;
  marketCap: number;
  high24h: number;
  low24h: number;
  sparkline?: number[];
}

export interface HeatmapData {
  symbol: string;
  name: string;
  change: number;
  marketCap: number;
}

export interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  content: string;
  source: string;
  url: string;
  imageUrl?: string;
  publishedAt: string;
  region: string;
  tags: string[];
  sentiment: "positive" | "negative" | "neutral";
}

export interface Portfolio {
  totalValue: number;
  totalPnL: number;
  totalPnLPercent: number;
  holdings: Holding[];
}

export interface Holding {
  id: string;
  symbol: string;
  name: string;
  amount: number;
  buyPrice: number;
  currentPrice: number;
  pnl: number;
  pnlPercent: number;
  allocation: number;
}

export interface CalendarEvent {
  id: string;
  title: string;
  country: string;
  datetime: string;
  importance: "high" | "medium" | "low";
  actual?: string;
  forecast?: string;
  previous?: string;
}

export interface PredictionMarket {
  id: string;
  title: string;
  description: string;
  category: string;
  probability: number;
  volume: number;
  closingDate: string;
  status: "active" | "resolved";
  resolution?: "yes" | "no";
}

export interface AiResponse {
  id: string;
  chatId: string;
  message: string;
  sources?: string[];
}

export interface AiChat {
  id: string;
  title: string;
  messages: AiMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface AiMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

export interface Alert {
  id: string;
  type: "price" | "news";
  asset?: string;
  condition?: "above" | "below";
  targetPrice?: number;
  keywords?: string[];
  active: boolean;
  triggered: boolean;
  createdAt: string;
  triggeredAt?: string;
}
