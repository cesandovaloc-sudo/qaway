import { useEffect, useRef, useState } from 'react';
import * as maplibregl from 'maplibre-gl';
import * as echarts from 'echarts';
import { DeckGL } from '@deck.gl/react';
import { ScatterplotLayer } from '@deck.gl/layers';
import { fetchCronogramaFromSupabase, type GanttItemData } from '../../services/gestorCronogramaService';
import 'maplibre-gl/dist/maplibre-gl.css';
import './pruebas.css';

type Tool = 'maplibre' | 'deckgl' | 'kepler' | 'echarts';

const tools: Array<{ id: Tool; label: string; description: string }> = [
  { id: 'maplibre', label: 'MapLibre GL JS', description: 'Mapa base vectorial para pruebas cartográficas.' },
  { id: 'deckgl', label: 'deck.gl', description: 'Capas de puntos, arcos y agregaciones espaciales.' },
  { id: 'kepler', label: 'Kepler.gl', description: 'Exploración visual y análisis territorial interactivo.' },
  { id: 'echarts', label: 'Apache ECharts', description: 'Indicadores y gráficos analíticos para mapas.' },
];

export default function PruebasView({ activeProject }: { activeProject?: { name?: string; id?: string } | undefined }) {
  const [activeTool, setActiveTool] = useState<Tool>('maplibre');
  const [items, setItems] = useState<GanttItemData[]>([]);
  const [dataState, setDataState] = useState<'loading' | 'ready' | 'empty'>('loading');
  const mapHost = useRef<HTMLDivElement>(null);
  const chartHost = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    const timeout = window.setTimeout(() => {
      if (!cancelled) setDataState('empty');
    }, 8000);
    fetchCronogramaFromSupabase(activeProject?.id || '').then((rows) => {
      if (!cancelled) {
        window.clearTimeout(timeout);
        setItems(rows || []);
        setDataState(rows && rows.length > 0 ? 'ready' : 'empty');
      }
    });
    return () => { cancelled = true; window.clearTimeout(timeout); };
  }, [activeProject?.id]);

  const points = items.map((item, index) => ({
    position: [-77.04 + (index % 8) * 1.55, -12.05 + Math.floor(index / 8) * 1.05] as [number, number],
    name: item.name,
    progress: item.progress,
  }));

  useEffect(() => {
    if (activeTool !== 'maplibre' || !mapHost.current) return;
    const map = new maplibregl.Map({
      container: mapHost.current,
      style: 'https://tiles.openfreemap.org/styles/bright',
      center: [-75.2, -9.2],
      zoom: 4.2,
    });
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');
    map.on('load', () => {
      map.addSource('pruebas-project-items', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: points.map((point) => ({
            type: 'Feature',
            geometry: { type: 'Point', coordinates: point.position },
            properties: { name: point.name, progress: point.progress },
          })),
        },
      });
      map.addLayer({
        id: 'pruebas-project-items',
        type: 'circle',
        source: 'pruebas-project-items',
        paint: {
          'circle-radius': 7,
          'circle-color': ['step', ['get', 'progress'], '#e5484d', 50, '#f59e0b', 80, '#16a36a'],
          'circle-stroke-color': '#ffffff',
          'circle-stroke-width': 2,
        },
      });
      map.on('click', 'pruebas-project-items', (event) => {
        const feature = event.features?.[0];
        if (!feature || !map) return;
        new maplibregl.Popup().setLngLat(event.lngLat).setHTML(`<strong>${feature.properties?.name || 'Actividad'}</strong><br/>Avance: ${feature.properties?.progress || 0}%`).addTo(map);
      });
    });
    return () => map.remove();
  }, [activeTool, points.length]);

  useEffect(() => {
    if (activeTool !== 'echarts' || !chartHost.current) return;
    const chart = echarts.init(chartHost.current);
    chart.setOption({
      tooltip: { trigger: 'axis' },
      grid: { left: 42, right: 18, top: 24, bottom: 28 },
      xAxis: { type: 'category', data: items.slice(0, 12).map((item) => item.code || item.name.slice(0, 12)) },
      yAxis: { type: 'value', max: 100, axisLabel: { formatter: '{value}%' } },
      series: [{ type: 'bar', data: items.slice(0, 12).map((item) => item.progress || 0), barWidth: '42%', itemStyle: { color: '#2563eb', borderRadius: [5, 5, 0, 0] } }],
    });
    const resize = () => chart.resize();
    window.addEventListener('resize', resize);
    return () => { window.removeEventListener('resize', resize); chart.dispose(); };
  }, [activeTool, items]);

  const deckLayers = [new ScatterplotLayer({ id: 'pruebas-deck-points', data: points, getPosition: (d) => d.position, getRadius: (d) => 5000 + d.progress * 80, getFillColor: (d) => d.progress >= 80 ? [22, 163, 106] : d.progress > 0 ? [245, 158, 11] : [229, 72, 77], pickable: true })];

  const active = tools.find((tool) => tool.id === activeTool) || tools[0]!;

  return (
    <div className="gantt-v2 pruebas-module">
      <div className="app">
        <header className="header">
          <div className="heading">
            <span className="heading-icon">🧪</span>
            <div>
              <h1>PRUEBAS · {activeProject?.name || 'Gestión del Proyecto'}</h1>
              <p>Laboratorio aislado para validar herramientas avanzadas de mapas y visualización.</p>
            </div>
          </div>
        </header>
        <main className="pruebas-workspace">
          <nav className="pruebas-tools" aria-label="Herramientas de visualización">
            {tools.map((tool) => (
              <button key={tool.id} type="button" className={activeTool === tool.id ? 'active' : ''} onClick={() => setActiveTool(tool.id)}>
                <strong>{tool.label}</strong><small>{tool.description}</small>
              </button>
            ))}
          </nav>
          <section className="pruebas-stage">
            <div className="pruebas-stage-head"><div><span className="eyebrow">VISTA MAPA · PRUEBAS</span><h2>{active.label}</h2><p>{active.description}</p></div><span className="pruebas-badge">{dataState === 'loading' ? 'Cargando Supabase…' : `${items.length} registros vivos`}</span></div>
            {activeTool === 'maplibre' && <div ref={mapHost} className="pruebas-map" />}
            {activeTool === 'deckgl' && <div className="pruebas-map"><DeckGL initialViewState={{ longitude: -75.2, latitude: -9.2, zoom: 4.2 }} controller layers={deckLayers} /></div>}
            {activeTool === 'echarts' && <div ref={chartHost} className="pruebas-chart" />}
            {activeTool === 'kepler' && <div className="pruebas-kepler"><strong>Kepler.gl · datos vivos del proyecto</strong><p>{items.length} registros cargados desde Supabase.</p><div className="pruebas-data-grid">{items.slice(0, 18).map((item) => <div key={item.id}><b>{item.code}</b><span>{item.name}</span><em>{item.progress}%</em></div>)}</div></div>}
          </section>
        </main>
      </div>
    </div>
  );
}
