-- Phase 2: categories, session_types, and sessions taxonomy / availability

create table public.categories (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  slug text not null unique,
  sort_order integer default 0 not null,
  is_active boolean default true not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

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

create index session_types_category_id_idx on public.session_types (category_id);

alter table public.sessions
  add column session_type_id uuid references public.session_types(id) on delete set null,
  add column recurrence_rules jsonb;

create index sessions_session_type_id_idx on public.sessions (session_type_id);

comment on column public.sessions.type is 'Legacy display label; prefer session_type_id for new rows.';
comment on column public.sessions.recurrence_rules is 'JSONB availability/recurrence config for recurring session slots.';

-- RLS: categories
alter table public.categories enable row level security;

create policy "Anyone can view active categories"
  on public.categories for select
  using (is_active = true);

create policy "Admins can manage categories"
  on public.categories for all
  using (public.is_admin())
  with check (public.is_admin());

-- RLS: session_types
alter table public.session_types enable row level security;

create policy "Anyone can view active session types"
  on public.session_types for select
  using (
    is_active = true
    and exists (
      select 1
      from public.categories c
      where c.id = session_types.category_id
        and c.is_active = true
    )
  );

create policy "Admins can manage session types"
  on public.session_types for all
  using (public.is_admin())
  with check (public.is_admin());

-- Seed default taxonomy (matches landing-page mock session groupings)
insert into public.categories (name, slug, sort_order) values
  ('Tax Planning', 'tax-planning', 1),
  ('Audit & Compliance', 'audit-compliance', 2),
  ('Payroll & MPF', 'payroll-mpf', 3),
  ('Advisory', 'advisory', 4);

insert into public.session_types (category_id, name, description, default_duration_minutes, default_price)
select c.id, c.name, null, 60, 0.00
from public.categories c
where c.slug in ('tax-planning', 'audit-compliance', 'payroll-mpf', 'advisory');

-- Backfill legacy sessions.type text from session_type name when possible
update public.sessions s
set session_type_id = st.id
from public.session_types st
where s.session_type_id is null
  and lower(trim(s.type)) = lower(trim(st.name));

update public.sessions s
set session_type_id = st.id
from public.session_types st
join public.categories c on c.id = st.category_id
where s.session_type_id is null
  and lower(trim(s.type)) = lower(replace(c.slug, '-', ' '));
