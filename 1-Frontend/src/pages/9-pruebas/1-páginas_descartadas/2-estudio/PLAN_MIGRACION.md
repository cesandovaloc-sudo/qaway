## PLAN: Mover VisualLabPage a páginas descartadas y preparar reemplazo

### Objetivo
Mover la página Visual Lab original de /estudio/visual-lab a carpeta de descartadas y dejar lista la ruta para nueva página.

### Pasos a ejecutar

1. **Crear archivo destino** en carpeta de descartadas
   - Copiar src/pages/2-estudio/VisualLabPage.jsx → src/pages/9-pruebas/1-páginas_descartadas/2-estudio/VisualLabPage.jsx

2. **Eliminar import y route del AppRouter**
   - Quitar VisualLabPage del import de @/pages/2-estudio (línea 12)
   - Quitar <Route path="visual-lab" element={<VisualLabPage />} /> (línea 66)

3. **Eliminar archivo original**
   - Borrar src/pages/2-estudio/VisualLabPage.jsx

4. **Verificar**
   - Confirmar que otras páginas de /estudio/* siguen funcionando
   - Confirmar que no hay imports rotos

### Archivos afectados
- src/router/AppRouter.jsx (import + route)
- src/pages/2-estudio/VisualLabPage.jsx (eliminar)
- src/pages/9-pruebas/1-páginas_descartadas/2-estudio/VisualLabPage.jsx (nuevo - copia)

### Memoria guardada
- VisualLabPage_ARCHIVED_INFO.md en carpeta destino con: estructura, assets, dependencias, features clave

### Notas
- Navbar usa variante 'dark' (useSetNavbarVariant)
- 6 secciones: Hero, VisualSectors, CinematicStatement, StrategySection, DiagnosticForm, wrapper
- Assets en /assets/pages/2-estudio/
- Formulario envía a WhatsApp con solutionMap dinámico
