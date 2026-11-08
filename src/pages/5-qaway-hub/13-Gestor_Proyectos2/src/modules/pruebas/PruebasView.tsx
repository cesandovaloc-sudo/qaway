import { useEffect, useRef, useState } from 'react';
import * as maplibregl from 'maplibre-gl';
import * as echarts from 'echarts';
import 'maplibre-gl/dist/maplibre-gl.css';
import './pruebas.css';

type Tool = 'maplibre' | 'deckgl' | 'kepler' | 'echarts';

const tools: Array<{ id: Tool; label: string; description: string }> = [
  { id: 'maplibre', label: 'MapLibre GL JS', description: 'Mapa base vectorial para pruebas cartográficas.' },
  { id: 'deckgl', label: 'deck.gl', description: 'Capas de puntos, arcos y agregaciones espaciales.' },
  { id: 'kepler', label: 'Kepler.gl', description: 'Exploración visual y análisis territorial interactivo.' },
  { id: 'echarts', label: 'Apache ECharts', description: 'Indicadores y gráficos analíticos para mapas.' },
];

export default function PruebasView({ activeProject }: { activeProject?: { name?: string } | undefined }) {
  const [activeTool, setActiveTool] = useState<Tool>('maplibre');
  const mapHost = useRef<HTMLDivElement>(null);
  const chartHost = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeTool !== 'maplibre' || !mapHost.current) return;
    const map = new maplibregl.Map({
      container: mapHost.current,
      style: 'https://tiles.openfreemap.org/styles/bright',
      center: [-75.2, -9.2],
      zoom: 4.2,
    });
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');
    return () => map.remove();
  }, [activeTool]);

  useEffect(() => {
    if (activeTool !== 'echarts' || !chartHost.current) return;
    const chart = echarts.init(chartHost.current);
    chart.setOption({
      tooltip: { trigger: 'axis' },
      grid: { left: 42, right: 18, top: 24, bottom: 28 },
      xAxis: { type: 'category', data: ['Norte', 'Centro', 'Sur', 'Oriente'] },
      yAxis: { type: 'value', max: 100, axisLabel: { formatter: '{value}%' } },
      series: [{ type: 'bar', data: [74, 58, 82, 46], barWidth: '42%', itemStyle: { color: '#2563eb', borderRadius: [5, 5, 0, 0] } }],
    });
    const resize = () => chart.resize();
    window.addEventListener('resize', resize);
    return () => { window.removeEventListener('resize', resize); chart.dispose(); };
  }, [activeTool]);

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
            <div className="pruebas-stage-head"><div><span className="eyebrow">VISTA MAPA · PRUEBAS</span><h2>{active.label}</h2><p>{active.description}</p></div><span className="pruebas-badge">Experimental</span></div>
            {activeTool === 'maplibre' && <div ref={mapHost} className="pruebas-map" />}
            {activeTool === 'echarts' && <div ref={chartHost} className="pruebas-chart" />}
            {(activeTool === 'deckgl' || activeTool === 'kepler') && <div className="pruebas-placeholder"><strong>{active.label} disponible</strong><p>La dependencia está instalada y aislada. Esta vista queda preparada para conectar capas y datos territoriales reales sin tocar los mapas productivos.</p></div>}
          </section>
        </main>
      </div>
    </div>
  );
}
