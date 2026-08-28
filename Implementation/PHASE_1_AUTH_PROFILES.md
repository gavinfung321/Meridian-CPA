# Phase 1: Database, Auth & Dashboard Mockups

## Overview
Establish the full Supabase schema first, then wire up signup/login, and build **mock** admin and user dashboards to test authentication and role-based routing. Admin users are promoted manually in Supabase — not via app UI.

## 1. Supabase Setup (All Tables)
- [x] Install `@supabase/supabase-js` and create `src/lib/supabase.ts`
- [x] Verify `.env` keys (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`)
- [x] Migration: `profiles` table, enums, signup trigger, RLS
- [x] Migration: remaining tables from `IMPLEMENTATION_PLAN_BOOKING.md`:
  - `sessions`, `bookings`
  - `user_login_history`, `session_history`, `booking_history`
  - Booking role-promotion trigger
  - RLS policies for all tables

## 2. Authentication
- [x] `AuthContext` — session + profile state
- [x] `/login` — email/password sign in with role-based redirect
- [x] `/signup` — email/password registration (creates profile with `user` role)
- [x] `ProtectedRoute` — role-based guards

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
- [x] `/dashboard/profile` — edit name/phone (live Supabase update)

### Admin Dashboard (`/admin/*`) — role: `admin`
- [x] `/admin/dashboard` — mock metrics (occupancy, revenue, clients)
- [x] `/admin/sessions` — mock sessions table
- [x] `/admin/bookings` — mock bookings table with status badges
- [x] `/admin/clients` — mock clients list with role/status badges
- [x] `/admin/settings` — mock settings placeholder

## 5. Role Routing Rules
| Role    | Login redirect     | Can access        |
|---------|--------------------|-------------------|
| `user`  | `/dashboard`       | User dashboard    |
| `client`| `/dashboard`       | User dashboard    |
| `admin` | `/admin/dashboard` | Admin dashboard   |

## 6. Verification Checklist
- [ ] Sign up → profile created with `role = user`
- [ ] Sign in as user → lands on `/dashboard`
- [ ] Manually set `role = admin` → sign in → lands on `/admin/dashboard`
- [ ] User cannot access `/admin/*` (redirected)
- [ ] Admin cannot access `/dashboard/*` (redirected to admin)
- [ ] Banned user sees suspension screen

***

**Status**: Ready for QA  
**Assigned Issue**: [#3](https://github.com/gavinfung321/Meridian-CPA/issues/3)
