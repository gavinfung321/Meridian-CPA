# Meridian CPA — IMPLEMENTATION PLAN V17

**Supersedes:** V15 sticky stack, V16 6-grid experiments.

## Goal

Why Us as a **photo split**: team image + short argument + Book — shorter, more premium, no fake stats.

## Approach

| Side | Content |
|------|---------|
| Left | `/images/why-us.png` — arched bottom (`rounded-b-[50%]`), no floating KPI badges |
| Right | WHY US label + gold rule, title, subtitle, 4 gold-check reasons, AFRC·TCSP·HKICPA proof line, Book → modal |

## Files

- [`public/images/why-us.png`](public/images/why-us.png)
- [`AuditMethodologySection.tsx`](src/screens/Desktop/sections/AuditMethodologySection/AuditMethodologySection.tsx)
- [`MainContentSection.tsx`](src/screens/Desktop/sections/MainContentSection/MainContentSection.tsx) — `onBookClick`
- [`translations.ts`](src/lib/translations.ts) — `reasons`, `imageAlt`, `proof`

## Out of scope

- Fake success-rate / years badges
- 6-card grid / scroll-dim / Lifecycle-style numbers
- OG regeneration

## Verify

- [x] Full-res photo wired
- [x] Four reasons + Book + proof EN/ZH
- [x] No fake stats
- [x] Visual check desktop + mobile
- [x] `npm run build` passes
