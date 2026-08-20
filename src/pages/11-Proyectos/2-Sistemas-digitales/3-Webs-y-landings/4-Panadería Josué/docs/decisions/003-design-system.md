# Decisión

## Contexto

El estándar Qaway v3 propone Tailwind CSS 4 como base para proyectos nuevos. El sitio actual usa CSS con variables semánticas en `app/globals.css` y tiene un diseño aprobado que debe conservarse.

## Opción elegida

**Conservar el sistema CSS actual (variables + clases de utilidad propias) en lugar de migrar a Tailwind 4.**

## Razón

- El diseño ya está aprobado y no debe alterarse. Migrar a Tailwind 4 implica riesgo de regresión visual sin beneficio funcional.
- El sistema actual ya aplica tokens semánticos (`--primary`, `--surface`, `--border`, radios, sombras), el mismo principio que promueve el estándar.
- El criterio del estándar es instalar dependencias solo cuando resuelven una necesidad real.

## Alternativas

- Migrar a Tailwind 4: descartada por riesgo visual innecesario en una web a punto de publicarse.
- CSS Modules: no aporta ventaja frente al enfoque actual para una página.

## Impacto

- Sin cambio en la hoja de estilos ni en la apariencia.
- El proyecto se documenta como excepción justificada al punto 7/9 del estándar.

## Mitigación

- Mantener la disciplina de tokens: no introducir colores hardcodeados nuevos.
- Si en el futuro se agregan páginas nuevas, evaluar Tailwind 4 para ellas sin tocar el diseño existente.

## Fecha

2026-08-07

## Estado

Aceptado (excepción justificada)
