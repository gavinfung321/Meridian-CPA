# Supabase Backend & Dashboards Implementation Plan

This document outlines the detailed, step-by-step technical plan to implement user authentication, a Supabase database backend, automatic email notifications, client dashboards, and admin management pages for the Meridian CPA booking system.

> **Detailed Phase 1 record:** See [PHASE_1_AUTH_PROFILES.md](./PHASE_1_AUTH_PROFILES.md) for full checklists, design decisions, and QA notes.

---

## Implementation Status

| Phase | Name | Status | GitHub | Notes |
|-------|------|--------|--------|-------|
| **1** | Authentication & Profiles | **Complete** | [#3](https://github.com/gavinfung321/Meridian-CPA/issues/3), [#4](https://github.com/gavinfung321/Meridian-CPA/issues/4) (closed) | Auth, profiles, avatars, dashboard shells, base schema |
| **2** | Session & Category Management | **Complete** | [#5](https://github.com/gavinfung321/Meridian-CPA/issues/5) | Sessions/taxonomy, landing page, recurrence UI, images |
| **2.5** | Unified Catalog UX *(best path)* | **Complete** | — | Tabbed catalog + modals at `/admin/sessions` |
| **4.5** | Live People Directory | **Complete** | — | Live `/admin/clients`, role filters, ClientProfileModal, table hover, sidebar toggle |
| **3** | Booking Logic & Evolution | **Complete** | — | Live bookings admin + client flow, admin overview, bell badge |
| **4** | History & Logging | **Next** | — | Login/session/booking audit trails |
| **5** | Admin Controls & Reporting | Not started | — | Search, promote/demote, full detail edit, charts, `app_settings` |

> **Phase alignment:** Our earlier plan grouped work by technical layer (DB → email → auth UI → client dashboard → admin dashboard). The phases below follow the **feature-domain roadmap** (Auth → Sessions → Bookings → Logging → Admin). All prior checklist items are preserved inside the matching phase.

**Phase 1 delivered (Aug 2026):**
- Supabase project linked; core migrations applied remotely
- Full base schema: `profiles`, `sessions`, `bookings`, audit log tables, enums, triggers, RLS
- Profile extensions: names, contact/address fields, `avatar_path`, `profile-pictures` storage bucket
- Auth: signup, login, forgot/reset password, session context, role-based `ProtectedRoute`, not-authorized page
- Profile UI: `/profile`, `/dashboard/profile`, `/admin/profile` with avatar upload and full contact/address form
- Homepage profile avatar menu with role-based Dashboard/Admin links and context-aware logout
- Mock client portal (`/dashboard/*`) and admin console (`/admin/*`) layout shells for routing QA

**Carried forward from prior plan (not yet scheduled in Phases 2–5):**
- Supabase Edge Functions + email notifications (Resend/SendGrid) — assign to Phase 3 when booking status changes go live
- Top-left toast system (`react-hot-toast` or custom) — polish during Phase 3 or 5
- Production `/reset-password` redirect URL — add on deploy

---

## 1. System Architecture & Tech Stack
- **Database & Backend:** Supabase (PostgreSQL, Auth, Edge Functions for notifications, Storage buckets for client documents if needed).
- **Authentication:** Supabase GoTrue (Email/Password, Session-based auth).
- **Routing:** React Router v6 (Protected Routes for `/admin/*` and `/dashboard/*`).
- **Styling & UI Components:** Tailwind CSS, Lucide React icons, and custom components adhering to the **Meridian CPA Brand Guide** (inspired by Shadcn design principles).
- **Notifications:** Supabase Edge Functions + Resend / SendGrid API for automated booking confirmation and status change emails.

### Environment Variables
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (for admin-only edge functions)

---

## 2. Branding & Design System Guide
To ensure all dashboard screens look premium and seamlessly align with the landing page, we will implement the following design rules:

| Element | Palette/Style | Description |
|---|---|---|
| **Primary Color** | Forest Green (`#0F2A1D`) | Used for main headers, primary actions, sidebar menus. |
| **Accent Color** | Gold (`#C9A84C`) | Used for warnings, highlighted statuses, active tab lines. |
| **Neutral Grounds** | Cream / Warm White (`#F9F9F6`, `#EDECE6`) | Background for pages, cards, and select elements. |
| **Typography** | Serif headings (`font-serif`) / Sans UI copy (`font-sans`) | Premium Georgia/system-serif headings paired with clean Geist-like sans-serif. |
| **UI Components** | Shadcn style | Bordered cards with thin, crisp borders (`border-[#EDECE6]`), subtle borders on inputs, flat solid buttons with micro-interaction scales. |
| **Toast Messages** | Top-left screen toast | Stackable notifications positioned at the top-left using `react-hot-toast` or a custom lightweight tailwind toast provider styled in Forest Green/Gold. |

### Dashboard UX & Layout System *(Phase 2 polish → Phase 3)*

Both `/dashboard/*` and `/admin/*` share a **sidebar + top header** shell. The reference layout pattern (quick action left/center, utilities right) is adopted, but **Meridian brand colors apply** — Forest Green primary actions, Gold accents, Cream/white surfaces. Do **not** copy third-party orange/purple palettes from reference mockups.

#### Layout anatomy

| Zone | Purpose | Brand notes |
|------|---------|-------------|
| **Left sidebar** | Primary navigation (Overview, Sessions, Bookings, etc.) | Forest Green `#0F2A1D` background; Gold `#C9A84C` active item; **expand/collapse chevron fixed outside sidebar edge** *(mobile open tab + desktop collapse)* |
| **Top header bar** | Context, quick actions, utilities | White/cream bar, `border-[#EDECE6]`; visible on desktop and mobile |
| **Main content** | Page title, cards, tables, forms | Cream page ground `#F9F9F6`; white cards with thin borders |

#### Top header bar (admin + client)

Inspired by modern SaaS dashboards (reference: quick-action + profile cluster top-right), implemented as:

- **Left (desktop):** optional page title or breadcrumb for deep routes (e.g. Edit session)
- **Center / left-of-right:** single **Quick action** dropdown *(admin only)* — one Forest Green button opening a menu; not multiple header buttons or page-level action grids
  - **Admin menu items:** New session *(Phase 2 ✅)*; Manual booking *(Phase 3 — disabled until live)*; Add client *(Phase 5 — disabled until live)*
  - **Client portal:** single **Book a session** link/button *(no dropdown needed — one action)*
- **Right cluster:** `[ Quick action ▾ ] | [ 🔔 ] [ Avatar + name ▾ ]` — vertical separator between quick action and utilities
  - **🔔 Bell:** placeholder in Phase 1–2; wired in **Phase 3** with Realtime booking notifications *(see §7 Phase 3 — Notifications)*

#### Profile menu — shared component

Reuse and extend `ProfileMenu` (do not fork a second dropdown):

- Add **`variant="light"`** trigger showing **avatar + display name** (not avatar-only) for dashboard headers
- Make **`lang` optional** with English fallbacks so dashboards are not tied to homepage i18n
- **Context-aware profile link:** `/admin/profile` when in admin portal; `/dashboard/profile` when in client portal; `/profile` on public pages
- Keep role-based Dashboard / Admin cross-links for users with multiple contexts
- Remove duplicate name/email/sign-out block from sidebar footer once header profile menu ships (sidebar footer may keep a compact sign-out only, or none)

#### Quick action dropdown *(admin header)*

One **Quick action** button in the admin header — Forest Green `#0F2A1D` trigger, white text, chevron. Dropdown uses the same white panel / `#EDECE6` border pattern as `ProfileMenu`.

| Menu item | Route / behaviour | Phase |
|-----------|-------------------|-------|
| New session | `/admin/sessions/new` | 2 ✅ |
| Manual booking | Disabled — “Coming in Phase 3” | 3 |
| Add client | Disabled — “Coming in Phase 5” | 5 |

**Do not duplicate** quick actions on overview pages or per-page headers. Sidebar covers navigation; header dropdown covers infrequent creates. Page-level buttons (e.g. “Manage taxonomy” on Sessions) are allowed for contextual secondary links only.

#### Shared layout refactor

`AdminLayout` and `DashboardLayout` use shared **`PortalLayout`** accepting:

- `portalLabel` (“Admin Console” / “Client Portal”)
- `navItems`
- `quickActions` slot (React node)
- `headerExtras` slot (notifications, etc.)

This keeps one place to maintain the top bar and profile menu.

#### Sidebar expand/collapse *(Phase 4.5 polish)* ✅

- **Mobile:** When the drawer is closed, a **chevron tab** sits fixed on the **left viewport edge** *(outside the sidebar)* so admins can reopen nav without hunting in the header. Header hamburger remains as a secondary affordance.
- **Desktop:** Same chevron tab on the sidebar edge toggles **collapse/expand** — sidebar slides off-screen; tab stays visible at `left: 0` when collapsed.
- Implemented in shared **`PortalLayout`** — applies to both `/admin/*` and `/dashboard/*`.

#### Mockup banners — retirement plan

Remove `MockupBanner` progressively as live data ships:

| Page | Remove banner when |
|------|-------------------|
| `/admin/sessions` | ✅ Live CRUD wired — remove banner |
| `/admin/dashboard` | Phase 3 metrics live |
| `/admin/bookings` | Phase 3 status actions wired |
| `/admin/clients` | ✅ Live read-only directory from `profiles` |
| `/dashboard/*` | Phase 3 booking data live |

> **Next focus (Phase 4):** Audit trails (`user_login_history`, `session_history`, `booking_history`). Phase 3 booking core is **complete**.

#### Profile data sync status *(what is live today)*

| Surface | Data source | Status |
|---------|-------------|--------|
| `/signup` → `profiles` row | Supabase Auth + signup trigger | ✅ Live |
| `/profile`, `/dashboard/profile`, `/admin/profile` | `profiles` CRUD + avatar upload | ✅ Live |
| Header avatar + name (`ProfileMenu`) | `AuthContext` → `profiles` | ✅ Live |
| **`/admin/clients` people directory** | `profiles` via Supabase | ✅ **Live — Phase 4.5** |
| `/admin/dashboard` client/booking metrics | Hard-coded metrics | ✅ Live — **Phase 3** |
| `/dashboard`, `/dashboard/bookings` | Hard-coded rows | ✅ Live — **Phase 3** |

> **Clarification:** Individual profile pages are already synced with Supabase. The gap is the **admin Clients list** still showing placeholder names (`marcus@example.com`, etc.) instead of real `profiles` rows (e.g. Gavin Fung).

#### Accessibility & mobile

- Top header always includes mobile menu toggle (hamburger) + profile menu
- Profile dropdown: keyboard (Escape), focus trap, `aria-expanded` *(already on homepage menu)*
- Quick action buttons: min 44px tap targets on mobile

---

## Reference crosswalk: Personal Trainer admin → Meridian CPA

> **Purpose:** Compare a reference personal-trainer admin build against Meridian CPA. Use for gap analysis only — **do not copy dark/glassmorphism styling**; keep Forest Green / Gold / Cream brand.

### Catalog Management (`/admin/sessions` equivalent)

Reference uses a **3-level tabbed catalog**: Categories → Session Templates → Active Sessions.

| Reference feature | Personal trainer example | Meridian CPA mapping | Status |
|-------------------|-------------------------|----------------------|--------|
| **Categories** | Strength, Yoga | Tax Planning, Audit & Compliance, Payroll & MPF, Advisory | ✅ Live — **Phase 2.5:** Categories tab + modal |
| **Session templates** | HIIT Cardio, Private Training *(base price + description)* | `session_types` *(default_duration, default_price, description)* | ✅ Live — **Phase 2.5:** Session Types tab + modal |
| **Active sessions** | Scheduled slots | `sessions` — bookable consultation/appointment slots | ✅ Live — **Phase 2.5:** Active Sessions tab (enhanced table) |
| **Tabbed catalog UI** | All 3 levels in one tabbed page | Split across `/admin/sessions` + `/admin/taxonomy` today | 🔄 **Phase 2.5** — unified Catalog hub at `/admin/sessions` |
| **Category/type modals** | Add/Edit in overlay dialogs | Inline forms on `/admin/taxonomy` page today | 🔄 **Phase 2.5** — modal CRUD on Types & Categories tabs |
| **Template defaults prefill** | Base pricing on new slot | Session type selection prefills duration + price on new session | ✅ Live |
| **Price override per slot** | Custom price for one slot | `price` field on session form independent of template default | ✅ Live |
| **Capacity control** | Max participants | `max_slots` *(1 = private consultation)* | ✅ Live |
| **Advanced scheduling** | Date/time pickers, auto duration | `datetime-local` start + duration → auto `end_time` | ✅ Live |
| **One-click Cancel/Activate** | Toggle on list row | Cancel via edit page + reason modal; no inline reactivate | 🔄 **Phase 2.5** — inline toggle + reason modal on Active Sessions tab |
| **Cover image** | *(not in reference)* | Optional `image_path` on session; shown on landing cards | ✅ Live — CPA-specific |
| **Recurrence metadata** | *(not in reference)* | Weekly recurrence editor → JSONB *(slot generation deferred)* | ✅ Live — CPA-specific |

**CPA interpretation:** Categories = service lines; Session types = consultation products *(distinct names — e.g. category **Tax Planning** → type **Initial Tax Consultation**, not another “Tax Planning”)*; Active sessions = firm calendar slots clients can book.

---

### Client & User Management (`/admin/clients`)

> **Decision:** ✅ **Yes** — keep a dedicated **People directory** in the admin sidebar *(Figma: “Clients”)*. It lists **all registered accounts** (`user`, `client`, `admin`), not only engaged clients. **Separate nav item** — do **not** merge into Catalog Management tabs.

| Reference feature | Personal trainer | Meridian CPA | Status |
|-------------------|------------------|--------------|--------|
| **Searchable directory** | Filter by name/contact | Search `profiles` by name/email | ✅ Live list — **Phase 4.5**; search **Phase 5** |
| **All roles visible** | Clients + staff/admins | `user` + `client` + `admin` in one list | ✅ Live — **Phase 4.5** |
| **Role filter tabs** | Filter by role | All \| Users \| Clients \| Admins | ✅ **Phase 4.5 polish** |
| **Role management** | Upgrade to Admin or Client in UI | Promote `user` ↔ `client`; ban/reinstate | ✅ Ban/reinstate **Phase 4.5 polish**; promote/demote **Phase 5** |
| **Promote to Admin in UI** | Supported in reference | **Out of scope** — Supabase/manual only *(security)* | 🚫 **Intentionally excluded** |
| **Admin accounts in list** | Shown | Shown **read-only** — view profile, no ban/demote/promote actions on `admin` rows | ✅ Planned — **Phase 5** |
| **Engagement tracking** | Contact + status at a glance | Avatar, role/status badges, booking count, joined date | ✅ Avatar + joined **Phase 4.5**; booking count **Phase 3/5** |
| **Admin edit client profile** | Implied in reference | **Option B:** admin can edit contact/address/name on detail | ✅ Edit in **ClientProfileModal** *(Phase 4.5 polish)*; full Option B + avatar on `/admin/clients/:id` **Phase 5** |
| **Create client in admin** | “Add client” quick action | Users self-register via `/signup` | 🚫 **By design** — quick action stays disabled |
| **Link from bookings** | Client name in ledger | Booking row → client profile modal or `/admin/clients/:id` | ❌ Not built → **Phase 3** cross-link |

**CPA interpretation:** Sidebar label stays **Clients** per brand/Figma, but the page subtitle clarifies *“All registered users, clients, and firm admins.”* Firm staff manage lifecycle (ban, promote after engagement), not create auth accounts. Admin rows are for visibility only.

---

### Booking Ledger (`/admin/bookings`)

| Reference feature | Personal trainer | Meridian CPA | Status |
|-------------------|------------------|--------------|--------|
| **Master booking feed** | All appointments | All `bookings` joined to `profiles` + `sessions` | ✅ Live — **Phase 3** |
| **Lifecycle actions** | Confirm / cancel one-click | Approve / Reject / Cancel with reason | ✅ Live — **Phase 3** |
| **Detail inspector** | Rich modal *(session + client + payment)* | Booking detail modal: client, session, status, price *(no payment gateway yet)* | ✅ Live — **Phase 3** |
| **Relational joins** | Who, what, when | `bookings` → `profiles`, `sessions`, `session_types` | ✅ Live — **Phase 3** |
| **Payment status** | Shown in reference modal | Not in scope until billing integration | 🚫 **Deferred** — CPA bookings track approval status, not payment |

**CPA interpretation:** Bookings = consultation requests/appointments (pending firm approval), not gym class reservations. Status flow: `pending` → `confirmed` / `rejected` / `cancelled`.

---

### Security & Infrastructure

| Reference feature | Status in Meridian CPA |
|-------------------|------------------------|
| **`is_admin()` RLS helper** | ✅ Phase 1 — profiles, sessions, bookings, categories, session_types |
| **Admin-only writes on catalog** | ✅ Live |
| **Admin read on global histories** | ✅ RLS ready; UI wiring Phase 4 |
| **Glassmorphism / dark admin theme** | 🚫 **Not adopted** — cream/white surfaces, Forest Green sidebar per brand guide |
| **Loader2 / skeleton loading states** | ⚠️ **Partial** — landing booking section + some admin pages; extend in Phase 3 |
| **Fade-in animations** | ⚠️ **Partial** — landing page scroll animations only |

---

### Adopt vs skip (from reference)

| Adopt in Meridian CPA | Skip or defer |
|----------------------|---------------|
| **Tabbed Catalog hub** *(Phase 2.5)* | Dark/glassmorphism UI |
| **Modals for category + session type CRUD** *(Phase 2.5)* | Promote to `admin` via UI |
| **People directory** — all roles + filters *(Phase 5)* | “Add client” admin create |
| Booking detail inspector modal *(Phase 3)* | Payment status in booking modal |
| Admin edit client profile on detail page *(Option B, Phase 5)* | |
| One-click booking status actions *(Phase 3)* | |
| Inline session cancel/reactivate *(Phase 2.5)* | |

---

## 3. Page Mapping & URL Slugs

Use **dedicated pages** for deep flows (session create/edit, client detail, profile). Use **modals** only inside the unified Catalog hub for lightweight taxonomy CRUD *(Phase 2.5)*.

### Authentication & Public Pages
- `/login` - Login with email/password. ✅ *Phase 1*
- `/signup` - Registration form (first name + last name). ✅ *Phase 1*
- `/forgot-password` - Request a password reset email. ✅ *Phase 1*
- `/reset-password` - Set a new password from the email link. ✅ *Phase 1*
- `/logout` - Session cleanup via `signOut()`, then redirect to `/`. ✅ *Phase 1*
- `/not-authorized` - Shown when a signed-in `user` or `client` attempts to access `/admin/*`. ✅ *Phase 1*
- `/profile` - Unified profile page (all roles); avatar upload; contact/address form. ✅ *Phase 1* ([#4](https://github.com/gavinfung321/Meridian-CPA/issues/4))

### Client Pages (`/dashboard/*` - Protected Client Route)
- `/dashboard` - Overview showing next upcoming booking, summary stats. ✅ *Mock UI — Phase 1* → **Phase 3:** live booking summary + quick action “Book a session”
- `/dashboard/bookings` - History of past bookings, active booking list, request cancellation. ✅ *Mock UI — Phase 1* → **Phase 3:** live list, search, client-side cancel
- `/dashboard/profile` - Edit profile info (name, phone prefix/number, address, email), view account status. ✅ *Phase 1*

### Admin Pages (`/admin/*` - Protected Admin Route)
- `/admin/dashboard` - Visual overview with key metrics. ✅ *Mock metrics — Phase 1* → **Phase 3:** live widgets
- `/admin/sessions` - **Catalog Management hub** *(Phase 2.5)* — tabbed: Active Sessions | Session Types | Categories. ✅ *Live list today; refactor in 2.5*
- `/admin/sessions/new` - Full-page form to create a session slot *(keep — recurrence, image, cancel too rich for modal)*. ✅ *Phase 2*
- `/admin/sessions/edit/:id` - Full-page form to edit/cancel a session slot. ✅ *Phase 2*
- `/admin/taxonomy` - **Deprecated → redirect** to `/admin/sessions?tab=types` *(Phase 2.5)*. ✅ *Phase 2 functionality absorbed into tabs*
- `/admin/bookings` - Global listing of bookings. ✅ *Mock UI — Phase 1* → **Phase 3**
- `/admin/clients` - **People directory** *(sidebar: Clients)* — all `profiles`. ✅ *Live — Phase 4.5* → **Phase 5:** search, promote/demote, full detail page edit
- `/admin/clients/:id` - Person detail. ✅ *Read-only fallback — Phase 4.5* → primary UX is **list row → ClientProfileModal**; full page edit **Phase 5**
- `/admin/profile` - Admin profile form (same fields as client profile). ✅ *Phase 1*
- `/admin/reporting` - Metrics charts (occupancy rate, estimated revenue, type distribution). *Phase 5*
- `/admin/settings` - Global booking settings, firm business hours, notification preferences. ✅ *Mock UI — Phase 1* → **Phase 5**

#### People directory *(sidebar: Clients)* — design decision ✅

> **Should we have a section for all registered admins, users, and clients?** **Yes.** Wire the **read-only list in Phase 4.5** *(no bookings dependency)*; full management in **Phase 5**.

| Item | Decision |
|------|----------|
| **Phase 4.5 scope** | Replace `mockClients` with live `profiles` list; role filter tabs; row-click **ClientProfileModal** (view/edit/ban); icon actions **Edit + Ban** *(mirrors sessions Edit/Cancel pattern)*; table row hover |
| **Phase 5 scope** | Search, promote/demote, `/admin/clients/:id` full Option B edit + avatar upload, booking/login tabs |
| **Route** | `/admin/clients` — keep URL; sidebar label **Clients** per Figma |
| **Scope** | Every row in `profiles`: `user` *(registered, not yet booked)*, `client` *(has booked)*, `admin` *(firm staff)* |
| **Not in Catalog tabs** | People management is a **separate concern** from session catalog — do not add a 4th tab to `/admin/sessions` |
| **List UX** | **Filter tabs:** All \| Users \| Clients \| Admins ✅; search by name/email *(Phase 5)*; optional Banned status filter *(Phase 5)* |
| **Table columns** | Avatar, Name, Email, Role, Status, Joined, Bookings count *(optional — Phase 3/5)*, Actions |
| **Row actions** | `user`/`client`: **Pencil (edit)** + **Ban (suspend/reinstate)** icon buttons · `admin`/self: **View only** |
| **Row click** | Opens **ClientProfileModal** in view mode — edit and ban/reinstate available in modal footer |
| **Detail page** | `/admin/clients/:id` — read-only fallback; **Phase 5:** full editable form + audit tabs |
| **Phase 3 hook** | Live `/admin/bookings` rows link client name → `/admin/clients/:id` *(detail can ship read-only in Phase 3, full edit in Phase 5)* |
| **Quick action** | “Add client” stays **disabled** — no admin-created accounts |

---

## 4. Database Schema (Supabase Tables)

### `profiles` (extends Supabase `auth.users`)
```sql
create type user_role as enum ('admin', 'client', 'user');
create type user_status as enum ('active', 'banned');

create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  updated_at timestamp with time zone,
  first_name text not null,
  last_name text not null,
  full_name text not null,
  email text not null,
  phone_prefix text,
  phone_number text,
  address_line1 text,
  address_line2 text,
  city text,
  county text,
  post_code text,
  country text,
  avatar_path text,
  role user_role default 'user'::user_role not null,
  status user_status default 'active'::user_status not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
```

**Name fields:** Collect `first_name` and `last_name` separately in the UI. Store a denormalized `full_name` (`first_name || ' ' || last_name`) for display, search, and email templates. Split fields improve form UX, personalization (e.g. "Welcome back, Kenji"), and future sorting/filtering in admin views.

**Profile pictures (Storage):** Private bucket `profile-pictures` stores objects at `{user_id}/avatar.{ext}`. `profiles.avatar_path` holds the object path. RLS: users manage own files; admins can read all. ✅ *Phase 1*

**Applied migrations (Phase 1):**
| Migration | Purpose |
|-----------|---------|
| `20250828164500_create_profiles.sql` | Profiles, enums, signup trigger, base RLS |
| `20250828171000_create_booking_schema.sql` | Sessions, bookings, audit logs, booking role trigger |
| `20250828174000_add_profile_name_fields.sql` | `first_name`, `last_name` on profiles |
| `20250828180000_profile_pictures_storage.sql` | `avatar_path`, storage bucket + RLS |
| `20250828182000_add_profile_contact_address_fields.sql` | Contact/address columns; replaces legacy `phone` |

### `sessions` (Booking Slots)
```sql
create table public.sessions (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  type text not null, -- 'Tax Planning', 'Audit & Compliance', etc.
  location text not null, -- 'Central Office', 'Zoom', etc.
  start_time timestamp with time zone not null,
  end_time timestamp with time zone not null,
  duration_minutes integer not null,
  max_slots integer default 1 not null,
  price numeric(10, 2) default 0.00 not null,
  is_cancelled boolean default false not null,
  cancel_reason text,
  cancelled_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);
```

### `bookings`
```sql
create type booking_status as enum ('pending', 'confirmed', 'cancelled', 'rejected');

create table public.bookings (
  id uuid default gen_random_uuid() primary key,
  session_id uuid references public.sessions(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  status booking_status default 'pending'::booking_status not null,
  cancel_reason text,
  cancelled_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);
```

### `user_login_history` (Audit Log)
```sql
create table public.user_login_history (
  id bigint generated always as identity primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  login_time timestamp with time zone default timezone('utc'::text, now()) not null,
  ip_address text,
  user_agent text
);
```

### `session_history` (Audit Log for Admin Changes to Sessions)
```sql
create table public.session_history (
  id bigint generated always as identity primary key,
  session_id uuid not null,
  changed_by uuid references public.profiles(id) on delete set null,
  action text not null, -- 'CREATE', 'UPDATE', 'CANCEL'
  old_data jsonb,
  new_data jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
```

### `booking_history` (Audit Log for Booking Status/Info Changes)
```sql
create table public.booking_history (
  id bigint generated always as identity primary key,
  booking_id uuid not null,
  changed_by uuid references public.profiles(id) on delete set null,
  action text not null, -- 'CREATE', 'STATUS_CHANGE', 'USER_CANCEL'
  old_status booking_status,
  new_status booking_status,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
```

### Planned tables (Phase 2 & 5 — not migrated yet)

The roadmap adds normalized session taxonomy and global settings. These extend — not replace — the current flat `sessions.type` text field.

#### `categories` *(Phase 2)* ✅ *Migrated — `20250828183000_session_categories_and_types.sql`*
```sql
-- Planned: top-level groupings for session types (e.g. Tax, Audit, Advisory)
create table public.categories (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  slug text not null unique,
  description text,
  sort_order integer default 0 not null,
  is_active boolean default true not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
```

#### `session_types` *(Phase 2)* ✅ *Migrated — `20250828183000_session_categories_and_types.sql`*
```sql
-- Planned: bookable service types linked to a category
create table public.session_types (
  id uuid default gen_random_uuid() primary key,
  category_id uuid references public.categories(id) on delete restrict not null,
  name text not null,
  description text,
  default_duration_minutes integer not null,
  default_price numeric(10, 2) default 0.00 not null,
  is_active boolean default true not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
```

#### `app_settings` *(Phase 5)*
```sql
-- Planned: singleton or key-value firm settings (booking window, business hours, notifications)
create table public.app_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_by uuid references public.profiles(id) on delete set null
);
-- Example key: 'booking' -> { "max_booking_days_advance": 90 }
```

> **Note:** Phase 1 `sessions` table uses a `type text` column for mock data. Phase 2 added `session_type_id` FK and `recurrence_rules` JSONB via `20250828183000_session_categories_and_types.sql`. Legacy `type` retained for backward compatibility.

**Phase 2 migrations:**
| Migration | Purpose |
|-----------|---------|
| `20250828183000_session_categories_and_types.sql` | `categories`, `session_types`, `sessions.session_type_id`, `recurrence_rules`, RLS, seed data |
| `20250829100000_session_images.sql` | `sessions.image_path`, public `session-images` storage bucket |

---

## 5. Security & Row Level Security (RLS) Rules

> ✅ All policies below are implemented in Phase 1 migrations. Verify behaviour during Phase 2+ QA as real CRUD is wired up.

1. **Profiles Table:**
   - Anyone can read active profiles (needed to display attendee lists).
   - Only the profile owner can edit their own profile details.
   - Admins can read/edit all profiles (for banning/promoting roles).
2. **Sessions Table:**
   - Anyone (even anonymous) can read active, non-cancelled sessions (to check booking availability on the landing page).
   - Only Admins can insert, update, or delete sessions.
3. **Bookings Table:**
   - Clients can only read their own bookings.
   - Clients can insert bookings where `user_id` matches their own ID.
   - Clients can update booking status to `cancelled` for their own bookings.
   - Admins can read, update, or delete all bookings.
4. **Log History Tables:**
   - Only Admins can query log history tables (`user_login_history`, `session_history`, `booking_history`).

---

## 6. Supabase Database Triggers

> ✅ Triggers A and B are implemented in Phase 1 migrations.

### A. Automatic Profile Creation
Create a trigger that inserts a row into `public.profiles` whenever a new user registers through Supabase Auth.
```sql
create function public.handle_new_user()
returns trigger as $$
declare
  v_first_name text;
  v_last_name text;
  v_full_name text;
begin
  v_first_name := coalesce(nullif(trim(new.raw_user_meta_data->>'first_name'), ''), 'New');
  v_last_name := coalesce(nullif(trim(new.raw_user_meta_data->>'last_name'), ''), 'User');
  v_full_name := trim(v_first_name || ' ' || v_last_name);

  insert into public.profiles (id, first_name, last_name, full_name, email, role, status)
  values (
    new.id,
    v_first_name,
    v_last_name,
    v_full_name,
    new.email,
    'user'::user_role,
    'active'::user_status
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

### B. User Role Promotion / Demotion Logic
Create a trigger on `public.bookings` to automatically upgrade a user to `client` when they have a booking, and revert them to `user` if they have zero bookings (e.g. after cancellation/rejection).
```sql
create function public.update_user_role_on_booking()
returns trigger as $$
declare
  booking_count int;
  target_user_id uuid;
begin
  -- Identify user to update
  if TG_OP = 'INSERT' then
    target_user_id := new.user_id;
  elsif TG_OP = 'UPDATE' or TG_OP = 'DELETE' then
    target_user_id := old.user_id;
  end if;

  -- Count total active bookings (not cancelled/rejected)
  select count(*) into booking_count 
  from public.bookings 
  where user_id = target_user_id and status in ('confirmed', 'pending');

  -- Update role
  if booking_count > 0 then
    update public.profiles set role = 'client'::user_role where id = target_user_id and role = 'user'::user_role;
  else
    update public.profiles set role = 'user'::user_role where id = target_user_id and role = 'client'::user_role;
  end if;

  return null;
end;
$$ language plpgsql security definer;

create trigger on_booking_change
  after insert or update or delete on public.bookings
  for each row execute procedure public.update_user_role_on_booking();
```

---

## 7. Implementation Phases

### Phase 1: Authentication & Profiles ✅ **COMPLETE**

Core auth, profile sync, avatars, dashboard shells, and base database schema.

- [x] Connect Supabase client (`src/lib/supabase.ts`, env keys verified)
- [x] Implement Auth flow (Sign up, Sign in, Sign out)
- [x] Forgot password + reset password flows
- [x] Logic: New signups get `user` role (signup trigger)
- [x] Profile setup: Full profile sync — names, phone prefix/number, address fields ([#4](https://github.com/gavinfung321/Meridian-CPA/issues/4))
- [x] Avatar handling: Supabase Storage integration for profile pictures (`profile-pictures` bucket)
- [x] Dashboard shell: Sidebar, navigation, and protected routes (`DashboardLayout`, `AdminLayout`, `ProtectedRoute`)
- [x] Role-based redirection logic (`user` / `client` / `admin`, `/not-authorized`)
- [x] Homepage profile avatar menu (Profile, Dashboard/Admin, context-aware Log out)
- [x] Run SQL migrations: enums, `profiles`, `sessions`, `bookings`, audit log tables, RLS
- [x] Database triggers: automatic profile creation; booking-based role promotion (`user` ↔ `client`)
- [x] Mock dashboard pages for routing QA (`/dashboard/*`, `/admin/*` placeholders)

**Also from prior plan (completed in Phase 1):**
- [x] Auth UI: `/login`, `/signup`, `/forgot-password`, `/reset-password`, `/logout`, `/not-authorized`
- [x] `AuthContext` with `supabase.auth.onAuthStateChange`
- [x] Profile routes: `/profile`, `/dashboard/profile`, `/admin/profile`
- [x] Banned user suspension screen

**Key commits on `main`:** `e5f4cba`, `f28d70e`, `d6729a9`, `1f47107`, `fcc87cc`

**Detail record:** [PHASE_1_AUTH_PROFILES.md](./PHASE_1_AUTH_PROFILES.md)

---

### Phase 2: Session & Category Management ✅ **COMPLETE**

Admin-managed taxonomy and session slots. **In scope now.** Bookings and clients admin pages stay mock until Phase 3 / Phase 5. **Catalog UX polish** *(tabbed hub, modals)* → **Phase 2.5**.

**Remaining to close Phase 2:**
- [x] Landing page: read active, non-cancelled sessions from Supabase *(replace `MOCK_SESSIONS` in booking section)*
- [x] Remove `MockupBanner` from `/admin/sessions` *(live data)*
- [x] Session recurrence UI: structured weekly editor *(replaces raw JSON textarea)*
- [x] Session cover images: `image_path` + `session-images` storage bucket + admin upload

**Completed:**
- [x] CRUD for `categories`
- [x] CRUD for `session_types`
- [x] CRUD for `sessions` (wire to existing `sessions` table; link to `session_types` when ready)
- [x] Implement Availability Rules using JSONB recurrence rules *(structured weekly UI + JSON storage)*
- [x] Admin UI for Session management (List, Create, Edit)
- [x] Routes: `/admin/sessions/new`, `/admin/sessions/edit/:id`, `/admin/taxonomy`
- [x] Form fields: slot limits, datetime pickers, type/category selections, locations, pricing
- [x] Cancel session slot (reason input; existing bookings unchanged in this step)
- [x] RLS policies for new `categories` / `session_types` tables *(migration Step 1)*

**Dashboard UX polish *(Phase 2)*:**
- [x] Shared top header bar on `AdminLayout` + `DashboardLayout` (quick actions + profile cluster)
- [x] Extend `ProfileMenu`: avatar + display name trigger, `variant="light"`, optional `lang`, context-aware profile path
- [x] Refactor to shared `PortalLayout` to DRY admin + client shells
- [x] Admin overview: metrics-only layout *(quick actions live in header dropdown only)*
- [x] `AdminQuickActionMenu` — single header dropdown (New session + future items)
- [x] Remove `MockupBanner` from `/admin/sessions`
- [x] Sidebar footer: dedupe user block once header profile menu is live

**Explicitly deferred *(not Phase 2)*:**
- `/admin/bookings` — mock list; wire in **Phase 3**
- `/admin/clients` — mock list → **Phase 4.5** read-only, **Phase 5** full management
- Admin overview live metrics — **Phase 3**
- **Real-time / in-app notifications** — header bell badge, Supabase Realtime listeners, booking toasts — **Phase 3** *(see §7 Phase 3 — Notifications)*

> **Clarification:** Phase 2 is **catalog + sessions only**. The header 🔔 icon is a **placeholder** (Phase 1 shell). Do not implement Supabase Realtime on `bookings` until Phase 3 when bookings CRUD and the client booking flow are live.

**Existing mock UI replaced:** `/admin/sessions`, `/admin/taxonomy` ✅

---

### Phase 2.5: Unified Catalog UX *(best path)* — ✅ **COMPLETE**

> **Goal:** Merge the reference trainer’s **tabbed catalog + modal CRUD** pattern with Meridian’s **brand, data model, and rich session forms**. No new schema required — UI refactor only. **Complete before Phase 3** so admins have a polished catalog before booking volume grows.

#### Design principles

| From reference (adopt) | From Meridian (keep) |
|----------------------|----------------------|
| Single **Catalog Management** hub with 3 tabs | Forest Green / Gold / Cream — **no** dark/orange theme |
| Modals for **Category** and **Session type** create/edit | Full **pages** for session new/edit *(recurrence, image, cancel reason)* |
| Table columns: Session, Date & Time, Capacity, Price, Status | Existing Supabase CRUD + RLS *(no logic rewrite)* |
| Empty states with friendly copy *(no duplicate primary buttons)* | Sidebar + Quick action dropdown unchanged |
| Inline status actions on session rows | Session cover images + recurrence editor on full form |

#### Route & navigation

| Item | Plan |
|------|------|
| **Primary route** | `/admin/sessions` — page title **Catalog Management**; subtitle *Orchestrate your sessions, types, and categories.* |
| **Tabs** | `?tab=sessions` (default) \| `?tab=types` \| `?tab=categories` — persist tab in URL for share/bookmark |
| **Sidebar** | Keep **Sessions** nav item → lands on Active Sessions tab |
| **Redirect** | `/admin/taxonomy` → `/admin/sessions?tab=types` |
| **Quick action** | “New session” → `/admin/sessions/new` *(unchanged)* |
| **Remove** | “Manage taxonomy” link from session list header *(tabs replace it)* |

#### Tab 1 — Active Sessions *(default)*

Replace current `/admin/sessions` table with catalog-styled layout:

- [ ] Section title: **Upcoming Schedule** with live count
- [ ] Table columns: **Session** (title + type), **Date & Time**, **Capacity** (booked/max), **Price**, **Status** (Active / Cancelled pill)
- [ ] Row actions: **Edit** → `/admin/sessions/edit/:id`; **Cancel** / **Reactivate** inline *(reason modal on cancel)*
- [x] Primary CTA: **+ New Session** in tab toolbar only *(header Quick action is separate global shortcut)*
- [x] Empty state: *Use **+ New Session** above to create your first bookable slot.* — copy only, no second CTA
- [x] Loading skeleton rows

#### Tab 2 — Session Types

Absorb `/admin/taxonomy` session-types column:

- [x] Table: Name, Category, Default duration, Base price (HKD), Status (active/inactive)
- [x] **Actions** column header on all catalog tables
- [x] **+ New Session Type** opens **modal** *(reference pattern)*
- [x] Modal fields: Name, Category (select), Base price, Default duration, Description
- [x] Info hint: *Base prices can be overridden for specific scheduled sessions.* *(cream info box)*
- [x] Edit / Deactivate via row actions → same modal in edit mode
- [x] Empty state: copy-only — points to toolbar **+ New Session Type** button
- [x] Loading skeleton

**Session type naming *(seed + admin guidance)*:**
- Type **name** must differ from category **name** — types are products; categories are service lines
- **Fix seed data** *(Phase 2.5 polish migration)* — current seed copies `categories.name` into `session_types.name`; replace with:

| Category | Session type name *(seed)* |
|----------|---------------------------|
| Tax Planning | Initial Tax Consultation |
| Audit & Compliance | Audit Readiness Review |
| Payroll & MPF | Payroll & MPF Setup Consultation |
| Advisory | Business Advisory Session |

**Default session type base prices *(HKD seed)* — `20250829130000_category_descriptions_and_prices.sql`:**

| Session type | Base price |
|--------------|------------|
| Initial Tax Consultation | HK$1,800 |
| Audit Readiness Review | HK$2,500 |
| Payroll & MPF Setup Consultation | HK$1,500 |
| Business Advisory Session | HK$2,200 |

**Default category descriptions *(seed)*:**

| Category | Description |
|----------|-------------|
| Tax Planning | Strategic guidance on personal and corporate tax obligations, deductions, and year-end planning to minimize liability and stay compliant with IRD requirements. |
| Audit & Compliance | Support preparing for statutory audits, regulatory filings, and internal controls to meet Hong Kong reporting standards. |
| Payroll & MPF | Expert handling of payroll processing, MPF contributions, and employment tax obligations for Hong Kong businesses. |
| Advisory | Business advisory on financial strategy, entity structure, and growth planning tailored to small and medium enterprises. |

#### Tab 3 — Categories

Absorb `/admin/taxonomy` categories column:

- [x] Table: **Name**, **Description**, **Status**, **Actions** — hide **Slug** and **Sort order** from list
- [x] **+ New Category** opens **modal**
- [x] Modal: **Name**, **Description**, **Sort order** *(edit only)*; **Slug** auto-generated *(read-only preview)*
- [x] Edit / Deactivate via row actions
- [x] Empty state: copy-only — points to toolbar **+ New Category** button
- [x] Loading skeleton

**Categories — slug & sort order decision ✅:**
| Field | In DB? | In admin table? | In admin modal? |
|-------|--------|-----------------|-----------------|
| **Name** | ✅ | ✅ | ✅ Required |
| **Description** | ✅ | ✅ | ✅ Optional |
| **Status** | ✅ | ✅ | ✅ |
| **Slug** | ✅ *(unique key, public filters/URLs)* | ❌ Hidden | ✅ Auto from name; read-only preview |
| **Sort order** | ✅ *(landing-page category order)* | ❌ Hidden | ⚠️ Optional — default to next index; advanced edit only if reorder needed |

> Admins care about **what** the category is called and whether it’s active — not URL slugs or numeric order in day-to-day use. Sort order remains in schema for public display sequencing; slug remains for stable keys — both managed implicitly unless admin opens edit modal.

#### Modal & tab styling *(Meridian brand)*

- Modal: white panel, `border-[#EDECE6]`, Forest Green primary button, outline Cancel
- Tab bar: segmented control — active tab `bg-[#0F2A1D] text-white` or Gold accent per brand guide; inactive cream/white
- **Empty states:** One primary CTA per tab in the **toolbar only**; empty panel uses short copy pointing at that button — no link or duplicate button
- Do **not** use reference dark overlay beyond standard `bg-black/40` scrim

#### Components to build *(implementation checklist)*

- [ ] `AdminCatalogPage` — shell with title, subtitle, tab bar, tab panel outlet
- [ ] `CatalogSessionsTab` — refactor from `AdminSessions.tsx`
- [ ] `CatalogSessionTypesTab` — extract from `AdminTaxonomy.tsx` + modal
- [ ] `CatalogCategoriesTab` — extract from `AdminTaxonomy.tsx` + modal
- [ ] `CategoryFormModal`, `SessionTypeFormModal` — shared modal pattern
- [ ] `SessionCancelModal` — reuse/adapt from edit-page cancel flow for inline row action
- [ ] Route redirect `/admin/taxonomy` in `App.tsx`
- [ ] Deprecate standalone `AdminTaxonomy.tsx` after migration

#### Catalog UX polish *(Phase 2.5 follow-up)* — ✅ **COMPLETE**

- [x] **Categories tab:** Remove Slug + Sort order columns from table; keep auto-slug + optional sort in modal only
- [x] **All catalog tables:** Add **Actions** column header *(Session Types, Categories, Active Sessions)*
- [x] **Seed data migration:** Rename default `session_types` to product names — `20250829120000_rename_seed_session_types.sql`
- [x] **Category descriptions:** Add `categories.description` column + seed copy — `20250829130000_category_descriptions_and_prices.sql`
- [x] **Session type base prices:** Seed HKD default prices on session types *(see pricing table above)*

#### Schema note

#### Out of scope for Phase 2.5

- Booking flow, `/admin/bookings` wiring *(Phase 3)*
- Client directory *(Phase 5)*
- Real-time notifications *(Phase 3)*
- Auto-generating recurring slot instances from `recurrence_rules`
- Payment fields

**QA (Phase 2.5):**
- All three tabs load live Supabase data
- Category/type modals create, edit, deactivate without page reload
- `/admin/taxonomy` redirect works; old bookmarks land on Types tab
- Inline session cancel/reactivate updates list and hides/shows on landing page
- Session new/edit full pages unchanged and still reachable
- Meridian brand colors only — no trainer orange theme

---

---

### Phase 4.5: Live People Directory — ✅ **COMPLETE**

> **Goal:** Sync `/admin/clients` with live Supabase `profiles` so admins see **real registered users** (e.g. Gavin Fung) instead of mock samples (`marcus@example.com`). **No bookings dependency** — RLS already allows admins to read all profiles.

#### Why now (before Phase 3)

- Profile schema, signup trigger, and admin RLS exist since Phase 1
- Admin profile pages and header menu already read live data — only the **Clients directory** is still mock
- Low risk: read-only list swap; basic lifecycle (ban/reinstate, edit) added in Phase 4.5 polish; promote/demote deferred to Phase 5

#### Step 0 checklist — wire `/admin/clients`

- [x] Remove `MockupBanner` and `mockClients` array from `AdminClients.tsx`
- [x] Fetch live rows: `supabase.from('profiles').select('*').order('created_at', { ascending: false })`
- [x] Map columns: **Name** (`full_name`), **Email**, **Role** (`RoleBadge`), **Status** (`StatusBadge`), **Joined** (`created_at` formatted)
- [x] Empty state: *No registered users yet.*
- [x] Loading skeleton + error state
- [x] Update subtitle: *All registered users, clients, and firm admins.*
- [x] Avatar column in name cell via `AdminClientAvatar`
- [x] **Actions** column: **Edit** (pencil) + **Ban/Reinstate** (ban icon) for manageable rows — mirrors sessions Edit/Cancel pattern
- [x] **Row click** → `ClientProfileModal` (view profile; edit/ban in modal)
- [x] **Role filter tabs:** All \| Users \| Clients \| Admins
- [x] **Table row hover** on clients list *(shared `adminTableRowClassName`)*

#### `/admin/clients/:id` *(Phase 4.5 minimal — fallback route)*

- [x] Route + read-only detail page: identity header *(avatar, name, email, role, status badges)* + contact/address fields
- [x] Primary UX is modal from list — detail page kept as deep-link fallback
- [x] Admin rows: read-only note *(no action buttons)*

#### Admin table row hover *(Phase 4.5 polish)* ✅

Shared hover styles in `src/lib/table-styles.ts`:

- [x] **Clients** — hover + cursor-pointer on interactive rows
- [x] **Sessions** (catalog Active Sessions tab) — hover highlight
- [x] **Bookings** — hover highlight *(mock list until Phase 3)*

#### Out of scope for Phase 4.5

- Search and banned status filter *(Phase 5)*
- Promote / demote `user` ↔ `client` *(Phase 5)*
- Admin avatar upload on client profiles *(Phase 5 — storage policy)*
- Booking count column *(Phase 3/5 — needs live bookings)*
- Login audit tab *(Phase 4)*

**QA (Phase 4.5):**
- Signing up a new user → row appears on `/admin/clients` after refresh
- Admin account (e.g. Gavin Fung) visible with `admin` role badge
- Mockup banner gone; no `example.com` placeholder emails
- Profile pages (`/admin/profile`, etc.) unchanged and still live
- **Role tabs** filter list correctly (All / Users / Clients / Admins)
- **Row click** opens ClientProfileModal; **Edit** icon opens edit mode; **Ban** icon opens confirm dialog
- **Sidebar chevron** visible on mobile when drawer closed; desktop collapse/expand works
- **Table rows** show cream hover on sessions, bookings, clients tables

---

### Phase 3: Booking Logic & Evolution — ✅ **COMPLETE**

Client booking flow, business rules, live dashboard data, and admin bookings management.

#### Step 0 — Enable Realtime on `bookings` *(Phase 3 kickoff — infra only)*

> **Do this first** when Phase 3 begins — before frontend listeners or bell UI. **Not Phase 2** *(no booking events to consume yet)*.

Migration adds `bookings` to the Supabase Realtime publication. RLS from Phase 1 already governs who may **receive** row events.

```sql
-- supabase/migrations/YYYYMMDDHHMMSS_bookings_realtime.sql
alter publication supabase_realtime add table public.bookings;
```

**Step 0 checklist:**
- [x] Create migration: `alter publication supabase_realtime add table public.bookings`
- [ ] Apply via `supabase db push` (or equivalent) — migration file committed
- [ ] Verify in Supabase Dashboard → Database → Replication

**Then proceed** with booking CRUD, client book flow, `useBookingNotifications`, and bell/toast UI in the same phase so end-to-end QA is possible.

#### Admin `/admin/bookings` scope

Bookings are **status-managed**, not fully editable records:

| Operation | Scope |
|-----------|--------|
| **Create** | Clients via booking flow; optional admin manual booking for walk-ins |
| **Read** | Live list with joins (`profiles`, `sessions`); filter by status; search client |
| **Update** | **Approve**, **Reject**, **Cancel** with required reason modal |
| **Delete** | Avoid hard delete; use `cancelled` / `rejected` status |

**UI checklist:**
- [x] Live Supabase list (replace mock rows)
- [x] Status filter dropdown *(All | Pending | Confirmed | Cancelled | Rejected)*
- [x] Session type filter dropdown
- [x] Date range filter *(All | Today | Week | Month | Custom with from/to)*
- [x] **Row click** → `BookingDetailModal` (view booking; **View client** opens `ClientProfileModal`)
- [x] Column sorting on all data columns *(client-side)*
- [ ] Search by client name/email
- [x] Row actions: **View** (eye icon) in table; **Approve / Reject / Cancel** in booking modal
- [x] Reason modal on Reject and Cancel
- [x] **Booking detail modal** — row click opens inspector; **View client** opens `ClientProfileModal`
- [x] Remove `MockupBanner` from `/admin/bookings`
- [ ] Context-aware header: enable Manual booking item when Phase 3 ships; enable Add client when Phase 5 ships
- [ ] Optional: `/admin/bookings/:id` detail view

#### Notifications *(Phase 3 — not Phase 2)*

> **Scope:** All notification work ships with **bookings**, when there is something to notify about. Phase 2/2.5 deliver catalog CRUD only; the header bell remains a non-functional placeholder until Phase 3.

| Channel | When | Implementation |
|---------|------|----------------|
| **In-app realtime** | New booking submitted; admin approves/rejects/cancels; client booking status changes | Supabase **Realtime** subscription on `bookings` *(+ optional `postgres_changes` filter by `user_id` / admin)* |
| **Header bell badge** | Admin: pending booking count; Client: unread status updates | Poll or Realtime-driven count; dropdown list of recent booking events *(Phase 3)* |
| **Toast messages** | After user actions *(book, cancel, admin approve)* | Top-left toast provider *(Forest Green/Gold)* — `react-hot-toast` or custom *(Phase 3)* |
| **Email** | Booking confirmation, rejection, cancellation | Supabase Edge Function `booking-notifier` + **Resend** / **SendGrid** *(async — not realtime, but part of notification stack)* |

**Phase 3 notification checklist** *(partial — bell badge shipped; Realtime/toast/email deferred)*:
- [ ] `useBookingNotifications` hook — full Realtime subscription
- [x] Header 🔔: pending booking count badge *(admin; links to `/admin/bookings`)*
- [ ] Toast provider for booking action feedback
- [ ] Edge Function + email templates for status changes

#### Other Phase 3 items

- [x] Implement Booking flow for clients (homepage `#booking` → submit pending booking)
- [x] Logic: First booking promotion (`user` → `client`) *(DB trigger — verify on next signup test)*
- [x] Constraint: Reject booking when session `max_slots` is full *(client-side check on book)*
- [x] Admin Dashboard: Overview widgets (occupancy, revenue, active clients, pending bookings)
- [x] Admin Dashboard: Popular categories + recent activity from live bookings
- [x] Client `/dashboard` landing: upcoming/pending counts + next session card
- [x] Client `/dashboard/bookings`: live table + cancel with reason
- [ ] Constraint: Check `app_settings.max_booking_days_advance` *(needs Phase 5 `app_settings`)*
- [ ] Configure production **Authentication → Redirect URLs** for `/reset-password`
- [ ] Manual booking quick action *(admin header)*

*(Notification items — Realtime, bell, toasts, email — are listed in **§ Notifications** above.)*

**Existing mock UI to replace:** `/dashboard`, `/dashboard/bookings`, `/admin/dashboard`, `/admin/bookings` ✅ *Phase 1*

---

### Phase 4: History & Logging

Audit trails for compliance and admin visibility.

- [ ] Auth Hook: Save entry in `user_login_history` on successful login *(table exists — wire auth hook)*
- [ ] Database Triggers (or service logic) for `session_history` on session CREATE / UPDATE / CANCEL
- [ ] Database Triggers (or service logic) for `booking_history` on booking CREATE / STATUS_CHANGE / USER_CANCEL
- [ ] Master Booking history view for Admin
- [ ] Admin `/admin/clients`: audit view displaying `user_login_history` for selected users
- [ ] Admin session change log viewer (from `session_history`)

**Tables already migrated in Phase 1:** `user_login_history`, `session_history`, `booking_history` (RLS: admin read only)

---

### Phase 5: Admin Controls & Reporting *(after Phase 4)*

Firm settings, **people lifecycle management**, and analytics. **Read-only directory ships in Phase 4.5**; this phase adds management + reporting.

#### Design decision: People directory ✅

Single admin view for **every registered account** — not limited to `client` role.

| Role in list | Visible | Admin actions |
|--------------|---------|---------------|
| `user` | ✅ | View, ban/reinstate, promote → `client` |
| `client` | ✅ | View, ban/reinstate, demote → `user`, edit profile *(Option B)* |
| `admin` | ✅ | View only — **no** ban, demote, or promote in UI |

Promote to `admin` remains **Supabase/manual only** *(security)*.

#### Design decision: Admin client management — **Option B** ✅

Admins get **full profile edit access** on `/admin/clients/:id` plus **role/status actions**. Firm staff can correct client contact and address details on behalf of users when needed *(e.g. phone number updated during a call)*. Clients still manage their own profile via `/dashboard/profile`; admin edits are an override path, not a replacement for self-service.

| Operation | Scope |
|-----------|--------|
| **Create** | ❌ Not in admin UI — users self-register via `/signup` |
| **Read** | Searchable directory from `profiles`; detail page at `/admin/clients/:id` |
| **Update** | Edit name, phone, address, avatar; promote `user` → `client`, demote `client` → `user`; ban/reinstate (`status`) |
| **Delete** | Account deletion via edge function / service role *(confirm modal; Phase 5)* |

**Option B profile fields (admin-editable on `/admin/clients/:id`):**
- `first_name`, `last_name` *(recompute `full_name`)*
- `phone_prefix`, `phone_number`
- Address fields (`address_line1`, `address_line2`, `city`, `county`, `post_code`, `country`)
- `avatar_path` — upload/replace/remove client avatar *(may require storage RLS extension for admin writes to client folders)*

**Still out of scope:**
- Promote to `admin` via UI *(remain Supabase/manual for security)*
- Admin-created auth accounts *(no “Add client” signup bypass)*

**RLS note:** `profiles` already has **Admins can update all profiles** (Phase 1). Avatar storage currently allows admin **read** only; Phase 5 implementation should add admin upload/delete policies on `profile-pictures` for client folders or use a controlled upload helper.

#### Admin `/admin/clients` UI checklist *(Phase 5 — after 4.5 read-only)*

- [x] Page title **Clients**; subtitle *All registered users, clients, and firm admins* — **Phase 4.5**
- [x] Live Supabase list from `profiles` — **Phase 4.5**
- [x] Role + status badges — **Phase 4.5**
- [x] Role filter tabs: All \| Users \| Clients \| Admins — **Phase 4.5 polish**
- [x] Avatar column (signed URL) — **Phase 4.5**
- [ ] Search by name/email; status filter (Banned)
- [ ] Optional column: booking count *(join or subquery — after Phase 3)*
- [x] Row actions: **Edit** (pencil) + **Ban/Reinstate** (ban icon) for `user`/`client` — **Phase 4.5 polish**
- [ ] Promote/Demote between `user` and `client`
- [x] Confirmation modals for ban/reinstate — **Phase 4.5 polish** (`ClientProfileModal`)
- [x] **ClientProfileModal** — view/edit/ban for non-admin profiles — **Phase 4.5 polish**
- [ ] `/admin/clients/:id` — **full editable profile form** *(Option B)* + audit tabs — modal covers basic edit today
- [ ] Detail tabs: Profile \| Bookings \| Login history *(login tab needs Phase 4 data)*
- [ ] Admin avatar upload on non-admin detail *(storage policy if needed)*
- [ ] Account deletion *(edge function)* — optional late Phase 5

#### Other Phase 5 items

- [ ] Reporting: Charts for session popularity using **Recharts** (`/admin/reporting`)
- [ ] Metrics: occupancy rate, projected revenue, category/type distribution, active vs banned clients
- [ ] Settings Page: Manage `app_settings` (including `max_booking_days_advance` booking window)
- [ ] Admin `/admin/settings`: wire notification preferences, business hours placeholders

**Existing mock UI to replace:** `/admin/clients`, `/admin/settings` ✅ *Phase 1*

---

### Prior plan crosswalk (retained for reference)

Items from the old layer-based phases map to the feature phases above:

| Old phase (layer-based) | Now lives in |
|-------------------------|--------------|
| Database & Supabase Configuration | **Phase 1** ✅ |
| Edge Functions & Email | **Phase 3** |
| Public Routing & Authentication | **Phase 1** ✅ (+ toast polish in **Phase 3**) |
| Client Dashboard (`/dashboard/*`) | **Phase 3** (profile done in **Phase 1** ✅) |
| Admin Dashboard (`/admin/*`) | **Phase 2** ✅ (sessions), **Phase 2.5** ✅ (catalog), **Phase 4.5** ✅ (clients read-only), **Phase 3** (bookings/overview), **Phase 4** (audit), **Phase 5** (clients management/reporting/settings) |

---

## 8. Verification & QA Plan

### Phase 1 — Verified ✅
- ✅ **Auth flows:** Sign up, login, forgot/reset password, logout (context-aware)
- ✅ **Role routing:** `user`/`client` → `/dashboard`; `admin` → `/admin/dashboard`
- ✅ **Not authorized:** Non-admins hitting `/admin/*` see `/not-authorized`
- ✅ **Profile CRUD:** Name, contact, address, avatar upload on all profile routes
- ✅ **Mock dashboards:** Layout shells render for client and admin roles
- ✅ **Banned state:** Suspension screen implemented
- ⏳ **Production reset URL:** Add production domain to Supabase Auth redirect allow-list on deploy

### Phase 2 — Session & Category Management ✅
- **Category/Type CRUD:** Admin can create, edit, deactivate categories and session types
- **Session CRUD:** Admin can create/edit/cancel sessions; changes persist and respect RLS
- **Recurrence:** Structured weekly editor; stored as JSONB *(auto slot generation deferred)*
- **Session images:** Optional cover upload; displayed on landing page cards
- **Landing page:** Public booking section reads live upcoming sessions from Supabase
- **Dashboard UX:** Header Quick action dropdown + profile menu

### Phase 2.5 — Unified Catalog UX ✅
- **Tabbed hub:** Active Sessions | Session Types | Categories at `/admin/sessions`
- **Modals:** Category and session type create/edit *(Meridian-styled)*
- **Sessions tab:** Status column, inline cancel/reactivate, loading skeletons
- **Empty states:** Toolbar primary CTA only; empty panel uses copy pointing to toolbar button
- **Redirects:** `/admin/taxonomy` → types tab; full pages kept for session new/edit
- **Polish:** Category table with descriptions; Actions headers; seed type names + base prices (HKD)

### Phase 4.5 — Live People Directory ✅
- **Live `/admin/clients`:** Live list from `profiles`; mock samples removed
- **All roles:** `user`, `client`, `admin` with avatar, name, email, role, status, joined
- **Role filter tabs:** All \| Users \| Clients \| Admins
- **ClientProfileModal:** Row click → view; edit + ban/reinstate in modal; icon actions (pencil + ban) on table rows
- **Table row hover:** Shared styles on clients, sessions (catalog), and bookings tables
- **Sidebar toggle:** Expand/collapse chevron fixed outside sidebar edge (mobile + desktop)
- **Detail page:** `/admin/clients/:id` read-only fallback for deep links
- **Deferred to Phase 5:** Search, promote/demote, full Option B detail page + avatar upload

### Phase 3 — Booking Logic & Evolution ✅
- **Admin bookings:** Live list, filters, sort, view modal, approve/reject/cancel with reason
- **Admin overview:** Live occupancy, projected revenue, active clients, pending count, category chart, recent activity
- **Client booking:** Homepage session cards → login → book → pending status
- **Client dashboard:** Live stats, next session, bookings list with cancel
- **Bell badge:** Admin pending bookings count in header
- **Deferred:** Realtime push, toasts, email edge function, booking search, manual booking, `app_settings` window

### Phase 4 — History & Logging (next)
- **Login audit:** Successful sign-in writes to `user_login_history`
- **Session audit:** Session create/update/cancel writes to `session_history`
- **Booking audit:** Status changes write to `booking_history`
- **Admin views:** Master booking history and per-user login log visible to admins

### Phase 5 — Admin Controls & Reporting (pending)
- **People management:** Search, promote/demote, full Option B detail page + avatar upload *(basic edit/ban shipped in Phase 4.5 modal)*
- **User management:** Account deletion via edge function
- **Reporting:** Charts reflect live booking/session data
- **Settings:** Changes to `app_settings` take effect on new bookings
