import React from 'react'
import { Palette, ArrowRight } from 'lucide-react'
import { getHarmonies, getReadableTextColor } from '../utils/colorUtils'
import type { HarmonyGroup } from '../types'

interface HarmoniesGeneratorProps {
  baseColor: string
  onApplyColor: (color: string) => void
}

export function HarmoniesGenerator({ baseColor, onApplyColor }: HarmoniesGeneratorProps) {
  const harmonies = getHarmonies(baseColor)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-primary/80 flex items-center gap-1.5">
          <Palette className="w-3.5 h-3.5 text-accent" />
          Armonías Cromáticas Automáticas
        </h3>
        <span className="text-[10px] text-primary/40 font-mono">colord / harmonies</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {harmonies.map((harmony: HarmonyGroup) => (
          <div
            key={harmony.type}
            className="p-3 bg-white rounded-xl border border-line shadow-2xs space-y-2 hover:border-accent/30 transition-colors"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-primary/90">{harmony.title}</span>
              <span className="text-[10px] text-primary/40 capitalize">{harmony.type}</span>
            </div>

            {/* Fila de colores de la armonía */}
            <div className="flex h-11 rounded-lg overflow-hidden border border-black/10 shadow-inner">
              {harmony.colors.map((c, i) => {
                const textColor = getReadableTextColor(c)
                const isBase = c.toLowerCase() === baseColor.toLowerCase()

                return (
                  <button
                    key={`${c}-${i}`}
                    type="button"
                    onClick={() => onApplyColor(c)}
                    className="flex-1 flex flex-col items-center justify-center transition-all hover:opacity-90 active:scale-95 group relative"
                    style={{ backgroundColor: c, color: textColor }}
                    title={`${c} (Clic para usar como acento)`}
                  >
                    <span className="text-[9px] font-mono font-bold uppercase leading-tight">
                      {c}
                    </span>
                    {isBase ? (
                      <span className="text-[8px] font-bold opacity-75">Base</span>
                    ) : (
                      <ArrowRight className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    )}
                  </button>
                )
              })}
            </div>

            <p className="text-[11px] text-primary/60 leading-tight">
              {harmony.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
