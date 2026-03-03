# API Integration Guide — FinTelligence

This guide covers recommended real APIs for replacing mock data in the FinTelligence dashboard, including free tier limits, pricing, environment variables, and integration code snippets.

---

## 1. Financial Data APIs

### Alpha Vantage (Stocks, Forex, Commodities)

- **Website**: https://www.alphavantage.co
- **Free tier**: 25 requests/day, 5 requests/minute
- **Paid**: Starts at $49.99/month (75 req/min)
- **Coverage**: US/global stocks, forex, commodities, economic indicators

```env
ALPHA_VANTAGE_API_KEY=your_key_here
```

```typescript
// apps/api/src/market/market.service.ts
const response = await fetch(
  `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${process.env.ALPHA_VANTAGE_API_KEY}`
);
const data = await response.json();
const quote = data['Global Quote'];
return {
  symbol: quote['01. symbol'],
  price: parseFloat(quote['05. price']),
  change24h: parseFloat(quote['09. change']),
  changePercent24h: parseFloat(quote['10. change percent'].replace('%', '')),
};
```

### Polygon.io (Stocks, Options, Forex, Crypto)

- **Website**: https://polygon.io
- **Free tier**: 5 API calls/minute, end-of-day data
- **Starter**: $29/month (unlimited calls, 15-min delayed)
- **Developer**: $79/month (unlimited, real-time)
- **Coverage**: US stocks, options, forex, crypto with WebSocket streaming

```env
POLYGON_API_KEY=your_key_here
```

```typescript
// Real-time stock quote
const response = await fetch(
  `https://api.polygon.io/v2/aggs/ticker/${symbol}/prev?apiKey=${process.env.POLYGON_API_KEY}`
);
const data = await response.json();
const result = data.results[0];
return {
  symbol: result.T,
  price: result.c,
  high24h: result.h,
  low24h: result.l,
  volume24h: result.v,
};
```

### Yahoo Finance (via unofficial API)

- **Website**: https://finance.yahoo.com
- **Free tier**: Unofficial API, no key needed (rate-limited)
- **Paid**: Via RapidAPI ($10-50/month)
- **Coverage**: Global stocks, ETFs, indices, mutual funds

```env
RAPIDAPI_KEY=your_key_here  # If using RapidAPI proxy
```

```typescript
// Via RapidAPI Yahoo Finance endpoint
const response = await fetch(
  `https://yahoo-finance15.p.rapidapi.com/api/v1/markets/quote?ticker=${symbol}`,
  {
    headers: {
      'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
      'X-RapidAPI-Host': 'yahoo-finance15.p.rapidapi.com',
    },
  }
);
```

### CoinGecko (Crypto)

- **Website**: https://www.coingecko.com/en/api
- **Free tier**: 30 calls/minute, no API key needed
- **Demo**: Free with key, 30 calls/min
- **Pro**: $129/month (500 calls/min)
- **Coverage**: 10,000+ cryptocurrencies

```env
COINGECKO_API_KEY=your_demo_key_here
```

```typescript
// Already integrated in apps/api/src/market/market.service.ts
const response = await fetch(
  `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${ids}&sparkline=true`,
  {
    headers: {
      'x-cg-demo-api-key': process.env.COINGECKO_API_KEY,
    },
  }
);
```

### Binance WebSocket (Real-time Crypto)

- **Website**: https://www.binance.com/en/binance-api
- **Free tier**: Unlimited WebSocket streams
- **Rate limits**: 1200 requests/minute for REST
- **Coverage**: All Binance-listed crypto pairs

```env
# No API key needed for public market data WebSocket
BINANCE_WS_URL=wss://stream.binance.com:9443/ws
```

```typescript
// apps/api/src/market/market.gateway.ts
import WebSocket from 'ws';

const streams = symbols.map(s => `${s.toLowerCase()}usdt@ticker`).join('/');
const ws = new WebSocket(`wss://stream.binance.com:9443/stream?streams=${streams}`);

ws.on('message', (data: string) => {
  const parsed = JSON.parse(data);
  const ticker = parsed.data;
  this.server.to(`market:${ticker.s}`).emit('price:update', {
    symbol: ticker.s,
    price: parseFloat(ticker.c),
    change24h: parseFloat(ticker.p),
    changePercent24h: parseFloat(ticker.P),
    volume24h: parseFloat(ticker.v),
    high24h: parseFloat(ticker.h),
    low24h: parseFloat(ticker.l),
  });
});
```

---

## 2. News APIs

### NewsAPI

- **Website**: https://newsapi.org
- **Free tier**: 100 requests/day (development only)
- **Business**: $449/month (unlimited, production use)
- **Coverage**: 80,000+ sources worldwide

```env
NEWSAPI_KEY=your_key_here
```

```typescript
// apps/api/src/news/news.service.ts
const response = await fetch(
  `https://newsapi.org/v2/everything?q=finance+crypto+geopolitics&sortBy=publishedAt&pageSize=50&apiKey=${process.env.NEWSAPI_KEY}`
);
const data = await response.json();
return data.articles.map((article: any) => ({
  title: article.title,
  summary: article.description,
  content: article.content,
  url: article.url,
  source: article.source.name,
  imageUrl: article.urlToImage,
  publishedAt: new Date(article.publishedAt),
}));
```

### GDELT Project (Global Event Database)

- **Website**: https://www.gdeltproject.org
- **Free tier**: Completely free, unlimited
- **Coverage**: Global news from 100+ languages, sentiment analysis, event coding

```env
# No API key needed
GDELT_API_URL=https://api.gdeltproject.org/api/v2
```

```typescript
// GDELT DOC API for news search
const response = await fetch(
  `https://api.gdeltproject.org/api/v2/doc/doc?query=finance&mode=artlist&maxrecords=50&format=json`
);
const data = await response.json();
return data.articles.map((article: any) => ({
  title: article.title,
  url: article.url,
  source: article.domain,
  publishedAt: new Date(article.seendate),
  language: article.language,
  sentiment: article.tone > 0 ? 'positive' : article.tone < -2 ? 'negative' : 'neutral',
}));
```

### RSS Feeds (Already Integrated)

The following feeds are already configured in `apps/api/src/news/news.service.ts`:

| Source | URL | Region |
|--------|-----|--------|
| CoinDesk | `https://www.coindesk.com/arc/outboundfeeds/rss/` | US |
| CoinTelegraph | `https://cointelegraph.com/rss` | US |
| The Block | `https://www.theblock.co/rss.xml` | US |
| Decrypt | `https://decrypt.co/feed` | US |
| Bitcoin Magazine | `https://bitcoinmagazine.com/.rss/full/` | US |
| Reuters Business | `https://www.reutersagency.com/feed/` | Global |
| Financial Times | `https://www.ft.com/rss/home` | UK |
| Bloomberg Crypto | `https://www.bloomberg.com/feed/podcast/decrypted` | US |

**Recommended additional feeds:**

| Source | URL | Region |
|--------|-----|--------|
| Al Jazeera | `https://www.aljazeera.com/xml/rss/all.xml` | Middle East |
| RT Business | `https://www.rt.com/rss/business/` | CIS |
| Nikkei Asia | `https://asia.nikkei.com/rss` | Asia |
| DW Business | `https://rss.dw.com/xml/rss-en-bus` | Europe |

---

## 3. Geopolitical Data APIs

### ACLED (Armed Conflict Location & Event Data)

- **Website**: https://acleddata.com
- **Free tier**: Free for researchers and non-commercial use (register required)
- **Coverage**: Political violence, protests, strategic events globally
- **Format**: CSV/JSON with coordinates

```env
ACLED_API_KEY=your_key_here
ACLED_EMAIL=your_email@example.com
```

```typescript
// Fetch recent conflict events
const response = await fetch(
  `https://api.acleddata.com/acled/read?key=${process.env.ACLED_API_KEY}&email=${process.env.ACLED_EMAIL}&event_date=${startDate}|${endDate}&event_date_where=BETWEEN&limit=100`
);
const data = await response.json();
return data.data.map((event: any) => ({
  id: event.data_id,
  title: event.notes.substring(0, 100),
  summary: event.notes,
  lat: parseFloat(event.latitude),
  lng: parseFloat(event.longitude),
  region: event.region,
  country: event.country,
  riskLevel: event.fatalities > 10 ? 'high' : event.fatalities > 0 ? 'medium' : 'low',
  publishedAt: new Date(event.event_date),
}));
```

### Global Conflict Tracker (Council on Foreign Relations)

- **Website**: https://www.cfr.org/global-conflict-tracker
- **Free tier**: Public data, scraping allowed with attribution
- **Coverage**: Major global conflicts, risk assessments
- **Note**: No official API — use web scraping or manual data updates

```typescript
// Manual conflict data structure for the geopolitical map
const CONFLICT_ZONES = [
  { name: 'Ukraine-Russia', lat: 48.3794, lng: 31.1656, risk: 'high', type: 'war' },
  { name: 'Israel-Palestine', lat: 31.5, lng: 34.75, risk: 'high', type: 'war' },
  { name: 'Taiwan Strait', lat: 24.0, lng: 121.0, risk: 'medium', type: 'tension' },
  { name: 'South China Sea', lat: 12.0, lng: 114.0, risk: 'medium', type: 'tension' },
  { name: 'Iran Nuclear', lat: 32.4279, lng: 53.688, risk: 'medium', type: 'sanctions' },
  // Update periodically from CFR data
];
```

---

## 4. Complete .env Configuration

```env
# === Database ===
DATABASE_URL=postgresql://admin:password@localhost:5432/fintelligence
REDIS_URL=redis://:password@localhost:6379

# === Authentication ===
JWT_SECRET=your_jwt_secret_min_32_chars_here
JWT_REFRESH_SECRET=your_refresh_secret_min_32_chars_here

# === AI ===
ANTHROPIC_API_KEY=sk-ant-api03-your_key_here

# === Financial Data ===
COINGECKO_API_KEY=CG-your_demo_key_here
ALPHA_VANTAGE_API_KEY=your_av_key_here
POLYGON_API_KEY=your_polygon_key_here
RAPIDAPI_KEY=your_rapidapi_key_here

# === News ===
NEWSAPI_KEY=your_newsapi_key_here

# === Geopolitical ===
ACLED_API_KEY=your_acled_key_here
ACLED_EMAIL=your_email@example.com

# === App Config ===
NODE_ENV=development
API_PORT=3001
WEB_PORT=3000
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_WS_URL=ws://localhost:3001
```

---

## 5. Migration Strategy

1. **Phase 1 (Free tier)**: CoinGecko (crypto) + Alpha Vantage (stocks/forex) + RSS feeds (news) + GDELT (geopolitical)
2. **Phase 2 (Low cost)**: Add Polygon.io Starter ($29/mo) for better stock data + NewsAPI Business for broader news
3. **Phase 3 (Production)**: Binance WebSocket for real-time crypto + Polygon Developer for real-time stocks + ACLED for conflict data

Each API integration follows the existing pattern in `apps/api/src/market/market.service.ts` — fetch from provider, cache in Redis with appropriate TTL, and return normalized data through the existing controller endpoints.
