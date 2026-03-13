# Changelog

All notable changes to the NOVIQ News platform are documented here.

---

## [2.0.0] — 2026-03-14

### Visual Identity Overhaul

**Complete redesign** from dark terminal-style dashboard (`#0A0E1A` background, `#00D4FF` accent) to a premium white/blue editorial intelligence platform (`#FFFFFF` background, `#1E40AF` deep royal blue).

**Why:** The original dark theme with cyan accents felt like a developer tool rather than a premium news product. The new white/blue identity communicates trust, credibility, and editorial quality — aligned with the brand positioning as a "global intelligence platform."

### Added

#### Layout & Structure
- **Premium hero section** — full-width featured story with gradient overlay, category badges, and metadata
- **Breaking news bar** — red-accented scrolling ticker for urgent headlines
- **3-column main grid** — Latest News (article cards) + Trending (ranked headlines) + Sidebar (Market Pulse, World Map, Predictions)
- **Regional filtering section** — pill-based region navigation with card grid
- **Global Intelligence Brief** — AI-powered editorial analysis cards
- **Premium footer** — multi-column with navigation, social links, attribution

#### Navigation
- **Sticky navbar** with glassmorphism backdrop blur
- **Custom SVG NOVIQ logo** — geometric mark that works at all sizes
- **Cmd+K search modal** with category suggestions
- **Language selector** — EN/DE/RU toggle
- **Theme toggle** — light/dark mode with icon transition

#### Article Cards
- **3 card variants**: large featured (with image), horizontal (thumbnail + text), compact list (trending)
- Category and region badges with semantic color coding
- Sentiment indicators (positive/negative/neutral)
- Source attribution and relative timestamps
- Hover effects with elevation and border color transitions

#### Widgets
- **Market Pulse** — 6 market data cards (BTC, ETH, S&P 500, Gold, EUR/USD, Brent Oil) with price, change%, and color-coded indicators
- **Active Regions map** — SVG world map with color-coded activity indicators
- **Predictions** — Polymarket-style probability bars with trade volume

#### Data
- **20+ mock articles** covering finance, technology, defense, energy, geopolitics
- **Realistic market data** with directional indicators
- **8 trending headlines** with numbered ranking
- **4 breaking news** items
- **4 prediction market** questions with probabilities
- **3 intelligence brief** cards

### Improved

#### Design Quality
- **Typography hierarchy** — from flat text sizing to structured scale (Inter 300-800 + JetBrains Mono for data)
- **Spacing consistency** — 4px grid system replacing arbitrary values
- **Color system** — from hardcoded hex values to semantic CSS custom properties with both light/dark variants
- **Card design** — from flat text-only items to image-enhanced cards with proper visual hierarchy
- **Section structure** — from widget-only grid to editorial flow (hero → breaking → feed → regions → intelligence)

#### UX
- **Readability** — from small text on dark background to high-contrast text on white surface
- **Scanning** — from uniform widget grid to scannable headline hierarchy
- **Navigation** — from sidebar-only to full horizontal nav with search
- **Information architecture** — clear section labeling (FEED, POPULAR, MARKET PULSE, etc.)
- **Mobile experience** — proper responsive breakpoints instead of desktop-only layout

#### Performance
- **CSS-only animations** replacing Framer Motion for scroll reveals and transitions
- **Lazy loading** with Intersection Observer instead of eager rendering
- **Single file deployment** — no build step required for the static frontend
- **Minimal JS** — vanilla JavaScript only, no framework overhead

### Changed

- **Color palette**: `#0A0E1A/#00D4FF` (dark/cyan) → `#FFFFFF/#1E40AF` (white/royal blue)
- **Font stack**: Syne (display) + Inter (body) → Inter (all UI) + JetBrains Mono (data)
- **Theme default**: dark mode first → light mode first
- **Navigation pattern**: collapsible sidebar → horizontal sticky navbar
- **News display**: text-only list items → image-enhanced article cards
- **Homepage layout**: flat widget grid → editorial hierarchy with hero

### Removed

- **Glass morphism overuse** — reduced from global pattern to navbar-only
- **Glow effects** — removed `glow-accent` and `glow-text` utilities (too gaming/terminal)
- **Gradient borders** — removed decorative gradient border pattern
- **Duplicate components** — identified `layout/header.tsx` + `ui/header.tsx` duplication (to be merged in v2.1)

### Technical

- Created standalone `frontend/index.html` for the redesigned UI
- Created comprehensive documentation:
  - `README.md` — project overview, setup, features
  - `ARCHITECTURE.md` — system design, data flow, scaling
  - `DESIGN-SYSTEM.md` — colors, typography, spacing, component states
  - `ROADMAP.md` — short/medium/long-term product plans
  - `CHANGELOG.md` — this file

---

## [1.0.0] — 2026-03-03

### Initial Release

- Monorepo setup with Turborepo (pnpm)
- Next.js 15 frontend with App Router
- NestJS 11 backend with modular architecture
- Dark terminal-style theme (#0A0E1A + #00D4FF)
- Widget-based dashboard with DnD Kit
- News feed with RSS aggregation
- Market data via WebSocket
- Geopolitical map (Leaflet)
- Prediction markets widget
- Economic calendar
- Portfolio tracker
- AI analysis (Claude)
- Alert system
- i18n (EN/DE/RU) via next-intl
- JWT authentication
- PostgreSQL + Redis + Docker setup
