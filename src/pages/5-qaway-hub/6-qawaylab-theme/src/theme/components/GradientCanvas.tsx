import React, { useState } from 'react'
import { Copy, Check, Plus, Trash2 } from 'lucide-react'
import { ColorPickerPopover } from './ColorPickerPopover'
import type { GradientConfig } from '../types'

interface GradientCanvasProps {
  gradient: GradientConfig
  onChange: (gradient: GradientConfig) => void
}

const PRESET_GRADIENTS: { name: string; gradient: GradientConfig }[] = [
  { name: 'Kinetic Orange', gradient: { angle: 135, from: '#ff4b0b', via: '#ff7844', to: '#0f172a' } },
  { name: 'Sunset Glow', gradient: { angle: 45, from: '#f59e0b', via: '#ef4444', to: '#1c1917' } },
  { name: 'Deep Cobalt', gradient: { angle: 90, from: '#1e3a8a', via: '#0f172a', to: '#334155' } },
  { name: 'Neon Cyber', gradient: { angle: 135, from: '#6366f1', via: '#8b5cf6', to: '#06b6d4' } },
  { name: 'Emerald Forest', gradient: { angle: 120, from: '#059669', via: '#10b981', to: '#064e3b' } },
  { name: 'Warm Terracotta', gradient: { angle: 160, from: '#c2410c', via: '#9a3412', to: '#451a03' } },
]

export function GradientCanvas({ gradient, onChange }: GradientCanvasProps) {
  const [copied, setCopied] = useState(false)
  const hasVia = Boolean(gradient.via)

  const cssString = hasVia
    ? `linear-gradient(${gradient.angle}deg, ${gradient.from}, ${gradient.via}, ${gradient.to})`
    : `linear-gradient(${gradient.angle}deg, ${gradient.from}, ${gradient.to})`

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(`background-image: ${cssString};`)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // Fallback
    }
  }

  const toggleVia = () => {
    if (hasVia) {
      onChange({ ...gradient, via: undefined })
    } else {
      onChange({ ...gradient, via: '#8b5cf6' })
    }
  }

  return (
    <div className="space-y-6">
      {/* Lienzo Protagonista del Degradado */}
      <div
        className="w-full h-64 md:h-80 rounded-3xl border border-slate-200 shadow-xl flex flex-col justify-between p-6 transition-all duration-300 relative overflow-hidden"
        style={{ backgroundImage: cssString }}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono font-bold bg-black/50 backdrop-blur-md text-white px-3 py-1.5 rounded-xl border border-white/10">
            {gradient.angle}° Linear Gradient
          </span>

          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-2 bg-white/95 hover:bg-white text-slate-900 text-xs font-bold px-4 py-2 rounded-xl shadow-lg transition-all active:scale-95 cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            {copied ? '¡Copiado!' : 'Copiar Regla CSS'}
          </button>
        </div>

        <div className="bg-black/40 backdrop-blur-md p-4 rounded-2xl border border-white/10 max-w-xl text-white">
          <p className="font-mono text-xs truncate">
            background-image: {cssString};
          </p>
        </div>
      </div>

      {/* Controles de Paradas de Color & Ángulo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Selector de Paradas */}
        <div className="md:col-span-2 p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Paradas Cromáticas</h3>
            <button
              type="button"
              onClick={toggleVia}
              className="text-xs font-bold text-slate-900 hover:underline flex items-center gap-1 cursor-pointer"
            >
              {hasVia ? <Trash2 className="w-3.5 h-3.5 text-rose-500" /> : <Plus className="w-3.5 h-3.5" />}
              {hasVia ? 'Quitar parada central' : 'Añadir parada central (3 colores)'}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Inicio (From)</span>
              <ColorPickerPopover
                color={gradient.from}
                onChange={(val) => onChange({ ...gradient, from: val })}
                label="Inicio"
              />
            </div>

            {hasVia && (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Medio (Via)</span>
                <ColorPickerPopover
                  color={gradient.via || '#8b5cf6'}
                  onChange={(val) => onChange({ ...gradient, via: val })}
                  label="Medio"
                />
              </div>
            )}

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Fin (To)</span>
              <ColorPickerPopover
                color={gradient.to}
                onChange={(val) => onChange({ ...gradient, to: val })}
                label="Fin"
              />
            </div>
          </div>
        </div>

        {/* Control de Ángulo */}
        <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Ángulo</h3>
            <span className="text-lg font-mono font-black text-slate-900">{gradient.angle}°</span>
          </div>

          <input
            type="range"
            min={0}
            max={360}
            step={5}
            value={gradient.angle}
            onChange={(e) => onChange({ ...gradient, angle: Number(e.target.value) })}
            className="w-full accent-slate-900"
          />

          <div className="grid grid-cols-3 gap-1.5 pt-2">
            {[0, 45, 90, 135, 180, 270].map((deg) => (
              <button
                key={deg}
                type="button"
                onClick={() => onChange({ ...gradient, angle: deg })}
                className={`text-[11px] font-bold py-1.5 rounded-lg border transition-all cursor-pointer ${
                  gradient.angle === deg ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {deg}°
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Galería de Presets de Degradados */}
      <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Galería de Degradados</h3>
          <span className="text-xs text-slate-400">1-clic para aplicar</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {PRESET_GRADIENTS.map((p) => {
            const bgStr = p.gradient.via
              ? `linear-gradient(${p.gradient.angle}deg, ${p.gradient.from}, ${p.gradient.via}, ${p.gradient.to})`
              : `linear-gradient(${p.gradient.angle}deg, ${p.gradient.from}, ${p.gradient.to})`

            return (
              <button
                key={p.name}
                type="button"
                onClick={() => onChange(p.gradient)}
                className="group flex flex-col rounded-xl overflow-hidden border border-slate-200 hover:border-slate-400 transition-all text-left shadow-2xs hover:shadow-md cursor-pointer"
              >
                <div className="h-16 w-full transition-transform group-hover:scale-105" style={{ backgroundImage: bgStr }} />
                <div className="p-2 bg-white">
                  <span className="text-[11px] font-bold text-slate-800 truncate block">{p.name}</span>
                  <span className="text-[9px] font-mono text-slate-400">{p.gradient.angle}°</span>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
