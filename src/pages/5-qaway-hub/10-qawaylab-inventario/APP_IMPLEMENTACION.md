# Registro de Implementacion: Qaway Inventario

## [2026-09-14 18:09] Infraestructura Avanzada de Autenticacion en Portada de Inventario

### Objetivo
Elevar la infraestructura funcional y de seguridad de la caratula de autenticacion en Inventario (/hub/inventario/login) al estandar enterprise del Hub Principal (/login), preservando estrictamente el 100% de su diseno visual minimalista.

### Puntos Esenciales Implementados
1. **Google OAuth Integrado:**
   - Incorporacion de autenticacion de un clic via supabase.auth.signInWithOAuth con redireccion a /hub/inventario.
   - Spinner reactivo para prevenir clics concurrentes.
2. **Subflujo de Recuperacion de Contrasena:**
   - Transicion limpia en la misma tarjeta hacia la vista de reseteo mediante supabase.auth.resetPasswordForEmail.
   - Confirmacion de exito en verde y boton de retorno rapido.
3. **Visibilidad de Clave (Eye / EyeOff):**
   - Toggle interactivo para mostrar u ocultar contrasena sin alterar el ancho ni el estilo del input.
4. **Persistencia y Control de Sesion (Recordarme):**
   - Checkbox estilizado integrado junto al enlace de recuperacion.
5. **Aislamiento de Sesion:**
   - Preservacion de storageKey: 'qaway_inventario_auth_token'.
6. **Sello de Confianza y Seguridad:**
   - Badge inferior discreto de Acceso Seguro - Encriptacion SSL/TLS.
7. **Verificacion:**
   - Compilacion limpia con TypeScript (npx tsc --noEmit: 0 errores).

---

## [2026-09-18 13:38] Enlace Comercial de Cursos de Academy en public.products

### Objetivo
Conectar el catálogo comercial y motor de checkout (`@qawaylab/pago`) con los cursos de pago de Academy sin acoplar físicamente las bases de datos ni invadir el dominio pedagógico.

### Puntos Esenciales Implementados
1. **Extensión de Esquema en Supabase Central (`qrusdsqgygfolxfrafyd`):**
   - Migración `20260918140000_products_course_link.sql` aplicada con `supabase db push`.
   - Adición de la columna lógica `course_id uuid` en `public.products` (sin FK física por estar las BDs separadas).
   - Índices `idx_products_course_id` y `idx_products_tenant_course` para resolución O(1) desde el frontend.
   - Constraint de unicidad compuesta `unique (tenant_id, course_id)`.
2. **Siembra de Catálogo Comercial para Cursos de Pago:**
   - 6 cursos de pago de Academy registrados bajo el Master Tenant (`00000000-0000-0000-0000-000000000001`) con `type = 'course'`:
     * JavaScript Avanzado (S/ 49.99, course_id: `c0000000-0002-0000-0000-000000000002`)
     * React & Modern Frontend (S/ 79.99, course_id: `c0000000-0003-0000-0000-000000000003`)
     * Diseño UX/UI Profesional (S/ 39.99, course_id: `c0000000-0004-0000-0000-000000000004`)
     * Backend con Node.js (S/ 59.99, course_id: `c0000000-0005-0000-0000-000000000005`)
     * Vue.js para Aplicaciones Web (S/ 44.99, course_id: `c0000000-0007-0000-0000-000000000007`)
     * Arquitectura de Microservicios (S/ 69.99, course_id: `c0000000-0008-0000-0000-000000000008`)
3. **Validación:**
   - Verificación directa contra Supabase remoto exitosa (6 registros devueltos).
   - Cursos gratuitos de Academy preservados en su flujo directo (`is_free = true`).
   - Candado Visual 100% respetado.

---

## [2026-09-18 18:24] Fase 1 — Arquitectura de Suscripciones y Cobros Recurrentes Multi-Tenant

### Objetivo
Implementar el esquema de base de datos relacional para planes y suscripciones periódicas desacopladas del carrito unitario, con soporte de tabla intermedia para cursos incluidos, verificación RPC de alta velocidad y blindaje RLS multi-tenant.

### Puntos Esenciales Implementados
1. **Extensión de Esquema en Supabase Central (`qrusdsqgygfolxfrafyd`):**
   - Migración `20260918150000_create_subscriptions_schema.sql` aplicada con `supabase db push`.
   - Creación de `public.subscription_plans` (planes multi-tenant con frecuencia, precio y flag `is_all_courses`).
   - Creación de `public.subscription_plan_courses` (tabla intermedia escalable para asociar cursos de Academy por UUID).
   - Creación de `public.subscriptions` (ciclo de vida de suscripción: `active`, `paused`, `cancelled`, con `current_period_end` y `mp_preapproval_id`).
   - Índices compuestos para consultas rápidas por usuario, tenant y pasarela.
2. **Función RPC de Verificación de Acceso (`check_user_course_access`):**
   - Función PostgreSQL `SECURITY DEFINER` que evalúa en tiempo récord si un `user_id` tiene suscripción activa que cubra un `course_id` (vía plan total o tabla intermedia), respetando la fecha de vigencia.
3. **Siembra de Planes Base para Master Tenant (`00000000-0000-0000-0000-000000000001`):**
   - *Pase Total Academy* (S/ 99.00 / mes, acceso ilimitado a todos los cursos).
   - *Ruta Frontend & UI/UX Pro* (S/ 59.00 / mes, cursos asignados: JS Avanzado, React 19, UI/UX y Vue.js).
4. **Validación:**
   - Verificación directa contra Supabase remoto exitosa (2 planes devueltos con sus relaciones).
   - Función RPC `check_user_course_access` probada.
   - Políticas RLS verificadas (inserciones anónimas bloqueadas por seguridad).
   - Candado Visual 100% preservado (cero modificaciones en UI/diseño).
