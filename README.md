# NOVIQ News — Global Intelligence Platform

A premium, real-time global news intelligence platform. Aggregates news from world-class sources, provides market data, geopolitical analysis, prediction markets, and AI-powered intelligence briefs — all in a clean white/blue editorial dashboard.

Supports **English**, **Deutsch**, and **Русский** with seamless locale switching.

---

## Tech Stack

### Frontend (Redesigned)
- **Next.js 15** — App Router, React Server Components, Streaming
- **TypeScript** — strict mode
- **Tailwind CSS v4** — JIT, custom white/blue premium theme
- **Radix UI** — accessible headless components
- **Framer Motion** — animations, transitions
- **TanStack Query v5** — server state management
- **Zustand** — UI state
- **Recharts** — charts, sparklines
- **next-intl** — i18n: EN / DE / RU
- **Leaflet.js** — geopolitical map
- **DnD Kit** — drag-to-reorder widgets
- **Socket.io Client** — real-time updates

### Backend
- **NestJS 11** — modular architecture
- **PostgreSQL 16** — via Prisma ORM
- **Redis 7** — caching, pub/sub, rate limiting
- **BullMQ** — job queues
- **Socket.io** — WebSocket gateway
- **Passport.js + JWT** — auth with refresh token rotation
- **Anthropic API** — Claude for AI analysis
- **Swagger** — auto-generated API docs

---

## Project Structure

```
noviq-news/
├── apps/
│   ├── web/                       # Next.js frontend
│   │   ├── messages/              # i18n translations (en, de, ru)
│   │   └── src/
│   │       ├── app/[locale]/      # Locale-routed pages
│   │       │   ├── (auth)/        # Login, Register
│   │       │   └── (dashboard)/   # Dashboard, News, Markets, Portfolio,
│   │       │                        Calendar, Predictions, Analysis,
│   │       │                        Alerts, Settings
│   │       ├── components/
│   │       │   ├── common/        # ErrorBoundary, Skeleton, AnimatedNumber
│   │       │   ├── dashboard/     # WidgetGrid, WidgetWrapper (DnD)
│   │       │   ├── layout/        # Sidebar, Header, LanguageSwitcher
│   │       │   └── widgets/       # MarketOverview, NewsFeed, PriceChart,
│   │       │                        Heatmap, Calendar, Predictions,
│   │       │                        Portfolio, AI, Map, Alerts, Ticker
│   │       ├── hooks/             # useMarketData, useNews, useAuth
│   │       ├── lib/               # API client, Socket.io, utilities
│   │       ├── providers/         # QueryProvider, ThemeProvider
│   │       └── stores/            # Zustand UI store
│   │
│   └── api/                       # NestJS backend
│       ├── prisma/                # Schema + migrations
│       └── src/
│           ├── auth/              # JWT auth, guards, strategies
│           ├── users/             # User CRUD, preferences
│           ├── market/            # Price feeds, WebSocket gateway
│           ├── news/              # RSS aggregation, BullMQ, dedup
│           ├── portfolio/         # Holdings, P&L, CSV export
│           ├── alerts/            # Price/news alerts, pub/sub
│           ├── ai/               # Claude streaming, chat history
│           ├── calendar/          # Economic events
│           ├── prediction/        # Polymarket integration
│           ├── cache/             # Redis service
│           ├── websocket/         # Socket.io events gateway
│           ├── health/            # Health checks
│           └── common/            # Guards, filters, decorators
│
├── packages/
│   ├── shared/                    # Shared TypeScript types
│   └── ui/                        # Design system (Radix + Tailwind)
│
├── frontend/                      # Redesigned standalone frontend
│   └── index.html                 # Premium white/blue news dashboard
│
├── docker/
│   ├── docker-compose.yml
│   └── postgres/init.sql
│
├── docs/
│   ├── ARCHITECTURE.md
│   ├── ROADMAP.md
│   ├── DESIGN-SYSTEM.md
│   └── CHANGELOG.md
│
└── README.md
```

---

## Prerequisites

- **Node.js** >= 22
- **pnpm** >= 9.15
- **Docker** & **Docker Compose** (for databases)

---

## Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/NOVIQ-dev/news_v2.git
cd news_v2
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
pnpm docker:up
```

### 4. Set Up Database

```bash
pnpm db:generate
pnpm db:migrate
```

### 5. Start Development Servers

```bash
# Both frontend and backend
pnpm dev

# Or individually:
pnpm --filter api start:dev   # Backend (http://localhost:3001)
pnpm --filter web dev         # Frontend (http://localhost:3000)
```

### 6. Access the App

- **Frontend**: http://localhost:3000 (redirects to `/en/dashboard`)
- **API**: http://localhost:3001
- **API Docs**: http://localhost:3001/api/docs (Swagger)
- **Standalone Frontend**: Open `frontend/index.html` directly

---

## Environment Variables

| Variable | Description | Required |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `REDIS_URL` | Redis connection string | Yes |
| `JWT_SECRET` | JWT signing secret (min 32 chars) | Yes |
| `JWT_REFRESH_SECRET` | Refresh token secret (min 32 chars) | Yes |
| `ANTHROPIC_API_KEY` | Anthropic API key for AI analysis | Yes |
| `COINGECKO_API_KEY` | CoinGecko API for crypto prices | No |
| `ALPHA_VANTAGE_API_KEY` | Alpha Vantage for market data | No |
| `POLYMARKET_API_KEY` | Polymarket for prediction markets | No |

---

## Features

| Feature | Description |
|---|---|
| **Dashboard** | Modular drag-to-reorder widget grid with live data |
| **Global News Feed** | 50+ RSS sources, region/tag filtering, AI summaries |
| **Market Data** | Real-time crypto, forex, indices, commodities via WebSocket |
| **Geopolitical Map** | Interactive map with conflict markers and risk zones |
| **Prediction Markets** | Polymarket integration with probability bars |
| **Economic Calendar** | Upcoming macro events with countdown timers |
| **Portfolio Tracker** | Manual asset tracking with P&L and allocation charts |
| **AI Analysis** | Claude-powered streaming analysis with chat history |
| **Alerts** | Price and news alerts via WebSocket push |
| **i18n** | Full English, German, Russian translations |
| **Premium Theme** | White/blue editorial design with dark mode toggle |
| **Live Ticker** | Scrolling headline and market data ticker |
| **Search** | Cmd+K search with category suggestions |
| **Regional Filtering** | Global, Europe, Americas, Asia, Middle East, CIS |
| **Trending Section** | Real-time trending headlines with numbered ranking |
| **Intelligence Briefs** | AI-powered geopolitical analysis summaries |

---

## Scripts

| Script | Description |
|---|---|
| `pnpm dev` | Start all services in development |
| `pnpm build` | Build all packages |
| `pnpm start` | Start production servers |
| `pnpm lint` | Run ESLint across monorepo |
| `pnpm test` | Run tests |
| `pnpm db:generate` | Generate Prisma client |
| `pnpm db:migrate` | Run database migrations |
| `pnpm db:push` | Push schema to database |
| `pnpm docker:up` | Start Docker containers |
| `pnpm docker:down` | Stop Docker containers |

---

## Deployment

### Docker (Full Stack)

```bash
cd docker
cp .env.docker .env
docker compose up --build -d
```

### Frontend Only (Static)

The `frontend/index.html` can be deployed to any static hosting:
- Vercel
- Netlify
- Cloudflare Pages
- AWS S3 + CloudFront

---

## License

Private — All rights reserved. © 2026 NOVIQ
