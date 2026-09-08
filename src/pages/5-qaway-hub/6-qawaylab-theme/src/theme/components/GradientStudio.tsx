import React, { useState } from 'react'
import { Layers, Copy, Check, Sliders, Plus, Trash2 } from 'lucide-react'
import { ColorPickerPopover } from './ColorPickerPopover'
import type { GradientConfig } from '../types'

interface GradientStudioProps {
  gradient: GradientConfig
  onChange: (gradient: GradientConfig) => void
}

const ANGLE_PRESETS = [
  { label: '0° ↑', angle: 0 },
  { label: '45° ↗', angle: 45 },
  { label: '90° →', angle: 90 },
  { label: '135° ↘', angle: 135 },
  { label: '180° ↓', angle: 180 },
  { label: '270° ←', angle: 270 },
]

export function GradientStudio({ gradient, onChange }: GradientStudioProps) {
  const [copied, setCopied] = useState(false)
  const hasVia = Boolean(gradient.via)

  const cssString = hasVia
    ? `linear-gradient(${gradient.angle}deg, ${gradient.from}, ${gradient.via}, ${gradient.to})`
    : `linear-gradient(${gradient.angle}deg, ${gradient.from}, ${gradient.to})`

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(`background-image: ${cssString};`)
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    } catch {
      // Ignorar fallback
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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-primary/80 flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-accent" />
          Generador de Degradados CSS
        </h3>
        <button
          type="button"
          onClick={toggleVia}
          className="inline-flex items-center gap-1 text-[11px] font-semibold text-accent hover:underline"
        >
          {hasVia ? (
            <>
              <Trash2 className="w-3 h-3 text-rose-500" /> Quitar parada media
            </>
          ) : (
            <>
              <Plus className="w-3 h-3" /> Añadir parada media (3 paradas)
            </>
          )}
        </button>
      </div>

      {/* Vista previa del degradado */}
      <div
        className="h-24 w-full rounded-xl border border-line shadow-inner flex items-end justify-between p-3 transition-all duration-300"
        style={{ backgroundImage: cssString }}
      >
        <span className="text-[10px] font-mono font-bold bg-black/60 backdrop-blur text-white px-2 py-0.5 rounded-md">
          {gradient.angle}°
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 bg-white/90 hover:bg-white text-primary text-xs font-bold px-2.5 py-1 rounded-lg shadow-md transition-all active:scale-95"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? 'Copiado' : 'Copiar CSS'}
        </button>
      </div>

      {/* Selector de Paradas de Color */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        <div className="p-2.5 bg-surface border border-line rounded-lg space-y-1.5">
          <span className="text-[10px] font-bold text-primary/60 uppercase">Inicio (From)</span>
          <ColorPickerPopover
            color={gradient.from}
            onChange={(val) => onChange({ ...gradient, from: val })}
            label="Inicio"
          />
        </div>

        {hasVia && (
          <div className="p-2.5 bg-surface border border-line rounded-lg space-y-1.5">
            <span className="text-[10px] font-bold text-primary/60 uppercase">Medio (Via)</span>
            <ColorPickerPopover
              color={gradient.via || '#8b5cf6'}
              onChange={(val) => onChange({ ...gradient, via: val })}
              label="Medio"
            />
          </div>
        )}

        <div className="p-2.5 bg-surface border border-line rounded-lg space-y-1.5">
          <span className="text-[10px] font-bold text-primary/60 uppercase">Fin (To)</span>
          <ColorPickerPopover
            color={gradient.to}
            onChange={(val) => onChange({ ...gradient, to: val })}
            label="Fin"
          />
        </div>
      </div>

      {/* Control de Ángulo */}
      <div className="p-3 bg-surface border border-line rounded-lg space-y-2.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-primary/70 flex items-center gap-1.5">
            <Sliders className="w-3 h-3 text-accent" /> Ángulo de Rotación
          </label>
          <span className="font-mono text-xs font-bold text-primary">{gradient.angle}°</span>
        </div>

        <input
          type="range"
          min={0}
          max={360}
          step={5}
          value={gradient.angle}
          onChange={(e) => onChange({ ...gradient, angle: Number(e.target.value) })}
          className="w-full accent-[#ff4b0b]"
        />

        <div className="flex flex-wrap gap-1.5 pt-1">
          {ANGLE_PRESETS.map((p) => (
            <button
              key={p.angle}
              type="button"
              onClick={() => onChange({ ...gradient, angle: p.angle })}
              className={`text-[10px] font-semibold px-2 py-1 rounded-md border transition-all ${
                gradient.angle === p.angle
                  ? 'bg-primary text-white border-primary'
                  : 'bg-white border-line text-primary/70 hover:bg-surface'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
