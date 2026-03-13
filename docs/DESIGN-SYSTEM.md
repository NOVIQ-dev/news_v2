# Design System

NOVIQ News uses a premium white/blue design language inspired by financial intelligence platforms, editorial dashboards, and modern SaaS products.

---

## Color Palette

### Light Mode (Default)

| Role | Hex | Usage |
|---|---|---|
| **Background** | `#FFFFFF` | Page background |
| **Surface** | `#F8FAFD` | Cards, panels |
| **Surface-2** | `#EFF4FA` | Nested surfaces, section backgrounds |
| **Border** | `#E2E8F0` | Card borders, dividers |
| **Border-light** | `#CBD5E1` | Subtle separators |
| **Text Primary** | `#0F172A` | Headings, body text |
| **Text Secondary** | `#475569` | Descriptions, metadata |
| **Text Muted** | `#94A3B8` | Timestamps, tertiary info |
| **Primary** | `#1E40AF` | Deep royal blue — buttons, links, active states |
| **Primary Hover** | `#1D4ED8` | Hover state for primary elements |
| **Primary Light** | `#DBEAFE` | Badge backgrounds, subtle highlights |
| **Primary Glow** | `rgba(30,64,175,0.1)` | Ambient glow effects |
| **Success** | `#059669` | Positive sentiment, gains |
| **Error** | `#DC2626` | Negative sentiment, losses, breaking |
| **Warning** | `#D97706` | Alerts, caution indicators |

### Dark Mode

| Role | Hex | Usage |
|---|---|---|
| **Background** | `#0B1120` | Page background |
| **Surface** | `#111827` | Cards, panels |
| **Surface-2** | `#1E293B` | Nested surfaces |
| **Border** | `#334155` | Card borders |
| **Text Primary** | `#F1F5F9` | Headings, body text |
| **Text Secondary** | `#94A3B8` | Descriptions |
| **Text Muted** | `#64748B` | Tertiary info |
| **Primary** | `#3B82F6` | Bright blue — buttons, links |
| **Success** | `#10B981` | Positive indicators |
| **Error** | `#EF4444` | Negative indicators |

---

## Typography

### Font Stack

| Role | Font | Weights | Usage |
|---|---|---|---|
| **Display** | Inter | 600, 700 | Section headings, page titles |
| **Body** | Inter | 400, 500 | Body text, descriptions, UI labels |
| **Data** | JetBrains Mono | 400, 600 | Prices, percentages, metrics |

### Type Scale

| Token | Size | Usage |
|---|---|---|
| `text-xs` | 12px | Timestamps, metadata, badges |
| `text-sm` | 14px | Body text, descriptions, labels |
| `text-base` | 16px | Standard body, card titles |
| `text-lg` | 18px | Section headings, featured text |
| `text-xl` | 20px | Page titles, hero elements |
| `text-2xl` | 24px | Hero headline only |
| `text-3xl` | 30px | Featured hero headline only |

### Hierarchy Rules

- **Maximum 4 type sizes per section**
- **Section labels**: uppercase, letter-spacing 0.05em, text-xs, font-weight 700, primary color
- **Headlines**: font-weight 600-700, text-lg or text-xl
- **Body**: font-weight 400, text-sm, text-secondary color
- **Metadata**: font-weight 400-500, text-xs, text-muted color

---

## Spacing

4px base grid system:

| Token | Value | Usage |
|---|---|---|
| `space-1` | 4px | Icon gaps, tight padding |
| `space-2` | 8px | Badge padding, small gaps |
| `space-3` | 12px | Card inner padding, button padding |
| `space-4` | 16px | Standard component gap |
| `space-5` | 20px | Card padding |
| `space-6` | 24px | Section header gaps |
| `space-8` | 32px | Section padding |
| `space-10` | 40px | Major section breaks |
| `space-12` | 48px | Page section padding |
| `space-16` | 64px | Hero section padding |

### Rules
- Content max-width: 1320px with 24px horizontal padding
- Card padding: 20px-24px
- Grid gap: 24px (desktop), 16px (mobile)
- Section gap: 48px-64px vertical

---

## Shadows

| Level | Value | Usage |
|---|---|---|
| **None** | `none` | Default card state |
| **Subtle** | `0 1px 3px rgba(0,0,0,0.04)` | Resting cards |
| **Medium** | `0 4px 12px rgba(0,0,0,0.06)` | Hovered cards |
| **Elevated** | `0 8px 32px rgba(0,0,0,0.08)` | Modals, dropdowns |
| **Strong** | `0 20px 60px rgba(0,0,0,0.12)` | Search overlay |

---

## Border Radius

| Token | Value | Usage |
|---|---|---|
| `radius-sm` | 6px | Badges, small elements |
| `radius-md` | 8px | Buttons, inputs |
| `radius-lg` | 12px | Cards, panels |
| `radius-xl` | 16px | Hero cards, modals |
| `radius-full` | 9999px | Pills, avatars, circular elements |

---

## Component States

### Cards

```
Default:    bg: surface, border: border, shadow: subtle, radius: radius-lg
Hover:      border: primary/20, shadow: medium, translateY: -2px
Active:     border: primary/30, shadow: medium
```

### Buttons (Primary)

```
Default:    bg: primary, color: white, radius: radius-md
Hover:      bg: primary-hover, shadow: medium
Active:     bg: primary-hover, scale: 0.98
Disabled:   opacity: 0.5, cursor: not-allowed
```

### Badges

```
Category:   bg: primary-light, color: primary, radius: radius-sm, text-xs, uppercase
Region:     bg: surface-2, border: border, color: text-secondary
Sentiment:  positive → success color, negative → error color, neutral → text-muted
```

### Filter Pills

```
Inactive:   bg: transparent, border: border, color: text-secondary
Active:     bg: primary, border: primary, color: white
Hover:      border: primary/40, color: primary
```

---

## UI Principles

### 1. Premium Minimalism

Avoid visual clutter. Every element must earn its place. White space is a design tool — use it intentionally to create breathing room and visual hierarchy.

### 2. Information Density Without Noise

Display more information in less space, but maintain clarity through:
- Strong typographic hierarchy
- Consistent spacing rhythm
- Color-coded categories
- Compact but readable card layouts

### 3. Editorial Elegance

The interface should feel like a premium financial publication:
- Clean sans-serif typography
- Monospace for data/numbers
- Subtle blue accents (not overwhelming)
- Professional photography-style card images

### 4. Dashboard Intelligence

Combine the best of news editorial and SaaS dashboard design:
- Widget-based layout with clear sections
- Real-time data with live indicators
- Filtering and search as first-class features
- Scannable headline lists

### 5. Trustworthy & Credible

The design should communicate reliability:
- Conservative color usage (blue = trust)
- Clean, structured layouts
- Professional typography
- No flashy animations or gimmicks
- Subtle transitions that feel confident

### 6. Responsive Priority

- Mobile-first CSS approach
- Touch-friendly targets (min 44px)
- Progressive disclosure on smaller screens
- Hamburger navigation on mobile
- Stacked layouts on narrow viewports

---

## Animation Guidelines

| Type | Duration | Easing | Usage |
|---|---|---|---|
| **Hover** | 200ms | ease | Card lifts, color changes |
| **Toggle** | 300ms | ease | Theme switch, menu open |
| **Scroll reveal** | 500ms | ease-out | Section entry animations |
| **Ticker** | 30s | linear | News/market ticker scroll |
| **Breaking** | 20s | linear | Breaking news scroll |
| **Pulse** | 2s | ease-in-out | Live indicator dot |

### Rules
- No heavy JS-driven animations
- CSS transitions preferred over Framer Motion where possible
- Respect `prefers-reduced-motion`
- Never animate layout properties (width, height) — use transform only
- Keep total animation budget under 16ms per frame
