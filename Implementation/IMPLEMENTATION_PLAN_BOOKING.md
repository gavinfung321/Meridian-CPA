# Supabase Backend & Dashboards Implementation Plan

This document outlines the detailed, step-by-step technical plan to implement user authentication, a Supabase database backend, automatic email notifications, client dashboards, and admin management pages for the Meridian CPA booking system.

> **Detailed Phase 1 record:** See [PHASE_1_AUTH_PROFILES.md](./PHASE_1_AUTH_PROFILES.md) for full checklists, design decisions, and QA notes.

---

## Implementation Status

| Phase | Name | Status | GitHub | Notes |
|-------|------|--------|--------|-------|
| **1** | Authentication & Profiles | **Complete** | [#3](https://github.com/gavinfung321/Meridian-CPA/issues/3), [#4](https://github.com/gavinfung321/Meridian-CPA/issues/4) (closed) | Auth, profiles, avatars, dashboard shells, base schema |
| **2** | Session & Category Management | Not started | — | CRUD + availability rules + admin session UI |
| **3** | Booking Logic & Evolution | Not started | — | Client booking flow, role promotion, admin overview widgets |
| **4** | History & Logging | Not started | — | Login/session/booking audit trails |
| **5** | Admin Controls & Reporting | Not started | — | User management, charts, `app_settings` |

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

---

## 3. Page Mapping & URL Slugs
Instead of heavy overlays or modals for main views, we will use unique pages with dedicated slugs.

### Authentication & Public Pages
- `/login` - Login with email/password. ✅ *Phase 1*
- `/signup` - Registration form (first name + last name). ✅ *Phase 1*
- `/forgot-password` - Request a password reset email. ✅ *Phase 1*
- `/reset-password` - Set a new password from the email link. ✅ *Phase 1*
- `/logout` - Session cleanup via `signOut()`, then redirect to `/`. ✅ *Phase 1*
- `/not-authorized` - Shown when a signed-in `user` or `client` attempts to access `/admin/*`. ✅ *Phase 1*
- `/profile` - Unified profile page (all roles); avatar upload; contact/address form. ✅ *Phase 1* ([#4](https://github.com/gavinfung321/Meridian-CPA/issues/4))

### Client Pages (`/dashboard/*` - Protected Client Route)
- `/dashboard` - Overview showing next upcoming booking, summary stats. ✅ *Mock UI — Phase 1*
- `/dashboard/bookings` - History of past bookings, active booking list, request cancellation button. ✅ *Mock UI — Phase 1*
- `/dashboard/profile` - Edit profile info (name, phone prefix/number, address, email), view account status. ✅ *Phase 1*

### Admin Pages (`/admin/*` - Protected Admin Route)
- `/admin/dashboard` - Visual overview with key metrics. ✅ *Mock UI — Phase 1*
- `/admin/sessions` - CRUD list of all sessions (Tax planning, Audits, etc.), view schedules. ✅ *Mock UI — Phase 1*
- `/admin/sessions/new` - Form to create a session slot.
- `/admin/sessions/edit/:id` - Form to edit/cancel a session slot.
- `/admin/bookings` - Global listing of bookings; actions to approve, reject, cancel, filter by user/status. ✅ *Mock UI — Phase 1*
- `/admin/clients` - List of all signed-up users. Actions to promote to client, demote to user, view logs, ban, or reinstate. ✅ *Mock UI — Phase 1*
- `/admin/profile` - Admin profile form inside admin sidebar (same fields as client profile). ✅ *Phase 1*
- `/admin/reporting` - Metrics charts (occupancy rate, estimated revenue, type distribution).
- `/admin/settings` - Global booking settings, firm business hours, notification preferences. ✅ *Mock UI — Phase 1*

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

#### `categories` *(Phase 2)*
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

#### `session_types` *(Phase 2)*
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

> **Note:** Phase 1 `sessions` table uses a `type text` column for mock data. Phase 2 may add `session_type_id` FK or migrate existing rows when categories/types CRUD is built.

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

### Phase 2: Session & Category Management

Admin-managed taxonomy and session slots. Replaces mock `/admin/sessions` data with live CRUD.

- [ ] CRUD for `categories`
- [ ] CRUD for `session_types`
- [ ] CRUD for `sessions` (wire to existing `sessions` table; link to `session_types` when ready)
- [ ] Implement Availability Rules using JSONB recurrence rules
- [ ] Admin UI for Session management (List, Create, Edit)
- [ ] Routes: `/admin/sessions/new`, `/admin/sessions/edit/:id`
- [ ] Form fields: slot limits, datetime pickers, type/category selections, locations, pricing
- [ ] Cancel session slot (cascade or notify affected bookings with reason input)
- [ ] RLS policies for new `categories` / `session_types` tables
- [ ] Landing page: read active, non-cancelled sessions for public availability *(schema + RLS already in Phase 1)*

**Existing mock UI to replace:** `/admin/sessions` table placeholder ✅ *Phase 1*

---

### Phase 3: Booking Logic & Evolution

Client booking flow, business rules, live dashboard data, and notifications.

- [ ] Implement Booking flow for clients (homepage / dashboard → book a session)
- [ ] Logic: First booking promotion (`user` → `client`) *(DB trigger exists — verify end-to-end)*
- [ ] Constraint: Check `app_settings.max_booking_days_advance` before allowing a booking
- [ ] Constraint: Reject booking when session `max_slots` is full
- [ ] Admin Dashboard: Overview widgets (Total Bookings, Active Clients, occupancy, revenue)
- [ ] Client `/dashboard` landing: next upcoming booking, status indicators (e.g. "Pending Approval")
- [ ] Client `/dashboard/bookings`: live table, search, cancellation flow
- [ ] Admin `/admin/bookings`: Approve, Reject, Cancel actions wired to DB
- [ ] Supabase Edge Function `booking-notifier` on booking status changes *(from prior plan)*
- [ ] Email via **Resend** or **SendGrid** (confirmation, rejection, cancellation) *(from prior plan)*
- [ ] Top-left toast system for booking feedback *(from prior plan)*
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

### Phase 5: Admin Controls & Reporting

Firm settings, user lifecycle management, and analytics.

- [ ] User Management: Account deletion and role management (promote/demote, ban/reinstate)
- [ ] Admin `/admin/clients`: wire promote to `client`, demote to `user`, ban toggle (`status = banned`)
- [ ] Reporting: Charts for session popularity using **Recharts** (`/admin/reporting`)
- [ ] Metrics: occupancy rate, projected revenue, category/type distribution, active vs banned clients
- [ ] Settings Page: Manage `app_settings` (including `max_booking_days_advance` booking window)
- [ ] Admin `/admin/settings`: wire notification preferences, business hours placeholders
- [ ] Admin can view any user's profile picture in client detail views *(storage RLS ready from Phase 1)*

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
| Admin Dashboard (`/admin/*`) | **Phase 2** (sessions), **Phase 3** (bookings/overview), **Phase 4** (audit), **Phase 5** (clients/reporting/settings) |

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

### Phase 2 — Session & Category Management (pending)
- **Category/Type CRUD:** Admin can create, edit, deactivate categories and session types
- **Session CRUD:** Admin can create/edit/cancel sessions; changes persist and respect RLS
- **Availability rules:** Recurrence JSONB correctly generates bookable slots

### Phase 3 — Booking Logic & Evolution (pending)
- **Auth Guard Test:** Attempt to access `/admin/*` as a standard `client` or `user` to ensure the **Not authorized** page is shown (no admin content rendered).
- **Role Progression Test:** Sign up a new user (verify role = `user`), make a booking (verify role = `client`), cancel the booking (verify role reverts to `user`).
- **Edge Cases:** Booking a session that has reached `max_slots` should reject the booking request immediately.
- **Booking window:** Booking beyond `max_booking_days_advance` is rejected.
- **Banned State Test:** Log in as a banned user and verify they cannot view dashboards (toast UX when implemented).

### Phase 4 — History & Logging (pending)
- **Login audit:** Successful sign-in writes to `user_login_history`
- **Session audit:** Session create/update/cancel writes to `session_history`
- **Booking audit:** Status changes write to `booking_history`
- **Admin views:** Master booking history and per-user login log visible to admins

### Phase 5 — Admin Controls & Reporting (pending)
- **User management:** Promote, demote, ban, reinstate, and delete accounts work as expected
- **Reporting:** Charts reflect live booking/session data
- **Settings:** Changes to `app_settings` (e.g. booking window) take effect on new bookings
