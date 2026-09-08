import { useBranding, type BrandingConfig } from '@/context/BrandingContext'
import { Palette, Upload, RotateCcw } from 'lucide-react'

const colorPresets: { name: string; config: Partial<BrandingConfig> }[] = [
  { 
    name: 'Default (Indigo)', 
    config: { primaryColor: '#6366f1', secondaryColor: '#8b5cf6', accentColor: '#f59e0b' }
  },
  { 
    name: 'Ocean (Blue)', 
    config: { primaryColor: '#3b82f6', secondaryColor: '#60a5fa', accentColor: '#10b981' }
  },
  { 
    name: 'Forest (Green)', 
    config: { primaryColor: '#22c55e', secondaryColor: '#4ade80', accentColor: '#f97316' }
  },
  { 
    name: 'Sunset (Orange)', 
    config: { primaryColor: '#f97316', secondaryColor: '#fb923c', accentColor: '#8b5cf6' }
  },
  { 
    name: 'Royal (Purple)', 
    config: { primaryColor: '#a855f7', secondaryColor: '#c084fc', accentColor: '#f59e0b' }
  },
  { 
    name: 'Crimson (Red)', 
    config: { primaryColor: '#ef4444', secondaryColor: '#f87171', accentColor: '#3b82f6' }
  },
]

export function BrandingSettings() {
  const { branding, updateBranding, resetBranding } = useBranding()

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        updateBranding({ logoUrl: event.target?.result as string })
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">Branding & Personalización</h3>
          <p className="text-muted-light/60 text-sm">Personaliza los colores, logo y estilos de tu app</p>
        </div>
        <button
          onClick={resetBranding}
          className="flex items-center gap-2 px-3 py-1.5 text-muted-light hover:text-white text-sm transition-colors"
        >
          <RotateCcw size={14} />
          Restablecer
        </button>
      </div>

      {/* Logo */}
      <div className="bg-surface border border-white/10 rounded-xl p-4">
        <label className="block text-xs font-mono uppercase tracking-wider text-muted-light/60 mb-3">Logo</label>
        <div className="flex items-center gap-4">
          {branding.logoUrl ? (
            <img src={branding.logoUrl} alt="Logo" className="w-16 h-16 rounded-lg object-contain bg-white/5" />
          ) : (
            <div className="w-16 h-16 rounded-lg bg-brand/10 flex items-center justify-center">
              <Palette size={24} className="text-brand" />
            </div>
          )}
          <div>
            <label className="flex items-center gap-2 px-4 py-2 bg-surface border border-gray-300 rounded-lg text-sm text-ink cursor-pointer hover:bg-gray-100 transition-colors">
              <Upload size={14} />
              Subir Logo
              <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
            </label>
            <p className="text-xs text-muted-light/40 mt-1">PNG, SVG o JPG (max 2MB)</p>
          </div>
        </div>
        <div className="mt-4">
          <label className="block text-xs text-muted-light/60 mb-1">Texto del logo</label>
          <input
            type="text"
            value={branding.logoText}
            onChange={(e) => updateBranding({ logoText: e.target.value })}
            className="w-full px-3 py-2 bg-background border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand/50"
          />
        </div>
      </div>

      {/* Color presets */}
      <div className="bg-surface border border-white/10 rounded-xl p-4">
        <label className="block text-xs font-mono uppercase tracking-wider text-muted-light/60 mb-3">Temas Predefinidos</label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {colorPresets.map(preset => (
            <button
              key={preset.name}
              onClick={() => updateBranding(preset.config)}
              className="flex items-center gap-2 p-3 bg-background rounded-lg border border-white/10 hover:border-brand/50 transition-colors text-left"
            >
              <div className="flex gap-1">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: preset.config.primaryColor }} />
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: preset.config.secondaryColor }} />
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: preset.config.accentColor }} />
              </div>
              <span className="text-xs text-muted-light">{preset.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Custom colors */}
      <div className="bg-surface border border-white/10 rounded-xl p-4">
        <label className="block text-xs font-mono uppercase tracking-wider text-muted-light/60 mb-3">Colores Personalizados</label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs text-muted-light/60 mb-1">Color Principal</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={branding.primaryColor}
                onChange={(e) => updateBranding({ primaryColor: e.target.value })}
                className="w-10 h-10 rounded cursor-pointer"
              />
              <input
                type="text"
                value={branding.primaryColor}
                onChange={(e) => updateBranding({ primaryColor: e.target.value })}
                className="flex-1 px-3 py-2 bg-background border border-white/10 rounded-lg text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand/50"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs text-muted-light/60 mb-1">Color Secundario</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={branding.secondaryColor}
                onChange={(e) => updateBranding({ secondaryColor: e.target.value })}
                className="w-10 h-10 rounded cursor-pointer"
              />
              <input
                type="text"
                value={branding.secondaryColor}
                onChange={(e) => updateBranding({ secondaryColor: e.target.value })}
                className="flex-1 px-3 py-2 bg-background border border-white/10 rounded-lg text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand/50"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs text-muted-light/60 mb-1">Color de Acento</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={branding.accentColor}
                onChange={(e) => updateBranding({ accentColor: e.target.value })}
                className="w-10 h-10 rounded cursor-pointer"
              />
              <input
                type="text"
                value={branding.accentColor}
                onChange={(e) => updateBranding({ accentColor: e.target.value })}
                className="flex-1 px-3 py-2 bg-background border border-white/10 rounded-lg text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand/50"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Border radius */}
      <div className="bg-surface border border-white/10 rounded-xl p-4">
        <label className="block text-xs font-mono uppercase tracking-wider text-muted-light/60 mb-3">Estilos</label>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-muted-light/60 mb-1">Border Radius ({branding.borderRadius}px)</label>
            <input
              type="range"
              min="0"
              max="24"
              value={branding.borderRadius}
              onChange={(e) => updateBranding({ borderRadius: parseInt(e.target.value) })}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-xs text-muted-light/60 mb-1">Border Width ({branding.borderWidth}px)</label>
            <input
              type="range"
              min="0"
              max="4"
              value={branding.borderWidth}
              onChange={(e) => updateBranding({ borderWidth: parseInt(e.target.value) })}
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* Preview */}
      <div className="bg-surface border border-white/10 rounded-xl p-4">
        <label className="block text-xs font-mono uppercase tracking-wider text-muted-light/60 mb-3">Vista Previa</label>
        <div className="flex items-center gap-4 p-4 rounded-lg" style={{ backgroundColor: branding.backgroundColor }}>
          <div 
            className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold"
            style={{ backgroundColor: branding.primaryColor }}
          >
            {branding.logoText.charAt(0)}
          </div>
          <div>
            <p className="text-white font-medium">{branding.logoText}</p>
            <p className="text-sm" style={{ color: branding.mutedTextColor }}>Tu negocio</p>
          </div>
        </div>
      </div>
    </div>
  )
}
