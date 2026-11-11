import { describe, it, expect } from 'vitest';
import {
  applyActuals,
  daysBetween,
  formatDeviation,
  freezeBaseline,
  getDeviationDays,
  getDeviationTone,
  type ScheduleFields,
} from './scheduleMetrics';

const base = (over: Partial<ScheduleFields> = {}): ScheduleFields => ({
  start: '2026-09-01',
  end: '2026-09-30',
  progress: 0,
  status: 'Pendiente',
  baselineStart: '2026-09-01',
  baselineEnd: '2026-09-30',
  ...over,
});

describe('getDeviationDays', () => {
  it('sin línea base no hay desviación', () => {
    expect(getDeviationDays(base({ baselineStart: undefined, baselineEnd: undefined }), '2026-10-10')).toBeUndefined();
  });
  it('abierto y vigente: 0', () => {
    expect(getDeviationDays(base({ status: 'En proceso', progress: 40 }), '2026-09-15')).toBe(0);
  });
  it('abierto y vencido: crece con los días desde el fin', () => {
    expect(getDeviationDays(base({ status: 'En proceso', progress: 40 }), '2026-10-05')).toBe(5);
  });
  it('reprogramado: fin vigente posterior a la línea base', () => {
    expect(getDeviationDays(base({ end: '2026-10-07', status: 'En proceso', progress: 40 }), '2026-09-15')).toBe(7);
  });
  it('completado usa la fecha real de fin', () => {
    const it = base({ status: 'Completado', progress: 100, actualEnd: '2026-09-28' });
    expect(getDeviationDays(it, '2026-12-01')).toBe(-2);
  });
  it('completado sin fecha real usa el fin vigente (no sigue creciendo)', () => {
    expect(getDeviationDays(base({ status: 'Cumple', progress: 100 }), '2026-12-01')).toBe(0);
  });
});

describe('formato y tono', () => {
  it('formatea singular, plural, cero y vacío', () => {
    expect(formatDeviation(1)).toBe('+1 día');
    expect(formatDeviation(5)).toBe('+5 días');
    expect(formatDeviation(-2)).toBe('−2 días');
    expect(formatDeviation(0)).toBe('0 días');
    expect(formatDeviation(undefined)).toBe('—');
  });
  it('tono', () => {
    expect(getDeviationTone(3)).toBe('late');
    expect(getDeviationTone(0)).toBe('ontime');
    expect(getDeviationTone(-1)).toBe('early');
    expect(getDeviationTone(undefined)).toBe('none');
  });
  it('daysBetween', () => {
    expect(daysBetween('2026-09-30', '2026-10-05')).toBe(5);
  });
});

describe('freezeBaseline / applyActuals', () => {
  it('fija la línea base con las fechas vigentes', () => {
    const it = freezeBaseline(base({ baselineStart: undefined, baselineEnd: undefined, end: '2026-10-02' }));
    expect(it.baselineEnd).toBe('2026-10-02');
  });
  it('al completar se registra la fecha real de fin y de inicio', () => {
    const prev = base({ status: 'En proceso', progress: 50 });
    const next = { ...prev, status: 'Completado', progress: 100 };
    const r = applyActuals(prev, next, '2026-09-20');
    expect(r.actualEnd).toBe('2026-09-20');
    expect(r.actualStart).toBe('2026-09-20');
  });
  it('al iniciar se registra el inicio real una sola vez', () => {
    const prev = base();
    const r1 = applyActuals(prev, { ...prev, status: 'En proceso', progress: 10 }, '2026-09-05');
    expect(r1.actualStart).toBe('2026-09-05');
    const r2 = applyActuals(r1, { ...r1, progress: 30 }, '2026-09-09');
    expect(r2.actualStart).toBe('2026-09-05');
  });
  it('al reabrir se limpia la fecha real de fin', () => {
    const prev = base({ status: 'Completado', progress: 100, actualEnd: '2026-09-20', actualStart: '2026-09-01' });
    const r = applyActuals(prev, { ...prev, status: 'En proceso', progress: 60 }, '2026-09-22');
    expect(r.actualEnd).toBeUndefined();
  });
  it('una edición explícita de la fecha real se respeta', () => {
    const prev = base({ status: 'En proceso', progress: 50, actualStart: '2026-09-01' });
    const next = { ...prev, status: 'Completado', progress: 100, actualEnd: '2026-09-18' };
    expect(applyActuals(prev, next, '2026-09-25').actualEnd).toBe('2026-09-18');
  });
});
