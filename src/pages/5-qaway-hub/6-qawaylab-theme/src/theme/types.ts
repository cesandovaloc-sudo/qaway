export type ColorFormat = 'hex' | 'rgb' | 'hsl'
export type TonalStep = '50' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900' | '950'
export type TonalPalette = Record<TonalStep, string>
export type ColorMode = 'light' | 'dark'

export interface GradientConfig {
  angle: number
  from: string
  via?: string
  to: string
}

export interface ThemeTokens {
  accent: string
  accentLight?: string
  accentDark?: string
  neutral?: string
  background: string
  surface: string
  ink: string
  muted: string
  border: string
  fontDisplay: string
  fontBody: string
  headingSize: string
  bodySize: string
  radius: number
  buttonStyle: 'solid' | 'outline' | 'pill'
  spacing: number
  gradient: GradientConfig
}

/**
 * CAPA 1: TOKENS PRIMITIVOS (Global Tokens)
 */
export interface PrimitiveTokens {
  brand: TonalPalette
  neutral: TonalPalette
  success: TonalPalette
  warning: TonalPalette
  danger: TonalPalette
  radii: {
    none: string
    sm: string
    md: string
    lg: string
    xl: string
    full: string
  }
  spacing: {
    1: string
    2: string
    3: string
    4: string
    6: string
    8: string
    12: string
  }
}

/**
 * CAPA 2: TOKENS SEMÁNTICOS (Alias Tokens)
 */
export interface SemanticTokens {
  bgPage: string
  bgSurface: string
  bgSurfaceRaised: string
  bgSurfaceOverlay: string
  
  actionPrimary: string
  actionPrimaryHover: string
  actionPrimaryActive: string
  actionPrimaryText: string
  actionSecondary: string
  actionSecondaryText: string
  
  textPrimary: string
  textSecondary: string
  textMuted: string
  textOnAccent: string
  
  borderDefault: string
  borderSubtle: string
  borderStrong: string
  
  feedbackSuccess: string
  feedbackWarning: string
  feedbackDanger: string
  
  radiusDefault: string
  buttonStyle: 'solid' | 'outline' | 'pill'
}

/**
 * TEMA GLOBAL COMPLETO (3 CAPAS)
 */
export interface DesignSystemTheme {
  mode: ColorMode
  brandHex: string
  neutralHex: string
  fontDisplay: string
  fontBody: string
  headingSize: string
  bodySize: string
  radiusValue: number
  buttonStyle: 'solid' | 'outline' | 'pill'
  gradient: GradientConfig
  primitives: PrimitiveTokens
  semantics: {
    light: SemanticTokens
    dark: SemanticTokens
  }
}

export interface BrandPreset {
  id: string
  name: string
  category: string
  description: string
  tag: string
  tokens: Partial<ThemeTokens> & { accent: string }
}

export interface HarmonyGroup {
  type: string
  title: string
  description: string
  colors: string[]
}

export interface WCAGAudit {
  ratioVsWhite: number
  ratioVsDark: number
  ratioVsBg: number
  passAALargeWhite: boolean
  passAANormalWhite: boolean
  passAAALargeWhite: boolean
  passAAANormalWhite: boolean
  passAALargeDark: boolean
  passAANormalDark: boolean
  passAAALargeDark: boolean
  passAAANormalDark: boolean
  recommendedTextColor: string
}
