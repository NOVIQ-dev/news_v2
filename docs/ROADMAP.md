# Roadmap

## Current Phase: v2.0 — Premium Redesign

The platform has been redesigned from a dark terminal-style dashboard to a premium white/blue editorial intelligence platform. The frontend now features a clean, publication-grade design with strong typography hierarchy, premium card system, and responsive layout.

### Completed in v2.0

- [x] Complete visual identity overhaul (dark → white/blue premium)
- [x] Premium hero/featured story section
- [x] Breaking news ticker bar
- [x] 3-column dashboard layout (News + Trending + Widgets)
- [x] Beautiful article card system (3 variants)
- [x] Market Pulse widget with live data cards
- [x] World regions map widget
- [x] Prediction markets widget
- [x] Regional filtering with pill navigation
- [x] Global Intelligence Brief section
- [x] Search modal (Cmd+K)
- [x] Dark/light mode toggle
- [x] Language selector (EN/DE/RU)
- [x] Responsive design (desktop → tablet → mobile)
- [x] Live news ticker
- [x] Scroll animations
- [x] Premium footer
- [x] Project documentation

---

## Short-Term Improvements (v2.1 — Next 2-4 weeks)

### UI/UX Polish
- [ ] Integrate redesigned frontend into Next.js monorepo
- [ ] Connect to NestJS backend API for real data
- [ ] Add skeleton loading states for all widgets
- [ ] Implement infinite scroll for news feed
- [ ] Add article detail modal/page
- [ ] Add bookmarking/save articles functionality
- [ ] Implement search with autocomplete and filters
- [ ] Add pull-to-refresh on mobile
- [ ] Keyboard navigation improvements (arrow keys in news list)
- [ ] Add tooltips for market data widgets

### Performance
- [ ] Implement TanStack Virtual for news list (10,000+ items)
- [ ] Add service worker for offline support
- [ ] Implement image optimization with Next.js Image
- [ ] Add prefetching for article detail pages
- [ ] Bundle analysis and code splitting audit

### Data Integration
- [ ] Connect real RSS news feeds
- [ ] CoinGecko API for live crypto prices
- [ ] Alpha Vantage for stock/forex data
- [ ] Add real-time WebSocket price updates
- [ ] Implement news deduplication pipeline

---

## Medium-Term Product Roadmap (v2.5 — 1-3 months)

### User Features
- [ ] User registration and authentication
- [ ] Personal news feed customization
- [ ] Saved articles and reading list
- [ ] Custom alert creation (price + keyword)
- [ ] Email digest (daily/weekly summary)
- [ ] Portfolio tracker integration
- [ ] Notification center

### Content & AI
- [ ] AI-powered article summarization (Claude)
- [ ] Sentiment analysis per article
- [ ] Related articles recommendation
- [ ] AI-generated intelligence briefs
- [ ] Topic clustering and trending detection
- [ ] Source credibility scoring

### Platform
- [ ] Polymarket prediction market integration
- [ ] Economic calendar with event impact data
- [ ] Heatmap widget for sector performance
- [ ] Interactive geopolitical risk map (Leaflet)
- [ ] Drag-and-drop widget reordering

### i18n & Localization
- [ ] Complete EN/DE/RU translation coverage
- [ ] Add Italian (IT) locale
- [ ] Add French (FR) locale
- [ ] Currency and date format per locale
- [ ] RTL support preparation (Arabic)

---

## Long-Term Roadmap (v3.0 — 3-6 months)

### Product Expansion
- [ ] Mobile app (React Native or Capacitor)
- [ ] Chrome extension for quick news access
- [ ] Email newsletter product
- [ ] Public API for news data
- [ ] Embeddable widgets for other sites
- [ ] White-label solution

### Advanced Features
- [ ] Real-time collaborative annotations
- [ ] Custom dashboard layouts per user
- [ ] Advanced charting (TradingView integration)
- [ ] News source management (add/remove feeds)
- [ ] A/B testing framework for UI experiments
- [ ] Multi-tenant architecture for teams

### Analytics & Insights
- [ ] Reading behavior analytics
- [ ] Topic interest profiling
- [ ] Engagement metrics dashboard
- [ ] Content performance tracking
- [ ] User retention analysis

### Monetization
- [ ] Freemium tier system
- [ ] Stripe payment integration
- [ ] Pro features (AI analysis, custom alerts, API access)
- [ ] Enterprise team accounts
- [ ] Sponsored content placement system

---

## Technical Debt & Future Enhancements

### Code Quality
- [ ] Remove duplicate header/sidebar components (`layout/` vs `ui/`)
- [ ] Extract hardcoded mock data into fixtures
- [ ] Add comprehensive unit tests (Vitest)
- [ ] Add E2E tests (Playwright)
- [ ] Set up CI/CD pipeline (GitHub Actions)
- [ ] Add Storybook for component documentation
- [ ] Implement strict CSP headers

### Architecture
- [ ] Migrate to event-driven architecture (CQRS)
- [ ] Add GraphQL layer for efficient data fetching
- [ ] Implement edge caching (Cloudflare/Vercel)
- [ ] Add database connection pooling (PgBouncer)
- [ ] Container orchestration (Kubernetes)
- [ ] Observability stack (OpenTelemetry + Grafana)

### Security
- [ ] Rate limiting per endpoint
- [ ] Input sanitization audit
- [ ] CORS configuration review
- [ ] Add CSP headers
- [ ] Regular dependency audit
- [ ] Implement refresh token rotation
