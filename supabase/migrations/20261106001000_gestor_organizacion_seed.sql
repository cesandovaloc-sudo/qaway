-- Preparación de datos históricos de Gestor.
-- No se asignan tenants automáticamente: la clasificación debe ser explícita.
-- Este archivo documenta el punto de control antes de activar RLS.

-- Verificación esperada antes de continuar:
-- select id, code, name, tenant_id, central_unit_id
-- from public.gestor_proyectos
-- order by created_at;

-- La asignación de tenant y unidad se realizará cuando el propietario de los
-- datos históricos confirme la organización correspondiente.
