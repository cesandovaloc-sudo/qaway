# Decisión

## Contexto

Josué Panadería es una web pública comercial one-page con SEO local. El estándar Qaway v3 recomienda evaluar Next.js para webs públicas con contenido indexable, frente a React + Vite para herramientas operativas.

## Opción elegida

Mantener y seguir construyendo sobre **Next.js (App Router)**.

## Razón

- Es una web pública que necesita buena indexación (schema, sitemap, robots, metadata por ruta).
- Puede crecer a páginas de producto, catálogo, blog y pedidos sin cambiar de framework.
- Next.js ya estaba implementado y validado (build y typecheck correctos) antes de esta revisión.

## Alternativas

- React + Vite: viable pero con menor soporte nativo de SEO por ruta y renderizado.
- Mantener sin cambios: se descartó porque la revisión exige aplicar el estándar v3.

## Impacto

- Cero reescritura de componentes: se conserva el diseño aprobado.
- El proyecto queda alineado con el perfil tecnológico "web pública" del estándar.

## Mitigación

- No mezclar con migración a Tailwind 4 en esta iteración (ver decisión 003).
- Revisar compatibilidad de versiones Node/Next en cada actualización.

## Fecha

2026-08-07

## Estado

Aceptado
