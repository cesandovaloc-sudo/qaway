create table if not exists public.dental_leads (
  id uuid primary key default gen_random_uuid(),
  full_name text not null check (char_length(full_name) between 3 and 120),
  phone text not null check (char_length(phone) between 7 and 32),
  email text not null check (char_length(email) <= 160),
  age smallint check (age is null or age between 12 and 100),
  treatment_interest text not null check (char_length(treatment_interest) <= 100),
  message text check (message is null or char_length(message) <= 1200),
  accepted_privacy boolean not null default false check (accepted_privacy = true),
  source text not null default 'landing-dental-v2',
  created_at timestamptz not null default now()
);

alter table public.dental_leads enable row level security;

create policy "Allow anonymous dental lead creation"
on public.dental_leads
for insert
to anon
with check (accepted_privacy = true and source = 'landing-dental-v2');

revoke select, update, delete on public.dental_leads from anon;
grant insert on public.dental_leads to anon;
