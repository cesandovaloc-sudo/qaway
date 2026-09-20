# Registro de Avance: Creación, Implementación y Conexión Multi-Tenant — CoraVet (Veterinaria)

**Módulo / Proyecto:** CoraVet (Web Veterinaria Multi-Tenant Piloto)  
**Ubicación:** `src/pages/11-Proyectos/2-Sistemas-digitales/3-Webs-y-landings/CoraVet/`  
**Fecha de inicio:** 2026-09-17  
**Rol en el ecosistema:** Tenant Piloto 001 — Validación de Frontend Independiente conectado a Núcleo Central Qaway Lab.

---

## 1. Visión y Filosofía del Modelo

> **"Cada cliente puede tener un frontend completamente diferente (diseño, rutas, componentes a medida), pero todos pueden conectarse al mismo núcleo de datos y servicios de Qaway mediante su tenant correspondiente."**

- **Frontend desacoplado:** No se fuerza una plantilla idéntica para todos los clientes. CoraVet tiene su propia identidad estética, jerarquía, rutas y componentes (`Home`, `PetShop`, `Booking`, `Services`, `Team`, `UviVet`, `Blog`).
- **Seguridad en la fuente (Supabase RLS):** El aislamiento multi-tenant no depende del cliente/navegador, sino de políticas `RLS` estrictas en PostgreSQL.
- **Despliegue progresivo y realista:** Se consolida primero la arquitectura de datos y el aislamiento en base de datos antes de pasar a Vercel y dominios.

---

## 2. Nomenclatura Profesional Validada (Patrón Dual ID + Client Code)

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ 1. ID INTERNO (Base de datos / FK inmutable)                                            │
│    • Columna: `id`                                                                     │
│    • Tipo: UUID (generado automáticamente via gen_random_uuid())                       │
│    • Inmutable, insensible a cambios comerciales, usado en relaciones, RLS e índices.  │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ 2. CLIENT_CODE (Identificador Humano para Soporte / WhatsApp)                          │
│    • Columna: `client_code` (ej. `QW-7K4P2`, `QW-9M8R3`)                              │
│    • Tipo: TEXT UNIQUE (generado por trigger con alfabeto Crockford Base32)            │
│    • Sin ambigüedades visuales (excluye 0, O, 1, I, L)                                 │
│    • Permite diferenciar clientes con idéntico nombre comercial ("CoraVet 1").        │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ 3. SLUG PÚBLICO (URL / Dominio / Frontend)                                             │
│    • Columna: `slug`                                                                   │
│    • Formato: `^[a-z0-9]+(-[a-z0-9]+)*$` (kebab-case estricto en minúsculas)           │
│    • Ejemplos: `coravet`, `coravet-surco`, `qaway-lab`                                 │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ 4. INTEGRACIÓN CON PASARELAS (Mercado Pago / Stripe)                                   │
│    • Configuración por tenant en: `payment_settings jsonb`                             │
│    • En transacciones: `metadata: { "tenant_id": "...", "client_code": "..." }`       │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Estado en Base de Datos (Supabase Remoto: `qrusdsqgygfolxfrafyd`)

### Tabla `public.tenants` (Activa y Operativa):
| ID (UUID) | Client Code | Slug | Nombre Comercial | Razón Social | Subdominio | Estado |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `00000000-0000-0000-0000-000000000001` | `QW-00001` | `qaway-lab` | Qaway Lab | Qaway Lab Digital S.A.C. | `qawaylab` | `active` |
| `06bacf31-6699-4ef5-9843-e58b835c6b2b` | `QW-7K4P2` | `coravet` | CoraVet | CoraVet Servicios Veterinarios Integrales | `coravet` | `active` |

### Pruebas Automatizadas Ejecutadas (`test_tenants.mjs`):
1. **Lectura pública activa:** Verificación de consulta vía clave anon (`@supabase/supabase-js`). Éxito (2 registros recuperados).
2. **Resolución por slug:** Simulación de frontend resolviendo `slug = 'coravet'` recuperando `branding` y `content`. Éxito.
3. **Blindaje RLS:** Intento de inserción anónima bloqueado por PostgreSQL (Error `42501: new row violates row-level security policy for table "tenants"`). Éxito.

---

## 4. Registro de Iteraciones

### [Iteración 01 — 2026-09-17]
- **Auditoría y Extracción:** Extracción del proyecto base `coravet-web-v4` en `src/pages/11-Proyectos/2-Sistemas-digitales/3-Webs-y-landings/CoraVet/`.
- **Creación de Bitácora:** Documentación del enfoque metodológico y arquitectura desacoplada (`creacion_app_implementacion.md`).
- **Registro del Estándar de Nomenclatura:** Adopción del Patrón Dual ID + `client_code` humano anti-confusión.

### [Iteración 02 — 2026-09-17]
- **Migración SQL Ejecutada:** `supabase/migrations/20260917130000_create_tenants_multi_tenant.sql` aplicada a la base de datos remota con `supabase db push`.
- **Creación de la Tabla `public.tenants`:** Incluye triggers de Base32 para `client_code`, validación de slugs y políticas RLS.
- **Siembra de Tenants:** Master Tenant (`QW-00001` - Qaway Lab) y Tenant Piloto (`QW-7K4P2` - CoraVet) registrados y verificados.
- **Prueba Automatizada de Blindaje:** Validación con `test_tenants.mjs` exitosa.

### [Iteración 03 — 2026-09-17]
- **Etapa 1 Culminada (Montaje y Verificación del Frontend CoraVet):**
  - **Candado Visual Estricto:** Diseño, layout, tipografías, componentes y responsive 100% preservados sin alteraciones de clases ni estructuras.
  - **Tokens de Color:** Incorporación de paleta corporativa CoraVet (`--color-cora-blue`, `--color-cora-deep`, `--color-cora-teal`, `--color-cora-pale`, `--color-cora-ink`) en `@theme` dentro de `src/index.css`.
  - **Aislamiento de Estilos:** Hoja de estilos `coravet-landing.css` encapsulada bajo `.coravet-app` para blindar el host Qaway Lab de cualquier fuga CSS.
  - **Enrutamiento Relativo Dual:** Implementación de `coraLink()` en `src/config/site.ts` soportando simultáneamente vista previa dentro de Qaway (`/proyectos/coravet/*`) y despliegue desacoplado en dominio propio (`/`).
  - **Cableado de Enlaces:** Enrutamiento interno envuelto con `coraLink()` en `Header.tsx`, `Footer.tsx`, `Blocks.tsx`, `Home.tsx` y `Team.tsx`.
  - **Contenedor Principal:** Creación de `CoraVetAppPage.jsx` con restauración instantánea de scroll en navegación y títulos dinámicos SEO para las 8 páginas (`/`, `/veterinaria`, `/uvivet`, `/equipo`, `/pet-shop`, `/blog`, `/contacto`, `/reservar-cita`).
  - **Registro en el Sistema:** Integración de la ruta `/proyectos/coravet/*` en `AppRouter.jsx` y catálogo en `routesRegistry.js`.
  - **Validación de Compilación:** Ejecución de `npm run build:dev` exitosa (`✓ built in 20.41s`, chunk `CoraVetAppPage` generado) y verificación de respuesta HTTP 200 en servidor Vite local.

### [Iteración 04 — 2026-09-17]
- **Etapa 2 Culminada (Conexión Multi-Tenant de Productos a Supabase):**
  - **Migración SQL Ejecutada:** `supabase/migrations/20260917141000_tenant_products_categories.sql` aplicada en Supabase remoto (`qrusdsqgygfolxfrafyd`).
  - **Blindaje de Fase 2:** Adición de `tenant_id` en `public.products` y `public.categories` con valor por defecto al Master Tenant de Qaway Lab (`00000000-0000-0000-0000-000000000001`). Los 20 productos de Qaway siguen 100% operativos.
  - **Espacio de Nombres Compuesto:** Sustitución de la restricción global de slug único por `unique(tenant_id, slug)` e indexación compuesta `(tenant_id, status)`.
  - **Siembra de Catálogo CoraVet:** 6 productos insertados y vinculados al tenant `06bacf31-6699-4ef5-9843-e58b835c6b2b` (Royal Canin, Bravecto, Shampoo, Cama, Pelota, Pack).
  - **Servicio Desacoplado Frontend:** Creación de `coravet-web-v4/src/services/coravetProducts.ts` con estrategia SWR (render instantáneo a 0ms y revalidación en segundo plano) más fallback resiliente en memoria.
  - **Conexión en Vista Visual (`PetShop.tsx`):** Cableado reactivo del hook `useCoraVetProducts()` y buscador en tiempo real, respetando rigurosamente el **Candado Visual** (márgenes, paddings, clases de botones, cuadrícula responsive y tipografía intactas).
  - **Validación Automatizada:** Comprobación de conteo independiente (20 productos Qaway vs 6 productos CoraVet en la misma tabla sin cruce de datos), build Vite exitoso (`✓ built in 14.77s`) y servidor local en puerto 4100 respondiendo HTTP 200.

### [Iteración 05 — 2026-09-17]
- **Etapa 3 Culminada (Aislamiento RLS en Transacciones, Pedidos y Citas):**
  - **Migración SQL Ejecutada:** `supabase/migrations/20260917143000_tenant_orders_payments.sql` aplicada en Supabase remoto.
  - **Blindaje de Checkout Fase 2:** Adición de `tenant_id` a `public.orders` y `public.payments` con default a Qaway Lab (`00000000-0000-0000-0000-000000000001`) e indexación `idx_orders_tenant_id`, `idx_orders_tenant_status` y `idx_payments_tenant_id`.
  - **Políticas RLS Activas:** Permiten el registro seguro de pedidos y leads desde el frontend público sin romper sesiones administrativas.
  - **Servicio Desacoplado de Transacciones:** Creación de `coravet-web-v4/src/services/coravetTransactions.ts` con `createCoraVetBooking()` y `sendCoraVetContact()`, etiquetando los registros con `tenant_id = '06bacf31-6699-4ef5-9843-e58b835c6b2b'` y `client_code = 'QW-7K4P2'`.
  - **Conexión en Formularios Visuales (`Booking.tsx` & `Contact.tsx`):** Cableado reactivo de formularios con estado de confirmación visual amigable, preservando al 100% las clases, márgenes, inputs y botones bajo el **Candado Visual**.
  - **Pruebas de Inserción y Aislamiento:** Inserción y recuperación de cita de prueba en `public.leads` con ID devuelto y limpieza posterior; build Vite exitoso (`✓ built in 17.43s`, chunk generado) y servidor local respondiendo HTTP 200 en ambos módulos.

### [Iteración 06 — 2026-09-17]
- **Consolidación del Cuarteto de Tenants (Enfoque Práctico sin Deconstruir Diseño):**
  - **Identificación y Selección:** En lugar de crear maquetas ficticias, se seleccionaron proyectos reales ya montados en la web:
    1. **Master Tenant:** `Qaway Lab` (`QW-00001`, slug: `qaway-lab`) — 20 productos/servicios maestros.
    2. **Tenant Piloto 001:** `CoraVet` (`QW-7K4P2`, slug: `coravet`) — 6 productos Pet Shop, citas médicas y transacciones.
    3. **Tenant 002:** `Estudio Contable Pro` (`QW-3M9K1`, slug: `epc-contable`) — 6 servicios profesionales contables y tributarios.
    4. **Tenant 003:** `Vallet Inmobiliaria` (`QW-4V8L2`, slug: `vallet-inmobiliaria`) — 3 servicios inmobiliarios de corretaje y gestión patrimonial.
  - **Migración SQL Ejecutada:** `supabase/migrations/20260917144000_seed_tenants_epc_vallet.sql` aplicada a Supabase remoto.
  - **Candado Visual 100% Respetado:** Cero alteraciones en las vistas, componentes, estilos, rutas o maquetación de EPC Contable y Vallet Inmobiliaria.
  - **Validación Automatizada de Aislamiento Cruzado:**
    - `QW-00001` Qaway Lab: 20 items.
    - `QW-7K4P2` CoraVet: 6 items.
    - `QW-3M9K1` Estudio Contable Pro: 6 items.
    - `QW-4V8L2` Vallet Inmobiliaria: 3 items.
    - Total: 35 registros conviviendo en la misma tabla `public.products` con filtrado estricto por `tenant_id` y cero fuga de datos.
  - **Compilación Limpia:** Ejecución de `npm run build:dev` exitosa (`✓ built in 12.65s`).

---

### [Iteración 07 — 2026-09-18]
- **Modelado de Suscripciones y Desacoplamiento de Academy:**
  - **Doble Base de Datos Física:** Consolidación de la arquitectura de 2 bases independientes:
    1. **BD Central (`qrusdsqgygfolxfrafyd.supabase.co`):** Núcleo comercial, usuarios, pagos, suscripciones, CRM y multi-tenancy maestro.
    2. **BD Academy (`jkstekoaiwdjpivkrsil.supabase.co`):** LMS educativo, cursos, módulos, lecciones, cuestionarios y matrículas.
  - **Acoplamiento Lógico:** Las bases no comparten claves foráneas físicas de PostgreSQL. El enlace se realiza mediante `course_id` (UUID) gestionado desde el motor comercial central.
  - **Migración SQL Ejecutada:** `supabase/migrations/20260918170000_subscription_plans_multi_tenant.sql`.
  - **Tablas Creadas:** `public.subscription_plans`, `public.subscription_plan_courses` y `public.subscriptions`, todas con columna `tenant_id` y RLS habilitado.

---

### [Iteración 08 — 2026-09-19 15:30]
- **Auditoría de Multi-Tenancy en Usuarios & CRM — Blindaje RLS en `users`, `leads` y `campaigns`:**
  - **Omisión Inicial Detectada y Auditada:**
    - Se identificó que la tabla `public.users` en PostgreSQL no poseía la columna `tenant_id`, lo que significaba que los usuarios autenticados no estaban asignados a una marca o tenant específico a nivel de base de datos.
    - Asimismo, las políticas RLS iniciales de `public.leads` y `public.campaigns` se encontraban configuradas de forma permisiva con `using (true)` o `using (auth.role() = 'authenticated')`, lo que permitía que cualquier usuario del CRM de una empresa pudiera consultar o filtrar los leads de otra empresa.
  - **Solución y Blindaje de Datos (Migración `20260919153000_strict_tenant_users_rls.sql`):**
    1. **Columna `tenant_id` en `public.users`:** Agregada como `tenant_id uuid references public.tenants(id) default '00000000-0000-0000-0000-000000000001'`.
    2. **Función de Seguridad en PostgreSQL:** Creación de `public.get_auth_tenant_id() security definer` para resolver de manera confiable y hermética el tenant del usuario autenticado actual (`auth.uid()`).
    3. **Sanitización de Datos Históricos:** 49 leads existentes huérfanos fueron asignados y aislados bajo el Master Tenant de Qaway Lab.
    4. **Políticas RLS Estrictas:**
       - `leads_tenant_isolation`: Permite lectura/modificación únicamente al administrador global (`public.is_admin()`) o a usuarios cuyo `tenant_id` coincida exactamente con el del lead (`tenant_id = public.get_auth_tenant_id()`).
       - `leads_anon_insert`: Permite la captación anónima pública de leads desde formularios web de cada marca etiquetándolos con su `tenant_id`.
       - `campaigns_tenant_isolation`: Mismo blindaje estricto para las campañas de marketing.
  - **Adaptación Frontend del CRM (`/hub/crm`):**
    - Actualización de `crmAdapter.js` para consultar y registrar leads filtrando estrictamente por `tenant_id`.
    - Integración de `activeTenant` en `CRMContext.jsx` con persistencia en `localStorage`.
    - Selector dinámico de tenants en la barra superior (`TopBar`) de `CRMPage.jsx` para alternar fluidamente entre marcas (Qaway Lab, CoraVet, EPC Contable, Vallet Inmobiliaria) filtrando leads, métricas y analíticas en tiempo real.
  - **Validación:** Build Vite dev exitoso (`✓ built in 21.75s`), carga HTTP 200 en `/hub/crm` y commit `940` registrado.

---

### [Iteración 09 — 2026-09-19 16:00]
- **Auditoría de Seguridad Externa de Tablas Legacy (El Paso Pasado por el Segundo Agente):**
  - **Contexto del Hallazgo Externo:**
    - Un agente auditor externo ejecutó un escaneo de seguridad en base a los archivos estáticos del repositorio (tomando como base histórica la migración `20260813000001_baseline_inventario.sql`).
    - **Reporte del Auditor:** Notificó que existían 19 tablas secundarias (de un catálogo/inventario ERP redactado en agosto: `customers`, `quotations`, `quotation_items`, `inventory_movements`, `bundles`, `catalogs`, `price_lists`, `pricing_rules`, `liquidation_campaigns`, `inventory_locations`, `shared_access_links`, `ai_suggestions`, etc.) que no tenían `alter table ... enable row level security;`.
    - **Riesgo:** Si un atacante utilizara la clave pública `anon` de Supabase, podría leer tablas de cotizaciones o clientes de almacén en caso de estar expuestas.
    - **Propuesta del Auditor:** Redactó el archivo `supabase/migrations/20260919160000_hardening_rls_public_catalog.sql` para forzar `ENABLE ROW LEVEL SECURITY` en esas 19 tablas.

---

### [Iteración 10 — 2026-09-19 16:45]
- **Aplicación en Producción y Migración Idempotente Defensiva (db push exitoso):**
  - **Obstáculo Encontrado al Aplicar:**
    - Al intentar ejecutar `npx supabase db push`, PostgreSQL devolvió: `ERROR: relation "public.ai_suggestions" does not exist (SQLSTATE 42P01)`.
    - **Causa Real:** La auditoría externa asumió que las 19 tablas de la migración de agosto ya existían físicamente en la base remota viva (`qrusdsqgygfolxfrafyd`), cuando en realidad en la base remota solo existía `public.categories` y el resto de tablas correspondían a un borrador local no desplegado.
  - **Ingeniería Defensiva Aplicada (Sin Parches, Solución Definitiva):**
    - Se refactorizó la migración `supabase/migrations/20260919160000_hardening_rls_public_catalog.sql` transformándola en un bloque PL/pgSQL dinámico condicional (`DO $$ BEGIN ... END $$;`).
    - Cada tabla es inspeccionada en `information_schema.tables`: si la tabla existe en la base remota, se le habilita RLS, se le crean sus políticas y sus grants; si no existe, la migración emite un aviso informativo (`RAISE NOTICE`) y continúa sin romper el despliegue.
  - **Resultado del Despliegue en Base Viva:**
    - Ejecución de `npx supabase db push`: **Éxito total (`Finished supabase db push`)**.
    - RLS y políticas aplicadas con éxito en `public.categories`.
    - Las tablas ausentes fueron omitidas con seguridad y el pipeline de migraciones quedó 100% limpio y sincronizado.
  - **Alineación de UI:** Enlace de retorno en `CRMPage.jsx` normalizado hacia `/hub`.

---

### [Iteración 11 — 2026-09-19 17:15]
- **Segunda Auditoría Externa y Corrección de Regresión en Políticas SELECT de Catálogo:**
  - **Hallazgo de la Segunda Auditoría (agente externo, contexto commit 942):**
    - El auditor externo identificó una **regresión** introducida al refactorizar la migración `20260919160000_hardening_rls_public_catalog.sql` a bloque PL/pgSQL condicional (Iteración 10): al generalizar el loop de catálogo con un `USING (true)` uniforme, se perdieron los filtros específicos que la versión original del auditor sí incluía.
    - **Impacto de la regresión:** Las tablas `bundles`, `catalogs`, `price_lists`, `pricing_rules` y `liquidation_campaigns`, cuando existan en producción, habrían quedado con SELECT completamente abierto al usuario anónimo — exponiendo borradores, catálogos privados, reglas de precio internas y campañas de liquidación inactivas.
    - **Puntos confirmados sin regresión por el auditor:** tablas sensibles solo staff, DELETE solo admin, links de invitado acotados a vigentes, `service_role` solo server, Academy 21/21 sin cambios, `.env` sin secretos expuestos.
  - **Corrección Aplicada (Migración `20260919171700_fix_catalog_select_gates.sql`):**
    - Cada tabla de catálogo con riesgo de exposición recibió su propio bloque `IF EXISTS ... THEN` con la política SELECT correcta:
      - `bundles` → `status = 'active' OR auth.role() = 'authenticated'`
      - `catalogs` → `is_public = true OR auth.role() = 'authenticated'`
      - `price_lists` → `is_active = true OR auth.role() = 'authenticated'`
      - `pricing_rules` → `is_active = true OR auth.role() = 'authenticated'`
      - `liquidation_campaigns` → `status = 'active' OR auth.role() = 'authenticated'`
      - `inventory_locations` → `auth.role() = 'authenticated'` (nunca acceso anon)
    - Las tablas de items/hijos (`bundle_items`, `catalog_items`, `product_images`, `product_variants`, `product_prices`, `liquidation_items`, `categories`) conservan `USING(true)` legítimamente porque no tienen estado propio y su acceso depende del objeto padre.
  - **Despliegue en Base Viva:**
    - `npx supabase db push` con migración `20260919171700_fix_catalog_select_gates.sql`: **Éxito total (`Finished supabase db push`)**.
    - Todas las tablas corregidas aún no existen en producción → emitieron `RAISE NOTICE` correctamente y el pipeline finalizó limpio.
  - **Deuda Estructural Registrada (pendiente de esquema futuro):**
    - Las 19 tablas legacy no tienen columna `tenant_id`. El aislamiento por cliente a nivel de fila es imposible con el esquema actual; el modelo real es catálogo compartido + roles. Si en el futuro EPC Contable o Vallet requieren catálogos propios en estas tablas, se deberá agregar `tenant_id` como primera prioridad antes de insertar datos.

---

### [Iteración 12 — 2026-09-19 22:55]
- **Auditoría run-1 completa (15 hallazgos) y corrección de 5 vulnerabilidades confirmadas:**
  - **Contexto de la Auditoría:** Auditoría de seguridad de 6 fases (recon + caza + validación adversarial) sobre commit `c13a0a93`. 15 confirmados, 1 needs_validation, 11 rechazados con prueba.
  - **F-01 CRÍTICO RESUELTO — orders expuesto a anon:**
    - `orders_public_read USING(true)` (migración 20260917143000:52-53) + `GRANT SELECT, INSERT ON orders TO anon` (20260812000001:185) permitían leer todos los pedidos sin autenticación.
    - **Corrección:** `20260919224500_fix_f01_orders_anon_exposure.sql` — DROP policy abierta, nueva policy `orders_read_own_or_admin` (solo dueño o admin), REVOKE SELECT TO anon en orders/order_items/payments, INSERT anon acotado a `status='pending' AND user_id IS NULL`.
  - **F-03 ALTO RESUELTO — leads/campaigns SELECT anon:**
    - Rama `(auth.uid() IS NULL AND tenant_id IS NOT NULL)` en SELECT de leads y campaigns permitía enumerar PII de leads de cualquier tenant conociendo su UUID.
    - **Corrección:** `20260919224600_fix_f03_leads_campaigns_anon_select.sql` — Eliminada la rama anon de SELECT. INSERT anon mantenido para formularios públicos.
  - **F-04 + F-07 ALTOS RESUELTOS — trigger handle_new_user sin allowlist:**
    - El trigger leía `role` y `tenant_id` de `raw_user_meta_data` sin validación: `signUp({ data: { role: 'admin', tenant_id: 'uuid-victima' } })` asignaba rol admin y tenant arbitrario al registrarse.
    - La función `get_user_role()` en commerce.sql tenía fallback a metadata si `public.users.role` era NULL.
    - **Corrección:** `20260919224700_fix_f04_f07_trigger_no_metadata_tenant_role.sql` — Trigger reescrito: `role` siempre `'viewer'`, `tenant_id` siempre `NULL`. Nueva RPC `admin_assign_user_tenant(user_id, tenant_id, role)` con allowlist de roles y verificación `is_admin()`. Solo `authenticated` puede ejecutarla.
  - **F-05 ALTO RESUELTO — XSS en blog sin DOMPurify:**
    - `sanitizeAndDecodeContent()` en `ArticleDetailPage.jsx` solo decodificaba entidades HTML (convirtiendo `&lt;script&gt;` en `<script>` activo) sin sanitizar. DOMPurify ausente en package.json.
    - **Corrección:** `npm install dompurify @types/dompurify`. Función actualizada para sanitizar con `DOMPurify.sanitize()` con perfil HTML estricto (FORBID_TAGS: script, iframe, object, embed, form; FORBID_ATTR: onerror, onload, onclick, etc.).
  - **Migraciones legacy refactorizadas a bloques defensivos:**
    - Migraciones `20260919173000`, `20260919174000`, `20260919175000` (tenant_id en tablas ERP) refactorizadas de SQL estático a bloques `DO $$ IF EXISTS ... END $$` — mismo patrón que hardening (Iter. 10). Corrige error 42P01 en base remota viva donde esas tablas no existen.
  - **Despliegue en base viva:** `npx supabase db push` con las 5 migraciones de seguridad: **Éxito total**.
  - **Build:** ✓ 20.10s — DOMPurify visible como `purify.es-B1ZDZv49.js` en bundle.
  - **Pendientes registrados (Fase 5 no bloqueante):**
    - F-02 (precio desde cliente sin trigger server-side): requiere trigger PostgreSQL en `order_items` que valide `unit_price` contra `products.price`.
    - F-06/F-08 (Academy USING(true) en profiles/modules + self-enroll sin pago): requiere migraciones en BD Academy (`jkstekoaiwdjpivkrsil`).
    - F-12 (webhook MP fail-open): verificar `supabase secrets list` para confirmar `MERCADOPAGO_WEBHOOK_SECRET`.
