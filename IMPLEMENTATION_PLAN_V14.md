# Meridian CPA — Implementation Plan V14 (Post-feedback)

Feedback-driven pass after the bilingual landing + metadata ship. Scope is intentionally small.

---

## Feedback summary

| Feedback | Decision |
|----------|----------|
| Hero photo feels low-res / soft | Replace with attached higher-resolution hero photo |
| Social OG preview | **Keep existing `og-image.jpg`** — do not regenerate from the new hero |

---

## 1. Hero photo upgrade

**Why:** First viewport is brand + place. A sharper Hong Kong office / harbour hero improves trust and polish without layout changes.

**Files:**
- [`public/images/hero.png`](public/images/hero.png) — replace in place (same path)
- [`HeroSection.tsx`](src/screens/Desktop/sections/HeroSection/HeroSection.tsx) — no code change (still `/images/hero.png`)

**Do:**
- Swap `hero.png` with the provided higher-resolution still (same composition family: two professionals, Central harbour view)
- Keep existing dark gradient overlay and white Book CTA
- Do **not** change hero copy, padding, or CTA hierarchy

**Do not:**
- Regenerate [`public/og-image.jpg`](public/og-image.jpg)
- Change OG/Twitter absolute URLs in [`index.html`](index.html)
- Touch office / documents / lifecycle banners

---

## Out of scope (this pass)

- About page expansion
- Metadata / OG refresh
- Nav, modal, translations
- Partner / client photo swaps

---

## Verify

- [ ] Hero loads sharper at full viewport (desktop + mobile)
- [ ] Gradient + headline + Book CTA still readable
- [ ] `og-image.jpg` unchanged from last metadata commit
- [ ] Social preview still uses existing OG asset after deploy (no forced re-scrape required for this change)
- [ ] `npm run build` passes

---

## Work order

1. Replace `public/images/hero.png`
2. Visual check in browser
3. Commit / push when ready (hero only + this plan)
