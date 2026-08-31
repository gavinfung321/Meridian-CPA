-- Seed session type descriptions + varied default capacity templates

update public.session_types
set
  description = case name
    when 'Initial Tax Consultation' then
      'One-on-one introductory meeting to assess your tax position, outline IRD filing obligations, and recommend a tailored action plan with our CPA team.'
    when 'Audit Readiness Review' then
      'Structured review of your books, internal controls, and statutory records to prepare for external audit or regulatory compliance checks.'
    when 'Payroll & MPF Setup Consultation' then
      'Hands-on guidance for payroll setup, MPF enrolment, contribution calculations, and employer obligations under Hong Kong employment law.'
    when 'Business Advisory Session' then
      'Strategic advisory on financial planning, entity structure, and growth decisions for SME owners, founders, and expanding businesses.'
    else description
  end,
  default_max_slots = case name
    when 'Initial Tax Consultation' then 1
    when 'Audit Readiness Review' then 2
    when 'Payroll & MPF Setup Consultation' then 6
    when 'Business Advisory Session' then 4
    else default_max_slots
  end
where name in (
  'Initial Tax Consultation',
  'Audit Readiness Review',
  'Payroll & MPF Setup Consultation',
  'Business Advisory Session'
);
