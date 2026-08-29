-- Phase 2: session cover images (public bucket for landing page display)

alter table public.sessions
  add column image_path text;

comment on column public.sessions.image_path is 'Storage path in session-images bucket for optional session card cover.';

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'session-images',
  'session-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "Admins can upload session images"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'session-images'
    and public.is_admin()
  );

create policy "Admins can update session images"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'session-images' and public.is_admin())
  with check (bucket_id = 'session-images' and public.is_admin());

create policy "Admins can delete session images"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'session-images' and public.is_admin());

create policy "Anyone can view session images"
  on storage.objects for select
  using (bucket_id = 'session-images');
