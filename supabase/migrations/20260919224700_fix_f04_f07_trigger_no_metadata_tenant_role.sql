-- ============================================================
-- F-04 + F-07 FIX ALTO: Trigger handle_new_user sin allowlist
-- El trigger leia tenant_id y role de raw_user_meta_data sin
-- validacion: un atacante podia registrarse con tenant_id arbitrario
-- y role=admin en el signUp. Correccion: ignorar completamente
-- esos campos del metadata; asignacion solo via admin RPC.
-- 2026-09-19 — Auditoria run-1.
-- ============================================================

-- Reescribir trigger: solo nombre + email; role siempre 'viewer'; tenant_id siempre NULL
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, role, tenant_id)
  VALUES (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.email),
    'viewer',  -- SIEMPRE viewer al registrarse; rol se cambia SOLO por admin
    NULL       -- tenant_id NUNCA desde metadata; se asigna via RPC admin
  )
  ON CONFLICT (id) DO UPDATE SET
    email     = excluded.email,
    full_name = coalesce(excluded.full_name, public.users.full_name);
    -- NO actualizar role ni tenant_id en conflicto; solo admin puede cambiarlos
  RETURN new;
END;
$$;

-- RPC segura para que un admin asigne un usuario a un tenant
-- Solo accesible si el caller es admin (verificado por is_admin())
CREATE OR REPLACE FUNCTION public.admin_assign_user_tenant(
  p_user_id   uuid,
  p_tenant_id uuid,
  p_role      text DEFAULT 'viewer'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Solo administradores pueden asignar tenants a usuarios';
  END IF;

  -- Validar que el tenant exista
  IF NOT EXISTS (SELECT 1 FROM public.tenants WHERE id = p_tenant_id) THEN
    RAISE EXCEPTION 'Tenant no encontrado: %', p_tenant_id;
  END IF;

  -- Validar rol dentro del allowlist
  IF p_role NOT IN ('viewer', 'editor', 'manager', 'admin') THEN
    RAISE EXCEPTION 'Rol invalido: %. Roles permitidos: viewer, editor, manager, admin', p_role;
  END IF;

  UPDATE public.users
  SET tenant_id = p_tenant_id,
      role      = p_role
  WHERE id = p_user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Usuario no encontrado: %', p_user_id;
  END IF;
END;
$$;

-- Revocar ejecucion publica de la RPC; solo authenticated puede llamarla
-- (is_admin() dentro verifica que sea admin)
GRANT EXECUTE ON FUNCTION public.admin_assign_user_tenant(uuid, uuid, text) TO authenticated;
REVOKE EXECUTE ON FUNCTION public.admin_assign_user_tenant(uuid, uuid, text) FROM anon;