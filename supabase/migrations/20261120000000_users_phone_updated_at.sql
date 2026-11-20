-- Teléfono canónico de la persona y fecha de modificación en public.users.
-- 20-nov-2026. Aditivo e idempotente. No cambia RLS: las políticas existentes
-- users_update_own_or_admin (auth.uid() = id OR is_admin()) y
-- users_tenant_read (is_tenant_member() AND tenant_id = get_auth_tenant_id())
-- ya cubren la columna nueva.

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz;

COMMENT ON COLUMN public.users.phone IS
  'Teléfono de contacto de la persona para comunicaciones ágiles (WhatsApp). Distinto de tenants.content.contact.phone, que es el teléfono de la empresa.';

COMMENT ON COLUMN public.users.updated_at IS
  'Fecha de última modificación del registro, mantenida por handle_updated_at().';

-- Las filas ya existentes toman la fecha de creación como punto de partida.
UPDATE public.users
SET updated_at = COALESCE(updated_at, created_at, now())
WHERE updated_at IS NULL;

ALTER TABLE public.users ALTER COLUMN updated_at SET NOT NULL;
ALTER TABLE public.users ALTER COLUMN updated_at SET DEFAULT now();

DROP TRIGGER IF EXISTS set_users_updated_at ON public.users;
CREATE TRIGGER set_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
