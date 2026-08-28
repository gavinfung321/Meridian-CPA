-- Profile picture storage path on profiles table
alter table public.profiles
  add column avatar_path text;

-- Private bucket for profile pictures
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'profile-pictures',
  'profile-pictures',
  false,
  2097152,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Users can manage files in their own folder ({user_id}/...)
create policy "Users can upload own profile picture"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'profile-pictures'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can update own profile picture"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'profile-pictures'
    and auth.uid()::text = (storage.foldername(name))[1]
  )
  with check (
    bucket_id = 'profile-pictures'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can delete own profile picture"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'profile-pictures'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can view own profile picture"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'profile-pictures'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Admins can view all profile pictures"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'profile-pictures'
    and public.is_admin()
  );
