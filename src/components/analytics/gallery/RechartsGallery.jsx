import React, { useState } from 'react'
import {
  Layers,
  Code2,
  Copy,
  Check,
  Sparkles,
  Sliders,
  Eye,
  PieChart as PieIcon,
  BarChart3,
  TrendingUp,
  Activity,
  Boxes,
  Compass
} from 'lucide-react'
import ChartCard from '../ui/ChartCard'
import AreaChartPro from '../charts/AreaChartPro'
import LineChartPro from '../charts/LineChartPro'
import BarChartPro from '../charts/BarChartPro'
import ComposedChartPro from '../charts/ComposedChartPro'
import DonutChartPro from '../charts/DonutChartPro'
import RadialBarChartPro from '../charts/RadialBarChartPro'
import RadarChartPro from '../charts/RadarChartPro'
import TreemapChartPro from '../charts/TreemapChartPro'
import FunnelChartPro from '../charts/FunnelChartPro'
import ScatterChartPro from '../charts/ScatterChartPro'
import { formatters } from '../theme'

export default function RechartsGallery({ theme = 'light', palette }) {
  const [selectedChartType, setSelectedChartType] = useState('all')
  const [copiedKey, setCopiedKey] = useState(null)

  const colors = palette?.colors || ['#ff4b0b', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4']
  const isDark = theme === 'dark' || theme?.id?.includes('dark') || theme?.id?.includes('cyber')

  const copySnippet = (key, code) => {
    navigator.clipboard.writeText(code)
    setCopiedKey(key)
    setTimeout(() => setCopiedKey(null), 2000)
  }

  // Datasets de prueba para la galería
  const sampleTimeSeries = [
    { name: 'Ene', valorA: 4200, valorB: 2400, meta: 3500 },
    { name: 'Feb', valorA: 5100, valorB: 2900, meta: 3500 },
    { name: 'Mar', valorA: 6800, valorB: 4100, meta: 4000 },
    { name: 'Abr', valorA: 7900, valorB: 5200, meta: 4500 },
    { name: 'May', valorA: 9400, valorB: 6800, meta: 5000 },
    { name: 'Jun', valorA: 11200, valorB: 8300, meta: 6000 }
  ]

  const sampleCategories = [
    { name: 'Marketing Digital', valor: 45000 },
    { name: 'Desarrollo Web', valor: 62000 },
    { name: 'Branding & Diseño', valor: 38000 },
    { name: 'Consultoría IA', valor: 54000 },
    { name: 'Automatizaciones CRM', valor: 41000 }
  ]

  const sampleDistribution = [
    { name: 'Tráfico Directo', value: 3500 },
    { name: 'Búsqueda Orgánica (SEO)', value: 6800 },
    { name: 'Campañas Ads (Meta/Google)', value: 9400 },
    { name: 'Email & WhatsApp', value: 4200 }
  ]

  const sampleRadar = [
    { subject: 'Velocidad', score: 95 },
    { subject: 'Seguridad', score: 90 },
    { subject: 'Diseño UX', score: 88 },
    { subject: 'Conversión', score: 82 },
    { subject: 'SEO Técnico', score: 92 },
    { subject: 'Escalabilidad', score: 85 }
  ]

  const sampleTreemap = [
    { name: 'Sistemas Digitales', size: 120000 },
    { name: 'Branding & Identidad', size: 85000 },
    { name: 'Academy Cursos', size: 64000 },
    { name: 'Consultoría Estratégica', size: 45000 },
    { name: 'Herramientas Hub', size: 38000 },
    { name: 'Plantillas & Recursos', size: 28000 }
  ]

  const sampleScatter = [
    { x: 10, y: 30, z: 200, name: 'Lead A' },
    { x: 25, y: 55, z: 400, name: 'Lead B' },
    { x: 40, y: 75, z: 300, name: 'Lead C' },
    { x: 55, y: 90, z: 600, name: 'Lead D' },
    { x: 70, y: 60, z: 250, name: 'Lead E' },
    { x: 85, y: 120, z: 800, name: 'Lead F' }
  ]

  const chartCatalog = [
    {
      id: 'area',
      title: '1. Area Chart Pro (Series Temporales Suaves)',
      desc: 'Gradientes lineales calibrados para representar tendencias de tráfico, ingresos y demanda.',
      component: (
        <AreaChartPro
          data={sampleTimeSeries}
          series={[
            { key: 'valorA', name: 'Ingresos 2026', color: colors[0] },
            { key: 'valorB', name: 'Ingresos 2025', color: colors[1] }
          ]}
          valueFormatter={(v) => formatters.currency(v)}
          theme={theme}
        />
      ),
      snippet: `import AreaChartPro from '@/components/analytics/charts/AreaChartPro'

<AreaChartPro
  data={data}
  series={[
    { key: 'valorA', name: 'Ingresos 2026', color: '#ff4b0b' },
    { key: 'valorB', name: 'Ingresos 2025', color: '#3b82f6' }
  ]}
  valueFormatter={(v) => \`S/ \${v.toLocaleString()}\`}
/>`
    },
    {
      id: 'line',
      title: '2. Line Chart Pro (Curvas Spline con Metas)',
      desc: 'Trazos continuos con soporte para líneas de referencia de objetivos o umbrales mínimos.',
      component: (
        <LineChartPro
          data={sampleTimeSeries}
          series={[
            { key: 'valorA', name: 'Rendimiento Real', color: colors[0] }
          ]}
          targetLine={{ y: 5000, label: 'Meta Mensual (S/ 5k)', color: colors[2] }}
          valueFormatter={(v) => formatters.currency(v)}
          theme={theme}
        />
      ),
      snippet: `import LineChartPro from '@/components/analytics/charts/LineChartPro'

<LineChartPro
  data={data}
  series={[{ key: 'valorA', name: 'Rendimiento', color: '#ff4b0b' }]}
  targetLine={{ y: 5000, label: 'Meta', color: '#10b981' }}
/>`
    },
    {
      id: 'bar',
      title: '3. Bar Chart Pro (Barras Agrupadas & Verticales)',
      desc: 'Barras estilizadas con esquinas redondeadas para comparativas de categorías y rankings.',
      component: (
        <BarChartPro
          data={sampleCategories}
          xAxisKey="name"
          layout="vertical"
          series={[{ key: 'valor', name: 'Facturación', color: colors[0] }]}
          valueFormatter={(v) => formatters.currency(v)}
          theme={theme}
        />
      ),
      snippet: `import BarChartPro from '@/components/analytics/charts/BarChartPro'

<BarChartPro
  data={categories}
  layout="vertical"
  xAxisKey="name"
  series={[{ key: 'valor', name: 'Facturación', color: '#ff4b0b' }]}
/>`
    },
    {
      id: 'composed',
      title: '4. Composed Chart Pro (Barras + Línea + Proyección)',
      desc: 'Gráfico híbrido para correlacionar volumen de ventas con porcentajes de conversión.',
      component: (
        <ComposedChartPro
          data={sampleTimeSeries}
          series={[
            { key: 'valorA', type: 'bar', name: 'Volumen Facturado', color: colors[1] },
            { key: 'valorB', type: 'line', name: 'Margen de Utilidad', color: colors[0] }
          ]}
          valueFormatter={(v) => formatters.currency(v)}
          theme={theme}
        />
      ),
      snippet: `import ComposedChartPro from '@/components/analytics/charts/ComposedChartPro'

<ComposedChartPro
  data={data}
  series={[
    { key: 'valorA', type: 'bar', name: 'Volumen', color: '#3b82f6' },
    { key: 'valorB', type: 'line', name: 'Margen', color: '#ff4b0b' }
  ]}
/>`
    },
    {
      id: 'donut',
      title: '5. Donut Chart Pro (Centro Dinámico & Leyenda)',
      desc: 'Distribución circular con contador central dinámico y desglose porcentual interactivo.',
      component: (
        <DonutChartPro
          data={sampleDistribution}
          dataKey="value"
          nameKey="name"
          colors={colors}
          valueFormatter={(v) => `${v.toLocaleString()} visitas`}
          theme={theme}
          centerLabel="Total Visitas"
        />
      ),
      snippet: `import DonutChartPro from '@/components/analytics/charts/DonutChartPro'

<DonutChartPro
  data={distribution}
  dataKey="value"
  nameKey="name"
  centerLabel="Total Visitas"
/>`
    },
    {
      id: 'radial',
      title: '6. Radial Bar Chart Pro (Anillos de Metas)',
      desc: 'Indicador circular progresivo de cumplimiento de metas y métricas de salud operativa.',
      component: (
        <RadialBarChartPro
          data={[
            { name: 'Lead Response Time', value: 92, fill: colors[0] },
            { name: 'SLA Resolución', value: 84, fill: colors[1] },
            { name: 'CSAT Satisfacción', value: 96, fill: colors[2] }
          ]}
          valueFormatter={(v) => `${v}%`}
          theme={theme}
        />
      ),
      snippet: `import RadialBarChartPro from '@/components/analytics/charts/RadialBarChartPro'

<RadialBarChartPro
  data={[
    { name: 'SLA', value: 84, fill: '#3b82f6' },
    { name: 'CSAT', value: 96, fill: '#10b981' }
  ]}
  valueFormatter={(v) => \`\${v}%\`}
/>`
    },
    {
      id: 'radar',
      title: '7. Radar Chart Pro (Evaluación Multidimensional)',
      desc: 'Gráfico polar para evaluación de competencias, scoring de riesgo o auditoría técnica.',
      component: (
        <RadarChartPro
          data={sampleRadar}
          subjectKey="subject"
          series={[{ key: 'score', name: 'Puntuación Qaway', color: colors[0] }]}
          valueFormatter={(v) => `${v} pts`}
          theme={theme}
        />
      ),
      snippet: `import RadarChartPro from '@/components/analytics/charts/RadarChartPro'

<RadarChartPro
  data={radarData}
  subjectKey="subject"
  series={[{ key: 'score', name: 'Puntuación', color: '#ff4b0b' }]}
/>`
    },
    {
      id: 'treemap',
      title: '8. Treemap Chart Pro (Mosaico Jerárquico)',
      desc: 'Visualización de categorías por peso de ingresos o tamaño de catálogo.',
      component: (
        <TreemapChartPro
          data={sampleTreemap}
          colors={colors}
          valueFormatter={(v) => formatters.currency(v)}
          theme={theme}
        />
      ),
      snippet: `import TreemapChartPro from '@/components/analytics/charts/TreemapChartPro'

<TreemapChartPro
  data={treemapData}
  valueFormatter={(v) => formatters.currency(v)}
/>`
    },
    {
      id: 'funnel',
      title: '9. Funnel Chart Pro (Embudo de Conversión)',
      desc: 'Embudo de conversión con cálculo automático de tasas de paso y retención global.',
      component: (
        <FunnelChartPro
          colors={colors}
          valueFormatter={(v) => `${v.toLocaleString()} usuarios`}
          theme={theme}
        />
      ),
      snippet: `import FunnelChartPro from '@/components/analytics/charts/FunnelChartPro'

<FunnelChartPro
  data={funnelSteps}
  valueFormatter={(v) => \`\${v} usuarios\`}
/>`
    },
    {
      id: 'scatter',
      title: '10. Scatter Chart Pro (Correlación y Dispersión)',
      desc: 'Análisis de dispersión para detectar correlaciones entre volumen y ticket o satisfacción.',
      component: (
        <ScatterChartPro
          data={sampleScatter}
          xKey="x"
          yKey="y"
          zKey="z"
          xName="Frecuencia Mensual"
          yName="Ticket Medio (S/)"
          color={colors[0]}
          theme={theme}
        />
      ),
      snippet: `import ScatterChartPro from '@/components/analytics/charts/ScatterChartPro'

<ScatterChartPro
  data={scatterData}
  xKey="x"
  yKey="y"
  color="#ff4b0b"
/>`
    }
  ]

  const filteredCatalog =
    selectedChartType === 'all'
      ? chartCatalog
      : chartCatalog.filter((c) => c.id === selectedChartType)

  return (
    <div className="space-y-6">
      {/* Selector de tipo de gráfico */}
      <div className="flex flex-wrap items-center gap-2 pb-2">
        <button
          type="button"
          onClick={() => setSelectedChartType('all')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            selectedChartType === 'all'
              ? 'bg-blue-600 text-white shadow-xs'
              : isDark
              ? 'bg-slate-800 text-slate-400 hover:text-white'
              : 'bg-slate-100 text-slate-600 hover:text-slate-900'
          }`}
        >
          Ver Todos ({chartCatalog.length})
        </button>

        {chartCatalog.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setSelectedChartType(c.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              selectedChartType === c.id
                ? 'bg-blue-600 text-white shadow-xs'
                : isDark
                ? 'bg-slate-800/80 text-slate-400 hover:text-white'
                : 'bg-slate-100/80 text-slate-600 hover:text-slate-900'
            }`}
          >
            {c.title.split('.')[1]?.trim() || c.title}
          </button>
        ))}
      </div>

      {/* Rejilla de Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredCatalog.map((item) => (
          <div
            key={item.id}
            className={`rounded-2xl border p-5 sm:p-6 transition-all ${
              isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
            }`}
          >
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white tracking-tight">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {item.desc}
                </p>
              </div>

              {/* Botón Copiar Código */}
              <button
                type="button"
                onClick={() => copySnippet(item.id, item.snippet)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  copiedKey === item.id
                    ? 'bg-emerald-500 text-white border-emerald-600'
                    : isDark
                    ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                    : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                }`}
                title="Copiar código de integración para tu proyecto"
              >
                {copiedKey === item.id ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Copiado</span>
                  </>
                ) : (
                  <>
                    <Code2 className="w-3.5 h-3.5 text-blue-500" />
                    <span>Copiar JSX</span>
                  </>
                )}
              </button>
            </div>

            {/* Contenedor del Gráfico */}
            <div className="w-full pt-2" style={{ minHeight: '280px' }}>
              {item.component}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
