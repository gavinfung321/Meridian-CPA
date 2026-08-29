-- Category descriptions + default session type base prices (HKD)

alter table public.categories
  add column if not exists description text;

update public.categories
set description = case slug
  when 'tax-planning' then
    'Strategic guidance on personal and corporate tax obligations, deductions, and year-end planning to minimize liability and stay compliant with IRD requirements.'
  when 'audit-compliance' then
    'Support preparing for statutory audits, regulatory filings, and internal controls to meet Hong Kong reporting standards.'
  when 'payroll-mpf' then
    'Expert handling of payroll processing, MPF contributions, and employment tax obligations for Hong Kong businesses.'
  when 'advisory' then
    'Business advisory on financial strategy, entity structure, and growth planning tailored to small and medium enterprises.'
end
where slug in ('tax-planning', 'audit-compliance', 'payroll-mpf', 'advisory');

update public.session_types
set default_price = case name
  when 'Initial Tax Consultation' then 1800.00
  when 'Audit Readiness Review' then 2500.00
  when 'Payroll & MPF Setup Consultation' then 1500.00
  when 'Business Advisory Session' then 2200.00
  else default_price
end
where name in (
  'Initial Tax Consultation',
  'Audit Readiness Review',
  'Payroll & MPF Setup Consultation',
  'Business Advisory Session'
);
