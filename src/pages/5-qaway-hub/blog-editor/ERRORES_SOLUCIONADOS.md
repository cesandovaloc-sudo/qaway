# Registro Histórico de Errores Solucionados - Blog Editor

Este documento registra los errores críticos analizados y solucionados de raíz en el módulo **Blog Editor** (`src/pages/5-qaway-hub/blog-editor/`), documentando la causa exacta, la regresión y la corrección mínima aplicada como referencia técnica para auditorías y desarrollos futuros.

---

## Error #001: `TypeError: Cannot read properties of null (reading 'cached')` en RootErrorBoundary

* **Fecha de resolución:** 2026-09-08
* **Entorno observado:** Producción / Staging (`qawaylab.com/editor/p_1788817952571_dywm`)
* **Impacto:** Pantalla en blanco con captura de error en `RootErrorBoundary` al navegar directamente vía URL o refrescar (`F5`) en un artículo específico guardado en Supabase / IndexedDB.

---

### 1. Síntoma y Traza del Error
* En la consola del navegador:
  ```text
  Uncaught TypeError: Cannot read properties of null (reading 'cached')
      at DOMSerializer.fromSchema (prosemirror-model)
      at generateHTML (tiptap-core)
      at Editor.getHTML (tiptap-core)
  ```
* La expresión interna de ProseMirror `schema.cached.domSerializer` fallaba porque `schema` era `null`.

---

### 2. Diagnóstico y Causa Raíz

1. **Ciclo de vida interno de TipTap / ProseMirror:**
   * En TipTap, cuando un editor entra en proceso de desmontaje o recreación, su método interno `destroy()` ejecuta de forma canónica:
     ```js
     this.extensionManager.destroy();
     this.schema = null;
     this.commandManager = null;
     ```
   * Si cualquier efecto o listener invoca `editor.getHTML()` durante o después de esta fase, TipTap llama a `DOMSerializer.fromSchema(this.schema)`, resultando en `DOMSerializer.fromSchema(null)` → `null.cached`.

2. **Bucle de sincronización en `VisualEditor.tsx`:**
   * Existía un `useEffect` que comparaba `editor.getHTML() !== initialContent` en cada render:
     ```tsx
     // INCORRECTO:
     useEffect(() => {
       if (editor && initialContent && editor.getHTML() !== initialContent) {
         editor.commands.setContent(initialContent, { emitUpdate: false })
       }
     }, [initialContent, editor])
     ```
   * **Firma de TipTap:** `setContent(content: Content, emitUpdate?: boolean)`.
   * Al pasarle `{ emitUpdate: false }` (un objeto de JavaScript, que es **truthy**), TipTap evaluaba `Boolean({ emitUpdate: false }) === true`.
   * En consecuencia, `setContent` emitía una transacción que disparaba `onUpdate` → `onChange` → `setContentHtml` en `EditorPage.tsx`, provocando un ciclo continuo de re-renders mientras el componente se inicializaba.

3. **Hidratación asíncrona y reutilización de instancia en `EditorPage.tsx`:**
   * Al acceder directamente por URL a un post remoto de Supabase (no presente en el array local inicial), el editor montaba inicialmente con `initialContent = ""` en el primer render (`tick 0`).
   * Al resolver los datos de Supabase, `posts` cambiaba y `getPost` mutaba su referencia, forzando la inyección de contenido sobre un editor que no tenía `key` propia asociada al `postId`.
   * Al combinarse con el wrapper superior `<NavbarProvider>` introducido en el commit `f4ebc5d`, los re-renders forzaron el desmontaje de la instancia anterior mientras el `useEffect` intentaba serializar el HTML con `editor.getHTML()`.

---

### 3. Solución Mínima y Causal Aplicada

Se descartaron parches defensivos (como `try/catch` superficiales o silenciar errores) y se aplicó la corrección estructural en 2 archivos:

1. **`src/pages/5-qaway-hub/blog-editor/components/VisualEditor.tsx`:**
   * **Eliminación del `useEffect` cíclico:** Se eliminó la comparación de `editor.getHTML() !== initialContent` que serializaba el documento entero en cada render.
   * **Corrección del booleano `emitUpdate`:**
     ```tsx
     setContent: (content: string) => {
       if (editor && !editor.isDestroyed) {
         editor.commands.setContent(content, false) // booleano false estricto
       }
     }
     ```
2. **`src/pages/5-qaway-hub/blog-editor/pages/EditorPage.tsx`:**
   * **Aislamiento por `key`:**
     ```tsx
     <VisualEditor
       key={postId || 'new'}
       ref={editorRef}
       initialContent={contentHtml}
       ...
     />
     ```
     Garantiza que React monte y destruya limpiamente la instancia ligada al ciclo de vida del artículo, sin reutilizar estados intermedios.

---

### 4. Directivas de Prevención para Tareas Futuras

* **Nunca usar `editor.getHTML()` dentro de `useEffect` dependientes de props:** `getHTML()` es una serialización DOM costosa y peligrosa si el editor está en transición de estado.
* **Respetar tipos primitivos en APIs de terceros:** Verificar siempre la firma de TypeScript (booleano `false` vs objeto `{ emitUpdate: false }`).
* **Sincronizar montajes de editores ricos con `key={id}`:** Todo editor basado en ProseMirror debe desmontarse y montarse limpiamente ante un cambio de ID de entidad, en lugar de mutar el schema en caliente.
