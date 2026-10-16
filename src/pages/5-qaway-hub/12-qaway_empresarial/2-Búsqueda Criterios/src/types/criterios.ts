/* ============================================================================
 * Contratos y tipos estrictos — Búsqueda de Criterios (RAG Engine)
 * Extraído verbatim de 'Propuesta de codigo.txt' §11 y §48
 * Sin alteraciones visuales ni lógicas. Solo imports relativos en consumidores.
 * ============================================================================ */

export type RagThemeId = "rag-neutral" | "rag-legal" | "rag-finance";
export type SourceCategory = "all" | "legal" | "spreadsheet" | "document";

export interface LegalLocator {
  kind: "legal";
  lawNumber: string;
  article: string;
  hierarchy: string[];
  page: number;
  officialGazetteDate: string;
  jurisdiction: string;
}

export interface SpreadsheetCellRow {
  rowNumber: number;
  cells: Record<string, string | number>;
  isHighlighted?: boolean;
}

export interface SpreadsheetLocator {
  kind: "spreadsheet";
  workbookName: string;
  sheetName: string;
  cellRange: string;
  activeCell: string;
  formula?: string;
  columns: string[];
  rows: SpreadsheetCellRow[];
}

export interface DocumentLocator {
  kind: "document";
  sectionTitle: string;
  page: number;
  paragraph: number;
  version: string;
}

export type SourceLocator = LegalLocator | SpreadsheetLocator | DocumentLocator;

export interface RagChunkMatch {
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

export interface RagAnswerSegment {
  text: string;
  citations?: number[];
}

export interface RagScenario {
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

export interface KnowledgeCollection {
  id: SourceCategory;
  name: string;
  documentCount: number;
  vectorCount: number;
}

export interface RagThemePalette {
  name: string;
  subtitle: string;
  bgPage: string;
  bgSurface: string;
  bgSubtle: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  borderDefault: string;
  actionPrimary: string;
  accentCitation: string;
  accentCitationBg: string;
  highlightMatch: string;
}

export type RagThemeConfig = Record<RagThemeId, RagThemePalette>;
