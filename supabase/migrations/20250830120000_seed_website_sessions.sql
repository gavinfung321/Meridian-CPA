-- Demo sessions for public booking section (website showcase)
-- Idempotent: skips rows when title already exists

insert into public.sessions (
  title,
  description,
  type,
  session_type_id,
  location,
  start_time,
  end_time,
  duration_minutes,
  max_slots,
  price,
  is_cancelled
)
select
  v.title,
  v.description,
  st.name,
  st.id,
  v.location,
  v.start_time,
  v.start_time + (v.duration_minutes || ' minutes')::interval,
  v.duration_minutes,
  v.max_slots,
  st.default_price,
  false
from (
  values
    (
      '1-on-1 Tax Planning & Advisory (Private Session)',
      'Private consultation to review your personal or corporate tax position, identify deductions, and plan ahead with our CPA team.',
      'Initial Tax Consultation',
      'Central Office / Zoom',
      '2026-09-08 10:00:00+08'::timestamptz,
      60,
      1
    ),
    (
      'HK Profits Tax Return (PTR) Q&A Clinic',
      'Group workshop covering common PTR filing questions, deadlines, and documentation for Hong Kong SMEs.',
      'Audit Readiness Review',
      'Boardroom / Hybrid',
      '2026-09-09 15:00:00+08'::timestamptz,
      45,
      8
    ),
    (
      'MPF & Hong Kong Payroll Compliance Masterclass',
      'Learn MPF enrolment, contribution calculations, and payroll tax obligations for Hong Kong employers.',
      'Payroll & MPF Setup Consultation',
      'Online Webinar',
      '2026-09-10 14:00:00+08'::timestamptz,
      60,
      20
    ),
    (
      'Audit Readiness & Document Review',
      'One-on-one review of your audit file, internal controls, and statutory record-keeping before year-end.',
      'Audit Readiness Review',
      'Central Office',
      '2026-09-11 11:00:00+08'::timestamptz,
      45,
      1
    ),
    (
      'Cross-Border Tax & GBA Structuring Workshop',
      'Seminar on Greater Bay Area entity structuring, cross-border tax considerations, and expansion planning for SMEs.',
      'Business Advisory Session',
      'Hybrid',
      '2026-09-12 16:00:00+08'::timestamptz,
      90,
      15
    )
) as v(title, description, session_type_name, location, start_time, duration_minutes, max_slots)
join public.session_types st on st.name = v.session_type_name
where not exists (
  select 1 from public.sessions s where s.title = v.title
);
