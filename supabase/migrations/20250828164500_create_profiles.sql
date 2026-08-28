create type public.user_role as enum ('admin', 'client', 'user');
create type public.user_status as enum ('active', 'banned');

create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  updated_at timestamp with time zone,
  full_name text not null,
  email text not null,
  phone text,
  role public.user_role default 'user'::public.user_role not null,
  status public.user_status default 'active'::public.user_status not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email, role, status)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', 'New User'),
    coalesce(new.email, ''),
    'user'::public.user_role,
    'active'::public.user_status
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid() and role = 'admin'::public.user_role
  );
$$;

alter table public.profiles enable row level security;

create policy "Active profiles are viewable by everyone"
  on public.profiles for select
  using (status = 'active'::public.user_status);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "Admins can view all profiles"
  on public.profiles for select
  using (public.is_admin());

create policy "Admins can update all profiles"
  on public.profiles for update
  using (public.is_admin());
