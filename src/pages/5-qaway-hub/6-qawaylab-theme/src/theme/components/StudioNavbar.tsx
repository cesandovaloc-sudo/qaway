import React from 'react'
import {
  Palette,
  Layers,
  ShieldCheck,
  Eye,
  RotateCcw,
  Download,
  ChevronDown,
  Sun,
  Moon,
  Workflow,
} from 'lucide-react'
import { BRAND_PRESETS } from '../data/brandPresets'
import type { BrandPreset, ColorMode } from '../types'

export type StudioTab = 'harmonies' | 'gradients' | 'contrast' | 'hierarchy' | 'simulator'

interface StudioNavbarProps {
  activeTab: StudioTab
  onSelectTab: (tab: StudioTab) => void
  activePresetId: string
  onSelectPreset: (preset: BrandPreset) => void
  onReset: () => void
  onOpenExport: () => void
  accentColor: string
  colorMode: ColorMode
  onToggleColorMode: (mode: ColorMode) => void
}

export function StudioNavbar({
  activeTab,
  onSelectTab,
  activePresetId,
  onSelectPreset,
  onReset,
  onOpenExport,
  accentColor,
  colorMode,
  onToggleColorMode,
}: StudioNavbarProps) {
  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-2xs">
      <div className="max-w-[1640px] mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Marca & Identidad */}
        <div className="flex items-center gap-3">
          <span
            className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm text-white shadow-md transition-colors"
            style={{ backgroundColor: accentColor }}
          >
            Q
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-black tracking-tight text-slate-900">Theme Studio</h1>
              <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-slate-700">
                3-Layer Tokens
              </span>
            </div>
          </div>
        </div>

        {/* Pestañas de Herramientas Creativas */}
        <nav className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200 shadow-inner overflow-x-auto">
          <button
            type="button"
            onClick={() => onSelectTab('harmonies')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'harmonies' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            Armonías
          </button>

          <button
            type="button"
            onClick={() => onSelectTab('gradients')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'gradients' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Degradados
          </button>

          <button
            type="button"
            onClick={() => onSelectTab('contrast')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'contrast' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            Contraste
          </button>

          <button
            type="button"
            onClick={() => onSelectTab('hierarchy')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'hierarchy' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Workflow className="w-3.5 h-3.5 text-blue-600" />
            Jerarquía (3 Capas)
          </button>

          <button
            type="button"
            onClick={() => onSelectTab('simulator')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'simulator' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            Simulador
          </button>
        </nav>

        {/* Selector de Presets, Modo Claro/Oscuro & Acciones */}
        <div className="flex items-center gap-2">
          {/* Toggle Light / Dark */}
          <div className="flex items-center gap-0.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => onToggleColorMode('light')}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                colorMode === 'light' ? 'bg-white text-amber-500 shadow-2xs' : 'text-slate-400 hover:text-slate-700'
              }`}
              title="Modo Claro"
            >
              <Sun className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onToggleColorMode('dark')}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                colorMode === 'dark' ? 'bg-slate-900 text-indigo-400 shadow-2xs' : 'text-slate-400 hover:text-slate-700'
              }`}
              title="Modo Oscuro"
            >
              <Moon className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Selector de Presets */}
          <div className="relative inline-block">
            <select
              value={activePresetId}
              onChange={(e) => {
                const found = BRAND_PRESETS.find((p) => p.id === e.target.value)
                if (found) onSelectPreset(found)
              }}
              className="appearance-none bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-2 pr-8 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900/10 cursor-pointer shadow-2xs"
            >
              {BRAND_PRESETS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.tag})
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <button
            type="button"
            onClick={onReset}
            className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            title="Restablecer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={onOpenExport}
            className="inline-flex items-center gap-2 px-4 py-2 text-white text-xs font-bold rounded-xl shadow-sm transition-all hover:opacity-90 active:scale-95 cursor-pointer"
            style={{ backgroundColor: accentColor }}
          >
            <Download className="w-3.5 h-3.5" />
            Exportar Tokens
          </button>
        </div>
      </div>
    </header>
  )
}
