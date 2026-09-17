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
