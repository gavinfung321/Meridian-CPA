-- Default capacity template for session types (prefills scheduled session max_slots)

alter table public.session_types
  add column if not exists default_max_slots integer default 1 not null;

comment on column public.session_types.default_max_slots is
  'Default slot capacity when scheduling sessions from this type.';
