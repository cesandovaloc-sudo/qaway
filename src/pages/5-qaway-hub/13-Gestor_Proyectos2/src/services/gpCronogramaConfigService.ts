/**
 * gpCronogramaConfigService.ts
 * ============================
 * Fuente única de verdad para los Parámetros del Cronograma (estándar PMBOK /
 * MS Project): calendario laboral, ponderación de avance para Curva S, umbrales
 * de alerta y gobernanza de Línea Base.
 */

export type SemanaLaboral = 'lun-vie' | 'lun-sab' | 'lun-dom';
export type MetodoPonderacion = 'duracion' | 'promedio';
export type FrecuenciaCorte = 'semanal' | 'quincenal' | 'mensual';

export interface ParametrosCronograma {
  semanaLaboral: SemanaLaboral;
  metodoPonderacion: MetodoPonderacion;
  frecuenciaCorte: FrecuenciaCorte;
  /** Días hábiles previos al vencimiento para marcar alerta "Por vencer". */
  diasAvisoPrevio: number;
  /** Días de desviación sobre Línea Base para marcar alerta crítica roja. */
  umbralDesvioCritico: number;
  /** Si es true, solo un rol admin puede restablecer la Línea Base oficial en el Gantt. */
  bloquearResetLineaBase: boolean;
}

export const PARAMETROS_CRONOGRAMA_DEFAULT: ParametrosCronograma = {
  semanaLaboral: 'lun-vie',
  metodoPonderacion: 'duracion',
  frecuenciaCorte: 'semanal',
  diasAvisoPrevio: 5,
  umbralDesvioCritico: 3,
  bloquearResetLineaBase: false,
};

const STORAGE_KEY = 'qaway-cronograma-params-v1';
export const EVENTO_PARAMS_CRONOGRAMA = 'qaway-cronograma-params-changed';

function sanitizeNumber(val: unknown, fallback: number, min: number, max: number): number {
  const n = Number(val);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, Math.round(n)));
}

export function getParametrosCronograma(): ParametrosCronograma {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // Compatibilidad con legado qaway-tolerance-days-v1
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
    return {
      semanaLaboral:
        parsed.semanaLaboral === 'lun-sab' || parsed.semanaLaboral === 'lun-dom'
          ? parsed.semanaLaboral
          : 'lun-vie',
      metodoPonderacion: parsed.metodoPonderacion === 'promedio' ? 'promedio' : 'duracion',
      frecuenciaCorte:
        parsed.frecuenciaCorte === 'quincenal' || parsed.frecuenciaCorte === 'mensual'
          ? parsed.frecuenciaCorte
          : 'semanal',
      diasAvisoPrevio: sanitizeNumber(parsed.diasAvisoPrevio, 5, 0, 30),
      umbralDesvioCritico: sanitizeNumber(parsed.umbralDesvioCritico, 3, 0, 60),
      bloquearResetLineaBase: Boolean(parsed.bloquearResetLineaBase),
    };
  } catch {
    return { ...PARAMETROS_CRONOGRAMA_DEFAULT };
  }
}

export function saveParametrosCronograma(params: ParametrosCronograma): void {
  const limpio: ParametrosCronograma = {
    semanaLaboral: params.semanaLaboral,
    metodoPonderacion: params.metodoPonderacion,
    frecuenciaCorte: params.frecuenciaCorte,
    diasAvisoPrevio: sanitizeNumber(params.diasAvisoPrevio, 5, 0, 30),
    umbralDesvioCritico: sanitizeNumber(params.umbralDesvioCritico, 3, 0, 60),
    bloquearResetLineaBase: Boolean(params.bloquearResetLineaBase),
  };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(limpio));
    localStorage.setItem('qaway-tolerance-days-v1', String(limpio.diasAvisoPrevio));
  } catch {
    /* ignore storage quota errors */
  }
  window.dispatchEvent(new CustomEvent(EVENTO_PARAMS_CRONOGRAMA, { detail: limpio }));
}

export function isDiaLaboral(date: Date, semana: SemanaLaboral): boolean {
  const day = date.getDay(); // 0=Dom, 1=Lun, ..., 6=Sab
  if (semana === 'lun-dom') return true;
  if (semana === 'lun-sab') return day !== 0;
  return day !== 0 && day !== 6;
}

/**
 * Cuenta los días hábiles inclusivos entre `startIso` y `endIso` (YYYY-MM-DD)
 * según la semana laboral configurada. Mínimo 1 para actividades válidas.
 */
export function countWorkingDays(
  startIso: string,
  endIso: string,
  semana: SemanaLaboral = 'lun-vie',
): number {
  if (!startIso || !endIso) return 1;
  const start = new Date(`${startIso.slice(0, 10)}T12:00:00`);
  const end = new Date(`${endIso.slice(0, 10)}T12:00:00`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 1;
  if (end < start) return 1;
  let count = 0;
  const cur = new Date(start);
  let guard = 0;
  while (cur <= end && guard < 4000) {
    if (isDiaLaboral(cur, semana)) count += 1;
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
): number {
  if (!aIso || !bIso) return 0;
  const a = aIso.slice(0, 10);
  const b = bIso.slice(0, 10);
  if (a === b) return 0;
  const sign = b > a ? 1 : -1;
  const from = new Date(`${(sign > 0 ? a : b)}T12:00:00`);
  const to = new Date(`${(sign > 0 ? b : a)}T12:00:00`);
  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) return 0;
  let count = 0;
  const cur = new Date(from);
  cur.setDate(cur.getDate() + 1);
  let guard = 0;
  while (cur <= to && guard < 4000) {
    if (isDiaLaboral(cur, semana)) count += 1;
    cur.setDate(cur.getDate() + 1);
    guard += 1;
  }
  return sign * count;
}
