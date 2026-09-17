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

## 3. Plan Maestro de Implementación (18 Requerimientos + 7 Adiciones Clave)

### Paso 1: Migración SQL en Supabase
- Creación de la tabla `public.tenants` con todos los campos especificados:
  `id`, `client_code`, `slug`, `name`, `legal_name`, `subdomain`, `custom_domain`, `status`, `branding`, `content`, `features`, `payment_settings`, `created_at`, `updated_at`, `deleted_at`.
- Trigger automático de generación de `client_code` (prefijo `QW-`, 5 caracteres Base32 anti-confusión, bucle de reintento ante colisión).
- Inserción idempotente de los 2 primeros tenants:
  - **Tenant 000 (Master):** Qaway Lab (`client_code: 'QW-00001'`, `slug: 'qaway-lab'`).
  - **Tenant 001 (Piloto):** CoraVet (`client_code: 'QW-7K4P2'`, `slug: 'coravet'`).
- Políticas RLS de lectura pública para tenants activos y escritura exclusiva para administradores de Qaway Lab.

### Paso 2: Prueba Automatizada de No-Conflicto
- Demostración ejecutable de que `Tenant A (CoraVet 1)` y `Tenant B (CoraVet 1)` coexisten en la base de datos sin conflicto, cada uno con su propio UUID y `client_code` independiente.

### Paso 3: Compatibilidad y Preparación Comercial
- Documentar y preparar la adición de `tenant_id` en tablas comerciales (`products`, `categories`, `orders`) con valor por defecto del Tenant 000 para no quebrar la Fase 2 existente.

### Paso 4: Montaje y Verificación de CoraVet Frontend
- Montaje limpio en `AppRouter.jsx` bajo `/proyectos/coravet/*` con encapsulamiento de estilos para auditar la web al 100% en local.

### Paso 5: Documentación Técnica de Gobernanza
- Registro formal de directrices para onboarding de nuevos clientes, reglas de cambio de marca y consultas multi-tenant.

---

## 4. Registro de Iteraciones

### [Iteración 01 — 2026-09-17]
- **Auditoría y Extracción:** Extracción del proyecto base `coravet-web-v4` en `src/pages/11-Proyectos/2-Sistemas-digitales/3-Webs-y-landings/CoraVet/`.
- **Creación de Bitácora:** Documentación del enfoque metodológico y arquitectura desacoplada (`creacion_app_implementacion.md`).
- **Registro del Estándar de Nomenclatura:** Adopción del Patrón Dual ID + `client_code` humano anti-confusión.
- **Acoplamiento del Plan Maestro:** Incorporación de las 7 adiciones críticas (Master Tenant, generador Crockford Base32, `payment_settings`, prueba automatizada de nombres duplicados).
