-- Firm-wide settings (key-value JSON)
create table public.app_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_by uuid references public.profiles(id) on delete set null
);

insert into public.app_settings (key, value)
values ('booking', jsonb_build_object('max_booking_days_advance', 90))
on conflict (key) do nothing;

alter table public.app_settings enable row level security;

-- Landing + portal need booking window for session filtering
create policy "Anyone can read booking settings"
  on public.app_settings for select
  using (key = 'booking');

create policy "Admins can read all app settings"
  on public.app_settings for select
  to authenticated
  using (public.is_admin());

create policy "Admins can update app settings"
  on public.app_settings for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins can insert app settings"
  on public.app_settings for insert
  to authenticated
  with check (public.is_admin());
