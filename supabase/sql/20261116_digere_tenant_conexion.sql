-- ============================================================
-- Tenant DIGERE — MINEDU: dependencias del admin del Hub (3.9 §5)
-- Fuente de verdad: doc2/3-Diseno-de-base-de-datos/3.9 (§4-§5, §7)
-- y doc2/5-Creacion-guiada-en-Supabase-v2 (5.0/5.1/5.2 v2.2).
--
-- Este script SOLO resuelve las dependencias del Hub (paso 2 del
-- procedimiento §4 de 3.9, entre 0006a y 0005):
--   1) tenant activo (onboarding completado → login directo al panel)
--   2) suscripción gestor-proyectos activa
--   3) gerente csandoval.digere como admin de la marca
--
-- NO TOCA las tablas gestor_* (unidades, proyectos, miembros):
--   * Las 251 semillas DRE/UGEL/GRE quedan tenant NULL — son el
--     "catálogo nacional" de supervisión (3.9 §7). La conexión del
--     gerente es VER propias + catálogo nacional (lectura), nunca
--     estampar tenant_id sobre las sedes externas.
--   * Las sedes externas NO tienen usuarios ni acceso (regla del
--     proyecto); el guard 5b detiene el script si existieran miembros.
--   * La migración de datos legacy a gp_* la hace el backfill 0100
--     (tracker v2 Paso 5) con v_empresa_default = UUID de este tenant
--     que este script imprime en el autodiagnóstico.
--
-- Idempotente. No borra nada. Correr en SQL Editor (qrusdsqgygfolxfrafyd).
-- ============================================================
do $$
declare
  v_tenant  uuid;
  v_app     uuid;
  v_user    uuid;
  v_seeds   int := 0;
begin
  -- ─── 1. Tenant (activo + onboarding completado: el login va directo
  --        al panel, no al asistente comercial) ───
  insert into public.tenants (name, slug, status, features)
  values ('DIGERE — MINEDU', 'digere', 'active',
          '{"onboarding_completed": true}'::jsonb)
  on conflict (slug) do update
    set status   = 'active',
        features = coalesce(public.tenants.features, '{}'::jsonb)
                   || '{"onboarding_completed": true}'::jsonb
  returning id into v_tenant;

  -- ─── 2. App registrada en el catálogo (0006a ya aplicada o pre-existente) ───
  select id into v_app from public.app_catalog where slug = 'gestor-proyectos';
  if v_app is null then
    raise exception 'gestor-proyectos no está en app_catalog. Aplica primero 20261114_0006a (3.9 §4 paso 1).';
  end if;

  -- ─── 3. Suscripción activa del tenant a la app (3.9 §5.1) ───
  insert into public.tenant_app_subscriptions (tenant_id, app_id, plan, status)
  values (v_tenant, v_app, 'premium', 'active')
  on conflict (tenant_id, app_id) do update
    set status = 'active',
        plan   = 'premium';

  -- ─── 4. Gerente: admin de la marca (3.9 §5.2) ───
  select id into v_user from public.users where lower(email) = 'csandoval.digere@gmail.com';
  if v_user is null then
    raise exception 'La cuenta csandoval.digere@gmail.com no existe aún. Créala desde Hub → Usuarios → "Alta con contraseña" (empresa DIGERE, rol admin, app Gestor de Proyectos) y vuelve a correr este script: tenant y suscripción ya quedaron listos.';
  end if;

  update public.users
     set tenant_id = v_tenant,
         role      = 'admin'
   where id = v_user;

  insert into public.user_app_roles (user_id, tenant_id, app_id, role)
  values (v_user, v_tenant, v_app, 'admin')
  on conflict (user_id, tenant_id, app_id) do update set role = excluded.role;

  -- ─── 5. GUARDIAS DE ESTRUCTURA (solo lectura, fail-closed) ───

  -- 5a. El catálogo nacional debe estar intacto: exactamente las 251
  --     semillas unit-00x con tenant NULL (3.9 §7 y §1.2 #4).
  select count(*) into v_seeds
    from public.gestor_unidades
   where id like 'unit-%' and tenant_id is null;
  if v_seeds <> 251 then
    raise exception 'Autodiagnóstico FALLÓ: se esperaban 251 semillas nacionales (unit-*, tenant NULL) y hay %. Alguien modificó el catálogo — revisar antes de continuar (3.9 §7).', v_seeds;
  end if;

  -- 5b. Las sedes externas NO tienen usuarios (regla del proyecto).
  --     La tabla de miembros puede ni existir aún (3.9 §1.1: fuera de
  --     alcance) — por eso el guard con to_regclass.
  if to_regclass('public.gestor_unidad_miembros') is not null then
    declare
      v_miembros int;
    begin
      select count(*) into v_miembros
        from public.gestor_unidad_miembros
       where user_id is not null;
      if v_miembros > 0 then
        raise exception 'Autodiagnóstico FALLÓ: hay % miembros con usuario vinculados a unidades. Las sedes externas NO deben tener acceso aún. Revisar gestor_unidad_miembros.', v_miembros;
      end if;
    end;
  end if;

  -- ─── 6. Autodiagnóstico ───
  raise notice 'Tenant DIGERE listo: % (%)',
    (select name from public.tenants where id = v_tenant), v_tenant;
  raise notice 'UUID para v_empresa_default del backfill 0100 (anótalo, 5.1 §3): %',
    v_tenant;
  raise notice 'Suscripción gestor-proyectos: %',
    (select status from public.tenant_app_subscriptions
      where tenant_id = v_tenant and app_id = v_app);
  raise notice 'Gerente csandoval.digere@gmail.com → role=%, tenant=%',
    (select role from public.users where id = v_user),
    (select tenant_id from public.users where id = v_user);
  raise notice 'Catálogo nacional intacto: % semillas unit-* con tenant NULL', v_seeds;
  raise notice 'Autodiagnóstico OK. Cadena pendiente por aplicar (3.9 §4): 0005 → 0006b → (tablas gp_*) → 0004 v3. El backfill 0100 es el PASO FINAL de migración de datos legacy a gp_*, en entorno de pruebas.';
end $$;
