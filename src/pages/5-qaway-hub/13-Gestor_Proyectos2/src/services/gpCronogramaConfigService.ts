/**
 * gpCronogramaConfigService.ts
 * ============================
 * Fuente única de verdad para los Parámetros del Cronograma (estándar PMBOK /
 * MS Project): calendario laboral, ponderación de avance para Curva S, umbrales
 * de alerta y gobernanza de Línea Base.
 */

export type SemanaLaboral = 'lun-vie' | 'lun-sab' | 'lun-dom' | 'personalizado';
export type MetodoPonderacion = 'duracion' | 'promedio';
export type FrecuenciaCorte = 'semanal' | 'quincenal' | 'mensual';
export type ModoSincronizacionCronograma = 'manual' | 'auto';

export interface ParametrosCronograma {
  semanaLaboral: SemanaLaboral;
  /** Días activos cuando semanaLaboral === 'personalizado' (0=Dom, 1=Lun ... 6=Sáb). */
  diasLaboralesCustom: number[];
  metodoPonderacion: MetodoPonderacion;
  frecuenciaCorte: FrecuenciaCorte;
  /** Días hábiles previos al vencimiento para marcar alerta "Por vencer". */
  diasAvisoPrevio: number;
  /** Días de desviación sobre Línea Base para marcar alerta crítica roja. */
  umbralDesvioCritico: number;
  /** Días hábiles de gracia tras la fecha programada de un hito antes de marcarlo vencido. */
  diasGraciaHito: number;
  /** Si es true, solo un rol admin puede restablecer la Línea Base oficial en el Gantt. */
  bloquearResetLineaBase: boolean;
  /** Días hábiles de adelanto (colchón interno) descontados sobre la fecha oficial/base. */
  diasColchonAdelanto: number;
  /** Si es true, oculta la fecha oficial (Línea Base) a usuarios no-admin para que solo vean la meta adelantada. */
  ocultarFechaOficialANoAdmin: boolean;
  /** Modo de guardado en Cronograma Maestro ('manual' con botón Guardar o 'auto' cada 2.5s). */
  modoSincronizacionCronograma: ModoSincronizacionCronograma;
}

export const DIAS_SEMANA_ORDEN: ReadonlyArray<{ dow: number; short: string; label: string }> = [
  { dow: 1, short: 'Lun', label: 'Lunes' },
  { dow: 2, short: 'Mar', label: 'Martes' },
  { dow: 3, short: 'Mié', label: 'Miércoles' },
  { dow: 4, short: 'Jue', label: 'Jueves' },
  { dow: 5, short: 'Vie', label: 'Viernes' },
  { dow: 6, short: 'Sáb', label: 'Sábado' },
  { dow: 0, short: 'Dom', label: 'Domingo' },
];

export const PARAMETROS_CRONOGRAMA_DEFAULT: ParametrosCronograma = {
  semanaLaboral: 'lun-vie',
  diasLaboralesCustom: [1, 2, 3, 4, 5],
  metodoPonderacion: 'duracion',
  frecuenciaCorte: 'semanal',
  diasAvisoPrevio: 5,
  umbralDesvioCritico: 3,
  diasGraciaHito: 0,
  bloquearResetLineaBase: false,
  diasColchonAdelanto: 0,
  ocultarFechaOficialANoAdmin: false,
  modoSincronizacionCronograma: 'manual',
};

const STORAGE_KEY = 'qaway-cronograma-params-v1';
export const EVENTO_PARAMS_CRONOGRAMA = 'qaway-cronograma-params-changed';

function sanitizeNumber(val: unknown, fallback: number, min: number, max: number): number {
  const n = Number(val);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, Math.round(n)));
}

function sanitizeCustomDays(val: unknown): number[] {
  if (!Array.isArray(val)) return [1, 2, 3, 4, 5];
  const valid = Array.from(new Set(val.map(Number).filter((d) => Number.isInteger(d) && d >= 0 && d <= 6)));
  return valid.length > 0 ? valid : [1, 2, 3, 4, 5];
}

export function getParametrosCronograma(): ParametrosCronograma {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const legacyTol = localStorage.getItem('qaway-tolerance-days-v1');
      if (legacyTol != null) {
        return {
          ...PARAMETROS_CRONOGRAMA_DEFAULT,
          diasAvisoPrevio: sanitizeNumber(legacyTol, 5, 0, 30),
        };
      }
      return { ...PARAMETROS_CRONOGRAMA_DEFAULT };
    }
    const parsed = JSON.parse(raw) as Partial<ParametrosCronograma>;
    const semana: SemanaLaboral =
      parsed.semanaLaboral === 'lun-sab' ||
      parsed.semanaLaboral === 'lun-dom' ||
      parsed.semanaLaboral === 'personalizado'
        ? parsed.semanaLaboral
        : 'lun-vie';
    return {
      semanaLaboral: semana,
      diasLaboralesCustom: sanitizeCustomDays(parsed.diasLaboralesCustom),
      metodoPonderacion: parsed.metodoPonderacion === 'promedio' ? 'promedio' : 'duracion',
      frecuenciaCorte:
        parsed.frecuenciaCorte === 'quincenal' || parsed.frecuenciaCorte === 'mensual'
          ? parsed.frecuenciaCorte
          : 'semanal',
      diasAvisoPrevio: sanitizeNumber(parsed.diasAvisoPrevio, 5, 0, 30),
      umbralDesvioCritico: sanitizeNumber(parsed.umbralDesvioCritico, 3, 0, 60),
      diasGraciaHito: sanitizeNumber(parsed.diasGraciaHito, 0, 0, 15),
      bloquearResetLineaBase: Boolean(parsed.bloquearResetLineaBase),
      diasColchonAdelanto: sanitizeNumber(parsed.diasColchonAdelanto, 0, 0, 30),
      ocultarFechaOficialANoAdmin: Boolean(parsed.ocultarFechaOficialANoAdmin),
      modoSincronizacionCronograma: parsed.modoSincronizacionCronograma === 'auto' ? 'auto' : 'manual',
    };
  } catch {
    return { ...PARAMETROS_CRONOGRAMA_DEFAULT };
  }
}

export function saveParametrosCronograma(params: ParametrosCronograma): void {
  const limpio: ParametrosCronograma = {
    semanaLaboral: params.semanaLaboral,
    diasLaboralesCustom: sanitizeCustomDays(params.diasLaboralesCustom),
    metodoPonderacion: params.metodoPonderacion,
    frecuenciaCorte: params.frecuenciaCorte,
    diasAvisoPrevio: sanitizeNumber(params.diasAvisoPrevio, 5, 0, 30),
    umbralDesvioCritico: sanitizeNumber(params.umbralDesvioCritico, 3, 0, 60),
    diasGraciaHito: sanitizeNumber(params.diasGraciaHito, 0, 0, 15),
    bloquearResetLineaBase: Boolean(params.bloquearResetLineaBase),
    diasColchonAdelanto: sanitizeNumber(params.diasColchonAdelanto, 0, 0, 30),
    ocultarFechaOficialANoAdmin: Boolean(params.ocultarFechaOficialANoAdmin),
    modoSincronizacionCronograma: params.modoSincronizacionCronograma === 'auto' ? 'auto' : 'manual',
  };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(limpio));
    localStorage.setItem('qaway-tolerance-days-v1', String(limpio.diasAvisoPrevio));
  } catch {
    /* ignore storage quota errors */
  }
  window.dispatchEvent(new CustomEvent(EVENTO_PARAMS_CRONOGRAMA, { detail: limpio }));
}

export function isDowLaboral(
  dow: number,
  semana: SemanaLaboral,
  customDays?: number[],
): boolean {
  if (semana === 'lun-dom') return true;
  if (semana === 'lun-sab') return dow !== 0;
  if (semana === 'personalizado') {
    const set = customDays && customDays.length > 0 ? customDays : [1, 2, 3, 4, 5];
    return set.includes(dow);
  }
  return dow !== 0 && dow !== 6;
}

export function isDiaLaboral(
  date: Date,
  semana: SemanaLaboral,
  customDays?: number[],
): boolean {
  return isDowLaboral(date.getDay(), semana, customDays);
}

/**
 * Cuenta los días hábiles inclusivos entre `startIso` y `endIso` (YYYY-MM-DD)
 * según la semana laboral configurada. Mínimo 1 para actividades válidas.
 */
export function countWorkingDays(
  startIso: string,
  endIso: string,
  semana: SemanaLaboral = 'lun-vie',
  customDays?: number[],
): number {
  if (!startIso || !endIso) return 1;
  const start = new Date(`${startIso.slice(0, 10)}T12:00:00`);
  const end = new Date(`${endIso.slice(0, 10)}T12:00:00`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 1;
  if (end < start) return 1;
  const days = customDays ?? (semana === 'personalizado' ? getParametrosCronograma().diasLaboralesCustom : undefined);
  let count = 0;
  const cur = new Date(start);
  let guard = 0;
  while (cur <= end && guard < 4000) {
    if (isDiaLaboral(cur, semana, days)) count += 1;
    cur.setDate(cur.getDate() + 1);
    guard += 1;
  }
  return Math.max(1, count);
}

/**
 * Diferencia en días hábiles con signo entre `aIso` y `bIso` (positivo si b > a).
 */
export function workingDaysBetween(
  aIso: string,
  bIso: string,
  semana: SemanaLaboral = 'lun-vie',
  customDays?: number[],
): number {
  if (!aIso || !bIso) return 0;
  const a = aIso.slice(0, 10);
  const b = bIso.slice(0, 10);
  if (a === b) return 0;
  const sign = b > a ? 1 : -1;
  const from = new Date(`${(sign > 0 ? a : b)}T12:00:00`);
  const to = new Date(`${(sign > 0 ? b : a)}T12:00:00`);
  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) return 0;
  const days = customDays ?? (semana === 'personalizado' ? getParametrosCronograma().diasLaboralesCustom : undefined);
  let count = 0;
  const cur = new Date(from);
  cur.setDate(cur.getDate() + 1);
  let guard = 0;
  while (cur <= to && guard < 4000) {
    if (isDiaLaboral(cur, semana, days)) count += 1;
    cur.setDate(cur.getDate() + 1);
    guard += 1;
  }
  return sign * count;
}

/**
 * Retrocede `workingDays` días hábiles desde `endIso` (YYYY-MM-DD) respetando
 * la semana laboral configurada (incluidos días hábiles personalizados).
 */
export function subtractWorkingDays(
  endIso: string,
  workingDays: number,
  semana: SemanaLaboral = 'lun-vie',
  customDays?: number[],
): string {
  if (!endIso || workingDays <= 0) return endIso ? endIso.slice(0, 10) : '';
  const cur = new Date(`${endIso.slice(0, 10)}T12:00:00`);
  if (Number.isNaN(cur.getTime())) return endIso.slice(0, 10);
  const days = customDays ?? (semana === 'personalizado' ? getParametrosCronograma().diasLaboralesCustom : undefined);
  let remaining = Math.round(workingDays);
  let guard = 0;
  while (remaining > 0 && guard < 4000) {
    cur.setDate(cur.getDate() - 1);
    if (isDiaLaboral(cur, semana, days)) {
      remaining -= 1;
    }
    guard += 1;
  }
  const y = cur.getFullYear();
  const m = String(cur.getMonth() + 1).padStart(2, '0');
  const d = String(cur.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export interface AlertaColchonPaquete {
  id: string;
  code: string;
  name: string;
  plazoHabil: number;
  diasRestantes: number;
}

export interface ResultadoColchonAdelanto<T> {
  items: T[];
  aplicados: number;
  alertas: AlertaColchonPaquete[];
}

export interface SnapshotColchonAlertas {
  projectId: string;
  diasColchon: number;
  aplicados: number;
  resumen: string;
  alertas: AlertaColchonPaquete[];
  updatedAt: string;
}

export const EVENTO_ALERTAS_COLCHON = 'qaway-colchon-alertas-changed';
const ALERTAS_STORAGE_PREFIX = 'qaway-colchon-alertas-v1-';

export function getSnapshotAlertasColchon(projectId?: string | null): SnapshotColchonAlertas | null {
  if (!projectId) return null;
  try {
    const raw = localStorage.getItem(`${ALERTAS_STORAGE_PREFIX}${projectId}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SnapshotColchonAlertas;
    if (!parsed || parsed.projectId !== projectId || !Array.isArray(parsed.alertas)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveSnapshotAlertasColchon(
  projectId: string | null | undefined,
  snapshot: SnapshotColchonAlertas | null,
): void {
  if (!projectId) return;
  try {
    if (!snapshot) {
      localStorage.removeItem(`${ALERTAS_STORAGE_PREFIX}${projectId}`);
    } else {
      localStorage.setItem(`${ALERTAS_STORAGE_PREFIX}${projectId}`, JSON.stringify(snapshot));
    }
  } catch {
    /* ignore storage quota errors */
  }
  window.dispatchEvent(new CustomEvent(EVENTO_ALERTAS_COLCHON, { detail: { projectId, snapshot } }));
}

/**
 * Reconcilia la fotografía de alertas contra los ítems vivos del Gantt (0 consultas a BD).
 * Si un paquete fue completado, eliminado, recibió metaInternaEnd manual o amplió su plazo,
 * se retira automáticamente de la lista de alertas.
 */
export function reconciliarAlertasColchonConItems<
  T extends {
    id: string;
    code: string;
    name: string;
    start: string;
    end: string;
    progress?: number;
    status?: string;
    baselineEnd?: string;
    metaInternaEnd?: string;
  },
>(
  projectId: string,
  items: T[],
  params: Pick<ParametrosCronograma, 'semanaLaboral' | 'diasLaboralesCustom'>,
  minDiasRestantes = 2,
): void {
  const snap = getSnapshotAlertasColchon(projectId);
  if (!snap || snap.alertas.length === 0) return;

  const byId = new Map(items.map((it) => [it.id, it]));
  const pendientes: AlertaColchonPaquete[] = [];
  for (const al of snap.alertas) {
    const it = byId.get(al.id);
    if (!it) continue;
    if (it.status === 'Completado' || it.status === 'Cumple' || (it.progress ?? 0) >= 100) continue;
    if (it.metaInternaEnd) continue;
    const fechaOficial = (it.baselineEnd || it.end || '').slice(0, 10);
    if (!it.start || !fechaOficial) continue;
    const plazoHabil = countWorkingDays(it.start, fechaOficial, params.semanaLaboral, params.diasLaboralesCustom);
    const diasRestantes = plazoHabil - snap.diasColchon;
    if (diasRestantes < minDiasRestantes) {
      pendientes.push({ id: it.id, code: it.code, name: it.name, plazoHabil, diasRestantes });
    }
  }

  const unchanged =
    pendientes.length === snap.alertas.length &&
    pendientes.every((p, i) => p.id === snap.alertas[i].id && p.diasRestantes === snap.alertas[i].diasRestantes);
  if (unchanged) return;

  const nextResumen =
    pendientes.length > 0
      ? `Meta interna (-${snap.diasColchon} día(s) hábil(es)) aplicada a ${snap.aplicados} paquete(s). ${pendientes.length} paquete(s) pendiente(s) de ajuste manual.`
      : `Meta interna (-${snap.diasColchon} día(s) hábil(es)): todos los paquetes en alerta fueron resueltos.`;

  saveSnapshotAlertasColchon(projectId, {
    ...snap,
    resumen: nextResumen,
    alertas: pendientes,
    updatedAt: new Date().toISOString(),
  });
}

/**
 * Aplica un descuento de `diasColchon` días hábiles sobre la fecha oficial (`baselineEnd || end`)
 * de cada paquete de trabajo. Si el paquete quedaría con menos de `minDiasRestantes` (por defecto 2),
 * NO se le aplica el descuento automáticamente y se reporta en `alertas` para ajuste manual.
 */
export function aplicarColchonAdelantoItems<
  T extends {
    id: string;
    code: string;
    name: string;
    kind: string;
    start: string;
    end: string;
    progress?: number;
    status?: string;
    baselineStart?: string;
    baselineEnd?: string;
    metaInternaEnd?: string;
  },
>(
  items: T[],
  diasColchon: number,
  semana: SemanaLaboral = 'lun-vie',
  customDays?: number[],
  minDiasRestantes = 2,
): ResultadoColchonAdelanto<T> {
  if (diasColchon <= 0) {
    const cleaned = items.map((it) => {
      if (!it.metaInternaEnd) return it;
      const copy = { ...it };
      delete copy.metaInternaEnd;
      return copy;
    });
    return { items: cleaned, aplicados: 0, alertas: [] };
  }
  const alertas: AlertaColchonPaquete[] = [];
  let aplicados = 0;
  const nextItems = items.map((it) => {
    if (it.kind !== 'subproceso' || !it.start || (!it.end && !it.baselineEnd)) {
      return it;
    }
    if (it.status === 'Completado' || it.status === 'Cumple' || (it.progress ?? 0) >= 100) {
      return it;
    }
    // La fecha oficial intacta manda; si en una prueba previa se pisó `end` sin `metaInternaEnd`, se restaura desde `baselineEnd`.
    const fechaOficial = (it.baselineEnd || it.end).slice(0, 10);
    const endOficial = !it.metaInternaEnd && it.baselineEnd && it.end < it.baselineEnd ? it.baselineEnd.slice(0, 10) : it.end;
    const plazoHabil = countWorkingDays(it.start, fechaOficial, semana, customDays);
    const diasRestantes = plazoHabil - diasColchon;
    if (diasRestantes < minDiasRestantes) {
      alertas.push({
        id: it.id,
        code: it.code,
        name: it.name,
        plazoHabil,
        diasRestantes,
      });
      return endOficial !== it.end ? { ...it, end: endOficial } : it;
    }
    const nuevaMetaInterna = subtractWorkingDays(fechaOficial, diasColchon, semana, customDays);
    aplicados += 1;
    return {
      ...it,
      end: endOficial,
      metaInternaEnd: nuevaMetaInterna,
    };
  });
  return { items: nextItems, aplicados, alertas };
}
