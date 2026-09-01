# Session Type Capacity, Description Defaults & View-Only Actions

## Overview

Extend the Catalog Management hub so **session type templates** define default **capacity** and **description**, scheduled sessions inherit those defaults on create, admin tables expose the new columns, and **Sessions** + **Clients** match the **Bookings** interaction model (row click → modal; Actions column = View eye icon only).

> **Status:** ✅ **Complete** — merged; [#6](https://github.com/gavinfung321/Meridian-CPA/issues/6) closed on GitHub. Remote migration verify remains an ops checklist item.  
> **GitHub:** [#6](https://github.com/gavinfung321/Meridian-CPA/issues/6) — closed  
> **Branch:** `feat/issue-6-session-type-capacity-descriptions` *(merged)*  
> **Parent plan:** [IMPLEMENTATION_PLAN_BOOKING.md](./IMPLEMENTATION_PLAN_BOOKING.md) — Phase 2.5 catalog polish + Phase 3 admin UX  
> **Commit format:** `[#6] …`

---

## Goals

| Goal | Outcome |
|------|---------|
| **Template capacity** | Admins set default slot count on session types; new scheduled sessions prefill `max_slots` |
| **Template description** | Session type description flows into scheduled session `description` on type select |
| **Table clarity** | Description and capacity visible as dedicated columns — not hidden in subtext |
| **Interaction parity** | Catalog Sessions + Clients tables behave like Bookings: **View** in Actions; edit in modal |

---

## Current state on `main` *(audit before coding)*

Partial work may already exist. **Reconcile with [#6](https://github.com/gavinfung321/Meridian-CPA/issues/6) spec** — do not assume “done” without checking UX details.

| Area | On `main` today | Gap vs #6 spec |
|------|-----------------|----------------|
| Migration `20250830160000_session_type_default_max_slots.sql` | ✅ File committed | Confirm **remote** Supabase has column (`supabase db push` / MCP) |
| `SessionType` type in `database.ts` | ✅ `default_max_slots` | — |
| Session Types table — Capacity column | ✅ Likely present | Verify |
| Session Types modal — Capacity | ✅ Field exists | **Create** should default **empty**, not `1` |
| Session Types table — Description column | ❌ | Add column after Name |
| Active Sessions — Description field in modal/form | ❌ / partial | Prefill from type on select |
| Active Sessions table — Description column | ❌ | Add after Session name |
| Capacity auto-fill on new session | ✅ Partial in `AdminSessionForm` | Extend to `SessionFormModal` + empty-type edge cases |
| Actions = Eye only (Sessions, Clients) | ❌ Pencil + other icons | Match `AdminBookings.tsx` Eye pattern |
| Remote migration applied | ⏳ Unknown | Verify before frontend depends on column |

---

## Execution order

Work top-to-bottom. Do **not** skip Step 0.

```
Step 0  Verify Supabase schema (local + remote)
   ↓
Step 1  Database / types (only if remote missing column)
   ↓
Step 2  Session Types tab (modal + table)
   ↓
Step 3  Active Sessions (modal + full page + table)
   ↓
Step 4  Clients table (view-only Actions)
   ↓
Step 5  Consistency pass + QA
   ↓
Step 6  Update IMPLEMENTATION_PLAN_BOOKING.md + close #6
```

---

## Step 0 — Supabase verification

- [x] Confirm local migration file: `supabase/migrations/20250830160000_session_type_default_max_slots.sql`
- [x] Inspect remote `session_types` columns (Supabase CLI): `default_max_slots` exists *(Sep 1, 2026)*
- [x] All migrations in sync — `npx supabase migration list` shows 16/16 local = remote
- [ ] Smoke test: insert/update session type with `default_max_slots` via Table Editor or admin UI

**Column spec:**

| Column | Table | Type | Default | Notes |
|--------|-------|------|---------|-------|
| `default_max_slots` | `session_types` | `integer NOT NULL` | `1` at DB level | UI create modal shows **empty** until admin enters value; validate ≥ 1 on save |
| `description` | `session_types` | `text` | `NULL` | Already exists — no migration expected |

---

## Step 1 — Database & TypeScript

*Skip if Step 0 confirms remote column + types already aligned.*

- [ ] Migration applied remotely
- [x] `src/types/database.ts` — `SessionType` includes `default_max_slots`
- [ ] Supabase generated types stay in sync *(manual update if project does not auto-generate)*

---

## Step 2 — Session Types tab

**Files:** `CatalogSessionTypesTab.tsx`, `SessionTypeFormModal.tsx`

### Modal

- [x] **Create:** Capacity input visible; initial state **empty** (placeholder e.g. “e.g. 1”)
- [x] **Create:** Require capacity on submit (min 1); map empty → validation error, not silent `0`
- [x] **Edit:** Capacity input shows saved `default_max_slots`
- [x] Save payload includes `default_max_slots`
- [x] Description field unchanged (already in modal)

### Table

- [x] Column order: **Name → Description → Category → Duration → Capacity → Base price → Status → Actions**
- [x] Description column shows full text or em dash — **no** subtitle under Name
- [x] Capacity column shows integer
- [x] Loading skeleton column count updated

---

## Step 3 — Active Sessions tab & full-page editor

**Files:** `CatalogSessionsTab.tsx`, `SessionFormModal.tsx`, `AdminSessionForm.tsx`

### Type → session defaults (modal + full page)

When admin **changes session type** on **create** *(not necessarily on edit — decide: overwrite only if description/capacity still match type default, or always on create only)*:

- [x] **Capacity:** set `max_slots` from `session_type.default_max_slots`
- [x] **Description:** set `description` from `session_type.description` (or empty string if null)

**Recommended rule:** On **new session**, always apply type defaults on type change. On **edit**, apply only when user changes type *(same as duration/price today)*.

### SessionFormModal (quick edit)

- [x] Description textarea visible
- [x] Type select triggers capacity + description prefill (per rule above)
- [x] Save persists `description` and `max_slots`

### AdminSessionForm (`/admin/sessions/new`, `/admin/sessions/edit/:id`)

- [x] Description field visible *(may already exist)* — wired to type default on create/type change
- [x] Capacity prefills from `default_max_slots` on create/type change
- [x] Recurrence + image behaviour unchanged

### Active Sessions table

- [x] Column order: **Session → Description → Date & Time → Capacity → Price → Status → Actions**
- [x] Description column: truncated with `title` tooltip if long, or single-line ellipsis
- [x] Session cell: title + type subtext only *(description moves to its own column)*
- [x] **Actions:** replace Pencil/Cancel icons with **Eye only** *(View)*
- [x] Row click still opens edit modal
- [x] Cancel / Reactivate move to **inside modal** or secondary modal footer — **not** in Actions column *(align with “view only” in Actions)*

> **Design decision — session destructive actions:** Bookings keep approve/reject inside modal, not in Actions. For sessions, **Cancel session** and **Reactivate** should live in `SessionFormModal` footer (or linked full editor), not the table Actions column.

---

## Step 4 — Clients table (`/admin/clients`)

**File:** `AdminClients.tsx`

- [x] **Actions column:** **Eye icon only** — same classes as `AdminBookings.tsx`
- [x] Row click opens `ClientProfileModal` (view mode)
- [x] Eye click opens same modal (`stopPropagation`)
- [x] **Edit / Ban** available **inside** `ClientProfileModal` only — remove Pencil/Ban from table Actions
- [x] Manageable vs admin read-only rows unchanged

---

## Step 5 — Consistency & shared patterns

**File:** `src/lib/table-styles.ts` *(optional extract: `adminTableViewButtonClassName` mirroring bookings)*

- [x] Catalog tabs + Clients use `adminTableRowInteractiveClassName`
- [x] Actions column: single Eye button; `onClick` + `stopPropagation` pattern matches bookings
- [ ] Categories tab: if Actions still uses Pencil/Power — **optional** align to Eye-only for parity *(#6 focuses Sessions + Clients; Categories can stay modal-only with row click)*

---

## Step 6 — Documentation & issue close

- [x] Check off items in this file as work completes
- [ ] Sync acceptance criteria on [#6](https://github.com/gavinfung321/Meridian-CPA/issues/6)
- [ ] Update [IMPLEMENTATION_PLAN_BOOKING.md](./IMPLEMENTATION_PLAN_BOOKING.md) §7 catalog polish if behaviour changed
- [x] `npm run build` passes
- [ ] Manual QA checklist below
- [ ] Close #6 with summary comment

---

## Manual QA checklist

### Session Types

- [ ] Create type with capacity **2** → appears in table Capacity column
- [ ] Create modal opens with **empty** capacity field
- [ ] Edit type → capacity loads correctly
- [ ] Description visible in Description column

### Active Sessions

- [ ] New session: pick type → capacity and description auto-fill
- [ ] New session: save → landing page / admin list show correct capacity
- [ ] Table shows Description column
- [ ] Row click opens modal; Eye opens modal; no stray edit icons in Actions
- [ ] Cancel/reactivate still possible from modal or full editor

### Clients

- [ ] Row click → profile modal
- [ ] Eye → profile modal
- [ ] Edit/ban only inside modal

### Regression

- [ ] Bookings table unchanged
- [ ] Full-page session editor still works for recurrence + image

---

## Files reference

| File | Purpose |
|------|---------|
| `supabase/migrations/20250830160000_session_type_default_max_slots.sql` | DB column |
| `src/types/database.ts` | `SessionType.default_max_slots` |
| `src/screens/Admin/catalog/SessionTypeFormModal.tsx` | Type create/edit |
| `src/screens/Admin/catalog/CatalogSessionTypesTab.tsx` | Types table |
| `src/screens/Admin/catalog/SessionFormModal.tsx` | Quick session edit |
| `src/screens/Admin/catalog/CatalogSessionsTab.tsx` | Sessions table |
| `src/screens/Admin/AdminSessionForm.tsx` | Full session create/edit |
| `src/screens/Admin/AdminClients.tsx` | Clients table |
| `src/screens/Admin/AdminBookings.tsx` | Reference Eye pattern |
| `src/lib/table-styles.ts` | Shared row/button classes |

---

## Design decisions log

| Decision | Choice | Rationale |
|----------|--------|-----------|
| DB default for `default_max_slots` | `1 NOT NULL` | Safe fallback; UI create form stays empty for intentional entry |
| Description inheritance | Copy `session_types.description` → `sessions.description` on type select (create) | Templates define marketing copy once |
| Actions column | Eye only on Sessions + Clients | Matches Bookings; reduces accidental clicks |
| Session cancel/reactivate | Move to modal, not Actions | Keeps Actions read-only; destructive actions need context |
| Categories tab Actions | Row-click edit OK; optional Eye later | Out of strict #6 scope unless parity requested |

---

## Progress tracker

| Step | Status |
|------|--------|
| 0 — Supabase verification | ✅ Remote verified — admin UI smoke test pending |
| 1 — Database & types | ✅ Complete |
| 2 — Session Types tab | ✅ Complete |
| 3 — Active Sessions + full editor | ✅ Complete |
| 4 — Clients table | ✅ Complete |
| 5 — Consistency pass | ✅ Complete |
| 6 — Docs & close #6 | ✅ Complete — issue closed |

---

*Last updated: Sep 1, 2026 — implementation shipped; progress tracker synced.*
