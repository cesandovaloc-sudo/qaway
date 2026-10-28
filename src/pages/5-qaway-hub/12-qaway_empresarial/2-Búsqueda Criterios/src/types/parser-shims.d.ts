/**
 * Shims de tipos para módulos vendidos cuya API necesita declaración local.
 * - '*?url': imports de assets de Vite (worker de pdfjs-dist).
 * - 'mammoth/mammoth.browser.min.js': compilación de navegador de mammoth.
 */

declare module "*?url" {
  const url: string;
  export default url;
}

declare module "mammoth/mammoth.browser.min.js" {
  export interface MammothExtractResult {
    value: string;
    messages: Array<{ type: string; message: string }>;
  }
  export interface MammothBrowserModule {
    extractRawText: (input: { arrayBuffer: ArrayBuffer }) => Promise<MammothExtractResult>;
    convertToHtml: (input: { arrayBuffer: ArrayBuffer }) => Promise<MammothExtractResult>;
  }
  const mammothBrowser: MammothBrowserModule;
  export default mammothBrowser;
}

/** Bundle UMD de tesseract.js incluido en node_modules — fallback de carga OCR
 * cuando la resolución ESM del paquete no está disponible en el empaquetador. */
declare module "tesseract.js/dist/tesseract.min.js" {
  export const createWorker: any;
  export default undefined;
}
