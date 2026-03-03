# FinTelligence - Financial & Geopolitical Intelligence Dashboard

A premium, real-time financial and geopolitical intelligence platform. Aggregates market data, geopolitical news, prediction markets, economic calendars, and AI-powered analysis into a unified dark-themed dashboard.

Supports **English**, **Deutsch**, and **Русский** with seamless locale switching.

## Tech Stack

### Frontend
- **Next.js 15** (App Router, React Server Components, Streaming)
- **TypeScript** (strict mode)
- **Tailwind CSS v4** (JIT, custom dark theme)
- **Radix UI** (accessible headless components)
- **Framer Motion** (animations, transitions)
- **TanStack Query v5** (server state management)
- **Zustand** (UI state)
- **Recharts** (charts, sparklines)
- **next-intl** (i18n: EN / DE / RU)
- **Leaflet.js** (geopolitical map)
- **DnD Kit** (drag-to-reorder widgets)
- **Socket.io Client** (real-time updates)

### Backend
- **NestJS 11** (modular architecture)
- **PostgreSQL 16** (via Prisma ORM)
- **Redis 7** (caching, pub/sub, rate limiting)
- **BullMQ** (job queues)
- **Socket.io** (WebSocket gateway)
- **Passport.js + JWT** (auth with refresh token rotation)
- **Anthropic API** (claude-opus-4-6 for AI analysis)
- **Swagger** (auto-generated API docs)

## Project Structure

```
fintelligence/
├── apps/
│   ├── web/                    # Next.js frontend
│   │   ├── messages/           # i18n translations (en, de, ru)
│   │   └── src/
│   │       ├── app/[locale]/   # Locale-routed pages
│   │       │   ├── (auth)/     # Login, Register
│   │       │   └── (dashboard)/ # Dashboard, News, Market, Portfolio,
│   │       │                     Calendar, Predictions, Analysis,
│   │       │                     Alerts, Settings
│   │       ├── components/
│   │       │   ├── common/     # ErrorBoundary, Skeleton, AnimatedNumber
│   │       │   ├── dashboard/  # WidgetGrid, WidgetWrapper (DnD)
│   │       │   ├── layout/     # Sidebar, Header, LanguageSwitcher
│   │       │   ├── ui/         # Ticker, Sidebar, Header
│   │       │   └── widgets/    # MarketOverview, NewsFeed, PriceChart,
│   │       │                     Heatmap, Calendar, Predictions,
│   │       │                     Portfolio, AI, Map, Alerts, Ticker
│   │       ├── hooks/          # useMarketData, useNews, useAuth
│   │       ├── lib/            # API client, Socket.io, utilities
│   │       ├── providers/      # QueryProvider, ThemeProvider
│   │       └── stores/         # Zustand UI store
│   │
│   └── api/                    # NestJS backend
│       ├── prisma/             # Schema + migrations
│       └── src/
│           ├── auth/           # JWT auth, guards, strategies
│           ├── users/          # User CRUD, preferences
│           ├── market/         # Price feeds, WebSocket gateway
│           ├── news/           # RSS aggregation, BullMQ, dedup
│           ├── portfolio/      # Holdings, P&L, CSV export
│           ├── alerts/         # Price/news alerts, pub/sub
│           ├── ai/             # Claude streaming, chat history
│           ├── calendar/       # Economic events
│           ├── prediction/     # Polymarket integration
│           ├── cache/          # Redis service
│           ├── websocket/      # Socket.io events gateway
│           ├── health/         # Health checks
│           └── common/         # Guards, filters, decorators
│
├── packages/
│   ├── shared/                 # Shared TypeScript types
│   └── ui/                     # Design system (Radix + Tailwind)
│
└── docker/
    ├── docker-compose.yml
    └── postgres/init.sql
```

## Prerequisites

- **Node.js** >= 22
- **pnpm** >= 9.15
- **Docker** & **Docker Compose** (for databases)

## Quick Start

### 1. Clone & Install

```bash
cd fintelligence
pnpm install
```

### 2. Set Up Environment

```bash
cp .env.example .env
```

Edit `.env` with your actual values:

```env
DB_PASSWORD=your_secure_password
DATABASE_URL=postgresql://admin:your_secure_password@localhost:5432/fintelligence
REDIS_PASSWORD=your_redis_password
REDIS_URL=redis://:your_redis_password@localhost:6379
JWT_SECRET=your_jwt_secret_at_least_32_characters
JWT_REFRESH_SECRET=your_refresh_secret_at_least_32_characters
ANTHROPIC_API_KEY=sk-ant-your-key-here
```

### 3. Start Databases

```bash
# Start PostgreSQL and Redis
pnpm docker:up
```

Or manually:
```bash
cd docker
docker compose up -d postgres redis
```

### 4. Set Up Database

```bash
# Generate Prisma client
pnpm db:generate

# Run migrations
pnpm db:migrate
```

### 5. Start Development Servers

```bash
# Start both frontend and backend
pnpm dev
```

Or individually:
```bash
# Backend (http://localhost:3001)
pnpm --filter api start:dev

# Frontend (http://localhost:3000)
pnpm --filter web dev
```

### 6. Access the App

- **Frontend**: http://localhost:3000 (redirects to `/en/dashboard`)
- **API**: http://localhost:3001
- **API Docs**: http://localhost:3001/api/docs (Swagger)
- **Health Check**: http://localhost:3001/health

## Docker (Full Stack)

To run everything in Docker:

```bash
cd docker
cp .env.docker .env
# Edit .env with your credentials
docker compose up --build -d
```

## Features

| Feature | Description |
|---------|-------------|
| **Dashboard** | Modular drag-to-reorder widget grid with live data |
| **Market Data** | Real-time crypto, forex, indices, commodities via WebSocket |
| **News Feed** | 50+ RSS sources, region/tag filtering, AI summaries |
| **Geopolitical Map** | Leaflet.js with conflict markers and risk zones |
| **Prediction Markets** | Polymarket integration with probability bars |
| **Economic Calendar** | Upcoming macro events with countdown timers |
| **Portfolio Tracker** | Manual asset tracking with P&L and allocation charts |
| **AI Analysis** | Claude-powered streaming analysis with chat history |
| **Alerts** | Price and news alerts via WebSocket push |
| **i18n** | Full English, German, Russian translations |
| **Dark Theme** | Premium Bloomberg Terminal aesthetic with light toggle |
| **Live Ticker** | Scrolling headline and price ticker |

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Create account |
| POST | `/auth/login` | Login (sets httpOnly cookies) |
| POST | `/auth/refresh` | Refresh access token |
| POST | `/auth/logout` | Invalidate tokens |
| GET | `/users/me` | Current user profile |
| PATCH | `/users/me` | Update preferences |
| GET | `/market/prices` | Live asset prices |
| GET | `/market/asset/:symbol` | Detailed asset data |
| GET | `/market/heatmap` | Sector heatmap |
| GET | `/news` | Paginated news feed |
| POST | `/news/:id/summarize` | AI news summary |
| GET | `/portfolio` | User portfolio |
| POST | `/portfolio` | Add holding |
| GET | `/portfolio/summary` | P&L summary |
| GET | `/portfolio/export` | Export CSV |
| GET | `/alerts` | User alerts |
| POST | `/alerts` | Create alert |
| POST | `/ai/analyze` | AI analysis (SSE stream) |
| GET | `/ai/chats` | Chat history |
| GET | `/calendar/events` | Economic events |
| GET | `/predictions` | Prediction markets |
| GET | `/health` | System health check |

## Design System

| Token | Value | Usage |
|-------|-------|-------|
| Background | `#0A0E1A` | Page background |
| Surface | `#0F1629` | Cards, panels |
| Border | `rgba(255,255,255,0.08)` | Glass-morphism borders |
| Accent | `#00D4FF` | Primary actions, highlights |
| Positive | `#00FF88` | Gains, success |
| Negative | `#FF4444` | Losses, errors |
| Warning | `#FFAA00` | Alerts, caution |

Typography: **Inter** (body) + **Syne** (headings) + **JetBrains Mono** (data/numbers)

## Internationalization

Locale-based routing with `next-intl`:
- `/en/dashboard` - English
- `/de/dashboard` - Deutsch
- `/ru/dashboard` - Русский

All 200+ UI strings are fully translated. Currency and date formatting respects user locale via `Intl.NumberFormat` and `date-fns`.

## License

Private - All rights reserved.
