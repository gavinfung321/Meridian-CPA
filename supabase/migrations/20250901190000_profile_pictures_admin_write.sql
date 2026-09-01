-- Allow admins to upload, update, and delete profile pictures in any user folder
create policy "Admins can upload profile pictures"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'profile-pictures'
    and public.is_admin()
  );

create policy "Admins can update profile pictures"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'profile-pictures'
    and public.is_admin()
  )
  with check (
    bucket_id = 'profile-pictures'
    and public.is_admin()
  );

create policy "Admins can delete profile pictures"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'profile-pictures'
    and public.is_admin()
  );
