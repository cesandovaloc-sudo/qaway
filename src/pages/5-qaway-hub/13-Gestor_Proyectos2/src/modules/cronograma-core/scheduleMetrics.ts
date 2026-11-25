/**
 * Métricas de control de plazos del cronograma (Fase 1: línea base, fechas reales y desviación).
 * Funciones puras, sin dependencias de React, para poder probarlas de forma aislada.
 *
 * Definiciones:
 *  - Línea base: fechas de inicio/fin aprobadas. Se fija de forma explícita y nunca se pisa en silencio.
 *  - Fecha real: inicio/fin efectivos. Se completan solos al iniciar/completar, y se pueden corregir a mano.
 *  - Desviación (días) = fin previsto − fin de la línea base.
 *      · Completado:        fin previsto = fecha real de fin (o el fin vigente si no hay).
 *      · Abierto y vencido: fin previsto = hoy (el retraso crece cada día hasta que se complete o se reprograme).
 *      · Abierto y vigente: fin previsto = fin vigente.
 *    Positivo = retraso, 0 = en plazo, negativo = adelanto. Sin línea base no hay desviación (undefined).
 */

import {
  getParametrosCronograma,
  workingDaysBetween,
  type ParametrosCronograma,
  type SemanaLaboral,
} from '../../services/gpCronogramaConfigService';

export interface ScheduleFields {
  start: string;
  end: string;
  progress: number;
  status: string;
  baselineStart?: string | undefined;
  baselineEnd?: string | undefined;
  actualStart?: string | undefined;
  actualEnd?: string | undefined;
}

const DONE_STATUSES = ['Completado', 'Cumple'];

export const isDone = (it: Pick<ScheduleFields, 'status' | 'progress'>): boolean =>
  DONE_STATUSES.includes(it.status) || it.progress >= 100;

export const isStarted = (it: Pick<ScheduleFields, 'status' | 'progress'>): boolean =>
  it.progress > 0 || (it.status !== 'Pendiente' && !!it.status);

/** Días de calendario entre dos fechas ISO (YYYY-MM-DD); positivo si b es posterior a a. */
export const daysBetween = (a: string, b: string): number => {
  const ta = new Date(a + 'T12:00:00').getTime();
  const tb = new Date(b + 'T12:00:00').getTime();
  return Math.round((tb - ta) / 86400000);
};

export const hasBaseline = (it: Pick<ScheduleFields, 'baselineStart' | 'baselineEnd'>): boolean =>
  !!it.baselineStart && !!it.baselineEnd;

/** Fin previsto actual, según el estado del registro (ver definiciones arriba). */
export const getForecastEnd = (it: ScheduleFields, today: string): string => {
  if (isDone(it)) return it.actualEnd || it.end;
  return today > it.end ? today : it.end;
};

/** Desviación en días respecto a la línea base o fin comprometido; calcula retraso real si la fecha límite fue superada */
export const getDeviationDays = (it: ScheduleFields, today: string): number | undefined => {
  if (it.baselineEnd) {
    return daysBetween(it.baselineEnd, getForecastEnd(it, today));
  }
  // Si no tiene línea base fijada explícita, se evalúa contra su fecha de fin programada:
  if (!it.end) return undefined;
  if (isDone(it)) return 0;
  if (today > it.end) {
    return daysBetween(it.end, today); // Retraso en días sobre la fecha programada
  }
  return 0; // En plazo
};

export type DeviationTone = 'late' | 'ontime' | 'early' | 'none';
export type ScheduleAlertLevel = 'cumplido' | 'desvio_critico' | 'retraso' | 'por_vencer' | 'en_plazo';

/**
 * Desviación en días hábiles según la semana laboral configurada.
 */
export const getWorkingDeviationDays = (
  it: ScheduleFields,
  today: string,
  semanaLaboral?: SemanaLaboral,
): number | undefined => {
  const semana = semanaLaboral ?? getParametrosCronograma().semanaLaboral;
  if (it.baselineEnd) {
    return workingDaysBetween(it.baselineEnd, getForecastEnd(it, today), semana);
  }
  if (!it.end) return undefined;
  if (isDone(it)) return 0;
  if (today > it.end) {
    return workingDaysBetween(it.end, today, semana);
  }
  return 0;
};

/**
 * Evalúa el estado de alerta PMBOK usando los Parámetros del Cronograma:
 * - Hitos (duración 0 días): vencen sin días de gracia (`today > end` => `retraso`).
 * - Actividades: `desvio_critico` si exceden `umbralDesvioCritico` sobre Línea Base;
 *   `por_vencer` si faltan `<= diasAvisoPrevio` días hábiles para `end`.
 */
export const getScheduleAlertState = (
  it: ScheduleFields & { kind?: string; wbsNodeType?: string },
  today: string,
  params: ParametrosCronograma = getParametrosCronograma(),
): ScheduleAlertLevel => {
  if (isDone(it)) return 'cumplido';
  const esHito =
    it.kind === 'Hito' ||
    it.wbsNodeType === 'hito' ||
    (Boolean(it.start) && Boolean(it.end) && it.start === it.end);

  const dev = getWorkingDeviationDays(it, today, params.semanaLaboral);
  if (dev !== undefined && dev > params.umbralDesvioCritico) {
    return 'desvio_critico';
  }
  if (it.end && today > it.end) {
    if (esHito) {
      const diasDespues = workingDaysBetween(it.end, today, params.semanaLaboral);
      if (diasDespues <= (params.diasGraciaHito ?? 0)) {
        return 'por_vencer';
      }
    }
    return 'retraso';
  }
  if (it.end && !esHito) {
    const restantes = workingDaysBetween(today, it.end, params.semanaLaboral);
    if (restantes >= 0 && restantes <= params.diasAvisoPrevio) {
      return 'por_vencer';
    }
  }
  if (it.end && esHito) {
    const restantes = workingDaysBetween(today, it.end, params.semanaLaboral);
    if (restantes === 0 || (restantes > 0 && restantes <= params.diasAvisoPrevio)) {
      return 'por_vencer';
    }
  }
  return 'en_plazo';
};

export const getDeviationTone = (dev: number | undefined): DeviationTone => {
  if (dev === undefined) return 'none';
  if (dev > 0) return 'late';
  if (dev < 0) return 'early';
  return 'ontime';
};

export const formatDeviation = (dev: number | undefined): string => {
  if (dev === undefined) return '—';
  const abs = Math.abs(dev);
  const unit = abs === 1 ? 'día' : 'días';
  if (dev > 0) return `+${abs} ${unit}`;
  if (dev < 0) return `−${abs} ${unit}`;
  return '0 días';
};

/** Fija la línea base con las fechas vigentes. */
export const freezeBaseline = <T extends ScheduleFields>(it: T): T => ({
  ...it,
  baselineStart: it.start,
  baselineEnd: it.end,
});

/**
 * Mantiene coherentes las fechas reales cuando cambia el estado/avance de un registro.
 * Si el cambio ya trae una fecha real distinta a la previa (edición explícita), se respeta tal cual.
 */
export const applyActuals = <T extends ScheduleFields>(prev: T, next: T, today: string): T => {
  const result: T = { ...next };
  const startEdited = next.actualStart !== prev.actualStart;
  const endEdited = next.actualEnd !== prev.actualEnd;

  if (!startEdited && !result.actualStart && isStarted(next)) {
    result.actualStart = today;
  }
  if (!endEdited) {
    if (isDone(next) && !isDone(prev) && !result.actualEnd) {
      result.actualEnd = today;
      if (!result.actualStart) result.actualStart = today;
    } else if (!isDone(next) && isDone(prev)) {
      result.actualEnd = undefined;
    }
  }
  return result;
};

export interface SCurvePoint {
  isoDate: string;
  date: string;
  planned: number | null;
  actual: number | null;
  gap: number | null;
  isToday: boolean;
}

export interface SCurveResult {
  points: SCurvePoint[];
  hasBaselineData: boolean;
  hasHistoricalProgress: boolean;
  currentActual: number | null;
  currentPlanned: number | null;
  currentGap: number | null;
}

const addCalendarDaysIso = (iso: string, days: number): string => {
  const d = new Date(`${iso}T12:00:00`);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
};

const addMonthsIso = (iso: string, months: number): string => {
  const d = new Date(`${iso}T12:00:00`);
  d.setMonth(d.getMonth() + months);
  return d.toISOString().slice(0, 10);
};

/**
 * Calcula la Curva S (Programado Base vs. Avance Real) respetando:
 * - Semana laboral (`semanaLaboral`)
 * - Ponderación (`duracion` en días hábiles vs `promedio` simple)
 * - Frecuencia de corte (`semanal`, `quincenal`, `mensual`)
 * - Sin inventar ni interpolar avances históricos inexistentes.
 */
export const computeSCurveSeries = (
  items: ReadonlyArray<ScheduleFields>,
  todayIso: string,
  params: ParametrosCronograma = getParametrosCronograma(),
  options?: { minDateIso?: string; maxDateIso?: string },
): SCurveResult => {
  if (!items || items.length === 0) {
    return {
      points: [],
      hasBaselineData: false,
      hasHistoricalProgress: false,
      currentActual: null,
      currentPlanned: null,
      currentGap: null,
    };
  }

  const baselineItems = items.filter((it) => Boolean(it.baselineStart && it.baselineEnd));
  const hasBaselineData = baselineItems.length > 0;
  const hasHistoricalProgress = items.some((it) => Boolean(it.actualEnd));

  let minIso = "";
  let maxIso = "";
  for (const it of items) {
    const sIso = it.baselineStart || it.start;
    const eIso = it.baselineEnd || it.end;
    if (sIso && (!minIso || sIso < minIso)) minIso = sIso;
    if (eIso && (!maxIso || eIso > maxIso)) maxIso = eIso;
  }
  if (!minIso || !maxIso || maxIso < minIso) {
    minIso = todayIso;
    maxIso = todayIso;
  }
  if (options?.minDateIso && options.minDateIso > minIso) minIso = options.minDateIso;
  if (options?.maxDateIso && options.maxDateIso < maxIso) maxIso = options.maxDateIso;
  if (maxIso < minIso) maxIso = minIso;

  // Generar fechas de corte según frecuencia configurada
  const cutSet = new Set<string>();
  let cursor = minIso;
  let guard = 0;
  while (cursor <= maxIso && guard < 120) {
    cutSet.add(cursor);
    if (params.frecuenciaCorte === "mensual") {
      cursor = addMonthsIso(cursor, 1);
    } else if (params.frecuenciaCorte === "quincenal") {
      cursor = addCalendarDaysIso(cursor, 15);
    } else {
      cursor = addCalendarDaysIso(cursor, 7);
    }
    guard += 1;
  }
  cutSet.add(maxIso);
  if (todayIso >= minIso && todayIso <= maxIso) {
    cutSet.add(todayIso);
  }
  const cutDates = Array.from(cutSet).sort();

  const weightOf = (it: ScheduleFields): number => {
    if (params.metodoPonderacion === "promedio") return 1;
    const s = it.baselineStart || it.start;
    const e = it.baselineEnd || it.end;
    if (!s || !e) return 1;
    return Math.max(1, workingDaysBetween(s, e, params.semanaLaboral));
  };

  let currentActual: number | null = null;
  let currentPlanned: number | null = null;
  let currentGap: number | null = null;

  const points: SCurvePoint[] = cutDates.map((cutIso) => {
    // 1. BASE / PLANIFICADO: usa estrictamente baselineStart y baselineEnd (sin fallback a start/end vigentes)
    let planned: number | null = null;
    if (hasBaselineData) {
      let pWeighted = 0;
      let pTotalW = 0;
      for (const it of baselineItems) {
        const bS = it.baselineStart!;
        const bE = it.baselineEnd!;
        const w = weightOf(it);
        let pct = 0;
        if (cutIso < bS) {
          pct = 0;
        } else if (cutIso >= bE) {
          pct = 100;
        } else {
          const totalW = Math.max(1, workingDaysBetween(bS, bE, params.semanaLaboral));
          const elapsedW = Math.max(0, workingDaysBetween(bS, cutIso, params.semanaLaboral));
          pct = Math.min(100, Math.max(0, (elapsedW / totalW) * 100));
        }
        pWeighted += pct * w;
        pTotalW += w;
      }
      planned = pTotalW > 0 ? Math.round(pWeighted / pTotalW) : 0;
    }

    // 2. REAL: en todayIso calcula el avance ponderado real; en cortes pasados solo si hay registros (actualEnd)
    let actual: number | null = null;
    const isToday = cutIso === todayIso;
    if (isToday) {
      let rWeighted = 0;
      let rTotalW = 0;
      for (const it of items) {
        const w = weightOf(it);
        const pct = Math.min(100, Math.max(0, Number(it.progress) || 0));
        rWeighted += pct * w;
        rTotalW += w;
      }
      actual = rTotalW > 0 ? Math.round(rWeighted / rTotalW) : 0;
    } else if (cutIso < todayIso && hasHistoricalProgress) {
      let rWeighted = 0;
      let rTotalW = 0;
      let anyEvidence = false;
      for (const it of items) {
        const w = weightOf(it);
        if (it.actualEnd && it.actualEnd <= cutIso) {
          rWeighted += 100 * w;
          anyEvidence = true;
        }
        rTotalW += w;
      }
      actual = anyEvidence && rTotalW > 0 ? Math.round(rWeighted / rTotalW) : null;
    }

    const gap = planned !== null && actual !== null ? actual - planned : null;
    if (isToday) {
      currentActual = actual;
      currentPlanned = planned;
      currentGap = gap;
    }

    const dObj = new Date(`${cutIso}T12:00:00`);
    const date = dObj.toLocaleDateString("es-PE", { day: "2-digit", month: "short" });
    return { isoDate: cutIso, date, planned, actual, gap, isToday };
  });

  return {
    points,
    hasBaselineData,
    hasHistoricalProgress,
    currentActual,
    currentPlanned,
    currentGap,
  };
};