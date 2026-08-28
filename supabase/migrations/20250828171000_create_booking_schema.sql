create type public.booking_status as enum ('pending', 'confirmed', 'cancelled', 'rejected');

create table public.sessions (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  type text not null,
  location text not null,
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

create table public.bookings (
  id uuid default gen_random_uuid() primary key,
  session_id uuid references public.sessions(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  status public.booking_status default 'pending'::public.booking_status not null,
  cancel_reason text,
  cancelled_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.user_login_history (
  id bigint generated always as identity primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  login_time timestamp with time zone default timezone('utc'::text, now()) not null,
  ip_address text,
  user_agent text
);

create table public.session_history (
  id bigint generated always as identity primary key,
  session_id uuid not null,
  changed_by uuid references public.profiles(id) on delete set null,
  action text not null,
  old_data jsonb,
  new_data jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.booking_history (
  id bigint generated always as identity primary key,
  booking_id uuid not null,
  changed_by uuid references public.profiles(id) on delete set null,
  action text not null,
  old_status public.booking_status,
  new_status public.booking_status,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create or replace function public.update_user_role_on_booking()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  booking_count int;
  target_user_id uuid;
begin
  if TG_OP = 'INSERT' then
    target_user_id := new.user_id;
  elsif TG_OP = 'UPDATE' or TG_OP = 'DELETE' then
    target_user_id := old.user_id;
  end if;

  select count(*) into booking_count
  from public.bookings
  where user_id = target_user_id and status in ('confirmed', 'pending');

  if booking_count > 0 then
    update public.profiles
    set role = 'client'::public.user_role
    where id = target_user_id and role = 'user'::public.user_role;
  else
    update public.profiles
    set role = 'user'::public.user_role
    where id = target_user_id and role = 'client'::public.user_role;
  end if;

  return null;
end;
$$;

create trigger on_booking_change
  after insert or update or delete on public.bookings
  for each row execute function public.update_user_role_on_booking();

-- Sessions RLS
alter table public.sessions enable row level security;

create policy "Anyone can view active sessions"
  on public.sessions for select
  using (is_cancelled = false);

create policy "Admins can manage sessions"
  on public.sessions for all
  using (public.is_admin())
  with check (public.is_admin());

-- Bookings RLS
alter table public.bookings enable row level security;

create policy "Users can view own bookings"
  on public.bookings for select
  using (auth.uid() = user_id);

create policy "Admins can view all bookings"
  on public.bookings for select
  using (public.is_admin());

create policy "Users can create own bookings"
  on public.bookings for insert
  with check (auth.uid() = user_id);

create policy "Users can update own bookings"
  on public.bookings for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Admins can manage all bookings"
  on public.bookings for all
  using (public.is_admin())
  with check (public.is_admin());

-- Audit log RLS (admin read-only for now)
alter table public.user_login_history enable row level security;
alter table public.session_history enable row level security;
alter table public.booking_history enable row level security;

create policy "Admins can view login history"
  on public.user_login_history for select
  using (public.is_admin());

create policy "Admins can view session history"
  on public.session_history for select
  using (public.is_admin());

create policy "Admins can view booking history"
  on public.booking_history for select
  using (public.is_admin());
