# Architecture

## Overview

NOVIQ News is a monorepo-based full-stack application using Turborepo for orchestration. The architecture separates concerns into three layers: the frontend (Next.js), the backend (NestJS), and shared packages.

---

## System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      Client Layer                        │
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │              Next.js 15 (apps/web)                │   │
│  │                                                    │   │
│  │  ┌─────────┐  ┌──────────┐  ┌──────────────┐    │   │
│  │  │ App     │  │ Components│  │ State Mgmt   │    │   │
│  │  │ Router  │  │           │  │              │    │   │
│  │  │ [locale]│  │ layout/   │  │ Zustand      │    │   │
│  │  │ (auth)  │  │ widgets/  │  │ TanStack     │    │   │
│  │  │ (dash)  │  │ common/   │  │ Query        │    │   │
│  │  └─────────┘  └──────────┘  └──────────────┘    │   │
│  │                                                    │   │
│  │  ┌─────────┐  ┌──────────┐  ┌──────────────┐    │   │
│  │  │ Hooks   │  │ i18n     │  │ Socket.io    │    │   │
│  │  │         │  │ EN/DE/RU │  │ Client       │    │   │
│  │  └─────────┘  └──────────┘  └──────────────┘    │   │
│  └──────────────────────────────────────────────────┘   │
│                          │                               │
│                    REST + WebSocket                       │
│                          │                               │
│  ┌──────────────────────────────────────────────────┐   │
│  │              NestJS 11 (apps/api)                 │   │
│  │                                                    │   │
│  │  ┌─────────┐  ┌──────────┐  ┌──────────────┐    │   │
│  │  │ Auth    │  │ News     │  │ Market       │    │   │
│  │  │ Module  │  │ Module   │  │ Module       │    │   │
│  │  │ JWT     │  │ RSS      │  │ WebSocket    │    │   │
│  │  │ Refresh │  │ BullMQ   │  │ Gateway      │    │   │
│  │  └─────────┘  └──────────┘  └──────────────┘    │   │
│  │                                                    │   │
│  │  ┌─────────┐  ┌──────────┐  ┌──────────────┐    │   │
│  │  │ AI      │  │ Portfolio │  │ Cache        │    │   │
│  │  │ Claude  │  │ Holdings │  │ Redis        │    │   │
│  │  │ Stream  │  │ P&L      │  │ Pub/Sub      │    │   │
│  │  └─────────┘  └──────────┘  └──────────────┘    │   │
│  └──────────────────────────────────────────────────┘   │
│                          │                               │
│                          ▼                               │
│  ┌──────────────────────────────────────────────────┐   │
│  │              Data Layer                            │   │
│  │  ┌──────────────┐  ┌──────────────────────┐      │   │
│  │  │ PostgreSQL 16│  │ Redis 7              │      │   │
│  │  │ Prisma ORM   │  │ Cache + Pub/Sub      │      │   │
│  │  └──────────────┘  └──────────────────────┘      │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

---

## App Flow

### Request Lifecycle

1. **User opens app** → Next.js serves locale-specific page (`/en/dashboard`)
2. **Page loads** → React components mount, TanStack Query triggers API calls
3. **Data fetching** → REST calls to NestJS backend for news, market data, etc.
4. **Real-time updates** → Socket.io WebSocket connection for live prices, alerts
5. **State management** → Zustand for UI state, TanStack Query for server cache
6. **Rendering** → React Server Components for initial HTML, client components for interactivity

### Authentication Flow

```
Login → POST /auth/login → JWT access + refresh tokens (httpOnly cookies)
                         → Token refresh via /auth/refresh
                         → Route guards redirect unauthenticated users
```

---

## Data Flow

### News Pipeline

```
External Sources (RSS) → BullMQ Job Queue → Deduplication → PostgreSQL
                                          → Redis Cache (TTL: 5 min)
                                          → Socket.io Broadcast → Client
```

### Market Data Pipeline

```
CoinGecko/Alpha Vantage → Scheduled Polling → Redis Cache → WebSocket Push
                                             → Price Alerts Check → Notifications
```

---

## Component Strategy

### Hierarchy

```
Layout Components (layout/)
├── Header          — sticky nav, search, theme toggle, user menu
├── Sidebar         — collapsible nav, route links
├── LanguageSwitcher — EN/DE/RU locale toggle
├── ThemeToggle     — light/dark mode
└── NotificationBell — alerts dropdown

Widget Components (widgets/)
├── NewsFeedWidget          — virtualized news list with filtering
├── MarketOverview          — price cards with sparklines
├── GeopoliticalMap         — Leaflet map with risk zones
├── PredictionMarketsWidget — probability bars
├── EconomicCalendarWidget  — event countdown
├── PortfolioSummary        — holdings + P&L chart
├── PriceChart              — Recharts area chart
├── Heatmap                 — sector performance grid
├── AIQuickAnalyze          — Claude streaming widget
├── AlertsWidget            — alert management
└── LiveTicker              — scrolling headlines

Common Components (common/)
├── ErrorBoundary     — error catch with retry
├── LoadingSkeleton   — shimmer loading states
├── EmptyState        — illustrated empty states
├── AnimatedNumber    — number transitions
└── PercentageBadge   — color-coded percentage display
```

### Design Principles

- **Composition over inheritance** — small, focused components composed together
- **Server-first rendering** — use RSC where possible, client components only for interactivity
- **Colocated state** — state lives as close to where it's used as possible
- **Type safety** — shared types from `packages/shared` enforce contracts

---

## Styling Strategy

### Theme System

The design uses a CSS custom property system with semantic tokens:

```
Surfaces:  background → surface → surface-2 → surface-hover
Text:      text-primary → text-secondary → text-muted
Accent:    primary → primary-hover → primary-light → primary-glow
Semantic:  success → warning → error
```

### Light Mode (Default)

White base with deep blue accents. Clean, editorial, premium.

### Dark Mode

Deep blue-black base with lighter blue accents. Professional, terminal-inspired.

### Tailwind Integration

Custom theme extends Tailwind with semantic color tokens that auto-switch between light/dark modes via `@theme` directives.

---

## Performance Strategy

1. **React Server Components** — reduce client JS bundle
2. **Streaming** — progressive page rendering
3. **TanStack Virtual** — virtualized lists for news feeds (10,000+ items)
4. **Redis caching** — 5-minute TTL on frequently accessed data
5. **BullMQ** — offload heavy RSS processing to background jobs
6. **Image optimization** — Next.js Image component with lazy loading
7. **Code splitting** — dynamic imports for heavy widgets (Map, Charts)
8. **WebSocket** — efficient real-time updates instead of polling
9. **Intersection Observer** — lazy load sections as user scrolls
10. **CSS-only animations** — avoid JS-driven animation overhead

---

## Scaling Notes

### Horizontal Scaling

- **Frontend**: Deploy to Vercel/edge — stateless, auto-scales
- **Backend**: NestJS behind load balancer — session-less JWT auth
- **Database**: PostgreSQL read replicas for heavy read workloads
- **Cache**: Redis Cluster for distributed caching

### Feature Scaling

- **News sources**: Plugin architecture — add RSS feeds via config
- **Regions**: Extensible region system — add new regions without code changes
- **Widgets**: DnD Kit grid supports adding/removing widgets
- **Languages**: next-intl makes adding locales straightforward
- **APIs**: Modular NestJS architecture — each data source is an independent module

### Monitoring

- Health endpoint: `/health` — checks DB, Redis, external API status
- Structured logging via NestJS Logger
- Error tracking ready for Sentry integration
