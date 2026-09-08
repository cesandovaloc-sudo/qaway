-- ============================================================
-- CLIENTES FISCAL — Documento fiscal, dirección y datos
-- adicionales en `customers` (FASE 1 del PLAN-IMPLEMENTACION-FISCAL.md)
--
-- Agrega a `customers`:
--   doc_type   (DNI / RUC / CE / PASAPORTE / SIN_DOC)
--   doc_number (con validación de dígito verificador RUC a nivel BD)
--   fiscal_name (razón social / nombre legal, distinto de `name` comercial)
--   address     (domicilio fiscal)
--   extra_data  (jsonb: género, alias, mascota, etc.)
--
-- IDEMPOTENTE: re-ejecutable sin riesgo.
-- Cómo usar: pegar en el SQL Editor de Supabase (o `supabase db push`).
-- ============================================================

-- 1) Tipo de documento fiscal (enum para la columna; evita strings libres)
do $$
begin
  create type public.customer_doc_type as enum ('DNI', 'RUC', 'CE', 'PASAPORTE', 'SIN_DOC');
exception
  when duplicate_object then null;
end $$;

-- 2) Validación de documento fiscal.
--    RUC: 11 dígitos + dígito verificador (algoritmo SUNAT, pesos 5-4-3-2-7-6-5-4-3-2).
--    DNI: 8 dígitos. CE: 8-12 alfanuméricos. Pasaporte: 6-15 caracteres.
--    SIN_DOC / null / vacío: siempre válido (documento opcional).
create or replace function public.validate_doc_number(doc_type text, doc_number text)
returns boolean
language plpgsql
immutable
as $$
declare
  weights int[] := array[5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
  total int := 0;
  remainder int;
  check_digit int;
  i int;
begin
  if doc_number is null or trim(doc_number) = '' then
    return true;
  end if;

  case doc_type
    when 'DNI' then
      return doc_number ~ '^[0-9]{8}$';
    when 'RUC' then
      if not doc_number ~ '^[0-9]{11}$' then
        return false;
      end if;
      for i in 1..10 loop
        total := total + (substring(doc_number from i for 1)::int * weights[i]);
      end loop;
      remainder := total % 11;
      check_digit := case when remainder = 0 then 0 else 11 - remainder end;
      return check_digit = substring(doc_number from 11 for 1)::int;
    when 'CE' then
      return doc_number ~ '^[0-9A-Za-z]{8,12}$';
    when 'PASAPORTE' then
      return char_length(doc_number) between 6 and 15;
    else
      return true;
  end case;
end;
$$;

-- 3) Columnas nuevas (if not exists → idempotente)
alter table public.customers
  add column if not exists doc_type text default 'SIN_DOC',
  add column if not exists doc_number text,
  add column if not exists fiscal_name text,
  add column if not exists address text,
  add column if not exists extra_data jsonb;

-- Los registros existentes sin documento quedan como SIN_DOC
update public.customers set doc_type = 'SIN_DOC' where doc_type is null;

-- 4) Constraints
alter table public.customers
  drop constraint if exists customers_doc_type_check;
alter table public.customers
  add constraint customers_doc_type_check
  check (doc_type in ('DNI', 'RUC', 'CE', 'PASAPORTE', 'SIN_DOC'));

-- Validación del dígito verificador a nivel BD (defensa en profundidad;
-- la UI valida antes de enviar)
alter table public.customers
  drop constraint if exists customers_doc_number_check;
alter table public.customers
  add constraint customers_doc_number_check
  check (public.validate_doc_number(doc_type, doc_number));

-- 5) Unicidad: un mismo DNI/RUC no puede duplicarse (SIN_DOC queda fuera)
create unique index if not exists customers_doc_unique
  on public.customers (doc_type, doc_number)
  where doc_type is not null
    and doc_type <> 'SIN_DOC'
    and doc_number is not null
    and doc_number <> '';

-- 6) Búsqueda rápida por documento (la UI busca por DNI/RUC)
create index if not exists customers_doc_number_idx
  on public.customers (doc_number);
