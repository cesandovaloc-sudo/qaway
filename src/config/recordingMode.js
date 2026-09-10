import { useEffect, useState } from 'react';

/**
 * MODO GRABACIÓN — interruptor reversible, NO elimina nada.
 *
 * Sirve para grabar demos/videos limpios de los proyectos (Panadería Josué,
 * Vallet —incluidas sus páginas hijas— y Auréa Skincare) ocultando
 * temporalmente el "chrome" de Qaway Lab:
 *
 *   1. La barra flotante inferior del estudio: botón "Volver a Proyectos",
 *      texto, copyright y CTA "Conversemos".
 *      -> src/components/studio/StudioFloatingDock.jsx
 *   2. La barra superior "← Volver a Proyectos" del variant 'project-dock'.
 *      -> src/components/layout/Navbar.jsx
 *   3. Los enlaces "Volver a..." de las páginas hijas de Vallet.
 *      -> ValletCatalogPage.jsx / ValletPropertyDetailPage.jsx
 *
 * Uso (solo añade el parámetro a la URL del proyecto):
 *   /proyectos/panaderia-josue?grabacion=1        -> oculta TODO el chrome de Qaway
 *   /proyectos/panaderia-josue?grabacion=volver   -> oculta solo los retrocesos,
 *                                                    deja el CTA "Conversemos" visible
 *   /proyectos/panaderia-josue?grabacion=0        -> desactiva y restaura todo
 *
 * El modo elegido se recuerda en sessionStorage, así que sigue activo mientras
 * navegas entre secciones durante la grabación y se limpia solo al cerrar la pestaña.
 *
 * Para grabar sin tocar la URL, pon RECORDING_MODE_DEFAULT = true (y vuelve a false al terminar).
 */

const STORAGE_KEY = 'qw-recording-mode';
const PARAM_KEY = 'grabacion';

/** Interruptor duro: true = modo grabación siempre activo (nivel 'dock'). */
export const RECORDING_MODE_DEFAULT = false;

const OFF_VALUES = new Set(['0', 'off', 'no', 'false', 'ocultar-nada']);
const BACK_ONLY_VALUES = new Set(['volver', 'back', 'boton', 'botón', 'retroceder']);

const OFF = { level: 'off', hideDock: false, hideBackLinks: false };

function readParam() {
  if (typeof window === 'undefined') return null;
  try {
    return new URLSearchParams(window.location.search).get(PARAM_KEY);
  } catch {
    return null;
  }
}

function readStored() {
  if (typeof window === 'undefined') return null;
  try {
    return window.sessionStorage.getItem(STORAGE_KEY);
  } catch {
    return null; // navegación privada / storage bloqueado
  }
}

function writeStored(level) {
  if (typeof window === 'undefined') return;
  try {
    if (level === 'off') window.sessionStorage.removeItem(STORAGE_KEY);
    else window.sessionStorage.setItem(STORAGE_KEY, level);
  } catch {
    /* storage bloqueado: el modo sigue funcionando vía URL */
  }
}

/** Resuelve el nivel activo: 'off' | 'back' | 'dock'. */
export function resolveRecordingLevel() {
  if (RECORDING_MODE_DEFAULT) return 'dock';

  const raw = readParam();

  if (raw === null) {
    // Sin parámetro en la URL: mantener el modo ya elegido en esta pestaña.
    const stored = readStored();
    return stored === 'dock' || stored === 'back' ? stored : 'off';
  }

  const value = String(raw).trim().toLowerCase();

  if (OFF_VALUES.has(value)) {
    writeStored('off');
    return 'off';
  }

  const level = BACK_ONLY_VALUES.has(value) ? 'back' : 'dock';
  writeStored(level);
  return level;
}

/**
 * Hook de Modo Grabación.
 *
 * - hideDock      -> oculta la barra flotante inferior completa.
 * - hideBackLinks -> oculta TODOS los retrocesos de Qaway: el botón del dock,
 *                    la barra superior 'project-dock' y los enlaces "Volver a..."
 *                    de las páginas hijas de Vallet.
 *
 * @returns {{ level: string, isRecording: boolean, hideDock: boolean, hideBackLinks: boolean }}
 */
export function useRecordingMode() {
  const [level, setLevel] = useState(() => resolveRecordingLevel());

  useEffect(() => {
    const sync = () => setLevel(resolveRecordingLevel());
    window.addEventListener('popstate', sync);
    return () => window.removeEventListener('popstate', sync);
  }, []);

  if (level === 'dock') {
    return { level, isRecording: true, hideDock: true, hideBackLinks: true };
  }
  if (level === 'back') {
    return { level, isRecording: true, hideDock: false, hideBackLinks: true };
  }
  return { ...OFF, isRecording: false };
}
