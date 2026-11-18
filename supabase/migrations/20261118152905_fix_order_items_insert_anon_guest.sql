-- Fix 2026-11-18: checkout guest fallaba con 42501 al insertar order_items
-- porque la politica referenciaba public.orders directamente y anon no tiene SELECT.
-- El helper SECURITY DEFINER lleva la lectura a privilegios de definer.
begin;

create or replace function public.can_insert_order_item(check_order_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.orders o
    where o.id = check_order_id
      and (
        (auth.uid() is not null and o.user_id = auth.uid())
        or o.user_id is null
      )
  );
$$;

grant execute on function public.can_insert_order_item(uuid) to anon, authenticated;

drop policy if exists "order_items_insert_own_or_guest" on public.order_items;
create policy "order_items_insert_own_or_guest" on public.order_items
  for insert
  with check (public.can_insert_order_item(order_id));

commit;
