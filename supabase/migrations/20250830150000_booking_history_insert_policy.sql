-- Allow app to write booking audit rows when status changes
create policy "Users and admins can insert booking history"
  on public.booking_history for insert
  with check (auth.uid() = changed_by or public.is_admin());
