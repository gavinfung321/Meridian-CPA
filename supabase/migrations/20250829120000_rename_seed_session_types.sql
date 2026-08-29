-- Phase 2.5 polish: session type names should be products, not copies of category names

update public.session_types st
set name = case c.slug
  when 'tax-planning' then 'Initial Tax Consultation'
  when 'audit-compliance' then 'Audit Readiness Review'
  when 'payroll-mpf' then 'Payroll & MPF Setup Consultation'
  when 'advisory' then 'Business Advisory Session'
end
from public.categories c
where st.category_id = c.id
  and st.name = c.name;

-- Sync legacy sessions.type text where it still mirrors the old category name
update public.sessions s
set type = st.name
from public.session_types st
where s.session_type_id = st.id
  and s.type is distinct from st.name;
