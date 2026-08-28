# Supabase Backend & Dashboards Implementation Plan

This document outlines the detailed, step-by-step technical plan to implement user authentication, a Supabase database backend, automatic email notifications, client dashboards, and admin management pages for the Meridian CPA booking system.

---

## 1. System Architecture & Tech Stack
- **Database & Backend:** Supabase (PostgreSQL, Auth, Edge Functions for notifications, Storage buckets for client documents if needed).
- **Authentication:** Supabase GoTrue (Email/Password, Session-based auth).
- **Routing:** React Router v6 (Protected Routes for `/admin/*` and `/dashboard/*`).
- **Styling & UI Components:** Tailwind CSS, Lucide React icons, and custom components adhering to the **Meridian CPA Brand Guide** (inspired by Shadcn design principles).
- **Notifications:** Supabase Edge Functions + Resend / SendGrid API for automated booking confirmation and status change emails.

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
- `/login` - Login with email/password.
- `/signup` - Registration form.
- `/logout` - Redirect helper / cleanup.

### Client Pages (`/dashboard/*` - Protected Client Route)
- `/dashboard` - Overview showing next upcoming booking, summary stats.
- `/dashboard/bookings` - History of past bookings, active booking list, request cancellation button.
- `/dashboard/profile` - Edit profile info (name, phone, company, email), view account status.

### Admin Pages (`/admin/*` - Protected Admin Route)
- `/admin/dashboard` - Visual overview with key metrics.
- `/admin/sessions` - CRUD list of all sessions (Tax planning, Audits, etc.), view schedules.
- `/admin/sessions/new` - Form to create a session slot.
- `/admin/sessions/edit/:id` - Form to edit/cancel a session slot.
- `/admin/bookings` - Global listing of bookings; actions to approve, reject, cancel, filter by user/status.
- `/admin/clients` - List of all signed-up users. Actions to promote to client, demote to user, view logs, ban, or reinstate.
- `/admin/reporting` - Metrics charts (occupancy rate, estimated revenue, type distribution).
- `/admin/settings` - Global booking settings, firm business hours, notification preferences.

---

## 4. Database Schema (Supabase Tables)

### `profiles` (extends Supabase `auth.users`)
```sql
create type user_role as enum ('admin', 'client', 'user');
create type user_status as enum ('active', 'banned');

create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  updated_at timestamp with time zone,
  full_name text not null,
  email text not null,
  phone text,
  role user_role default 'user'::user_role not null,
  status user_status default 'active'::user_status not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
```

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

---

## 5. Security & Row Level Security (RLS) Rules

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

### A. Automatic Profile Creation
Create a trigger that inserts a row into `public.profiles` whenever a new user registers through Supabase Auth.
```sql
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, email, role, status)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', 'New User'),
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

## 7. Step-by-Step Implementation Flow

### Phase 1: Database & Supabase Configuration
1. Initialize the Supabase project.
2. Run SQL migrations to create Enums, Tables (`profiles`, `sessions`, `bookings`, logs).
3. Set up Database Triggers for user registration and role adjustments.
4. Define RLS Policies for all tables to protect admin and client views.

### Phase 2: Supabase Edge Functions & Email Routing
1. Create a Edge Function `booking-notifier`.
2. Connect the Edge Function to trigger on `bookings` changes (e.g., when a booking goes `pending -> confirmed`, send confirmation; when an admin rejects/cancels, send update).
3. Configure **Resend** or **SendGrid** in the Edge Function to send nicely-styled HTML emails containing session dates, locations, and directions.

### Phase 3: Public Routing & Authentication Client Views
1. Build `/login` and `/signup` UI flows adhering to the styling guide.
2. Hook up auth state listeners in React (`supabase.auth.onAuthStateChange`).
3. Set up Top-Left Toast system (`react-hot-toast` or custom styled wrapper).
4. Implement a custom route guard component (`ProtectedRoute`) to check user role & account status (blocks banned users).

### Phase 4: Client Dashboard (`/dashboard/*`)
1. Create `/dashboard` landing showing:
   - Next session schedule countdown.
   - Status indicators (e.g., "Pending Approval").
2. Create `/dashboard/bookings`:
   - Table of bookings with search.
   - Cancellation triggers (opens confirmation modal, calls DB update).
3. Create `/dashboard/profile`:
   - Form to edit basic user info (phone, name).

### Phase 5: Admin Dashboard Layout & Features (`/admin/*`)
1. Create sidebar navigation layout tailored with Forest Green headers and minimal border treatments.
2. Build `/admin/dashboard` metrics display:
   - **Session Occupancy Rate** (total booked slots / total available slots).
   - **Projected Revenue** (accumulated cost of confirmed sessions).
   - **Popular Categories** (bar chart showing bookings by type).
   - **Banned/Active client ratios**.
3. Build `/admin/sessions` CRUD:
   - Form to add new sessions with slot limits, datetime pickers, type selections, locations, and pricing fields.
   - Option to cancel a session slot (triggers cancellations of all user bookings for that session with reason input).
4. Build `/admin/bookings` listing:
   - Easy action tabs (Approve, Reject, Cancel) updating bookings table.
5. Build `/admin/clients` list:
   - Ban user toggle (updates profile status to `banned`).
   - Audit view displaying `user_login_history` log for selected users.

---

## 8. Verification & QA Plan
- **Auth Guard Test:** Attempt to access `/admin/*` as a standard `client` or `user` to ensure redirect occurs.
- **Banned State Test:** Log in as a banned user and verify they receive a top-left toast alert and cannot view dashboards.
- **Role Progression Test:** Sign up a new user (verify role = `user`), make a booking (verify role = `client`), cancel the booking (verify role reverts to `user`).
- **Edge Cases:** Booking a session that has reached `max_slots` should reject the booking request immediately.
