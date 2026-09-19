# Biblia Sagrada de Arquitectura Supabase, Multi-Tenancy y Gobernanza de Datos

**Qaway Lab Digital — Documento Maestro de Ingeniería y Seguridad**  
**Última Actualización:** 2026-09-19  
**Responsable:** Agente A22 (Antigravity)  
**Estado:** VIGENTE — Cumplimiento OBLIGATORIO por todos los agentes y desarrolladores

> Este documento es la fuente de verdad absoluta sobre cómo Qaway Lab gestiona, asegura y evoluciona su infraestructura de base de datos. Cualquier decisión de arquitectura, migración o política de seguridad que contradiga lo aquí establecido debe ser escalada al usuario propietario antes de ejecutarse.

---

## 1. Topología Física de Bases de Datos

El ecosistema opera bajo exactamente **dos bases de datos físicas independientes** en Supabase:

| Base de Datos | Project Ref | Dominio de Negocio | Tiene `tenants`? | Aislamiento |
|:---|:---|:---|:---|:---|
| **BD Central (Hub & Comercio)** | `qrusdsqgygfolxfrafyd` | CRM, Usuarios, Pagos, Suscripciones, Inventario, Blog, Agentes Studio | **SÍ (Núcleo Maestro)** | Multi-Tenant por `tenant_id` + RLS |
| **BD Academy (LMS Educativo)** | `jkstekoaiwdjpivkrsil` | Cursos, módulos, lecciones, cuestionarios, matrículas, progreso de alumnos | **NO (Aislada por diseño)** | Monolito educativo independiente |

### Regla Sagrada de Acoplamiento entre Bases

- **PROHIBIDO:** Crear Foreign Keys físicas de PostgreSQL entre BD Central y BD Academy.
- **Permitido:** Acoplamiento lógico vía `course_id uuid` gestionado desde el motor comercial central.
- Si un agente recibe instrucción de "conectar academy con hub a nivel de base de datos", debe **detener la ejecución, alertar al usuario y esperar instrucción explícita**.

---

## 2. Tenants Registrados en Producción (2026-09-19)

| UUID | Client Code | Slug | Nombre Comercial | Estado |
|:---|:---|:---|:---|:---|
| `00000000-0000-0000-0000-000000000001` | `QW-00001` | `qaway-lab` | Qaway Lab Digital | `active` |
| `06bacf31-6699-4ef5-9843-e58b835c6b2b` | `QW-7K4P2` | `coravet` | CoraVet Veterinaria | `active` |
| *(generado)* | `QW-3M9K1` | `epc-contable` | Estudio Contable Pro | `active` |
| *(generado)* | `QW-4V8L2` | `vallet-inmobiliaria` | Vallet Inmobiliaria | `active` |

---

## 3. Estándar de Nomenclatura Multi-Tenant (Patrón Dual ID + Client Code)

Cada tenant usa tres identificadores con responsabilidades diferentes:

1. **`id` (UUID)** — Inmutable, usado en FK, RLS e índices. Nunca exponer al usuario final.
2. **`client_code` (TEXT UNIQUE)** — Identificador humano para soporte/WhatsApp. Generado por trigger con alfabeto Crockford Base32 (excluye 0, O, 1, I, L para evitar confusión visual).
3. **`slug` (TEXT UNIQUE)** — Kebab-case para URL, subdominio y frontend. Formato estricto `^[a-z0-9]+(-[a-z0-9]+)*$`.
4. **`payment_settings` (JSONB)** — Configuración de pasarela de pago por tenant. Toda transacción debe incluir `metadata: { tenant_id: "...", client_code: "..." }`.

---

## 4. Estándar de Row Level Security (RLS) — REGLAS SAGRADAS

### 4.1 Principio Base

> **Ninguna tabla operativa privada puede tener `using (true)` o `with check (true)` como política única.**  
> Todo acceso a datos entre tenants distintos es una BRECHA DE SEGURIDAD.

### 4.2 Función de Seguridad Maestra en PostgreSQL

Esta función es el pilar de todo el blindaje RLS. Debe existir siempre en la BD Central:

```sql
create or replace function public.get_auth_tenant_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select tenant_id from public.users where id = auth.uid() limit 1;
$$;
```

**No debe ser eliminada ni modificada sin autorización explícita del usuario propietario.**

### 4.3 Política de Aislamiento para Tablas CRM (`leads`, `campaigns`)

```sql
-- Aislamiento estricto: solo el admin o el tenant propio pueden ver/modificar sus datos
create policy "leads_tenant_isolation" on public.leads
  for all
  using (
    public.is_admin() or
    tenant_id = public.get_auth_tenant_id()
  )
  with check (
    public.is_admin() or
    tenant_id = public.get_auth_tenant_id()
  );

-- Captacion publica anonima desde formularios de cada marca
create policy "leads_anon_insert" on public.leads
  for insert
  with check (tenant_id is not null);
```

### 4.4 Tabla `public.users` — Regla Clave

- Cada usuario autenticado debe estar vinculado a un tenant mediante `tenant_id uuid references public.tenants(id)`.
- Valor por defecto: Master Tenant `00000000-0000-0000-0000-000000000001`.
- Un usuario sin `tenant_id` explícito queda bajo Qaway Lab hasta reasignación.

### 4.5 Tablas `public.products` y `public.categories`

- Columna `tenant_id` activa con restricción única compuesta: `unique(tenant_id, slug)`.
- Índices compuestos: `(tenant_id, status)` para consultas eficientes.
- RLS habilitado: cada tenant solo ve y modifica sus propios productos.

---

## 5. Protocolo de Migraciones Defensivas (OBLIGATORIO)

### Regla de Oro: No asumir que una tabla existe en producción

Un error crítico es redactar una migración que aplique `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` en una tabla que aún no fue creada en el entorno remoto.

**Consecuencia:** Error fatal `ERROR: relation "public.nombre_tabla" does not exist (SQLSTATE 42P01)` que bloquea el pipeline completo de `supabase db push`.

### Solución Estándar: Bloque PL/pgSQL Condicional

```sql
DO $$
DECLARE
  t text;
  mis_tablas text[] := ARRAY['tabla_a', 'tabla_b', 'tabla_c'];
BEGIN
  FOREACH t IN ARRAY mis_tablas LOOP
    IF EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = t
    ) THEN
      EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', t);
      -- ... crear politicas y grants
      RAISE NOTICE 'RLS aplicado en public.%', t;
    ELSE
      RAISE NOTICE 'Tabla public.% no existe en este entorno (saltando).', t;
    END IF;
  END LOOP;
END $$;
```

### Reglas Adicionales para Migraciones

- **Idempotencia obligatoria:** Usar `DROP POLICY IF EXISTS` antes de `CREATE POLICY`.
- **Nunca usar `DROP TABLE`** sin orden explícita del usuario y confirmación de que no hay datos productivos.
- **Nunca hacer resets destructivos** de esquemas o datos sin autorización explícita.
- **Formato de nombre de migración:** `YYYYMMDDHHMMSS_descripcion_breve.sql`

---

## 6. Mapa de Apps del Hub y su Necesidad de Multi-Tenancy

| App / Modulo | Ruta | BD | Multi-Tenancy | Estado |
|:---|:---|:---|:---|:---|
| CRM | `/hub/crm` | Central | CRITICO | Implementado con `tenant_id` y selector de marca |
| Inventario | `/hub/inventario` | Central | SI | Tablas legacy aun sin `tenant_id` |
| Agenda / Calendario | `/hub/agenda` | Central | SI | Pendiente columna `tenant_id` |
| Tienda / E-commerce | `/hub/tienda` | Central | SI | `products` y `categories` con `tenant_id` |
| Academy LMS | `/academy` | Academy | NO (aislada) | Base independiente |
| Suscripciones | `/hub/suscripciones` | Central | SI | `subscription_plans` con `tenant_id` |
| Blog | `/hub/blog` | Central | SI (futuro) | Pendiente |

---

## 7. Registro Historico de Auditorias y Correcciones de Seguridad

### 2026-09-17 — Iteraciones 01 a 06: Arquitectura Multi-Tenant Base

- Creacion de tabla `public.tenants` con triggers de Client Code Base32, slugs y RLS.
- Registro de 4 tenants: Qaway Lab (master), CoraVet, EPC Contable, Vallet Inmobiliaria.
- Migracion de `public.products` y `public.categories` con `tenant_id`.
- Seedeo de catalogos independientes: 35 productos en una sola tabla, cero fuga de datos.
- RLS en `public.orders` y `public.payments` para pedidos y citas de cada tenant.
- Conexion de Frontend CoraVet con BD Central (products, leads, bookings).

### 2026-09-18 — Iteracion 07: Suscripciones y Doble BD

- Creacion de `public.subscription_plans`, `public.subscription_plan_courses` y `public.subscriptions` con `tenant_id` y RLS.
- Formalizacion de la topologia de doble base de datos: BD Central + BD Academy.

### 2026-09-19 15:30 — Iteracion 08: Blindaje Critico CRM (Auditoria Interna A22)

**Problema Detectado:** `public.users` no tenia `tenant_id`. Las politicas de `public.leads` y `public.campaigns` tenian `using (true)`: cualquier usuario autenticado veia TODOS los leads de TODAS las marcas.

**Acciones Ejecutadas:**
- Migracion `20260919153000_strict_tenant_users_rls.sql` aplicada exitosamente.
- Columna `tenant_id` anadida a `public.users` con FK a `public.tenants`.
- Funcion `public.get_auth_tenant_id() security definer` creada.
- 49 leads historicos huerfanos sanitizados y asignados al Master Tenant.
- Politicas RLS estrictas (`leads_tenant_isolation`, `campaigns_tenant_isolation`) implementadas.
- CRM Frontend actualizado: `crmAdapter.js`, `CRMContext.jsx`, `CRMPage.jsx` con selector de tenants en TopBar.
- Build Vite exitoso (21.75s). Commit 940 registrado.

### 2026-09-19 16:00 — Iteracion 09: Auditoria de Seguridad Externa (Segundo Agente)

**Contexto:** Un agente auditor externo fue despachado en un worktree congelado en commit `2ce94515` (2026-09-16), sin visibilidad de los commits del 17 al 19 de Septiembre (commits 920 a 941).

**Hallazgo:** 19 tablas del modulo ERP/inventario legacy (migracion `20260813000001_baseline_inventario.sql`) sin `ALTER TABLE ... ENABLE ROW LEVEL SECURITY`: `customers`, `quotations`, `quotation_items`, `inventory_movements`, `bundles`, `catalogs`, `price_lists`, `pricing_rules`, `liquidation_campaigns`, `inventory_locations`, `shared_access_links`, `ai_suggestions`, etc.

**Diferencia con lo que A22 ya habia resuelto:** A22 (Iter. 08) resolvia el aislamiento entre tenants en tablas operativas vivas (leads, campaigns, users). El auditor externo encontro tablas de catalogo/ERP legacy sin RLS habilitado del todo. Los dos hallazgos son complementarios, no contradictorios.

**Producto del Auditor:** `supabase/migrations/20260919160000_hardening_rls_public_catalog.sql` con SQL estatico para las 19 tablas.

### 2026-09-19 16:45 — Iteracion 10: Correccion Defensiva y Despliegue Exitoso

**Problema al Aplicar:** `npx supabase db push` respondio:
`ERROR: relation "public.ai_suggestions" does not exist (SQLSTATE 42P01)`

**Causa Raiz:** Las 19 tablas del auditor existian en archivos de migracion locales de Agosto, pero **nunca habian sido desplegadas en la base remota viva**. Solo `public.categories` existia en produccion.

**Solucion Definitiva (Sin Parches):**
Migracion refactorizada de SQL estatico a **bloque PL/pgSQL condicional** que inspecciona `information_schema.tables` antes de actuar. Tablas ausentes emiten `RAISE NOTICE` y continuan sin abortar el pipeline.

**Resultado:**
- `npx supabase db push` exitoso (Finished supabase db push).
- `public.categories` — RLS y politicas aplicadas.
- 18 tablas restantes — Omitidas con aviso informativo. Pipeline 100% limpio.
- Enlace de retorno en `CRMPage.jsx` normalizado a `/hub`.

---

## 8. Alertas Permanentes y TODOs de Arquitectura

### ADVERTENCIA: Tablas ERP legacy sin `tenant_id`
Si en el futuro se crean en produccion tablas como `customers`, `quotations`, `inventory_movements`, deben incluir `tenant_id` como primera columna antes de cualquier dato productivo. Aplicar RLS sin esa columna no resuelve el aislamiento entre marcas.

### PENDIENTE: `shared_access_links` con SELECT anon
Los links de invitado (guest checkout) se validan via `anon key`. Riesgo controlado pero presente. Solucion definitiva: mover la validacion de tokens a una **Edge Function de Supabase** con `service_role` privada.

### NOTA: BD Academy sin tabla `tenants`
Por diseno, Academy es un monolito educativo. Si en el futuro se requiere multi-tenancy educativo (multiples escuelas en la misma LMS), se debe crear una tabla `academy_tenants` equivalente y replicar el patron RLS de la BD Central.
