import React, { useState, useRef, useEffect } from 'react'
import { Palette, Check, ChevronDown } from 'lucide-react'
import { ANALYTICS_PALETTES } from '../theme'

export default function PaletteSelector({
  selectedPalette,
  onSelectPalette,
  theme = 'light'
}) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef(null)
  const isDark = theme === 'dark' || theme?.id?.includes('dark') || theme?.id?.includes('cyber')

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
          isDark
            ? 'bg-slate-800/90 border-slate-700 hover:bg-slate-700 text-white'
            : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-800 shadow-2xs'
        }`}
      >
        <Palette className="w-3.5 h-3.5 text-blue-500" />
        <div className="flex items-center gap-1.5">
          <div className="flex -space-x-1">
            {selectedPalette.colors.slice(0, 3).map((c, i) => (
              <span
                key={i}
                className="w-2.5 h-2.5 rounded-full border border-black/20"
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
          <span className="truncate">{selectedPalette.name}</span>
        </div>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div
          className={`absolute right-0 mt-2 w-64 rounded-2xl p-2 shadow-2xl border backdrop-blur-xl z-50 animate-in fade-in zoom-in-95 duration-150 ${
            isDark
              ? 'bg-slate-900/95 border-slate-700 text-white'
              : 'bg-white/95 border-slate-200 text-slate-900'
          }`}
        >
          <div className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 text-slate-400">
            Paletas de Color Interactivas
          </div>
          <div className="space-y-1 mt-1">
            {ANALYTICS_PALETTES.map(p => {
              const isSelected = p.id === selectedPalette.id
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    onSelectPalette(p)
                    setIsOpen(false)
                  }}
                  className={`w-full text-left p-2 rounded-xl flex items-center justify-between transition-all cursor-pointer ${
                    isSelected
                      ? isDark
                        ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                        : 'bg-blue-50 text-blue-700 border border-blue-200'
                      : isDark
                      ? 'hover:bg-slate-800 text-slate-300'
                      : 'hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold flex items-center gap-1.5">
                      <span>{p.name}</span>
                    </div>
                    <div className="flex gap-1 pt-1">
                      {p.colors.map((color, idx) => (
                        <span
                          key={idx}
                          className="w-3 h-3 rounded-full border border-black/10"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-blue-500 shrink-0" />}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
