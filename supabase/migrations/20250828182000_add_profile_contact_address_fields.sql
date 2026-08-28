-- Replace single phone column with prefix + number; add address fields
alter table public.profiles
  add column phone_prefix text,
  add column phone_number text,
  add column address_line1 text,
  add column address_line2 text,
  add column city text,
  add column county text,
  add column post_code text,
  add column country text;

-- Migrate existing phone values into split fields where possible
update public.profiles
set
  phone_prefix = regexp_replace(phone, '^(\+\d+).*', '\1'),
  phone_number = nullif(trim(regexp_replace(phone, '^\+\d+\s*', '')), '')
where phone is not null
  and phone ~ '^\+\d+';

update public.profiles
set phone_number = nullif(trim(phone), '')
where phone is not null
  and phone_number is null;

alter table public.profiles drop column phone;
