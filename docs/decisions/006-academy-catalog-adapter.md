# 006 — Adaptador del catálogo de Academy en la Web

- **Fecha:** 2026-08-07
- **Estado:** Aprobado — la Web consume el catálogo de Academy (courses contract v1)
- **Dominio:** `courses` (propietario lógico: **Academy**)

## Contexto

La sección "Cursos aplicados" de la página de inicio mostraba cursos
hardcodeados en `src/data/academyCourses.js` (duplicación prohibida por v3).
Academy (fuente de verdad) publicó un contrato versionado (`courses contract v1`)
y una vista pública `public_course_catalog`. La Web debe consumirla sin duplicar
datos, sin conocer la estructura interna de Academy y sin acoplarse a Supabase.

## Opción elegida

1. **Contrato copiado** en `src/contracts/courses/` (copia explícita versionada,
   idéntica a la de Academy — nunca se modifica unilateralmente).
2. **Cliente separado** `src/integrations/academy/academy.client.ts` (solo lectura,
   anon key; nunca se mezcla con el Supabase de leads/briefs de la Web).
3. **Adaptador** `SupabaseAcademyCoursesAdapter` (backend intercambiable en el futuro:
   REST, Edge Function, CMS u otro Supabase sin reescribir componentes).
4. **Servicio + repositorio** `src/features/academy-catalog/` con timeout,
   validación del contrato, caché versionada (1h) y fallback neutral.
5. **Hook** `useFeaturedCourses` con cascada: datos en vivo → caché → fallback.

## Alternativas descartadas

- Seguir usando `academyCourses.js`: duplica datos y rompe la propiedad lógica.
- Consultar Supabase desde los componentes: acopla la UI al backend.
- Endpoint interno propio: crearía una segunda fuente de verdad.

## Impacto y mitigación

- **Conexiones:** la Web conserva su Supabase; Academy usa uno separado
  (`VITE_ACADEMY_SUPABASE_URL` / `VITE_ACADEMY_SUPABASE_ANON_KEY`).
- **Contingencia:** nunca pantalla en blanco → skeleton → caché → fallback neutral.
- **Respuesta vacía ≠ error:** si Academy responde sin destacados, NO se muestran
  caché ni cursos antiguos (evita selecciones retiradas).
- **Enlaces:** tarjetas enlazan a Academy (`VITE_ACADEMY_URL`), ruta `/cursos/{slug}`.

## Contrato

`courses contract v1` — ver `docs/integrations/academy-course-catalog-v1.md`.
Cambios incompatibles requieren `v2` de Academy.
