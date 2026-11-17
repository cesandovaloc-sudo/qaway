-- ==============================================================================
-- GESTOR DE PROYECTOS 2 · ETAPA 6.4 · SQL OPCIONAL — SIN EJECUTAR
-- Archivo: 20261115_0011_gp_proyectos_estado_guard_opcional.sql
-- Fecha: 2026-11-15 | Guardia anti-bypass del estado (hallazgo R-4 del paquete 6.4)
-- APLICACIÓN: OPCIONAL (decisión del responsable). Recomendada: justo tras 0010.
-- Reversión simple: DROP TRIGGER trg_gp_proyectos_estado_guard ON public.gp_proyectos;
-- ==============================================================================
-- HALLAZGO AUDITADO (paquete 6.4 · §6 R-4):
--   La política gp_proyectos_update de 0004 (L229-232) autoriza UPDATE a
--   CUALQUIER miembro de la empresa (gp_is_empresa_member) sobre TODAS las
--   columnas. Un usuario autenticado podría, por PostgREST directo, escribir
--   gp_proyectos.estado_codigo SIN pasar por la RPC 0010: sin mapa de
--   transiciones, sin motivo obligatorio y SIN auditoría.
--   La RPC es la barrera de la APP; la RLS no puede distinguir "UPDATE vía RPC"
--   de "UPDATE directo" porque no existe predicado de rol de invocación.
--
-- SOLUCIÓN NO DESTRUCTIVA (este archivo): trigger BEFORE UPDATE que bloquea el
-- cambio de estado_codigo cuando el ejecutor NO es:
--   · la vía definida del dominio (funciones SECURITY DEFINER propiedad de
--     postgres → dentro del definer current_user = 'postgres'), ni
--   · operación de plataforma aprobada (gp_is_platform_admin() = true),
--   ni un rol de administración (service_role: backfill/admin, 0100).
-- Los cambios de OTRAS columnas (nombre, presupuesto, fechas…) NO se tocan:
-- siguen gobernados por la política RLS de 0004 exactamente igual que hoy.
-- SIN DROP/TRUNCATE de datos. IDEMPOTENTE (CREATE OR REPLACE + trigger nombrado).
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.gp_bloquear_estado_directo()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.estado_codigo IS DISTINCT FROM OLD.estado_codigo
     AND current_user IN ('authenticated')
     AND NOT COALESCE(public.gp_is_platform_admin(), false) THEN
    RAISE EXCEPTION
      'ESTADO_VIA_RPC: el cambio de estado del proyecto debe ejecutarse con la RPC gp_cambiar_estado_proyecto (valida transición, motivo obligatorio y auditoría). Escritura directa de estado_codigo denegada.';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_gp_proyectos_estado_guard ON public.gp_proyectos;
CREATE TRIGGER trg_gp_proyectos_estado_guard
  BEFORE UPDATE ON public.gp_proyectos
  FOR EACH ROW EXECUTE FUNCTION public.gp_bloquear_estado_directo();

-- ==============================================================================
-- VERIFICACIÓN (requiere 0002/0003/0004/0010 aplicados):
-- a) Por RPC con sesión real autorizada (gerente/admin) → cambia y audita
--    (comportamiento normal intacto: el definer corre como postgres).
-- b) UPDATE directo con un cliente AUTENTICADO no-plataforma:
--      update public.gp_proyectos set estado_codigo='completado' where id='<uuid>';
--    → ERROR 'ESTADO_VIA_RPC: …' y la transacción completa aborta (nada a medias).
-- c) UPDATE directo de OTRAS columnas con sesión autorizada por la RLS de 0004
--    → sigue funcionando sin interferencia de este trigger.
-- d) SQL Editor (postgres) y service_role (backfill 0100) → sin interferencia.
--
-- RIESGO CONOCIDO / NOTA DE FUTURO: si algún día se aprueba una NUEVA vía
-- legítima de cambio de estado (otra función SECURITY DEFINER propiedad de
-- postgres), no requiere cambio: correrá como 'postgres'. Si en cambio se
-- quisiera permitir escritura directa desde el rol 'authenticated', habría que
-- revisar explícitamente esta guardia (no ampliarla por accidente).
-- ==============================================================================
