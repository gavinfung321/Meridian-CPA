# Meridian CPA — IMPLEMENTATION PLAN V15

**Feedback:** Methodology cards feel boring; connecting them like Lifecycle risks looking like a twin timeline.  
**Decision:** Reframe as **Why Us** with an elevated editorial layout.

---

## Goal

Make the section less flat and more premium, while staying CPA-professional. Keep Audit Lifecycle as the only staged/connector section.

---

## Approach

**Split editorial + scroll-active reasons**

| Element | Spec |
|---------|------|
| Label | `WHY US` / `為何選擇我們` |
| Title | `Why firms choose Meridian` / ZH match |
| Subtitle | One short line — clarity, rigour, no surprises |
| Layout (md+) | Sticky left intro · right numbered reason stack |
| Numbers | Oversized gold serif `01`–`06` |
| Rows | Title + description; hairline rules; **no cards** |
| Motion | Scroll-fade enter; nearest reason full contrast, others muted |
| Icons | Not shown (drop icon grid) |
| Section id | `#why-us` |
| Nav | Unchanged (still thin; no new link) |

```
[ WHY US + title + subtitle ]  |  01  Reason …
     (sticky)                  |  ──
                               |  02  Reason …
                               |  …
```

---

## Files

- [`src/lib/translations.ts`](src/lib/translations.ts) — relabel `methodology` → Why Us copy (EN + ZH)
- [`src/screens/Desktop/sections/AuditMethodologySection/AuditMethodologySection.tsx`](src/screens/Desktop/sections/AuditMethodologySection/AuditMethodologySection.tsx) — rebuild layout
- [`tailwind.css`](tailwind.css) — remove `.methodology-card*` invert; add why-reason active/dim
- Wire: already mounted from MainContentSection / Desktop — confirm `#why-us` id

---

## Out of scope

- Lifecycle changes
- Path / autoplay animation
- Nav link for Why Us
- Hero / OG

---

## Verify

- [x] Section reads as Why Us with sticky split + numbered reasons
- [x] No card chrome; scroll-active highlight with reduced-motion fallback
- [x] EN / 繁 labels updated
- [x] Visual check in browser (desktop + mobile)
- [x] `npm run build` passes
