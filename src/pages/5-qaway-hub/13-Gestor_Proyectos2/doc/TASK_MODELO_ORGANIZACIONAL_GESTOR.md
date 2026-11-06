# Task: Modelo organizacional y multisede de Gestor

## Objetivo

Dejar Gestor preparado para organizaciones, unidades operativas, proyectos, trabajadores y responsabilidades, reutilizando la identidad del Hub sin conectar todavía login ni `auth.uid()`.

## Fases

- [x] Fase 0 — Auditoría de Inventario, Hub, Supabase y Gestor.
- [x] Fase 1 — Definir arquitectura oficial en `ARCHITECTURE_ROLES_SEDES.md`.
- [x] Fase 2 — Crear migración aditiva para unidades, miembros y relación proyecto-unidad.
- [x] Fase 3 — Agregar contexto organizacional nullable a proyectos existentes.
- [x] Fase 4 — Crear tipos y servicio de acceso a unidades y relaciones, sin dependencia de login.
- [x] Fase 5 — Preparar persistencia de proyectos con sincronización tolerante y contexto `tenantId` explícito (sin login).
- [x] Fase 5a — Persistir también las ediciones y mantener fallback local.
- [ ] Fase 5b — Cargar/clasificar proyectos históricos y unidades reales.
- [ ] Fase 6 — Conectar usuarios existentes del Hub mediante `public.users.id`.
- [ ] Fase 7 — Conectar login, tenant actual e invitaciones del Hub.
- [ ] Fase 8 — Activar RLS tenant-aware y permisos operativos.
- [ ] Fase 9 — Reemplazar gradualmente valores locales (`sedeNombre`, `assignedSedeIds`) por IDs persistidos.
- [ ] Fase 10 — Pruebas de regresión del cronograma, migración y aislamiento.

## Restricciones

- No crear otro login, usuario, invitación o tenant.
- No ejecutar migraciones automáticamente.
- No activar RLS estricto antes de clasificar los datos históricos.
- No usar `inventory_locations` como catálogo universal.
- No romper el cronograma actual.

## Criterio de terminado

El modelo queda listo cuando todos los proyectos históricos tienen tenant y unidad, las relaciones de usuarios están verificadas, el frontend usa IDs persistidos y RLS permite únicamente el alcance del usuario autenticado.
