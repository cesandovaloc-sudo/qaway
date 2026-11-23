-- ============================================================
-- Invitaciones con Área/Unidad + RLS para gestor_unidad_miembros
-- 1) Agrega unidad_id (text -> gestor_unidades.id) a user_invites.
-- 2) Alinea unit_id en gestor_unidad_miembros a text si gestor_unidades.id es text
--    y crea índice único (unit_id, user_id) para upsert idempotente.
-- 3) Actualiza handle_new_user() para vincular automáticamente al usuario
--    en gestor_unidad_miembros al aceptar la invitación.
-- 4) Habilita RLS y políticas tenant-aware en gestor_unidad_miembros.
-- 2026-11-23. Idempotente.
-- ============================================================

-- ─── 1. Columna unidad_id en user_invites ───
ALTER TABLE public.user_invites
  ADD COLUMN IF NOT EXISTS unidad_id text REFERENCES public.gestor_unidades(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS user_invites_unidad_idx ON public.user_invites(unidad_id);

-- ─── 2. Asegurar tabla gestor_unidad_miembros y alinear tipo de unit_id a text ───
CREATE TABLE IF NOT EXISTS public.gestor_unidad_miembros (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE,
  unit_id text NOT NULL REFERENCES public.gestor_unidades(id) ON DELETE CASCADE,
  user_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
  responsibility text,
  is_primary boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS gestor_unidad_miembros_unit_idx ON public.gestor_unidad_miembros(unit_id);
CREATE INDEX IF NOT EXISTS gestor_unidad_miembros_user_idx ON public.gestor_unidad_miembros(user_id);

DO $$
DECLARE
  v_unit_id_type text;
  v_gu_id_type text;
BEGIN
  SELECT data_type INTO v_gu_id_type
    FROM information_schema.columns
   WHERE table_schema = 'public' AND table_name = 'gestor_unidades' AND column_name = 'id';

  SELECT data_type INTO v_unit_id_type
    FROM information_schema.columns
   WHERE table_schema = 'public' AND table_name = 'gestor_unidad_miembros' AND column_name = 'unit_id';

  IF v_gu_id_type = 'text' AND v_unit_id_type = 'uuid' THEN
    ALTER TABLE public.gestor_unidad_miembros
      DROP CONSTRAINT IF EXISTS gestor_unidad_miembros_unit_id_fkey;

    ALTER TABLE public.gestor_unidad_miembros
      ALTER COLUMN unit_id TYPE text USING unit_id::text;

    ALTER TABLE public.gestor_unidad_miembros
      ADD CONSTRAINT gestor_unidad_miembros_unit_id_fkey
      FOREIGN KEY (unit_id)
      REFERENCES public.gestor_unidades(id)
      ON DELETE CASCADE;
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS gestor_unidad_miembros_unit_user_uniq
  ON public.gestor_unidad_miembros(unit_id, user_id)
  WHERE user_id IS NOT NULL;

-- ─── 3. Trigger handle_new_user(): vincula unidad organizacional si la invitación trae unidad_id ───
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_invite public.user_invites%rowtype;
BEGIN
  SELECT * INTO v_invite FROM public.user_invites
  WHERE lower(email) = lower(new.email)
    AND accepted_at IS NULL
    AND expires_at > now()
  ORDER BY created_at DESC
  LIMIT 1;

  IF found THEN
    INSERT INTO public.users (id, email, full_name, last_name, role, tenant_id)
    VALUES (
      new.id, new.email,
      coalesce(new.raw_user_meta_data ->> 'full_name', new.email),
      coalesce(new.raw_user_meta_data ->> 'last_name', null),
      v_invite.role, v_invite.tenant_id
    )
    ON CONFLICT (id) DO UPDATE SET
      email = excluded.email,
      full_name = coalesce(excluded.full_name, public.users.full_name),
      last_name = coalesce(excluded.last_name, public.users.last_name);

    INSERT INTO public.user_app_roles (user_id, tenant_id, app_id, role)
    SELECT new.id, v_invite.tenant_id, a.id, v_invite.role
    FROM public.app_catalog a
    WHERE a.slug = ANY (v_invite.app_slugs)
    ON CONFLICT (user_id, tenant_id, app_id) DO UPDATE SET role = excluded.role;

    IF v_invite.unidad_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.gestor_unidades gu
      WHERE gu.id = v_invite.unidad_id
        AND gu.tenant_id = v_invite.tenant_id::text
    ) THEN
      INSERT INTO public.gestor_unidad_miembros (tenant_id, unit_id, user_id, is_primary, status)
      VALUES (v_invite.tenant_id, v_invite.unidad_id, new.id, true, 'active')
      ON CONFLICT (unit_id, user_id) WHERE user_id IS NOT NULL DO UPDATE
        SET status = 'active', updated_at = now();
    END IF;

    UPDATE public.user_invites SET accepted_at = now() WHERE id = v_invite.id;
  ELSE
    INSERT INTO public.users (id, email, full_name, last_name, role, tenant_id)
    VALUES (
      new.id, new.email,
      coalesce(new.raw_user_meta_data ->> 'full_name', new.email),
      coalesce(new.raw_user_meta_data ->> 'last_name', null),
      'viewer', null
    )
    ON CONFLICT (id) DO UPDATE SET
      email = excluded.email,
      full_name = coalesce(excluded.full_name, public.users.full_name),
      last_name = coalesce(excluded.last_name, public.users.last_name);
  END IF;
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ─── 4. RLS completa para public.gestor_unidad_miembros ───
ALTER TABLE public.gestor_unidad_miembros ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "gestor_unidad_miembros_plataforma_all" ON public.gestor_unidad_miembros;
CREATE POLICY "gestor_unidad_miembros_plataforma_all"
  ON public.gestor_unidad_miembros FOR ALL TO authenticated
  USING (public.is_platform_admin())
  WITH CHECK (public.is_platform_admin());

DROP POLICY IF EXISTS "gestor_unidad_miembros_select_empresa" ON public.gestor_unidad_miembros;
CREATE POLICY "gestor_unidad_miembros_select_empresa"
  ON public.gestor_unidad_miembros FOR SELECT TO authenticated
  USING (
    public.user_can_use_app('gestor-proyectos')
    AND tenant_id = public.get_auth_tenant_id()
  );

DROP POLICY IF EXISTS "gestor_unidad_miembros_insert_empresa" ON public.gestor_unidad_miembros;
CREATE POLICY "gestor_unidad_miembros_insert_empresa"
  ON public.gestor_unidad_miembros FOR INSERT TO authenticated
  WITH CHECK (
    public.user_can_use_app('gestor-proyectos')
    AND public.user_app_role('gestor-proyectos') IN ('admin', 'editor')
    AND tenant_id = public.get_auth_tenant_id()
    AND EXISTS (
      SELECT 1 FROM public.gestor_unidades gu
      WHERE gu.id = unit_id::text
        AND gu.tenant_id = public.get_auth_tenant_id()::text
    )
  );

DROP POLICY IF EXISTS "gestor_unidad_miembros_update_empresa" ON public.gestor_unidad_miembros;
CREATE POLICY "gestor_unidad_miembros_update_empresa"
  ON public.gestor_unidad_miembros FOR UPDATE TO authenticated
  USING (
    public.user_can_use_app('gestor-proyectos')
    AND public.user_app_role('gestor-proyectos') IN ('admin', 'editor')
    AND tenant_id = public.get_auth_tenant_id()
  )
  WITH CHECK (
    public.user_can_use_app('gestor-proyectos')
    AND public.user_app_role('gestor-proyectos') IN ('admin', 'editor')
    AND tenant_id = public.get_auth_tenant_id()
    AND EXISTS (
      SELECT 1 FROM public.gestor_unidades gu
      WHERE gu.id = unit_id::text
        AND gu.tenant_id = public.get_auth_tenant_id()::text
    )
  );

DROP POLICY IF EXISTS "gestor_unidad_miembros_delete_empresa" ON public.gestor_unidad_miembros;
CREATE POLICY "gestor_unidad_miembros_delete_empresa"
  ON public.gestor_unidad_miembros FOR DELETE TO authenticated
  USING (
    public.user_can_use_app('gestor-proyectos')
    AND public.user_app_role('gestor-proyectos') IN ('admin', 'editor')
    AND tenant_id = public.get_auth_tenant_id()
  );
