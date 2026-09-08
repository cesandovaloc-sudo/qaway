-- CLINICA (Qaway Lab) - esquema base v1
-- Historial clinico dual (humano + veterinaria) multi-tenant estilo SaaS
-- Ejecutar en el proyecto Supabase de cada cliente.
create extension if not exists "uuid-ossp";

-- ===== CLINICAS (cada clinica es un tenant) =====
create table if not exists public.clinics (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  clinic_type text not null default 'mixed' check (clinic_type in ('human','veterinary','mixed')),
  phone text,
  address text,
  timezone text not null default 'UTC',
  branding jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

-- ===== MIEMBROS DE LA CLINICA Y ROLES =====
create table if not exists public.clinic_memberships (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid references public.clinics(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  role text not null default 'doctor' check (role in ('admin','doctor','veterinarian','assistant','receptionist')),
  created_at timestamptz default now(),
  unique (clinic_id, user_id)
);

-- ===== DUEÑOS / TUTORES (veterinaria: dueno de la mascota; humano: tutor legal) =====
create table if not exists public.owners (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid references public.clinics(id) on delete cascade not null,
  full_name text not null,
  email text,
  phone text,
  address text,
  created_at timestamptz default now()
);

-- ===== PACIENTES (dual: humano O animal, campos condicionales) =====
create table if not exists public.patients (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid references public.clinics(id) on delete cascade not null,
  owner_id uuid references public.owners(id) on delete set null,
  patient_type text not null check (patient_type in ('human','animal')),
  first_name text not null,
  last_name text,
  species text,
  breed text,
  gender text,
  birth_date date,
  weight_kg numeric(6,2),
  microchip_number text,
  document_id text,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- ===== CONSULTAS / VISITAS (notas SOAP + signos vitales) =====
create table if not exists public.consultations (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid references public.clinics(id) on delete cascade not null,
  patient_id uuid references public.patients(id) on delete cascade not null,
  doctor_id uuid references auth.users(id) on delete set null,
  subjective text,
  objective text,
  assessment text,
  plan text,
  weight_kg numeric(6,2),
  temperature numeric(4,2),
  heart_rate integer,
  respiratory_rate integer,
  created_at timestamptz default now()
);

-- ===== DIAGNOSTICOS por consulta (CIE-10 humano / codigos vet) =====
create table if not exists public.diagnoses (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid references public.clinics(id) on delete cascade not null,
  consultation_id uuid references public.consultations(id) on delete cascade not null,
  patient_id uuid references public.patients(id) on delete cascade not null,
  code text,
  description text not null,
  diag_type text not null default 'confirmed' check (diag_type in ('presumptive','confirmed'))
);

-- ===== RECETAS / PRESCRIPCIONES =====
create table if not exists public.prescriptions (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid references public.clinics(id) on delete cascade not null,
  consultation_id uuid references public.consultations(id) on delete cascade,
  patient_id uuid references public.patients(id) on delete cascade not null,
  medication_name text not null,
  dosage text,
  frequency text,
  duration text,
  instructions text,
  created_at timestamptz default now()
);

-- ===== VACUNAS / INMUNIZACIONES (next_due_date alimenta alertas) =====
create table if not exists public.vaccinations (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid references public.clinics(id) on delete cascade not null,
  patient_id uuid references public.patients(id) on delete cascade not null,
  vaccine_name text not null,
  batch_number text,
  administered_date date not null,
  next_due_date date,
  notes text,
  created_at timestamptz default now()
);

-- ===== ALERGIAS (con severidad, alerta clinica) =====
create table if not exists public.allergies (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid references public.clinics(id) on delete cascade not null,
  patient_id uuid references public.patients(id) on delete cascade not null,
  allergen text not null,
  severity text not null default 'moderate' check (severity in ('mild','moderate','severe','life-threatening')),
  reaction_description text,
  created_at timestamptz default now()
);

-- ===== DOCUMENTOS MEDICOS (bucket privado + URLs firmadas) =====
create table if not exists public.medical_documents (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid references public.clinics(id) on delete cascade not null,
  patient_id uuid references public.patients(id) on delete cascade not null,
  file_name text not null,
  file_path text not null,
  file_type text,
  uploaded_by uuid references auth.users(id) on delete set null,
  created_at timestamptz default now()
);

-- ===== RECORDATORIOS / ALERTAS (cola para la edge function) =====
create table if not exists public.reminders (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid references public.clinics(id) on delete cascade not null,
  patient_id uuid references public.patients(id) on delete cascade not null,
  owner_id uuid references public.owners(id) on delete set null,
  rtype text not null check (rtype in ('vaccine','follow_up','medication','visit')),
  title text not null,
  message text,
  send_at timestamptz not null,
  channel text not null default 'email' check (channel in ('email','whatsapp')),
  status text not null default 'pending' check (status in ('pending','sent','failed')),
  created_at timestamptz default now()
);
create index if not exists reminders_pending_idx on public.reminders (status, send_at);

-- ===== LINKS SEGUROS DEL DUEÑO (acceso solo-lectura sin login) =====
create table if not exists public.share_links (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid references public.clinics(id) on delete cascade not null,
  patient_id uuid references public.patients(id) on delete cascade not null,
  token uuid not null unique default gen_random_uuid(),
  created_by uuid references auth.users(id) on delete set null,
  expires_at timestamptz,
  active boolean default true,
  created_at timestamptz default now()
);

-- ===== FUNCION DE MEMBRESIA (seguridad multi-tenant) =====
create or replace function public.get_user_clinic_ids()
returns setof uuid
language sql security definer set search_path = ''
as $$
  select clinic_id from public.clinic_memberships where user_id = auth.uid();
$$;

-- ===== RLS: CLINICAS =====
alter table public.clinics enable row level security;
create policy "staff_read_own_clinics" on public.clinics for select to authenticated
  using (id in (select public.get_user_clinic_ids()));

-- ===== RLS: MEMBERSHIPS =====
alter table public.clinic_memberships enable row level security;
create policy "members_read_own" on public.clinic_memberships for select to authenticated
  using (clinic_id in (select public.get_user_clinic_ids()));
create policy "admins_manage_members" on public.clinic_memberships for all to authenticated
  using (clinic_id in (select public.get_user_clinic_ids()))
  with check (clinic_id in (select public.get_user_clinic_ids()));

-- ===== RLS: PACIENTES (solo staff de la clinica) =====
alter table public.patients enable row level security;
create policy "staff_full_patients" on public.patients for all to authenticated
  using (clinic_id in (select public.get_user_clinic_ids()))
  with check (clinic_id in (select public.get_user_clinic_ids()));

-- ===== RLS: OWNERS, CONSULTATIONS, DIAGNOSES, PRESCRIPTIONS, VACCINATIONS, ALLERGIES =====
alter table public.owners enable row level security;
create policy "staff_full_owners" on public.owners for all to authenticated
  using (clinic_id in (select public.get_user_clinic_ids()))
  with check (clinic_id in (select public.get_user_clinic_ids()));

alter table public.consultations enable row level security;
create policy "staff_full_consultations" on public.consultations for all to authenticated
  using (clinic_id in (select public.get_user_clinic_ids()))
  with check (clinic_id in (select public.get_user_clinic_ids()));

alter table public.diagnoses enable row level security;
create policy "staff_full_diagnoses" on public.diagnoses for all to authenticated
  using (clinic_id in (select public.get_user_clinic_ids()))
  with check (clinic_id in (select public.get_user_clinic_ids()));

alter table public.prescriptions enable row level security;
create policy "staff_full_prescriptions" on public.prescriptions for all to authenticated
  using (clinic_id in (select public.get_user_clinic_ids()))
  with check (clinic_id in (select public.get_user_clinic_ids()));

alter table public.vaccinations enable row level security;
create policy "staff_full_vaccinations" on public.vaccinations for all to authenticated
  using (clinic_id in (select public.get_user_clinic_ids()))
  with check (clinic_id in (select public.get_user_clinic_ids()));

alter table public.allergies enable row level security;
create policy "staff_full_allergies" on public.allergies for all to authenticated
  using (clinic_id in (select public.get_user_clinic_ids()))
  with check (clinic_id in (select public.get_user_clinic_ids()));

alter table public.reminders enable row level security;
create policy "staff_full_reminders" on public.reminders for all to authenticated
  using (clinic_id in (select public.get_user_clinic_ids()))
  with check (clinic_id in (select public.get_user_clinic_ids()));

alter table public.share_links enable row level security;
create policy "staff_full_share_links" on public.share_links for all to authenticated
  using (clinic_id in (select public.get_user_clinic_ids()))
  with check (clinic_id in (select public.get_user_clinic_ids()));

alter table public.medical_documents enable row level security;
create policy "staff_full_documents" on public.medical_documents for all to authenticated
  using (clinic_id in (select public.get_user_clinic_ids()))
  with check (clinic_id in (select public.get_user_clinic_ids()));

-- ===== ACCESO PUBLICO SEGURO: historial solo-lectura del dueno por token =====
-- El anon NO puede leer las tablas; solo puede llamar a esta funcion.
create or replace function public.get_public_record(p_token uuid)
returns jsonb
language plpgsql security definer set search_path = ''
as $$
declare
  v_share public.share_links;
  v_patient public.patients;
  v_owner public.owners;
  v_result jsonb;
begin
  select * into v_share from public.share_links sl
    where sl.token = p_token and sl.active = true
      and (sl.expires_at is null or sl.expires_at > now());
  if v_share.id is null then
    raise exception 'link_invalido';
  end if;
  select * into v_patient from public.patients where id = v_share.patient_id;
  if v_patient.id is null then
    raise exception 'paciente_no_encontrado';
  end if;
  select * into v_owner from public.owners where id = v_patient.owner_id;
  select jsonb_build_object(
    'patient', jsonb_build_object(
      'id', v_patient.id,
      'first_name', v_patient.first_name,
      'last_name', v_patient.last_name,
      'patient_type', v_patient.patient_type,
      'species', v_patient.species,
      'breed', v_patient.breed,
      'gender', v_patient.gender,
      'birth_date', v_patient.birth_date,
      'weight_kg', v_patient.weight_kg,
      'microchip_number', v_patient.microchip_number
    ),
    'owner', case when v_owner.id is null then null else
      jsonb_build_object('full_name', v_owner.full_name, 'email', v_owner.email, 'phone', v_owner.phone)
    end,
    'vaccinations', coalesce((
      select jsonb_agg(jsonb_build_object(
        'vaccine_name', v.vaccine_name, 'administered_date', v.administered_date,
        'next_due_date', v.next_due_date, 'batch_number', v.batch_number
      ) order by v.administered_date desc)
      from public.vaccinations v where v.patient_id = v_patient.id
    ), '[]'::jsonb),
    'allergies', coalesce((
      select jsonb_agg(jsonb_build_object(
        'allergen', a.allergen, 'severity', a.severity, 'reaction_description', a.reaction_description
      ))
      from public.allergies a where a.patient_id = v_patient.id
    ), '[]'::jsonb),
    'consultations', coalesce((
      select jsonb_agg(jsonb_build_object(
        'created_at', c.created_at, 'subjective', c.subjective, 'objective', c.objective,
        'assessment', c.assessment, 'plan', c.plan, 'weight_kg', c.weight_kg,
        'temperature', c.temperature, 'heart_rate', c.heart_rate
      ) order by c.created_at desc)
      from public.consultations c where c.patient_id = v_patient.id
    ), '[]'::jsonb),
    'prescriptions', coalesce((
      select jsonb_agg(jsonb_build_object(
        'medication_name', p.medication_name, 'dosage', p.dosage,
        'frequency', p.frequency, 'duration', p.duration, 'instructions', p.instructions
      ) order by p.created_at desc)
      from public.prescriptions p where p.patient_id = v_patient.id
    ), '[]'::jsonb)
  ) into v_result;
  return v_result;
end;
$$;

grant execute on function public.get_public_record(uuid) to anon, authenticated;

-- ===== AUTO-SETUP DE CLINICA (primer login, respeta RLS) =====
-- security definer: crea la clinica + la membresia admin del usuario.
create or replace function public.create_clinic_and_membership(p_name text, p_slug text, p_clinic_type text default 'mixed')
returns jsonb
language plpgsql security definer set search_path = ''
as $$
declare
  v_clinic public.clinics;
  v_member public.clinic_memberships;
begin
  insert into public.clinics (name, slug, clinic_type)
  values (p_name, p_slug, p_clinic_type)
  returning * into v_clinic;
  insert into public.clinic_memberships (clinic_id, user_id, role)
  values (v_clinic.id, auth.uid(), 'admin')
  returning * into v_member;
  return jsonb_build_object(
    'clinic', jsonb_build_object('id', v_clinic.id, 'name', v_clinic.name, 'slug', v_clinic.slug, 'clinic_type', v_clinic.clinic_type),
    'membership', jsonb_build_object('id', v_member.id, 'role', v_member.role)
  );
end;
$$;

grant execute on function public.create_clinic_and_membership(text, text, text) to authenticated;
