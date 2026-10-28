/**
 * ============================================================================
 * SERVICIO DE INGESTA REAL: PARSERS DE DOCUMENTOS EN CLIENTE
 * Módulo: Búsqueda de Criterios (Qaway Lab & MINEDU)
 *
 * Extracción de texto real, en el navegador, sin backend:
 * - PDF (.pdf): pdfjs-dist en worker, texto página por página { pageNumber, text }.
 * - Excel (.xlsx/.xls): librería xlsx, hoja + fila + columna con localizadores de celda.
 * - CSV (.csv): parseado por la misma librería xlsx (texto plano).
 * - Word (.docx): mammoth (compilación de navegador), párrafos con localizador de bloque.
 * - Texto (.txt/.md/.json): FileReader nativo, bloques de lectura.
 * - Carpetas (webkitdirectory): filtrado de archivos del sistema y binarios no soportados.
 *
 * Cadena de fragmentación (chunking) semántico: bloques de 600–1.000 caracteres
 * con 100 caracteres de solapamiento, conservando el localizador real
 * (página del PDF / hoja·fila·columna del Excel / bloque de párrafos del DOCX).
 * ============================================================================
 */

import * as XLSX from "xlsx";
import type { PDFPageProxy } from "pdfjs-dist";
import type { RagChunk } from "./ragVectorStoreService";

/* -------------------------------------------------------------------------- */
/* Tipos públicos                                                              */
/* -------------------------------------------------------------------------- */

export interface ParsedPage {
  /** Localizador humano: "Página 12" | "Hoja: Proyecciones · Fila 4 (Col B)" | "Bloque de párrafos 1–18". */
  locator: string;
  pageNumber: number | null;
  text: string;
}

export type ParsedKind = "pdf" | "excel" | "docx" | "text";

export interface ParsedDocumentContent {
  kind: ParsedKind;
  sourceName: string;
  mimeType: string;
  pages: ParsedPage[];
  metaPages: string;
  summary: string;
}

export type SourceType = "legal" | "excel" | "doc";

export interface ChunkBuildParams {
  documentId: string;
  documentTitle: string;
  documentType: SourceType;
  parsed: ParsedDocumentContent;
  projectId: string;
}

/* -------------------------------------------------------------------------- */
/* Parámetros del chunking semántico                                           */
/* -------------------------------------------------------------------------- */

const CHUNK_MIN = 600;
const CHUNK_TARGET = 900;
const CHUNK_MAX = 1000;
const CHUNK_OVERLAP = 100;

const MAX_PDF_PAGES = 400;
const MAX_EXCEL_ROWS = 4000;
const DOCX_BLOCK_CHARS = 4500;
const TEXT_BLOCK_CHARS = 4800;

/* -------------------------------------------------------------------------- */
/* Clasificación de archivos (paridad 1:1 con la lógica previa del modal)      */
/* -------------------------------------------------------------------------- */

const SUPPORTED_EXTENSIONS = [".pdf", ".xlsx", ".xls", ".csv", ".docx", ".txt", ".md", ".json"];

export function classifyFileName(name: string): {
  type: SourceType;
  badge: string;
  inspectorTab: 1 | 2 | 3;
} {
  const lower = name.toLowerCase();
  const isExcel =
    lower.endsWith(".xlsx") || lower.endsWith(".xls") || lower.endsWith(".csv");
  const isLegal =
    lower.includes("ley") ||
    lower.includes("ds") ||
    lower.includes("decreto") ||
    lower.includes("norma") ||
    lower.includes("resoluci") ||
    lower.includes("directiva") ||
    lower.includes("oficio");
  const type: SourceType = isExcel ? "excel" : isLegal ? "legal" : "doc";
  return {
    type,
    badge: isExcel ? "Matriz Excel" : isLegal ? "Norma Oficial" : "Documento Indexado",
    inspectorTab: isExcel ? 2 : isLegal ? 1 : 3,
  };
}

/** Acepta archivos válidos de usuario; descarta temporales, de sistema y vacíos. */
export function isSupportedFile(file: File): boolean {
  const name = file.name || "";
  if (file.size <= 0) return false;
  if (name.startsWith("~$") || name.startsWith(".") || name.startsWith("__MACOSX")) return false;
  if (name.split("/").some((part) => part.startsWith(".") || part === "__MACOSX")) return false;
  const lower = name.toLowerCase();
  return SUPPORTED_EXTENSIONS.some((ext) => lower.endsWith(ext));
}

/* -------------------------------------------------------------------------- */
/* PDF (pdfjs-dist en worker)                                                  */
/* -------------------------------------------------------------------------- */

type PdfjsModule = typeof import("pdfjs-dist");

let pdfjsModulePromise: Promise<PdfjsModule> | null = null;

async function loadPdfjs(): Promise<PdfjsModule> {
  if (!pdfjsModulePromise) {
    pdfjsModulePromise = (async () => {
      const lib = await import("pdfjs-dist");
      if (!lib.GlobalWorkerOptions.workerSrc) {
        try {
          const workerUrlModule = await import(
            "pdfjs-dist/build/pdf.worker.min.mjs?url"
          );
          lib.GlobalWorkerOptions.workerSrc = workerUrlModule.default as string;
        } catch (workerError) {
          console.warn("[Ingesta] Worker de PDF no disponible, se usa hilo principal:", workerError);
        }
      }
      return lib;
    })();
  }
  return pdfjsModulePromise;
}

interface PdfTextItem {
  str?: string;
  hasEOL?: boolean;
}

function cleanExtractedText(raw: string): string {
  return raw
    .replace(/\u0000/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

/* -------------------------------------------------------------------------- */
/* OCR en cliente (Tesseract.js) para PDFs escaneados o fotocopias antiguas    */
/* -------------------------------------------------------------------------- */

/** Debajo de este umbral de texto limpio, la página se clasifica como escaneada. */
const OCR_TEXT_MIN_CHARS = 30;
/** Escala máxima de render (control de memoria). */
const OCR_SCALE_MAX = 1.5;
/** Área máxima del canvas (~4.2 MP): páginas tipo A3 no deben reventar memoria. */
const OCR_MAX_CANVAS_AREA = 4_200_000;

interface OcrWorkerLike {
  recognize: (image: unknown) => Promise<{ data?: { text?: string } }>;
  terminate: () => Promise<unknown>;
}

/** Worker único de Tesseract por documento, creado solo si aparece la primera
 * página escaneada. worker/wasm/langdata 'spa' se cargan bajo demanda con
 * versión fijada por CDN y quedan cacheados por tesseract.js en IndexedDB. */
async function createOcrWorker(): Promise<OcrWorkerLike | null> {
  try {
    const candidates: any[] = [];
    try {
      candidates.push(await import("tesseract.js"));
    } catch {
      // Resolución ESM/CJS alternativa si el empaquetador no la sirve directa
    }
    if (!candidates[0]?.createWorker) {
      try {
        candidates.push((await import("tesseract.js/dist/tesseract.min.js")) as any);
      } catch {
        // Última instancia: objeto global expuesto por el bundle UMD
      }
    }
    const mod = candidates.find((m) => m?.createWorker || m?.default?.createWorker);
    const createWorker = mod?.createWorker ?? mod?.default?.createWorker ?? (globalThis as any)?.Tesseract?.createWorker;
    if (typeof createWorker !== "function") return null;
    const worker = await createWorker("spa", 1);
    return worker as OcrWorkerLike;
  } catch (err) {
    console.warn("[Ingesta] OCR no disponible (tesseract.js):", err);
    return null;
  }
}

/** Renderiza la página en un canvas en memoria y corre OCR; libera recursos al terminar. */
async function ocrPdfPageCanvas(worker: OcrWorkerLike, page: PDFPageProxy): Promise<string> {
  const canvas = document.createElement("canvas");
  try {
    const reference = page.getViewport({ scale: OCR_SCALE_MAX });
    const area = reference.width * reference.height;
    const scale =
      area > OCR_MAX_CANVAS_AREA
        ? Math.max(0.75, OCR_SCALE_MAX * Math.sqrt(OCR_MAX_CANVAS_AREA / area))
        : OCR_SCALE_MAX;
    const viewport = page.getViewport({ scale });
    canvas.width = Math.max(1, Math.floor(viewport.width));
    canvas.height = Math.max(1, Math.floor(viewport.height));
    const context = canvas.getContext("2d");
    if (!context) return "";
    await page.render({ canvasContext: context, viewport }).promise;
    const result = await worker.recognize(canvas);
    return cleanExtractedText(String(result?.data?.text ?? ""));
  } catch (err) {
    console.warn("[Ingesta] OCR de página fallido:", err);
    return "";
  } finally {
    canvas.width = 0;
    canvas.height = 0;
    try {
      page.cleanup();
    } catch {
      // Liberación de recursos de la página: silenciosa
    }
  }
}

async function parsePdfFile(file: File): Promise<{ pages: ParsedPage[]; pageCount: number }> {
  const lib = await loadPdfjs();
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await lib.getDocument({
    data: new Uint8Array(arrayBuffer),
    useWorkerFetch: false,
    isEvalSupported: false,
  }).promise;

  const pageCount = Math.min(pdf.numPages, MAX_PDF_PAGES);
  const pages: ParsedPage[] = [];
  // Worker de OCR único por documento: se instancia solo si aparece la primera
  // página escaneada y se libera al terminar (también en caso de error).
  let ocrWorker: OcrWorkerLike | null = null;
  try {
    for (let p = 1; p <= pageCount; p++) {
      try {
        const page = await pdf.getPage(p);
        const textContent = await page.getTextContent();
        let text = "";
        for (const item of textContent.items as PdfTextItem[]) {
          text += (item.str ?? "") + (item.hasEOL ? "\n" : " ");
        }
        const cleaned = cleanExtractedText(text);
        if (cleaned.length >= OCR_TEXT_MIN_CHARS) {
          pages.push({ locator: `Página ${p}`, pageNumber: p, text: cleaned });
          continue;
        }

        // Página escaneada o fotocopia: OCR en memoria (escala máx. 1.5x)
        if (!ocrWorker) ocrWorker = await createOcrWorker();
        if (!ocrWorker) {
          if (cleaned) {
            pages.push({ locator: `Página ${p}`, pageNumber: p, text: cleaned });
          }
          continue;
        }
        console.info(`[Ingesta] OCR página ${p}/${pageCount} de ${file.name}…`);
        const ocrText = await ocrPdfPageCanvas(ocrWorker, page);
        if (ocrText) {
          pages.push({ locator: `Página ${p} (OCR)`, pageNumber: p, text: ocrText });
        } else if (cleaned) {
          pages.push({ locator: `Página ${p}`, pageNumber: p, text: cleaned });
        }
      } catch (pageError) {
        console.warn(`[Ingesta] Página ${p} de ${file.name} no extraíble:`, pageError);
      }
    }
  } finally {
    if (ocrWorker) {
      try {
        await ocrWorker.terminate();
      } catch {
        // Liberación del worker de OCR: silenciosa
      }
    }
  }
  return { pages, pageCount: pdf.numPages };
}

/* -------------------------------------------------------------------------- */
/* Excel / CSV (librería xlsx)                                                 */
/* -------------------------------------------------------------------------- */

interface ExcelParsed {
  pages: ParsedPage[];
  sheetCount: number;
  rowCount: number;
}

function workbookToPages(wb: XLSX.WorkBook, sourceName: string): ExcelParsed {
  const pages: ParsedPage[] = [];
  let rowCount = 0;
  for (const sheetName of wb.SheetNames) {
    const ws = wb.Sheets[sheetName];
    if (!ws) continue;
    let sheetRows = 0;
    try {
      const rows = XLSX.utils.sheet_to_json<unknown[]>(ws, {
        header: 1,
        raw: false,
        defval: "",
        blankrows: false,
      });
      for (let r = 0; r < rows.length; r++) {
        if (rowCount >= MAX_EXCEL_ROWS || sheetRows >= MAX_EXCEL_ROWS) break;
        const cells = rows[r];
        if (!cells) continue;
        let line = "";
        let firstCol = -1;
        let lastCol = -1;
        for (let c = 0; c < cells.length; c++) {
          const value = cells[c] === undefined || cells[c] === null ? "" : String(cells[c]).trim();
          if (!value) continue;
          if (firstCol === -1) firstCol = c;
          lastCol = c;
          line += (line ? " | " : "") + `${XLSX.utils.encode_col(c) || `Col${c}`}: ${value}`;
        }
        if (!line) continue;
        rowCount++;
        sheetRows++;
        const locatorSuffix =
          firstCol === lastCol || lastCol === -1
            ? ""
            : `–${XLSX.utils.encode_col(lastCol)}`;
        pages.push({
          locator: `Hoja: ${sheetName} · Fila ${r + 1} (Col ${firstCol >= 0 ? XLSX.utils.encode_col(firstCol) : "?"}${locatorSuffix})`,
          pageNumber: null,
          text: `[${sourceName} · Hoja "${sheetName}" · Fila ${r + 1}] ${line}`,
        });
      }
    } catch (sheetError) {
      console.warn(`[Ingesta] Hoja "${sheetName}" de ${sourceName} no extraíble:`, sheetError);
    }
  }
  return { pages, sheetCount: wb.SheetNames.length, rowCount };
}

async function parseSpreadsheetFile(file: File, kind: "excel" | "csv"): Promise<ExcelParsed> {
  if (kind === "excel") {
    const arrayBuffer = await file.arrayBuffer();
    const wb = XLSX.read(new Uint8Array(arrayBuffer), { type: "array", cellDates: false });
    return workbookToPages(wb, file.name);
  }
  const text = await file.text();
  const wb = XLSX.read(text, { type: "string" });
  return workbookToPages(wb, file.name);
}

/* -------------------------------------------------------------------------- */
/* DOCX (mammoth · compilación de navegador)                                   */
/* -------------------------------------------------------------------------- */

type MammothBrowserModule = {
  extractRawText: (input: { arrayBuffer: ArrayBuffer }) => Promise<{ value: string }>;
};

async function parseDocxFile(file: File): Promise<{ pages: ParsedPage[]; blockCount: number }> {
  const mod = (await import("mammoth/mammoth.browser.min.js")) as unknown as {
    default?: MammothBrowserModule;
  } & MammothBrowserModule;
  const mammoth: MammothBrowserModule = mod.default ?? mod;
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  const fullText = cleanExtractedText(result.value || "");

  const pages: ParsedPage[] = [];
  if (fullText) {
    const paragraphs = fullText.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
    let blockStart = 1;
    let bufferText = "";
    let bufferedParagraphs = 0;
    for (const paragraph of paragraphs) {
      if (bufferText.length + paragraph.length > DOCX_BLOCK_CHARS && bufferText) {
        const blockEnd = blockStart + bufferedParagraphs - 1;
        pages.push({
          locator:
            blockStart === blockEnd
              ? `Bloque de párrafos ${blockStart}`
              : `Bloque de párrafos ${blockStart}–${blockEnd}`,
          pageNumber: null,
          text: bufferText,
        });
        blockStart = blockEnd + 1;
        bufferText = "";
        bufferedParagraphs = 0;
      }
      bufferText += (bufferText ? "\n\n" : "") + paragraph;
      bufferedParagraphs++;
    }
    if (bufferText) {
      const blockEnd = blockStart + bufferedParagraphs - 1;
      pages.push({
        locator:
          blockStart === blockEnd
            ? `Bloque de párrafos ${blockStart}`
            : `Bloque de párrafos ${blockStart}–${blockEnd}`,
        pageNumber: null,
        text: bufferText,
      });
    }
  }
  return { pages, blockCount: pages.length };
}

/* -------------------------------------------------------------------------- */
/* Texto plano (.txt / .md / .json)                                            */
/* -------------------------------------------------------------------------- */

async function parseTextFile(file: File): Promise<{ pages: ParsedPage[]; blockCount: number }> {
  const fullText = cleanExtractedText(await file.text());
  const pages: ParsedPage[] = [];
  if (fullText) {
    const paragraphs = fullText.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
    let blockStart = 1;
    let bufferText = "";
    let bufferedParagraphs = 0;
    for (const paragraph of paragraphs) {
      if (bufferText.length + paragraph.length > TEXT_BLOCK_CHARS && bufferText) {
        const blockEnd = blockStart + bufferedParagraphs - 1;
        pages.push({
          locator:
            blockStart === blockEnd
              ? `Bloque de texto ${blockStart}`
              : `Bloque de texto ${blockStart}–${blockEnd}`,
          pageNumber: null,
          text: bufferText,
        });
        blockStart = blockEnd + 1;
        bufferText = "";
        bufferedParagraphs = 0;
      }
      bufferText += (bufferText ? "\n\n" : "") + paragraph;
      bufferedParagraphs++;
    }
    if (bufferText) {
      const blockEnd = blockStart + bufferedParagraphs - 1;
      pages.push({
        locator:
          blockStart === blockEnd
            ? `Bloque de texto ${blockStart}`
            : `Bloque de texto ${blockStart}–${blockEnd}`,
        pageNumber: null,
        text: bufferText,
      });
    }
  }
  return { pages, blockCount: pages.length };
}

/* -------------------------------------------------------------------------- */
/* Punto único de parseo                                                       */
/* -------------------------------------------------------------------------- */

function mimeOf(file: File): string {
  return (file as File & { type?: string }).type || "application/octet-stream";
}

export async function parseSingleFile(file: File): Promise<ParsedDocumentContent> {
  const lower = file.name.toLowerCase();
  let kind: ParsedKind;
  let pages: ParsedPage[] = [];
  let metaPages = "";

  if (lower.endsWith(".pdf")) {
    kind = "pdf";
    const result = await parsePdfFile(file);
    pages = result.pages;
    const totalLabel =
      result.pages.length < result.pageCount
        ? `${result.pages.length} de ${result.pageCount} páginas con texto`
        : `${result.pages.length} páginas con texto`;
    metaPages = result.pages.length === 0 ? "Sin texto extraíble" : totalLabel;
  } else if (lower.endsWith(".xlsx") || lower.endsWith(".xls")) {
    kind = "excel";
    const result = await parseSpreadsheetFile(file, "excel");
    pages = result.pages;
    metaPages =
      result.pages.length === 0
        ? "Sin celdas con datos"
        : `${result.sheetCount} ${result.sheetCount === 1 ? "hoja" : "hojas"} / ${result.rowCount.toLocaleString("es-PE")} filas`;
  } else if (lower.endsWith(".csv")) {
    kind = "excel";
    const result = await parseSpreadsheetFile(file, "csv");
    pages = result.pages;
    metaPages =
      result.pages.length === 0 ? "Sin filas de datos" : `${result.rowCount.toLocaleString("es-PE")} filas (CSV)`;
  } else if (lower.endsWith(".docx")) {
    kind = "docx";
    const result = await parseDocxFile(file);
    pages = result.pages;
    metaPages =
      result.pages.length === 0 ? "Sin párrafos extraíbles" : `${result.pages.length} bloques de párrafos`;
  } else if (lower.endsWith(".txt") || lower.endsWith(".md") || lower.endsWith(".json")) {
    kind = "text";
    const result = await parseTextFile(file);
    pages = result.pages;
    metaPages = result.pages.length === 0 ? "Sin bloques extraíbles" : `${result.pages.length} bloques de texto`;
  } else {
    throw new Error(`Formato no soportado: ${file.name}`);
  }

  const summarySeed = pages
    .slice(0, 2)
    .map((page) => page.text)
    .join(" ");
  const summary =
    summarySeed.length > 190 ? `${summarySeed.slice(0, 190).trim()}…` : summarySeed.trim();

  return {
    kind,
    sourceName: file.name,
    mimeType: mimeOf(file),
    pages,
    metaPages: metaPages || "Procesando…",
    summary: summary || `Documento cargado: ${file.name}`,
  };
}

/* -------------------------------------------------------------------------- */
/* Chunking semántico (600–1.000 caracteres, solapamiento 100)                  */
/* -------------------------------------------------------------------------- */

/** Empaqueta el texto de una página en bloques de lectura con solapamiento. */
function packPageText(raw: string): string[] {
  const text = raw.replace(/\n{3,}/g, "\n\n").trim();
  if (!text) return [];
  if (text.length <= CHUNK_MAX) return [text];

  const cutPoints = /\n{2,}|(?<=[.;:!?])\s+(?=[A-ZÁÉÍÓÚÑ(¿¡"«])/g;
  const out: string[] = [];
  let cursor = 0;

  const tailOverlap = (source: string): string => {
    if (source.length <= CHUNK_OVERLAP) return source;
    const cut = source.slice(-CHUNK_OVERLAP);
    const spaceIndex = cut.indexOf(" ");
    return spaceIndex > 0 ? cut.slice(spaceIndex + 1) : cut;
  };

  while (cursor < text.length) {
    let end = Math.min(text.length, cursor + CHUNK_TARGET);
    if (end < text.length) {
      const minEnd = Math.min(text.length, cursor + CHUNK_MIN);
      let cutPoint = -1;
      cutPoints.lastIndex = cursor + CHUNK_MIN;
      let match: RegExpExecArray | null = cutPoints.exec(text);
      while (match && match.index <= end) {
        cutPoint = match.index + match[0].length;
        match = cutPoints.exec(text);
      }
      if (cutPoint > minEnd && cutPoint <= CHUNK_MAX + cursor) {
        end = cutPoint;
      } else {
        const spaceCut = text.lastIndexOf(" ", end);
        if (spaceCut > cursor + CHUNK_MIN) end = spaceCut;
      }
      if (end <= cursor) end = Math.min(text.length, cursor + CHUNK_TARGET);
    }

    let piece = text.slice(cursor, end).trim();
    if (!piece) {
      cursor = end;
      while (cursor < text.length && /\s/.test(text.charAt(cursor))) cursor++;
      continue;
    }

    const overlapPart = out.length ? tailOverlap(out[out.length - 1]) : "";
    if (piece.length < CHUNK_MIN && out.length && overlapPart) {
      out[out.length - 1] = `${out[out.length - 1]} ${piece}`;
    } else {
      out.push(overlapPart ? `${overlapPart} … ${piece}` : piece);
    }

    cursor = end;
    while (cursor < text.length && /\s/.test(text.charAt(cursor))) cursor++;
  }
  return out;
}

/** Convierte el contenido parseado en fragmentos RAG con localizador real. */
export function chunkParsedContent(params: ChunkBuildParams): RagChunk[] {
  const { documentId, documentTitle, documentType, parsed, projectId } = params;
  const chunks: RagChunk[] = [];
  const now = Date.now();
  let index = 0;

  for (const page of parsed.pages) {
    const pieces = packPageText(page.text);
    if (pieces.length === 0) continue;
    const multiPart = pieces.length > 1;
    for (let i = 0; i < pieces.length; i++) {
      index++;
      chunks.push({
        id: `${documentId}-c${index}`,
        projectId,
        documentId,
        documentTitle,
        documentType,
        locatorLabel: multiPart ? `${page.locator} · parte ${i + 1}/${pieces.length}` : page.locator,
        pageNumber: page.pageNumber,
        content: pieces[i] ?? page.text,
        createdAt: now,
      });
    }
  }
  return chunks;
}

/** Construye "metaPages" y descripción corta de la carga provisional en la UI. */
export function provisionalDescriptionOf(file: File, isFolderContext: boolean): string {
  const base = "Extrayendo texto real del archivo en el navegador (páginas, filas y localizadores).";
  return isFolderContext ? `(${file.webkitRelativePath || file.name}) — ${base}` : base;
}
