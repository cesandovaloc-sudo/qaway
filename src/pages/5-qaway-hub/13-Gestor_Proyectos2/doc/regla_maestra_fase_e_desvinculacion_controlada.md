# Regla Maestra: Fase E — Desvinculación Controlada

## Contexto e Incidente
El día 8 de noviembre de 2026 (Commit 384 a las 22:37), un agente malinterpretó la orden de "desvinculación Fase E" y borró la vista territorial del módulo Sedes (`SedesView.tsx`), reemplazando la interfaz de Gantt y barras territoriales por un CRUD plano con pestañas "Directorio | Tarjetas | Mapa".

## Definición Canónica y Obligatoria de Fase E
La **Fase E SOLO desvincula el contenido y la fuente de datos**, conservando el 100% de la identidad visual, medidas, densidad y componentes aprobados.

### Protocolo No Negociable:
1. **Partir de un módulo nuevo ya validado:**
   - La copia literal debe haber pasado la comparación visual y funcional.
   - El módulo original de referencia permanece 100% intacto.

2. **Desacoplar únicamente el módulo nuevo:**
   - Sustituir gradualmente sus imports, servicios, tipos y datos compartidos.
   - Crear versiones propias dentro de la carpeta del nuevo módulo cuando sea necesario.
   - Mantener rigurosamente la misma interfaz visual, toolbar, botones, celdas y filtros.

3. **No modificar módulos protegidos:**
   - Queda prohibido reemplazar vistas existentes (`SedesView`, `CronogramaGanttView`, `EquipoView`, etc.).
   - El módulo Sedes debe conservar sus datos en las celdas y su vista territorial sin generar cargas ni dependencias cruzadas con el módulo Proyecto.
   - Prohibido cambiar componentes originales o inyectar vistas planas.
   - Prohibido alterar rutas, navegación del Sidebar o estilos globales sin autorización explícita.
   - Prohibido usar la desvinculación como excusa para rediseñar.

4. **Cambios permitidos en el módulo nuevo:**
   - Datos del dominio nuevo.
   - Servicios propios de base de datos.
   - Columnas y etiquetas específicas.
   - Permisos y roles.
   - Acciones específicas.
   - Tipos y estados internos del módulo nuevo.

5. **Validación obligatoria:**
   - Comparar módulo original y módulo nuevo lado a lado.
   - Ejecutar `npm run typecheck` (`npx tsc --noEmit`).
   - Ejecutar `npm run build` (`npx vite build`).
   - Verificar estados de carga, vacío, error, responsive e interacciones.
   - Revisar `git diff` exhaustivamente para confirmar que los cambios están 100% limitados al módulo nuevo y a la integración autorizada.
