import React, { useState, useEffect } from 'react'
import {
  BookmarkPlus,
  Trash2,
  Sparkles,
  Flame,
  Briefcase,
  Cpu,
  Leaf,
  Coffee,
  Bookmark,
} from 'lucide-react'
import { BRAND_PRESETS } from '../data/brandPresets'
import type { BrandPreset } from '../types'

interface FavoritesPaletteProps {
  currentColor: string
  onApplyColor: (color: string) => void
  onApplyPreset: (preset: BrandPreset) => void
}

const STORAGE_KEY = 'qaway_theme_favorites'

const PRESET_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  'qaway-official': Sparkles,
  'burger-street': Flame,
  'accounting-legal': Briefcase,
  'tech-saas': Cpu,
  'eco-wellness': Leaf,
  'artisan-cafe': Coffee,
}

export function FavoritesPalette({ currentColor, onApplyColor, onApplyPreset }: FavoritesPaletteProps) {
  const [favorites, setFavorites] = useState<string[]>([])
  const [selectedPresetId, setSelectedPresetId] = useState<string>('qaway-official')

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        setFavorites(JSON.parse(saved))
      } else {
        setFavorites(['#ff4b0b', '#0ea5e9', '#10b981', '#6366f1', '#f59e0b', '#0f172a'])
      }
    } catch {
      // Fallback
    }
  }, [])

  const saveFavorite = () => {
    if (!currentColor) return
    const normalized = currentColor.toLowerCase()
    if (favorites.includes(normalized)) return

    const updated = [normalized, ...favorites].slice(0, 18)
    setFavorites(updated)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    } catch {
      // Fallback
    }
  }

  const removeFavorite = (color: string) => {
    const updated = favorites.filter((c) => c.toLowerCase() !== color.toLowerCase())
    setFavorites(updated)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    } catch {
      // Fallback
    }
  }

  const handleSelectPreset = (preset: BrandPreset) => {
    setSelectedPresetId(preset.id)
    onApplyPreset(preset)
  }

  return (
    <div className="space-y-4">
      {/* Presets de Marca */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-primary flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-accent" />
            Arquetipos de Marca
          </h3>
          <span className="text-[10px] text-primary/40 font-mono">Presets profesionales</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {BRAND_PRESETS.map((preset) => {
            const isSelected = selectedPresetId === preset.id
            const accent = preset.tokens.accent || '#ff4b0b'
            const bg = preset.tokens.background || '#ffffff'
            const Icon = PRESET_ICONS[preset.id] || Sparkles

            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleSelectPreset(preset)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'border-accent bg-accent/5 ring-1 ring-accent/30 shadow-xs'
                    : 'border-line bg-white hover:border-accent/40'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <Icon className="w-3.5 h-3.5 text-accent" />
                    <span className="text-xs font-bold text-primary truncate">{preset.name}</span>
                  </div>
                  <div className="flex -space-x-1 shrink-0">
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-white shadow-2xs"
                      style={{ backgroundColor: accent }}
                    />
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-white shadow-2xs"
                      style={{ backgroundColor: bg }}
                    />
                  </div>
                </div>
                <p className="text-[10px] text-primary/60 line-clamp-2 leading-relaxed">
                  {preset.description}
                </p>
              </button>
            )
          })}
        </div>
      </div>

      {/* Paleta de Favoritos */}
      <div className="space-y-2.5 pt-3 border-t border-line">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-primary flex items-center gap-1.5">
            <Bookmark className="w-3.5 h-3.5 text-accent" />
            Colores Guardados
          </h3>
          <button
            type="button"
            onClick={saveFavorite}
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-accent hover:underline"
          >
            <BookmarkPlus className="w-3 h-3" /> Guardar actual
          </button>
        </div>

        <div className="flex flex-wrap gap-1.5 p-2 bg-surface rounded-xl border border-line min-h-[44px]">
          {favorites.length === 0 ? (
            <span className="text-[11px] text-primary/40 italic p-1">No hay colores guardados</span>
          ) : (
            favorites.map((c) => (
              <div key={c} className="group relative">
                <button
                  type="button"
                  onClick={() => onApplyColor(c)}
                  className="w-6 h-6 rounded-md border border-black/10 transition-transform hover:scale-110 shadow-2xs block"
                  style={{ backgroundColor: c }}
                  title={`${c} (Clic para usar)`}
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    removeFavorite(c)
                  }}
                  className="absolute -top-1 -right-1 hidden group-hover:flex w-3.5 h-3.5 bg-rose-600 text-white rounded-full items-center justify-center shadow-xs"
                  title="Eliminar"
                >
                  <Trash2 className="w-2 h-2" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
