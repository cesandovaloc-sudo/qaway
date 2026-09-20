-- ============================================================
-- F-02 + F-07: precio autoritativo + rol sin metadata (central)
-- F-02: trigger fija unit_price/subtotal desde products.price y
-- recalcula orders.total. El cliente puede mentir; la BD manda.
-- Solo sobrescribe cuando product_id existe en catálogo (items
-- custom/bundles sin match conservan valor + quedan en auditoría).
-- F-07: get_user_role() solo fila users; NULL deniega (sin fallback
-- a metadata manipulable).
-- Auditoría run-2, 2026-09-20. Idempotente. Sin commit.
-- ============================================================

-- ─── F-02: precio desde catálogo ───
create or replace function public.pin_order_item_price()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_price numeric;
begin
  if new.product_id is not null then
    select price into v_price from public.products where id = new.product_id;
    if found then
      new.unit_price := v_price;
      new.subtotal := v_price * coalesce(new.quantity, 1);
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists order_items_pin_price on public.order_items;
create trigger order_items_pin_price
  before insert or update on public.order_items
  for each row execute function public.pin_order_item_price();

create or replace function public.recalc_order_total()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order uuid;
begin
  v_order := coalesce(new.order_id, old.order_id);
  update public.orders
  set total = coalesce((select sum(subtotal) from public.order_items where order_id = v_order), 0)
  where id = v_order;
  return null;
end;
$$;

drop trigger if exists order_items_recalc_total on public.order_items;
create trigger order_items_recalc_total
  after insert or update or delete on public.order_items
  for each row execute function public.recalc_order_total();

-- ─── F-07: rol solo de users ───
create or replace function public.get_user_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role from public.users where id = auth.uid()
$$;
