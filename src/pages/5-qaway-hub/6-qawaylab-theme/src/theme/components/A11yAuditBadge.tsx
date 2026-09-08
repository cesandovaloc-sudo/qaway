import React from 'react'
import { ShieldCheck, CheckCircle2, XCircle, Sparkles } from 'lucide-react'
import { getAccessibilityAudit } from '../utils/colorUtils'

interface A11yAuditBadgeProps {
  color: string
  backgroundColor?: string
  onApplyTextColor?: (color: string) => void
}

export function A11yAuditBadge({ color, backgroundColor = '#ffffff', onApplyTextColor }: A11yAuditBadgeProps) {
  const audit = getAccessibilityAudit(color, backgroundColor)

  return (
    <div className="p-4 bg-white rounded-xl border border-line shadow-2xs space-y-3.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-accent" />
          <h3 className="text-xs font-bold text-primary">Auditoría de Accesibilidad WCAG 2.1</h3>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-surface border border-line text-primary/60 font-semibold">
          colord / a11y
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Contraste vs Blanco */}
        <div className="p-3 bg-surface rounded-lg border border-line space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-primary/70">Sobre Blanco (#ffffff)</span>
            <span className="font-mono text-xs font-bold text-primary">
              {audit.ratioVsWhite}:1
            </span>
          </div>

          <div className="flex items-center gap-2 text-[10px]">
            <div className="flex items-center gap-1">
              {audit.passAANormalWhite ? (
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              ) : (
                <XCircle className="w-3 h-3 text-rose-500" />
              )}
              <span className={audit.passAANormalWhite ? 'text-emerald-700 font-semibold' : 'text-rose-600'}>
                AA Normal
              </span>
            </div>

            <div className="flex items-center gap-1">
              {audit.passAAANormalWhite ? (
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              ) : (
                <XCircle className="w-3 h-3 text-rose-500" />
              )}
              <span className={audit.passAAANormalWhite ? 'text-emerald-700 font-semibold' : 'text-rose-600'}>
                AAA Normal
              </span>
            </div>
          </div>
        </div>

        {/* Contraste vs Oscuro */}
        <div className="p-3 bg-surface rounded-lg border border-line space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-primary/70">Sobre Carbón (#0f172a)</span>
            <span className="font-mono text-xs font-bold text-primary">
              {audit.ratioVsDark}:1
            </span>
          </div>

          <div className="flex items-center gap-2 text-[10px]">
            <div className="flex items-center gap-1">
              {audit.passAANormalDark ? (
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              ) : (
                <XCircle className="w-3 h-3 text-rose-500" />
              )}
              <span className={audit.passAANormalDark ? 'text-emerald-700 font-semibold' : 'text-rose-600'}>
                AA Normal
              </span>
            </div>

            <div className="flex items-center gap-1">
              {audit.passAAANormalDark ? (
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              ) : (
                <XCircle className="w-3 h-3 text-rose-500" />
              )}
              <span className={audit.passAAANormalDark ? 'text-emerald-700 font-semibold' : 'text-rose-600'}>
                AAA Normal
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recomendación de texto legible */}
      <div className="flex items-center justify-between p-2.5 bg-accent/5 border border-accent/20 rounded-lg">
        <div className="flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-accent shrink-0" />
          <span className="text-[11px] text-primary/80">
            Texto recomendado sobre este color:{' '}
            <strong className="font-mono text-primary font-bold">
              {audit.recommendedTextColor === '#ffffff' ? 'Blanco (#ffffff)' : 'Oscuro (#0f172a)'}
            </strong>
          </span>
        </div>

        {onApplyTextColor && (
          <button
            type="button"
            onClick={() => onApplyTextColor(audit.recommendedTextColor)}
            className="text-[10px] font-bold text-accent hover:underline shrink-0"
          >
            Aplicar
          </button>
        )}
      </div>
    </div>
  )
}
