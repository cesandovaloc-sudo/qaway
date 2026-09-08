import React, { useState } from 'react'
import { Check, Copy, Sparkles } from 'lucide-react'
import { colord } from 'colord'
import { getHarmonies, getReadableTextColor, generateTonalScale } from '../utils/colorUtils'
import type { ThemeTokens } from '../types'

interface HarmonyCanvasProps {
  theme: ThemeTokens
  onApplyAccent: (color: string) => void
  onApplyBackground: (color: string) => void
}

type HarmonyRule = 'analogous' | 'complementary' | 'triadic' | 'split-complementary' | 'tetradic' | 'custom'

export function HarmonyCanvas({ theme, onApplyAccent, onApplyBackground }: HarmonyCanvasProps) {
  const [activeRule, setActiveRule] = useState<HarmonyRule>('analogous')
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

  const harmonies = getHarmonies(theme.accent)
  const tonalScale = generateTonalScale(theme.accent)

  // Obtener colores según la regla armónica
  let paletteColors: string[] = []
  if (activeRule === 'custom') {
    paletteColors = [
      theme.accent,
      theme.accentLight || tonalScale['400'],
      theme.accentDark || tonalScale['700'],
      theme.background,
      theme.surface,
      theme.ink,
    ]
  } else {
    const selectedGroup = harmonies.find((h) => h.type === activeRule)
    paletteColors = selectedGroup ? selectedGroup.colors : [theme.accent]
    // Asegurar al menos 5 columnas
    if (paletteColors.length < 5) {
      paletteColors = [
        ...paletteColors,
        tonalScale['200'],
        tonalScale['800'],
        tonalScale['950'],
      ].slice(0, 5)
    }
  }

  const handleCopy = async (color: string, index: number) => {
    try {
      await navigator.clipboard.writeText(color)
      setCopiedIndex(index)
      setTimeout(() => setCopiedIndex(null), 1400)
    } catch {
      // Fallback
    }
  }

  const rules: { id: HarmonyRule; label: string }[] = [
    { id: 'analogous', label: 'Análogos' },
    { id: 'complementary', label: 'Complementario' },
    { id: 'triadic', label: 'Tríada' },
    { id: 'split-complementary', label: 'Split Complementario' },
    { id: 'tetradic', label: 'Tetrádico' },
    { id: 'custom', label: 'Tokens del Tema' },
  ]

  return (
    <div className="space-y-6">
      {/* Selector de Regla Armónica (Estilo Adobe Color) */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-2 bg-white rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex flex-wrap items-center gap-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider px-3">
            Regla Cromática:
          </span>
          {rules.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => setActiveRule(r.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeRule === r.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 px-3 text-xs text-slate-500 font-medium">
          <span>Base:</span>
          <span className="font-mono font-bold text-slate-900">{theme.accent}</span>
        </div>
      </div>

      {/* Lienzo Inmersivo de Columnas de Color (Estilo Adobe Color / Coolors) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 min-h-[380px]">
        {paletteColors.map((color, index) => {
          const textColor = getReadableTextColor(color)
          const isBase = color.toLowerCase() === theme.accent.toLowerCase()
          const c = colord(color)
          const hsl = c.toHsl()
          const rgb = c.toRgb()

          return (
            <div
              key={`${color}-${index}`}
              className="group relative rounded-2xl p-5 flex flex-col justify-between transition-all duration-200 border border-black/10 shadow-sm hover:shadow-xl hover:scale-[1.02] cursor-pointer"
              style={{ backgroundColor: color, color: textColor }}
              onClick={() => onApplyAccent(color)}
            >
              {/* Parte Superior: Etiquetas y Copiar */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold tracking-wider uppercase opacity-80 font-mono">
                  {isBase ? '★ Principal' : `Color 0${index + 1}`}
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleCopy(color, index)
                  }}
                  className="p-2 rounded-xl bg-black/10 hover:bg-black/20 backdrop-blur-xs transition-transform active:scale-95"
                  title="Copiar código HEX"
                >
                  {copiedIndex === index ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5 opacity-80" />
                  )}
                </button>
              </div>

              {/* Centro: Código HEX Protagonista */}
              <div className="my-auto text-center py-6">
                <p className="text-2xl md:text-3xl font-black font-mono tracking-tight uppercase">
                  {color}
                </p>
                <div className="mt-2 space-y-0.5 text-[11px] font-mono opacity-75">
                  <p>RGB({rgb.r}, {rgb.g}, {rgb.b})</p>
                  <p>HSL({Math.round(hsl.h)}°, {Math.round(hsl.s)}%, {Math.round(hsl.l)}%)</p>
                </div>
              </div>

              {/* Parte Inferior: Acciones Rápidas */}
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    onApplyAccent(color)
                  }}
                  className="w-full py-2 px-3 rounded-xl font-bold text-xs bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/20 transition-all text-center"
                >
                  Usar como Acento
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    onApplyBackground(color)
                  }}
                  className="w-full py-1.5 px-3 rounded-xl font-medium text-[11px] bg-black/10 hover:bg-black/20 backdrop-blur-sm transition-all text-center"
                >
                  Usar como Fondo
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Rampa Tonal Perceptiva Horizontal Integrada */}
      <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-slate-700" />
            <h3 className="text-xs font-bold text-slate-900">Escala Tonal Perceptiva (50 → 950)</h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">Luminancia Calibrada</span>
        </div>

        <div className="grid grid-cols-11 gap-1.5 rounded-xl p-1.5 bg-slate-100/80 border border-slate-200">
          {(['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'] as const).map((step) => {
            const hex = tonalScale[step]
            const textColor = getReadableTextColor(hex)

            return (
              <div
                key={step}
                className="group relative flex flex-col items-center justify-between py-2.5 px-1 rounded-lg transition-all hover:scale-110 hover:z-10 hover:shadow-lg cursor-pointer min-h-[70px]"
                style={{ backgroundColor: hex, color: textColor }}
                onClick={() => onApplyAccent(hex)}
                title={`${step}: ${hex} (Clic para usar)`}
              >
                <span className="text-[10px] font-mono font-bold opacity-80">{step}</span>
                <span className="text-[9px] font-mono font-semibold uppercase opacity-90 truncate max-w-full">
                  {hex.replace('#', '')}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
