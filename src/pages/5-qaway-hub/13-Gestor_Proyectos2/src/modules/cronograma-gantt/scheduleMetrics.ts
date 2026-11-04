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

export interface ScheduleFields {
  start: string;
  end: string;
  progress: number;
  status: string;
  baselineStart?: string;
  baselineEnd?: string;
  actualStart?: string;
  actualEnd?: string;
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
