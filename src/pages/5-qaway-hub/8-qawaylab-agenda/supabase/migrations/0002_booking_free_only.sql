-- 0002 Agenda: anon solo reserva eventos gratuitos (run-2 H8)
-- Antes: anon insertaba confirmed/pending en eventos con precio>0 y
-- ocupaba slots sin pagar (create-payment inexistente/incompleto).
-- Ahora: anon solo si el evento es gratuito; lo pago va por staff
-- autenticado (owner_bookings) o futura RPC de pago. Idempotente.

drop policy if exists "anon_insert_booking" on public.bookings;
create policy "anon_insert_booking" on public.bookings
  for insert to anon with check (
    status = 'confirmed'
    and payment_status = 'pending'
    and payment_intent_id is null
    and exists (
      select 1 from public.event_types e
      where e.id = event_type_id
        and e.is_active = true
        and coalesce(e.price, 0) = 0
    )
  );
