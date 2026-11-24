/**
 * imageOptimization.js — Núcleo de optimización de imágenes del Hub.
 * ==================================================================
 * Framework compartido ubicado en `5-qaway-hub/14-Librerías/services/`.
 * Sigue las reglas de esa carpeta (Documentación/8-funcionalidades-framework.md:7-18):
 * contrato técnico + helper puro, SIN UI, SIN reglas de negocio y SIN
 * dependencias pesadas. No importa Supabase: cada app decide bucket y ruta.
 *
 * Anti-copias que evita:
 *  · HubPanelPage.jsx:203 optimizeAvatar  → recorte cuadrado 512, local.
 *  · imagenToWebp.js:10 convertirAWebp    → sin recorte, maxEdge.
 *  · blog-editor/storageService.ts:15     → fallaba devolviendo el original.
 *  · PerfilTab.tsx:15 comprimirAvatar     → JPEG base64 guardado como texto.
 *
 * Contrato:
 *   esImagenPermitida(file)                       → boolean
 *   nombreWebp(fileName)                          → string
 *   optimizarImagen(file, opciones)               → Promise<ImagenOptimizada>
 *   optimizarAvatar(file, opciones)               → Promise<ImagenOptimizada>
 *   optimizarProducto(file, opciones)             → Promise<ImagenOptimizada>
 *   optimizarEvidencia(file, opciones)            → Promise<ImagenOptimizada>
 *
 * ImagenOptimizada = {
 *   blob: Blob,          // WebP listo para supabase.storage.from(...).upload
 *   fileName: string,    // mismo nombre con extensión .webp
 *   width: number,       // ancho final
 *   height: number,      // alto final
 *   bytes: number,       // tamaño final
 *   originalBytes: number,
 *   mode: 'avatar' | 'general',
 * }
 *
 * Regla de oro: si la conversión falla, LANZA error. Nunca devuelve el archivo
 * original: subir un PNG de 12 MB "porque falló WebP" era el defecto de
 * storageService.ts:50,57,60,64.
 */

const MIME_PERMITIDOS = ['image/png', 'image/jpeg', 'image/webp'];
const EXTENSION_PERMITIDA = /\.(png|jpe?g|webp)$/i;
const MAX_INPUT_BYTES = 15 * 1024 * 1024;

/** Presets declarativos. `avatar` recorta; `product`/`evidence` conservan proporción. */
export const IMAGE_PRESETS = Object.freeze({
  avatar: Object.freeze({ mode: 'avatar', maxEdge: 512, quality: 0.85 }),
  product: Object.freeze({ mode: 'general', maxEdge: 1200, quality: 0.85 }),
  evidence: Object.freeze({ mode: 'general', maxEdge: 1440, quality: 0.9 }),
});

/** PNG/JPG/WebP por MIME o por extensión (algunos navegadores no reportan MIME). */
export function esImagenPermitida(file) {
  if (!file || typeof file !== 'object') return false;
  const mime = typeof file.type === 'string' ? file.type.toLowerCase() : '';
  const nombre = typeof file.name === 'string' ? file.name : '';
  return MIME_PERMITIDOS.includes(mime) || EXTENSION_PERMITIDA.test(nombre);
}

/** Nombre de salida estable: "Foto.PNG" → "Foto.webp". */
export function nombreWebp(fileName) {
  const base = String(fileName || 'imagen').replace(/\.[^.]+$/, '').trim();
  return `${base || 'imagen'}.webp`;
}

function leerDataUrl(file) {
  return new Promise((resolve, reject) => {
    try {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ''));
      reader.onerror = () => reject(new Error('No se pudo leer la imagen.'));
      reader.readAsDataURL(file);
    } catch {
      reject(new Error('No se pudo leer la imagen.'));
    }
  });
}

function cargarImagen(dataUrl) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('El archivo no es una imagen válida.'));
    img.src = dataUrl;
  });
}

function aBlobWebp(canvas, quality) {
  return new Promise((resolve, reject) => {
    if (typeof canvas.toBlob !== 'function') {
      reject(new Error('Este navegador no puede generar WebP.'));
      return;
    }
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('No se pudo generar la imagen WebP.'))),
      'image/webp',
      quality
    );
  });
}

/**
 * Calcula recorte y destino. NUNCA amplía una imagen pequeña: evita el difuminado
 * y el peso innecesario de optimizeAvatar, que siempre forzaba 512 px.
 */
export function calcularDestino(ancho, alto, { mode = 'general', maxEdge = 1200 } = {}) {
  const w = Number(ancho) || 0;
  const h = Number(alto) || 0;
  if (w <= 0 || h <= 0) throw new Error('La imagen no tiene dimensiones válidas.');

  const limite = Number(maxEdge) > 0 ? Math.floor(Number(maxEdge)) : 1200;

  if (mode === 'avatar') {
    const ladoOrigen = Math.min(w, h);
    const destino = Math.min(ladoOrigen, limite);
    return {
      mode: 'avatar',
      sx: Math.floor((w - ladoOrigen) / 2),
      sy: Math.floor((h - ladoOrigen) / 2),
      ladoOrigen,
      width: destino,
      height: destino,
    };
  }

  const escala = Math.min(1, limite / Math.max(w, h));
  return {
    mode: 'general',
    sx: 0,
    sy: 0,
    ladoOrigen: 0,
    width: Math.max(1, Math.round(w * escala)),
    height: Math.max(1, Math.round(h * escala)),
  };
}

/**
 * Convierte un File a WebP.
 * Opciones: `preset` ('avatar'|'product'|'evidence'), `mode`, `maxEdge`, `quality`.
 */
export async function optimizarImagen(file, opciones = {}) {
  if (!esImagenPermitida(file)) {
    throw new Error('Formato no permitido. Usa PNG, JPG o WebP.');
  }
  if ((Number(file?.size) || 0) > MAX_INPUT_BYTES) {
    throw new Error('La imagen supera el tamaño máximo permitido (15 MB).');
  }

  const preset = IMAGE_PRESETS[opciones?.preset] || IMAGE_PRESETS.product;
  const mode = opciones?.mode === 'avatar' || opciones?.mode === 'general'
    ? opciones.mode
    : preset.mode;
  const maxEdge = Number.isFinite(opciones?.maxEdge) && opciones.maxEdge > 0
    ? Math.floor(opciones.maxEdge)
    : preset.maxEdge;
  const quality = Number.isFinite(opciones?.quality) && opciones.quality > 0 && opciones.quality <= 1
    ? opciones.quality
    : preset.quality;

  const dataUrl = await leerDataUrl(file);
  const img = await cargarImagen(dataUrl);
  const origenW = img.naturalWidth || img.width;
  const origenH = img.naturalHeight || img.height;
  const destino = calcularDestino(origenW, origenH, { mode, maxEdge });

  const mime = typeof file.type === 'string' ? file.type.toLowerCase() : '';
  const nombre = typeof file.name === 'string' ? file.name.toLowerCase() : '';
  const esWebp = mime === 'image/webp' || /\.webp$/i.test(nombre);
  const sinCambios =
    destino.width === origenW &&
    destino.height === origenH &&
    (destino.mode !== 'avatar' || (destino.sx === 0 && destino.sy === 0 && destino.ladoOrigen === origenW && origenW === origenH));

  if (esWebp && sinCambios) {
    return {
      blob: file,
      fileName: nombreWebp(file.name),
      width: destino.width,
      height: destino.height,
      bytes: Number(file.size) || 0,
      originalBytes: Number(file.size) || 0,
      mode: destino.mode,
    };
  }

  const canvas = document.createElement('canvas');
  canvas.width = destino.width;
  canvas.height = destino.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('No se pudo procesar la imagen en este navegador.');
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  if (destino.mode === 'avatar') {
    ctx.drawImage(
      img,
      destino.sx, destino.sy, destino.ladoOrigen, destino.ladoOrigen,
      0, 0, destino.width, destino.height
    );
  } else {
    ctx.drawImage(img, 0, 0, destino.width, destino.height);
  }

  const blob = await aBlobWebp(canvas, quality);

  return {
    blob,
    fileName: nombreWebp(file.name),
    width: destino.width,
    height: destino.height,
    bytes: blob.size,
    originalBytes: Number(file.size) || 0,
    mode: destino.mode,
  };
}

/** Perfil: recorte cuadrado centrado, máximo 512 px, WebP 0.85. */
export function optimizarAvatar(file, opciones = {}) {
  return optimizarImagen(file, { ...opciones, preset: 'avatar', mode: 'avatar' });
}

/** Productos: sin recorte, máximo 1200 px, WebP 0.85. */
export function optimizarProducto(file, opciones = {}) {
  return optimizarImagen(file, { ...opciones, preset: 'product', mode: 'general' });
}

/**
 * Evidencias: sin recorte, máximo 1440 px, WebP 0.9.
 * Nota: canvas elimina EXIF. Para evidencia legal, conservar también el original.
 */
export function optimizarEvidencia(file, opciones = {}) {
  return optimizarImagen(file, { ...opciones, preset: 'evidence', mode: 'general' });
}
