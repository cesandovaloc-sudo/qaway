# Qaway Academy — Arquitectura Base

## Visión General

**Qaway Academy** es la plataforma educativa de Qaway Lab. Está construida como una SPA independiente en React con Supabase como backend, sin depender de WordPress, Tutor LMS ni Moodle.

### Stack técnico

| Capa         | Tecnología                                     |
| ------------ | ---------------------------------------------- |
| Frontend     | React 19 + Vite                                |
| Estilos      | Tailwind CSS v4 + CSS personalizado            |
| Animaciones  | Framer Motion                                  |
| Ruteo        | React Router DOM v7                            |
| Backend      | Supabase (PostgreSQL, Auth, Storage)           |
| Base de datos| PostgreSQL (manejado por Supabase)             |
| Autenticación| Supabase Auth (email/password + magic link)    |
| Pagos        | WooCommerce (puente inicial) → Stripe (futuro) |
| Archivos     | Supabase Storage                               |

### Principios

1. **Fases cortas y cerradas** — Cada fase entrega algo visible y usable.
2. **Sin sobreingeniería** — Solo lo necesario para operar y vender.
3. **Escalable por diseño** — El esquema de datos permite multi-tenant desde el inicio.
4. **Independiente** — No toca el frontend principal de Qaway ni el backend Express.

---

## Mapa de Páginas

```
/                          → Landing pública (Home)
/cursos                    → Catálogo de cursos
/cursos/:slug              → Detalle de curso
/cursos/:slug/leccion/:id  → Visualización de lección
/acceder                   → Login
/registro                  → Registro
/recuperar                 → Recuperación de contraseña
/panel                     → Dashboard del alumno
```

### Rutas futuras (Fases 5-6)

```
/admin                     → Panel administrativo
/admin/cursos              → Gestión de cursos
/admin/usuarios            → Gestión de usuarios
/certificado/:id           → Verificación de certificado
```

---

## Modelo de Datos

### Tablas principales

| Tabla             | Propósito                                    |
| ----------------- | -------------------------------------------- |
| `profiles`        | Extiende `auth.users` con datos de perfil    |
| `categories`      | Categorías de cursos                         |
| `courses`         | Cursos                                       |
| `modules`         | Módulos dentro de un curso                   |
| `lessons`         | Lecciones dentro de un módulo                |
| `enrollments`     | Inscripciones (usuario ↔ curso)              |
| `lesson_progress` | Progreso por lección                         |
| `certificates`    | Certificados emitidos                        |
| `orders`          | Órdenes de pago (WooCommerce u otros)        |

### Diagrama de relaciones

```
auth.users (Supabase)
  └── profiles (1:1)
        ├── enrollments (1:N) ── courses (N:1)
        ├── lesson_progress (1:N) ── lessons (N:1)
        ├── certificates (1:N) ── courses (N:1)
        └── orders (1:N) ── courses (N:1)

courses
  └── modules (1:N)
        └── lessons (1:N)

categories
  └── courses (1:N)
```

### Seguridad (RLS)

- Catálogo de cursos: visible para todos (solo publicados)
- Módulos y lecciones: visibles si el curso es público
- Perfiles: solo el usuario puede ver/editar el suyo
- Inscripciones, progreso, certificados, órdenes: solo el propietario
- Admin/Instructor: acceso completo (futuro)

---

## Flujo de Pagos (WooCommerce)

```
Usuario compra desde React Academy
  → Redirige a WooCommerce checkout
  → WooCommerce procesa el pago
  → Webhook de WooCommerce → Backend Express
  → Backend Express actualiza Supabase:
      - Crea registro en `orders`
      - Crea registro en `enrollments`
  → Usuario vuelve a Academy con acceso desbloqueado
```

### Preparado para migrar a Stripe

La tabla `orders` tiene un campo `payment_method` que permite cambiar el proveedor sin modificar la estructura. Cuando se implemente Stripe, solo se añade un nuevo webhook.

---

## Estructura del Proyecto

```
3-Academy-Qaway/
├── index.html
├── vite.config.js
├── package.json
├── .env.example
├── public/
│   └── assets/
├── supabase/
│   └── migrations/
│       └── 00001_initial_schema.sql
├── docs/
│   └── ARCHITECTURE.md
└── src/
    ├── main.jsx                    # Entry point
    ├── App.jsx                     # Router
    ├── lib/
    │   └── supabase.js             # Cliente Supabase
    ├── components/
    │   ├── ui/                     # Componentes base (futuro)
    │   ├── layout/
    │   │   └── Layout.jsx          # Layout global (Navbar + Footer)
    │   └── academy/                # Componentes Academy (futuro)
    ├── pages/
    │   ├── Home.jsx                # Landing pública
    │   ├── Catalog.jsx             # Catálogo de cursos
    │   ├── CourseDetail.jsx        # Detalle de curso
    │   ├── Lesson.jsx              # Visualización de lección
    │   ├── Dashboard.jsx           # Panel del alumno
    │   └── Auth/
    │       ├── Login.jsx           # Inicio de sesión
    │       ├── Register.jsx        # Registro
    │       └── Recover.jsx         # Recuperación de contraseña
    ├── hooks/                      # Custom hooks (futuro)
    └── styles/
        └── index.css               # Tailwind + tokens de diseño
```

---

## Próximas Fases

| Fase | Meta                          | Dependencias    |
| ---- | ----------------------------- | --------------- |
| 1    | Base de producto (✔ hecha)    | —               |
| 2    | UI pública (✔ hecha)          | Fase 1          |
| 3    | Auth y perfil (✔ esqueleto)   | Fase 1          |
| 4    | Academia funcional            | Fase 2 + 3      |
| 5    | Certificados                  | Fase 4          |
| 6    | Escalabilidad / multi-tenant  | Fase 5          |

---

## Decisiones de Arquitectura

### ¿Por qué Supabase y no Express propio?

- El frontend de la Academy es autónomo. Supabase ofrece auth, base de datos y storage desde el cliente, eliminando la necesidad de un backend intermedio para operaciones CRUD básicas.
- El backend Express existente se usa solo como capa de integración para webhooks (WooCommerce, Meta).

### ¿Por qué WooCommerce y no Stripe directo?

- WooCommerce ya está habilitado en el ecosistema Qaway. Stripe se puede agregar después sin modificar la arquitectura gracias al campo `payment_method` en `orders`.

### ¿Por qué React Router y no Next.js?

- El frontend principal de Qaway es React con Vite. Mantener consistencia evita fricción técnica. Next.js sería apropiado si se necesitara SSR/SSG, pero la Academy funciona bien como SPA.

### ¿Por qué migraciones SQL manuales y no Prisma/Drizzle?

- Supabase maneja migraciones SQL nativamente. Para un esquema pequeño y controlado como este, SQL plano es más directo y evita capas de abstracción innecesarias. Se puede migrar a un ORM después si la complejidad lo justifica.
