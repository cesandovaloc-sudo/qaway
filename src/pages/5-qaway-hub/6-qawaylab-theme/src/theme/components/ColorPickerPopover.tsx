import React, { useState, useRef, useEffect } from 'react'
import { HexColorPicker } from 'react-colorful'
import { Copy, Check, ChevronDown } from 'lucide-react'
import { formatColorString, isValidHexColor } from '../utils/colorUtils'
import type { ColorFormat } from '../types'

interface ColorPickerPopoverProps {
  color: string
  onChange: (color: string) => void
  label?: string
}

export function ColorPickerPopover({ color, onChange, label }: ColorPickerPopoverProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [format, setFormat] = useState<ColorFormat>('hex')
  const [copied, setCopied] = useState(false)
  const [inputValue, setInputValue] = useState(color)
  const popoverRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setInputValue(color)
  }, [color])

  useEffect(() => {
    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false)
    }

    if (isOpen) {
      document.addEventListener('mousedown', handlePointerDown)
      document.addEventListener('touchstart', handlePointerDown)
      document.addEventListener('keydown', handleKeyDown)
    }
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('touchstart', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  const handleCopy = async () => {
    try {
      const formatted = formatColorString(color, format)
      await navigator.clipboard.writeText(formatted)
      setCopied(true)
      setTimeout(() => setCopied(false), 1400)
    } catch {
      // Fallback
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setInputValue(val)
    if (isValidHexColor(val)) {
      onChange(val.startsWith('#') ? val : `#${val}`)
    }
  }

  const formattedDisplay = formatColorString(color, format)

  return (
    <div className="relative inline-flex items-center gap-2" ref={popoverRef}>
      {/* Botón trigger compacto y táctil */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-lg transition-all group focus:outline-none focus:ring-2 focus:ring-slate-900/10"
        title={label ? `Ajustar ${label}` : 'Elegir color'}
      >
        <span
          className="w-4 h-4 rounded-md border border-black/15 shadow-inner block transition-transform group-hover:scale-105"
          style={{ backgroundColor: color }}
        />
        <span className="font-mono text-xs text-slate-800 font-semibold uppercase tracking-wider">
          {color}
        </span>
        <ChevronDown className="w-3 h-3 text-slate-400 group-hover:text-slate-600 transition-transform" />
      </button>

      {/* Popover Pro con react-colorful */}
      {isOpen && (
        <div className="absolute left-0 top-full mt-2 z-50 p-3.5 bg-white rounded-2xl border border-slate-200/90 shadow-[0_12px_36px_rgba(0,0,0,0.12)] w-[260px] animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              {label || 'Color Studio'}
            </span>
            <div className="flex bg-slate-100 rounded-lg p-0.5 border border-slate-200/60">
              {(['hex', 'rgb', 'hsl'] as const).map((fmt) => (
                <button
                  key={fmt}
                  type="button"
                  onClick={() => setFormat(fmt)}
                  className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-md transition-all ${
                    format === fmt
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {fmt}
                </button>
              ))}
            </div>
          </div>

          {/* Lienzo del ColorPicker */}
          <div className="custom-color-picker flex justify-center mb-3">
            <HexColorPicker
              color={color}
              onChange={onChange}
              className="!w-full !h-36 rounded-xl overflow-hidden"
            />
          </div>

          {/* Display formateado con botón copiar */}
          <div className="flex items-center gap-2 mb-2 bg-slate-50 p-1.5 rounded-lg border border-slate-200/70">
            <div
              className="w-5 h-5 rounded-md border border-black/10 shrink-0"
              style={{ backgroundColor: color }}
            />
            <span className="font-mono text-[11px] text-slate-800 truncate flex-1 font-semibold px-1">
              {formattedDisplay}
            </span>
            <button
              type="button"
              onClick={handleCopy}
              className="p-1 text-slate-400 hover:text-slate-900 hover:bg-white rounded-md transition-all shrink-0"
              title="Copiar valor"
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-emerald-600 animate-in zoom-in" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          </div>

          {/* Input manual */}
          <div className="flex items-center gap-1.5">
            <input
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              placeholder="#ff4b0b"
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-mono text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white transition-colors"
            />
          </div>
        </div>
      )}
    </div>
  )
}
