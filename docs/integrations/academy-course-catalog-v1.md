# Integración (consumidor Web) — Catálogo de Academy, courses contract v1

> **Propietario lógico del dominio:** Qaway Academy (`2-qawaylab-app-academy`)
> **Contrato:** `courses contract v1` — copia en `src/contracts/courses/`
> **Fuente:** vista pública `public_course_catalog` (RLS: anon solo lee `published`)

## Variables de entorno (Web)

```
VITE_ACADEMY_SUPABASE_URL=
VITE_ACADEMY_SUPABASE_ANON_KEY=
VITE_ACADEMY_URL=            # base de Academy para enlaces de tarjetas
VITE_ACADEMY_ASSETS_URL=     # base de imágenes si imageUrl es relativa
```

El Supabase de la Web (leads/briefs) NO se reemplaza: Academy usa un cliente
separado (`src/integrations/academy/academy.client.ts`).

## Arquitectura

```
Componente (InicioPage)
→ hook useFeaturedCourses
→ AcademyCatalogService / repository (timeout + validación + caché)
→ SupabaseAcademyCoursesAdapter (backend intercambiable)
→ vista public_course_catalog (anon key, solo lectura)
```

## Caché y contingencia (3 niveles)

1. **Datos en vivo** — valida el contrato y actualiza la caché.
2. **Última respuesta válida** — caché versionada `qaway_academy_featured_courses_v1`
   (1 h, validada con zod antes de usar; nunca se sobrescribe con errores).
3. **Fallback neutral** — tarjetas sin precios, duraciones ni badges inventados.

**Respuesta vacía ≠ error:** si Academy responde válidamente sin destacados, la Web
muestra estado vacío/neutral — nunca caché antigua (evita selecciones retiradas).

## Estados

`loading` (skeleton) · `success` · `empty` · `cached` · `fallback` · `error`.

## Enlaces e imágenes

- Tarjetas enlazan a `{VITE_ACADEMY_URL}/cursos/{slug}` (href del contrato).
- Imágenes con dimensiones definidas, `alt`, lazy loading y placeholder neutral.
- Nunca se reutiliza la imagen de otro curso cuando una imagen falla.

## Seguridad

Solo lectura pública con anon key. Sin `service_role`, sin secretos en `VITE_*`,
sin escritura sobre Academy, sin desactivar RLS.

## Sustituir Supabase

Implementar `CoursesCatalogAdapter` (`src/integrations/academy/academy-courses.adapter.ts`)
con otro proveedor (REST, Edge Function, CMS) sin cambiar componentes.

## Pruebas

`npm test` (vitest): mapper, validación del contrato, caché, timeout, respuesta
vacía y datos corruptos. Verificación manual: build, lint, typecheck, y que
"Soluciones digitales" permanezca intacta.
