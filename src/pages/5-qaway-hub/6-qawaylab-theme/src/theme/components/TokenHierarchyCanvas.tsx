import React, { useState } from 'react'
import { ArrowRight, Layers, Sun, Moon, Check, Copy } from 'lucide-react'
import type { DesignSystemTheme, ColorMode } from '../types'
import { buildPrimitiveTokens, buildSemanticTokens } from '../utils/colorUtils'

interface TokenHierarchyCanvasProps {
  theme: DesignSystemTheme
  onToggleMode: (mode: ColorMode) => void
}

export function TokenHierarchyCanvas({ theme, onToggleMode }: TokenHierarchyCanvasProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const primitives = buildPrimitiveTokens(theme.brandHex, theme.neutralHex)
  const { light, dark } = buildSemanticTokens(primitives, theme.radiusValue, theme.buttonStyle)
  const activeSemantics = theme.mode === 'light' ? light : dark

  const handleCopy = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedKey(key)
      setTimeout(() => setCopiedKey(null), 1400)
    } catch {
      // Fallback
    }
  }

  const semanticMappings: { role: string; token: string; alias: string; value: string; desc: string }[] = [
    {
      role: 'Fondo de Página',
      token: '--color-bg-page',
      alias: theme.mode === 'light' ? 'neutral-50' : 'neutral-950',
      value: activeSemantics.bgPage,
      desc: 'Lienzo principal de la aplicación',
    },
    {
      role: 'Superficie de Tarjetas',
      token: '--color-bg-surface',
      alias: theme.mode === 'light' ? '#ffffff' : 'neutral-900',
      value: activeSemantics.bgSurface,
      desc: 'Contenedores, tarjetas y modales',
    },
    {
      role: 'Acción Principal (Botones/CTA)',
      token: '--color-action-primary',
      alias: 'brand-500',
      value: activeSemantics.actionPrimary,
      desc: 'Botones primarios y elementos interactivos clave',
    },
    {
      role: 'Texto de Alto Contraste',
      token: '--color-text-primary',
      alias: theme.mode === 'light' ? 'neutral-950' : 'neutral-50',
      value: activeSemantics.textPrimary,
      desc: 'Títulos y textos de lectura principal',
    },
    {
      role: 'Texto Secundario / Muted',
      token: '--color-text-muted',
      alias: theme.mode === 'light' ? 'neutral-500' : 'neutral-400',
      value: activeSemantics.textMuted,
      desc: 'Subtítulos, placeholders y metadata',
    },
    {
      role: 'Bordes y Separadores',
      token: '--color-border-default',
      alias: theme.mode === 'light' ? 'neutral-200' : 'neutral-800',
      value: activeSemantics.borderDefault,
      desc: 'Líneas divisorias y contornos de inputs',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Cabecera Explicativa y Selector de Modo */}
      <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-slate-900" />
            <h2 className="text-base font-bold text-slate-900">Arquitectura de Tokens de 3 Capas</h2>
            <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-700">
              W3C / Revolut Standard
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Los componentes nunca consumen valores crudos directamente; consumen tokens semánticos que apuntan a primitivos.
          </p>
        </div>

        {/* Toggle Modo Claro / Oscuro */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            type="button"
            onClick={() => onToggleMode('light')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              theme.mode === 'light' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Sun className="w-3.5 h-3.5 text-amber-500" /> Modo Claro
          </button>
          <button
            type="button"
            onClick={() => onToggleMode('dark')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              theme.mode === 'dark' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Moon className="w-3.5 h-3.5 text-indigo-400" /> Modo Oscuro
          </button>
        </div>
      </div>

      {/* Visualizador de las 3 Capas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* CAPA 1: PRIMITIVOS */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase text-slate-400">Capa 1</span>
              <h3 className="text-xs font-bold text-slate-900">Tokens Primitivos (Globales)</h3>
            </div>
            <span className="text-[10px] font-mono text-slate-400">Escalas 50-950</span>
          </div>

          <div className="space-y-3">
            <div>
              <span className="text-[11px] font-bold text-slate-700 block mb-1.5">Escala de Marca (Brand)</span>
              <div className="flex h-7 rounded-lg overflow-hidden border border-black/10">
                {(['100', '300', '500', '700', '900'] as const).map((step) => (
                  <div
                    key={step}
                    className="flex-1 flex items-center justify-center text-[9px] font-mono font-bold"
                    style={{
                      backgroundColor: primitives.brand[step],
                      color: Number(step) > 400 ? '#ffffff' : '#0f172a',
                    }}
                    title={`brand-${step}: ${primitives.brand[step]}`}
                  >
                    {step}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <span className="text-[11px] font-bold text-slate-700 block mb-1.5">Escala de Neutros (Neutral)</span>
              <div className="flex h-7 rounded-lg overflow-hidden border border-black/10">
                {(['50', '200', '500', '800', '950'] as const).map((step) => (
                  <div
                    key={step}
                    className="flex-1 flex items-center justify-center text-[9px] font-mono font-bold"
                    style={{
                      backgroundColor: primitives.neutral[step],
                      color: Number(step) > 400 ? '#ffffff' : '#0f172a',
                    }}
                    title={`neutral-${step}: ${primitives.neutral[step]}`}
                  >
                    {step}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* CAPA 2: SEMÁNTICOS (ALIAS) */}
        <div className="md:col-span-2 p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase text-slate-400">Capa 2</span>
              <h3 className="text-xs font-bold text-slate-900">Tokens Semánticos & Mapeo de Alias ({theme.mode.toUpperCase()})</h3>
            </div>
            <span className="text-[10px] font-mono text-emerald-600 font-bold">Resuelve en Vivo</span>
          </div>

          <div className="space-y-2">
            {semanticMappings.map((item) => {
              const isCopied = copiedKey === item.token

              return (
                <div
                  key={item.token}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 hover:border-slate-300 transition-all text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="w-5 h-5 rounded-md border border-black/10 shrink-0 shadow-2xs"
                      style={{ backgroundColor: item.value }}
                    />
                    <div>
                      <span className="font-mono font-bold text-slate-800 block text-[11px]">{item.token}</span>
                      <span className="text-[10px] text-slate-500">{item.desc}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-500">
                      <ArrowRight className="w-3 h-3 text-slate-400" />
                      <span className="font-bold text-slate-700">{item.alias}</span>
                      <span className="text-slate-400">({item.value})</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleCopy(`var(${item.token})`, item.token)}
                      className="p-1 text-slate-400 hover:text-slate-800 hover:bg-white rounded-md transition-colors cursor-pointer"
                      title="Copiar var()"
                    >
                      {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
