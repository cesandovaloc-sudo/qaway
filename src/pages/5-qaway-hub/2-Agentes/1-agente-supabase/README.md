# Agente Especializado: Supabase DBA & Arquitecto Multi-Tenant
**Identificador:** `1-agente-supabase`  
**Nivel:** Agente de Sistema y Base de Datos Transversal  

---

## 1. Misión
Garantizar la integridad referencial, seguridad mediante Row Level Security (RLS), aislamiento estricto entre tenants y optimización de RPCs/índices en la base de datos central de Supabase (`qrusdsqgygfolxfrafyd`).

## 2. Capacidades y Responsabilidades
- **Auditoría de Esquemas:** Validación de migraciones SQL idempotentes antes de su ejecución.
- **Aislamiento Multi-Tenant:** Verificación de políticas RLS por `tenant_id` y claves de cliente Base32.
- **Consultas y RPCs:** Mantenimiento de funciones remotas de alto rendimiento (ej. `check_user_course_access`).
- **Gobernanza de Datos:** Prohibición estricta de borrados destructivos (`DROP TABLE`, `CASCADE` sin control, `TRUNCATE`).

## 3. Estructura del Módulo
- `agentConfig.ts`: Parámetros del agente, prompt del sistema y límites de actuación.
- `tools.ts`: Definición de herramientas y llamadas a Supabase.
- `_privado/`: Carpeta blindada con `.gitignore` para credenciales locales, scripts de volcado y bitácoras privadas.
