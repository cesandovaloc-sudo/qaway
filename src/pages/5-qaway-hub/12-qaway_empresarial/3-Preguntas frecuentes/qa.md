# 🧪 QA: Criterios de Aceptación, Pruebas y Accesibilidad

## 1. Criterios de Aceptación
1. **Montaje Nativo**:
   - Acceso desde `http://localhost:4100/hub/preguntas-frecuentes` y `/hub/casuisticas`.
   - Cero iframes en el DOM del navegador.
   - Navegación fluida dentro del layout oficial de Qaway Hub.

2. **Fidelidad Visual y Ergonomía (Candado Visual)**:
   - Preservación exacta de la cabecera institucional roja (`#b91c1c` a `#dc2626`).
   - 6 Direcciones pedagógicas con íconos vectoriales Lucide nítidos y badges oficiales.
   - Espaciado y tipografía Inter con contraste accesible WCAG 2.2 AA.

3. **Funcionalidad de Búsqueda Difusa**:
   - Escribir términos como "matrícula", "pecosa", "ceba", "bilingue" o "inclusiva" debe filtrar instantáneamente y resaltar coincidencias.
   - Botón "Limpiar" debe restaurar la vista completa sin recargar la página.
   - Botón "Colapsar todo / Expandir todo" debe alternar todos los acordeones visibles.
   - Botón "Primera coincidencia" debe enfocar y expandir el primer resultado encontrado.

4. **Persistencia y Resiliencia**:
   - Los datos deben persistir entre recargas a través de `localStorage`.
   - Si se desconecta o no hay datos, inicializa instantáneamente con las 14 casuísticas canónicas.
   - El modal de administración permite editar, crear y sincronizar opcionalmente con Supabase.

5. **Responsiveness Móvil**:
   - Adaptación en resoluciones < 480px y < 768px sin desbordamiento horizontal (`overflow-x: hidden`).
   - Botones táctiles con altura mínima de 44px para ergonomía móvil.
