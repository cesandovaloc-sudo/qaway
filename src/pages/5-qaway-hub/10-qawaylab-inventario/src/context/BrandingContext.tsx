import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'

export interface BrandingConfig {
  // Colores principales
  primaryColor: string
  secondaryColor: string
  accentColor: string
  
  // Fondo
  backgroundColor: string
  surfaceColor: string
  
  // Texto
  textColor: string
  mutedTextColor: string
  
  // Bordes
  borderRadius: number
  borderWidth: number
  
  // Logo
  logoUrl: string | null
  logoText: string
  
  // Sidebar
  sidebarBg: string
  sidebarText: string
  
  // Header
  headerBg: string
  headerText: string
}

const defaultBranding: BrandingConfig = {
  primaryColor: '#6366f1',
  secondaryColor: '#8b5cf6',
  accentColor: '#f59e0b',
  backgroundColor: '#0a0a0f',
  surfaceColor: '#111118',
  textColor: '#ffffff',
  mutedTextColor: '#a1a1aa',
  borderRadius: 8,
  borderWidth: 1,
  logoUrl: null,
  logoText: 'Inventario',
  sidebarBg: '#0a0a0f',
  sidebarText: '#ffffff',
  headerBg: '#111118',
  headerText: '#ffffff',
}

interface BrandingContextType {
  branding: BrandingConfig
  updateBranding: (updates: Partial<BrandingConfig>) => void
  resetBranding: () => void
}

const BrandingContext = createContext<BrandingContextType | undefined>(undefined)

export function BrandingProvider({ children }: { children: ReactNode }) {
  const [branding, setBranding] = useState<BrandingConfig>(() => {
    const saved = localStorage.getItem('qawaylab-branding')
    return saved ? { ...defaultBranding, ...JSON.parse(saved) } : defaultBranding
  })

  useEffect(() => {
    localStorage.setItem('qawaylab-branding', JSON.stringify(branding))
    
    // Aplicar variables CSS
    const root = document.documentElement
    root.style.setProperty('--brand', branding.primaryColor)
    root.style.setProperty('--brand-light', branding.secondaryColor)
    root.style.setProperty('--ink', branding.sidebarBg)
    root.style.setProperty('--surface', branding.surfaceColor)
    root.style.setProperty('--bg', branding.backgroundColor)
    root.style.setProperty('--border-radius', `${branding.borderRadius}px`)
  }, [branding])

  function updateBranding(updates: Partial<BrandingConfig>) {
    setBranding(prev => ({ ...prev, ...updates }))
  }

  function resetBranding() {
    setBranding(defaultBranding)
    localStorage.removeItem('qawaylab-branding')
  }

  return (
    <BrandingContext.Provider value={{ branding, updateBranding, resetBranding }}>
      {children}
    </BrandingContext.Provider>
  )
}

export function useBranding() {
  const context = useContext(BrandingContext)
  if (!context) {
    throw new Error('useBranding must be used within a BrandingProvider')
  }
  return context
}
