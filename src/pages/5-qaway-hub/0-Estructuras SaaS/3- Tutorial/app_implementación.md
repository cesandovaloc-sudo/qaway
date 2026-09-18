# app_implementación — Tutorial Onboarding React

## Iteración 1 — Recreación fiel en React 19 + Framer Motion (2026-09-18)
- **Archivo original:** `src/pages/5-qaway-hub/0-Estructuras SaaS/3- Tutorial/index.html` (preservado 100% intacto, sin tocar ni borrar).
- **Nuevo componente React:** `src/pages/5-qaway-hub/0-Estructuras SaaS/3- Tutorial/TutorialOnboardingPage.jsx`.
- **Rutas asociadas en AppRouter:**
  - `http://localhost:4100/hub/tutorial`
  - `http://localhost:4100/hub/onboarding`
- **Características técnicas y visuales recreadas:**
  1. **Iluminación volumétrica y paleta Atlassian:** Gradientes profundos `#0f3d82` a `#174d96` con halo radial de luz central `#3e7cd1`.
  2. **TopBar con Stepper interactivo:** Píldoras de avance conectadas con flechas `← [ • ] [ • ] [ • ] [ • ] →` con estado activo por paso.
  3. **Banner de Cookies:** Totalmente funcional y descartable.
  4. **Bandeja de entrada izquierda:** Con contenedor de tareas, subtítulo de canales e ítems con prioridad de Qaway Lab.
  5. **Tablero derecho con gradiente orquídea/púrpura:** Listas de Trello ("Hoy", "Esta semana", "Más tarde") con controles.
  6. **Mascota reactiva con halo pulsante:** 
     - Selector dinámico en barra superior para alternar entre la **Mascota Oficial Qaway Lab** (con cola y brazos reactivos) y la **Mascota Husky Trello Original** vectorizada.
     - Botón CTA *"¡Una última cosa!"* que dispara la animación de alegría en la mascota, chispas y actualización del bocadillo de texto (*"¡Vamos!"*).
  7. **Cursor virtual animado con tooltip:** Recreado con bucle fluido continuo.
  8. **Cierre seguro:** Botón `×` que permite ocultar el tutorial y reiniciar la experiencia sin recargar toda la página.
