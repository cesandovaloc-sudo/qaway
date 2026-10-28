/**
 * ============================================================================
 * ALMACÉN VECTORIAL LIGERO EN CLIENTE: INDEXEDDB + RECUPERACIÓN TOP-K (BM25)
 * Módulo: Búsqueda de Criterios (Qaway Lab & MINEDU)
 *
 * - Persistencia real de fragmentos en IndexedDB ('qaway-criterios-rag')
 *   para soportar documentos pesados sin desbordar localStorage.
 * - Caché de sesión en memoria por proyecto/documento (respaldo si IndexedDB
 *   no está disponible).
 * - Recuperación Top-K con BM25 portable (idf + saturación de frecuencia y
 *   normalización por longitud) sobre tokens sin acentos.
 * - Construcción de excerpts por documento para inyectarlos en
 *   queryGeminiRAG (projectSources[].excerpt → citas [1], [2], [3] verificables).
 * - Registro de la evidencia usada por turno para el Inspector (auditoría).
 * ============================================================================
 */

import {
  fetchRemoteChunkMatches,
  fetchRemoteProjectChunkCount,
  generateGeminiChunkEmbeddings,
  generateGeminiQueryEmbedding,
  insertRemoteChunkRows,
  isGeminiEmbeddingConfigured,
  isRemoteChunkStoreAvailable,
  purgeRemoteDocumentChunks,
  type RemoteChunkRow,
} from "./criteriosSupabaseService";

/* -------------------------------------------------------------------------- */
/* Modelos                                                                     */
/* -------------------------------------------------------------------------- */

export interface RagChunk {
  id: string;
  projectId: string;
  documentId: string;
  documentTitle: string;
  documentType: "legal" | "excel" | "doc";
  /** Localizador real: "Página 12" | "Hoja: Proyecciones · Fila 4 (Col B)" | "Bloque de párrafos 3–9". */
  locatorLabel: string;
  pageNumber: number | null;
  content: string;
  createdAt: number;
}

export interface RetrievedChunk extends RagChunk {
  rawScore: number;
  normalizedScore: number;
}

export interface StoredSourceMeta {
  id: string;
  title: string;
  type: "legal" | "excel" | "doc";
  badge: string;
  description: string;
  metaPages: string;
  chunksCount: number;
  statusText: string;
  inspectorTab: 1 | 2 | 3;
}

export interface StoredDocumentRecord {
  documentId: string;
  projectId: string;
  sourceMeta: StoredSourceMeta;
  createdAt: number;
}

export interface RetrievalResult {
  top: RetrievedChunk[];
  relaxed: boolean;
  totalChunks: number;
}

/* -------------------------------------------------------------------------- */
/* IndexedDB (+ respaldo de sesión en memoria)                                 */
/* -------------------------------------------------------------------------- */

const DB_NAME = "qaway-criterios-rag";
const DB_VERSION = 1;
const STORE_DOCS = "documents";
const STORE_CHUNKS = "chunks";

let dbPromise: Promise<IDBDatabase | null> | null = null;

/** Cachés de sesión (respaldo si IndexedDB no está disponible o aún no hace flush). */
const chunkMemoryByProject = new Map<string, RagChunk[]>();
const chunkMemoryByDocument = new Map<string, RagChunk[]>();
const documentMetaMemory = new Map<string, StoredDocumentRecord[]>();

function documentMetaKey(projectId: string, documentId: string): string {
  return `${projectId}::${documentId}`;
}

function invalidateDocumentMemory(documentId: string): void {
  chunkMemoryByDocument.delete(documentId);
  for (const [key, list] of chunkMemoryByProject.entries()) {
    if (list.some((chunk) => chunk.documentId === documentId)) {
      chunkMemoryByProject.set(
        key,
        list.filter((chunk) => chunk.documentId !== documentId)
      );
    }
  }
}

function cacheDocumentChunks(chunks: RagChunk[], projectId: string): void {
  if (chunks.length === 0) return;
  const first = chunks[0]!;
  chunkMemoryByDocument.set(first.documentId, chunks);
  const projectCache = chunkMemoryByProject.get(projectId);
  if (projectCache) {
    const withoutDoc = projectCache.filter((chunk) => chunk.documentId !== first.documentId);
    chunkMemoryByProject.set(projectId, [...withoutDoc, ...chunks]);
  }
}

function openRagDb(): Promise<IDBDatabase | null> {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve) => {
    try {
      if (typeof indexedDB === "undefined") {
        resolve(null);
        return;
      }
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE_DOCS)) {
          const docs = db.createObjectStore(STORE_DOCS, { keyPath: "documentId" });
          docs.createIndex("projectId", "projectId", { unique: false });
        }
        if (!db.objectStoreNames.contains(STORE_CHUNKS)) {
          const chunksStore = db.createObjectStore(STORE_CHUNKS, { keyPath: "id" });
          chunksStore.createIndex("projectId", "projectId", { unique: false });
          chunksStore.createIndex("documentId", "documentId", { unique: false });
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => {
        console.warn("[AlmacénRAG] IndexedDB no disponible; se usará memoria de sesión.");
        resolve(null);
      };
    } catch {
      console.warn("[AlmacénRAG] IndexedDB no disponible; se usará memoria de sesión.");
      resolve(null);
    }
  });
  return dbPromise;
}

function requestToPromise<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error("IndexedDB request error"));
  });
}

/* -------------------------------------------------------------------------- */
/* Persistencia y lectura                                                      */
/* -------------------------------------------------------------------------- */

export async function persistDocumentWithChunks(
  projectId: string,
  sourceMeta: StoredSourceMeta,
  chunks: RagChunk[]
): Promise<void> {
  const record: StoredDocumentRecord = {
    documentId: sourceMeta.id,
    projectId,
    sourceMeta,
    createdAt: Date.now(),
  };
  documentMetaMemory.set(documentMetaKey(projectId, record.documentId), [record]);
  cacheDocumentChunks(chunks, projectId);

  // ── Capa de ingesta remota (pgvector): embeddings Gemini por lotes + purga
  // idempotente + upsert. Best-effort: sin API key, sin cuota o sin conectividad
  // el documento queda operativo en el motor local sin interrumpir la ingesta.
  await ingestRemoteDocumentChunks(projectId, record, chunks);

  const db = await openRagDb();
  if (!db) return;
  try {
    const tx = db.transaction([STORE_DOCS, STORE_CHUNKS], "readwrite");
    const docsStore = tx.objectStore(STORE_DOCS);
    const chunksStore = tx.objectStore(STORE_CHUNKS);

    // Limpia fragmentos previos del mismo documento (re-index idempotente)
    const cursorRequest = chunksStore.index("documentId").openCursor(IDBKeyRange.only(record.documentId));
    cursorRequest.onsuccess = () => {
      const cursor = cursorRequest.result;
      if (cursor) {
        cursor.delete();
        cursor.continue();
      }
    };

    void docsStore.put(record);
    for (const chunk of chunks) {
      void chunksStore.put(chunk);
    }
    await new Promise<void>((resolve) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
      tx.onabort = () => resolve();
    });
  } catch (err) {
    console.warn("[AlmacénRAG] Escritura en IndexedDB fallida:", err);
  }
}

export async function loadChunksForDocument(documentId: string): Promise<RagChunk[]> {
  const cached = chunkMemoryByDocument.get(documentId);
  if (cached && cached.length > 0) return cached;

  const db = await openRagDb();
  if (!db) return [];
  try {
    const tx = db.transaction([STORE_CHUNKS], "readonly");
    const index = tx.objectStore(STORE_CHUNKS).index("documentId");
    const chunks = (await requestToPromise(index.getAll(documentId))) as RagChunk[];
    if (chunks.length > 0) chunkMemoryByDocument.set(documentId, chunks);
    return chunks;
  } catch (err) {
    console.warn("[AlmacénRAG] Lectura de fragmentos fallida:", err);
    return [];
  }
}

export async function getChunksForProject(projectId: string): Promise<RagChunk[]> {
  const cached = chunkMemoryByProject.get(projectId);
  if (cached && cached.length > 0) return cached;

  const db = await openRagDb();
  if (!db) return [];
  try {
    const tx = db.transaction([STORE_CHUNKS], "readonly");
    const index = tx.objectStore(STORE_CHUNKS).index("projectId");
    const chunks = (await requestToPromise(index.getAll(projectId))) as RagChunk[];
    if (chunks.length > 0) chunkMemoryByProject.set(projectId, chunks);
    return chunks;
  } catch (err) {
    console.warn("[AlmacénRAG] Lectura de proyecto fallida:", err);
    return [];
  }
}

/** Metadatos persistidos de documentos del proyecto (para hidratar la UI). */
export async function loadStoredDocumentsForProject(projectId: string): Promise<StoredSourceMeta[]> {
  const metas: StoredSourceMeta[] = [];
  const seen = new Set<string>();
  const prefix = `${projectId}::`;
  for (const [key, list] of documentMetaMemory.entries()) {
    if (!key.startsWith(prefix)) continue;
    for (const record of list) {
      if (!record || seen.has(record.documentId)) continue;
      seen.add(record.documentId);
      metas.push(record.sourceMeta);
    }
  }
  if (metas.length > 0) return metas;

  const db = await openRagDb();
  if (!db) return [];
  try {
    const tx = db.transaction([STORE_DOCS], "readonly");
    const index = tx.objectStore(STORE_DOCS).index("projectId");
    const records = (await requestToPromise(index.getAll(projectId))) as StoredDocumentRecord[];
    for (const record of records) {
      if (!record || !record.sourceMeta) continue;
      documentMetaMemory.set(documentMetaKey(projectId, record.documentId), [record]);
      metas.push(record.sourceMeta);
    }
    return metas;
  } catch (err) {
    console.warn("[AlmacénRAG] Lectura de documentos fallida:", err);
    return [];
  }
}

export async function removeStoredDocument(documentId: string): Promise<void> {
  invalidateDocumentMemory(documentId);
  for (const [key, list] of documentMetaMemory.entries()) {
    if (list.some((record) => record.documentId === documentId)) {
      documentMetaMemory.set(
        key,
        list.filter((record) => record.documentId !== documentId)
      );
    }
  }

  // Purga espejo remota (pgvector): best-effort y silenciosa; la purga local de
  // IndexedDB sigue siendo la fuente de verdad inmediata de la sesión.
  if (isGeminiEmbeddingConfigured()) {
    await purgeRemoteDocumentChunks(documentId);
  }

  const db = await openRagDb();
  if (!db) return;
  try {
    const tx = db.transaction([STORE_DOCS, STORE_CHUNKS], "readwrite");
    const chunksStore = tx.objectStore(STORE_CHUNKS);
    const cursorRequest = chunksStore.index("documentId").openCursor(IDBKeyRange.only(documentId));
    cursorRequest.onsuccess = () => {
      const cursor = cursorRequest.result;
      if (cursor) {
        cursor.delete();
        cursor.continue();
      }
    };
    void tx.objectStore(STORE_DOCS).delete(documentId);
    await new Promise<void>((resolve) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
      tx.onabort = () => resolve();
    });
  } catch (err) {
    console.warn("[AlmacénRAG] Eliminación de documento fallida:", err);
  }
}

/* -------------------------------------------------------------------------- */
/* Recuperación Top-K (BM25 portable en cliente)                               */
/* -------------------------------------------------------------------------- */

const STOPWORDS = new Set([
  "que","del","los","las","por","para","con","una","como","mas","pero","sus","este","esta",
  "esto","todo","todos","todas","cada","sobre","entre","desde","hasta","cuando","cual",
  "cuales","donde","hay","son","fue","era","ser","segun","su","tiene","tienen","puede",
  "pueden","debe","deben","favor","gracias","hola","buenos","buenas","dias","tardes",
  "noches","sin","ante","bajo","contra","the","and","for",
]);

function tokenize(text: string): string[] {
  const cleaned = text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ");
  const words = cleaned.split(/\s+/);
  const tokens: string[] = [];
  for (const word of words) {
    if (word.length < 3 || STOPWORDS.has(word)) continue;
    tokens.push(word);
    if (tokens.length >= 60) break;
  }
  return tokens;
}

const BM25_K1 = 1.4;
const BM25_B = 0.72;

export async function retrieveRelevantChunks(
  projectId: string,
  query: string,
  options: { topK: number; threshold: number }
): Promise<RetrievalResult> {
  const { topK, threshold } = options;

  // ── Capa 1: lectura vectorial remota (pgvector + HNSW, umbral calibrado) ──
  const remote = await retrieveFromRemoteVectorStore(projectId, query, topK, threshold);
  if (remote) return remote;

  // ── Capa 2: BM25 local (IndexedDB) — motor de respaldo resiliente ──
  const chunks = await getChunksForProject(projectId);
  if (chunks.length === 0 || !query.trim()) {
    return { top: [], relaxed: false, totalChunks: chunks.length };
  }

  const queryTokens = Array.from(new Set(tokenize(query)));
  if (queryTokens.length === 0) {
    return { top: [], relaxed: false, totalChunks: chunks.length };
  }

  // Estadísticas de corpus del proyecto
  const termFrequency: Array<Map<string, number>> = [];
  const documentFrequency = new Map<string, number>();
  let totalLength = 0;
  for (const chunk of chunks) {
    const tokens = tokenize(chunk.content);
    const tf = new Map<string, number>();
    for (const token of tokens) {
      tf.set(token, (tf.get(token) ?? 0) + 1);
    }
    termFrequency.push(tf);
    totalLength += tokens.length;
    for (const token of queryTokens) {
      if (tf.has(token)) {
        documentFrequency.set(token, (documentFrequency.get(token) ?? 0) + 1);
      }
    }
  }
  const avgLength = totalLength / chunks.length || 1;
  const corpusSize = chunks.length;

  const scored: RetrievedChunk[] = [];
  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i]!;
    const tf = termFrequency[i]!;
    let length = 0;
    for (const count of tf.values()) length += count;
    let rawScore = 0;
    for (const term of queryTokens) {
      const occurrences = tf.get(term) ?? 0;
      if (occurrences === 0) continue;
      const df = documentFrequency.get(term) ?? 0;
      const idf = Math.log(1 + (corpusSize - df + 0.5) / (df + 0.5));
      const tfNorm =
        (occurrences * (BM25_K1 + 1)) /
        (occurrences + BM25_K1 * (1 - BM25_B + BM25_B * (length / avgLength)));
      rawScore += idf * tfNorm;
    }
    if (rawScore > 0) {
      scored.push({ ...chunk, rawScore, normalizedScore: 0 });
    }
  }

  scored.sort((a, b) => b.rawScore - a.rawScore);
  const bestScore = scored.length > 0 ? scored[0]!.rawScore : 0;
  for (const item of scored) {
    item.normalizedScore = bestScore > 0 ? 0.35 + 0.65 * (item.rawScore / bestScore) : 0;
  }

  const passing = scored.filter((item) => item.normalizedScore >= Math.min(threshold, 0.99));
  let relaxed = false;
  let top = passing.slice(0, topK);
  if (top.length === 0 && scored.length > 0) {
    relaxed = true;
    top = scored.slice(0, Math.max(3, Math.min(topK, scored.length)));
  }
  return { top, relaxed, totalChunks: chunks.length };
}

/* -------------------------------------------------------------------------- */
/* Capa de lectura vectorial remota (Supabase pgvector + índice HNSW)          */
/* -------------------------------------------------------------------------- */

/** Calibración de umbrales entre motores:
 * - El BM25 local normaliza en [0.35, 1.0] (umbral de UI por defecto: 0.75).
 * - El coseno de embeddings reales suele moverse en [0.15, 0.75].
 * Conversión: coseno ≈ 0.52 × BM25 (piso 0.25) y segunda pasada relaxed a 0.18. */
const REMOTE_THRESHOLD_RATIO = 0.52;
const REMOTE_THRESHOLD_FLOOR = 0.25;
const REMOTE_THRESHOLD_RELAXED = 0.18;
/** Remapea el coseno [0, 0.7] a la escala de "Similitud" mostrada en la UI [0, 1]. */
const REMOTE_SCORE_SCALE = 1.45;

/** Mapea filas del RPC al contrato estricto de RetrievedChunk que consume la UI. */
function mapRemoteRowsToRetrieved(rows: RemoteChunkRow[]): RetrievedChunk[] {
  const mapped: RetrievedChunk[] = [];
  for (const row of rows) {
    if (!row || typeof row.content !== "string" || !row.content.trim()) continue;
    mapped.push({
      id: row.id,
      projectId: row.project_id ?? "",
      documentId: row.document_id,
      documentTitle: row.document_title,
      documentType: row.document_type === "legal" || row.document_type === "excel" ? row.document_type : "doc",
      locatorLabel: row.locator_label,
      pageNumber: row.page_number,
      content: row.content,
      createdAt: Date.now(),
      rawScore: row.similarity,
      normalizedScore: Math.min(1, row.similarity * REMOTE_SCORE_SCALE),
    });
  }
  return mapped;
}

/** Lectura semántica remota; null = "no disponible este turno" → BM25 local. */
async function retrieveFromRemoteVectorStore(
  projectId: string,
  query: string,
  topK: number,
  threshold: number
): Promise<RetrievalResult | null> {
  const trimmed = query.trim();
  if (!trimmed) return null;
  try {
    if (!isGeminiEmbeddingConfigured()) return null;
    if (!(await isRemoteChunkStoreAvailable())) return null;

    const queryVector = await generateGeminiQueryEmbedding(trimmed);
    if (!queryVector) return null;

    const matchCount = Math.max(topK, 18);
    const remoteThreshold = Math.max(REMOTE_THRESHOLD_FLOOR, threshold * REMOTE_THRESHOLD_RATIO);

    let rows = await fetchRemoteChunkMatches(queryVector, remoteThreshold, matchCount, projectId);
    if (rows === null) return null;

    let relaxed = false;
    if (rows.length === 0) {
      rows = await fetchRemoteChunkMatches(queryVector, REMOTE_THRESHOLD_RELAXED, matchCount, projectId);
      if (rows === null) return null;
      if (rows.length === 0) {
        // Sin coincidencias remotas: si el proyecto vive en el motor local, usar BM25.
        const localChunks = await getChunksForProject(projectId);
        if (localChunks.length > 0) return null;
        return { top: [], relaxed: false, totalChunks: 0 };
      }
      relaxed = true;
    }

    const top = mapRemoteRowsToRetrieved(rows).slice(0, Math.max(1, topK));
    let totalChunks = await fetchRemoteProjectChunkCount(projectId);
    if (totalChunks === null) {
      totalChunks = (await getChunksForProject(projectId)).length;
    }
    return { top, relaxed, totalChunks };
  } catch (err) {
    console.warn("[AlmacénRAG] Lectura vectorial remota no disponible; se usa el motor local:", err);
    return null;
  }
}

/** Ingesta remota de un documento: embeddings por lotes → purga idempotente → upsert. */
async function ingestRemoteDocumentChunks(
  projectId: string,
  record: StoredDocumentRecord,
  chunks: RagChunk[]
): Promise<void> {
  if (chunks.length === 0) return;
  try {
    if (!isGeminiEmbeddingConfigured()) return;
    if (!(await isRemoteChunkStoreAvailable())) return;

    const vectors = await generateGeminiChunkEmbeddings(
      chunks.map((chunk) => ({ content: chunk.content, title: chunk.documentTitle }))
    );
    if (!vectors || vectors.length !== chunks.length) {
      console.warn(`[AlmacénRAG] "${record.sourceMeta.title}" queda operativo solo en el motor local (embeddings no disponibles).`);
      return;
    }

    // Purga idempotente ANTES de insertar: re-indexado sin huérfanos remotos.
    await purgeRemoteDocumentChunks(record.documentId, projectId);

    const rows = chunks.map((chunk, index) => ({
      id: chunk.id,
      project_id: projectId,
      document_id: chunk.documentId,
      document_title: chunk.documentTitle,
      document_type: chunk.documentType,
      locator_label: chunk.locatorLabel,
      page_number: chunk.pageNumber,
      content: chunk.content,
      embedding: vectors[index] ?? [],
    }));

    if (await insertRemoteChunkRows(rows)) {
      console.info(`[AlmacénRAG] ${chunks.length} fragmentos con embedding en Supabase (pgvector) para "${record.sourceMeta.title}".`);
    } else {
      console.warn(`[AlmacénRAG] Inserción remota incompleta para "${record.sourceMeta.title}"; queda operativo en el motor local.`);
    }
  } catch (err) {
    console.warn("[AlmacénRAG] Ingesta remota omitida:", err);
  }
}

/* -------------------------------------------------------------------------- */
/* Excerpts por documento para queryGeminiRAG                                  */
/* -------------------------------------------------------------------------- */

function trimSnippet(text: string, maxLength: number): string {
  const flat = text.replace(/\s+/g, " ").trim();
  return flat.length > maxLength ? `${flat.slice(0, maxLength).trimEnd()}…` : flat;
}

/** Une los fragmentos top de un documento en un excerpt amplio para análisis profundo en el prompt. */
export function buildSourceExcerpt(chunks: RetrievedChunk[], maxChars = 2800): string {
  if (!chunks || chunks.length === 0) return "";
  const parts: string[] = [];
  let used = 0;
  for (const chunk of chunks) {
    const snippet = trimSnippet(chunk.content, 850);
    const part = `[${chunk.locatorLabel}] «${snippet}»`;
    if (used + part.length > maxChars && parts.length > 0) break;
    parts.push(part);
    used += part.length + 1;
  }
  return parts.join("\n   ");
}

/* -------------------------------------------------------------------------- */
/* Evidencia por turno (auditoría del Inspector sin inflar la persistencia)    */
/* -------------------------------------------------------------------------- */

const turnEvidenceStore = new Map<string, RetrievedChunk[]>();
const turnCitationOrderStore = new Map<string, string[]>();
const MAX_TURNS_STORED = 40;

export function storeTurnEvidence(
  turnId: string,
  chunks: RetrievedChunk[],
  orderedDocumentIds?: string[]
): void {
  if (!turnId || chunks.length === 0) return;
  if (turnEvidenceStore.size >= MAX_TURNS_STORED) {
    const oldest = turnEvidenceStore.keys().next();
    if (!oldest.done) turnEvidenceStore.delete(oldest.value);
  }
  turnEvidenceStore.set(turnId, chunks);
  if (orderedDocumentIds && orderedDocumentIds.length > 0) {
    if (turnCitationOrderStore.size >= MAX_TURNS_STORED) {
      const oldestOrder = turnCitationOrderStore.keys().next();
      if (!oldestOrder.done) turnCitationOrderStore.delete(oldestOrder.value);
    }
    turnCitationOrderStore.set(turnId, orderedDocumentIds);
  }
}

/** Orden de las fuentes numeradas del turno ([n] → documentId n-ésimo). */
export function getTurnDocumentOrder(turnId: string): string[] {
  return turnCitationOrderStore.get(turnId) ?? [];
}

export function getTurnEvidence(turnId: string, documentId?: string): RetrievedChunk[] {
  const all = turnEvidenceStore.get(turnId) ?? [];
  if (!documentId) return all;
  return all.filter((chunk) => chunk.documentId === documentId);
}

export function bestTurnChunkForDocument(turnId: string, documentId: string): RetrievedChunk | null {
  const chunks = getTurnEvidence(turnId, documentId);
  if (chunks.length === 0) return null;
  return chunks[0] ?? null;
}

/** Última evidencia CON score registrada para un documento (turno más reciente que la citó). */
export function getLastTurnEvidenceForDocument(documentId: string): RetrievedChunk[] {
  const entries = [...turnEvidenceStore.entries()].reverse();
  for (const [, chunks] of entries) {
    const docChunks = chunks.filter((chunk) => chunk.documentId === documentId);
    if (docChunks.length > 0) return docChunks;
  }
  return [];
}
