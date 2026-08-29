import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BarChart3,
  UtensilsCrossed,
  HeartPulse,
  Landmark,
  Layers,
  Sparkles,
  Palette,
  Calendar,
  Download,
  Code2,
  Check,
  ChevronRight,
  ExternalLink,
  Zap,
  TrendingUp,
  Cpu,
  ArrowRight
} from 'lucide-react'
import { Link } from 'react-router-dom'
import SEO from '@/components/seo/SEO'
import PaletteSelector from '@/components/analytics/ui/PaletteSelector'
import DateRangeFilter from '@/components/analytics/ui/DateRangeFilter'
import GastronomiaDashboard from '@/components/analytics/presets/GastronomiaDashboard'
import VeterinariaDashboard from '@/components/analytics/presets/VeterinariaDashboard'
import FinancieraDashboard from '@/components/analytics/presets/FinancieraDashboard'
import RechartsGallery from '@/components/analytics/gallery/RechartsGallery'
import { ANALYTICS_PALETTES } from '@/components/analytics/theme'

export default function AnalyticsStudioPage() {
  const [activeTab, setActiveTab] = useState('gastronomia') // 'gastronomia' | 'veterinaria' | 'financiera' | 'gallery' | 'integracion'
  const [selectedPalette, setSelectedPalette] = useState(ANALYTICS_PALETTES[0])
  const [timeRange, setTimeRange] = useState('30d')
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [copiedCode, setCopiedCode] = useState(false)

  const tabs = [
    { id: 'gastronomia', label: 'Hamburguesería / Gastronomía', icon: UtensilsCrossed, badge: 'Preset' },
    { id: 'veterinaria', label: 'Veterinaria / Clínica', icon: HeartPulse, badge: 'Preset' },
    { id: 'financiera', label: 'Financiera / Fintech', icon: Landmark, badge: 'Preset' },
    { id: 'gallery', label: 'Galería Recharts Completa', icon: Layers, badge: '10 Tipos' },
    { id: 'integracion', label: 'Cómo Integrar en tus Paneles', icon: Code2, badge: 'Modular' }
  ]

  const currentTheme = isDarkMode ? 'dark' : 'light'

  const handleCopyIntegration = () => {
    const code = `// 1. Importa cualquier gráfico directamente en tu CRM, Blog Editor o Landing:
import AreaChartPro from '@/components/analytics/charts/AreaChartPro'
import KpiCard from '@/components/analytics/ui/KpiCard'

// 2. Renderiza tu métrica con estética PowerBI:
<KpiCard
  title="Ventas Netas"
  value={48500}
  formattedValue="S/ 48,500"
  change={14.2}
  sparklineData={[32000, 36000, 42000, 48500]}
/>

// 3. Renderiza tu gráfico Recharts autónomo:
<AreaChartPro
  data={data}
  series={[{ key: 'ingresos', name: 'Ingresos 2026', color: '#ff4b0b' }]}
  valueFormatter={(v) => \`S/ \${v.toLocaleString()}\`}
/>`
    navigator.clipboard.writeText(code)
    setCopiedCode(true)
    setTimeout(() => setCopiedCode(false), 2500)
  }

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        isDarkMode ? 'bg-[#0b0f19] text-white' : 'bg-[#f8fafc] text-slate-900'
      }`}
    >
      <SEO
        title="Analytics & Metrics Studio | Qaway Hub"
        description="Paquete completo de métricas, gráficos Recharts y dashboards estilo PowerBI y Google Analytics para diversas industrias."
      />

      {/* Header Superior del Studio */}
      <header
        className={`border-b sticky top-0 z-40 backdrop-blur-xl transition-colors ${
          isDarkMode
            ? 'bg-[#0b0f19]/90 border-slate-800'
            : 'bg-white/90 border-slate-200 shadow-2xs'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Link
                  to="/hub"
                  className={`text-xs font-semibold hover:underline ${
                    isDarkMode ? 'text-slate-400' : 'text-slate-500'
                  }`}
                >
                  Qaway Hub
                </Link>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-xs font-bold text-blue-500 uppercase tracking-wider">
                  Analytics & Charts Studio
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1 flex items-center gap-2.5">
                <BarChart3 className="w-7 h-7 text-[#ff4b0b]" />
                Centro de Métricas & Gráficos
              </h1>
              <p className={`text-xs sm:text-sm mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                Dashboards inteligentes estilo PowerBI / Google Analytics 4 con Recharts y presets por industria.
              </p>
            </div>

            {/* Barra de Controles Globales (Paleta, Fechas, Dark Mode) */}
            <div className="flex flex-wrap items-center gap-2.5">
              <PaletteSelector
                selectedPalette={selectedPalette}
                onSelectPalette={setSelectedPalette}
                theme={currentTheme}
              />

              <DateRangeFilter
                selectedRange={timeRange}
                onChangeRange={setTimeRange}
                theme={currentTheme}
              />

              <button
                type="button"
                onClick={() => setIsDarkMode(!isDarkMode)}
                className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  isDarkMode
                    ? 'bg-slate-800 border-slate-700 text-yellow-400 hover:bg-slate-700'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-2xs'
                }`}
                title="Alternar Modo Oscuro / Claro"
              >
                {isDarkMode ? '🌙 Dark' : '☀️ Light'}
              </button>
            </div>
          </div>

          {/* Navegación por Pestañas / Presets */}
          <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto pt-5 border-t border-slate-700/20 mt-4 no-scrollbar">
            {tabs.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                      : isDarkMode
                      ? 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-md font-semibold ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : isDarkMode
                          ? 'bg-slate-800 text-slate-400'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </header>

      {/* Contenido Principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          {activeTab === 'gastronomia' && (
            <motion.div
              key="gastronomia"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <div className="mb-4">
                <span className="text-xs font-bold text-orange-500 uppercase tracking-widest">
                  Preset de Industria
                </span>
                <h2 className="text-xl font-bold tracking-tight">
                  🍔 Dashboard Operativo & Comercial: Hamburguesería & Restaurantes
                </h2>
                <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  Métricas clave de Food Cost %, curva de demanda por franjas horarias, rotación y canales de delivery.
                </p>
              </div>
              <GastronomiaDashboard theme={currentTheme} palette={selectedPalette} />
            </motion.div>
          )}

          {activeTab === 'veterinaria' && (
            <motion.div
              key="veterinaria"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <div className="mb-4">
                <span className="text-xs font-bold text-emerald-500 uppercase tracking-widest">
                  Preset de Industria
                </span>
                <h2 className="text-xl font-bold tracking-tight">
                  🐾 Dashboard Clínico & Quirúrgico: Veterinaria & Salud de Mascotas
                </h2>
                <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  Monitoreo de citas programadas vs urgencias, cobertura de planes preventivos y facturación por especialidad.
                </p>
              </div>
              <VeterinariaDashboard theme={currentTheme} palette={selectedPalette} />
            </motion.div>
          )}

          {activeTab === 'financiera' && (
            <motion.div
              key="financiera"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <div className="mb-4">
                <span className="text-xs font-bold text-blue-500 uppercase tracking-widest">
                  Preset de Industria
                </span>
                <h2 className="text-xl font-bold tracking-tight">
                  💼 Dashboard Ejecutivo: Financiera, Fintech & Colocación Crediticia
                </h2>
                <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  Control de cartera activa, tasa de morosidad PAR30, scoring radar de riesgo y amortizaciones.
                </p>
              </div>
              <FinancieraDashboard theme={currentTheme} palette={selectedPalette} />
            </motion.div>
          )}

          {activeTab === 'gallery' && (
            <motion.div
              key="gallery"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <div className="mb-4">
                <span className="text-xs font-bold text-purple-500 uppercase tracking-widest">
                  Librería Desacoplada
                </span>
                <h2 className="text-xl font-bold tracking-tight">
                  📊 Galería Completa de Recharts (10 Tipos de Gráficos)
                </h2>
                <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  Sin marcas de agua, 100% interactivos y listos para copiar con un solo clic.
                </p>
              </div>
              <RechartsGallery theme={currentTheme} palette={selectedPalette} />
            </motion.div>
          )}

          {activeTab === 'integracion' && (
            <motion.div
              key="integracion"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <div className="mb-4">
                <span className="text-xs font-bold text-emerald-500 uppercase tracking-widest">
                  Arquitectura Modular
                </span>
                <h2 className="text-xl font-bold tracking-tight">
                  ⚡ Cómo Usar e Integrar este Módulo en Cualquier Proyecto
                </h2>
                <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  Todos los componentes son agnósticos y pueden ser importados en tu CRM, Editor de Blog o Landing Page.
                </p>
              </div>

              {/* Caja de Snippet de Código */}
              <div
                className={`rounded-2xl border p-6 ${
                  isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono text-xs font-bold text-blue-500">
                    // Ejemplo de Integración Rápida
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyIntegration}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors cursor-pointer"
                  >
                    {copiedCode ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>¡Código Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Code2 className="w-3.5 h-3.5" />
                        <span>Copiar Código</span>
                      </>
                    )}
                  </button>
                </div>

                <pre
                  className={`p-4 rounded-xl font-mono text-xs overflow-x-auto leading-relaxed ${
                    isDarkMode ? 'bg-slate-950 text-slate-200' : 'bg-slate-100 text-slate-800'
                  }`}
                >
{`// 1. Importa los componentes que necesites
import AreaChartPro from '@/components/analytics/charts/AreaChartPro'
import KpiCard from '@/components/analytics/ui/KpiCard'
import ChartCard from '@/components/analytics/ui/ChartCard'

// 2. Renderiza tu tarjeta de métricas con sparkline estilo PowerBI
<KpiCard
  title="Ventas Netas"
  value={48500}
  formattedValue="S/ 48,500"
  change={14.8}
  sparklineData={[32000, 36000, 42000, 48500]}
/>

// 3. Renderiza tu gráfico Recharts interactivo
<ChartCard title="Evolución de Demanda" data={data}>
  <AreaChartPro
    data={data}
    xAxisKey="hora"
    series={[{ key: 'ventas', name: 'Ventas', color: '#ff4b0b' }]}
  />
</ChartCard>`}
                </pre>
              </div>

              {/* Lista de Paneles Compatibles */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div
                  className={`p-5 rounded-2xl border ${
                    isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
                  }`}
                >
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                    1. Consola CRM Comercial
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Embudos de conversión de leads, atribución de anuncios y rendimiento de asesores en WhatsApp.
                  </p>
                  <Link
                    to="/hub/crm"
                    className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-blue-500 hover:underline"
                  >
                    Ver CRM <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>

                <div
                  className={`p-5 rounded-2xl border ${
                    isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
                  }`}
                >
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                    2. Editor de Blog
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Gráficos de lectura diaria, leads captados por artículo y tasa de scroll en artículos editoriales.
                  </p>
                  <Link
                    to="/hub/blog-editor"
                    className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-blue-500 hover:underline"
                  >
                    Ver Blog Editor <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>

                <div
                  className={`p-5 rounded-2xl border ${
                    isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
                  }`}
                >
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                    3. Gestor de Proyectos & Portales
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Trazabilidad de hitos, tiempos de entrega y scores Lighthouse de proyectos web.
                  </p>
                  <Link
                    to="/hub/gestor-proyectos"
                    className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-blue-500 hover:underline"
                  >
                    Ver Gestor <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}
