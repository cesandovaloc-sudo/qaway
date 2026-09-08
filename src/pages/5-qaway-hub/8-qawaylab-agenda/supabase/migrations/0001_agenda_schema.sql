-- AGENDA (Qaway Lab) - esquema base v1
-- App de agendamiento de citas multi-tenant (estilo Cal.com)
create extension if not exists "uuid-ossp";
create extension if not exists "btree_gist";

create table if not exists public.businesses (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  owner_id uuid references auth.users(id) on delete cascade,
  timezone text not null default 'UTC',
  whatsapp_number text,
  branding jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create table if not exists public.event_types (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references public.businesses(id) on delete cascade not null,
  title text not null,
  slug text not null,
  description text,
  duration_minutes integer not null default 30,
  buffer_minutes integer not null default 0,
  price numeric(10,2) default 0.00,
  currency text default 'PEN',
  color text default '#ff4b0b',
  is_active boolean default true,
  created_at timestamptz default now(),
  unique(business_id, slug)
);

create table if not exists public.schedules (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references public.businesses(id) on delete cascade not null,
  day_of_week smallint not null check (day_of_week between 0 and 6),
  start_time time not null,
  end_time time not null,
  constraint valid_time_range check (start_time < end_time)
);

create table if not exists public.availability_exceptions (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references public.businesses(id) on delete cascade not null,
  exception_date date not null,
  is_available boolean default false,
  start_time time,
  end_time time
);

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references public.businesses(id) on delete cascade not null,
  event_type_id uuid references public.event_types(id) on delete cascade not null,
  customer_name text not null,
  customer_email text not null,
  customer_phone text not null,
  start_at timestamptz not null,
  end_at timestamptz not null,
  status text not null default 'confirmed' check (status in ('confirmed','cancelled','rescheduled','pending_payment')),
  payment_status text not null default 'pending' check (payment_status in ('pending','paid','refunded')),
  payment_intent_id text,
  cancel_token uuid default gen_random_uuid(),
  slot_range tsrange generated always as (tsrange(start_at, end_at, '[)')) stored,
  created_at timestamptz default now(),
  exclude using gist (business_id with =, slot_range with &&) where (status in ('confirmed','pending_payment'))
);

create table if not exists public.reminders (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid references public.bookings(id) on delete cascade not null,
  channel text not null check (channel in ('email','whatsapp')),
  kind text not null default 'reminder' check (kind in ('confirmation','reminder')),
  send_at timestamptz not null,
  status text not null default 'pending' check (status in ('pending','sent','failed')),
  error_message text,
  created_at timestamptz default now()
);

create index if not exists idx_bookings_business_date on public.bookings(business_id, start_at);
create index if not exists idx_reminders_pending on public.reminders(send_at) where status = 'pending';
create index if not exists idx_bookings_token on public.bookings(cancel_token);

alter table public.businesses enable row level security;
alter table public.event_types enable row level security;
alter table public.schedules enable row level security;
alter table public.availability_exceptions enable row level security;
alter table public.bookings enable row level security;
alter table public.reminders enable row level security;

create policy "owner_business" on public.businesses for all to authenticated using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "owner_event_types" on public.event_types for all to authenticated using (business_id in (select id from public.businesses where owner_id = auth.uid())) with check (business_id in (select id from public.businesses where owner_id = auth.uid()));
create policy "owner_schedules" on public.schedules for all to authenticated using (business_id in (select id from public.businesses where owner_id = auth.uid())) with check (business_id in (select id from public.businesses where owner_id = auth.uid()));
create policy "owner_exceptions" on public.availability_exceptions for all to authenticated using (business_id in (select id from public.businesses where owner_id = auth.uid())) with check (business_id in (select id from public.businesses where owner_id = auth.uid()));
create policy "owner_bookings" on public.bookings for all to authenticated using (business_id in (select id from public.businesses where owner_id = auth.uid())) with check (business_id in (select id from public.businesses where owner_id = auth.uid()));

create policy "anon_read_business" on public.businesses for select to anon using (true);
create policy "anon_read_active_events" on public.event_types for select to anon using (is_active = true);
create policy "anon_read_schedules" on public.schedules for select to anon using (true);
create policy "anon_read_exceptions" on public.availability_exceptions for select to anon using (true);
-- El anon inserta bookings pero SOLO como confirmado con pago pendiente o gratis.
-- Nunca puede decidir status ni payment_status (evita forjar pagos).
create policy "anon_insert_booking" on public.bookings for insert to anon with check (
  status = 'confirmed' and payment_status = 'pending' and payment_intent_id is null
);
-- El anon NO lee la tabla bookings (protege PII de clientes).
-- Para calcular slots usara la vista public.booked_slots (solo horarios).
create policy "anon_read_own_booking" on public.bookings for select to anon using (false);
-- Gestionar (cancelar/reprogramar) SOLO via funcion RPC secure_manage_booking(cancel_token, action).
create policy "anon_update_own_booking" on public.bookings for update to anon using (false);

alter publication supabase_realtime add table public.bookings;

-- ============ VISTA SEGURA: slots ocupados (sin PII) ============
create or replace view public.booked_slots as
select business_id, event_type_id, start_at, end_at
from public.bookings
where status in ('confirmed', 'pending_payment');

-- ============ RPC SEGURA: cancelar/reprogramar con token ============
create or replace function public.secure_manage_booking(p_token uuid, p_action text, p_new_start timestamptz default null, p_duration_minutes int default null)
returns public.bookings
language plpgsql security definer
set search_path = public
as $$
declare
  v_booking public.bookings;
  v_event public.event_types;
begin
  select * into v_booking from public.bookings where cancel_token = p_token;
  if not found then
    raise exception 'Cita no encontrada';
  end if;

  if p_action = 'cancel' then
    update public.bookings set status = 'cancelled' where id = v_booking.id;
    select * into v_booking from public.bookings where id = v_booking.id;
  elsif p_action = 'reschedule' then
    if p_new_start is null or p_duration_minutes is null then
      raise exception 'Faltan datos para reprogramar';
    end if;
    -- La restriccion EXCLUDE valida que el nuevo slot no choque con otro
    update public.bookings
    set start_at = p_new_start,
        end_at = p_new_start + (p_duration_minutes || ' minutes')::interval,
        status = 'confirmed'
    where id = v_booking.id;
    select * into v_booking from public.bookings where id = v_booking.id;
  else
    raise exception 'Accion no valida';
  end if;

  return v_booking;
end;
$$;

grant execute on function public.secure_manage_booking(uuid, text, timestamptz, int) to anon, authenticated;
grant select on public.booked_slots to anon;
