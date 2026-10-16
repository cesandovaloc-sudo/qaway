# 📋 SPEC: Módulo de Búsqueda de Criterios (RAG Engine Hub)

## 1. Visión General y Propósito
El módulo **Búsqueda de Criterios** es un motor interactivo de recuperación semántica aumentada (RAG) diseñado para el ecosistema corporativo y gubernamental de Qaway Lab y MINEDU. Permite a especialistas, directores y gestores realizar consultas en lenguaje natural sobre normativas legales, matrices financieras/operativas de distribución y directivas técnicas, obteniendo respuestas estructuradas con citación canónica y navegación contextual inmediata.

El módulo está diseñado para **acoplarse de forma 100% nativa** en la plataforma web de Qaway Lab (sin iframes ni artificios) y con **aislamiento modular estricto**, de modo que en cualquier momento pueda desacoplarse a un repositorio propio y desplegarse independientemente en **Cloudflare Pages**.

---

## 2. Requerimientos Funcionales y Casos de Uso

### CU-01: Consulta Semántica y Filtrado Multi-Colección
* **Entrada:** Texto de búsqueda en lenguaje natural ingresado por el usuario.
* **Filtros de Colección:**
  * `all`: Búsqueda transversal en todas las fuentes.
  * `legal`: Normativa, leyes vigentes, decretos supremos y resoluciones ministeriales.
  * `spreadsheet`: Cuadros de distribución, matrices Excel, fórmulas presupuestales y EBITDA.
  * `document`: Manuales de cumplimiento, directivas pedagógicas y guías de gestión.
* **Comportamiento:** Simulación y ejecución de recuperación vectorial con umbral de similitud coseno (`similarity >= 0.75`).

### CU-02: Respuesta RAG Estructurada con Citaciones Canónicas
* **Generación de Síntesis:** Texto de respuesta fragmentado en segmentos semánticos.
* **Citas Interactivas:** Badges numéricos `[1]`, `[2]`, `[3]` vinculados unívocamente a los chunks vectoriales recuperados.
* **Interacción:** Al hacer clic en un badge o en una fila de la matriz de fuentes, el **Inspector Polimórfico** se posiciona automáticamente en la fuente correspondiente.

### CU-03: Matriz Comparativa Estructurada de Criterios
* **Visualización:** Tabla tabular comparativa con:
  * Fuente Vectorizada
  * Localizador Exacto (Artículo, Celda, Sección/Página)
  * Criterio / Impacto Cuantificado
  * Score de Similitud Coseno (HNSW + FTS)

### CU-04: Inspector Polimórfico Lateral (Visor de Fuentes)
Panel lateral derecho conmutable según el tipo de documento (`SourceLocator`):
1. **Visor Legal (`kind: "legal"`):**
   * Muestra número de norma, artículo, fecha de diario oficial, jurisdicción y árbol jerárquico.
   * Texto oficial resaltado con el extracto relevante de la cita.
2. **Visor Spreadsheet / Excel (`kind: "spreadsheet"`):**
   * Grilla tabular con encabezados de columna (A, B, C...) y numeración de filas.
   * Barra de fórmulas (`fx`) que muestra la fórmula activa o valor de la celda seleccionada.
   * Resaltado visual de la celda y fila vinculada al criterio consultado.
3. **Visor Documental / Manual (`kind: "document"`):**
   * Título de sección, número de página, párrafo y versión de la directiva.
   * Párrafo con extracto resaltado.

### CU-05: Conmutador White-Label en Tiempo Real
* Permite alternar la identidad visual del motor entre 3 paletas temáticas (`Paper & Ink`):
  * `rag-neutral`: Estilo corporativo minimalista Qaway Lab (Zinc/Gris editorial).
  * `rag-legal`: Estilo jurídico/normativo (Azul marino / pergamino sobrio).
  * `rag-finance`: Estilo financiero / hoja de cálculo (Verde esmeralda / datos contables).

### CU-06: Modal de Arquitectura Supabase `pgvector`
* Botón en header *"Ver SQL & Edge Function"* que abre un modal con el código SQL real de migración (`pgvector`, índice HNSW, políticas RLS por tenant) y la Supabase Edge Function (`gte-small` 384d).

---

## 3. Modelo de Datos y Contratos de Tipos (TypeScript)

```typescript
type RagThemeId = "rag-neutral" | "rag-legal" | "rag-finance";
type SourceCategory = "all" | "legal" | "spreadsheet" | "document";

interface LegalLocator {
  kind: "legal";
  lawNumber: string;
  article: string;
  hierarchy: string[];
  page: number;
  officialGazetteDate: string;
  jurisdiction: string;
}

interface SpreadsheetCellRow {
  rowNumber: number;
  cells: Record<string, string | number>;
  isHighlighted?: boolean;
}

interface SpreadsheetLocator {
  kind: "spreadsheet";
  workbookName: string;
  sheetName: string;
  cellRange: string;
  activeCell: string;
  formula?: string;
  columns: string[];
  rows: SpreadsheetCellRow[];
}

interface DocumentLocator {
  kind: "document";
  sectionTitle: string;
  page: number;
  paragraph: number;
  version: string;
}

type SourceLocator = LegalLocator | SpreadsheetLocator | DocumentLocator;

interface RagChunkMatch {
  citationIndex: number;
  chunkId: string;
  documentId: string;
  documentTitle: string;
  collectionId: SourceCategory;
  content: string;
  highlightedExcerpt: string;
  similarity: number;
  embeddingDimensions: 384 | 1536;
  locator: SourceLocator;
}

interface RagAnswerSegment {
  text: string;
  citations?: number[];
}

interface RagScenario {
  id: string;
  label: string;
  badge: string;
  query: string;
  latencyMs: number;
  summarySegments: RagAnswerSegment[];
  structuredComparison: {
    headers: string[];
    rows: Array<string[]>;
  };
  matches: RagChunkMatch[];
}
```

---

## 4. Requerimientos de Portabilidad (Desacoplamiento a Cloudflare Pages)
1. **Cero dependencias cruzadas:** Ningún archivo dentro de `src/` importará componentes o contextos externos a esta carpeta (`@/components`, `@/context`, etc.).
2. **Entrada Dual:**
   * **Modo Acoplado:** Exporta un componente React que se monta dentro de `CriteriosAppPage.jsx` bajo `/hub/criterios` con el shell oficial de Qaway.
   * **Modo Standalone (Cloudflare):** Al trasladar la carpeta, cuenta con su propio punto de entrada para Vite y empaquetado estático con Cloudflare Pages (`npm run build` -> `dist/`).
