# Meridian CPA — IMPLEMENTATION PLAN V2

Phase 2 enhancements: three new premium sections added to the Meridian CPA website, preserving the existing editorial dark-green / warm-cream aesthetic.

---

## New Sections

### 1. 👥 People Section — "Our Partners"

**Design:** Editorial numbered-roster layout (not a card grid).
- Each partner = a full-width horizontal row with ordinal `01 / 02…`, name in bold ~2rem, title pill badge, specialty right-aligned
- Hover → row background shifts to warm parchment, left-border accent, short bio slides down (accordion)
- Portrait thumbnail (square, 56×56) appears on hover
- Scroll-in: each row fades up with stagger delay
- Partners: Andrew Lam, Cecilia Yam, Ringo Chiu, Wing Chan

### 2. 📅 Audit Timeline — "Our Process"

**Design:** Animated dark-green section (matches "What We Offer").
- 6 steps: Engagement → Planning → Fieldwork → Findings → Reporting → Post-Audit
- Horizontal desktop layout / vertical stepper on mobile
- Connector line **draws itself** with CSS `scaleX` 0→1 triggered by IntersectionObserver
- Step numbers in gold/amber `#C9A84C`, titles in white, descriptions in `white/70`

### 3. 📋 Audit Methodology — "How We Work"

**Design:** 3-column grid on cream background.
- 6 pillars: Risk-Based Approach · Independence · HKSA Compliance · Technology · Communication · Quality Review
- SVG line icons per pillar
- Scroll-reveal stagger animation

---

## Page Flow (After Changes)

1. Welcome — *existing*
2. Parallax Banner — *existing*
3. What We Offer — *existing*
4. **[NEW] Audit Timeline**
5. **[NEW] Audit Methodology**
6. **[NEW] People Section**
7. Testimonials — *existing*
8. Bottom Parallax Banner — *existing*

---

## Files Changed

### `src/lib/translations.ts` — MODIFY
Add `people`, `timeline`, `methodology` keys to both `en` and `zh` locales.

### `tailwind.css` — MODIFY
- Add `--accent-gold: #C9A84C` CSS variable
- Add `.timeline-line-grow` keyframe (scaleX 0→1)
- Add `.stagger-6` → `.stagger-8` delay helpers

### `src/screens/Desktop/sections/PeopleSection/PeopleSection.tsx` — NEW
Editorial roster component.

### `src/screens/Desktop/sections/AuditTimelineSection/AuditTimelineSection.tsx` — NEW
Animated dark-green timeline component.

### `src/screens/Desktop/sections/AuditMethodologySection/AuditMethodologySection.tsx` — NEW
Cream-background methodology grid component.

### `src/screens/Desktop/sections/LegalServicesContentSection/LegalServicesContentSection.tsx` — MODIFY
Import and slot the three new sections in the correct order.

---

## Verification

- `npm run build` — zero TypeScript errors
- Scroll through all sections and confirm entrance animations
- Toggle EN / TC language and verify all new sections render correctly
- Verify People accordion hover open/close
- Check Timeline on mobile (vertical stepper)
