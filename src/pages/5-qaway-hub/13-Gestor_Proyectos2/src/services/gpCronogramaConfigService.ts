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
  /** Si es true, solo un rol admin puede restablecer la Línea Base oficial en el Gantt. */
  bloquearResetLineaBase: boolean;
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
  bloquearResetLineaBase: false,
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
      bloquearResetLineaBase: Boolean(parsed.bloquearResetLineaBase),
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
