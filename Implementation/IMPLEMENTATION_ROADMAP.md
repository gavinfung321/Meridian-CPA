# Conservative Roadmap — Pre-flight → Phase 4 → Phase 5 → Email

## Overview

Execution plan for everything after the #6–#8 merge. Work **top-to-bottom** — do not start Phase 4 until Pre-flight is green (or bugs are filed and triaged).

> **Status:** 🚧 **Active** — Wave 0 in progress ([#9](https://github.com/gavinfung321/Meridian-CPA/issues/9))  
> **Parent plan:** [IMPLEMENTATION_PLAN_BOOKING.md](./IMPLEMENTATION_PLAN_BOOKING.md)  
> **Path chosen:** Conservative *(ops + QA first, then feature phases in order, email at launch)*  
> **Branch:** `chore/issue-9-ops-preflight`

### Locked sequence

```
Wave 0  Pre-flight — Supabase ops + manual QA
   ↓
Wave 1  Phase 4 — History & logging
   ↓
Wave 2  Phase 5A — People management
   ↓
Wave 3  Phase 5B — Settings & reporting
   ↓
Wave 4  Email notifications — pre-launch
```

**Out of this path (do not start until Waves 0–3 are done):**
- Landing P2 cleanup (`data/sessions.ts`, unused keys)
- `/about` firm story page
- Optional `/admin/bookings/:id` route

---

## GitHub issue queue

Create issues **when starting each wave**, not all upfront.

| Wave | Suggested issue title | Branch pattern |
|------|----------------------|----------------|
| 0 | `Ops: Supabase verify, Realtime, reset-password, QA pass` | `chore/ops-preflight` |
| 1 | `Phase 4: Audit trails — login, session, admin booking history` | `feat/issue-N-phase-4-audit-trails` |
| 2 | `Phase 5A: Client search, promote/demote, full detail page` | `feat/issue-N-phase-5a-people-mgmt` |
| 3 | `Phase 5B: Firm settings + admin reporting` | `feat/issue-N-phase-5b-settings-reporting` |
| 4 | `Email notifications on booking status change` | `feat/issue-N-booking-emails` |

**Commit format:** `[#<issue>] …`

---

## Wave 0 — Pre-flight *(ops + QA)*

**Goal:** Confirm production readiness of what’s already merged; catch regressions before new features.

**Exit criteria:** All Step 0 checks pass **or** blocking bugs filed; QA smoke pass with no P0/P1 failures.

### Step 0 — Supabase & deploy ops

- [x] Confirm local migration exists: `supabase/migrations/20250830160000_session_type_default_max_slots.sql`
- [x] Inspect **remote** `session_types`: column `default_max_slots` present *(verified via CLI query, Sep 1 2026)*
- [x] If missing: `npx supabase db push` — **not needed**; all 16 migrations in sync locally ↔ remote
- [ ] Smoke test: create/edit session type with capacity via admin UI *(manual)*
- [x] Supabase Realtime: `bookings` in `supabase_realtime` publication *(verified via CLI query)*
- [x] Confirm `20250830150000_booking_history_insert_policy.sql` applied remotely
- [x] Confirm `20250831120000_client_booking_history_select.sql` applied remotely
- [ ] Add production **Authentication → Redirect URLs** for `/reset-password` *(when deploy target is known)*

**Automated log (Sep 1, 2026):** Linked project `session-booker-pro` (`jylccsehlmabbxpabfnr`). `npx supabase migration list` — 16/16 matched. `booking_history` policies: admin read, user read own, insert for users+admins.

**Reference:** [IMPLEMENTATION_DB_CAPACITY.md](./IMPLEMENTATION_DB_CAPACITY.md) Step 0

### Step 1 — Landing QA *(#8 regression)*

- [x] `npm run build` passes *(verified Sep 1, 2026)*

**Code audit (automated — not a substitute for browser QA):**
- [x] `#booking` uses `PublicSessionCatalog` → `fetchPublicSessions` *(not `MOCK_SESSIONS`)*
- [x] Hero CTA = “Book Now” / “立即預約”; header = “Contact us”
- [x] Nav **Sessions** → `#booking`
- [x] Post-login resume: `pending-book-session.ts` + `getPostLoginBookDestination`
- [x] Logged-in banner copy: `portal.manageLink` = “Open client portal”

**Manual browser QA remaining** — run with `npm run dev`:

- [ ] `#booking` loads live sessions from Supabase *(not mock data)*
- [ ] Subtitle frames workshops/clinics — not 1-on-1-only (EN + ZH)
- [ ] Header **Contact us** opens enquiry modal
- [ ] Hero **Book Now** scrolls to `#booking`
- [ ] List \| Calendar toggle; filters + search work
- [ ] Format badges + price visible on cards
- [ ] Cover zone shows upload or category fallback image
- [ ] Logged-out: book → login → lands on `/dashboard/book?session=` with confirm modal
- [ ] Logged-in: registered session → **View booking** (not re-book modal)
- [ ] Logged-in: “Open client portal” banner visible
- [ ] EN/ZH toggle updates booking copy + modal i18n

**Reference:** [IMPLEMENTATION_LANDING_PAGE_BOOK.md](./IMPLEMENTATION_LANDING_PAGE_BOOK.md) § QA

### Step 2 — Client portal QA *(#7 regression)*

**Code audit:** `ClientNotificationBell`, `sortClientBookingsList`, `ClientBookingsCalendarView`, `ClientBookingDetailModal` history timeline — all present on `main`.

**Manual browser QA remaining:**
- [ ] New `user`: welcome state + browse strip + phone nudge
- [ ] Overview: greeting, metric cards, pending gold highlight, activity feed (All \| You \| Firm)
- [ ] Metric card links → filtered `/dashboard/bookings?status=…`
- [ ] Bell badge + dropdown; realtime refresh after admin action
- [ ] `/dashboard/book`: list + calendar; registered gold/green styling
- [ ] `?session=` opens modal; already-registered → booking detail
- [ ] `/dashboard/bookings`: status tabs, search, pagination, list + calendar
- [ ] Bookings sorted by **session date** (not `created_at`)
- [ ] Detail modal: history timeline + cancel reason; cancel updates list
- [ ] `?booking=<id>` deep link opens modal
- [ ] Banned user: suspension banner; book disabled gracefully
- [ ] Admin hitting `/dashboard` redirects per auth routes

**Reference:** [IMPLEMENTATION_USER.md](./IMPLEMENTATION_USER.md) § QA

### Step 3 — Admin QA *(Phase 3 / #6 regression)*

**Code audit:** Catalog tabs + `AdminClients` use **Eye-only** Actions; `SessionFormModal` prefills capacity + description from type; `SessionTypeFormModal` empty capacity on create.

**Manual browser QA remaining:**
- [ ] `/admin/bookings`: filters, search, row click → detail modal, approve/reject/cancel/reinstate
- [ ] `/admin/sessions`: session types capacity + description columns; sessions description column
- [ ] New session: capacity + description prefilled from type on select
- [ ] Sessions + Clients Actions = **View** (eye) only; row click → modal
- [ ] `/admin/clients`: live list, role tabs, ban/reinstate, ClientProfileModal edit
- [ ] Realtime: client bell/overview updates when admin approves booking

### Step 4 — Triage & doc sync

- [x] GitHub issue filed: [#9](https://github.com/gavinfung321/Meridian-CPA/issues/9)
- [ ] File GitHub issues for any P0/P1 bugs found in Steps 1–3
- [ ] Fix P0/P1 before starting Wave 1 *(P2 can defer)*
- [ ] Tick completed QA boxes in source docs when manual QA passes
- [ ] Mark Wave 0 complete in progress tracker below

---

## Wave 1 — Phase 4: History & Logging

**Goal:** Wire audit tables that already exist in schema; give admins compliance-grade visibility.

**Depends on:** Wave 0 green.

**Partial credit on `main` today:**
- `booking_history` inserts on status changes via `booking-history.ts` ✅
- Client `ClientBookingDetailModal` shows history timeline ✅
- Admin + client activity feeds consume `booking_history` ✅

**Gaps:**
- No writes to `user_login_history`
- No writes to `session_history`
- Admin `BookingDetailModal` has **no** history timeline

### Execution order

```
Step 0  Verify RLS + table shapes (read-only audit)
   ↓
Step 1  Login history writes
   ↓
Step 2  Session history writes (triggers or service layer)
   ↓
Step 3  Admin booking detail timeline
   ↓
Step 4  Client login history in admin UI
   ↓
Step 5  Session change log viewer
   ↓
Step 6  QA + update IMPLEMENTATION_PLAN_BOOKING.md § Phase 4
```

### Step 0 — Verification

- [ ] Confirm tables exist: `user_login_history`, `session_history`, `booking_history`
- [ ] Confirm RLS: admin read on all three; client read own booking history only
- [ ] Document insert policy gaps *(login + session history may need new policies or service role)*

### Step 1 — Login history

- [ ] On successful login, insert row into `user_login_history`
- [ ] Capture at minimum: `user_id`, `login_time`, `user_agent`
- [ ] IP optional *(Edge Function or auth hook if client IP required)*
- [ ] Do not log failed attempts in v1 *(optional follow-up)*

**Implementation options *(pick one in issue)*:**
| Option | Pros | Cons |
|--------|------|------|
| Supabase Auth Hook → Edge Function | Server-side, reliable IP | Infra setup |
| Post-login insert from `Login.tsx` | Simple, no Edge Function | No IP; client can skip if bypassed |

### Step 2 — Session history

- [ ] On session CREATE: insert `session_history` with `action = 'created'`, `new_data`
- [ ] On session UPDATE: insert with `old_data` + `new_data` *(title, schedule, capacity, cancel, etc.)*
- [ ] On session CANCEL: insert with cancel metadata
- [ ] Set `changed_by` to authenticated admin `profiles.id`
- [ ] Prefer DB triggers **or** centralized helpers in session admin libs — not scattered one-offs

### Step 3 — Admin booking timeline

- [ ] Fetch `booking_history` for selected booking in `BookingDetailModal`
- [ ] Reuse client modal timeline UI pattern *(actor, relative time, status labels)*
- [ ] Show `cancel_reason` when present on terminal events
- [ ] Loading + empty states

### Step 4 — Client login history (admin)

- [ ] In `ClientProfileModal` or `/admin/clients/:id`: **Login history** section/tab
- [ ] List recent logins: date, user agent *(IP if captured)*
- [ ] Paginate or cap at last N entries

### Step 5 — Session change log viewer

- [ ] From catalog session row/modal: link or tab **Change log**
- [ ] Read `session_history` filtered by `session_id`
- [ ] Human-readable action labels *(Created, Updated, Cancelled)*

### Step 6 — QA & docs

- [ ] Login → row appears in `user_login_history`
- [ ] Edit session title → row in `session_history`
- [ ] Admin booking modal shows full status timeline
- [ ] Client login tab shows login entries
- [ ] `npm run build` passes
- [ ] Mark Phase 4 complete in [IMPLEMENTATION_PLAN_BOOKING.md](./IMPLEMENTATION_PLAN_BOOKING.md)
- [ ] Close Wave 1 GitHub issue

---

## Wave 2 — Phase 5A: People management

**Goal:** Full client lifecycle in admin — search, promote/demote, rich detail page.

**Depends on:** Wave 1 complete *(login history tab needs Phase 4 data)*.

### Checklist

#### Directory enhancements

- [ ] Search input: filter `profiles` by name or email *(client-side or Supabase ilike)*
- [ ] Status filter: include **Banned** toggle or tab
- [ ] Optional: booking count column *(join/subquery on `bookings`)*

#### Role lifecycle

- [ ] Promote `user` → `client` with confirmation modal
- [ ] Demote `client` → `user` with confirmation modal
- [ ] `admin` rows remain view-only — no promote/demote/ban in UI
- [ ] Promote to `admin` stays manual/Supabase only

#### Detail page — `/admin/clients/:id`

- [ ] Full Option B editable form: name, phone, address fields
- [ ] Tabs: **Profile** \| **Bookings** \| **Login history**
- [ ] Bookings tab: list user’s bookings with link to admin booking modal
- [ ] Login history tab: reuse Wave 1 component
- [ ] Admin avatar upload for non-admin clients *(extend storage RLS on `profile-pictures`)*

#### QA

- [ ] Search finds partial name/email match
- [ ] Promote/demote updates role badge in list + profile
- [ ] Detail page edits persist; client can still edit own profile at `/dashboard/profile`
- [ ] `npm run build` passes
- [ ] Close Wave 2 GitHub issue

**Reference:** [IMPLEMENTATION_PLAN_BOOKING.md](./IMPLEMENTATION_PLAN_BOOKING.md) § Phase 5

---

## Wave 3 — Phase 5B: Settings & reporting

**Goal:** Replace remaining admin mocks; enforce firm booking rules; add analytics.

**Depends on:** Wave 2 complete *(or parallel if 5A detail page deferred — not recommended)*.

### Checklist

#### Settings — `/admin/settings`

- [ ] Remove `MockupBanner` from `AdminSettings.tsx`
- [ ] Wire `app_settings` table *(create migration if not on remote)*
- [ ] Editable: `max_booking_days_advance` booking window
- [ ] Placeholders: business hours, notification preferences *(UI only OK for v1)*
- [ ] Enforce `max_booking_days_advance` in client + public book flows

#### Reporting — `/admin/reporting`

- [ ] Replace mock with live Recharts dashboard
- [ ] Charts: session occupancy, projected revenue, category/type distribution
- [ ] Metrics: active vs banned clients, pending bookings snapshot
- [ ] Match admin design system (forest green / gold / cream)

#### Optional (late Phase 5)

- [ ] Account deletion via Edge Function + confirm modal
- [ ] Export CSV for bookings or clients

#### QA

- [ ] Changing booking window blocks far-future session booking in UI
- [ ] Reporting numbers reconcile with admin overview metrics
- [ ] `npm run build` passes
- [ ] Close Wave 3 GitHub issue

---

## Wave 4 — Email notifications *(pre-launch)*

**Goal:** Automated emails on booking lifecycle events.

**Depends on:** Waves 0–3 complete; production Supabase + domain ready.

### Checklist

- [ ] Choose provider: Resend or SendGrid
- [ ] Supabase Edge Function: on booking status change
- [ ] Templates: submitted, confirmed, rejected, cancelled *(EN minimum; ZH optional)*
- [ ] Secrets: API key in Supabase project settings
- [ ] Test with staging inbox
- [ ] Document env vars in README / deploy notes
- [ ] Close Wave 4 GitHub issue

**Reference:** [IMPLEMENTATION_PLAN_BOOKING.md](./IMPLEMENTATION_PLAN_BOOKING.md) § Notifications

---

## Progress tracker

| Wave | Name | Status |
|------|------|--------|
| 0 | Pre-flight — ops + QA | 🚧 In progress ([#9](https://github.com/gavinfung321/Meridian-CPA/issues/9)) |
| 1 | Phase 4 — History & logging | ⬜ Blocked on Wave 0 |
| 2 | Phase 5A — People management | ⬜ Blocked on Wave 1 |
| 3 | Phase 5B — Settings & reporting | ⬜ Blocked on Wave 2 |
| 4 | Email notifications | ⬜ Blocked on Wave 3 |

---

## Related documents

| Document | Relationship |
|----------|--------------|
| [IMPLEMENTATION_PLAN_BOOKING.md](./IMPLEMENTATION_PLAN_BOOKING.md) | Master phase definitions §7 |
| [IMPLEMENTATION_USER.md](./IMPLEMENTATION_USER.md) | Client portal spec + QA |
| [IMPLEMENTATION_LANDING_PAGE_BOOK.md](./IMPLEMENTATION_LANDING_PAGE_BOOK.md) | Landing booking spec + QA |
| [IMPLEMENTATION_DB_CAPACITY.md](./IMPLEMENTATION_DB_CAPACITY.md) | #6 ops verify checklist |
| [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md) | Marketing site *(out of this path)* |

---

*Last updated: Sep 1, 2026 — conservative path locked.*
