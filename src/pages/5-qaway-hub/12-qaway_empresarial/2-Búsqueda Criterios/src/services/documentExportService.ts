/**
 * ============================================================================
 * SERVICIO DE EXPORTACIÓN: TEXTO OCR / DOCUMENTO EDITABLE (.txt y .docx)
 * Módulo: Búsqueda de Criterios (Qaway Lab & MINEDU)
 *
 * Descarga limpia para Microsoft Word, 100% en cliente (sin backend):
 * - .txt: UTF-8 con encabezado de referencia institucional.
 * - .docx: documento Word real (paquete `docx` cargado en diferido).
 * - Nomenclatura: <Título>_<Localizador> — ej. RM_0401-2008-ED_Pagina_12_OCR.txt
 * - La unión de fragmentos deduplica el solapamiento del chunking (≤150 car.)
 *   para que el texto exportado lea continuo, como el documento original.
 * ============================================================================
 */

export interface ExportableChunk {
  id?: string;
  content: string;
  locatorLabel: string;
  pageNumber?: number | null;
}

export interface SourceExportInput {
  documentTitle: string;
  chunks: ExportableChunk[];
  /** "ocr" = transcripción Tesseract; "digital" = texto nativo del archivo. */
  origin?: "ocr" | "digital";
}

const HEADER_RULE = "────────────────────────────────────────────";
const MAX_OVERLAP_CHARS = 150;

function stripAccents(text: string): string {
  return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

/** "RM 0401-2008-ED «Banco del Libro».pdf" → "RM_0401-2008-ED_Banco_del_Libro" */
function titleToSegment(title: string): string {
  const cleaned = stripAccents(title)
    .replace(/\.(pdf|xlsx?|csv|docx?|txt|md|json)$/i, "")
    .replace(/[^\w-]+/g, "_")
    .replace(/_{2,}/g, "_")
    .replace(/^[_-]+|[_-]+$/g, "");
  return cleaned || "Documento";
}

/** "Página 12 (OCR)" → "Pagina_12_OCR" · "Hoja Resumen · Fila 14" → "Hoja_Resumen_Fila_14" */
function locatorToSegment(locatorLabel: string): string {
  const cleaned = stripAccents(locatorLabel)
    .replace(/[()]/g, " ")
    .replace(/[^\w-]+/g, "_")
    .replace(/_{2,}/g, "_")
    .replace(/^[_-]+|[_-]+$/g, "");
  return cleaned || "Fragmento";
}

function buildFileName(input: SourceExportInput, scopeLabel?: string): string {
  const parts = [titleToSegment(input.documentTitle)];
  const scope = scopeLabel && scopeLabel.trim() && scopeLabel !== "Documento completo" ? scopeLabel : "";
  if (scope) parts.push(locatorToSegment(scope));
  return parts.join("_");
}

/** Encabezado de referencia institucional compartido por .txt y .docx. */
function buildHeaderLines(input: SourceExportInput, scopeLabel: string): string[] {
  const fecha = new Date().toLocaleDateString("es-PE", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  return [
    "QAWAY LAB & MINEDU — Búsqueda de Criterios (RAG Engine)",
    `Documento: ${input.documentTitle}`,
    `Referencia: ${scopeLabel}`,
    `Transcripción: ${
      input.origin === "ocr"
        ? "OCR en navegador (Tesseract)"
        : "Texto digital nativo del archivo"
    }`,
    `Generado: ${fecha} · Extracción e indexación 100% en cliente`,
  ];
}

/** Une fragmentos consecutivos deduplicando el solapamiento del chunking. */
export function stitchChunkTexts(chunks: ExportableChunk[]): string {
  let text = "";
  for (const chunk of chunks) {
    const piece = (chunk.content ?? "").replace(/\u0000/g, "").trim();
    if (!piece) continue;
    if (!text) {
      text = piece;
      continue;
    }
    const maxOverlap = Math.min(
      MAX_OVERLAP_CHARS,
      Math.floor(text.length / 3),
      piece.length
    );
    let shared = 0;
    for (let len = maxOverlap; len >= 12; len--) {
      if (piece.slice(0, len).toLowerCase() === text.slice(-len).toLowerCase()) {
        shared = len;
        break;
      }
    }
    text += shared > 0 ? piece.slice(shared) : `\n\n${piece}`;
  }
  return text.trim() || "(Sin texto exportable)";
}

/** Fragmentos de la MISMA página que el chunk indicado ("descargar página actual"). */
export function selectPageChunks(
  chunks: ExportableChunk[],
  target: ExportableChunk
): ExportableChunk[] {
  const page = typeof target.pageNumber === "number" ? target.pageNumber : null;
  const samePage =
    page !== null
      ? chunks.filter((chunk) => chunk.pageNumber === page)
      : chunks.filter((chunk) => chunk.locatorLabel === target.locatorLabel);
  return samePage.length > 0 ? samePage : [target];
}

function triggerFileDownload(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

/** Descarga .txt con encabezado institucional. */
export function downloadSourceAsTxt(
  input: SourceExportInput,
  scope?: { label: string; text: string }
): void {
  const label = scope?.label ?? "Documento completo";
  const body = scope?.text ?? stitchChunkTexts(input.chunks);
  const content = `${buildHeaderLines(input, label).join("\n")}\n${HEADER_RULE}\n\n${body}\n`;
  triggerFileDownload(
    new Blob([content], { type: "text/plain;charset=utf-8" }),
    `${buildFileName(input, label)}.txt`
  );
}

/** Descarga .docx real de Word (paquete `docx`, generación en cliente). */
export async function downloadSourceAsDocx(
  input: SourceExportInput,
  scope?: { label: string; text: string }
): Promise<void> {
  const mod: any = await import("docx");
  const lib = mod?.default ?? mod;
  const { Document, Packer, Paragraph, TextRun, AlignmentType } = lib ?? {};
  if (!Document || !Packer || !Paragraph || !TextRun) {
    throw new Error("Paquete docx no disponible");
  }

  const label = scope?.label ?? "Documento completo";
  const body = scope?.text ?? stitchChunkTexts(input.chunks);
  const headerLines = buildHeaderLines(input, label);

  const children: any[] = [];
  headerLines.forEach((line, index) => {
    children.push(
      new Paragraph({
        spacing: { after: index === headerLines.length - 1 ? 240 : 40 },
        children: [
          new TextRun({
            text: line,
            bold: index === 0,
            size: index === 0 ? 26 : 20,
            color: index === 0 ? "111827" : "4B5563",
            font: "Calibri",
          }),
        ],
      })
    );
  });

  // Cuerpo: un párrafo por línea; bloques separados por un espaciador
  const blocks = body.split(/\n{2,}/);
  blocks.forEach((block, blockIndex) => {
    if (blockIndex > 0) {
      children.push(new Paragraph({ spacing: { after: 120 }, children: [] }));
    }
    for (const line of block.split("\n")) {
      const clean = line.trim();
      if (!clean) continue;
      children.push(
        new Paragraph({
          alignment: AlignmentType.LEFT,
          spacing: { after: 60, line: 300 },
          children: [
            new TextRun({ text: clean, size: 22, color: "1F2937", font: "Calibri" }),
          ],
        })
      );
    }
  });

  const doc = new Document({
    creator: "Qaway Lab — Búsqueda de Criterios (RAG Engine)",
    title: input.documentTitle,
    description: "Exportación de texto indexado para edición en Word",
    sections: [{ children }],
  });

  const blob = await Packer.toBlob(doc);
  triggerFileDownload(blob, `${buildFileName(input, label)}.docx`);
}
