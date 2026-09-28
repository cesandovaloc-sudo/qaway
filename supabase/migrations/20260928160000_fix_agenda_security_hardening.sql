-- ============================================================
-- FIX AGENDA SECURITY HARDENING (auditoria run-1, backend)
-- Consolidada e idempotente. Renombra a JSONB los RPC publicos,
-- mueve la reserva de booking a RPC SECURITY DEFINER (sin PII),
-- acota privilegios anon (bookings + columnas PII de businesses),
-- agrega ciclo de vida del cancel_token y trigger de reminders.
-- Requiere 20260920102000_agenda_coupled_central.sql aplicado.
-- ============================================================

-- ── 1. Ciclo de vida del cancel_token en bookings ──────────────
alter table public.bookings
  add column if not exists token_expires_at timestamptz default (now() + interval '30 days');
alter table public.bookings
  add column if not exists token_consumed_at timestamptz;

-- ── 2. Cerrar acceso directo de anon a bookings ────────────────
-- El flujo publico pasa 100% por RPC: sin INSERT/UPDATE/SELECT
-- directo de anon, la RPC es el unico camino (defensa en profundidad).
revoke all on public.bookings from anon;

drop policy if exists "anon_insert_booking" on public.bookings;
drop policy if exists "anon_read_own_booking" on public.bookings;
drop policy if exists "anon_update_own_booking" on public.bookings;

grant select on public.booked_slots to anon;

-- ── 3. Ocultar PII de businesses a anon (item #7) ──────────────
-- La lectura publica por slug solo necesita identidad + horario.
-- owner_id, whatsapp_number y branding quedan fuera del alcance anon.
revoke select (owner_id, whatsapp_number, branding) on public.businesses from anon;

-- ── 4. secure_manage_booking endurecido (items #1 #6 #8) ───────
-- Cambia el tipo de retorno de public.bookings (composite con PII)
-- a jsonb con proyeccion reducida; valida horario/fecha/dias
-- bloqueados, rota el token en reschedule y lo consume en cancel.
drop function if exists public.secure_manage_booking(uuid, text, timestamptz, int);

create function public.secure_manage_booking(
  p_token uuid,
  p_action text,
  p_new_start timestamptz default null,
  p_duration_minutes int default null
)
returns jsonb
language plpgsql security definer
set search_path = public
as $$
declare
  v_booking public.bookings;
  v_ev      public.event_types;
  v_biz     public.businesses;
  v_timezone text;
  v_local   timestamp;
  v_dow     int;
  v_duration int;
  v_end     timestamptz;
  v_new_token uuid;
  v_exc_available boolean;
  v_exc_start time;
  v_exc_end   time;
  v_win_start time;
  v_win_end   time;
begin
  select * into v_booking from public.bookings where cancel_token = p_token;
  if not found then
    raise exception 'Cita no encontrada o enlace invalido';
  end if;

  if v_booking.token_consumed_at is not null then
    raise exception 'Este enlace ya fue utilizado';
  end if;
  if v_booking.token_expires_at is not null and v_booking.token_expires_at < now() then
    raise exception 'Este enlace ha expirado';
  end if;

  select * into v_ev from public.event_types where id = v_booking.event_type_id;
  select * into v_biz from public.businesses where id = v_booking.business_id;
  v_duration := coalesce(v_ev.duration_minutes, 30);

  if p_action = 'info' then
    return jsonb_build_object(
      'id',             v_booking.id,
      'business_id',    v_booking.business_id,
      'event_type_id',  v_booking.event_type_id,
      'customer_name',  v_booking.customer_name,
      'start_at',       v_booking.start_at,
      'end_at',         v_booking.end_at,
      'status',         v_booking.status,
      'event_types',    jsonb_build_object('title', v_ev.title),
      'businesses',     jsonb_build_object('name', v_biz.name)
    );
  end if;

  if p_action = 'cancel' then
    update public.bookings
       set status = 'cancelled',
           token_consumed_at = now()
     where id = v_booking.id;
    return jsonb_build_object('id', v_booking.id, 'status', 'cancelled');
  end if;

  if p_action <> 'reschedule' then
    raise exception 'Accion no valida';
  end if;

  -- Reprogramacion: solo futuro, duracion del servicio (no del caller)
  if p_new_start is null then
    raise exception 'Faltan datos para reprogramar';
  end if;
  if p_new_start <= now() then
    raise exception 'No puedes reprogramar en el pasado';
  end if;
  if p_duration_minutes is not null and p_duration_minutes <> v_duration then
    raise exception 'Duracion no permitida para este servicio';
  end if;

  v_timezone := coalesce(nullif(trim(v_biz.timezone), ''), 'UTC');
  v_local := p_new_start at time zone v_timezone;
  v_dow := (extract(isodow from v_local)::int + 6) % 7; -- 0=Lunes ... 6=Domingo

  -- Dias bloqueados (availability_exceptions)
  v_exc_available := null;
  select x.is_available, x.start_time, x.end_time
    into v_exc_available, v_exc_start, v_exc_end
    from public.availability_exceptions x
   where x.business_id = v_booking.business_id
     and x.exception_date = v_local::date
   limit 1;
  if found and coalesce(v_exc_available, false) = false then
    raise exception 'Dia no disponible para el negocio';
  end if;

  -- Horario semanal (o ventana custom de la excepcion habilitada)
  select s.start_time, s.end_time
    into v_win_start, v_win_end
    from public.schedules s
   where s.business_id = v_booking.business_id
     and s.day_of_week = v_dow
   limit 1;
  if not found then
    raise exception 'El negocio no atiende este dia';
  end if;

  if v_exc_available is true and v_exc_start is not null and v_exc_end is not null then
    v_win_start := v_exc_start;
    v_win_end := v_exc_end;
  end if;

  if v_local::time < v_win_start or v_local::time >= v_win_end then
    raise exception 'Horario fuera de disponibilidad';
  end if;

  v_end := p_new_start + make_interval(mins => v_duration);
  if (v_end at time zone v_timezone)::time > v_win_end then
    raise exception 'La cita excede el horario de atencion';
  end if;

  -- Rotacion del token: el nuevo enlace invalida al anterior
  v_new_token := gen_random_uuid();
  update public.bookings
     set start_at = p_new_start,
         end_at = v_end,
         status = 'confirmed',
         cancel_token = v_new_token,
         token_expires_at = now() + interval '30 days',
         token_consumed_at = null
   where id = v_booking.id;

  return jsonb_build_object(
    'id',             v_booking.id,
    'business_id',    v_booking.business_id,
    'event_type_id',  v_booking.event_type_id,
    'customer_name',  v_booking.customer_name,
    'start_at',       p_new_start,
    'end_at',         v_end,
    'status',         'confirmed',
    'cancel_token',   v_new_token,
    'event_types',    jsonb_build_object('title', v_ev.title),
    'businesses',     jsonb_build_object('name', v_biz.name)
  );
end;
$$;

-- ── 5. secure_create_booking: unico camino de reserva publica ───
-- SECURITY DEFINER, sin PII en la respuesta, valida tenant binding
-- (item #4), duracion real del evento, horario y dias bloqueados.
create or replace function public.secure_create_booking(
  p_business_id uuid,
  p_event_type_id uuid,
  p_customer_name text,
  p_customer_email text,
  p_customer_phone text,
  p_start_at timestamptz
)
returns jsonb
language plpgsql security definer
set search_path = public
as $$
declare
  v_ev      public.event_types;
  v_biz     public.businesses;
  v_booking public.bookings;
  v_timezone text;
  v_local   timestamp;
  v_dow     int;
  v_duration int;
  v_end     timestamptz;
  v_exc_available boolean;
  v_exc_start time;
  v_exc_end   time;
  v_win_start time;
  v_win_end   time;
begin
  if p_customer_name is null or trim(p_customer_name) = '' then
    raise exception 'Nombre requerido';
  end if;
  if p_customer_email is null or trim(p_customer_email) = '' then
    raise exception 'Correo requerido';
  end if;

  select * into v_biz from public.businesses where id = p_business_id;
  if not found then
    raise exception 'Negocio no encontrado';
  end if;

  -- Tenant binding: el servicio debe pertenecer al negocio
  select * into v_ev from public.event_types where id = p_event_type_id;
  if not found then
    raise exception 'Servicio no encontrado';
  end if;
  if v_ev.business_id is distinct from p_business_id then
    raise exception 'Servicio invalido para este negocio';
  end if;
  if coalesce(v_ev.is_active, true) = false then
    raise exception 'Servicio no disponible';
  end if;
  if coalesce(v_ev.price, 0) > 0 then
    raise exception 'Este servicio requiere pago coordinado';
  end if;

  v_duration := coalesce(v_ev.duration_minutes, 30);

  if p_start_at <= now() then
    raise exception 'No puedes reservar en el pasado';
  end if;

  v_timezone := coalesce(nullif(trim(v_biz.timezone), ''), 'UTC');
  v_local := p_start_at at time zone v_timezone;
  v_dow := (extract(isodow from v_local)::int + 6) % 7;

  v_exc_available := null;
  select x.is_available, x.start_time, x.end_time
    into v_exc_available, v_exc_start, v_exc_end
    from public.availability_exceptions x
   where x.business_id = p_business_id
     and x.exception_date = v_local::date
   limit 1;
  if found and coalesce(v_exc_available, false) = false then
    raise exception 'Dia no disponible para el negocio';
  end if;

  select s.start_time, s.end_time
    into v_win_start, v_win_end
    from public.schedules s
   where s.business_id = p_business_id
     and s.day_of_week = v_dow
   limit 1;
  if not found then
    raise exception 'El negocio no atiende este dia';
  end if;

  if v_exc_available is true and v_exc_start is not null and v_exc_end is not null then
    v_win_start := v_exc_start;
    v_win_end := v_exc_end;
  end if;

  if v_local::time < v_win_start or v_local::time >= v_win_end then
    raise exception 'Horario fuera de disponibilidad';
  end if;

  v_end := p_start_at + make_interval(mins => v_duration);
  if (v_end at time zone v_timezone)::time > v_win_end then
    raise exception 'La cita excede el horario de atencion';
  end if;

  -- El solape se previene atomicamente con el EXCLUDE constraint
  -- (23P01); aqui solo se inserta el rango validado.
  with ins as (
    insert into public.bookings (
      business_id, event_type_id, customer_name, customer_email, customer_phone,
      start_at, end_at, status, payment_status, payment_intent_id,
      cancel_token, token_expires_at, token_consumed_at
    ) values (
      p_business_id, p_event_type_id,
      trim(p_customer_name), lower(trim(p_customer_email)), p_customer_phone,
      p_start_at, v_end, 'confirmed', 'pending', null,
      gen_random_uuid(), now() + interval '30 days', null
    )
    returning *
  )
  select * into v_booking from ins;

  return jsonb_build_object(
    'id',             v_booking.id,
    'business_id',    v_booking.business_id,
    'event_type_id',  v_booking.event_type_id,
    'customer_name',  v_booking.customer_name,
    'start_at',       v_booking.start_at,
    'end_at',         v_booking.end_at,
    'status',         v_booking.status,
    'cancel_token',   v_booking.cancel_token,
    'event_types',    jsonb_build_object('title', v_ev.title),
    'businesses',     jsonb_build_object('name', v_biz.name)
  );
end;
$$;

-- ── 6. Trigger AFTER INSERT: crea reminders en el servidor ──────
-- Remplaza el intento del cliente (agendaAdapter.insertReminders),
-- que siempre fallaba por RLS sin policies. SECURITY DEFINER para
-- insertar con privilegios del owner pese a RLS habilitada.
create or replace function public.agenda_auto_reminders()
returns trigger
language plpgsql security definer
set search_path = public
as $$
begin
  insert into public.reminders (booking_id, channel, kind, send_at, status)
  values
    (new.id, 'email',    'confirmation', now(),                                               'pending'),
    (new.id, 'whatsapp', 'confirmation', now(),                                               'pending'),
    (new.id, 'email',    'reminder',     new.start_at - interval '24 hours',                  'pending'),
    (new.id, 'whatsapp', 'reminder',     new.start_at - interval '1 hour',                    'pending');
  return new;
end;
$$;

drop trigger if exists agenda_auto_reminders_trg on public.bookings;
create trigger agenda_auto_reminders_trg
after insert on public.bookings
for each row execute function public.agenda_auto_reminders();

-- ── 7. Grants públicos ─────────────────────────────────────────
grant execute on function public.secure_create_booking(uuid, uuid, text, text, text, timestamptz) to anon, authenticated;
grant execute on function public.secure_manage_booking(uuid, text, timestamptz, int) to anon, authenticated;