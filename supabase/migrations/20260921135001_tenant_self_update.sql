-- ============================================================
-- Marca auto-gestionable: su admin edita branding/contacto
-- Solo su fila (tenant propio), nunca slug/status/client_code.
-- Lo sensible (slug, estado, dominios) queda en plataforma.
-- Estándar v4: incremental, idempotente. Sin commit ni push.
-- ============================================================

drop policy if exists "tenants_self_update" on public.tenants;
create policy "tenants_self_update" on public.tenants
  for update using (
    public.is_tenant_admin() and id = public.get_auth_tenant_id()
  )
  with check (
    id = public.get_auth_tenant_id()
    and slug = (select slug from public.tenants where id = tenants.id)
    and status = (select status from public.tenants where id = tenants.id)
    and client_code = (select client_code from public.tenants where id = tenants.id)
  );

grant update (name, legal_name, branding, content, features, payment_settings) on public.tenants to authenticated;
