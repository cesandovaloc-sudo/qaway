import React, { useState } from 'react'
import {
  Palette,
  Layers,
  ShieldCheck,
  Workflow,
  SlidersHorizontal,
  Sun,
  Moon,
  RotateCcw,
  Download,
  ChevronDown,
  Sparkles,
} from 'lucide-react'
import { useTheme } from './context/ThemeContext'
import { ColorField } from './components/ColorField'
import { HarmonyCanvas } from './components/HarmonyCanvas'
import { GradientCanvas } from './components/GradientCanvas'
import { ContrastCanvas } from './components/ContrastCanvas'
import { TokenHierarchyCanvas } from './components/TokenHierarchyCanvas'
import { BrandSimulatorCanvas } from './components/BrandSimulatorCanvas'
import { ExportModal } from './components/ExportModal'
import { BRAND_PRESETS } from './data/brandPresets'
import type { BrandPreset, ColorMode, DesignSystemTheme } from './types'
import { buildPrimitiveTokens, buildSemanticTokens } from './utils/colorUtils'

const FONTS = [
  { label: 'Outfit (Modern Sans)', value: "'Outfit', system-ui, sans-serif" },
  { label: 'Space Grotesk (Tech / Bold)', value: "'Space Grotesk', system-ui, sans-serif" },
  { label: 'Inter (Clean Corporate)', value: "'Inter', system-ui, sans-serif" },
  { label: 'JetBrains Mono (Code)', value: "'JetBrains Mono', monospace" },
  { label: 'Georgia (Editorial Serif)', value: "Georgia, 'Times New Roman', serif" },
]

export type SidebarTab = 'colors' | 'harmonies' | 'gradients' | 'contrast' | 'tokens' | 'typography'

interface ThemeStudioProps {
  embedded?: boolean
  onExportTokens?: (theme: DesignSystemTheme) => void
  title?: string
}

export function ThemeStudio({
  _embedded = false,
  _onExportTokens,
  _title = 'Theme Studio Pro',
}: ThemeStudioProps & { _embedded?: boolean; _onExportTokens?: (t: DesignSystemTheme) => void; _title?: string }) {
  const { theme, setToken, applyPreset, reset } = useTheme()
  const [sidebarTab, setSidebarTab] = useState<SidebarTab>('colors')
  const [activePresetId, setActivePresetId] = useState<string>('qaway-official')
  const [colorMode, setColorMode] = useState<ColorMode>('light')
  const [isExportOpen, setIsExportOpen] = useState(false)

  const primitives = buildPrimitiveTokens(theme.accent, theme.ink)
  const semantics = buildSemanticTokens(primitives, theme.radius, theme.buttonStyle)

  const designSystemTheme: DesignSystemTheme = {
    mode: colorMode,
    brandHex: theme.accent,
    neutralHex: theme.ink,
    fontDisplay: theme.fontDisplay,
    fontBody: theme.fontBody,
    headingSize: theme.headingSize,
    bodySize: theme.bodySize,
    radiusValue: theme.radius,
    buttonStyle: theme.buttonStyle,
    gradient: theme.gradient,
    primitives,
    semantics,
  }

  const handleSelectPreset = (preset: BrandPreset) => {
    setActivePresetId(preset.id)
    applyPreset(preset)
  }

  const handleToggleColorMode = (mode: ColorMode) => {
    setColorMode(mode)
    if (mode === 'dark') {
      setToken('background', '#0c0a09')
      setToken('surface', '#1c1917')
      setToken('ink', '#fafaf9')
    } else {
      setToken('background', '#ffffff')
      setToken('surface', '#f8fafc')
      setToken('ink', '#0f172a')
    }
  }

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col antialiased">
      {/* ========================================================= */}
      {/* BARRA SUPERIOR DE ESTUDIO                                 */}
      {/* ========================================================= */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-2xs">
        <div className="max-w-[1720px] mx-auto px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span
              className="w-8 h-8 rounded-xl flex items-center justify-center font-black text-sm text-white shadow-sm transition-colors"
              style={{ backgroundColor: theme.accent }}
            >
              Q
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-black tracking-tight text-slate-900">Theme Studio</h1>
                <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-slate-600">
                  Live Workbench
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Toggle Modo Claro / Oscuro */}
            <div className="flex items-center gap-0.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => handleToggleColorMode('light')}
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                  colorMode === 'light' ? 'bg-white text-amber-500 shadow-2xs' : 'text-slate-400 hover:text-slate-700'
                }`}
                title="Modo Claro"
              >
                <Sun className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => handleToggleColorMode('dark')}
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                  colorMode === 'dark' ? 'bg-slate-900 text-indigo-400 shadow-2xs' : 'text-slate-400 hover:text-slate-700'
                }`}
                title="Modo Oscuro"
              >
                <Moon className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Selector de Presets de Marca */}
            <div className="relative inline-block">
              <select
                value={activePresetId}
                onChange={(e) => {
                  const found = BRAND_PRESETS.find((p) => p.id === e.target.value)
                  if (found) handleSelectPreset(found)
                }}
                className="appearance-none bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-1.5 pr-8 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900/10 cursor-pointer shadow-2xs"
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
              onClick={reset}
              className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              title="Restablecer valores originales"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => setIsExportOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-1.5 text-white text-xs font-bold rounded-xl shadow-sm transition-all hover:opacity-90 active:scale-95 cursor-pointer"
              style={{ backgroundColor: theme.accent }}
            >
              <Download className="w-3.5 h-3.5" />
              Exportar Tokens
            </button>
          </div>
        </div>
      </header>

      {/* ========================================================= */}
      {/* WORKBENCH EN PARALELO (LADO A LADO)                       */}
      {/* ========================================================= */}
      <main className="flex-1 max-w-[1720px] w-full mx-auto px-4 sm:px-6 py-5 grid grid-cols-1 lg:grid-cols-[440px_1fr] gap-6 items-start">
        {/* ========================================================= */}
        {/* PANEL IZQUIERDO: HERRAMIENTAS & INSPECTOR (En Vivo)      */}
        {/* ========================================================= */}
        <aside className="bg-white rounded-3xl border border-slate-200 shadow-sm p-4 space-y-4 lg:sticky lg:top-18 max-h-[calc(100vh-88px)] overflow-y-auto">
          {/* Navegación por Pestañas del Inspector */}
          <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200 overflow-x-auto">
            <button
              type="button"
              onClick={() => setSidebarTab('colors')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                sidebarTab === 'colors' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Palette className="w-3.5 h-3.5" /> Colores
            </button>

            <button
              type="button"
              onClick={() => setSidebarTab('harmonies')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                sidebarTab === 'harmonies' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" /> Armonías
            </button>

            <button
              type="button"
              onClick={() => setSidebarTab('gradients')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                sidebarTab === 'gradients' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" /> Degradados
            </button>

            <button
              type="button"
              onClick={() => setSidebarTab('contrast')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                sidebarTab === 'contrast' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" /> Contraste
            </button>

            <button
              type="button"
              onClick={() => setSidebarTab('tokens')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                sidebarTab === 'tokens' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Workflow className="w-3.5 h-3.5 text-blue-600" /> 3 Capas
            </button>

            <button
              type="button"
              onClick={() => setSidebarTab('typography')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                sidebarTab === 'typography' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" /> Layout
            </button>
          </div>

          {/* CONTENIDO 1: SELECTORES DE COLOR DIRECTOS */}
          {sidebarTab === 'colors' && (
            <div className="space-y-3 animate-in fade-in duration-150">
              <ColorField
                label="Color de Acento (Brand Accent)"
                value={theme.accent}
                onChange={(v) => setToken('accent', v)}
                swatches={['#ff4b0b', '#f59e0b', '#1e3a8a', '#6366f1', '#059669', '#c2410c', '#0f172a']}
                description="Botones, enlaces y elementos activos"
              />

              <ColorField
                label="Fondo de Página (Background)"
                value={theme.background}
                onChange={(v) => setToken('background', v)}
                swatches={['#ffffff', '#f8fafc', '#090d16', '#0c0a09', '#f0fdf4', '#fffbeb']}
                description="Lienzo base de la interfaz"
              />

              <ColorField
                label="Superficies y Tarjetas (Surface)"
                value={theme.surface}
                onChange={(v) => setToken('surface', v)}
                swatches={['#f8fafc', '#ffffff', '#111827', '#1c1917', '#f1f5f9', '#fef3c7']}
                description="Tarjetas, paneles y barras de navegación"
              />

              <ColorField
                label="Tinta y Tipografía (Ink / Text)"
                value={theme.ink}
                onChange={(v) => setToken('ink', v)}
                swatches={['#0f172a', '#fafaf9', '#f9fafb', '#064e3b', '#451a03', '#111111']}
                description="Texto principal y titulares"
              />
            </div>
          )}

          {/* CONTENIDO 2: ARMONÍAS CROMÁTICAS */}
          {sidebarTab === 'harmonies' && (
            <div className="animate-in fade-in duration-150">
              <HarmonyCanvas
                theme={theme}
                onApplyAccent={(c) => setToken('accent', c)}
                onApplyBackground={(c) => setToken('background', c)}
              />
            </div>
          )}

          {/* CONTENIDO 3: DEGRADADOS LINEALES */}
          {sidebarTab === 'gradients' && (
            <div className="animate-in fade-in duration-150">
              <GradientCanvas
                gradient={theme.gradient}
                onChange={(g) => setToken('gradient', g)}
              />
            </div>
          )}

          {/* CONTENIDO 4: AUDITORÍA DE CONTRASTE WCAG */}
          {sidebarTab === 'contrast' && (
            <div className="animate-in fade-in duration-150">
              <ContrastCanvas
                theme={theme}
                onApplyTextColor={(c) => setToken('ink', c)}
              />
            </div>
          )}

          {/* CONTENIDO 5: JERARQUÍA DE 3 CAPAS */}
          {sidebarTab === 'tokens' && (
            <div className="animate-in fade-in duration-150">
              <TokenHierarchyCanvas
                theme={designSystemTheme}
                onToggleMode={handleToggleColorMode}
              />
            </div>
          )}

          {/* CONTENIDO 6: TIPOGRAFÍA Y BORDES */}
          {sidebarTab === 'typography' && (
            <div className="space-y-4 p-1 animate-in fade-in duration-150">
              <div>
                <label htmlFor="font-display-select" className="text-xs font-bold text-slate-700 mb-1.5 block">
                  Fuente de Títulos (Display)
                </label>
                <select
                  id="font-display-select"
                  value={theme.fontDisplay}
                  onChange={(e) => setToken('fontDisplay', e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-slate-900 shadow-2xs"
                >
                  {FONTS.map((f) => (
                    <option key={f.value} value={f.value}>
                      {f.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="font-body-select" className="text-xs font-bold text-slate-700 mb-1.5 block">
                  Fuente de Cuerpo (Body)
                </label>
                <select
                  id="font-body-select"
                  value={theme.fontBody}
                  onChange={(e) => setToken('fontBody', e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-slate-900 shadow-2xs"
                >
                  {FONTS.map((f) => (
                    <option key={f.value} value={f.value}>
                      {f.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1.5">
                  <span>Tamaño Título Principal</span>
                  <span className="font-mono text-[10px] text-slate-400">{theme.headingSize}</span>
                </div>
                <input
                  type="range"
                  min={1.8}
                  max={3.8}
                  step={0.1}
                  value={parseFloat(theme.headingSize)}
                  onChange={(e) => setToken('headingSize', `${e.target.value}rem`)}
                  className="w-full accent-slate-900"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 mb-1.5 block">
                  Estilo de Botones
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['solid', 'outline', 'pill'] as const).map((style) => (
                    <button
                      key={style}
                      type="button"
                      onClick={() => setToken('buttonStyle', style)}
                      className={`py-2 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer ${
                        theme.buttonStyle === style
                          ? 'bg-slate-900 text-white shadow-xs'
                          : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {style}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1.5">
                  <span>Curvatura de Bordes (Radius)</span>
                  <span className="font-mono text-[10px] text-slate-400">{theme.radius}px</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={24}
                  step={2}
                  value={theme.radius}
                  onChange={(e) => setToken('radius', Number(e.target.value))}
                  className="w-full accent-slate-900"
                />
              </div>
            </div>
          )}
        </aside>

        {/* ========================================================= */}
        {/* PANEL DERECHO: VISTA PREVIA EN VIVO CONSTANTE (Live Stage)*/}
        {/* ========================================================= */}
        <section className="space-y-4">
          <BrandSimulatorCanvas
            theme={theme}
            activePresetId={activePresetId}
          />
        </section>
      </main>

      {/* Modal Universal de Exportación de Tokens */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        theme={designSystemTheme}
      />
    </div>
  )
}
