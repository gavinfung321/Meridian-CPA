# Phase 1: Database, Auth & Dashboard Mockups

## Overview
Establish the full Supabase schema first, then wire up signup/login, and build **mock** admin and user dashboards to test authentication and role-based routing. Admin users are promoted manually in Supabase — not via app UI.

> **Status: ✅ Complete** — merged to `main` (Aug 2026).  
> **Issues:** [#3](https://github.com/gavinfung321/Meridian-CPA/issues/3) (closed), [#4](https://github.com/gavinfung321/Meridian-CPA/issues/4) (closed)  
> **Parent plan:** [IMPLEMENTATION_PLAN_BOOKING.md](./IMPLEMENTATION_PLAN_BOOKING.md) — Phase 1 marked complete; Phases 2–5 pending.

### Key commits on `main`
| Commit | Summary |
|--------|---------|
| `e5f4cba` | Initialize Supabase for GitHub integration |
| `f28d70e` | Supabase auth, full schema, mock role-based dashboards |
| `d6729a9` | Password reset, first/last name, not-authorized page |
| `1f47107` | Profile pictures, profile pages, logout fixes, admin profile nav |
| `fcc87cc` | Profile contact/address fields ([#4](https://github.com/gavinfung321/Meridian-CPA/issues/4)) |

### Applied migrations
| Migration | Purpose |
|-----------|---------|
| `20250828164500_create_profiles.sql` | Profiles, enums, signup trigger, base RLS |
| `20250828171000_create_booking_schema.sql` | Sessions, bookings, audit logs, booking role trigger |
| `20250828174000_add_profile_name_fields.sql` | `first_name`, `last_name` |
| `20250828180000_profile_pictures_storage.sql` | `avatar_path`, storage bucket + RLS |
| `20250828182000_add_profile_contact_address_fields.sql` | Contact/address columns |

---
## 1. Supabase Setup (All Tables)
- [x] Install `@supabase/supabase-js` and create `src/lib/supabase.ts`
- [x] Verify `.env` keys (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`)
- [x] Migration: `profiles` table, enums, signup trigger, RLS
- [x] Migration: remaining tables from `IMPLEMENTATION_PLAN_BOOKING.md`
- [x] Migration: `first_name` / `last_name` on profiles (keep `full_name` for display)
- [x] Migration: `profile-pictures` storage bucket + `avatar_path` on profiles
- [x] Migration: contact + address fields on profiles (`phone_prefix`, `phone_number`, address lines, city, county, post_code, country) — [#4](https://github.com/gavinfung321/Meridian-CPA/issues/4)

## 2. Authentication
- [x] `AuthContext` — session + profile state
- [x] `/login` — email/password sign in with role-based redirect + **Forgot password?** link
- [x] `/signup` — first name + last name, email, password (creates profile with `user` role)
- [x] `/forgot-password` — send reset email via Supabase Auth
- [x] `/reset-password` — set new password from email link
- [x] Header Login link on public pages (logged out)
- [x] Header profile avatar menu on homepage (logged in) — Profile, role-based Dashboard/Admin link, Log out
- [x] `ProtectedRoute` — role-based guards; non-admins hitting `/admin/*` see `/not-authorized`
- [x] **Log out** — calls `signOut()` via Supabase Auth; redirect depends on context (see below)

### Log out behavior (design decision)
Log out must **clear the Supabase session** before any redirect. A plain `<Navigate to="/login" />` leaves the user signed in; the login page then detects an active session and sends them back to `/dashboard`.

**Where to send the user after logout:**

| Context | After logout | Why |
|---------|--------------|-----|
| **Public pages** (homepage, About Us) | **Stay on the current page** | Standard for marketing sites — the page is public; the header swaps avatar → Login. No need to force sign-in again. |
| **Protected areas** (dashboard, admin) | **Redirect to `/login`** | User was inside the app; login is the natural re-entry point. Handled by `ProtectedRoute` once session clears. |
| **`/logout` URL** (direct link) | **Homepage `/`** | Safe default landing page for bookmarked or shared logout links. |

Implementation:
- **Profile menu (public header)** — button calls `signOut()` only; React re-renders header to logged-out state
- **`/logout` route** — `Logout` component runs `signOut()` on mount, then redirects to `/`
- **Dashboard/Admin sidebar** — `signOut()` button; `ProtectedRoute` redirects to `/login` when session clears

## 7. Profile Page (All Roles)
- [x] `/profile` — unified profile page for `user`, `client`, and `admin`
- [x] Edit first name, last name, phone prefix/number, and address fields (live Supabase update)
- [x] Read-only email, role, and status badges
- [x] Homepage header: avatar dropdown with user **name + email**, then **Profile**, role-based **Dashboard** (`user`/`client`) or **Admin** (`admin`), and **Log out**

### Profile page header (design decision)
**Yes — show avatar + name at the top of the profile page**, beside or directly under the page title.

Why this layout works better:
- Confirms the signed-in identity before editing details
- Matches the homepage avatar dropdown (consistent mental model)
- Keeps photo upload actions visible without burying them in the form
- Separates **identity** (photo, name, email, badges) from **editable fields** (form below)

Layout pattern (shared `ProfileIdentityHeader` component):
```
[Avatar + camera]   Profile          ← page title (dashboard layout)
                    Test User        ← display name
                    test@email.com
                    [role] [status]
                    [Change photo] [Remove photo]
────────────────────────────────────
[Profile details form card]
```

- `/profile` (standalone): name is the primary heading; avatar block sits above the form
- `/dashboard/profile`: **Profile** title + name/email below, avatar on the left — same component, `showPageTitle` variant
- `/admin/profile`: same as dashboard profile, inside admin sidebar shell

### Sidebar Profile nav (design decision)
**Yes — admin sidebar should include Profile**, matching the client portal.

Why:
- Admins edit their own account details and photo too
- Consistent nav pattern across both portals (Overview → … → **Profile** → Settings)
- Keeps admins inside the admin shell instead of jumping to standalone `/profile`

Nav order:
- **Client portal:** Overview, Bookings, Profile
- **Admin console:** Overview, Sessions, Bookings, Clients, Profile, Settings

Homepage avatar menu still links to `/profile` (works for all roles). In-dashboard links use `/dashboard/profile` or `/admin/profile` to preserve sidebar context.

### Sidebar footer display name
The bottom-left sidebar footer must show the user's **display name** (`first_name` + `last_name`), not the raw `full_name` column alone.

Why: accounts created before first/last name fields, or promoted manually in Supabase, may still have `full_name = 'New User'` even after the profile form shows the correct name. Use `getDisplayName(first_name, last_name, full_name)` everywhere — sidebar footer, profile header, and avatar menu.

### Profile table fields (`profiles`)
| Field | Type | Notes |
|-------|------|-------|
| `first_name`, `last_name` | text | Required; collected at signup |
| `full_name` | text | Denormalized display name |
| `email` | text | From auth; read-only in UI |
| `phone_prefix` | text | e.g. `+852` |
| `phone_number` | text | National number without prefix |
| `address_line1`, `address_line2` | text | Street address |
| `city`, `county` | text | Locality / region |
| `post_code`, `country` | text | Postal code and country |
| `avatar_path` | text | Supabase Storage object path |
| `role`, `status` | enum | `user` / `client` / `admin`; `active` / `banned` |

Legacy single `phone` column replaced by `phone_prefix` + `phone_number` in migration `20250828182000_add_profile_contact_address_fields.sql`.

### Profile pictures (Supabase Storage)
- [x] `profile-pictures` private storage bucket
- [x] `profiles.avatar_path` column stores object path (`{user_id}/avatar.{ext}`)
- [x] Storage RLS: users can upload/view/delete **own** picture only
- [x] Storage RLS: **admins** can view all profile pictures
- [x] Profile page: upload, change, and remove profile picture (max 2 MB)

### Profile page checklist
> Implementation complete. Items below verified during Phase 1 development; re-run before major releases.

- [x] Signed-in user opens avatar menu on homepage → sees name, email, Profile, Dashboard (user/client) or Admin (admin), and Log out
- [x] Profile menu links to `/profile`
- [x] `/profile` loads for `user`, `client`, and `admin` roles
- [x] Profile page shows avatar, name, and email **above the form** (not only in sidebar)
- [x] `/dashboard/profile` uses the same identity header as `/profile`
- [x] `/admin/profile` appears in admin sidebar and uses the same profile form
- [x] User can upload a profile picture on `/profile`
- [x] Uploaded picture appears in header avatar menu after refresh
- [x] User can remove their profile picture
- [x] Avatar shows initials when no profile picture is set
- [x] User cannot access another user's profile picture URL (private bucket)
- [ ] Admin can view any user's profile picture (for future admin client views) — *RLS in place; admin client UI not built yet*
- [x] Profile form saves first name, last name, phone prefix/number, and address fields
- [x] Log out from homepage dropdown clears session and **stays on homepage** (header shows Login, not avatar)
- [x] Sidebar footer shows display name (e.g. "Gavin Fung"), not stale `full_name` like "New User"

### Name fields decision
Use **first name + last name** in forms instead of a single full-name field. Benefits:
- Better UX (matches common signup patterns)
- Personalized greetings (`Welcome back, Kenji`)
- Easier admin client lists and future exports

`full_name` remains in the database as a denormalized display field built from first + last.

### Password reset setup (Supabase dashboard)
Add these to **Authentication → URL Configuration → Redirect URLs**:
- [x] `http://localhost:5173/reset-password`
- [ ] Your production domain `/reset-password` when deployed

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
- [x] `/dashboard/profile` — profile form inside client portal sidebar

### Admin Dashboard (`/admin/*`) — role: `admin`
- [x] `/admin/dashboard` — mock metrics (occupancy, revenue, clients)
- [x] `/admin/sessions` — mock sessions table
- [x] `/admin/bookings` — mock bookings table with status badges
- [x] `/admin/clients` — mock clients list with role/status badges
- [x] `/admin/profile` — profile form with avatar upload (same as client portal)
- [x] `/admin/settings` — mock settings placeholder

## 5. Role Routing Rules
| Role    | Login redirect     | Can access        | `/admin/*` attempt        |
|---------|--------------------|-------------------|---------------------------|
| `user`  | `/dashboard`       | User dashboard    | `/not-authorized` page    |
| `client`| `/dashboard`       | User dashboard    | `/not-authorized` page    |
| `admin` | `/admin/dashboard` | Admin dashboard   | Allowed                   |

Non-admin users who visit any `/admin/*` route are shown the **Not authorized** page (`/not-authorized`) with a link back to their dashboard. Admins who visit `/dashboard/*` are redirected to `/admin/dashboard`.

## 6. Verification Checklist
> Core flows verified during Phase 1. Re-run before Phase 2 kickoff or production deploy.

- [x] Sign up → profile created with `role = user`, first/last name stored
- [x] Sign in as user → lands on `/dashboard`
- [x] Forgot password → email received → reset link works
- [x] Manually set `role = admin` → sign in → lands on `/admin/dashboard`
- [x] User/client visiting `/admin/*` sees **Not authorized** page (not admin content)
- [x] Admin cannot access `/dashboard/*` (redirected to admin)
- [x] Banned user sees suspension screen

## 8. Key implementation files (reference)
| Area | Files |
|------|-------|
| Auth | `src/contexts/AuthContext.tsx`, `src/components/ProtectedRoute.tsx`, `src/lib/auth-routes.ts` |
| Profile UI | `src/components/ProfilePageContent.tsx`, `ProfileIdentityHeader.tsx`, `ProfileMenu.tsx`, `ProfileAvatar.tsx` |
| Profile storage | `src/lib/profile-avatar.ts`, `src/hooks/useProfileAvatarUrl.ts` |
| Layouts | `src/components/DashboardLayout.tsx`, `src/components/AdminLayout.tsx` |
| Routes | `src/App.tsx` |
| Types | `src/types/database.ts` |

## 9. Out of scope (Phase 2+)
- Real session/booking CRUD (mock dashboard data remains)
- Supabase Edge Functions + email notifications (Resend/SendGrid)
- Top-left toast system (`react-hot-toast` or custom)
- Admin client management actions (promote, ban, audit logs UI)
- `/admin/reporting`, `/admin/sessions/new`, `/admin/sessions/edit/:id`

---

**Status**: ✅ **Complete** (Aug 2026)  
**Assigned Issues**: [#3](https://github.com/gavinfung321/Meridian-CPA/issues/3) (closed), [#4](https://github.com/gavinfung321/Meridian-CPA/issues/4) (closed)  
**Next**: Phase 2 — Edge Functions & email routing ([IMPLEMENTATION_PLAN_BOOKING.md](./IMPLEMENTATION_PLAN_BOOKING.md))
