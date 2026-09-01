# Landing Page — Booking Section Polish

## Overview

Refine the homepage **`#booking`** section (`BookingSection`) so copy, CTAs, and card UX accurately reflect Meridian’s **workshop and info-session** catalog — while keeping **audit / advisory enquiry** as the primary commercial path sitewide. Align the landing booking UI with the client portal **`/dashboard/book`** experience already built in [#7](./IMPLEMENTATION_USER.md).

> **Status:** ✅ **Complete** — merged to `main` in `9852223`; [#8](https://github.com/gavinfung321/Meridian-CPA/issues/8) closed  
> **GitHub:** [#8](https://github.com/gavinfung321/Meridian-CPA/issues/8) — closed  
> **Branch:** `feat/issue-8-landing-booking-polish` *(merged)*  
> **Commit format:** `[#8] …`

---

## Business context *(locked)*

| Path | Purpose | Revenue role |
|------|---------|----------------|
| **Contact us** (header, services, contact, audit banner) | Audit, tax, bespoke advisory enquiry | **Primary revenue** |
| **Book a session** (`#booking`) | Workshops, clinics, info sessions, group events | Secondary — education, lead gen, client engagement |
| **Client portal** `/dashboard/book` | Same catalog for logged-in clients | Self-service booking |

**Implication:** The **header** button stays **Contact us** (audit/advisory — primary revenue, always available). The **hero** must not duplicate that label — use a distinct secondary action (**Book Now** → `#booking`) so the above-the-fold view offers two clear paths without redundancy.

---

## Problem 3 — Redundant “Contact us” above the fold *(new)*

### What users see today

After reverting header + hero both to **Contact us**, the first viewport shows **two identical buttons**:

| Location | Label | Action |
|----------|-------|--------|
| Header (top-right) | Contact us | `ContactModal` |
| Hero (primary pill) | Contact us | `ContactModal` |

Same label, same action, different sizes — feels redundant and wastes the hero’s primary CTA slot.

### Analysis — which button should change?

| Option | Verdict | Why |
|--------|---------|-----|
| **A. Hero → Book Now**, header stays Contact us | ✅ **Recommended** | Header contact is standard for professional services and matches audit-first revenue. Hero is the page’s biggest CTA — use it for workshop/session discovery without removing contact from the persistent header. |
| B. Header → Book Now, hero stays Contact us | ❌ | Weakens audit path in the always-visible nav; “Book Now” in a small header pill is easy to miss and atypical for CPA sites. |
| C. Hero dual buttons (Contact us + Book Now) | ❌ | Adds clutter; hero already has headline + subtitle. |
| D. Remove header button, hero only Contact us | ❌ | Loses persistent contact access while scrolling. |

### Recommended hero CTA

| Key | EN | ZH | Action |
|-----|----|----|--------|
| `hero.btn` | **Book Now** | **立即預約** | `scrollToBookingSection()` → `#booking` |

**Not** “Browse sessions” (too passive) and **not** “Contact us” (duplicates header).

### Revised above-the-fold hierarchy

```
Header button     →  Contact us (ContactModal)     — audit / advisory, always available
Hero primary      →  Book Now (#booking)           — workshops & info sessions
Nav "Sessions"    →  #booking                      — text-link discoverability (redundant with hero but OK)
```

Audit enquiry remains one click away via header **or** services / contact section / `#booking` audit banner — hero no longer needs to carry that job.

---

## Problem 4 — Calendar view column & session card heights *(new)*

### What users see today

In **Calendar View** (`SessionsCalendarView`), the week grid looks uneven:

| Issue | Example in screenshot |
|-------|----------------------|
| Empty days show a **tall dashed “No sessions” box** that fills the column | Mon 07, Sun 13 |
| Days with sessions show **compact cards** pinned to the top | Tue–Sat |
| Session cards **vary in height** | Cards with “Awaiting approval” / “Registered” badge vs cards without |
| Net effect | Empty columns look taller/heavier; session columns look short and misaligned at the bottom |

### Root cause *(code)*

In `SessionsCalendarView.tsx`:

```tsx
// Day column — min height only, content-driven growth
className="flex min-h-[220px] flex-col ..."

// Empty day — flex-1 expands to fill entire column
<div className="flex flex-1 flex-col items-center justify-center ...">
  No sessions
</div>

// Session card — height = content only (badge optional, title line-clamp-2)
<button className="rounded-lg border px-2.5 py-2 text-left ...">
```

1. **Empty state uses `flex-1`** — the dashed placeholder stretches to fill all remaining column space, so empty days visually dominate.
2. **Session cards have no `min-height`** — optional status badge + 1–2 line titles + capacity bar = variable card height.
3. **Grid row stretch is working** — all 7 columns share the same row height, but *internal* content is not normalized, so the layout feels broken.

### Should sessions be the same height?

**Yes — with nuance:**

| Element | Same height? | Recommendation |
|---------|--------------|----------------|
| **Day columns** (Mon–Sun) | ✅ Yes — already grid-stretched | Keep; optionally bump `min-h` slightly |
| **Session event cards** (within a day) | ✅ Yes — fixed `min-h` | Uniform card silhouette; badge area reserved even when absent |
| **Empty day placeholder** | ✅ Match session card height | Compact dashed box — **not** `flex-1` fill |
| **Multiple sessions on one day** | ❌ Column grows taller | Expected — column height = sum of cards + gaps; other columns in row stretch to match |

This matches standard week-calendar UX (Google Calendar, fitness-app reference): event blocks are consistent; empty days show a small “nothing scheduled” hint, not a giant void.

### Recommended fix *(P1 — calendar polish)*

**File:** `src/screens/Admin/catalog/SessionsCalendarView.tsx`

| Change | Detail |
|--------|--------|
| **Grid row equal height** | `auto-rows-fr items-stretch` — all day columns in a week row share height |
| **Day column** | `flex h-full flex-col` — column fills grid cell |
| **Body area** | `flex flex-1 flex-col min-h-0` — consumes space below day header |
| **Single session / empty day** | Inner card or placeholder gets `flex-1` — **stretches so bottoms align across the row** |
| **Multi-session day** | Cards stack at `min-h-[128px]`; column grows taller (expected) |
| **Badge slot** | Reserved `min-h-[20px]` row |
| **Title** | `line-clamp-2 min-h-[2rem]` — consistent two-line block |
| **Footer** | `mt-auto` — capacity/price pinned to card bottom |

**Key insight:** `min-h` alone fails — cards still grow with content. Use **`flex-1` stretch** inside equal-height grid columns so all inner blocks share the same bottom edge.

**Optional P2:** On landing/public variant, hide capacity progress bar to shorten cards *(admin keeps bar)*.

### Visual target

```
┌─────────┬─────────┬─────────┐
│ Mon 07  │ Tue 08  │ Wed 09  │
│ ┌─────┐ │ ┌─────┐ │ ┌─────┐ │
│ │ No  │ │ │Session│ │ │Session│ │  ← all blocks same min-height
│ │sess.│ │ │ card │ │ │ card │ │
│ └─────┘ │ └─────┘ │ └─────┘ │
└─────────┴─────────┴─────────┘
```

Affects **both** landing `#booking` and portal `/dashboard/book` — shared component.

---

## Problem 5 — Session cover images *(UI/UX analysis)*

### Reference comparison

| Aspect | Fitness reference *(attached)* | Meridian today *(attached)* |
|--------|-------------------------------|----------------------------|
| **Cover area** | Always present — tinted block + category pill + icon | Only when admin uploaded `image_path`; **most cards have none** |
| **Visual scan** | Type/category readable in \<1s from color + label | Title + tags only — text-heavy, similar-looking cards |
| **Card height** | Uniform — fixed image zone + consistent body | **Uneven** — long titles wrap to 3–5 lines; no top anchor |
| **CTA** | Full-width “Book session” at bottom | Dynamic CTA — good |
| **Tone** | Consumer / gym | Professional CPA — must stay trustworthy |

### What already exists *(no rebuild needed)*

Cover images are **already built** — they are underused, not missing:

| Layer | Status |
|-------|--------|
| DB `sessions.image_path` | ✅ Migration `20250829100000_session_images.sql` |
| Storage bucket `session-images` | ✅ Public read |
| Admin upload | ✅ `AdminSessionForm` + `SessionFormModal` |
| `PublicSessionCard.imageUrl` | ✅ `fetchPublicSessions()` |
| `SessionCard` render | ✅ Always-on cover zone — upload OR gradient fallback *(P1 done)* |

```tsx
// SessionCardCover — tier order: imageUrl → gradient fallback
// P1.5 adds: imageUrl → categoryPhoto → gradient
```

**Live catalog likely has no uploaded covers** — seed sessions don’t include `image_path`, so grid cards appear text-only (as in screenshot).

### Should we add cover images?

**Yes for grid view — but as an always-present cover *zone*, not mandatory custom photography.**

| View | Cover image? | Rationale |
|------|--------------|-----------|
| **Grid view** (`SessionCard`) | ✅ **Always show cover zone** | Scannability, card height consistency, marketing polish |
| **Calendar view** | ❌ **No cover** | Cells too small; time + title + status is enough |

### Recommended approach *(locked direction)*

**Option B — Always-on cover zone with fallback** *(recommended)*

| Tier | When | What shows |
|------|------|------------|
| **1. Custom upload** | Admin set `image_path` | Real cover photo *(16:9, object-cover)* |
| **2. Category fallback** | No upload | Type/category tinted gradient + subtle icon + category pill overlay *(CPA-appropriate — not gym person silhouettes)* |

Do **not** copy the fitness reference literally (person icons, loud consumer colors). Adapt the **pattern**:

```
┌─────────────────────────────┐
│ [Category pill]             │  ← 16:9 zone, always rendered
│   abstract / type gradient  │
├─────────────────────────────┤
│ Title · status · location   │
│ Tags · time · capacity      │
│ [ Book / View booking ]     │
└─────────────────────────────┘
```

**Category fallback palette *(example)*:**

| Category | Fallback tone |
|----------|---------------|
| Tax Planning | Gold / warm neutral |
| Audit & Compliance | Navy `#0F2A1D` |
| Payroll & MPF | Soft teal |
| Advisory | Sage / muted green |

### Why this helps Meridian specifically

1. **Card height alignment** — fixed 16:9 top zone reduces uneven grids from long titles *(complements grid layout; separate from calendar fix)*.
2. **Workshop vs clinic scan** — users browsing workshops/info sessions distinguish types faster than reading full titles.
3. **Secondary funnel fit** — `#booking` is education/engagement; modest visual polish is appropriate without competing with audit seriousness.
4. **Low ops burden** — fallbacks work day one; firm uploads custom covers only for flagship events (MPF Masterclass, GBA Workshop).

### What not to do

| Avoid | Why |
|-------|-----|
| Require photo for every session before publish | Blocks admin; most clinics don’t need bespoke art |
| Stock photos of random “business people” | Cheap trust signal for CPA brand |
| Cover images in calendar cells | Clutter at current size |
| Replacing tags/title with image-only cards | Accessibility + SEO still need text |

### Effort estimate

| Task | Effort | Priority |
|------|--------|----------|
| Category fallback component in `SessionCard` | ~½ day | **P1** |
| Map `session_type` / category → fallback style | Small | **P1** |
| Seed 2–3 demo covers for flagship sessions *(marketing)* | Ops + admin | **P1 optional** |
| Alt text / i18n for cover `alt` | Small | **P1** |
| Per-session custom photography library | Ongoing content | **P2** |

### Locked direction *(pending product sign-off)*

| # | Decision | Choice |
|---|----------|--------|
| 11 | Grid cover zone | **Always render** — upload OR category fallback |
| 12 | Calendar cover | **No** — text mini-cards only |
| 13 | Fallback style | Category-tinted gradient + pill — **not** fitness person icons |
| 14 | Custom upload | **Optional** — existing admin flow |

### Should we add realistic photos? *(Problem 5b — analysis)*

**Short answer:** **Yes for a small, curated set — no for unique photography on every session.**

Category gradients solve layout and scannability. **Realistic photos are a marketing upgrade**, not a blocker. Use them selectively so the catalog feels live without turning every clinic into a photoshoot.

#### Current visual stack *(after P1 implement)*

| Tier | Trigger | What user sees today |
|------|---------|---------------------|
| **1** | Admin `image_path` set | Uploaded photo + category pill |
| **2** | No upload | Category gradient + icon + pill |

Gradients are **working as designed** for dev/demo. The question is whether to insert a **photo tier** between gradient and per-session upload.

#### Options compared

| Option | Description | Verdict |
|--------|-------------|---------|
| **A. Keep gradients only** | No photos; gradients permanent fallback | ✅ Fine for internal QA — weak for public marketing |
| **B. Category photo library** *(4 images)* | One professional 16:9 image per category; reused across all sessions in that type | ✅ **Recommended first photo step** |
| **C. Per-session photos** *(5 seed sessions)* | Unique cover for each demo session (PTR Clinic, MPF Masterclass, etc.) | ✅ Good for **launch demo** — optional after B |
| **D. Stock “business people”** | Generic handshake / laptop stock | ❌ Undermines CPA trust |
| **E. Real firm event photography** | Photos from actual workshops | ✅ **Gold standard** — ongoing ops, not sprint work |

#### Recommendation — **tiered photo strategy**

```
Priority 3  Admin upload per session     →  flagship / one-off events
Priority 2  Category default photo (×4)  →  tax · audit · payroll · advisory
Priority 1  Category gradient fallback   →  when no photo at any tier (keep)
```

| Tier | When to use | Source |
|------|-------------|--------|
| **Gradient fallback** | Always available as last resort | ✅ Already built |
| **Category default photo** | Session has no `image_path` | 4 curated 16:9 images — see below |
| **Session-specific photo** | Flagship workshops, recurring masterclasses | Admin upload OR seed `image_path` |

**Do not remove gradients** — they remain the fallback when storage fails or a new category has no asset yet.

#### What “realistic” should mean for Meridian

Photos must match **existing site tone** (`hero.png`, `office.png` — HK professional, not gym/conference stock):

| Category | Photo direction *(examples)* |
|----------|------------------------------|
| **Tax Planning** | Partner at desk with documents; Central office window — warm, not staged handshake |
| **Audit & Compliance** | Organised files / audit workspace; subtle, serious |
| **Payroll & MPF** | Small group webinar or payroll dashboard context — employer-focused |
| **Advisory / GBA** | Boardroom or hybrid screen — cross-border / strategy tone |

**Reuse before commission:** crop/regrade existing assets where possible:

| Existing asset | Possible reuse |
|----------------|----------------|
| `public/images/office.png` | Audit, advisory, private consultation |
| `public/images/documents.png` | Tax, audit readiness |
| `public/images/hero.png` | Brand tone reference only — avoid duplicate hero on cards |

#### How many photos to create?

| Scope | Count | When |
|-------|-------|------|
| **Minimum viable** | **4** category defaults | Launch / `#8` demo polish |
| **Nice for demo** | **+2 flagship** (MPF Masterclass, GBA Workshop) | If time — highest visual payoff |
| **Not needed now** | Unique photo per private 1:1 slot | Gradient or category default is enough |

Seed catalog has **5 sessions** — 4 category images cover most; only GBA vs generic advisory might share one “advisory” image.

#### Implementation paths *(when approved — no code yet)*

| Path | Pros | Cons |
|------|------|------|
| **Static `public/images/sessions/`** | Simple; no Supabase upload; works offline in dev | Not using admin upload path; two sources of truth |
| **Seed migration → Supabase bucket** | Matches production path; admin can replace later | Needs storage upload in migration or script |
| **Manual admin upload only** | Zero code | Tedious; easy to forget for new sessions |

**Recommended for sprint:** static category images in `public/images/sessions/` + extend `session-cover-fallback.ts` to prefer category photo over gradient → later migrate flagship sessions to `image_path` via admin or seed script.

#### What not to do

| Avoid | Why |
|-------|-----|
| Replace gradients entirely | Need fallback; gradients encode category when image missing |
| AI faces / uncanny stock | Trust risk for regulated profession |
| Different aspect ratios | Breaks 16:9 grid alignment |
| Photos on calendar view | Already decided — grid only |

#### Effort & priority

| Task | Effort | Priority |
|------|--------|----------|
| Source/create 4 category photos (16:9, WebP) | Design / ½ day | **P1.5** |
| Wire category photo tier in `SessionCardCover` | ~1–2 hrs code | **P1.5** |
| Seed `image_path` for 2 flagship sessions | Ops + optional migration | **P2** |
| Firm photography at real events | Ongoing | **P2+** |

#### Locked direction *(photo tier — pending sign-off)*

| # | Decision | Choice |
|---|----------|--------|
| 15 | Use realistic photos? | **Yes — category library (×4), not per-session mandatory** |
| 16 | Replace gradients? | **No — gradients stay as final fallback** |
| 17 | Photo source | Curated/on-brand; reuse site assets where possible; **no generic stock** |
| 18 | First delivery | 4 category defaults → optional 2 flagship session uploads |

---

## Problem 6 — Post-login booking resume *(revised)*

### User clarification *(locked)*

After login, the user should land on the **client portal “Book a session” page** (`/dashboard/book`) — **not** back on the landing homepage — with the **confirmation modal already open** for the session they clicked on the landing catalog. They must **not** have to find and click the session card again.

```
Landing #booking → Reserve spot (logged out)
    → Login
    → /dashboard/book?session=<id>     ← portal page (screenshot)
    → Confirm modal opens immediately   ← session pre-selected
    → Confirm booking → /dashboard/bookings
```

The dashboard book page **is the correct destination**. The gap is **reliable auto-open of the confirmation modal**, not the redirect target.

### Current flow *(code trace)*

```
Landing #booking
  → PublicSessionCatalog.openBookModal()
  → !user → navigate("/login", { state: { from: "/", bookSessionId } })

Login.tsx (success)
  → navigate(`/dashboard/book?session=${bookSessionId}`)   ← correct page

/dashboard/book  (DashboardBookSession)
  → PublicSessionCatalog variant="portal"
  → openSessionId from ?session= URL param
  → useEffect: find session → setBookSession → BookSessionModal
```

| Step | Intended | Likely gap today |
|------|----------|------------------|
| Redirect to `/dashboard/book?session=` | ✅ Login already does this | — |
| Portal book page loads | ✅ Screenshot matches | — |
| Modal auto-opens | ⚠️ **Should work in code** | Race: sessions still `loading` when effect runs; effect may not re-fire; auth/profile hydration timing |
| User confirms | ✅ createClientBooking → bookings | — |
| User dismisses modal | ✅ Stays on `/dashboard/book` catalog | Acceptable — they can browse other sessions |

### Real problem *(revised root cause)*

Previous analysis incorrectly treated `/dashboard/book` as the wrong destination. The actual UX failure is:

1. **Modal does not open reliably** after redirect — user sees the catalog grid and must click **Reserve spot** again.
2. **`BookSessionModal` is too basic** vs the reference confirmation panel *(P1)*.

**Hypothesised reliability issues** *(to verify in implementation)*:

| Issue | Symptom |
|-------|---------|
| `openSessionId` effect gated on `loading` | Effect returns early; never re-opens when sessions finish loading |
| Session fetch slower than first render | `match` undefined on first pass; no retry |
| URL param cleared before modal opens | `onOpenSessionChange(null)` race |
| Signup path drops `bookSessionId` | New users land on `/dashboard` without `?session=` |

### Reference modal *(fitness app — attached)*

Shown **on top of** the dashboard book page (catalog dimmed behind):

| Element | Reference | Meridian today (`BookSessionModal`) |
|---------|-----------|-------------------------------------|
| Framing | “Confirm your session” | “Request booking” |
| Session summary | Title + category + icon/thumb | Title in description only |
| Details grid | Date · time · location | Plain dl list |
| Price | “Total investment” prominent | ❌ Not shown |
| Policy note | Cancellation policy | “Pending firm approval” only |
| Primary CTA | **Confirm booking** | Submit request |
| Secondary | Back to schedule | Cancel → closes modal, **stays on `/dashboard/book`** |
| Layout | Side panel / focused overlay | Center `AdminModal` |

### Recommended flow *(locked — revised)*

```
Landing: Reserve spot (logged out)
  → /login  state: { from: "/", bookSessionId }

Login / Signup success (client role, bookSessionId set)
  → /dashboard/book?session=<bookSessionId>        ← portal book page
  → wait for sessions load + match
  → BookSessionModal opens automatically
  → Confirm → pending booking → /dashboard/bookings (or toast + stay)

Dismiss modal
  → remain on /dashboard/book (catalog visible) — no re-login, no landing redirect
```

**Landing when already logged in:** unchanged — modal opens on `#booking` in place.

**Logged-in user on portal:** unchanged — card click → modal on `/dashboard/book`.

### Redirect rules *(revised)*

| Origin | `bookSessionId` | After login destination |
|--------|-----------------|-------------------------|
| Landing (`from: "/"`) | set | **`/dashboard/book?session=<id>`** + auto-open modal |
| `/dashboard/*` | set | `/dashboard/book?session=<id>` *(same)* |
| any | absent | `getPostLoginRoute(from, role)` → usually `/dashboard` |
| any | set, admin role | `/admin/bookings` |

**Do not** redirect to landing `/` after login for booking intent.

### Fix focus *(P0 — portal modal resume)*

| Fix | Detail |
|-----|--------|
| **Reliable open effect** | In `PublicSessionCatalog`: re-run when `loading` flips false + `openSessionId` present; guard against double-open |
| **Pending session ref** | Hold `openSessionId` until modal successfully opens or session not found |
| **Not-found handling** | Toast “Session unavailable” + strip `?session=` from URL |
| **Signup passthrough** | Forward `bookSessionId` Login ↔ Signup state |
| **Login helper** | `getPostLoginBookDestination()` — centralise redirect logic *(login redirect mostly correct today)* |

No landing `Desktop` / `#booking` resume logic required.

### Modal UX phases

| Phase | Scope |
|-------|--------|
| **P0 — Reliable auto-open** | Fix `PublicSessionCatalog` + signup passthrough on **`/dashboard/book`** |
| **P1 — Confirmation polish** | Reference-style `BookSessionModal`: thumb, date/time/location grid, price, policy, “Confirm booking” / “Back to schedule” | ✅ Done |
| **P1** | Add `price` to `PublicSessionCard` | ✅ Done |

### Edge cases

| Case | Behaviour |
|------|-----------|
| Session full / cancelled | Toast + clear `?session=`; show catalog |
| Already registered | Redirect `/dashboard/bookings?booking=` *(existing)* |
| Signup → email confirm → login | Preserve `bookSessionId` in login link state |
| Invalid / stale session id | Toast + clear param |

### Effort estimate

| Task | Effort | Priority |
|------|--------|----------|
| Fix modal auto-open reliability in `PublicSessionCatalog` | ~2 hrs | **P0** |
| Signup `bookSessionId` passthrough | ~30 min | **P0** |
| `getPostLoginBookDestination()` helper | ~1 hr | **P0** |
| `BookSessionModal` confirmation redesign | ~½ day | **P1** |
| Price on `PublicSessionCard` + modal | ~2 hrs | **P1** |

### Locked direction *(revised)*

| # | Decision | Choice |
|---|----------|--------|
| 19 | Post-login from landing book | **`/dashboard/book?session=`** — portal book page *(not landing)* |
| 20 | Session intent | **`bookSessionId` in URL** → modal auto-opens — user never re-clicks card |
| 21 | After confirm | Navigate **`/dashboard/bookings`** *(existing portal behaviour)* |
| 22 | Modal UX | P0 = reliable auto-open on dashboard; P1 = reference confirmation layout |
| 23 | Dismiss modal | Stay on **`/dashboard/book`** catalog |

### Post-login book resume *(Problem 6 — execution)*

```
Step A  Fix PublicSessionCatalog: reliable open when ?session= + sessions loaded
Step B  Signup.tsx: pass bookSessionId through to Login
Step C  auth-routes.ts: getPostLoginBookDestination() — always /dashboard/book?session= for client + bookSessionId
Step D  (P1) BookSessionModal confirmation redesign + price on PublicSessionCard
```

---

| Goal | Outcome |
|------|---------|
| **Accurate copy** | Section frames **workshops & info sessions** — not “book your audit here” |
| **Format-aware cards** | Session cards communicate private vs group; button labels match session type |
| **CTA hierarchy** | **Contact us** = audit/advisory (header); **Book Now** = hero → `#booking`; **Sessions** nav + catalog = workshops |
| **Catalog parity** | Landing `#booking` matches `/dashboard/book` — filters, search, list \| calendar |
| **Portal parity** | Logged-in clients see registered-session state (same as portal) |
| **Seamless book resume** | Logged-out book → login → **`/dashboard/book` + confirm modal auto-open** |

---

## Current state *(audit)*

### What works today

| Area | Status |
|------|--------|
| Live sessions from Supabase | ✅ `fetchPublicSessions()` — future, non-cancelled sessions |
| Filters | ✅ Type + location dropdowns |
| Book flow | ✅ Login → `/dashboard/book?session=` + confirm modal auto-open *(Problem 6)* |
| Full sessions | ✅ Hidden by default unless user is registered |
| Price + format badges | ✅ Cards + confirmation modal |
| Portal i18n | ✅ Reads language from `localStorage` *(set on landing toggle)* |
| i18n shell | ✅ EN + ZH keys in `translations.ts` |
| Session images | ✅ Always-on cover zone + gradient fallback — **P1.5: category photo library optional** |
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

### UX gaps vs client portal *(updated target)*

| Feature | Landing `#booking` *(branch P0)* | Client `/dashboard/book` | **Target** |
|---------|----------------------------------|--------------------------|------------|
| Registered session highlight | ✅ | ✅ | Keep |
| Dynamic card CTA | ✅ | ✅ | Keep |
| Type + location filters | ✅ | ✅ | Keep |
| **Search** | ✅ | ✅ | Done — shared component |
| **List \| Calendar toggle** | ✅ | ✅ | Done — shared component |
| **Week navigation** | ✅ | ✅ | Done — shared component |
| Price on card | ✅ | ✅ | Done — `PublicSessionCard.price` |
| Bottom “need audit?” banner | ✅ | N/A | Done on landing |
| Format badge (Private / Clinic / Workshop) | ✅ | ✅ | Done — `SessionCard` |
| Portal i18n | ✅ | ✅ | Done — `language-preference.ts` + portal page copy |
| Logged-in portal shortcut | ✅ | N/A | Done — banner on landing when signed in |

### CTA hierarchy *(revised — hero split)*

| CTA location | **Correct behaviour** | Rationale |
|--------------|----------------------|-----------|
| **Header button** | **Contact us** → `ContactModal` | Audit/advisory = primary revenue; persistent sitewide |
| **Hero primary** | **Book Now** → `#booking` scroll | Distinct from header; drives workshop catalog without duplicate label |
| **Nav text link “Sessions”** | `#booking` anchor | Discoverability; complements hero |
| **Services section** | **Contact us** → `ContactModal` | Audit services block — appropriate deep in page |
| **`#booking` section** | Full session catalog (list + calendar) | Workshop/info-session self-service |
| **FAQ** | Two paths: book open session **or** contact for audit | Already updated on branch |
| **Bottom banner in `#booking`** | “Need audit or bespoke advisory? **Contact us**” | Audit upsell inside booking section |

---

## Problem 1 — Wording & positioning

### Product framing

“Book a session” on the homepage is **not** the main sales funnel. It supports:

- **Workshops** — MPF masterclass, GBA structuring, group compliance events
- **Info sessions / clinics** — PTR Q&A, open compliance briefings
- **Occasional private slots** — when offered, not the default message

Audit, tax, and bespoke advisory → **Contact us** in header, services, contact section, and `#booking` audit banner.

Workshop / info-session booking → **Book Now** in hero + `#booking` catalog.

### Copy issues *(branch P0 partially fixed)*

| Key | Issue | Direction |
|-----|-------|-----------|
| `booking.subtitle` | Still leads with “consultations… private advisory” | Lead with **workshops, clinics, info sessions** |
| `booking.title` | “Book a Session” is OK | Optional: “Workshops & sessions” if clearer |
| Card CTAs | ✅ Dynamic by capacity on branch | Keep |
| DB session titles | Admin-entered | Guideline: catalogue = events; audit = contact |

### Recommended copy *(revised)*

#### Hero CTA *(revised — Problem 3)*

| Key | EN | ZH |
|-----|----|----|
| `hero.btn` | **Book Now** | **立即預約** |

Action: `scrollToBookingSection()` — reuses `src/lib/scroll-to-booking.ts`.

#### Section header

| Key | EN *(proposed)* | ZH *(proposed)* |
|-----|-----------------|-----------------|
| `booking.label` | `UPCOMING WORKSHOPS & SESSIONS` | `即將舉行的工作坊及活動` |
| `booking.title` | `Book a Session` *(keep)* or `Workshops & Info Sessions` | `預約活動` |
| `booking.subtitle` | **Register for upcoming workshops, clinics, and info sessions on tax, compliance, and payroll.** | **登記參加即將舉行的稅務、合規及薪酬工作坊、答疑診所及講座。** |

#### Bottom banner *(inside `#booking` — new)*

| EN | ZH |
|----|-----|
| **Need statutory audit or bespoke advisory?** Contact us to discuss your engagement. | **需要法定審計或度身顧問服務？** 歡迎聯絡我們商討。 |

CTA button: **Contact us** → opens `ContactModal`.

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

## Problem 2 — Should landing `#booking` match `/dashboard/book`?

### Analysis

**Yes — recommended**, with shared UI, not a second bespoke grid.

`/dashboard/book` already ships:

- List \| Calendar segmented control
- Type + location filters + search
- `SessionsCalendarView` with week navigation
- `SessionCard` grid with registered-session highlighting
- `BookSessionModal` book flow

Landing `#booking` today *(branch P0)* is a **subset**: card grid + filters only. Users who scroll to Sessions on the homepage get a weaker experience than logged-in clients — inconsistent and duplicate maintenance.

### Reference pattern *(fitness “Weekly Schedule”)*

The attached reference shows a strong layout Meridian can adapt:

```
[ Section title + subtitle ]
[ List | Calendar toggle ]     [ Week nav + Today ]
[ Filters: type | location | … ]
[ Grid or calendar content ]
[ Bottom banner: “Need something more personal? Contact …” ]
```

For Meridian, the bottom banner becomes **audit/advisory → Contact us** (not private 1:1 booking).

### Recommended approach — **Option B: Shared catalog component**

| Option | Description | Verdict |
|--------|-------------|---------|
| A | Duplicate dashboard markup inside `BookingSection` | ❌ Drift risk |
| **B** | **Extract `PublicSessionCatalog`** — props: `lang`, `variant: 'landing' \| 'portal'`, callbacks | ✅ **Recommended** |
| C | Landing shows 3-card preview + “View all in portal” link | ❌ Too thin for public marketing |
| D | Redirect `#booking` entirely to `/dashboard/book` | ❌ Bad for logged-out visitors |

**`PublicSessionCatalog`** *(new shared component)*:

- Owns: view mode, filters, search, week state, session fetch, registered map, empty states
- Renders: toolbar + `SessionCard` grid **or** `SessionsCalendarView`
- Props:
  - `lang`, `locale`
  - `variant` — `'landing'` (cream section, scroll animation wrapper optional) vs `'portal'` (plain page body)
  - `onContactClick?` — landing only, for bottom audit banner
  - `bookSuccessRedirect?` — portal navigates to bookings; landing shows inline banner

**Consumers after extract:**

| Consumer | Wrapper |
|----------|---------|
| `BookingSection.tsx` | Landing section shell: label, title, subtitle, divider, `PublicSessionCatalog`, audit banner |
| `DashboardBookSession.tsx` | `DashboardLayout` + page title + `PublicSessionCatalog` |

**Effort:** ~1 refactor PR on top of branch P0 — mostly moving existing `DashboardBookSession` body into shared component.

### Landing-specific differences *(keep)*

| Element | Landing | Portal |
|---------|---------|--------|
| Section chrome | Gold label, serif title, cream `#F9F9F6` bg, scroll animation | Dashboard page header |
| Audit bottom banner | ✅ Show | ❌ Hide |
| Header nav | N/A | Portal sidebar “Book a session” |
| Logged-out book | Login → **`/dashboard/book?session=` + modal auto-open** *(Problem 6)* | Same URL today — modal unreliable | **Fix auto-open** |
| i18n | Full EN/ZH | Currently EN-only on portal *(fix in P1)* |

### What **not** to copy from dashboard on landing

- `DashboardLayout` / portal chrome
- Portal-only “View all in portal” banner *(unless logged in)*
- Admin session management affordances

---
Prioritised by impact vs effort.

### Already shipped on branch *(needs revision)*

| # | Item | Status | Revision needed |
|---|------|--------|-----------------|
| 1 | Subtitle EN/ZH | ✅ | Reword → workshops/info lead |
| 2 | Dynamic card CTA | ✅ | Keep |
| 3 | Registered sessions on landing | ✅ | Keep |
| 4 | Nav **Sessions** link | ✅ | Keep |
| 5 | Header **Contact us** + hero **Book Now** | ✅ | Done |
| 6 | FAQ two-path copy | ✅ | Keep |

### P0 — Remaining / revised

| # | Suggestion | Why | Status |
|---|------------|-----|--------|
| 7 | **Hero → Book Now** (header stays Contact us) | Fixes duplicate Contact us above fold | ✅ Done |
| 8 | **Extract `PublicSessionCatalog`** | List + calendar + search parity with portal | ✅ Done |
| 9 | **Audit bottom banner** in `#booking` | Clear upsell to contact for audit work | ✅ Done |
| 10 | **Reword subtitle** — workshops/info first | Matches business positioning | ✅ Done |
| 11 | **Post-login book resume** — `/dashboard/book` + reliable confirm modal *(Problem 6)* | User shouldn't re-click card after login | ✅ Done |

### P1 — Strong follow-ups

| # | Suggestion | Why | Status |
|---|------------|-----|--------|
| 11 | **Calendar uniform card height** | Fix empty-day stretch + badge height drift in `SessionsCalendarView` | ✅ Done |
| 12 | **Show price on cards** | DB has `price`; reduces surprise before modal | ✅ Done |
| 13 | **Format badge** — Workshop / Clinic / Private | Quick scan in grid | ✅ Done |
| 14 | **Always-on cover zone** — upload or category fallback *(Problem 5)* | Grid scannability + height consistency | ✅ Done |
| 14b | **Category photo library** *(×4)* — realistic covers above gradient *(Problem 5b)* | Marketing polish; reuse site visual tone | ✅ Done |
| 15 | **i18n for `BookSessionModal`** | Landing is bilingual; portal should match | ✅ Done |
| 16 | **Logged-in shortcut** | “Open client portal” on landing when signed in | ✅ Done |
| 17 | Hide full sessions by default | Align with portal filter logic | ✅ Done *(already in `PublicSessionCatalog`)* |

### P2 — Defer

| # | Suggestion | Why |
|---|------------|-----|
| 17 | Remove dead `data/sessions.ts` + unused translation keys | Cleanup |
| 18 | Session description excerpt on card | Card height / design |
| 19 | SEO Event schema | Future |
| 20 | Hide capacity bar on public calendar *(optional)* | Shorter public cards |
| 21 | Seed custom cover art for flagship workshops | Marketing polish — ops not code |
| 22 | **Category default photos** in `public/images/sessions/` | 4× 16:9 WebP — tax, audit, payroll, advisory |

---

## Locked product decisions

| # | Decision | Choice |
|---|----------|--------|
| 1 | Business role of `#booking` | **Workshops & info sessions** — not primary audit funnel |
| 2 | **Header CTA** | **Contact us** → enquiry modal |
| 2b | **Hero primary CTA** | **Book Now** → `#booking` scroll *(fixes duplicate Contact us)* |
| 3 | Session discoverability | Nav text link **Sessions** → `#booking` *(no competing header button)* |
| 4 | Catalog UI | **Shared with `/dashboard/book`** — list \| calendar, filters, search via `PublicSessionCatalog` |
| 5 | Subtitle framing | Lead with **workshops, clinics, info sessions** |
| 6 | Card CTA | **Dynamic** by capacity tier *(private / small group / workshop)* |
| 7 | Registered sessions | **Same treatment as portal** on landing when logged in |
| 8 | Bottom banner | **Audit/advisory → Contact us** inside `#booking` section |
| 9 | FAQ | **Two paths**: book open session vs contact for audit |
| 10 | Title “Book a Session” | **Keep** for nav/section consistency |
| 11 | Grid cover zone | **Always on** — custom upload OR category fallback *(Problem 5)* |
| 12 | Calendar cover | **Off** — grid only |
| 15 | Realistic photos | **Category library (×4)** — gradients remain fallback *(Problem 5b)* |
| 16 | Photo style | On-brand HK professional — **no generic stock** |

### CTA map *(revised — hero split)*

```
Header button                    →  ContactModal (audit & advisory)
Hero primary                     →  #booking scroll (Book Now)
Nav link "Sessions"              →  /#booking
Services CTA                     →  ContactModal
#booking catalog                 →  list | calendar, book flow
#booking bottom banner           →  ContactModal (audit upsell)
Logged-in registered card        →  /dashboard/bookings?booking=<id>
Client portal                    →  /dashboard/book (same catalog component)
```

### Branch correction note

Commit `f8ee88f` swapped header/hero to **Browse sessions** — partially reverted. **Header + services** → **Contact us**; **hero** → **Book Now** (not Contact us, not Browse sessions). Keep: nav Sessions link, subtitle direction, dynamic CTAs, registered state, `PublicSessionCatalog`.

---

## Page specifications

### `#booking` section header

- [x] Update `booking.subtitle` EN + ZH *(see recommended copy above)*
- [ ] Optional: one-line approval note under subtitle *(P2)*
- [x] Keep gold label + serif title + divider — no layout change

### `#booking` section — catalog *(target: match portal)*

- [x] **Extract `PublicSessionCatalog`** shared component
- [x] List \| Calendar toggle + week navigation
- [x] Type + location filters + **search**
- [x] Dynamic card CTA by capacity tier *(branch)*
- [x] Registered session state *(branch)*
- [x] **Audit bottom banner** — “Need statutory audit… Contact us”
- [x] Hide full sessions by default unless registered
- [x] Price + format badge on cards
- [x] Logged-in “Open client portal” banner

### Site-wide CTA alignment *(revised — hero split)*

- [x] **Header button** → **Contact us**
- [x] **Hero primary** → **Book Now** → `#booking` *(fix redundancy)*
- [x] Nav **Sessions** text link → `#booking`
- [x] **Services** CTA → Contact us
- [x] FAQ two-path answer
- [x] Contact section button → Contact us

---

## Files in scope

| File | Action |
|------|--------|
| `src/components/PublicSessionCatalog.tsx` | **New** — shared list/calendar catalog *(extract from dashboard)* |
| `src/screens/Dashboard/DashboardBookSession.tsx` | Refactor → thin wrapper around `PublicSessionCatalog` |
| `src/screens/Desktop/sections/BookingSection/BookingSection.tsx` | Section shell + `PublicSessionCatalog` + audit banner |
| `src/lib/translations.ts` | `hero.btn` → Book Now / 立即預約; header `contactUs`; workshop subtitle |
| `src/screens/Desktop/sections/TopNavigationSection/TopNavigationSection.tsx` | Header → Contact us; keep Sessions nav link |
| `src/screens/Desktop/sections/HeroSection/HeroSection.tsx` | **Book Now** → `#booking` scroll |
| `src/screens/Desktop/Desktop.tsx` | Wire hero → `scrollToBookingSection`; header/services → contact |
| `src/screens/Desktop/sections/MainContentSection/MainContentSection.tsx` | Services → Contact us |
| `src/screens/Desktop/sections/BookingSection/SessionCard.tsx` | **P1** — always-on cover zone + category fallback |
| `src/lib/session-cover-fallback.ts` | **P1.5** — category photo URLs above gradient |
| `public/images/sessions/` | **P1.5** — 4× category cover assets *(new)* |
| `src/lib/public-sessions.ts` | ✅ `price` + `sessionTypeName` |
| `src/lib/session-format.ts` | ✅ Format badge helper |
| `src/lib/language-preference.ts` | ✅ Persist EN/ZH landing ↔ portal |
| `src/screens/Admin/catalog/SessionsCalendarView.tsx` | ✅ Uniform session card + empty-day height |
| `src/lib/auth-routes.ts` | ✅ `getPostLoginBookDestination()` |
| `src/lib/pending-book-session.ts` | ✅ Session intent backup through login |
| `src/screens/Login/Login.tsx` | ✅ `/dashboard/book?session=` redirect |
| `src/screens/Signup/Signup.tsx` | ✅ `bookSessionId` passthrough |
| `src/components/PublicSessionCatalog.tsx` | ✅ Shared catalog + modal auto-open + logged-in banner |
| `src/components/BookSessionModal.tsx` | ✅ Confirmation layout + i18n + price |
| `Implementation/IMPLEMENTATION_PLAN_BOOKING.md` | ✅ Cross-linked — landing polish complete |

### Out of scope

- Admin session CRUD / catalog changes
- Client portal `/dashboard/book` *(handled in IMPLEMENTATION_USER.md)*
- Email notifications on book
- Homepage sections other than booking + CTA trail

---

## Execution order *(revised)*

```
Step 0  Verify live session mix in Supabase
   ↓
Step 1  Header + services → Contact us; hero → Book Now (#booking)  ← fixes redundancy
   ↓
Step 2  Reword subtitle → workshops & info sessions first
   ↓
Step 3  Extract PublicSessionCatalog from DashboardBookSession
   ↓
Step 4  Wire BookingSection to PublicSessionCatalog + audit bottom banner
   ↓
Step 5  (P1) Price, format badge, BookSessionModal i18n
   ↓
Step 6  QA + update IMPLEMENTATION_PLAN_BOOKING.md
   ↓
Step 7  (P2) Remove dead mock data
```

### Already complete on branch *(keep, adjust copy only)*

- Step 2 — dynamic card CTA ✅
- Step 3–4 — `PublicSessionCatalog` + audit banner ✅
- Nav Sessions link ✅
- FAQ two-path ✅
- Header + services Contact us ✅
- **Pending:** Step 1 hero → Book Now ✅

---

## Step 0 — Verification checklist

- [ ] `#booking` renders live sessions (not static mock)
- [ ] Catalog includes at least one private (`max_slots = 1`) and one group session
- [ ] `SessionCard` renders tags from `session_type` / category in DB
- [x] Logged-out book flow: card → login → **`/dashboard/book?session=` + modal auto-open** *(Problem 6)*
- [ ] Document which session titles are admin-entered vs translation-driven

---

## Step 1 — Copy updates

- [x] Replace `booking.subtitle` EN
- [x] Replace `booking.subtitle` ZH
- [x] Set `hero.btn` → **Book Now** / **立即預約**
- [ ] Update FAQ answer to mention `#booking` session grid *(optional refresh)*
- [ ] Admin note: avoid “1-on-1” in group session titles

**EN subtitle (final):**

> Register for upcoming workshops, clinics, and info sessions on tax, compliance, and payroll.

**ZH subtitle (final):**

> 登記參加即將舉行的稅務、合規及薪酬工作坊、答疑診所及講座。

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

## Step 4 — CTA alignment *(revised — hero split)*

- [x] Header button → **Contact us** (opens `ContactModal`)
- [x] Hero primary → **Book Now** (scroll to `#booking`)
- [x] Services CTA → **Contact us**
- [x] Keep nav **Sessions** text link → `#booking`
- [x] FAQ + contact section copy

---

## Step 5 — Shared catalog + audit banner

- [ ] Create `PublicSessionCatalog.tsx` — extract from `DashboardBookSession`
- [ ] Props: `lang`, `variant`, `onContactClick?`, booking success handling
- [ ] Landing: wrap in `BookingSection` shell + scroll animation
- [ ] Portal: wrap in `DashboardLayout` page header
- [ ] Add bottom banner: audit/advisory → Contact us
- [ ] Verify logged-out + logged-in flows unchanged

---

## Step 6 — P1 polish *(complete)*

- [x] **Calendar view:** uniform session card `min-h` + compact empty-day placeholder *(Problem 4)*
- [x] Add `price` to `PublicSessionCard` + display on card and modal
- [x] Format badge on card (Private / Clinic / Workshop)
- [x] **Cover zone:** always render 16:9 area — `imageUrl` or category fallback
- [x] **Category photos:** 4 default images wired above gradient fallback *(Problem 5b)*
- [x] `BookSessionModal` accepts `lang` prop — EN/ZH copy, price, policy note, cover thumb
- [x] Logged-in portal shortcut banner on landing
- [x] Portal `/dashboard/book` reads stored language preference

---

## QA checklist

### Copy

- [ ] Subtitle does not lead with “1-on-1 only”
- [ ] ZH subtitle reads naturally for mixed formats
- [ ] FAQ describes both booking paths

### Cards

- [x] Private session → “Book consultation”
- [x] Clinic (small group) → “Reserve spot”
- [x] Masterclass/workshop → “Register now”
- [x] Full session → hidden unless registered *(or disabled Full when shown)*
- [x] Logged-in + already booked → highlight + “View booking”
- [x] Grid card always shows cover zone (upload or category fallback)
- [x] Format badge (Private / Clinic / Workshop) on card
- [x] Price shown on card and confirmation modal
- [x] Calendar mini-cards remain text-only (no cover)

### Navigation

- [x] Header button → **Contact us**
- [x] Hero → **Book Now** (scrolls to `#booking`; not duplicate Contact us)
- [x] Nav **Sessions** link scrolls to `#booking`
- [x] `#booking` has list \| calendar like portal
- [x] Logged-in users see “Open client portal” banner on landing

### Catalog parity

- [x] Search works on landing
- [x] Calendar view + week nav works on landing
- [x] Audit bottom banner visible; Contact us opens modal
- [x] Calendar session cards + empty days share consistent min-height
- [x] Portal book page uses same language as landing toggle

### Calendar view *(Problem 4)*

- [x] Empty day shows compact “No sessions” block — not full-column stretch
- [x] Session cards with/without status badge are same height
- [x] Multi-session days stack cleanly; row still grid-aligned

### Flows *(Problem 6)*

- [x] Logged-out: Reserve spot → login → **`/dashboard/book`** with confirm modal open
- [x] User does not need to click the same session card again
- [x] Confirm → pending booking → `/dashboard/bookings`
- [x] Dismiss modal → stays on `/dashboard/book` catalog
- [x] Signup path preserves `bookSessionId` through to login
- [x] Already registered → `/dashboard/bookings?booking=`
- [x] Session full/cancelled → toast + clear `?session=`

### Flows *(general)*

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
| Session description excerpt on card | Pull `sessions.description` — truncate 2 lines |
| “Starting soon” badge | Sessions within 48h |
| Share / add to calendar | After booking confirmed |
| SEO Event schema | Public sessions |
| Hero secondary link | Optional “Contact us ↓” below Book Now if audit discovery is low *(unlikely needed — header already covers)* |

---

## Related documents

| Document | Relationship |
|----------|--------------|
| [IMPLEMENTATION_PLAN_BOOKING.md](./IMPLEMENTATION_PLAN_BOOKING.md) | Parent roadmap — Phase 2 landing live sessions |
| [IMPLEMENTATION_USER.md](./IMPLEMENTATION_USER.md) | Client portal book page — parity reference for registered sessions |
| [IMPLEMENTATION_DB_CAPACITY.md](./IMPLEMENTATION_DB_CAPACITY.md) | Capacity / `max_slots` behaviour |
