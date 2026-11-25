import { describe, it, expect } from 'vitest';
import { computeSCurveSeries, type ScheduleFields } from './scheduleMetrics';
import { PARAMETROS_CRONOGRAMA_DEFAULT, type ParametrosCronograma } from '../../services/gpCronogramaConfigService';

const params = (over: Partial<ParametrosCronograma> = {}): ParametrosCronograma => ({
  ...PARAMETROS_CRONOGRAMA_DEFAULT,
  ...over,
});

describe("computeSCurveSeries", () => {
  it("respeta frecuencia de corte semanal, quincenal y mensual con las mismas fechas para Base y Real", () => {
    const items: ScheduleFields[] = [
      { start: "2026-09-01", end: "2026-10-31", baselineStart: "2026-09-01", baselineEnd: "2026-10-31", progress: 50, status: "En proceso" },
    ];
    const semanal = computeSCurveSeries(items, "2026-10-01", params({ frecuenciaCorte: "semanal" }));
    const quincenal = computeSCurveSeries(items, "2026-10-01", params({ frecuenciaCorte: "quincenal" }));
    const mensual = computeSCurveSeries(items, "2026-10-01", params({ frecuenciaCorte: "mensual" }));

    expect(semanal.points.length).toBeGreaterThan(quincenal.points.length);
    expect(quincenal.points.length).toBeGreaterThan(mensual.points.length);
    expect(mensual.points.some((p) => p.isToday && p.isoDate === "2026-10-01")).toBe(true);
  });

  it("usa estrictamente baselineStart/baselineEnd para la serie Base sin mezclarse con fechas modificadas", () => {
    const items: ScheduleFields[] = [
      { start: "2026-11-01", end: "2026-11-30", baselineStart: "2026-09-01", baselineEnd: "2026-09-30", progress: 20, status: "En proceso" },
    ];
    const res = computeSCurveSeries(items, "2026-09-30", params({ frecuenciaCorte: "quincenal" }));
    const corteSep30 = res.points.find((p) => p.isoDate === "2026-09-30");
    expect(res.hasBaselineData).toBe(true);
    expect(corteSep30?.planned).toBe(100);
    expect(corteSep30?.actual).toBe(20);
    expect(corteSep30?.gap).toBe(-80);
  });

  it("aplica ponderación por duración vs promedio simple en el avance real", () => {
    const items: ScheduleFields[] = [
      { start: "2026-09-01", end: "2026-09-02", baselineStart: "2026-09-01", baselineEnd: "2026-09-02", progress: 100, status: "Completado", actualEnd: "2026-09-02" },
      { start: "2026-09-01", end: "2026-09-30", baselineStart: "2026-09-01", baselineEnd: "2026-09-30", progress: 0, status: "Pendiente" },
    ];
    const porDuracion = computeSCurveSeries(items, "2026-09-15", params({ metodoPonderacion: "duracion" }));
    const porPromedio = computeSCurveSeries(items, "2026-09-15", params({ metodoPonderacion: "promedio" }));

    expect(porPromedio.currentActual).toBe(50);
    expect(porDuracion.currentActual).toBeLessThan(15);
  });

  it("no inventa ni repite avances históricos cuando no existen registros previos", () => {
    const items: ScheduleFields[] = [
      { start: "2026-09-01", end: "2026-10-31", baselineStart: "2026-09-01", baselineEnd: "2026-10-31", progress: 45, status: "En proceso" },
    ];
    const res = computeSCurveSeries(items, "2026-10-15", params({ frecuenciaCorte: "quincenal" }));
    expect(res.hasHistoricalProgress).toBe(false);
    const pasados = res.points.filter((p) => p.isoDate < "2026-10-15");
    expect(pasados.every((p) => p.actual === null)).toBe(true);
    expect(res.currentActual).toBe(45);
  });

  it("no dibuja serie Base cuando no existe Línea Base fijada", () => {
    const items: ScheduleFields[] = [
      { start: "2026-09-01", end: "2026-10-31", progress: 30, status: "En proceso" },
    ];
    const res = computeSCurveSeries(items, "2026-10-01", params({ frecuenciaCorte: "quincenal" }));
    expect(res.hasBaselineData).toBe(false);
    expect(res.points.every((p) => p.planned === null)).toBe(true);
    expect(res.currentActual).toBe(30);
  });
});
