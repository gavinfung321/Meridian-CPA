# Meridian CPA — Site Implementation Plan

Single source of truth for the current Hong Kong CPA marketing site. Earlier versioned plans (V2–V13) are superseded by this document.

---

## Overview

Marketing landing page for **Meridian CPA & Advisory** — audit, tax, and corporate services in Hong Kong. Bilingual (EN / 繁), conversion-led (Book → contact modal), credibility-first (credentials, partners, clients, FAQ).

| | |
|---|---|
| **Stack** | React 18, Vite, TypeScript, Tailwind, React Router |
| **Routes** | `/` (live homepage), `/about` (stub) |
| **i18n** | [`src/lib/translations.ts`](src/lib/translations.ts) — full EN + ZH |
| **Dev** | `npm run dev` |

---

## Information architecture

```
Nav (fixed)
→ Hero
→ Welcome (#about) + proofs
→ Office banner
→ Offer / Services (#services)
→ Audit Lifecycle (#process)
→ Why Us (#why-us)
→ Partners (#partners)
→ Clients (#clients)
→ FAQ (#faq)
→ Contact (#contact)
→ Documents banner
→ Footer
+ ContactModal (overlay)
```

**Nav anchors (thin):** About · Services · Audit Cycle · Our Team · FAQ · **Book**  
**On page but not in nav:** Why Us, Clients, Contact (reached by scroll / CTAs).

---

## Routes & shell

| Path | File | Status |
|------|------|--------|
| `/` | [`Desktop.tsx`](src/screens/Desktop/Desktop.tsx) | Live |
| `/about` | [`AboutUs.tsx`](src/screens/AboutUs/AboutUs.tsx) | Stub placeholder |

Lang state lives in [`App.tsx`](src/App.tsx) (`en` \| `zh`); sets `document.documentElement.lang`.

---

## Homepage sections

### 1. Top navigation
**File:** [`TopNavigationSection.tsx`](src/screens/Desktop/sections/TopNavigationSection/TopNavigationSection.tsx)

- Fixed dark green bar, Meridian logo, primary links, EN/繁, mobile burger
- **Book** CTA: short label (“Book” / “預約”); ghost outline over hero; solid white after ~65% viewport scroll; opens modal
- Hero keeps full “Book a Consultation” as primary CTA

### 2. Hero
**File:** [`HeroSection.tsx`](src/screens/Desktop/sections/HeroSection/HeroSection.tsx)  
**Image:** `/images/hero.png` (higher-resolution still; V14 feedback)

- Full-bleed photo + dark gradient
- Headline, one supporting line, solid white Book button → modal
- Social share preview uses separate `og-image.jpg` (not auto-synced to hero)

### 3. Welcome (`#about`)
**File:** [`MainContentSection.tsx`](src/screens/Desktop/sections/MainContentSection/MainContentSection.tsx)

- Firm intro copy + **More about Us** → `/about`
- Proof column: AFRC Registered · TCSP Licensed · HKICPA Practising (labels only — no fake licence numbers)

### 4. Office banner
**Image:** `/images/office.jpg` — short mid-page atmosphere strip

### 5. Offer / Services (`#services`)
**File:** `MainContentSection.tsx`

- Dark band; each service = **name + outcome** line
- Book a Consultation → modal (no dead “+more” / fake services page)

### 6. Audit Lifecycle (`#process`)
**File:** [`AuditTimelineSection.tsx`](src/screens/Desktop/sections/AuditTimelineSection/AuditTimelineSection.tsx)  
**Image:** `/images/audit-lifecycle.png`

- Numbered stages with connector (line does not cut through numbers)
- Gold accent on timeline markers

### 7. Why Us (`#why-us`)
**File:** [`WhyUsSection.tsx`](src/screens/Desktop/sections/WhyUsSection/WhyUsSection.tsx)  
**Image:** `/images/why-us.png`

- Split: arched team photo + **Why Meridian** title, two-line check reasons, Book → modal, proof caption under CTA
- No fake KPI badges; Lifecycle remains the only numbered process section

### 8. Partners (`#partners`)
**File:** [`PeopleSection.tsx`](src/screens/Desktop/sections/PeopleSection/PeopleSection.tsx)  
**Images:** `/images/partners/` (Andrew Lam, Cecilia Yam, Ringo Chiu, Wing Chan)

- Authority line above grid
- One title pill + specialty text per partner

### 9. Clients (`#clients`)
**File:** `MainContentSection.tsx`  
**Images:** `/images/clients/`

- Quiet quote treatment (no heavy white card chrome)
- Fade between testimonials; avatars + authors

### 10. FAQ (`#faq`)
**File:** [`FaqSection.tsx`](src/screens/Desktop/sections/FaqSection/FaqSection.tsx)

- Accordion; mirrored in JSON-LD FAQPage in `index.html`

### 11. Contact (`#contact`)
**File:** [`ContactSection.tsx`](src/screens/Desktop/sections/ContactSection/ContactSection.tsx)

- Left: headline, reply-expectation line, Book + WhatsApp
- Right (`md+`): Office address, email, phone (`md:ml-auto`)
- Reply line: usually within one business day

### 12. Documents banner
**Image:** `/images/documents.jpg`

### 13. Footer
**File:** [`FooterSection.tsx`](src/screens/Desktop/sections/FooterSection/FooterSection.tsx)

- LinkedIn, Facebook, Instagram, X (placeholder URLs until firm accounts exist)
- Back to top

### 14. Contact modal
**File:** [`ContactModal.tsx`](src/components/ContactModal.tsx)

- Opened from nav, hero, offer, contact
- Mailto submit; focus trap; Escape; success state; reset on close
- No backend form handler yet

---

## Brand & design system

| Token | Value | Use |
|-------|--------|-----|
| Forest green | `#0F2A1D` | Nav, contact band, brand |
| Gold | `#C9A84C` | Accents, hover, timeline |
| Cream / warm white | `#F9F9F6`, `#EDECE6` | Section grounds |
| Body text | `#2C3E35` | Copy on light surfaces |
| Sans | Geist | UI / body |
| Serif | Georgia stack (`font-serif`) | Display headings |

**Layout:** content max-width ~1180px; generous horizontal padding on large screens.  
**Motion:** scroll-reveal fade-ups (`useScrollAnimation`); intentional CTA hover scale; quote fade.

**Design rules in play:** one job per section; hero stays uncluttered; Book hierarchy = hero primary / nav secondary; no invented credentials.

---

## SEO & public assets

| Asset | Role |
|-------|------|
| [`index.html`](index.html) | Title, meta, OG/Twitter, JSON-LD Organization + FAQPage |
| [`public/robots.txt`](public/robots.txt) | Crawlers |
| [`public/sitemap.xml`](public/sitemap.xml) | `/`, `/about` |
| [`public/llms.txt`](public/llms.txt) | LLM-oriented site summary |
| [`public/favicon.svg`](public/favicon.svg) | Favicon |
| [`MeridianLogo.tsx`](src/components/MeridianLogo.tsx) | Wordmark + mark |

**Images root:** `public/images/` — hero, office, documents, audit-lifecycle, `partners/`, `clients/`.

---

## Stubbed / deferred

| Item | Notes |
|------|--------|
| `/about` | Placeholder only — firm story page not built |
| Contact form | Mailto only — no API / CRM |
| Footer socials | Generic platform URLs |
| Extra pages | Services detail, industries, case studies — not in prototype scope |
| Trust strip under hero | Tried then removed; proofs live in Welcome |

---

## Conversion map

| Entry | Action |
|-------|--------|
| Hero Book | Modal |
| Nav Book | Modal (quiet over hero, solid after scroll) |
| Offer Book | Modal |
| Contact Book | Modal |
| Contact WhatsApp | `wa.me` |
| Welcome More about Us | `/about` stub |

---

## Key files (quick index)

```
src/App.tsx
src/lib/translations.ts
src/components/ContactModal.tsx
src/components/MeridianLogo.tsx
src/screens/Desktop/Desktop.tsx
src/screens/Desktop/sections/
  TopNavigationSection/
  HeroSection/
  MainContentSection/     ← Welcome, Offer, Clients, banners
  AuditTimelineSection/
  WhyUsSection/
  PeopleSection/
  FaqSection/
  ContactSection/
  FooterSection/
src/screens/AboutUs/
public/images/
```

---

## Out of scope (for now)

- Expanding `/about` or other secondary pages during prototype
- Backend booking / email service
- Real social profile URLs until provided
- Invented licence / TC numbers
- New major sections (industries, awards, case studies) without real content

---

## Verify

- [ ] `npm run dev` — full scroll EN + 繁
- [ ] Nav Book ghost → solid after leaving hero
- [ ] All Book CTAs open modal; WhatsApp + mailto work
- [ ] Welcome proofs + offer outcomes + partners authority + contact reply line present
- [ ] Images load from `/images/…`
- [ ] `/about` stub reachable from Welcome
- [ ] `npm run build` passes
