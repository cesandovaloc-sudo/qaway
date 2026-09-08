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
import { BRAND_PRESETS } from '../data/brandPresets'

interface BrandSimulatorCanvasProps {
  theme: ThemeTokens
  activePresetId?: string
}

type PreviewTab = 'web' | 'dashboard' | 'ui'
type ViewportSize = 'desktop' | 'tablet' | 'mobile'

export function BrandSimulatorCanvas({ theme, activePresetId = 'qaway-official' }: BrandSimulatorCanvasProps) {
  const [activeTab, setActiveTab] = useState<PreviewTab>('web')
  const [viewport, setViewport] = useState<ViewportSize>('desktop')

  // Encontrar el contenido del arquetipo activo o fallback a Qaway
  const activePreset = BRAND_PRESETS.find((p) => p.id === activePresetId) || BRAND_PRESETS[0]
  const content = activePreset.content

  const radius = `${theme.radius}px`
  const btnRadius = theme.buttonStyle === 'pill' ? '999px' : radius
  const btnBorder = theme.buttonStyle === 'outline' ? `2px solid ${theme.accent}` : 'none'
  const btnBg = theme.buttonStyle === 'outline' ? 'transparent' : theme.accent
  const btnColor = theme.buttonStyle === 'outline' ? theme.accent : '#ffffff'

  const gradientCss = theme.gradient.via
    ? `linear-gradient(${theme.gradient.angle}deg, ${theme.gradient.from}, ${theme.gradient.via}, ${theme.gradient.to})`
    : `linear-gradient(${theme.gradient.angle}deg, ${theme.gradient.from}, ${theme.gradient.to})`

  const viewportWidthClass =
    viewport === 'mobile' ? 'max-w-[390px] mx-auto' : viewport === 'tablet' ? 'max-w-[768px] mx-auto' : 'w-full'

  return (
    <div className="space-y-4">
      {/* Barra de Control de la Simulación */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-2 bg-white rounded-2xl border border-slate-200 shadow-xs">
        {/* Modos de Simulación */}
        <div className="flex bg-slate-100 rounded-xl p-1 border border-slate-200">
          <button
            type="button"
            onClick={() => setActiveTab('web')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'web' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            Sitio Web Oficial
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'dashboard' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            Panel de Métricas & Waterfall
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('ui')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'ui' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Component className="w-3.5 h-3.5" />
            Kit de Controles
          </button>
        </div>

        {/* Selector de Viewport */}
        <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1 border border-slate-200">
          <button
            type="button"
            onClick={() => setViewport('desktop')}
            className={`p-1.5 rounded-lg text-xs transition-all cursor-pointer ${
              viewport === 'desktop' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
            title="Escritorio"
          >
            <Monitor className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setViewport('tablet')}
            className={`p-1.5 rounded-lg text-xs transition-all cursor-pointer ${
              viewport === 'tablet' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
            title="Tablet"
          >
            <Tablet className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setViewport('mobile')}
            className={`p-1.5 rounded-lg text-xs transition-all cursor-pointer ${
              viewport === 'mobile' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
            title="Smartphone"
          >
            <Smartphone className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Frame de Navegador Realista */}
      <div
        className={`rounded-3xl border border-slate-300 overflow-hidden shadow-2xl transition-all duration-300 ${viewportWidthClass}`}
        style={{
          backgroundColor: theme.background,
          color: theme.ink,
          fontFamily: theme.fontBody,
        }}
      >
        {/* Barra superior de navegador */}
        <div className="flex items-center justify-between px-5 py-3 bg-slate-100/90 border-b border-slate-200 text-slate-600 text-xs select-none">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-400 border border-rose-500/20" />
            <span className="w-3 h-3 rounded-full bg-amber-400 border border-amber-500/20" />
            <span className="w-3 h-3 rounded-full bg-emerald-400 border border-emerald-500/20" />
          </div>

          <div className="flex items-center gap-1.5 px-4 py-1 bg-white rounded-lg border border-slate-200 text-xs font-mono text-slate-600 w-72 justify-center shadow-2xs">
            <Lock className="w-3 h-3 text-emerald-600" />
            <span>https://{activePreset.id}.qawaylab.com</span>
          </div>

          <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">
            {activePreset.name}
          </span>
        </div>

        {/* ========================================================= */}
        {/* MODO 1: SITIO WEB OFICIAL (Contenido Real de Negocio)    */}
        {/* ========================================================= */}
        {activeTab === 'web' && (
          <div className="space-y-8">
            {/* Header del Sitio */}
            <div
              className="flex items-center justify-between px-8 py-5 border-b"
              style={{ borderColor: `${theme.ink}15` }}
            >
              <div className="flex items-center gap-3">
                <span
                  className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm text-white shadow-sm"
                  style={{ backgroundColor: theme.accent }}
                >
                  {content.brandName.charAt(0)}
                </span>
                <div>
                  <span style={{ fontFamily: theme.fontDisplay, fontWeight: 800, fontSize: '1.15rem' }}>
                    {content.brandName}
                  </span>
                  <span className="block text-[10px] opacity-70" style={{ color: theme.muted }}>
                    {content.tagline}
                  </span>
                </div>
              </div>

              <div className="hidden sm:flex gap-6 text-xs font-semibold" style={{ color: theme.muted }}>
                <span>Inicio</span>
                <span>Propuesta</span>
                <span>Clientes</span>
                <span>Contacto</span>
              </div>

              <button
                type="button"
                className="px-4 py-2 text-xs font-bold shadow-sm transition-transform active:scale-95 cursor-pointer"
                style={{
                  backgroundColor: btnBg,
                  color: btnColor,
                  borderRadius: btnRadius,
                  border: btnBorder,
                }}
              >
                {content.ctaPrimary}
              </button>
            </div>

            {/* Hero Principal con Tipografía Protagonista */}
            <div className="px-8 py-10 relative overflow-hidden">
              <div
                className="absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl opacity-20 pointer-events-none"
                style={{ backgroundImage: gradientCss }}
              />

              <span
                className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border inline-block mb-4"
                style={{
                  borderColor: `${theme.accent}40`,
                  backgroundColor: `${theme.accent}12`,
                  color: theme.accent,
                }}
              >
                {content.badgeText}
              </span>

              <h1
                className="font-black tracking-tight leading-[1.06] max-w-2xl text-3xl sm:text-4xl md:text-5xl"
                style={{
                  fontFamily: theme.fontDisplay,
                  fontSize: theme.headingSize,
                  color: theme.ink,
                }}
              >
                {content.heroTitle}
              </h1>

              <p
                className="mt-4 text-sm sm:text-base max-w-xl leading-relaxed"
                style={{ color: theme.muted, fontSize: theme.bodySize }}
              >
                {content.heroDesc}
              </p>

              <div className="mt-8 flex flex-wrap gap-3.5">
                <button
                  type="button"
                  className="px-7 py-3.5 text-xs sm:text-sm font-bold shadow-lg transition-transform active:scale-95 flex items-center gap-2 cursor-pointer"
                  style={{
                    backgroundColor: btnBg,
                    color: btnColor,
                    borderRadius: btnRadius,
                    border: btnBorder,
                  }}
                >
                  {content.ctaPrimary} <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  className="px-7 py-3.5 text-xs sm:text-sm font-bold border transition-transform active:scale-95 cursor-pointer"
                  style={{
                    borderRadius: btnRadius,
                    borderColor: `${theme.ink}25`,
                    color: theme.ink,
                  }}
                >
                  {content.ctaSecondary}
                </button>
              </div>
            </div>

            {/* Grid de Características Reales */}
            <div className="px-8 pb-12 grid grid-cols-1 sm:grid-cols-3 gap-4">
              {content.features.map((item, idx) => (
                <div
                  key={idx}
                  className="p-6 border transition-all hover:translate-y-[-2px] shadow-xs"
                  style={{
                    backgroundColor: theme.surface,
                    borderColor: `${theme.ink}15`,
                    borderRadius: radius,
                  }}
                >
                  <h3
                    className="text-sm font-bold mb-2"
                    style={{ fontFamily: theme.fontDisplay, color: theme.ink }}
                  >
                    {item.title}
                  </h3>
                  <p className="text-xs leading-relaxed" style={{ color: theme.muted }}>
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* MODO 2: DASHBOARD & MÉTRICAS (Waterfall de Negocio)      */}
        {/* ========================================================= */}
        {activeTab === 'dashboard' && (
          <div className="p-8 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b" style={{ borderColor: `${theme.ink}15` }}>
              <div>
                <h2 className="text-base font-bold tracking-tight" style={{ fontFamily: theme.fontDisplay }}>
                  Panel Financiero & Flujo Operativo — {content.brandName}
                </h2>
                <p className="text-xs" style={{ color: theme.muted }}>
                  Visualización analítica estilizada con la identidad activa
                </p>
              </div>

              <span
                className="px-3 py-1 text-xs font-bold rounded-full border"
                style={{
                  backgroundColor: `${theme.accent}15`,
                  borderColor: `${theme.accent}30`,
                  color: theme.accent,
                }}
              >
                Ejercicio en Curso
              </span>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[content.metrics.kpi1, content.metrics.kpi2, content.metrics.kpi3].map((kpi, i) => (
                <div
                  key={i}
                  className="p-5 border shadow-2xs"
                  style={{
                    backgroundColor: theme.surface,
                    borderColor: `${theme.ink}12`,
                    borderRadius: radius,
                  }}
                >
                  <span className="text-xs font-semibold tracking-wider uppercase opacity-75" style={{ color: theme.muted }}>
                    {kpi.label}
                  </span>
                  <div className="flex items-baseline justify-between mt-2">
                    <span className="text-2xl font-black" style={{ fontFamily: theme.fontDisplay }}>
                      {kpi.value}
                    </span>
                    <span
                      className={`text-xs font-bold flex items-center gap-0.5 ${
                        kpi.up ? 'text-emerald-600' : 'text-rose-500'
                      }`}
                    >
                      {kpi.up ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                      {kpi.change}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Gráfico Waterfall */}
            <div
              className="p-6 border space-y-4"
              style={{
                backgroundColor: theme.surface,
                borderColor: `${theme.ink}12`,
                borderRadius: radius,
              }}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold" style={{ fontFamily: theme.fontDisplay }}>
                  Evolución Acumulada (Cascada / Waterfall)
                </span>
                <span className="text-xs font-mono" style={{ color: theme.muted }}>
                  Ingresos → Costos → Utilidad
                </span>
              </div>

              {/* Barras Waterfall */}
              <div className="h-48 flex items-end justify-between gap-3 pt-8 pb-3 px-2 border-b relative" style={{ borderColor: `${theme.ink}15` }}>
                {content.metrics.waterfallData.map((bar, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center justify-end h-full relative group">
                    <span className="text-[10px] font-mono font-bold mb-1 opacity-90 group-hover:scale-105 transition-transform">
                      {bar.value}
                    </span>
                    <div className="w-full relative h-full flex flex-col justify-end">
                      <div
                        className="w-full rounded-md shadow-xs transition-all duration-300 group-hover:brightness-110"
                        style={{
                          height: `${bar.height}%`,
                          marginBottom: `${bar.base}%`,
                          backgroundColor: bar.color || (bar.value.startsWith('-') ? '#ef4444' : theme.accent),
                        }}
                      />
                    </div>
                    <span className="text-[10px] font-semibold truncate w-full text-center mt-2" style={{ color: theme.muted }}>
                      {bar.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* MODO 3: KIT DE CONTROLES (Formularios & Botones)         */}
        {/* ========================================================= */}
        {activeTab === 'ui' && (
          <div className="p-8 space-y-8">
            <div className="space-y-3">
              <span className="text-sm font-bold block" style={{ fontFamily: theme.fontDisplay }}>
                Variantes de Botones
              </span>
              <div className="flex flex-wrap gap-3 items-center">
                <button
                  type="button"
                  className="px-6 py-3 text-xs font-bold shadow-xs transition-transform active:scale-95"
                  style={{
                    backgroundColor: theme.accent,
                    color: '#ffffff',
                    borderRadius: btnRadius,
                  }}
                >
                  Botón Principal
                </button>
                <button
                  type="button"
                  className="px-6 py-3 text-xs font-bold border transition-transform active:scale-95"
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
                  className="px-6 py-3 text-xs font-bold transition-transform active:scale-95"
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
              <span className="text-sm font-bold block" style={{ fontFamily: theme.fontDisplay }}>
                Formulario de Contacto / Registro
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold mb-1.5 block" style={{ color: theme.muted }}>
                    Correo Electrónico
                  </label>
                  <input
                    type="text"
                    defaultValue="contacto@empresa.com"
                    className="w-full border px-3.5 py-2.5 text-xs focus:outline-none"
                    style={{
                      backgroundColor: theme.surface,
                      borderColor: `${theme.ink}20`,
                      borderRadius: radius,
                      color: theme.ink,
                    }}
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold mb-1.5 block" style={{ color: theme.muted }}>
                    Plan Seleccionado
                  </label>
                  <select
                    className="w-full border px-3.5 py-2.5 text-xs focus:outline-none"
                    style={{
                      backgroundColor: theme.surface,
                      borderColor: `${theme.ink}20`,
                      borderRadius: radius,
                      color: theme.ink,
                    }}
                  >
                    <option>Plan Profesional (Mensual)</option>
                    <option>Plan Corporativo (Anual)</option>
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
