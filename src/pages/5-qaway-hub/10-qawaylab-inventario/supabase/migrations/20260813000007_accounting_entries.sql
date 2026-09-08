-- ============================================================
-- ASIENTOS CONTABLES (Doble Partida)
-- Migración para soporte de contabilidad completa
--
-- Crea:
--   accounting_entries       (encabezado del asiento)
--   accounting_entry_lines   (líneas débito/crédito)
--
-- Cada asiento debe tener:
--   - Al menos 2 líneas
--   - Total débitos = Total créditos (balance)
-- ============================================================

-- 1) ASIENTOS CONTABLES (encabezado)
create table if not exists public.accounting_entries (
  id              uuid primary key default gen_random_uuid(),
  entry_number    text not null,
  description     text not null,
  entry_date      date not null default current_date,
  reference       text,                    -- referencia al documento origen
  status          text not null default 'draft',
  created_by      uuid references public.users (id) on delete set null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  constraint accounting_entries_status_check check (status in ('draft', 'posted', 'cancelled'))
);

create unique index if not exists accounting_entries_number_idx on public.accounting_entries (entry_number);

-- 2) LÍNEAS DEL ASIENTO (débito/crédito)
create table if not exists public.accounting_entry_lines (
  id              uuid primary key default gen_random_uuid(),
  entry_id        uuid not null references public.accounting_entries (id) on delete cascade,
  account_code    text not null,           -- código de cuenta (ej: 10, 11, 12, 42, 50, etc.)
  account_name    text not null,           -- nombre descriptivo de la cuenta
  description     text,                    -- descripción opcional de la línea
  debit           numeric not null default 0,  -- monto débito
  credit          numeric not null default 0,  -- monto crédito
  created_at      timestamptz not null default now(),
  constraint accounting_lines_debit_credit_check check (
    (debit >= 0 and credit >= 0) and
    (debit > 0 or credit > 0)
  )
);

-- ============================================================
-- RLS Policies
-- ============================================================

alter table public.accounting_entries enable row level security;

do $$ begin
  create policy "accounting_entries_select" on public.accounting_entries for select using (true);
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "accounting_entries_insert" on public.accounting_entries for insert with check (true);
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "accounting_entries_update" on public.accounting_entries for update using (true);
exception when duplicate_object then null;
end $$;

alter table public.accounting_entry_lines enable row level security;

do $$ begin
  create policy "accounting_entry_lines_select" on public.accounting_entry_lines for select using (true);
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "accounting_entry_lines_insert" on public.accounting_entry_lines for insert with check (true);
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "accounting_entry_lines_delete" on public.accounting_entry_lines for delete using (true);
exception when duplicate_object then null;
end $$;

-- ============================================================
-- Función para generar correlativo de asiento
-- ============================================================
create or replace function public.next_entry_number()
returns trigger as $$
declare
  next_num integer;
begin
  select coalesce(max(cast(substring(entry_number from 4) as integer)), 0) + 1
  into next_num
  from public.accounting_entries;
  
  new.entry_number := 'ASI-' || lpad(next_num::text, 6, '0');
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_next_entry_number on public.accounting_entries;
create trigger trg_next_entry_number
  before insert on public.accounting_entries
  for each row
  execute function public.next_entry_number();

-- ============================================================
-- Vista para balance de asientos
-- ============================================================
create or replace view public.accounting_entry_balances as
select
  e.id as entry_id,
  e.entry_number,
  e.description,
  e.entry_date,
  e.status,
  coalesce(sum(l.debit), 0) as total_debit,
  coalesce(sum(l.credit), 0) as total_credit,
  case 
    when coalesce(sum(l.debit), 0) = coalesce(sum(l.credit), 0) then true
    else false
  end as is_balanced,
  e.created_at
from public.accounting_entries e
left join public.accounting_entry_lines l on l.entry_id = e.id
group by e.id, e.entry_number, e.description, e.entry_date, e.status, e.created_at;
