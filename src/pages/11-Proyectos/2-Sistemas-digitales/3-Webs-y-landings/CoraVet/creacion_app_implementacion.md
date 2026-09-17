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




