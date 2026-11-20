# 20261120 · Estándar de tablas, `users.phone` y `wa.me` real

**Orden:** "aquí crea la carpeta, no en otro lado, aquí registramos lo relacionado a tablas", "has las correcciones correspondientes para que quede habilitado", "hasta terminar la tarea" y "has commit total primero, luego ejecutas".

## 1. Commit previo

- `2237e654 2026-11-20_commit-total_estandar-tablas-perfil-unico-y-framework-imagenes` (26 archivos). **Sin push.**

## 2. Base de datos (aplicada y verificada)

Migración: `supabase/migrations/20261120000000_users_phone_updated_at.sql` (aplicada con Supabase MCP, `success: true`).

- `public.users.phone text` — COMMENT: teléfono de contacto de la persona para comunicaciones ágiles, distinto de `tenants.content.contact.phone`.
- `public.users.updated_at timestamptz NOT NULL DEFAULT now()` — backfill desde `created_at`.
- Trigger `set_users_updated_at BEFORE UPDATE` → `public.handle_updated_at()`.
- RLS sin cambios: 6 políticas intactas, `relrowsecurity = true`. `users_update_own_or_admin` sigue siendo `auth.uid() = id OR is_admin()`: **la persona sí edita su propio teléfono**.

Verificación SQL posterior: columnas, trigger y políticas consultados en vivo; todo en verde.

## 3. Código

| Archivo | Cambio |
|---|---|
| `src/services/perfilVisibleService.ts` | `PerfilVisible.phone` y `contactos[]`; `phone` agregado a ambos `.select()` de `users`. |
| `src/services/comunicacionesService.ts` | **Nuevo.** Helpers puros: `normalizarTelefono`, `formatearTelefono`, `telefonoParaGuardar`, `linkWhatsApp`, `linkLlamada`, `telefonoDeContacto`. Si no hay número real, devuelve `null`. |
| `modules/configuracion/PerfilTab.tsx` | Campo "Teléfono / WhatsApp", validación 8–15 dígitos, incluido en `hayCambios` y en el único botón "Guardar cambios"; `users.update({ phone })` como única fuente (no se copia a `user_metadata`); `invalidarPerfilVisible()` e `invalidarCacheAcceso()` tras guardar. |
| `modules/usuarios/UsuariosView.tsx` | Teléfonos hidratados desde `users.phone`; eliminados los dos fallbacks falsos `+51 900 000 000`; `sendWhatsApp` usa `linkWhatsApp` y avisa si no hay número. |
| `modules/hitos/HitosView.tsx` | Eliminado el teléfono fijo `+51987654321`; "WhatsApp 1-Clic" resuelve el número del responsable desde `users.phone`; si no hay número muestra "Sin teléfono". |
| `modules/equipo/EquipoDrawer.tsx` | WhatsApp y llamada usan `users.phone`; si no hay número muestran estado deshabilitado. |
| `modules/reportes-2/territory-reporter/TerritoryReporterV2View.tsx` | `buildWhatsAppUrl` valida el número; los dos botones del gestor resuelven `users.phone` por nombre. |
| `modules/reportes-2/territory-reporter/territoryMonitoringService.ts` | Eliminado el fallback falso `+51964112233`. |
| `modules/equipo/EquipoExpedienteModal.tsx` y `organigrama/OrganigramaDetailPanel.tsx` | El teléfono mostrado sale de `users.phone`. |
| `modules/equipo/EquipoNuevoModal.tsx` y `modules/usuarios/UsuariosView.tsx` | Se quitaron los campos locales de teléfono: el número se registra sólo en Mi Perfil. |
| `UsuariosView.tsx`, `modules/equipo/mockData.ts`, `organigramaDemoData.ts` y `TerritoryReporterV2View.tsx` | Se vaciaron todos los números falsos de los datos semilla. Queda sólo el placeholder del input de Mi Perfil. |

## 4. Validación

- `npm run typecheck`: limpio.
- `grep`: ya no quedan números falsos en el módulo; los constructores `wa.me` están en `comunicacionesService.ts:49-53` y `TerritoryReporterV2View.tsx:37-40`, y ambos validan antes de devolver un enlace.
- Sin `build`, `dist` ni `build:dev`. Sin push.

## 5. Pendientes registrados

En `doc2/10-Estandar-tablas-y-nomenclatura/10.1-estandar-tablas-y-nomenclatura.md`: nomenclatura `gp_*` vs global, excepciones heredadas y posible tabla hija `user_contactos` si se requieren varios teléfonos por persona.
