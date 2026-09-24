-- Motor de stock: RPC add_stock versionado + blindaje de apply_sale_stock
-- (rechaza ventas que dejarían stock negativo y serializa por producto).

-- 1) add_stock: entrada de stock por compra/recepción. El servicio ya la
--    invocaba (purchaseService.updateStatus('received')) pero nunca existió
--    una definición versionada; queda inscrita aquí.
create or replace function public.add_stock(p_product_id uuid, p_quantity numeric)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_product_id is null then
    raise exception 'add_stock: producto requerido';
  end if;
  if p_quantity is null or p_quantity <= 0 then
    raise exception 'add_stock: cantidad debe ser mayor a 0';
  end if;

  perform pg_advisory_xact_lock(hashtext('qawaylab_stock_' || p_product_id::text));

  update public.products
     set stock = stock + p_quantity,
         commercial_status = case
           when stock + p_quantity > 0 and commercial_status = 'sold' then 'available'
           else commercial_status
         end
   where id = p_product_id;
end;
$$;

-- 2) apply_sale_stock endurecido: serializa por producto y rechaza el descuento
--    si dejaría stock negativo (venta sobre existencias inexistentes). Al ser un
--    trigger AFTER INSERT, el raise exception revierte la línea y la transacción.
create or replace function public.apply_sale_stock()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_sale_number text;
  v_status      text;
  v_stock       numeric;
begin
  if new.product_id is null then
    return new;
  end if;

  select sale_number, status into v_sale_number, v_status
    from public.sales
    where id = new.sale_id;

  if v_status = 'cancelled' then
    return new;
  end if;

  if new.quantity is null or new.quantity <= 0 then
    raise exception 'Cantidad de venta inválida';
  end if;

  -- Serializa el descuento por producto (evita doble-venta concurrente).
  perform pg_advisory_xact_lock(hashtext('qawaylab_stock_' || new.product_id::text));

  select stock into v_stock from public.products where id = new.product_id;
  if v_stock is null then
    raise exception 'El producto no existe';
  end if;
  if v_stock < new.quantity then
    raise exception 'Stock insuficiente: disponible %, se intentó vender %', v_stock, new.quantity;
  end if;

  insert into public.inventory_movements (product_id, type, quantity, reference, notes, created_by)
  values (new.product_id, 'sale', -new.quantity, v_sale_number, 'Venta ' || v_sale_number, auth.uid());

  update public.products
     set stock = stock - new.quantity,
         commercial_status = case
           when stock - new.quantity <= 0 then 'sold'
           else commercial_status
         end
   where id = new.product_id;

  return new;
end;
$$;

drop trigger if exists sale_items_apply_stock on public.sale_items;
create trigger sale_items_apply_stock
  after insert on public.sale_items
  for each row execute procedure public.apply_sale_stock();