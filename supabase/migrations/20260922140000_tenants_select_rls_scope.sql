-- ============================================================
-- RLS: public.tenants -> aislamiento por tenant y sin lectura anónima.
-- 2026-09-22
--
-- CORRECCIÓN ÚNICA (sin tablas ni estructura nueva, idempotente):
--   * platform_admin (public.is_admin())           -> todos los tenants
--   * miembro autenticado del tenant               -> SOLO su tenant
--   * anónimo                                       -> sin acceso (revoke select)
--
-- Justificación de la comprobación previa:
--   - Ninguna página/consulta pública del repo consume los campos
--     de tenants (client_code, features, payment_settings).
--   - Las lecturas en src son todas autenticadas; las edge functions
--     usan service_role (anulan RLS) y no se ven afectadas.
--   - client_code / features / payment_settings NO son necesarios
--     públicamente, por lo que se retira la lectura anónima en vez
--     de dejarla expuesta.
-- ============================================================

drop policy if exists "tenants_select_active_public" on public.tenants;
drop policy if exists "tenants_select_admin_all" on public.tenants;

create policy "tenants_select_scope" on public.tenants
  for select
  using (
    public.is_admin()
    or (auth.uid() is not null and id = public.get_auth_tenant_id())
  );

revoke select on public.tenants from anon;