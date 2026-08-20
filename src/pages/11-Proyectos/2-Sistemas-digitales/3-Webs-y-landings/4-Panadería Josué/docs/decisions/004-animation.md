# Decisión

## Contexto

El estándar propone Motion para animación de interfaz y GSAP para narrativa compleja. El diseño aprobado del sitio es limpio y con movimiento mínimo (hover de botones, zoom sutil de imágenes, scroll suave).

## Opción elegida

**No añadir librerías de animación en esta iteración.** Se conservan las transiciones CSS existentes y el bloque `prefers-reduced-motion` ya implementado.

## Razón

- El usuario indicó que el diseño ya está definido y no debe alterarse.
- El criterio del estándar: una interfaz debe funcionar correctamente sin animaciones; las librerías se instalan solo con necesidad real.
- Añadir Motion/GSAP no resuelve una necesidad de negocio actual.

## Alternativas

- Motion para microinteracciones: descartada, el CSS actual ya cubre hover/focus.
- GSAP: descartado, no hay narrativa ni scroll complejo.

## Impacto

- Bundle mínimo, sin JS de animación adicional.
- Mantiene bajo el INP objetivo (≤ 200 ms).

## Mitigación

- Revisar esta decisión si se agregan rutas editoriales, portafolio o campañas.

## Fecha

2026-08-07

## Estado

Aceptado (excepción justificada)
