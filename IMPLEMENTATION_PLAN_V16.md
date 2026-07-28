# Meridian CPA — IMPLEMENTATION PLAN V16

**Supersedes:** V15 sticky Why Us stack (too long, scroll-dim, Lifecycle-like numbers).

## Goal

Keep the **6-up grid** users preferred, elevated to feel premium: less chrome, more craft, distinct from Audit Lifecycle.

## Approach

**Refined 3×2 editorial grid**

| Spec | Detail |
|------|--------|
| Header | WHY US + gold hairline + title + subtitle |
| Grid | `1` / `2` / `3` cols (mobile / sm / lg) |
| Cell | Cream `#F9F9F6`, gold top rule only — **no shadow**, no side border |
| Content | Icon + title + description — **no 01–06** |
| Hover | Icon → gold; cell lifts 2px — **no** dark invert |
| Motion | One-time staggered scroll-fade only |

## Files

- [`AuditMethodologySection.tsx`](src/screens/Desktop/sections/AuditMethodologySection/AuditMethodologySection.tsx)
- [`tailwind.css`](tailwind.css) — removed `.why-reason*` dim rules
- Copy unchanged in [`translations.ts`](src/lib/translations.ts)

## Out of scope

- Sticky split / scroll-dim
- Connector path / autoplay
- Numbers / card shadows / invert hover
- Nav link for Why Us

## Verify

- [x] Desktop 3×2; no numbers; no scroll-dim
- [x] Quiet gold icon hover
- [x] Distinct from Lifecycle
- [x] `npm run build` passes (run after implement)
