import React from 'react'
import { CheckCircle2, XCircle, Sparkles } from 'lucide-react'
import { getAccessibilityAudit } from '../utils/colorUtils'
import type { ThemeTokens } from '../types'

interface ContrastCanvasProps {
  theme: ThemeTokens
  onApplyTextColor: (color: string) => void
}

export function ContrastCanvas({ theme, onApplyTextColor }: ContrastCanvasProps) {
  const auditVsWhite = getAccessibilityAudit(theme.accent, '#ffffff')
  const auditVsDark = getAccessibilityAudit(theme.accent, '#0f172a')
  const auditVsCurrentBg = getAccessibilityAudit(theme.accent, theme.background)

  return (
    <div className="space-y-6">
      {/* Tarjetas de Auditoría Principal */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Contraste vs Fondo Blanco */}
        <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Sobre Blanco (#FFF)</span>
            <span className="text-2xl font-black font-mono text-slate-900">{auditVsWhite.ratioVsWhite}:1</span>
          </div>

          <div
            className="p-4 rounded-xl border border-slate-200 text-center font-bold text-sm"
            style={{ backgroundColor: '#ffffff', color: theme.accent }}
          >
            Texto de Muestra en Color Acento
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
            <div className="flex items-center gap-1.5">
              {auditVsWhite.passAANormalWhite ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <XCircle className="w-4 h-4 text-rose-500" />}
              <span className={auditVsWhite.passAANormalWhite ? 'text-emerald-700 font-bold' : 'text-rose-600'}>AA Normal</span>
            </div>
            <div className="flex items-center gap-1.5">
              {auditVsWhite.passAAANormalWhite ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <XCircle className="w-4 h-4 text-rose-500" />}
              <span className={auditVsWhite.passAAANormalWhite ? 'text-emerald-700 font-bold' : 'text-rose-600'}>AAA Normal</span>
            </div>
          </div>
        </div>

        {/* Contraste vs Fondo Oscuro */}
        <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Sobre Carbón (#0F172A)</span>
            <span className="text-2xl font-black font-mono text-slate-900">{auditVsDark.ratioVsDark}:1</span>
          </div>

          <div
            className="p-4 rounded-xl border border-slate-800 text-center font-bold text-sm"
            style={{ backgroundColor: '#0f172a', color: theme.accent }}
          >
            Texto de Muestra en Color Acento
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
            <div className="flex items-center gap-1.5">
              {auditVsDark.passAANormalDark ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <XCircle className="w-4 h-4 text-rose-500" />}
              <span className={auditVsDark.passAANormalDark ? 'text-emerald-700 font-bold' : 'text-rose-600'}>AA Normal</span>
            </div>
            <div className="flex items-center gap-1.5">
              {auditVsDark.passAAANormalDark ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <XCircle className="w-4 h-4 text-rose-500" />}
              <span className={auditVsDark.passAAANormalDark ? 'text-emerald-700 font-bold' : 'text-rose-600'}>AAA Normal</span>
            </div>
          </div>
        </div>

        {/* Contraste vs Fondo del Tema */}
        <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Fondo Actual ({theme.background})</span>
            <span className="text-2xl font-black font-mono text-slate-900">{auditVsCurrentBg.ratioVsBg}:1</span>
          </div>

          <div
            className="p-4 rounded-xl border text-center font-bold text-sm shadow-inner"
            style={{ backgroundColor: theme.background, color: theme.accent, borderColor: `${theme.ink}20` }}
          >
            Texto sobre Fondo del Tema
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <span className="text-xs text-slate-500">Texto sugerido:</span>
            <button
              type="button"
              onClick={() => onApplyTextColor(auditVsCurrentBg.recommendedTextColor)}
              className="text-xs font-bold text-slate-900 hover:underline flex items-center gap-1"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Aplicar {auditVsCurrentBg.recommendedTextColor === '#ffffff' ? 'Blanco' : 'Oscuro'}
            </button>
          </div>
        </div>
      </div>

      {/* Laboratorio Visual de Legibilidad Tipográfica */}
      <div className="p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6" style={{ backgroundColor: theme.background, color: theme.ink }}>
        <div className="flex items-center justify-between pb-4 border-b" style={{ borderColor: `${theme.ink}15` }}>
          <div>
            <h2 className="text-xl font-bold tracking-tight" style={{ fontFamily: theme.fontDisplay }}>
              Laboratorio de Legibilidad Tipográfica
            </h2>
            <p className="text-xs mt-1" style={{ color: theme.muted }}>
              Comprueba cómo interactúan la jerarquía de títulos, textos y botones en el entorno real.
            </p>
          </div>
          <span
            className="px-3 py-1 rounded-full text-xs font-bold font-mono"
            style={{ backgroundColor: `${theme.accent}20`, color: theme.accent }}
          >
            WCAG 2.1 Evaluated
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h3 className="text-2xl font-black tracking-tight" style={{ fontFamily: theme.fontDisplay, color: theme.ink }}>
              Titulares de Alto Impacto
            </h3>
            <p className="text-sm leading-relaxed" style={{ color: theme.muted }}>
              El contraste entre el color de fondo y el color de tinta garantiza que la lectura sea fluida y confortable en cualquier dispositivo o condición de luz.
            </p>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                className="px-5 py-2.5 rounded-xl font-bold text-xs shadow-md"
                style={{ backgroundColor: theme.accent, color: auditVsCurrentBg.recommendedTextColor }}
              >
                Acción Principal
              </button>
              <button
                type="button"
                className="px-5 py-2.5 rounded-xl font-bold text-xs border"
                style={{ borderColor: `${theme.ink}25`, color: theme.ink }}
              >
                Acción Secundaria
              </button>
            </div>
          </div>

          <div
            className="p-6 rounded-2xl border space-y-3"
            style={{ backgroundColor: theme.surface, borderColor: `${theme.ink}12` }}
          >
            <span className="text-xs font-bold uppercase tracking-wider" style={{ color: theme.accent }}>
              Tarjeta de Superficie Elevada
            </span>
            <p className="text-base font-bold" style={{ fontFamily: theme.fontDisplay }}>
              Verificación de Superficies Intermedias
            </p>
            <p className="text-xs leading-relaxed" style={{ color: theme.muted }}>
              Las superficies intermedias (tarjetas, modales y barras de navegación) deben mantener un contraste nítido tanto con el fondo base como con los textos y botones.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
