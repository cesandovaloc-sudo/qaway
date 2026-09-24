# Registro de Implementación: Auth & Onboarding Direct Flow + QawayCubeLoader 3D

## Fecha: 2026-09-24
## Rama: main-web

### 1. Objetivo de la Iteración
- Eliminar de raíz la secuencia de micro-saltos observada al abrir el correo de activación (Inicio -> Login -> Onboarding).
- Implementar el componente visual de carga 3D isométrico adaptado con los colores de marca Qaway Lab (`#ff4b0b`, `#ff6a38`, `#f7f7f8`).
- Mantener la integridad de diseño y la experiencia fluida de usuario.

### 2. Cambios Implementados
1. **Componente `QawayCubeLoader` (`src/components/ui/QawayCubeLoader.jsx`)**:
   - Integración de los 8 cubos isométricos 3D (`.box0` a `.box7`), plano base con reflejo de gradiente y animación de rotación 3D pura en CSS.
   - Variables de color oficiales: `--primary: #ff4b0b`, `--primary-light: #ff6a38`, `--primary-rgba: rgba(255, 75, 11, 0)`.
   - Soporte responsive con escalado automático para pantallas móviles (`@media (max-width: 480px) { zoom: 0.44; }`).
   - Texto de espera con animación de pulso cromático.

2. **Redirección Canónica Directa en `RegisterPage.jsx`**:
   - Enlace `emailRedirectTo` actualizado directamente a `${APP_BASE_URL}/onboarding`.
   - Se elimina la parada intermedia en `/login?verified=1`.

3. **Intercepción Síncrona en `AppRouter.jsx` (`RootIndexRoute`)**:
   - Evaluación síncrona en la ruta raíz (`/`) de tokens en el hash (`#access_token`, `type=signup`, `type=recovery`).
   - Si existen, se redirige inmediatamente a `/onboarding${hash}` antes de montar o pintar `<InicioPage />`, eliminando el destello de la portada.

4. **Estado Checking en `LoginPage.jsx`**:
   - Durante la resolución de sesión, se muestra `QawayCubeLoader` en el panel derecho sin destellos de inputs.

### 3. Verificación
- Oxlint: 0 errores.
- Vite build: Compilación exitosa (0 errores).
