import React, { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import type { BrandPreset, ThemeTokens } from '../types'
import { BRAND_PRESETS } from '../data/brandPresets'

export const DEFAULT_THEME: ThemeTokens = (BRAND_PRESETS[0]?.tokens as ThemeTokens) || {
  accent: '#ff4b0b',
  accentLight: '#ff7844',
  accentDark: '#dc3d00',
  background: '#ffffff',
  surface: '#f8fafc',
  ink: '#0f172a',
  muted: '#5b6472',
  border: '#e2e8f0',
  fontDisplay: "'Outfit', system-ui, sans-serif",
  fontBody: "'Outfit', system-ui, sans-serif",
  headingSize: '2.5rem',
  bodySize: '1rem',
  radius: 12,
  buttonStyle: 'solid',
  spacing: 24,
  gradient: { angle: 135, from: '#ff4b0b', via: '#ff7844', to: '#0f172a' },
}

interface ThemeContextValue {
  theme: ThemeTokens
  setToken: <K extends keyof ThemeTokens>(key: K, value: ThemeTokens[K]) => void
  applyPreset: (preset: BrandPreset) => void
  reset: () => void
  cssTokens: string
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

export function ThemeProvider({
  children,
  initialTheme,
}: {
  children: ReactNode
  initialTheme?: Partial<ThemeTokens>
}) {
  const [theme, setTheme] = useState<ThemeTokens>({
    ...DEFAULT_THEME,
    ...initialTheme,
  })

  const setToken = useCallback(<K extends keyof ThemeTokens>(key: K, value: ThemeTokens[K]) => {
    setTheme((t) => ({ ...t, [key]: value }))
  }, [])

  const applyPreset = useCallback((preset: BrandPreset) => {
    setTheme((t) => ({
      ...t,
      ...preset.tokens,
    }))
  }, [])

  const reset = useCallback(() => setTheme(DEFAULT_THEME), [])

  const gradientRule = theme.gradient.via
    ? `linear-gradient(${theme.gradient.angle}deg, ${theme.gradient.from}, ${theme.gradient.via}, ${theme.gradient.to})`
    : `linear-gradient(${theme.gradient.angle}deg, ${theme.gradient.from}, ${theme.gradient.to})`

  const cssTokens = `:root {
  --accent: ${theme.accent};
  --accent-light: ${theme.accentLight || theme.accent};
  --accent-dark: ${theme.accentDark || theme.accent};
  --background: ${theme.background};
  --surface: ${theme.surface};
  --ink: ${theme.ink};
  --muted: ${theme.muted};
  --border: ${theme.border};
  --font-display: ${theme.fontDisplay};
  --font-body: ${theme.fontBody};
  --heading-size: ${theme.headingSize};
  --body-size: ${theme.bodySize};
  --radius: ${theme.radius}px;
  --btn-style: ${theme.buttonStyle};
  --space: ${theme.spacing}px;
  --gradient-brand: ${gradientRule};
}`

  return (
    <ThemeContext.Provider value={{ theme, setToken, applyPreset, reset, cssTokens }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme debe usarse dentro de ThemeProvider')
  return ctx
}
