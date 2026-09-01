# Landing Page — Booking Section Polish

## Overview

Refine the homepage **`#booking`** section (`BookingSection`) so copy, CTAs, and card UX accurately reflect Meridian’s **mixed session formats** — private consultations, Q&A clinics, masterclasses, and group workshops — not only 1-on-1 advisory. Align the landing booking experience with the live Supabase catalog and the client portal patterns already built in [#7](./IMPLEMENTATION_USER.md).

> **Status:** 🚧 In progress — P0 on `feat/issue-8-landing-booking-polish`  
> **GitHub:** [#8](https://github.com/gavinfung321/Meridian-CPA/issues/8)  
> **Branch:** `feat/issue-8-landing-booking-polish`  
> **Commit format:** `[#8] …`

---

## Goals

| Goal | Outcome |
|------|---------|
| **Accurate copy** | Section subtitle and CTAs describe consultations *and* group formats — no “1-on-1 only” framing |
| **Format-aware cards** | Session cards communicate private vs group; button labels match session type |
| **CTA clarity** | Visitors understand difference between **book a scheduled session** (`#booking`) and **general enquiry** (contact form) |
| **Portal parity** | Logged-in clients see registered-session state on landing cards (same as `/dashboard/book`) |
| **Discoverability** | Nav / hero can reach `#booking` without hunting |

---

## Current state *(audit)*

### What works today

| Area | Status |
|------|--------|
| Live sessions from Supabase | ✅ `fetchPublicSessions()` — future, non-cancelled sessions |
| Filters | ✅ Type + location dropdowns |
| Book flow | ✅ Login redirect with `bookSessionId` → portal book page; logged-in submit → pending booking |
| Full sessions | ✅ Disabled **Full** button when capacity reached |
| i18n shell | ✅ EN + ZH keys in `translations.ts` |
| Session images | ✅ Optional cover on cards |
| Scroll animation | ✅ Header + grid fade-in |

### Copy sources

| Source | Used on landing? | Notes |
|--------|------------------|-------|
| `translations.booking.label/title/subtitle` | ✅ Yes | **Subtitle is the main problem** — “1-on-1 consultations or group workshops” |
| `translations.booking.sessions.*` | ❌ No | Static demo titles/tags — **dead copy**; live titles come from DB |
| `data/sessions.ts` | ❌ No | Legacy mock data — **not imported anywhere** |
| Admin session `title` | ✅ Yes | e.g. “1-on-1 Tax Planning…” is **admin-entered**, not translation file |

### Session format detection *(already in code)*

```ts
isPrivate: max_slots <= 1   // public-sessions.ts
```

Live catalog in screenshot includes:

| Session | `max_slots` | Format |
|---------|-------------|--------|
| 1-on-1 Tax Planning | 1 | Private |
| PTR Q&A Clinic | 8 | Small group |
| MPF Masterclass | 20 | Workshop / webinar |
| Audit Readiness | 1 | Private |
| GBA Workshop | 15 | Group workshop |

The catalog is **mixed format by design**; only the **section subtitle** over-emphasises 1-on-1.

### UX gaps vs client portal

| Feature | Landing `#booking` | Client `/dashboard/book` |
|---------|-------------------|--------------------------|
| Registered session highlight | ❌ | ✅ Gold/green + View booking |
| Price on card | ❌ | ❌ *(modal/calendar only)* |
| Search | ❌ | ✅ |
| Dynamic card CTA | ❌ Always “Book Consultation” | Same *(shared `SessionCard`)* |
| Calendar view | ❌ | ✅ |

### CTA / navigation inconsistency *(high impact)*

| CTA location | Current behaviour | User expectation |
|--------------|-------------------|------------------|
| Hero **Book a Consultation** | Opens `ContactModal` (email enquiry) | Often expects `#booking` or live sessions |
| Nav **Book / 預約** | Opens `ContactModal` | Same |
| Services section button | Opens `ContactModal` | Same |
| `#booking` section | Live session grid + book modal | ✅ Correct — but **not linked from nav** |
| FAQ “How do we get started” | Describes contact form only | Omits live session booking |

There is **no nav anchor** to `#booking` today.

---

## Problem 1 — Wording implies 1-on-1 only

### Current copy

| Key | EN | Issue |
|-----|-----|-------|
| `booking.subtitle` | “Join our specialized **1-on-1 consultations** or group workshops…” | Implies binary split; clinics/masterclasses/Q&A not named |
| `booking.subtitle` *(zh)* | “…**一對一諮詢**或小組工作坊…” | Same |
| `booking.card.bookConsultation` | “Book Consultation” on **every** card | Wrong tone for “PTR Q&A Clinic”, “Masterclass”, “Workshop” |
| DB session titles | Admin-defined e.g. “1-on-1 Tax Planning…” | Correct for private sessions; **content guideline**, not code |

### Recommended copy *(locked for implementation)*

#### Section header

| Key | EN *(proposed)* | ZH *(proposed)* |
|-----|-----------------|-----------------|
| `booking.label` | `UPCOMING SESSIONS` *(keep)* | `即將舉行的活動` *(optional tweak — 活動 covers mixed formats)* |
| `booking.title` | `Book a Session` *(keep)* | `預約活動` or keep `預約諮詢` |
| `booking.subtitle` | **Browse upcoming consultations, clinics, and workshops — from private advisory sessions to group compliance events.** | **瀏覽即將舉行的諮詢、答疑診所及工作坊 — 涵蓋私人顧問到合規小組活動。** |

**Rationale:** Names the three real formats in the catalog (consultation / clinic / workshop) without claiming everything is 1-on-1.

#### Optional supporting line *(below subtitle, v2)*

> “Submit a booking request — Meridian will confirm your place.”

Sets expectation for **pending approval** flow.

#### Card CTA by format

| Condition | EN CTA | ZH CTA |
|-----------|--------|--------|
| `max_slots <= 1` | Book consultation | 預約諮詢 |
| `max_slots <= 8` | Reserve spot | 預留名額 |
| `max_slots > 8` | Register now | 立即登記 |
| Full | Full | 已滿 |
| Already registered | View booking | 查看預約 |

Keys already exist in `translations.booking.card.*` — wire them in `SessionCard` instead of always using `bookConsultation`.

#### Admin content guideline *(document only)*

- Use **“1-on-1” / “Private”** in session titles **only** when `max_slots === 1`
- Prefer type-driven naming: “PTR Q&A Clinic”, “Compliance Masterclass”, “Advisory Workshop”
- Tags on cards come from `session_type.name` + category — no code change needed

---

## Problem 2 — Other improvement suggestions

Prioritised by impact vs effort.

### P0 — Do in this phase

| # | Suggestion | Why |
|---|------------|-----|
| 1 | **Fix section subtitle** (EN + ZH) | Direct user request; misleading today |
| 2 | **Dynamic card CTA** by `isPrivate` / capacity tier | Workshops say “Register now”, not “Book Consultation” |
| 3 | **Registered session state on landing** | Reuse `buildUserSessionBookingMap` + `SessionCard` props *(already exist)* — logged-in users shouldn’t hit duplicate-book errors |
| 4 | **Add `#booking` to nav** | “Sessions” / “Book” anchor — section is undiscoverable |
| 5 | **Clarify hero vs booking CTAs** | Split: **Browse sessions** → `#booking`; **General enquiry** → contact form *(or rename contact CTA to “Contact us”)* |
| 6 | **Update FAQ + contact copy** | Mention live session booking at `#booking`, not only contact form |

### P1 — Strong follow-ups

| # | Suggestion | Why |
|---|------------|-----|
| 7 | **Show price on cards** | DB has `price`; client calendar shows it; reduces surprise before modal |
| 8 | **Format badge on card** | Small pill: “Private” / “Clinic” / “Workshop” derived from `max_slots` or session type |
| 9 | **i18n for `BookSessionModal`** | Modal is English-only; landing is bilingual |
| 10 | **Logged-in client shortcut** | Optional banner: “View all sessions in your portal →” linking to `/dashboard/book` |
| 11 | **Hide full sessions toggle** | Optional filter “Show full sessions” — default hide reduces grid noise |

### P2 — Defer

| # | Suggestion | Why |
|---|------------|-----|
| 12 | Search on landing | Client portal has it; homepage grid is usually small |
| 13 | Calendar view on landing | Portal book page covers this |
| 14 | Session description excerpt | Needs `description` on `PublicSessionCard` + design for card height |
| 15 | Remove dead `data/sessions.ts` + unused `translations.booking.sessions` | Cleanup — do when touching translations |

---

## Locked product decisions

| # | Decision | Choice |
|---|----------|--------|
| 1 | Subtitle framing | **Mixed formats** — consultations, clinics, workshops; drop “1-on-1 only” lead |
| 2 | Card CTA | **Dynamic** by capacity tier *(private / small group / workshop)* |
| 3 | Registered sessions | **Same treatment as portal** on landing when user is logged in |
| 4 | Hero primary CTA | **Browse sessions** scrolls to `#booking`; contact form becomes secondary / renamed |
| 5 | Nav | Add **Sessions** link → `#booking` |
| 6 | FAQ | Acknowledge **two paths**: book open session vs general enquiry |
| 7 | Title “Book a Session” | **Keep** — already format-neutral |
| 8 | Dedicated notifications / portal features | **Out of scope** — see [IMPLEMENTATION_USER.md](./IMPLEMENTATION_USER.md) |

### CTA map *(after implementation)*

```
Nav "Sessions" / Hero "Browse sessions"     →  /#booking
#booking card "Reserve spot" etc.           →  login (if needed) → BookSessionModal → pending
Nav "Contact" / footer enquiry              →  ContactModal (general)
Logged-in client registered card            →  /dashboard/bookings?booking=<id>
Logged-in client portal hint (optional)       →  /dashboard/book
```

---

## Page specifications

### `#booking` section header

- [ ] Update `booking.subtitle` EN + ZH *(see recommended copy above)*
- [ ] Optional: one-line approval note under subtitle *(P1)*
- [ ] Keep gold label + serif title + divider — no layout change

### Session grid / cards

- [ ] **Dynamic CTA** — `SessionCard` selects key from capacity tier
- [ ] **Registered state** — pass `userBooking` + `onViewBooking` from `BookingSection` when authenticated
- [ ] **Format badge** *(P1)* — “Private session” vs “Group session” pill
- [ ] **Price** *(P1)* — extend `PublicSessionCard` with `price`; show `HK$X,XXX` under schedule row
- [ ] Keep filters, loading skeletons, empty states
- [ ] Consider hiding `spotsLeft <= 0` sessions by default *(P1 — align with portal book page)*

### Booking modal

- [ ] i18n title, labels, buttons *(P1)*
- [ ] Show price in modal summary *(P1)*

### Site-wide CTA alignment

- [ ] **TopNavigationSection** — add `#booking` nav item; split or rename book button
- [ ] **HeroSection** — primary → scroll to `#booking`; secondary contact optional
- [ ] **MainContentSection** services CTA — align with hero decision
- [ ] **FAQ** — update “How do we get started” answer
- [ ] **Contact section** — rename button to “Send an enquiry” / “Contact us” if hero now points to `#booking`

---

## Files in scope

| File | Action |
|------|--------|
| `src/lib/translations.ts` | Update `booking.subtitle` EN/ZH; optional FAQ/contact/hero/nav copy |
| `src/screens/Desktop/sections/BookingSection/SessionCard.tsx` | Dynamic CTA helper; *(registered state already supported)* |
| `src/screens/Desktop/sections/BookingSection/BookingSection.tsx` | Load user bookings; pass registered state; optional hide-full filter |
| `src/lib/public-sessions.ts` | *(P1)* Add `price` to `PublicSessionCard` |
| `src/components/BookSessionModal.tsx` | *(P1)* i18n props |
| `src/screens/Desktop/sections/TopNavigationSection/TopNavigationSection.tsx` | Nav link to `#booking`; CTA split |
| `src/screens/Desktop/sections/HeroSection/HeroSection.tsx` | CTA target → `#booking` |
| `src/screens/Desktop/Desktop.tsx` | Wire scroll-to-booking handler |
| `src/screens/Desktop/sections/MainContentSection/MainContentSection.tsx` | Pass scroll handler; services CTA alignment |
| `src/screens/Desktop/sections/BookingSection/data/sessions.ts` | *(P2)* Delete if confirmed unused |
| `Implementation/IMPLEMENTATION_PLAN_BOOKING.md` | Link this doc in document map when complete |

### Out of scope

- Admin session CRUD / catalog changes
- Client portal `/dashboard/book` *(handled in IMPLEMENTATION_USER.md)*
- Email notifications on book
- Homepage sections other than booking + CTA trail

---

## Execution order

Work top-to-bottom. **P0 first.**

```
Step 0  Verify live session mix in Supabase (private + group titles)
   ↓
Step 1  Copy — booking.subtitle EN/ZH (+ optional label tweak)
   ↓
Step 2  SessionCard — dynamic CTA by capacity tier
   ↓
Step 3  BookingSection — registered session state for logged-in users
   ↓
Step 4  Nav + hero + FAQ + contact — CTA alignment (#booking vs enquiry)
   ↓
Step 5  (P1) Price on cards + modal; format badge; BookSessionModal i18n
   ↓
Step 6  QA + update IMPLEMENTATION_PLAN_BOOKING.md document map
   ↓
Step 7  (P2) Remove dead sessions mock data + unused translation keys
```

---

## Step 0 — Verification checklist

- [ ] `#booking` renders live sessions (not static mock)
- [ ] Catalog includes at least one private (`max_slots = 1`) and one group session
- [ ] `SessionCard` renders tags from `session_type` / category in DB
- [ ] Logged-out book flow: card → login → `/dashboard/book?session=` or modal on return
- [ ] Document which session titles are admin-entered vs translation-driven

---

## Step 1 — Copy updates

- [ ] Replace `booking.subtitle` EN
- [ ] Replace `booking.subtitle` ZH
- [ ] Review hero `btn`, nav `bookConsult`, contact `btn` for naming collision
- [ ] Update FAQ answer to mention `#booking` session grid
- [ ] Admin note: avoid “1-on-1” in group session titles

**EN subtitle (final):**

> Browse upcoming consultations, clinics, and workshops — from private advisory sessions to group compliance events.

**ZH subtitle (final):**

> 瀏覽即將舉行的諮詢、答疑診所及工作坊 — 涵蓋私人顧問到合規小組活動。

---

## Step 2 — Dynamic card CTA

- [ ] Add helper e.g. `getSessionCardCtaKey(session, lang)` in `SessionCard` or small util
- [ ] Map: `max_slots <= 1` → `bookConsultation`; `<= 8` → `reserveSpot`; `> 8` → `registerNow`
- [ ] Full session → existing disabled “Full” / 已滿
- [ ] QA: PTR Clinic → “Reserve spot”; MPF Masterclass → “Register now”

---

## Step 3 — Registered sessions on landing

- [ ] In `BookingSection`, when `user` present: `fetchClientBookings` → `buildUserSessionBookingMap`
- [ ] Pass `userBooking` + `onViewBooking` to each `SessionCard`
- [ ] Click registered card → `/dashboard/bookings?booking=<id>` *(not book modal)*
- [ ] After successful book on landing, refresh map + show success banner

---

## Step 4 — CTA alignment

- [ ] Add `onBrowseSessionsClick` in `Desktop` — `document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth' })`
- [ ] Hero primary button → browse sessions
- [ ] Nav: new link “Sessions” → `#booking`
- [ ] Rename contact-trigger buttons to **Contact us** / **Send enquiry** *(wording TBD with design)*
- [ ] FAQ + contact subtitle updated

---

## Step 5 — P1 polish *(optional same PR or follow-up)*

- [ ] Add `price` to `PublicSessionCard` + display on card and modal
- [ ] Format badge on card (Private / Group / Workshop)
- [ ] `BookSessionModal` accepts `lang` prop
- [ ] Optional portal banner for logged-in clients

---

## QA checklist

### Copy

- [ ] Subtitle does not lead with “1-on-1 only”
- [ ] ZH subtitle reads naturally for mixed formats
- [ ] FAQ describes both booking paths

### Cards

- [ ] Private session → “Book consultation”
- [ ] Clinic (small group) → “Reserve spot”
- [ ] Masterclass/workshop → “Register now”
- [ ] Full session → disabled Full
- [ ] Logged-in + already booked → highlight + “View booking”

### Navigation

- [ ] Nav Sessions link scrolls to `#booking`
- [ ] Hero CTA reaches booking grid
- [ ] Contact CTA still opens enquiry form

### Flows

- [ ] Logged-out: book → login → completes booking path
- [ ] Logged-in: submit → pending toast + success banner
- [ ] Admin user redirected away from client book
- [ ] EN/ZH toggle updates booking section copy

### Regression

- [ ] Client portal `/dashboard/book` unchanged
- [ ] Homepage `#booking` still loads with 0 sessions gracefully
- [ ] Filters still work
- [ ] `npm run build` passes

---

## Future enhancements

| Item | Notes |
|------|-------|
| Search on landing | Only if session count grows |
| List / calendar toggle | Portal covers power users |
| Session description on card | Pull `sessions.description` — truncate 2 lines |
| “Starting soon” badge | Sessions within 48h |
| Share / add to calendar | After booking confirmed |
| SEO structured data | `Event` schema for public sessions |

---

## Related documents

| Document | Relationship |
|----------|--------------|
| [IMPLEMENTATION_PLAN_BOOKING.md](./IMPLEMENTATION_PLAN_BOOKING.md) | Parent roadmap — Phase 2 landing live sessions |
| [IMPLEMENTATION_USER.md](./IMPLEMENTATION_USER.md) | Client portal book page — parity reference for registered sessions |
| [IMPLEMENTATION_DB_CAPACITY.md](./IMPLEMENTATION_DB_CAPACITY.md) | Capacity / `max_slots` behaviour |
