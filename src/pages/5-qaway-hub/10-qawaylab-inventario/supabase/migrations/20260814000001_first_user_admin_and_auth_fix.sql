-- ============================================================
-- Migración: Primer usuario = admin + mejora handle_new_user
-- Fecha: 2026-08-14
-- Problema: Nuevo usuario se crea con role 'viewer' → RLS bloquea
--           acceso a business_settings → "Error al cargar la configuración"
-- Solución: Primer usuario de cada tenant = admin automáticamente
-- ============================================================

-- 1) Actualizar handle_new_user para que el primer usuario sea admin
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  is_first_user boolean;
BEGIN
  -- Verificar si es el primer usuario registrado
  SELECT NOT EXISTS (
    SELECT 1 FROM public.users WHERE role = 'admin'
  ) INTO is_first_user;

  INSERT INTO public.users (id, email, full_name, role)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data ->> 'full_name', new.email),
    -- Primer usuario → admin; siguientes → viewer
    CASE WHEN is_first_user THEN 'admin' ELSE 'viewer' END
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN new;
END;
$$;

-- 2) Si ya existen usuarios pero ninguno es admin, promover al más antiguo
-- (para bd's existentes que se actualizan con esta migración)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.users WHERE role = 'admin') THEN
    UPDATE public.users
    SET role = 'admin'
    WHERE id = (
      SELECT id FROM public.users
      ORDER BY created_at ASC
      LIMIT 1
    );
  END IF;
END
$$;
