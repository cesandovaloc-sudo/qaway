import React from 'react'
import { ColorPickerPopover } from './ColorPickerPopover'

interface ColorFieldProps {
  label: string
  value: string
  onChange: (value: string) => void
  swatches?: string[]
  description?: string
}

export function ColorField({ label, value, onChange, swatches, description }: ColorFieldProps) {
  return (
    <div className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:border-slate-300 transition-all">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-slate-800 tracking-tight">
          {label}
        </span>
        {description && (
          <span className="text-[10px] text-slate-400 font-medium">
            {description}
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        <ColorPickerPopover color={value} onChange={onChange} label={label} />
        
        {swatches && swatches.length > 0 && (
          <div className="flex items-center gap-1.5 ml-auto">
            {swatches.slice(0, 5).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => onChange(s)}
                className={`w-4 h-4 rounded-full transition-transform hover:scale-125 ${
                  value.toLowerCase() === s.toLowerCase()
                    ? 'ring-2 ring-slate-900 ring-offset-1 scale-110'
                    : 'border border-black/10 hover:shadow-xs'
                }`}
                style={{ backgroundColor: s }}
                title={`Usar ${s}`}
                aria-label={`Usar color ${s}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
