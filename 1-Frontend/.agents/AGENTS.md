# Instrucciones de Desarrollo de Qaway Lab

## Comportamiento del Agente (Obligatorio)

1. **Mostrar la Rama Actual**: Al inicio de **cada respuesta**, debes indicar de forma clara y visible en qué rama de Git te encuentras actualmente (ej. `Rama actual: page/inicio`).
2. **Protección de Ramas**: 
   * Trabaja **únicamente** en la rama correspondiente a la página/tarea asignada.
   * **NUNCA** debes modificar archivos en una rama que no corresponda a tu tarea, incluso si el usuario te lo pide por error o te da una instrucción directa para otra rama.
   * Si detectas que el usuario te solicita cambios en una página distinta a la rama en la que te encuentras, debes **detenerte de inmediato y alertar al usuario** del error para que decida si cambiar de rama o corregir la instrucción.

## Flujo de Trabajo en Git

Cada agente que trabaje en este repositorio debe seguir estrictamente estas reglas de ramas:

1. **Rama Base**: La rama de producción y desarrollo estable es `main`.
2. **Ramas Propias por Página/Funcionalidad**:
   * Trabaja en la rama propia de la página o sección asignada (por ejemplo, `page/inicio`, `page/estudio`, `page/sistemas-digitales`, `page/academy`).
   * Antes de modificar nada, verifica que exista la rama base `main`. Si no existe la rama propia para tu página, créala desde `main`.
   * Puedes tocar tanto `src/` como `public/` si la tarea lo requiere, pero **no mezcles tu trabajo con ramas de otras páginas**.
3. **Cambios Globales (Navbar, Footer, Enrutador, Estilos Globales)**:
   * Si la tarea implica modificar un elemento global que afecte a varias páginas (como `Footer.jsx`, `Navbar.jsx`, `AppRouter.jsx` o `index.css`), crea y trabaja en una rama con el prefijo `global/` (por ejemplo, `global/footer`, `global/styles` o `global/router`) creada desde `main`.
4. **Fusión y Limpieza**:
   * Al terminar y verificar que el proyecto compila (`npm run build`), integra los cambios de tu rama (`page/*` o `global/*`) a `main`.
   * Elimina la rama temporal utilizada para mantener limpio el repositorio.
