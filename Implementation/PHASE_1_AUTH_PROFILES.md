# Phase 1: Database, Auth & Dashboard Mockups

## Overview
Establish the full Supabase schema first, then wire up signup/login, and build **mock** admin and user dashboards to test authentication and role-based routing. Admin users are promoted manually in Supabase — not via app UI.

## 1. Supabase Setup (All Tables)
- [x] Install `@supabase/supabase-js` and create `src/lib/supabase.ts`
- [x] Verify `.env` keys (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`)
- [x] Migration: `profiles` table, enums, signup trigger, RLS
- [x] Migration: remaining tables from `IMPLEMENTATION_PLAN_BOOKING.md`
- [x] Migration: `first_name` / `last_name` on profiles (keep `full_name` for display)

## 2. Authentication
- [x] `AuthContext` — session + profile state
- [x] `/login` — email/password sign in with role-based redirect + **Forgot password?** link
- [x] `/signup` — first name + last name, email, password (creates profile with `user` role)
- [x] `/forgot-password` — send reset email via Supabase Auth
- [x] `/reset-password` — set new password from email link
- [x] Header Login / Dashboard link on public pages
- [x] `ProtectedRoute` — role-based guards; non-admins hitting `/admin/*` see `/not-authorized`

### Name fields decision
Use **first name + last name** in forms instead of a single full-name field. Benefits:
- Better UX (matches common signup patterns)
- Personalized greetings (`Welcome back, Kenji`)
- Easier admin client lists and future exports

`full_name` remains in the database as a denormalized display field built from first + last.

### Password reset setup (Supabase dashboard)
Add these to **Authentication → URL Configuration → Redirect URLs**:
- `http://localhost:5173/reset-password`
- Your production domain `/reset-password` when deployed

## 3. Admin User (Manual Setup)
After tables exist, promote an admin in the Supabase dashboard:

1. Sign up via the app (or create a user under **Authentication → Users**)
2. Open **Table Editor → profiles**
3. Find the user row and set `role` to `admin`
4. Sign in — you should land on `/admin/dashboard`

## 4. Mock Dashboards (UI Only)
Build layout shells with placeholder content to verify routing and roles. No real CRUD yet.

### User Dashboard (`/dashboard/*`) — roles: `user`, `client`
- [x] `/dashboard` — overview with role badge and placeholder stats
- [x] `/dashboard/bookings` — mock bookings table
- [x] `/dashboard/profile` — edit first/last name + phone (live Supabase update)

### Admin Dashboard (`/admin/*`) — role: `admin`
- [x] `/admin/dashboard` — mock metrics (occupancy, revenue, clients)
- [x] `/admin/sessions` — mock sessions table
- [x] `/admin/bookings` — mock bookings table with status badges
- [x] `/admin/clients` — mock clients list with role/status badges
- [x] `/admin/settings` — mock settings placeholder

## 5. Role Routing Rules
| Role    | Login redirect     | Can access        | `/admin/*` attempt        |
|---------|--------------------|-------------------|---------------------------|
| `user`  | `/dashboard`       | User dashboard    | `/not-authorized` page    |
| `client`| `/dashboard`       | User dashboard    | `/not-authorized` page    |
| `admin` | `/admin/dashboard` | Admin dashboard   | Allowed                   |

Non-admin users who visit any `/admin/*` route are shown the **Not authorized** page (`/not-authorized`) with a link back to their dashboard. Admins who visit `/dashboard/*` are redirected to `/admin/dashboard`.

## 6. Verification Checklist
- [ ] Sign up → profile created with `role = user`, first/last name stored
- [ ] Sign in as user → lands on `/dashboard`
- [ ] Forgot password → email received → reset link works
- [ ] Manually set `role = admin` → sign in → lands on `/admin/dashboard`
- [ ] User/client visiting `/admin/*` sees **Not authorized** page (not admin content)
- [ ] Admin cannot access `/dashboard/*` (redirected to admin)
- [ ] Banned user sees suspension screen

***

**Status**: Ready for QA  
**Assigned Issue**: [#3](https://github.com/gavinfung321/Meridian-CPA/issues/3)
