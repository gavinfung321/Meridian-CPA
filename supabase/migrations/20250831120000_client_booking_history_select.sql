-- Allow clients to read booking_history rows for their own bookings (activity feed + detail timeline).
create policy "Users can view own booking history"
  on public.booking_history for select
  using (
    exists (
      select 1
      from public.bookings
      where bookings.id = booking_history.booking_id
        and bookings.user_id = auth.uid()
    )
  );
