import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as echarts from 'echarts';
import PERU_GEOJSON from '../../data/peru_departamental_simple.json';

const normalize = (value: any = '') =>
  String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toUpperCase();

// Asegurar que las features tengan 'name' mapeado desde 'NOMBDEP' para ECharts
const ECHARTS_PERU_GEOJSON: any = {
  ...PERU_GEOJSON,
  features: (PERU_GEOJSON as any).features.map((f: any) => ({
    ...f,
    properties: {
      ...f.properties,
      name: f.properties.NOMBDEP || f.properties.name || '',
    },
  })),
};

const BASE_REGION_STATS: Record<string, { progress: number; count: number; center: [number, number] }> = {
  ANCASH: { progress: 68, count: 21, center: [-9.5, -77.5] },
  JUNIN: { progress: 56, count: 13, center: [-11.5, -75.1] },
  'LA LIBERTAD': { progress: 74, count: 12, center: [-8.0, -78.5] },
  LIMA: { progress: 78, count: 9, center: [-11.8, -76.8] },
  CUSCO: { progress: 82, count: 14, center: [-13.3, -71.8] },
  AREQUIPA: { progress: 85, count: 10, center: [-16.2, -71.8] },
  PIURA: { progress: 64, count: 12, center: [-5.0, -80.2] },
  LORETO: { progress: 42, count: 8, center: [-4.2, -74.5] },
  PUNO: { progress: 50, count: 14, center: [-15.0, -70.0] },
  CAJAMARCA: { progress: 60, count: 13, center: [-6.8, -78.6] },
  'SAN MARTIN': { progress: 72, count: 10, center: [-6.8, -76.7] },
  SANMARTIN: { progress: 72, count: 10, center: [-6.8, -76.7] },
  LAMBAYEQUE: { progress: 70, count: 3, center: [-6.4, -79.8] },
  ICA: { progress: 81, count: 5, center: [-14.3, -75.5] },
  HUANUCO: { progress: 45, count: 11, center: [-9.6, -75.8] },
  AYACUCHO: { progress: 55, count: 11, center: [-13.6, -74.2] },
  UCAYALI: { progress: 48, count: 4, center: [-9.0, -73.8] },
  TACNA: { progress: 90, count: 4, center: [-17.8, -70.3] },
  APURIMAC: { progress: 58, count: 8, center: [-14.1, -73.0] },
  MOQUEGUA: { progress: 88, count: 3, center: [-17.0, -70.9] },
  PASCO: { progress: 52, count: 3, center: [-10.5, -75.5] },
  TUMBES: { progress: 75, count: 3, center: [-3.8, -80.5] },
  HUANCAVELICA: { progress: 40, count: 7, center: [-12.9, -75.0] },
  AMAZONAS: { progress: 49, count: 7, center: [-5.5, -78.2] },
  'MADRE DE DIOS': { progress: 35, count: 3, center: [-12.3, -70.5] },
  CALLAO: { progress: 75, count: 1, center: [-12.05, -77.12] },
};

// Registrar el mapa en ECharts una sola vez a nivel de módulo
echarts.registerMap('peru-departamental', ECHARTS_PERU_GEOJSON);

export interface PeruEChartsPowerBIProps {
  rows?: any[];
  selectedRegion?: string;
  selectedUgelId?: string | null;
  onUgelSelect?: (ugel: any) => void;
  onRegionSelect?: (regionName: string) => void;
  compact?: boolean;
}

export default function PeruEChartsPowerBI({
  rows = [],
  selectedRegion,
  selectedUgelId,
  onUgelSelect,
  onRegionSelect,
  compact = false,
}: PeruEChartsPowerBIProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.EChartsType | null>(null);
  const [selectedEntity, setSelectedEntity] = useState<{
    name: string;
    progress: number;
    status: string;
    ugelCount: number;
    region?: string;
  } | null>(null);

  // Consolidar métricas regionales dinámicas desde las rows en vivo
  const regionStats = useMemo(() => {
    const data: Record<string, { sum: number; count: number; progress: number }> = {};
    rows.forEach((row) => {
      const reg = normalize(row.region || '');
      if (!reg) return;
      if (!data[reg]) {
        data[reg] = { sum: 0, count: 0, progress: 0 };
      }
      data[reg].sum += Number(row.progress || 0);
      data[reg].count += 1;
    });

    Object.entries(BASE_REGION_STATS).forEach(([k, v]) => {
      if (!data[k]) {
        data[k] = { sum: v.progress * v.count, count: v.count, progress: v.progress };
      } else {
        data[k].progress = Math.round(data[k].sum / Math.max(1, data[k].count));
      }
    });

    return data;
  }, [rows]);

  // Resumen ejecutivo tipo Power BI
  const summary = useMemo(() => {
    const list = Object.values(regionStats);
    const avg = list.length ? list.reduce((s, x) => s + x.progress, 0) / list.length : 0;
    const totalUgel = list.reduce((s, x) => s + x.count, 0);
    const cumple = list.filter((x) => x.progress >= 80).length;
    const proceso = list.filter((x) => x.progress > 0 && x.progress < 80).length;
    const critico = list.filter((x) => x.progress === 0 || x.progress < 40).length;

    return {
      average: avg,
      ugel: totalUgel,
      cumple,
      proceso,
      critico,
      totalRegiones: list.length,
    };
  }, [regionStats]);

  useEffect(() => {
    if (!chartRef.current) return;

    if (!chartInstance.current) {
      chartInstance.current = echarts.init(chartRef.current, undefined, {
        renderer: 'svg',
      });
    }

    const chart = chartInstance.current;

    // 1. Datos poligonales de regiones (coroplético con degradado analítico)
    const mapSeriesData = Object.entries(regionStats).map(([regName, stat]) => ({
      name: regName,
      value: stat.progress,
      ugelCount: stat.count,
    }));

    // 2. Datos de puntos/burbujas para las UGEL individuales (o centroides departamentales)
    const scatterData: any[] = [];
    rows.forEach((r) => {
      if (r.coords && Array.isArray(r.coords) && r.coords.length >= 2) {
        // En ECharts geo coordinates son [lng, lat]
        scatterData.push({
          name: r.name,
          value: [r.coords[1], r.coords[0], r.progress || 0],
          id: r.id,
          region: r.region,
          state: r.state || (r.progress >= 80 ? 'Cumple' : 'En proceso'),
          progress: r.progress || 0,
        });
      }
    });

    const option: echarts.EChartsOption = {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(15, 23, 42, 0.92)',
        borderColor: '#334155',
        borderWidth: 1,
        padding: [10, 14],
        textStyle: {
          color: '#f8fafc',
          fontSize: 12,
          fontFamily: 'inherit',
        },
        formatter: (params: any) => {
          if (params.seriesType === 'map') {
            const val = params.value ?? 0;
            const ugels = params.data?.ugelCount ?? 0;
            const statusColor = val >= 80 ? '#10b981' : val >= 50 ? '#f59e0b' : '#ef4444';
            return `
              <div style="font-weight: 700; font-size: 13px; color: #ffffff; margin-bottom: 4px;">
                ${params.name}
              </div>
              <div style="display: flex; flex-direction: column; gap: 3px; font-size: 11.5px; color: #cbd5e1;">
                <div>Avance regional: <b style="color: ${statusColor};">${val}%</b></div>
                <div>Entidades / Sedes: <b style="color: #ffffff;">${ugels}</b></div>
                <div>Estado: <b style="color: ${statusColor};">${val >= 80 ? 'En Meta' : val >= 50 ? 'En Proceso' : 'Crítico'}</b></div>
              </div>
            `;
          }
          if (params.seriesType === 'scatter' || params.seriesType === 'effectScatter') {
            const data = params.data;
            const p = data?.progress ?? 0;
            const color = p >= 80 ? '#10b981' : p >= 50 ? '#f59e0b' : '#ef4444';
            return `
              <div style="font-weight: 700; font-size: 13px; color: #ffffff; margin-bottom: 4px;">
                ${data.name}
              </div>
              <div style="display: flex; flex-direction: column; gap: 2px; font-size: 11.5px; color: #cbd5e1;">
                <div>Región: <b style="color: #ffffff;">${data.region || '—'}</b></div>
                <div>Avance: <b style="color: ${color};">${p}%</b></div>
                <div>Condición: <b style="color: ${color};">${data.state}</b></div>
              </div>
            `;
          }
          return '';
        },
      },
      visualMap: {
        min: 0,
        max: 100,
        left: 20,
        bottom: 24,
        text: ['100% Meta', '0% Inicio'],
        calculable: true,
        inRange: {
          color: ['#e2e8f0', '#93c5fd', '#3b82f6', '#1e40af'],
        },
        textStyle: {
          color: '#64748b',
          fontSize: 11,
          fontWeight: 'bold',
        },
      },
      geo: {
        map: 'peru-departamental',
        roam: true,
        aspectScale: 0.95,
        zoom: 1.15,
        center: [-75.0, -9.2],
        label: {
          show: false,
          color: '#334155',
          fontSize: 10,
          fontWeight: 600,
        },
        itemStyle: {
          areaColor: '#f1f5f9',
          borderColor: '#cbd5e1',
          borderWidth: 1,
          shadowColor: 'rgba(15, 23, 42, 0.05)',
          shadowBlur: 8,
        },
        emphasis: {
          focus: 'self',
          label: {
            show: true,
            color: '#0f172a',
            fontWeight: 'bold',
            fontSize: 11,
          },
          itemStyle: {
            areaColor: '#bfdbfe',
            borderColor: '#2563eb',
            borderWidth: 1.8,
            shadowColor: 'rgba(37, 99, 235, 0.2)',
            shadowBlur: 14,
          },
        },
        select: {
          label: {
            show: true,
            color: '#0f172a',
            fontWeight: 'bold',
          },
          itemStyle: {
            areaColor: '#93c5fd',
            borderColor: '#1d4ed8',
            borderWidth: 2,
          },
        },
      },
      series: [
        {
          name: 'Avance Regional',
          type: 'map',
          geoIndex: 0,
          data: mapSeriesData,
        },
        {
          name: 'Sedes y Frentes',
          type: 'scatter',
          coordinateSystem: 'geo',
          data: scatterData,
          symbolSize: (val: any) => {
            const p = val[2] || 0;
            return Math.max(6, Math.min(18, 6 + (p / 100) * 12));
          },
          itemStyle: {
            color: (params: any) => {
              const p = params.data?.progress ?? 0;
              return p >= 80 ? '#10b981' : p >= 50 ? '#f59e0b' : '#ef4444';
            },
            shadowBlur: 6,
            shadowColor: 'rgba(0,0,0,0.25)',
          },
          emphasis: {
            scale: 1.4,
          },
        },
        {
          name: 'Sedes en Meta (Destacadas)',
          type: 'effectScatter',
          coordinateSystem: 'geo',
          data: scatterData.filter((d) => d.progress >= 80).slice(0, 8),
          symbolSize: 10,
          showEffectOn: 'render',
          rippleEffect: {
            brushType: 'stroke',
            scale: 3,
            period: 3,
          },
          itemStyle: {
            color: '#10b981',
            shadowBlur: 10,
            shadowColor: '#10b981',
          },
          zlevel: 1,
        },
      ],
    };

    chart.setOption(option, true);

    const handleChartClick = (params: any) => {
      if (params.seriesType === 'map') {
        const name = params.name;
        const stat = regionStats[name];
        setSelectedEntity({
          name: name,
          progress: stat ? stat.progress : 0,
          status: (stat?.progress ?? 0) >= 80 ? 'Cumple' : 'En proceso',
          ugelCount: stat ? stat.count : 0,
        });
        onRegionSelect?.(name);
      } else if (params.seriesType === 'scatter' || params.seriesType === 'effectScatter') {
        const d = params.data;
        setSelectedEntity({
          name: d.name,
          progress: d.progress,
          status: d.state,
          ugelCount: 1,
          region: d.region,
        });
        if (d.id) {
          const matchedRow = rows.find((r) => r.id === d.id);
          if (matchedRow) onUgelSelect?.(matchedRow);
        }
      }
    };

    chart.off('click');
    chart.on('click', handleChartClick);

    const resizeObserver = new ResizeObserver(() => {
      chart.resize();
    });
    resizeObserver.observe(chartRef.current);

    return () => {
      resizeObserver.disconnect();
      chart.off('click');
    };
  }, [regionStats, rows, onUgelSelect, onRegionSelect]);

  useEffect(() => {
    return () => {
      if (chartInstance.current) {
        chartInstance.current.dispose();
        chartInstance.current = null;
      }
    };
  }, []);

  if (compact) {
    return (
      <div style={{ position: 'relative', width: '100%', height: '100%', background: '#ffffff' }}>
        <div ref={chartRef} style={{ width: '100%', height: '100%' }} />
      </div>
    );
  }

  return (
    <div className="echarts-powerbi-wrapper" style={{
      display: 'grid',
      gridTemplateColumns: '1fr 280px',
      gap: 14,
      width: '100%',
      height: '100%',
      minHeight: 460,
      boxSizing: 'border-box',
    }}>
      {/* Panel Izquierdo: Lienzo de Mapa ECharts */}
      <div style={{
        position: 'relative',
        borderRadius: 10,
        overflow: 'hidden',
        border: '1px solid #e2e8f0',
        background: '#ffffff',
        boxShadow: '0 1px 3px rgba(15,23,42,0.04)',
      }}>
        <div ref={chartRef} style={{ width: '100%', height: '100%', minHeight: 440 }} />
      </div>

      {/* Panel Derecho: Dashboard Analítico de Indicadores (Estilo Power BI Oficial) */}
      <div style={{
        background: '#ffffff',
        borderRadius: 10,
        border: '1px solid #e2e8f0',
        padding: '16px 18px',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        overflowY: 'auto',
        boxShadow: '0 1px 3px rgba(15,23,42,0.04)',
      }}>
        <div style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: 8, marginBottom: 2 }}>
          <h4 style={{
            fontSize: 12.5,
            fontWeight: 800,
            color: '#0f172a',
            margin: 0,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#2563eb' }} />
            Tablero Analítico Power BI
          </h4>
          <span style={{ fontSize: 11, color: '#64748b' }}>Inteligencia Territorial de Cobertura</span>
        </div>

        {/* KPI 1: Avance Promedio Nacional */}
        <div style={{
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: 8,
          padding: '12px 14px',
          transition: 'transform 0.15s ease',
        }}>
          <span style={{ fontSize: 26, fontWeight: 850, color: '#0f172a', display: 'block', letterSpacing: '-0.02em' }}>
            {summary.average.toFixed(1)}%
          </span>
          <span style={{ fontSize: 11.5, color: '#64748b', fontWeight: 600 }}>
            Avance promedio ponderado
          </span>
        </div>

        {/* KPI 2: Sedes Totales Evaluadas */}
        <div style={{
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: 8,
          padding: '12px 14px',
        }}>
          <span style={{ fontSize: 26, fontWeight: 850, color: '#2563eb', display: 'block', letterSpacing: '-0.02em' }}>
            {summary.ugel}
          </span>
          <span style={{ fontSize: 11.5, color: '#64748b', fontWeight: 600 }}>
            Sedes y unidades monitoreadas
          </span>
        </div>

        {/* KPI 3: Regiones en Meta */}
        <div style={{
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: 8,
          padding: '12px 14px',
        }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
            <span style={{ fontSize: 26, fontWeight: 850, color: '#10b981', letterSpacing: '-0.02em' }}>
              {summary.cumple}
            </span>
            <span style={{ fontSize: 12, color: '#64748b' }}>de {summary.totalRegiones} regiones</span>
          </div>
          <span style={{ fontSize: 11.5, color: '#64748b', fontWeight: 600 }}>
            Regiones con meta lograda (≥80%)
          </span>
        </div>

        {/* Tarjeta de Inspección Interactiva por Clic */}
        {selectedEntity ? (
          <div style={{
            marginTop: 'auto',
            padding: '14px',
            borderRadius: 8,
            background: '#eff6ff',
            border: '1.5px solid #93c5fd',
            boxShadow: '0 4px 12px rgba(37,99,235,0.08)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <h5 style={{ margin: 0, fontSize: 13, color: '#1e40af', fontWeight: 800 }}>
                {selectedEntity.name}
              </h5>
              <span style={{
                fontSize: 10.5,
                fontWeight: 700,
                padding: '2px 6px',
                borderRadius: 4,
                background: selectedEntity.progress >= 80 ? '#dcfce7' : '#fef3c7',
                color: selectedEntity.progress >= 80 ? '#15803d' : '#b45309',
              }}>
                {selectedEntity.status}
              </span>
            </div>
            {selectedEntity.region && (
              <p style={{ margin: '0 0 4px', fontSize: 11.5, color: '#475569' }}>
                Región matriz: <b>{selectedEntity.region}</b>
              </p>
            )}
            <p style={{ margin: '0 0 4px', fontSize: 12, color: '#334155' }}>
              Nivel de cumplimiento: <b style={{ color: '#0f172a' }}>{selectedEntity.progress}%</b>
            </p>
            {selectedEntity.ugelCount > 1 && (
              <p style={{ margin: 0, fontSize: 12, color: '#334155' }}>
                Unidades operativas: <b>{selectedEntity.ugelCount}</b>
              </p>
            )}
          </div>
        ) : (
          <div style={{
            marginTop: 'auto',
            padding: '12px 10px',
            borderRadius: 8,
            background: '#f8fafc',
            border: '1px dashed #cbd5e1',
            fontSize: 11.5,
            color: '#64748b',
            textAlign: 'center',
            lineHeight: 1.4,
          }}>
            Haz clic en un departamento o burbuja para inspeccionar su analítica.
          </div>
        )}
      </div>
    </div>
  );
}
