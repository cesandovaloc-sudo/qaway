-- ============================================================
-- FASE 2 · Cron y graduación de entrenamiento (CONTRATO)
-- 2026-09-22 · Autor: 1-agente-supabase
--
-- PREPARADA — NO AÚN EN PUSH. Se aplica con `npx supabase db push`
-- SOLO tras el OK del usuario. Las Edge Functions se despliegan aparte
-- (`supabase functions deploy`), nunca desde `db push`.
-- Idempotente.
-- ============================================================

create extension if not exists pg_cron;
create extension if not exists pg_net;

-- ─── 1. Graduación de sesiones de entrenamiento ───
-- Contrato (agente "agentes", SUPABASE_MIGRATION.md v2):
-- sesión activa con >= 24h y metrics.compliance_score >= 90 → 'graduated'
-- y tenants.ai_settings.trainingMode = false. 60-90 → 'extended'; < 60 → 'failed'.
create or replace function public.graduate_training_sessions()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_updated integer := 0;
  v_tenant uuid;
  v_compliance numeric;
  v_status text;
  r record;
begin
  for r in
    select id, tenant_id, metrics, graduated_at
    from public.training_sessions
    where status = 'active'
      and started_at <= now() - interval '24 hours'
  loop
    v_compliance := coalesce((r.metrics->>'compliance_score')::numeric, 0);
    if v_compliance >= 90 then
      v_status := 'graduated';
      v_tenant := r.tenant_id;
    elsif v_compliance >= 60 then
      v_status := 'extended';
    else
      v_status := 'failed';
    end if;

    update public.training_sessions
       set status = v_status,
           graduated_at = case when v_status = 'graduated' then now() else graduated_at end
     where id = r.id;

    if v_status = 'graduated' and v_tenant is not null then
      update public.tenants
         set ai_settings = jsonb_set(
               coalesce(ai_settings, '{}'::jsonb),
               '{trainingMode}',
               'false'::jsonb
             )
       where id = v_tenant;
    end if;

    v_updated := v_updated + 1;
  end loop;

  return v_updated;
end;
$$;

-- ─── 2. Scheduler ───
-- Graduación: cada hora (podría ser .schedule previa limpia).
select cron.unschedule('graduate-training-hourly')
where exists (select 1 from cron.job where jobname = 'graduate-training-hourly');

select cron.schedule('graduate-training-hourly', '0 * * * *', 'SELECT public.graduate_training_sessions();');

-- ─── 3. Embeddings nocturnos (SE ACTIVA al desplegar la Edge Function) ───
-- Precondición: `supabase functions deploy generate-embeddings --secret-name ...`
-- y la service key disponible como secret de la función. Entonces descomentar:
--
-- select cron.unschedule('embeddings-nightly')
-- where exists (select 1 from cron.job where jobname = 'embeddings-nightly');
--
-- select cron.schedule(
--   'embeddings-nightly',
--   '0 3 * * *',
--   $$
--   select net.http_post(
--     url := 'https://qrusdsqgygfolxfrafyd.supabase.co/functions/v1/generate-embeddings',
--     headers := jsonb_build_object(
--       'Authorization', 'Bearer ' || current_setting('app.service_role_key', true),
--       'Content-Type', 'application/json'
--     ),
--     body := '{}'
--   );
--   $$
-- );

-- Nota: `app.service_role_key` se fija en la sesión del cron (Dashboard) o se
-- reemplaza por el secret Vault; NUNCA se hardcodea aquí.