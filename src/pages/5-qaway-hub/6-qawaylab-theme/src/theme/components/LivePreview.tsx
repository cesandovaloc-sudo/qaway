import React, { useState } from 'react'
import {
  Globe,
  LayoutDashboard,
  Component,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Monitor,
  Tablet,
  Smartphone,
  Lock,
} from 'lucide-react'
import type { ThemeTokens } from '../types'
import { generateTonalScale } from '../utils/colorUtils'

interface LivePreviewProps {
  theme: ThemeTokens
}

type PreviewTab = 'web' | 'dashboard' | 'ui'
type ViewportSize = 'desktop' | 'tablet' | 'mobile'

export function LivePreview({ theme }: LivePreviewProps) {
  const [activeTab, setActiveTab] = useState<PreviewTab>('web')
  const [viewport, setViewport] = useState<ViewportSize>('desktop')
  const [chartDataset, setChartDataset] = useState<'finance' | 'inventory'>('finance')

  const radius = `${theme.radius}px`
  const btnRadius = theme.buttonStyle === 'pill' ? '999px' : radius
  const btnBorder = theme.buttonStyle === 'outline' ? `2px solid ${theme.accent}` : 'none'
  const btnBg = theme.buttonStyle === 'outline' ? 'transparent' : theme.accent
  const btnColor = theme.buttonStyle === 'outline' ? theme.accent : '#ffffff'

  const gradientCss = theme.gradient.via
    ? `linear-gradient(${theme.gradient.angle}deg, ${theme.gradient.from}, ${theme.gradient.via}, ${theme.gradient.to})`
    : `linear-gradient(${theme.gradient.angle}deg, ${theme.gradient.from}, ${theme.gradient.to})`

  const tonal = generateTonalScale(theme.accent)

  // Datos para el gráfico de cascada (Waterfall)
  const financeWaterfall = [
    { label: 'Ingresos', value: '+$142k', base: 0, height: 100, color: theme.accent },
    { label: 'Suscripciones', value: '+$58k', base: 100, height: 40, color: tonal['400'] },
    { label: 'Costos Infra', value: '-$34k', base: 106, height: 34, color: '#ef4444' },
    { label: 'Operaciones', value: '-$28k', base: 78, height: 28, color: '#f59e0b' },
    { label: 'Impuestos', value: '-$18k', base: 60, height: 18, color: '#64748b' },
    { label: 'EBITDA Neto', value: '$120k', base: 0, height: 84, color: theme.accentDark || tonal['700'] },
  ]

  const inventoryWaterfall = [
    { label: 'Stock Inicial', value: '850 u', base: 0, height: 90, color: theme.accent },
    { label: 'Entradas', value: '+320 u', base: 90, height: 34, color: tonal['400'] },
    { label: 'Despachos', value: '-540 u', base: 66, height: 58, color: '#ef4444' },
    { label: 'Mermas', value: '-24 u', base: 64, height: 12, color: '#f59e0b' },
    { label: 'Stock Final', value: '606 u', base: 0, height: 64, color: theme.accentDark || tonal['700'] },
  ]

  const activeWaterfall = chartDataset === 'finance' ? financeWaterfall : inventoryWaterfall

  const viewportWidthClass =
    viewport === 'mobile' ? 'max-w-[390px] mx-auto' : viewport === 'tablet' ? 'max-w-[768px] mx-auto' : 'w-full'

  return (
    <div className="space-y-3">
      {/* Barra de Control de la Vista Previa */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        {/* Pestañas de Vista */}
        <div className="flex bg-slate-200/80 rounded-xl p-1 shadow-inner">
          <button
            type="button"
            onClick={() => setActiveTab('web')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'web'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            Sitio Web
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'dashboard'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            Métricas & Waterfall
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('ui')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'ui'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Component className="w-3.5 h-3.5" />
            Sistema UI
          </button>
        </div>

        {/* Selector de Viewport Responsivo */}
        <div className="flex items-center gap-1 bg-slate-200/80 rounded-xl p-1 shadow-inner">
          <button
            type="button"
            onClick={() => setViewport('desktop')}
            className={`p-1.5 rounded-lg text-xs transition-all ${
              viewport === 'desktop' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
            title="Escritorio (100%)"
          >
            <Monitor className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setViewport('tablet')}
            className={`p-1.5 rounded-lg text-xs transition-all ${
              viewport === 'tablet' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
            title="Tablet (768px)"
          >
            <Tablet className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setViewport('mobile')}
            className={`p-1.5 rounded-lg text-xs transition-all ${
              viewport === 'mobile' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
            title="Móvil (390px)"
          >
            <Smartphone className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Mockup de Navegador Premium */}
      <div
        className={`rounded-2xl border border-slate-300/80 overflow-hidden shadow-[0_12px_40px_rgba(0,0,0,0.08)] transition-all duration-300 ${viewportWidthClass}`}
        style={{
          backgroundColor: theme.background,
          color: theme.ink,
          fontFamily: theme.fontBody,
        }}
      >
        {/* Barra superior de ventana de navegador */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-slate-100/90 border-b border-slate-200 text-slate-600 text-xs select-none">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-400 border border-rose-500/30" />
            <span className="w-3 h-3 rounded-full bg-amber-400 border border-amber-500/30" />
            <span className="w-3 h-3 rounded-full bg-emerald-400 border border-emerald-500/30" />
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 bg-white rounded-md border border-slate-200 text-[11px] font-mono text-slate-500 w-64 justify-center shadow-2xs">
            <Lock className="w-2.5 h-2.5 text-emerald-600" />
            <span>atelier.qawaylab.com</span>
          </div>

          <span className="text-[10px] font-mono text-slate-400">LIVE PREVIEW</span>
        </div>

        {/* ========================================================= */}
        {/* MODO 1: SITIO WEB / LANDING PRO                           */}
        {/* ========================================================= */}
        {activeTab === 'web' && (
          <div className="space-y-6">
            {/* Header del Sitio */}
            <div
              className="flex items-center justify-between px-6 py-4 border-b"
              style={{ borderColor: `${theme.ink}15` }}
            >
              <div className="flex items-center gap-2.5">
                <span
                  className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs text-white shadow-xs"
                  style={{ backgroundColor: theme.accent }}
                >
                  Q
                </span>
                <span style={{ fontFamily: theme.fontDisplay, fontWeight: 700, fontSize: '1.05rem' }}>
                  Atelier Digital
                </span>
              </div>
              <div className="hidden sm:flex gap-6 text-xs font-medium" style={{ color: theme.muted }}>
                <span>Plataforma</span>
                <span>Servicios</span>
                <span>Proyectos</span>
              </div>
              <button
                type="button"
                className="px-4 py-2 text-xs font-bold shadow-xs transition-transform active:scale-95 cursor-pointer"
                style={{
                  backgroundColor: btnBg,
                  color: btnColor,
                  borderRadius: btnRadius,
                  border: btnBorder,
                }}
              >
                Solicitar Acceso
              </button>
            </div>

            {/* Hero Principal */}
            <div className="px-6 py-10 relative overflow-hidden">
              <div
                className="absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl opacity-20 pointer-events-none"
                style={{ backgroundImage: gradientCss }}
              />

              <h1
                className="font-bold tracking-tight leading-[1.08] max-w-xl"
                style={{
                  fontFamily: theme.fontDisplay,
                  fontSize: theme.headingSize,
                  color: theme.ink,
                }}
              >
                Precisión visual y consistencia de marca en cada pantalla
              </h1>

              <p
                className="mt-4 text-sm max-w-lg leading-relaxed"
                style={{ color: theme.muted, fontSize: theme.bodySize }}
              >
                Diseñado para marcas que exigen rigor tipográfico, contraste accesible y tokens universales sin intermediarios.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <button
                  type="button"
                  className="px-6 py-3 text-xs font-bold shadow-md transition-transform active:scale-95 flex items-center gap-2 cursor-pointer"
                  style={{
                    backgroundColor: btnBg,
                    color: btnColor,
                    borderRadius: btnRadius,
                    border: btnBorder,
                  }}
                >
                  Iniciar Proyecto <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  className="px-6 py-3 text-xs font-bold border transition-transform active:scale-95 cursor-pointer"
                  style={{
                    borderRadius: btnRadius,
                    borderColor: `${theme.ink}25`,
                    color: theme.ink,
                  }}
                >
                  Ver Especificaciones
                </button>
              </div>
            </div>

            {/* Showcase Grid */}
            <div className="px-6 pb-10 grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              {[
                { title: 'Arquitectura de Tokens', desc: 'Sincronización bidireccional entre CSS :root, Tailwind v4 y JSON.' },
                { title: 'Cumplimiento WCAG 2.1', desc: 'Auditoría en tiempo real para ratios AA y AAA con recomendación de contraste.' },
                { title: 'Desacople Universal', desc: 'Módulo embebible listo para integrarse en cualquier panel administrativo.' },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="p-5 border transition-all hover:translate-y-[-2px]"
                  style={{
                    backgroundColor: theme.surface,
                    borderColor: `${theme.ink}15`,
                    borderRadius: radius,
                  }}
                >
                  <h3
                    className="text-xs font-bold mb-1.5"
                    style={{ fontFamily: theme.fontDisplay, color: theme.ink }}
                  >
                    {item.title}
                  </h3>
                  <p className="text-[11px] leading-relaxed" style={{ color: theme.muted }}>
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* MODO 2: DASHBOARD & MÉTRICAS (Waterfall Pro)              */}
        {/* ========================================================= */}
        {activeTab === 'dashboard' && (
          <div className="p-6 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b" style={{ borderColor: `${theme.ink}15` }}>
              <div>
                <h2 className="text-sm font-bold tracking-tight" style={{ fontFamily: theme.fontDisplay }}>
                  Analítica Operativa y Flujo Acumulativo
                </h2>
                <p className="text-[11px]" style={{ color: theme.muted }}>
                  Visualización de datos con los tokens del tema
                </p>
              </div>

              <div className="flex items-center gap-1 bg-black/5 p-1 rounded-lg border border-black/10">
                <button
                  type="button"
                  onClick={() => setChartDataset('finance')}
                  className={`text-[10px] font-bold px-2.5 py-1 rounded-md transition-all ${
                    chartDataset === 'finance' ? 'bg-white shadow-2xs text-slate-900' : 'text-slate-500'
                  }`}
                >
                  Financiero (P&L)
                </button>
                <button
                  type="button"
                  onClick={() => setChartDataset('inventory')}
                  className={`text-[10px] font-bold px-2.5 py-1 rounded-md transition-all ${
                    chartDataset === 'inventory' ? 'bg-white shadow-2xs text-slate-900' : 'text-slate-500'
                  }`}
                >
                  Stock / Operaciones
                </button>
              </div>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              {[
                { label: 'Volumen Bruto', value: '$200,000', change: '+24.6%', up: true },
                { label: 'Deducciones', value: '$80,000', change: '-4.8%', up: false },
                { label: 'Margen EBITDA', value: '60.0%', change: '+9.2%', up: true },
              ].map((kpi, i) => (
                <div
                  key={i}
                  className="p-4 border"
                  style={{
                    backgroundColor: theme.surface,
                    borderColor: `${theme.ink}12`,
                    borderRadius: radius,
                  }}
                >
                  <span className="text-[10px] font-bold tracking-wider uppercase opacity-75" style={{ color: theme.muted }}>
                    {kpi.label}
                  </span>
                  <div className="flex items-baseline justify-between mt-1">
                    <span className="text-xl font-bold" style={{ fontFamily: theme.fontDisplay }}>
                      {kpi.value}
                    </span>
                    <span
                      className={`text-[10px] font-bold flex items-center gap-0.5 ${
                        kpi.up ? 'text-emerald-600' : 'text-rose-500'
                      }`}
                    >
                      {kpi.up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {kpi.change}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Gráfico Waterfall */}
            <div
              className="p-5 border space-y-4"
              style={{
                backgroundColor: theme.surface,
                borderColor: `${theme.ink}12`,
                borderRadius: radius,
              }}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold" style={{ fontFamily: theme.fontDisplay }}>
                  {chartDataset === 'finance'
                    ? 'Cascada Financiera (Ingresos → Costos → Margen)'
                    : 'Balance de Stock (Ingresos → Mermas → Disponible)'}
                </span>
                <div className="flex items-center gap-3 text-[10px] font-medium" style={{ color: theme.muted }}>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: theme.accent }} /> Incremento
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-rose-500" /> Deducción
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: theme.accentDark || tonal['700'] }} /> Total
                  </span>
                </div>
              </div>

              {/* Barras Waterfall */}
              <div className="h-44 flex items-end justify-between gap-3 pt-6 pb-2 px-2 border-b relative" style={{ borderColor: `${theme.ink}15` }}>
                {activeWaterfall.map((bar, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center justify-end h-full relative group">
                    <span className="text-[9px] font-mono font-bold mb-1 opacity-90 group-hover:scale-105 transition-transform">
                      {bar.value}
                    </span>
                    <div className="w-full relative h-full flex flex-col justify-end">
                      <div
                        className="w-full rounded-md shadow-xs transition-all duration-300 group-hover:brightness-110"
                        style={{
                          height: `${bar.height}%`,
                          marginBottom: `${bar.base}%`,
                          backgroundColor: bar.color,
                        }}
                      />
                    </div>
                    <span className="text-[9px] font-semibold truncate w-full text-center mt-2" style={{ color: theme.muted }}>
                      {bar.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* MODO 3: SISTEMA UI & COMPONENTES                          */}
        {/* ========================================================= */}
        {activeTab === 'ui' && (
          <div className="p-6 space-y-6">
            <div className="space-y-3">
              <span className="text-xs font-bold block" style={{ fontFamily: theme.fontDisplay }}>
                Controles de Acción
              </span>
              <div className="flex flex-wrap gap-3 items-center">
                <button
                  type="button"
                  className="px-5 py-2.5 text-xs font-bold shadow-xs transition-transform active:scale-95"
                  style={{
                    backgroundColor: theme.accent,
                    color: '#ffffff',
                    borderRadius: btnRadius,
                  }}
                >
                  Botón Primario
                </button>
                <button
                  type="button"
                  className="px-5 py-2.5 text-xs font-bold border transition-transform active:scale-95"
                  style={{
                    borderColor: theme.accent,
                    color: theme.accent,
                    borderRadius: btnRadius,
                    backgroundColor: 'transparent',
                  }}
                >
                  Botón Secundario
                </button>
                <button
                  type="button"
                  className="px-5 py-2.5 text-xs font-bold transition-transform active:scale-95"
                  style={{
                    backgroundColor: `${theme.accent}15`,
                    color: theme.accent,
                    borderRadius: btnRadius,
                  }}
                >
                  Botón Terciario
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <span className="text-xs font-bold block" style={{ fontFamily: theme.fontDisplay }}>
                Superficie de Formulario
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="text-[11px] font-semibold mb-1.5 block" style={{ color: theme.muted }}>
                    Identificador de Cuenta
                  </label>
                  <input
                    type="text"
                    defaultValue="corporativo@qawaylab.com"
                    className="w-full border px-3 py-2 text-xs focus:outline-none"
                    style={{
                      backgroundColor: theme.surface,
                      borderColor: `${theme.ink}20`,
                      borderRadius: radius,
                      color: theme.ink,
                    }}
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold mb-1.5 block" style={{ color: theme.muted }}>
                    Entorno de Ejecución
                  </label>
                  <select
                    className="w-full border px-3 py-2 text-xs focus:outline-none"
                    style={{
                      backgroundColor: theme.surface,
                      borderColor: `${theme.ink}20`,
                      borderRadius: radius,
                      color: theme.ink,
                    }}
                  >
                    <option>Producción (Cluster Principal)</option>
                    <option>Staging (Validación)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
