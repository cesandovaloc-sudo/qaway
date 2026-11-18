# Bitácora · 18-nov-2026 · Etapa 6-E — paquete `6.4` FASE 0-4 aplicado

**Proyecto:** `qrusdsqgygfolxfrafyd` · **Ejecutor:** agente opencode · **Autorización:** "si aplica 6 E" del responsable (18-nov), tras exposición previa del plan en chat.
**Paquete seguido:** `6-Vinculacion-de-catalogos/6.4-Paquete-ejecucion-produccion.md` (NO la cadena vieja de 6.3).
**Alcance:** FASE 0 (diagnósticos), FASE 1 (`0005`, `0006b`) y FASE 4 (`0010`). FASE 2/3 ya vivos desde Etapa 5 ⇒ omitidos. `0011` es opcional y **no se aplicó** (requiere decisión expresa).

---

## 1 · Migraciones aplicadas y versionadas

| Orden | Versión en vivo | Nombre | Archivo versionado |
|---|---|---|---|
| 1 | `20261118154545` | `20261114_0005_gestor_unidades_orden_idx` | `supabase/migrations/20261118154545_0005_gestor_unidades_orden_idx.sql` |
| 2 | `20261118154612` | `20261114_0006b_gestor_unidades_rls` | `supabase/migrations/20261118154612_0006b_gestor_unidades_rls.sql` |
| 3 | `20261118154654` | `20261115_0010_gp_ciclo_vida_rpc` | `supabase/migrations/20261118154654_0010_gp_ciclo_vida_rpc.sql` |

El mapeo se leyó de `supabase_migrations.schema_migrations` (columnas `version` y `name`), no se inferió. Los tres SQL son los archivos verbatim de `3.7-SQL-propuesto-sin-ejecutar/` (idempotentes, sin `DROP/TRUNCATE`).

## 2 · FASE 0 — diagnósticos (D-1…D-8)

| Chequeo | Resultado |
|---|---|
| Tablas `gp_*` vivas | 36 físicas; 34 numeradas Etapa 5 ✅ |
| Catálogos (D-2/D-3/D-8) | `gp_estados_proyecto_c` 5 activos, `gp_estados_ejecucion_c`, `gp_prioridades_c`, `gp_roles_proyecto_c` con `codigo`+`permisos`+`activo` ✅ |
| Helpers Hub (D-4) | `get_auth_tenant_id()`, `user_can_use_app(text)`, `user_app_role(text)`, `is_platform_admin()`, `gp_is_platform_admin()` ✅ |
| `app_catalog` (D-5) | `gestor-proyectos` = `5003ed7a-c97b-4956-a0d0-9ddd5dc9dd44` ✅ (`0006a` ya aplicado) |
| `gestor_unidades` (D-6) | 251 filas, 251 semillas `unit-%` con `tenant_id NULL`; `tenant_id` TEXT; **sin** columna `orden`, **sin** índice `parent_unit_id`; RLS activa con política `Permitir todo en gestor_unidades` ✅ diagnóstico |
| Suscripción y rol (D-7) | `tenant_app_subscriptions` activa + `user_app_roles.role='admin'` para `c9e456b9…` / tenant `8bbc04cb…` ✅ ⇒ riesgo R-6 mitigado, `0006b` seguro |
| Prerrequisitos `0010` | `gp_proyectos`, `gp_personas.user_id`, `gp_proyecto_miembros_r` (`proyecto_id`, `persona_id`, `rol_proyecto_codigo`, `estado`), `gp_eventos_auditoria` (`empresa_id`, `entidad`, `payload_antes`, `payload_despues`, `actor_user_id`, `origen`, `accion`, `ocurrido_at`) ✅ |
| Seed de roles | 6 roles activos; `administrador` con todas las acciones, `gestor` con `iniciar/pausar/reanudar/completar`, resto `{}` ✅ |

Nota: un filtro preliminar buscó `tenant_id`/`detalle` en `gp_eventos_auditoria` y no los encontró; la RPC usa `empresa_id`/`payload_*`, que sí existen. No fue un bloqueo.

## 3 · FASE 1 y FASE 4 — cambios aplicados

- **`0005`:** `gestor_unidades.orden integer` (sin valor por defecto; 251 filas siguen en NULL) + `idx_gestor_unidades_parent`. No se reordenó nada.
- **`0006b`:** retirada `Permitir todo en gestor_unidades`; creadas 5 políticas: `plataforma_all`, `select_empresa`, `insert_empresa`, `update_empresa`, `delete_empresa`. Cast uuid→text, regex anti-basura, escritura solo `admin|editor`, catálogo nacional (`tenant NULL`) solo lectura.
- **`0010`:** `gp_rol_proyecto_actual(uuid) → text` (STABLE, SECURITY DEFINER) y `gp_cambiar_estado_proyecto(uuid, text, text DEFAULT NULL) → jsonb` (VOLATILE, SECURITY DEFINER, `search_path=public`). Pre-checks internos con `RAISE` limpio. UPDATE + `STATE_CHANGE` en la misma transacción. `REVOKE ... FROM PUBLIC/anon` y `GRANT EXECUTE ... TO authenticated`.

## 4 · Verificación en vivo

| Verificación | Resultado |
|---|---|
| V-02 / V-03 / V-04 | `orden integer` ✅ · `idx_gestor_unidades_parent` ✅ · 251 unidades ✅ |
| V-05 / V-06 | 5 políticas, "Permitir todo" ausente ✅ · 251 semillas intactas ✅ · `orden` con 0 valores ✅ · RLS sigue activa ✅ |
| §5-a funciones | 2 filas, `prosecdef=true`; `gp_rol_proyecto_actual` volatilidad `s`, `gp_cambiar_estado_proyecto` volatilidad `v`; `search_path=public` ✅ |
| §4 grants | Solo `authenticated`, `postgres`, `service_role`; **sin `anon` ni `PUBLIC`** ✅ |
| RPC positiva (`planificacion` → `en_curso`, admin real, `rollback`) | `{accion:"iniciar", estado_anterior:"planificacion", estado_nuevo:"en_curso", motivo:null}` ✅ |
| Auditoría atómica | 1 fila `STATE_CHANGE` con `payload_antes`/`payload_despues`, `actor_user_id` real y `origen='app'` ✅ |
| `completar` sin motivo | `MOTIVO_REQUERIDO` (P0001), sin UPDATE ✅ |
| `en_curso` → `planificacion` | `TRANSICION_INVALIDA` (P0001), sin UPDATE ✅ |
| `anon` invocando la RPC | `42501 permission denied for function` ✅ |
| `gp_rol_proyecto_actual` sin sesión | `NULL` (fail-closed) ✅ |
| Residuos | 0 proyectos, 0 eventos `STATE_CHANGE`, 0 marcadores `VERIFICA%`; 3 migraciones registradas ✅ |

Las pruebas funcionales usaron `set local role` + JWT real del admin (`c9e456b9…`, tenant `8bbc04cb…`) y **todas se revirtieron con `rollback`**. `gp_proyectos` estaba vacío (0 filas), así que el proyecto fue sintético y temporal.

## 5 · Estado resultante y pendiente

- **6-E queda aplicado en la base:** la barrera servidor existe y está probada; el front ya llama esta firma desde `gpCicloVidaService`.
- **No ejecutado:** `0011` (guard anti-bypass, opcional), `0100` (backfill, Etapa 7), 6-C "Mis asignaciones", 6-D "Identidad real en shell".
- **No declarado validado:** `3.9` §6.2 (RLS con identidades reales de negocio) sigue pendiente de ejecución y anotación; las pruebas de esta bitácora son de RPC con `set local role`, no de recorrido completo desde el navegador.
- Riesgo preexistente no ampliado: las políticas de `gestor_unidades` dependen de que la suscripción siga `active`; eso es responsabilidad operativa del Hub.
