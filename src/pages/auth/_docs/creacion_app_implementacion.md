# Registro de Implementación: Auth & Onboarding Direct Flow + QawayCleanLoader (Dots Pulse)

## Fecha: 2026-09-24
## Rama: main-web

### 1. Objetivo de la Iteración
- Eliminar de raíz la aparición del layout oscuro de login de dos columnas (`AuthShell`) al hacer clic en el correo de confirmación.
- Reemplazar la animación de cubos por una animación minimalista y elegante de 3 puntos pulsantes (`QawayCleanLoader`), adaptada a los colores corporativos de Qaway Lab.
- Lograr una transición 100% limpia sobre fondo neutro `#f7f7f8` idéntico al de Onboarding, eliminando cualquier cambio brusco de color o estructura.

### 2. Cambios Implementados
1. **Componente `QawayCleanLoader` (`src/components/ui/QawayCleanLoader.jsx`)**:
   - Animación de 3 puntos (`.dot`) con keyframe `qawayDotPulse`: pulso suave de escala (0.8 a 1.22) y transición de color desde un naranja claro (`#ffd8cc`) a naranja corporativo intenso (`#ff4b0b`) con aura difuminada.
   - Fondo uniforme `#f7f7f8` con opciones `fullscreen` (pantalla completa fija) e `inline`.
   - Se actualizó `QawayCubeLoader.jsx` para reexportar este componente y evitar elementos toscos.

2. **Interceptación de Flujo en `AuthShell.jsx`**:
   - Se detecta si la ruta trae `verified=1` o fragmentos de autenticación (`access_token`, `type=signup`).
   - En ese caso, **se bloquea completamente el montaje de las dos columnas oscuras de login** y se renderiza en su lugar la pantalla limpia `#f7f7f8` con `QawayCleanLoader`.
   - El `<Outlet />` se ejecuta oculto para procesar la sesión y saltar directamente a `/onboarding`.

3. **Limpieza en `LoginPage.jsx`**:
   - Se eliminaron los cubos toscos del estado `checking` y se adoptó `QawayCleanLoader`.

### 3. Verificación
- Oxlint: 0 errores.
- Vite build: Compilación exitosa (0 errores).
