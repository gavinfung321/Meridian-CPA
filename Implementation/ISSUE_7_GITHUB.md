# GitHub Issue #7 — Create manually (gh CLI not available in agent shell)

Post this at: https://github.com/gavinfung321/Meridian-CPA/issues/new

**Title:** `Enhancement: Client portal dashboard UX overhaul`

**Labels:** `enhancement`, `feature`, `design`

**Milestone:** `v1.0 - Foundation & Setup`

---

## Summary

Elevate the client portal (`/dashboard`, `/dashboard/bookings`) to match admin dashboard polish: greeting, metric cards, notification bell, activity feed, hybrid in-portal booking widget, filters, pagination, and booking detail modal.

## Context

See [IMPLEMENTATION_USER.md](./Implementation/IMPLEMENTATION_USER.md) for full spec and locked product decisions (book first / profile nudge, bell + activity, hybrid booking).

Parent: [IMPLEMENTATION_PLAN_BOOKING.md](./Implementation/IMPLEMENTATION_PLAN_BOOKING.md) Phase 3 client items.

## Acceptance Criteria

- [ ] `/dashboard` — greeting, summary, metric cards, attention banners, next session, upcoming list, activity feed (All | You | Firm)
- [ ] `/dashboard` — available sessions widget + `#available-sessions` anchor from header CTA
- [ ] `ClientNotificationBell` in client portal header with realtime refresh
- [ ] `/dashboard/bookings` — status filters, search, pagination, row click + detail modal, cancel flow
- [ ] RLS migration: clients can read own `booking_history`
- [ ] `npm run build` passes

## Notes

- Branch: `feat/issue-7-client-dashboard-portal`
- Commits: `[#7] …`

**Starting comment:**

> Starting work on this: implementing client dashboard data layer, notification bell, overview refresh, available sessions widget, and bookings page polish per IMPLEMENTATION_USER.md.

**Closing comment (when done):**

> Completed client portal dashboard overhaul on `feat/issue-7-client-dashboard-portal`. Delivered ClientNotificationBell, client-dashboard.ts, DashboardOverview refresh, AvailableSessionsSection, DashboardBookings filters/pagination/detail modal, and booking_history RLS for clients. See IMPLEMENTATION_USER.md QA checklist for manual verification.
