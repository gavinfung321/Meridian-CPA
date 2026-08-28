alter table public.profiles
  add column first_name text,
  add column last_name text;

update public.profiles
set
  first_name = coalesce(nullif(split_part(full_name, ' ', 1), ''), full_name),
  last_name = nullif(
    trim(substring(full_name from length(split_part(full_name, ' ', 1)) + 1)),
    ''
  )
where first_name is null;

alter table public.profiles
  alter column first_name set not null,
  alter column last_name set not null;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_first_name text;
  v_last_name text;
  v_full_name text;
begin
  v_first_name := coalesce(nullif(trim(new.raw_user_meta_data->>'first_name'), ''), 'New');
  v_last_name := coalesce(nullif(trim(new.raw_user_meta_data->>'last_name'), ''), 'User');
  v_full_name := trim(v_first_name || ' ' || v_last_name);

  insert into public.profiles (id, first_name, last_name, full_name, email, role, status)
  values (
    new.id,
    v_first_name,
    v_last_name,
    v_full_name,
    coalesce(new.email, ''),
    'user'::public.user_role,
    'active'::public.user_status
  );
  return new;
end;
$$;
