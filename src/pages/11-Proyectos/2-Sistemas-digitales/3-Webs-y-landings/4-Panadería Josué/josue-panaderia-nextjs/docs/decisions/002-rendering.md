# Decisión

## Contexto

La página principal es un one-page estático sin datos dinámicos en servidor ni autenticación. Debe renderizarse rápido y ser indexable.

## Opción elegida

**Renderizado estático** (prerenderizado por defecto de Next.js App Router en esta ruta). No hay componentes cliente salvo el menú móvil del header.

## Razón

- Máximo rendimiento (HTML servido directamente, cero JS pesado para renderizar el contenido).
- SEO completo: el contenido existe en el HTML inicial para crawlers.
- Cumple objetivos de referencia: LCP ≤ 2.5 s, CLS ≤ 0.1.

## Alternativas

- SSR dinámico: innecesario sin datos en tiempo real.
- CSR: empeora el SEO y la primera pintura.

## Impacto

- La página se genera en build; los cambios de contenido requieren rebuild (aceptable para una web de negocio).

## Mitigación

- Preparar la ruta para `dynamic` o ISR solo si más adelante hay catálogo desde backend.

## Fecha

2026-08-07

## Estado

Aceptado
