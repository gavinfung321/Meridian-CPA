-- Phase 3: demo bookings for admin UI testing (idempotent by user+session+status)

insert into public.bookings (user_id, session_id, status, cancel_reason, cancelled_at)
select
  p.id,
  s.id,
  v.status::public.booking_status,
  v.cancel_reason,
  case
    when v.status in ('cancelled', 'rejected') then timezone('utc'::text, now())
    else null
  end
from (
  values
    ('test_client1@gmail.com', '1-on-1 Tax Planning & Advisory (Private Session)', 'pending', null),
    ('test_client1@gmail.com', 'HK Profits Tax Return (PTR) Q&A Clinic', 'confirmed', null),
    ('test_client1@gmail.com', 'Audit Readiness & Document Review', 'rejected', 'Incomplete documentation submitted with request.'),
    ('test_client2@gmail.com', 'MPF & Hong Kong Payroll Compliance Masterclass', 'pending', null),
    ('test_client2@gmail.com', 'Cross-Border Tax & GBA Structuring Workshop', 'confirmed', null),
    ('test_client2@gmail.com', 'Audit Readiness & Document Review', 'cancelled', 'Client requested to reschedule.')
) as v(client_email, session_title, status, cancel_reason)
join public.profiles p on p.email = v.client_email and p.role = 'client'::public.user_role
join public.sessions s on s.title = v.session_title and s.is_cancelled = false
where not exists (
  select 1
  from public.bookings b
  where b.user_id = p.id
    and b.session_id = s.id
    and b.status = v.status::public.booking_status
);
