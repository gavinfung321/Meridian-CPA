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
| **3** | Booking Logic & Evolution | **Next** | — | Client booking flow, role promotion, admin overview widgets |
| **4** | History & Logging | Not started | — | Login/session/booking audit trails |
| **5** | Admin Controls & Reporting | Not started | — | **People directory** (users/clients/admins), charts, `app_settings` |

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
| **Left sidebar** | Primary navigation (Overview, Sessions, Bookings, etc.) | Forest Green `#0F2A1D` background; Gold `#C9A84C` active item |
| **Top header bar** | Context, quick actions, utilities | White/cream bar, `border-[#EDECE6]`; visible on desktop and mobile |
| **Main content** | Page title, cards, tables, forms | Cream page ground `#F9F9F6`; white cards with thin borders |

#### Top header bar (admin + client)

Inspired by modern SaaS dashboards (reference: quick-action + profile cluster top-right), implemented as:

- **Left (desktop):** optional page title or breadcrumb for deep routes (e.g. Edit session)
- **Center / left-of-right:** single **Quick action** dropdown *(admin only)* — one Forest Green button opening a menu; not multiple header buttons or page-level action grids
  - **Admin menu items:** New session *(Phase 2 ✅)*; Manual booking *(Phase 3 — disabled until live)*; Add client *(Phase 5 — disabled until live)*
  - **Client portal:** single **Book a session** link/button *(no dropdown needed — one action)*
- **Right cluster:** `[ Quick action ▾ ] | [ 🔔 ] [ Avatar + name ▾ ]` — vertical separator between quick action and utilities

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

#### Mockup banners — retirement plan

Remove `MockupBanner` progressively as live data ships:

| Page | Remove banner when |
|------|-------------------|
| `/admin/sessions` | ✅ Live CRUD wired — remove banner |
| `/admin/dashboard` | Phase 3 metrics live |
| `/admin/bookings` | Phase 3 status actions wired |
| `/admin/clients` | Phase 5 directory wired |
| `/dashboard/*` | Phase 3 booking data live |

> **Next focus (Phase 3):** Bookings CRUD + client booking flow. `/admin/clients` people directory stays mock until **Phase 5** *(see §3 People directory)*.

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

**CPA interpretation:** Categories = service lines; Session types = consultation products (e.g. “Tax Planning Consultation”, “Audit Readiness Review”); Active sessions = firm calendar slots clients can book.

---

### Client & User Management (`/admin/clients`)

> **Decision:** ✅ **Yes** — keep a dedicated **People directory** in the admin sidebar *(Figma: “Clients”)*. It lists **all registered accounts** (`user`, `client`, `admin`), not only engaged clients. **Separate nav item** — do **not** merge into Catalog Management tabs.

| Reference feature | Personal trainer | Meridian CPA | Status |
|-------------------|------------------|--------------|--------|
| **Searchable directory** | Filter by name/contact | Search `profiles` by name/email | ❌ Mock UI only → **Phase 5** |
| **All roles visible** | Clients + staff/admins | `user` + `client` + `admin` in one list; role filter tabs | ❌ Mock UI only → **Phase 5** |
| **Role management** | Upgrade to Admin or Client in UI | Promote `user` ↔ `client`; ban/reinstate | ❌ Mock UI only → **Phase 5** |
| **Promote to Admin in UI** | Supported in reference | **Out of scope** — Supabase/manual only *(security)* | 🚫 **Intentionally excluded** |
| **Admin accounts in list** | Shown | Shown **read-only** — view profile, no ban/demote/promote actions on `admin` rows | ✅ Planned — **Phase 5** |
| **Engagement tracking** | Contact + status at a glance | Avatar, role/status badges, booking count, joined date | ❌ Mock UI only → **Phase 5** detail page *(Option B)* |
| **Admin edit client profile** | Implied in reference | **Option B:** admin can edit contact/address/name/avatar on detail | ✅ Planned — **Phase 5** |
| **Create client in admin** | “Add client” quick action | Users self-register via `/signup` | 🚫 **By design** — quick action stays disabled |
| **Link from bookings** | Client name in ledger | Booking row → `/admin/clients/:id` | ❌ Not built → **Phase 3** cross-link *(detail may be read-only until Phase 5)* |

**CPA interpretation:** Sidebar label stays **Clients** per brand/Figma, but the page subtitle clarifies *“All registered users, clients, and firm admins.”* Firm staff manage lifecycle (ban, promote after engagement), not create auth accounts. Admin rows are for visibility only.

---

### Booking Ledger (`/admin/bookings`)

| Reference feature | Personal trainer | Meridian CPA | Status |
|-------------------|------------------|--------------|--------|
| **Master booking feed** | All appointments | All `bookings` joined to `profiles` + `sessions` | ❌ Mock UI only → **Phase 3** |
| **Lifecycle actions** | Confirm / cancel one-click | Approve / Reject / Cancel with reason | ❌ Mock UI only → **Phase 3** |
| **Detail inspector** | Rich modal *(session + client + payment)* | Booking detail modal: client, session, status, price *(no payment gateway yet)* | ❌ Not built → **Phase 3** *(add modal; payment status deferred)* |
| **Relational joins** | Who, what, when | `bookings` → `profiles`, `sessions`, `session_types` | ❌ Planned → **Phase 3** |
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
- `/admin/clients` - **People directory** *(sidebar label: Clients)* — all `profiles` (`user`, `client`, `admin`); search + role/status filters. ✅ *Mock UI — Phase 1* → **Phase 5:** live directory *(see §3 People directory, §7 Phase 5)*
- `/admin/clients/:id` - Person detail *(Phase 5)* — **editable** profile for `user`/`client` *(Option B)*; read-only summary for `admin`; booking history; login audit tab *(Phase 4)*
- `/admin/profile` - Admin profile form (same fields as client profile). ✅ *Phase 1*
- `/admin/reporting` - Metrics charts (occupancy rate, estimated revenue, type distribution). *Phase 5*
- `/admin/settings` - Global booking settings, firm business hours, notification preferences. ✅ *Mock UI — Phase 1* → **Phase 5**

#### People directory *(sidebar: Clients)* — design decision ✅

> **Should we have a section for all registered admins, users, and clients?** **Yes.** It already exists in the admin sidebar mock and Figma. Wire it in **Phase 5**; keep mock until then.

| Item | Decision |
|------|----------|
| **Route** | `/admin/clients` — keep URL; sidebar label **Clients** per Figma |
| **Scope** | Every row in `profiles`: `user` *(registered, not yet booked)*, `client` *(has booked)*, `admin` *(firm staff)* |
| **Not in Catalog tabs** | People management is a **separate concern** from session catalog — do not add a 4th tab to `/admin/sessions` |
| **List UX** | Search by name/email; **filter tabs:** All \| Users \| Clients \| Admins \| Banned *(URL: `?role=` / `?status=`)* |
| **Table columns** | Avatar, Name, Email, Role, Status, Joined, Bookings count *(optional)*, Actions |
| **Row actions** | `user`/`client`: View, Ban/Reinstate, Promote/Demote · `admin`: **View only** *(no lifecycle actions)* |
| **Detail page** | `/admin/clients/:id` — editable form for non-admins *(Option B)*; admins see read-only identity + audit tabs |
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
- `/admin/clients` — mock list; wire in **Phase 5**
- Admin overview live metrics — **Phase 3**

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

- [ ] Table: Name, Category, Default duration, Base price (HKD), Status (active/inactive)
- [ ] **+ New Session Type** opens **modal** *(reference pattern)*
- [ ] Modal fields: Name, Category (select), Base price, Default duration, Description
- [ ] Info hint: *Base prices can be overridden for specific scheduled sessions.* *(cream info box, not reference blue)*
- [ ] Edit / Deactivate via row actions → same modal in edit mode
- [x] Empty state: copy-only — points to toolbar **+ New Session Type** button
- [x] Loading skeleton

#### Tab 3 — Categories

Absorb `/admin/taxonomy` categories column:

- [ ] Table: Name, Slug, Sort order, Status
- [ ] **+ New Category** opens **modal**
- [ ] Modal fields: Name, Description *(optional — add column if missing)*, Sort order; auto-slug from name
- [ ] Edit / Deactivate via row actions
- [x] Empty state: copy-only — points to toolbar **+ New Category** button
- [x] Loading skeleton

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

#### Schema note *(optional)*

- [ ] *(Optional)* Add `categories.description text` if modal should match reference; otherwise use name-only in modal and keep slug/sort in advanced section

#### Out of scope for Phase 2.5

- Booking flow, `/admin/bookings` wiring *(Phase 3)*
- Client directory *(Phase 5)*
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

### Phase 3: Booking Logic & Evolution *(after Phase 2.5)*

Client booking flow, business rules, live dashboard data, and notifications. **Bookings admin CRUD lives here.**

#### Admin `/admin/bookings` scope

Bookings are **status-managed**, not fully editable records:

| Operation | Scope |
|-----------|--------|
| **Create** | Clients via booking flow; optional admin manual booking for walk-ins |
| **Read** | Live list with joins (`profiles`, `sessions`); filter by status; search client |
| **Update** | **Approve**, **Reject**, **Cancel** with required reason modal |
| **Delete** | Avoid hard delete; use `cancelled` / `rejected` status |

**UI checklist:**
- [ ] Live Supabase list (replace mock rows)
- [ ] Status filter tabs + search
- [ ] Row actions: Approve / Reject / Cancel (contextual by status)
- [ ] Reason modal on Reject and Cancel
- [ ] **Booking detail inspector modal** — client name links to `/admin/clients/:id` *(person detail read-only OK until Phase 5)*
- [ ] Remove `MockupBanner`
- [ ] Context-aware header: enable Manual booking item when Phase 3 ships; enable Add client when Phase 5 ships
- [ ] Optional: `/admin/bookings/:id` detail view

#### Other Phase 3 items

- [ ] Implement Booking flow for clients (homepage / dashboard → book a session)
- [ ] Logic: First booking promotion (`user` → `client`) *(DB trigger exists — verify end-to-end)*
- [ ] Constraint: Check `app_settings.max_booking_days_advance` before allowing a booking
- [ ] Constraint: Reject booking when session `max_slots` is full
- [ ] Admin Dashboard: Overview widgets (Total Bookings, Active Clients, occupancy, revenue)
- [ ] Client `/dashboard` landing: next upcoming booking, status indicators (e.g. "Pending Approval")
- [ ] Client `/dashboard/bookings`: live table, search, cancellation flow
- [ ] Supabase Edge Function `booking-notifier` on booking status changes *(from prior plan)*
- [ ] Email via **Resend** or **SendGrid** (confirmation, rejection, cancellation) *(from prior plan)*
- [ ] Top-left toast system for booking feedback *(from prior plan)*
- [ ] Header notification badge: pending booking count for admins; booking status updates for clients
- [ ] Configure production **Authentication → Redirect URLs** for `/reset-password`

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

Firm settings, user lifecycle management, and analytics. **People directory** *(sidebar: Clients)* **lives here.**

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

#### Admin `/admin/clients` UI checklist

- [ ] Page title **Clients**; subtitle *“All registered users, clients, and firm admins.”*
- [ ] Live Supabase list from `profiles` (replace mock rows)
- [ ] Search by name/email; filter tabs: All \| Users \| Clients \| Admins; status filter (active/banned)
- [ ] Avatar column (signed URL via existing avatar helper)
- [ ] Role + status badges *(reuse `RoleBadge`, `StatusBadge`)*
- [ ] Optional column: booking count *(join or subquery)*
- [ ] Row actions by role: **View** for all; **Ban/Reinstate**, **Promote/Demote** for `user`/`client` only
- [ ] Confirmation modals for ban and role changes
- [ ] Remove `MockupBanner`
- [ ] `/admin/clients/:id` — **editable profile form** for `user`/`client` *(reuse/adapt `ProfilePageContent`)*; **read-only** header for `admin`
- [ ] Detail tabs: Profile \| Bookings \| Login history *(login tab needs Phase 4 data)*
- [ ] Admin avatar upload on non-admin detail *(storage policy if needed)*
- [ ] Empty states + loading skeletons *(match Catalog hub pattern)*
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
| Admin Dashboard (`/admin/*`) | **Phase 2** ✅ (sessions), **Phase 2.5** (catalog UX), **Phase 3** (bookings/overview), **Phase 4** (audit), **Phase 5** (clients/reporting/settings) |

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
- **Empty states:** Toolbar primary CTA only; empty panel uses copy pointing to toolbar button *(no link or duplicate button)*
- **Redirects:** `/admin/taxonomy` → types tab; full pages kept for session new/edit

### Phase 3 — Booking Logic & Evolution (next)
- **Booking flow:** Client can book a session from homepage/dashboard
- **Admin bookings:** Live list; Approve/Reject/Cancel with reason; filters and search
- **Role promotion:** First booking upgrades `user` → `client`; verify trigger end-to-end
- **Edge cases:** Full sessions and booking window rejected; banned users blocked
- **Auth guard:** Non-admins cannot access `/admin/*`

### Phase 4 — History & Logging (pending)
- **Login audit:** Successful sign-in writes to `user_login_history`
- **Session audit:** Session create/update/cancel writes to `session_history`
- **Booking audit:** Status changes write to `booking_history`
- **Admin views:** Master booking history and per-user login log visible to admins

### Phase 5 — Admin Controls & Reporting (pending)
- **People directory:** `/admin/clients` lists all `profiles` — users, clients, and admins; role filter tabs; admin rows read-only
- **Clients (Option B):** Editable profile on detail page for `user`/`client` + ban/reinstate + promote/demote; admin avatar upload may need storage policy
- **User management:** Account deletion via edge function
- **Reporting:** Charts reflect live booking/session data
- **Settings:** Changes to `app_settings` take effect on new bookings
