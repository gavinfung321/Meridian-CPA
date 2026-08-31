# Client Portal Dashboard — User Experience Overhaul

## Overview

Elevate the **client portal** (`/dashboard/*`) to match the polish and utility of the admin overview while staying focused on **self-service booking** for registered users and clients. This phase improves **both** `/dashboard` (overview) and `/dashboard/bookings` (management desk), adds a **notification bell + activity feed**, and introduces a **hybrid in-portal booking** experience without duplicating the full homepage catalog.

> **Status:** 🚧 In progress — Option C Book page shipped on `feat/issue-7-client-dashboard-portal`  
> **GitHub:** [#7](https://github.com/gavinfung321/Meridian-CPA/issues/7) *(create if not yet filed — see body in issue comment)*  
> **Branch:** `feat/issue-7-client-dashboard-portal`  
> **Commit format:** `[#7] …`

---

## Goals

| Goal | Outcome |
|------|---------|
| **Visual parity** | Client overview feels as premium as admin overview — greeting, metric cards, gold accents, Lucide icons |
| **Booking at a glance** | Next session, upcoming list, and stat cards link into filtered bookings |
| **Booking management** | Bookings page supports status filters, search, pagination, and booking detail |
| **Notifications** | Header bell (realtime) + activity timeline on overview — client-centric copy |
| **New-user onboarding** | Empty states prioritize **book first**; soft profile nudge when phone is missing |
| **Hybrid booking** | Dedicated **Book a session** page (list + calendar); Overview stays lightweight |

---

## Locked product decisions

| # | Decision | Choice |
|---|----------|--------|
| 1 | Scope | Improve **both** `/dashboard` and `/dashboard/bookings` in this phase |
| 2 | Notifications | **Bell + activity feed** on overview (mirror admin pattern, client-filtered data) |
| 3 | New users | **Book first**, profile second — primary CTA is booking; **non-blocking** banner when `phone_number` is empty |
| 4 | In-portal booking | **Option C** — dedicated `/dashboard/book` (list + calendar); header always → Book page; overview browse strip always visible |
| 5 | Header CTA | Always **Book a session** → `/dashboard/book`; consistent outline styling *(no “Book now” / “Book another” variant flip)* |
| 6 | Registered sessions | Book page highlights sessions user already booked — **Awaiting approval** (gold) / **Registered** (green); CTA → View booking |
| 7 | Notifications page | **Deferred v1** — bell dropdown + overview activity feed; bell footer links to `#activity`; full `/dashboard/notifications` in v2 with read state |

### New-user UX by state

| User state | Primary CTA | Secondary |
|------------|---------------|-----------|
| `user`, 0 bookings | Book / browse sessions (hero) | Profile banner if no phone |
| Has pending booking | Attention strip: awaiting firm approval | Complete phone if missing |
| `client` with upcoming | Next session card + upcoming list | Browse-more strip + header/sidebar; profile nudge secondary |

### Booking path (Option C)

```
Sidebar "Book a session"     →  /dashboard/book
Header "Book a session"      →  /dashboard/book  (outline, same label always)
Overview welcome / preview   →  /dashboard/book  (browse strip always; compact copy when upcoming)
Book page                    →  List | Calendar; registered sessions highlighted; ?session= redirects to booking if already registered
Homepage #booking            →  public catalog (logged-out + marketing escape hatch)
```

### Client portal nav

```
Overview  |  Book a session  |  Bookings  |  Profile
```

### Dashboard content priority

```
1. Pending approval banner     →  action needed
2. Next session + upcoming     →  core value for active clients
3. Profile phone nudge         →  non-blocking, never above pending
4. Browse sessions strip       →  primary for new users; compact for returning clients
```

### Layout header CTA

- Label: **Book a session** — always *(not “Book now” — CPA tone; matches nav + page title)*
- Style: outline (`border-[#0F2A1D]`, forest green text)
- Target: `/dashboard/book`

---

## Current state *(audit before coding)*

| Area | Today | Gap |
|------|-------|-----|
| `/dashboard/book` | List + calendar; registered-session highlighting | ✅ Phase 7 |
| `/dashboard` overview | Next session, upcoming, activity; browse strip (default / compact) | ✅ Phase 7 |
| `/dashboard/bookings` | Live table + cancel with reason | No status tabs/filters, no search, no pagination, no detail modal |
| `DashboardLayout` | Sidebar + header **Book a session** → `/dashboard/book`; notification bell | ✅ Phase 7 |
| Admin bell | `AdminNotificationBell` + `useBookingNotifications` | Client equivalent not built |
| Activity data | `booking_history` consumed by admin dashboard | No client-scoped fetch/helpers |
| Profile nudge | None on dashboard | Missing phone not surfaced |
| Pagination | `AdminTablePagination` on admin bookings | Not reused on client bookings |
| Homepage booking | Full `BookingSection` with filters | Reuse `SessionCard` / `BookSessionModal` only — not full section |

### Files in scope *(expected touch list)*

| File | Action |
|------|--------|
| `src/lib/client-dashboard.ts` | **New** — stats helpers, activity feed, notification queries |
| `src/lib/client-bookings.ts` | Extend — filters, `buildUserSessionBookingMap`, booking detail |
| `src/components/ClientNotificationBell.tsx` | **New** — client bell dropdown |
| `src/components/DashboardLayout.tsx` | Nav, header CTA → `/dashboard/book`, bell in `PortalLayout` |
| `src/screens/Dashboard/DashboardOverview.tsx` | Major refresh |
| `src/screens/Dashboard/DashboardBookings.tsx` | Filters, search, pagination, detail |
| `src/screens/Dashboard/ClientBookingDetailModal.tsx` | **New** *(or shared modal)* — read-only booking detail |
| `src/screens/Dashboard/DashboardBookSession.tsx` | **New** — Book a session page (list + calendar) |
| `src/screens/Dashboard/OpenSessionsPreview.tsx` | Browse strip — default (new users) / compact (has upcoming); excludes already-registered sessions |
| `src/screens/Dashboard/AvailableSessionsSection.tsx` | **Removed from Overview** — logic moved to Book page |
| `Implementation/IMPLEMENTATION_PLAN_BOOKING.md` | Update carried-forward + client checklist when complete |

### Out of scope *(this phase)*

- Email notifications (Edge Function + Resend/SendGrid) — deferred
- Document upload, payments, calendar `.ics` export — future
- Profile form changes — `/dashboard/profile` stays as-is except linked from nudge banner
- Admin dashboard changes

---

## Design system *(inherit from parent plan)*

Apply [IMPLEMENTATION_PLAN_BOOKING.md §2](./IMPLEMENTATION_PLAN_BOOKING.md) without deviation:

| Element | Token |
|---------|-------|
| Primary | Forest Green `#0F2A1D` |
| Accent | Gold `#C9A84C` |
| Surfaces | Cream `#F9F9F6`, border `#EDECE6`, white cards |
| Headings | `font-serif` |
| Body | `font-sans` |
| Toasts | Existing `ToastProvider` — top-left, green/gold |

**Layout width:** Match admin — `max-w-6xl` on overview content (client currently uses `max-w-5xl`).

**Reuse admin patterns where sensible:**

- `MetricCard` pattern from `AdminDashboardOverview` *(icons, gold highlight on pending > 0, clickable links)*
- `AttentionBanner` pattern *(gold strip + CTA)*
- Activity row layout *(avatar optional for client — firm actions may show “Meridian” or generic icon)*
- `AdminTablePagination` — rename usage only; component stays shared

---

## Page specifications

### `/dashboard` — Overview

#### Header block

- [ ] Time-of-day greeting + first name — `getGreeting()` *(reuse admin helper or extract to shared util)*
- [ ] One-line summary under title — e.g. `1 pending · 2 upcoming · 3 past`
- [ ] Remove or de-emphasize raw `RoleBadge` / `StatusBadge` in hero *(keep account status visible only when `banned` — see attention banners)*

#### Attention banners *(priority order — show at most one primary + optional profile nudge)*

| Condition | Banner | CTA |
|-----------|--------|-----|
| `profile.status === 'banned'` | Account suspended — contact firm | Link to contact / mailto |
| `pendingCount > 0` | Booking(s) awaiting firm approval | `/dashboard/bookings?status=pending` |
| Next session within 24h | Session starting soon | Next session card / bookings |
| `!profile.phone_number` | Add phone so we can reach you | `/dashboard/profile` |
| 0 bookings, role `user` | Welcome — book your first session | Scroll to `#available-sessions` |

#### Metric cards (3)

| Card | Value | Link | Notes |
|------|-------|------|-------|
| Upcoming | Confirmed + pending with future `start_time` | `/dashboard/bookings?status=upcoming` | CalendarDays icon |
| Pending approval | `status === pending` | `/dashboard/bookings?status=pending` | Gold left border when > 0 |
| Past / closed | Past confirmed, cancelled, rejected | `/dashboard/bookings?status=past` | |

- [ ] Equal-height cards, hover shadow, optional `(i)` tooltip explaining pending vs confirmed

#### Main content grid *(desktop: 2 columns)*

**Left column — bookings focus**

- [ ] **Next session** rich card — title, schedule, location, price, status badge, Cancel *(if pending/confirmed)*, “View all bookings”
- [ ] **Upcoming list** — next 3–5 bookings *(same row pattern as admin `UpcomingBookingRow`, client copy)*

**Right column — activity**

- [ ] **Recent activity** feed from `booking_history` scoped to current user’s bookings
- [ ] Filter tabs: **All | You | Firm** *(maps to actor: user vs admin — same as admin All/User/Admin)*
- [ ] Rows clickable → open booking detail modal or `/dashboard/bookings?booking=<id>`
- [x] Section id `#activity` — bell footer **View all activity →** deep link target

#### Browse sessions strip *(always visible when open sessions exist)*

- [x] Up to **3** rows — title, schedule, spots left, **Book** link
- [x] **Open sessions** title when `upcomingCount === 0`; **Browse more sessions** when user has upcoming
- [x] Excludes sessions user already registered for
- [x] Footer: **Browse all sessions →** `/dashboard/book`

#### Empty / welcome state *(0 upcoming)*

- [ ] Welcome banner → primary CTA **Book your first session** links to `/dashboard/book`
- [ ] Open sessions preview below main grid *(not full SessionCard grid)*

#### Realtime

- [ ] `useBookingNotifications(loadDashboard)` on overview — refresh stats, lists, activity on booking changes

---

### `/dashboard/book` — Book a session

#### Header

- [ ] Title: **Book a session** + subtitle *(choose from premium selection / open consultations)*

#### Views

- [x] Toggle: **List | Calendar** *(same segmented control as admin catalog)*
- [x] **List:** `SessionCard` grid + type/location filters + search
- [x] **Calendar:** weekly grid reusing `SessionsCalendarView` *(client variant — no admin Add)*

#### Registered sessions *(user already booked)*

- [x] **Pending** — gold left border + “Awaiting approval” badge; button → **View booking**
- [x] **Confirmed** — green left border + “Registered” badge; button → **View booking**
- [x] Rejected/cancelled — no highlight; re-book allowed if session open
- [x] Registered sessions remain visible even when session is full
- [x] `?session=<id>` redirects to booking detail if user already registered

#### Booking flow

- [ ] `BookSessionModal` + `createClientBooking` → toast → optional navigate to `/dashboard/bookings`
- [ ] URL `?session=<id>` opens book modal on load *(login redirect support — unless already registered)*

---

### `/dashboard/bookings` — Management desk

#### Header

- [ ] Title + subtitle *(keep “My bookings”)*
- [ ] Layout header CTA: **Book a session** (outline) → `/dashboard/book`

#### Filters & search

- [ ] Status filter tabs or URL-driven: **All | Upcoming | Pending | Past | Cancelled**
  - **Upcoming:** pending or confirmed, session in future
  - **Pending:** `status === pending`
  - **Past:** confirmed with past start, or terminal statuses
  - **Cancelled:** cancelled + rejected
- [ ] Sync with query params: `?status=`, `?booking=<id>` *(deep link opens detail modal)*
- [ ] Search input — filter by session title *(client-side on loaded rows)*

#### Table

- [ ] Keep columns: Session, Date, Location, Status, Actions
- [ ] Row click → booking detail modal
- [ ] Actions: **Cancel** for pending/confirmed; **View** eye icon optional for parity with admin
- [ ] Reuse `adminTableRowClassName` for hover

#### Pagination

- [ ] `AdminTablePagination` — default 10 rows, options 10/25/50
- [ ] “Showing X to Y of Z” footer copy

#### Booking detail modal

- [ ] Read-only: session title, schedule, location, price, status, created date
- [ ] Status timeline from `booking_history` when available *(fallback: synthesized from booking row)*
- [ ] Show `cancel_reason` when cancelled/rejected
- [ ] **Cancel booking** action when allowed *(reuse `CancelBookingModal`)*
- [ ] Close + navigate clears `?booking=` param

#### Realtime

- [ ] `useBookingNotifications(loadBookings)` — refresh table when admin approves/rejects

---

## Notifications

### Header bell — `ClientNotificationBell`

Mirror `AdminNotificationBell` structure; **different query and copy**.

| Aspect | Admin | Client |
|--------|-------|--------|
| Badge count | Pending bookings firm-wide | **Needs attention** on my bookings |
| Dropdown items | Pending client requests | Recent status changes on my bookings |
| Primary link | `/admin/bookings?booking=` | `/dashboard/bookings?booking=` |
| Footer | View all bookings | **View all activity →** `#activity` + **View my bookings →** |

**v1 — no dedicated notifications page.** Bell dropdown + overview activity feed cover booking updates. Full `/dashboard/notifications` deferred until read/unread persistence is scoped.

**Suggested “attention” events for badge count:**

- Booking moved to `confirmed`, `rejected`, or `cancelled` since last visit *(Phase 1: simpler — count of pending + recently updated in last 7 days)*
- **v1 simplification:** badge = count of **pending** bookings + **confirmed** with session in next 48h *(document in code comment; refine in follow-up)*

**Dropdown content (max 8 items):**

- “Confirmed — Tax Planning Consultation · Tue 3 Sep”
- “Rejected — Audit Prep · reason if present”
- “Pending — awaiting firm approval”

- [ ] `useBookingNotifications` subscription — same hook as admin
- [x] Wire in `DashboardLayout` → `PortalLayout notifications={...}`
- [x] Footer links: **View all activity →** `/dashboard#activity`, **View my bookings →**

### Activity feed *(overview)*

- [ ] New helpers in `src/lib/client-dashboard.ts`:
  - `fetchClientRecentActivity(userId, limit?)`
  - `filterClientActivity(events, filter)` — All | You | Firm
  - Reuse or adapt `historyToActivity` / `synthesizeBookingEvents` logic from `admin-dashboard.ts` *(extract shared pure functions to `src/lib/booking-activity.ts` if duplication exceeds ~80 lines)*
- [ ] Client-facing labels:
  - User submitted → “You requested a booking”
  - Admin confirmed → “Meridian confirmed your booking”
  - Admin rejected → “Meridian declined your request”
  - Cancelled by user → “You cancelled”
  - Cancelled by admin → “Meridian cancelled your booking”

### Toasts

- [ ] Keep existing toasts on book/cancel — no change required
- [ ] Optional: toast when realtime detects status change while user is on dashboard *(nice-to-have — mark optional in QA)*

---

## Data layer

### `src/lib/client-dashboard.ts` *(new)*

```ts
// Suggested exports — adjust during implementation
export type ClientDashboardSummary = { ... }; // extends computeClientDashboardStats
export type ClientUpcomingRow = { ... };
export type ClientRecentActivity = { ... };
export type ClientActivityFilter = "all" | "you" | "firm";

export async function fetchClientDashboardData(userId: string): Promise<{
  bookings: ClientBookingRow[];
  summary: ClientDashboardStats;
  upcoming: ClientUpcomingRow[];
  activity: ClientRecentActivity[];
}>;

export function filterClientActivity(...);
export async function fetchClientNotificationItems(userId: string, limit?: number): Promise<...>;
```

### Query notes

- Scope all queries with `.eq('user_id', userId)` on bookings
- Activity: `booking_history` join `bookings!inner` where `bookings.user_id = userId`
- RLS should already permit users to read own bookings/history — **verify in Step 0**
- Public sessions query: reuse `fetchPublicSessions` — no new migration

### Shared extraction *(optional refactor)*

If admin and client activity mappers duplicate heavily:

| Extract to | Contents |
|------------|----------|
| `src/lib/booking-activity.ts` | `historyToActivity`, `synthesizeBookingEvents`, `createActivityEvent`, actor resolution |
| `src/lib/admin-dashboard.ts` | Import shared mappers |
| `src/lib/client-dashboard.ts` | Import shared mappers + client-specific labels |

---

## Execution order

Work top-to-bottom. **Do not skip Step 0.**

```
Step 0  Verify RLS + existing data paths
   ↓
Step 1  Data layer (client-dashboard.ts + optional booking-activity extract)
   ↓
Step 2  ClientNotificationBell + DashboardLayout wiring
   ↓
Step 3  Dashboard overview refresh (greeting, metrics, banners, lists, activity)
   ↓
Step 4  Available sessions widget + anchor scroll from header CTA
   ↓
Step 5  Dashboard bookings (filters, search, pagination, detail modal)
   ↓
Step 6  Realtime polish + empty/error states
   ↓
Step 7  QA + update IMPLEMENTATION_PLAN_BOOKING.md
```

---

## Step 0 — Verification checklist

- [ ] Signed-in `user` can read own `bookings` and `booking_history` via Supabase client
- [ ] `fetchClientBookings` returns expected shape for dashboard widgets
- [ ] `booking_history` rows exist for new bookings *(created via `booking-history.ts`)*
- [ ] `fetchPublicSessions` returns bookable sessions for widget
- [ ] `useBookingNotifications` Realtime channel works for client session *(same as admin)*
- [ ] Confirm `profile.phone_number` nullable — nudge logic valid

---

## Step 1 — Data layer

- [ ] Create `src/lib/client-dashboard.ts`
- [ ] Implement `fetchClientDashboardData` (parallel queries like admin)
- [ ] Implement client activity mapping + filters
- [ ] Implement `fetchClientNotificationItems`
- [ ] *(Optional)* Extract `src/lib/booking-activity.ts` from admin-dashboard
- [ ] Unit-test pure helpers if extracted *(optional — only if helpers are non-trivial)*

---

## Step 2 — Notification bell

- [ ] Create `ClientNotificationBell.tsx`
- [ ] Badge + dropdown UI — match admin styling
- [ ] Realtime refresh via `useBookingNotifications`
- [ ] Pass to `DashboardLayout` → `PortalLayout notifications=`
- [ ] Update `IMPLEMENTATION_PLAN_BOOKING.md` carried-forward: client bell ✅ when done

---

## Step 3 — Overview UI

- [ ] Greeting + summary line
- [ ] Attention banners *(banned, pending, soon, phone, welcome)*
- [ ] Metric cards with icons + links
- [ ] Next session card + upcoming list
- [ ] Activity feed with All | You | Firm tabs
- [ ] Loading skeletons + error banner
- [ ] `max-w-6xl` content width

---

## Step 4 — Available sessions widget

- [ ] `AvailableSessionsSection.tsx` with `#available-sessions`
- [ ] Integrate into `DashboardOverview`
- [ ] Change `DashboardLayout` quick action: Link to `/dashboard#available-sessions` instead of `/#booking`
- [ ] Keep secondary “View all sessions” → `/#booking`
- [ ] Book flow: modal → toast → refresh → optional navigate to bookings

---

## Step 5 — Bookings page

- [ ] URL params: `status`, `booking`
- [ ] Status filter tabs
- [ ] Search by session title
- [ ] `AdminTablePagination`
- [ ] `ClientBookingDetailModal` *(or shared `BookingDetailModal` with client mode)*
- [ ] Row click + `?booking=` deep link
- [ ] Cancel from modal preserves existing `CancelBookingModal`

---

## Step 6 — Polish

- [ ] Realtime refresh on both pages
- [ ] New-user welcome empty state
- [ ] Phone nudge banner component *(reusable)*
- [ ] Document title + meta description updates if copy changes
- [ ] `npm run build` passes
- [ ] Manual QA pass *(see below)*

---

## Step 7 — Documentation

- [ ] Mark client dashboard polish complete in `IMPLEMENTATION_PLAN_BOOKING.md` §7 Phase 3 / carried-forward
- [ ] Add link to this doc from parent plan **Document map**
- [ ] Note any deferred items (email, `.ics`, session reminders v2)

---

## QA checklist

### Auth & roles

- [ ] `user` (never booked) sees welcome + sessions widget + phone nudge
- [ ] First booking promotes to `client` *(DB trigger — existing)*
- [ ] `admin` hitting `/dashboard` redirects per `ProtectedRoute` / auth routes
- [ ] Banned user sees suspension banner; book actions disabled or error gracefully

### Overview

- [ ] Greeting uses local time
- [ ] Metric counts match bookings table
- [ ] Pending card gold highlight when count > 0
- [ ] Click metric → correct filtered bookings view
- [ ] Activity feed updates after admin confirms booking *(realtime or refresh)*
- [ ] “Book a session” header links to `/dashboard/book`

### Book page

- [ ] Registered session shows gold/green highlight + status badge
- [ ] **View booking** CTA opens booking detail (not book modal)
- [ ] Calendar view shows same registered styling
- [ ] `?session=` on already-registered session → booking detail

### Booking widget / browse strip

- [ ] New user sees **Open sessions** strip
- [ ] User with upcoming sees **Browse more sessions** compact strip
- [ ] Strip excludes sessions user already registered for
- [ ] Successful book → pending status + toast
- [ ] Duplicate book blocked with error toast
- [ ] View all → homepage `#booking`

### Bookings page

- [ ] Each status filter correct
- [ ] Search filters by title
- [ ] Pagination works across page sizes
- [ ] Detail modal shows history + cancel reason
- [ ] Cancel updates list + activity
- [ ] `?booking=<id>` opens modal on load

### Notifications

- [ ] Bell badge reflects pending/attention count
- [ ] Dropdown lists recent items
- [ ] Click item → booking detail
- [ ] **View all activity →** scrolls to overview `#activity`
- [ ] Realtime: admin action updates bell without full page reload

### Regression

- [ ] Homepage booking still works for logged-in client
- [ ] `/dashboard/profile` unchanged
- [ ] Admin dashboard unaffected

---

## Wireframe reference

```
┌──────────────────────────────────────────────────────────────────┐
│ [Sidebar] Overview | Bookings | Profile     [Book a session] [🔔] │
├──────────────────────────────────────────────────────────────────┤
│ Good afternoon, Kenji                                              │
│ 1 pending · 2 upcoming                                             │
│                                                                    │
│ ⚠ [Attention banner — pending / phone / welcome]                  │
│                                                                    │
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐                   │
│ │ Upcoming    │ │ Pending     │ │ Past        │                   │
│ └─────────────┘ └─────────────┘ └─────────────┘                   │
│                                                                    │
│ ┌────────────────────────────┐  ┌─────────────────────────────┐   │
│ │ Next session + upcoming    │  │ Recent activity             │   │
│ │ list                       │  │ All | You | Firm            │   │
│ └────────────────────────────┘  └─────────────────────────────┘   │
│                                                                    │
│ Available sessions (#available-sessions)                           │
│ [Card] [Card] [Card] ...                                           │
│ View all sessions →                                                │
└──────────────────────────────────────────────────────────────────┘
```

---

## Future enhancements *(not this phase)*

| Item | Notes |
|------|-------|
| Email on status change | Edge Function + templates |
| Add to calendar (.ics) | Confirmed sessions only |
| In-app “mark notification read” | Requires `notification_reads` table or localStorage cursor |
| `/dashboard/notifications` | Full notifications page — mark all read, clear all; v2 when read state is scoped |
| `/dashboard/sessions` | Full in-portal catalog with filters |
| Session prep checklist | Per session type static content |
| Profile completeness score | Beyond phone — address optional |
| i18n on dashboard sessions | Match homepage `lang` when dashboard localization is scoped |

---

## Related documents

| Document | Relationship |
|----------|--------------|
| [IMPLEMENTATION_PLAN_BOOKING.md](./IMPLEMENTATION_PLAN_BOOKING.md) | Parent roadmap — Phase 3 client items, brand guide, notification architecture |
| [PHASE_1_AUTH_PROFILES.md](./PHASE_1_AUTH_PROFILES.md) | Auth, profile fields, portal shell |
| [IMPLEMENTATION_DB_CAPACITY.md](./IMPLEMENTATION_DB_CAPACITY.md) | Example of focused phase doc + execution order |
