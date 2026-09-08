import React, { useState } from 'react'
import { Copy, Check, Sparkles } from 'lucide-react'
import { generateTonalScale, getReadableTextColor } from '../utils/colorUtils'
import type { TonalStep } from '../types'

interface TonalScaleGeneratorProps {
  baseColor: string
  onSelectColor?: (color: string) => void
}

export function TonalScaleGenerator({ baseColor, onSelectColor }: TonalScaleGeneratorProps) {
  const scale = generateTonalScale(baseColor)
  const [copiedStep, setCopiedStep] = useState<string | null>(null)

  const steps: TonalStep[] = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950']

  const handleCopy = async (step: string, hex: string) => {
    try {
      await navigator.clipboard.writeText(hex)
      setCopiedStep(step)
      setTimeout(() => setCopiedStep(null), 1500)
    } catch {
      // Ignorar fallback
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-primary/80 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-accent" />
          Rampa Tonal Perceptiva (50 - 950)
        </h3>
        <span className="text-[10px] font-mono text-primary/50">Base: {baseColor}</span>
      </div>

      <div className="grid grid-cols-11 gap-1 rounded-xl p-1 bg-surface border border-line overflow-hidden shadow-2xs">
        {steps.map(step => {
          const hex = scale[step]
          const textColor = getReadableTextColor(hex)
          const isCopied = copiedStep === step

          return (
            <div
              key={step}
              className="group relative flex flex-col items-center justify-between p-1.5 rounded-lg transition-all hover:scale-105 hover:z-10 hover:shadow-md cursor-pointer min-h-[72px]"
              style={{ backgroundColor: hex, color: textColor }}
              onClick={() => handleCopy(step, hex)}
              title={`${step}: ${hex} (Clic para copiar)`}
            >
              <span className="text-[9px] font-mono font-bold opacity-80">{step}</span>
              
              <div className="my-auto opacity-0 group-hover:opacity-100 transition-opacity">
                {isCopied ? (
                  <Check className="w-3 h-3" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
              </div>

              <span className="text-[8px] font-mono opacity-80 uppercase leading-none">
                {isCopied ? 'OK' : hex.replace('#', '')}
              </span>

              {onSelectColor && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    onSelectColor(hex)
                  }}
                  className="absolute -top-6 left-1/2 -translate-x-1/2 hidden group-hover:block bg-primary text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-lg whitespace-nowrap"
                >
                  Usar
                </button>
              )}
            </div>
          )
        })}
      </div>
      <p className="text-[10px] text-primary/50 leading-relaxed">
        Calculada algorítmicamente mediante luminancia y matiz armónico para fondos suaves (50) hasta sombras profundas (950).
      </p>
    </div>
  )
}
