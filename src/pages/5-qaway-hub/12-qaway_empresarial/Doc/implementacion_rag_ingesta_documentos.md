# 📑 Plan de Implementación: Ingesta Real y Motor RAG Operativo

> **Módulo:** RAG Hub (`12-qaway_empresarial / 2-Búsqueda Criterios`)  
> **Objetivo:** Convertir el modal de carga y el motor RAG en un sistema 100% funcional capaz de leer, parsear, fragmentar y consultar documentos reales (PDF, DOCX, XLSX, CSV, TXT) y carpetas completas, conectándolo directamente con Google Gemini sin alterar ni romper ningún elemento del diseño actual.

---

## 🔒 Regla de Oro: Candado Visual Absoluto
* **Prohibido modificar el diseño visual:** No alterar tamaños de texto, colores, espaciados, paddings, layouts de rejilla, responsive ni jerarquía de elementos.
* **Operación por detrás de la fachada:** Los botones existentes (`+ Carga de doc`, `fileInputRef`, `folderInputRef`, modal de subida, visor lateral) ya están maquetados; solo se conecta la tubería de extracción y búsqueda de datos a esos mismos componentes.

---

## 📌 Fases de Implementación

### Fase 1: Parsers de Documentos en Cliente (Extracción de Texto)
Implementar un servicio desacoplado `documentParserService.ts` que reciba los archivos binarios subidos y extraiga texto estructurado:
1. **Archivos de Texto Plano (`.txt`, `.md`, `.json`):**
   * Lectura inmediata vía `FileReader.readAsText()`.
2. **Documentos PDF (`.pdf`):**
   * Integración de `pdfjs-dist` (usando worker CDN o empaquetado Vite) para iterar página por página, extrayendo el contenido textual junto con su número de página real.
3. **Hojas de Cálculo (`.xlsx`, `.xls`, `.csv`):**
   * Uso de la librería `xlsx` (ya instalada en el proyecto) para procesar hojas, nombres de columnas, filas de datos y rangos de celdas.
4. **Documentos Word (`.docx`):**
   * Extracción de párrafos y encabezados mediante `mammoth` (o lectura ligera de `word/document.xml` vía `JSZip`).
5. **Carpetas Completas (`webkitdirectory`):**
   * Iteración recursiva de los archivos seleccionados ignorando archivos ocultos o no soportados (`.ds_store`, binarios no soportados).

---

### Fase 2: Chunking Semántico y Persistencia en Memoria / IndexedDB
1. **Segmentación (Chunking):**
   * Dividir el texto extraído en fragmentos de 500 a 1,000 caracteres con solapamiento (*overlap*) de 100 caracteres.
   * Asociar a cada chunk su metadata:
     * `documentId`, `documentTitle`
     * `pageNumber` (para PDFs y Docs) o `sheetName / cellRange` (para Excel)
     * `content` y extracto resaltado (`excerpt`)
2. **Almacenamiento Local (IndexedDB / Estado React):**
   * Para no saturar `localStorage` (límite ~5MB), los fragmentos completos se guardan en IndexedDB o en la memoria de la sesión activa, manteniendo en el estado de React únicamente la metadata de visualización de fuentes.

---

### Fase 3: Motor de Recuperación (Retrieval) y Contexto para Gemini
1. **Búsqueda y Relevancia (Top-K Chunks):**
   * Algoritmo de puntuación por coincidencia de términos (TF-IDF / BM25 ligero en cliente o embeddings si hay API de Gemini activa).
   * Filtrado por umbral de similitud configurado por el usuario en la UI (`similarityThreshold`, ej. >= 0.70).
2. **Inyección en `geminiRAGService.ts`:**
   * Enviar a Gemini los Top-K fragmentos más relevantes reales en la sección `[FUENTES DOCUMENTALES INDEXADAS]`, incluyendo extractos reales para que el modelo pueda citar con precisión `[1]`, `[2]`.
   * En caso de documentos pequeños/medianos, aprovechar la ventana de contexto de Gemini 1.5 Flash para enviar el contexto fiel y responder con citas de página exactas.

---

### Fase 4: Vinculación con el Inspector Lateral (Visor de Fuentes Real)
1. **Visor Legal y Documental:**
   * Al hacer clic en una cita `[1]` o en una fuente de la lista, el inspector lateral derecho debe abrirse y mostrar el texto real del fragmento seleccionado y la página de donde se extrajo.
2. **Visor de Hoja de Cálculo (Excel):**
   * Si la fuente consultada es un archivo Excel, el inspector debe cargar la grilla de celdas real extraída por `xlsx` y resaltar la fila o celda involucrada.

---

### Fase 5: Pruebas de Carga y Validación Operativa
1. Carga de un documento PDF real (ej. la orden de servicio en `Doc/`).
2. Consulta en el chat: "¿Cuál es el objeto de la orden de servicio y los hitos establecidos?".
3. Verificación de respuesta de Gemini con citas `[1]` y navegación en el inspector al fragmento exacto.
4. Carga de una carpeta con múltiples archivos mixtos y verificación de estabilidad sin errores en consola.
