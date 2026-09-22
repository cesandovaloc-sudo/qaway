-- ============================================================
-- FASE 1 · Módulo 2-Agentes · Triggers
-- 2026-09-22 · Autoptr: agente-supabase
--
-- Solo automatismo operativo real en Fase 1:
--   actualizar conversations.last_activity_at al insertar message.
-- Los triggers de auto-embedding NO se crean (no-op en la guía);
-- los embeddings se llenan en Fase 2 con el batch generate-embeddings.
-- Idempotente.
-- ============================================================

create or replace function public.update_conversation_activity()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.conversations
     set last_activity_at = now()
   where id = new.conversation_id;
  return new;
end;
$$;

drop trigger if exists trigger_conversation_activity on public.messages;
create trigger trigger_conversation_activity
  after insert on public.messages
  for each row execute function public.update_conversation_activity();