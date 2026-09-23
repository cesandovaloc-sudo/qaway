-- ============================================================
-- FASE 2 · Cron embeddings nocturno (idempotente)
-- 2026-09-23 · agente-supabase
-- Credencial de servicio para net.http_post -> generate-embeddings:
--   · Se lee de la GUC app.service_role_key (definible una sola vez por el
--     superusuario vía SQL Editor: alter database postgres set
--     app.service_role_key = '<service role>';  -- para rotación futura).
--   · El valor aplicado en este entorno quedó compilado en la función por
--     security definer (owner postgres, EXECUTE revocado a public). NUNCA
--     debe commitearse un literal en este archivo.
-- ============================================================

-- Dispara generate-embeddings vía pg_net desde pg_cron.
create or replace function public.cron_embeddings_job()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_key text := current_setting('app.service_role_key', true);
begin
  if v_key is null or v_key = '' then
    raise exception 'service role key no disponible (GUC app.service_role_key sin definir)';
  end if;

  perform net.http_post(
    url := 'https://qrusdsqgygfolxfrafyd.supabase.co/functions/v1/generate-embeddings',
    headers := jsonb_build_object('Authorization', 'Bearer ' || v_key, 'Content-Type', 'application/json'),
    body := '{}'
  );

  return jsonb_build_object('queued', true);
end;
$$;

-- Valida la cadena completa una vez (encola un request ahora; respuesta en logs).
do $$ begin perform public.cron_embeddings_job(); end $$;

-- No exponer la función a roles de app (nada de REST para esto).
revoke execute on function public.cron_embeddings_job() from public;

select cron.unschedule('embeddings-nightly')
where exists (select 1 from cron.job where jobname = 'embeddings-nightly');

select cron.schedule('embeddings-nightly', '0 3 * * *', 'select public.cron_embeddings_job();');