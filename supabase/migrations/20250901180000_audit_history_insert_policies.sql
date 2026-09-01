-- Phase 4: allow authenticated inserts into audit tables

create policy "Users can insert own login history"
  on public.user_login_history for insert
  with check (auth.uid() = user_id);

create policy "Admins can insert session history"
  on public.session_history for insert
  with check (public.is_admin());
