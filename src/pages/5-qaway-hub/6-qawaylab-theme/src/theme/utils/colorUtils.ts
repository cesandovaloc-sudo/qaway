import { colord, extend } from 'colord'
import harmoniesPlugin from 'colord/plugins/harmonies'
import a11yPlugin from 'colord/plugins/a11y'
import type {
  ColorFormat,
  HarmonyGroup,
  TonalPalette,
  TonalStep,
  WCAGAudit,
  PrimitiveTokens,
  SemanticTokens,
} from '../types'

extend([harmoniesPlugin, a11yPlugin])

export function isValidHexColor(value: string): boolean {
  if (!value || typeof value !== 'string') return false
  return colord(value.trim()).isValid()
}

export function formatColorString(hex: string, format: ColorFormat): string {
  const c = colord(hex)
  if (!c.isValid()) return hex

  switch (format) {
    case 'rgb':
      return c.toRgbString()
    case 'hsl':
      return c.toHslString()
    case 'hex':
    default:
      return c.toHex()
  }
}

export function generateTonalScale(baseHex: string): TonalPalette {
  const c = colord(isValidHexColor(baseHex) ? baseHex : '#ff4b0b')

  const steps: { step: TonalStep; lightness: number }[] = [
    { step: '50', lightness: 0.96 },
    { step: '100', lightness: 0.90 },
    { step: '200', lightness: 0.80 },
    { step: '300', lightness: 0.70 },
    { step: '400', lightness: 0.60 },
    { step: '500', lightness: 0.50 },
    { step: '600', lightness: 0.40 },
    { step: '700', lightness: 0.30 },
    { step: '800', lightness: 0.20 },
    { step: '900', lightness: 0.12 },
    { step: '950', lightness: 0.06 },
  ]

  const palette = {} as TonalPalette
  const hsl = c.toHsl()

  for (const { step, lightness } of steps) {
    if (step === '500') {
      palette[step] = c.toHex()
    } else {
      palette[step] = colord({ h: hsl.h, s: hsl.s, l: lightness * 100 }).toHex()
    }
  }

  return palette
}

/**
 * Genera la Capa 1: Tokens Primitivos
 */
export function buildPrimitiveTokens(brandHex: string, neutralHex = '#64748b'): PrimitiveTokens {
  return {
    brand: generateTonalScale(brandHex),
    neutral: generateTonalScale(neutralHex),
    success: generateTonalScale('#16a34a'),
    warning: generateTonalScale('#f59e0b'),
    danger: generateTonalScale('#ef4444'),
    radii: {
      none: '0px',
      sm: '4px',
      md: '8px',
      lg: '12px',
      xl: '16px',
      full: '9999px',
    },
    spacing: {
      1: '4px',
      2: '8px',
      3: '12px',
      4: '16px',
      6: '24px',
      8: '32px',
      12: '48px',
    },
  }
}

/**
 * Genera la Capa 2: Tokens Semánticos (Light y Dark)
 */
export function buildSemanticTokens(primitives: PrimitiveTokens, radiusPx: number, btnStyle: 'solid' | 'outline' | 'pill'): { light: SemanticTokens; dark: SemanticTokens } {
  const light: SemanticTokens = {
    bgPage: primitives.neutral['50'],
    bgSurface: '#ffffff',
    bgSurfaceRaised: primitives.neutral['100'],
    bgSurfaceOverlay: 'rgba(15, 23, 42, 0.4)',
    actionPrimary: primitives.brand['500'],
    actionPrimaryHover: primitives.brand['600'],
    actionPrimaryActive: primitives.brand['700'],
    actionPrimaryText: '#ffffff',
    actionSecondary: primitives.neutral['100'],
    actionSecondaryText: primitives.neutral['900'],
    textPrimary: primitives.neutral['950'],
    textSecondary: primitives.neutral['700'],
    textMuted: primitives.neutral['500'],
    textOnAccent: '#ffffff',
    borderDefault: primitives.neutral['200'],
    borderSubtle: primitives.neutral['100'],
    borderStrong: primitives.neutral['400'],
    feedbackSuccess: primitives.success['500'],
    feedbackWarning: primitives.warning['500'],
    feedbackDanger: primitives.danger['500'],
    radiusDefault: `${radiusPx}px`,
    buttonStyle: btnStyle,
  }

  const dark: SemanticTokens = {
    bgPage: primitives.neutral['950'],
    bgSurface: primitives.neutral['900'],
    bgSurfaceRaised: primitives.neutral['800'],
    bgSurfaceOverlay: 'rgba(0, 0, 0, 0.7)',
    actionPrimary: primitives.brand['500'],
    actionPrimaryHover: primitives.brand['400'],
    actionPrimaryActive: primitives.brand['300'],
    actionPrimaryText: '#ffffff',
    actionSecondary: primitives.neutral['800'],
    actionSecondaryText: primitives.neutral['100'],
    textPrimary: primitives.neutral['50'],
    textSecondary: primitives.neutral['300'],
    textMuted: primitives.neutral['400'],
    textOnAccent: '#ffffff',
    borderDefault: primitives.neutral['800'],
    borderSubtle: primitives.neutral['900'],
    borderStrong: primitives.neutral['600'],
    feedbackSuccess: primitives.success['400'],
    feedbackWarning: primitives.warning['400'],
    feedbackDanger: primitives.danger['400'],
    radiusDefault: `${radiusPx}px`,
    buttonStyle: btnStyle,
  }

  return { light, dark }
}

export function getHarmonies(baseHex: string): HarmonyGroup[] {
  const c = colord(isValidHexColor(baseHex) ? baseHex : '#ff4b0b')

  const toHexArray = (colors: ReturnType<typeof colord>[]): string[] => {
    return colors.map((item) => item.toHex())
  }

  return [
    {
      type: 'analogous',
      title: 'Análogos',
      description: 'Colores contiguos en el círculo cromático. Serenidad y coherencia.',
      colors: toHexArray(c.harmonies('analogous')),
    },
    {
      type: 'complementary',
      title: 'Complementario',
      description: 'Opuesto en el círculo cromático. Máximo contraste y dinamismo.',
      colors: toHexArray(c.harmonies('complementary')),
    },
    {
      type: 'triadic',
      title: 'Tríada',
      description: 'Tres colores equidistantes con balance visual armónico.',
      colors: toHexArray(c.harmonies('triadic')),
    },
    {
      type: 'tetradic',
      title: 'Tetrádico',
      description: 'Dos pares complementarios para paletas de alta riqueza.',
      colors: toHexArray(c.harmonies('tetradic')),
    },
    {
      type: 'split-complementary',
      title: 'Split Complementario',
      description: 'Contraste suave con los adyacentes del complementario.',
      colors: toHexArray(c.harmonies('split-complementary')),
    },
  ]
}

export function getAccessibilityAudit(colorHex: string, bgHex = '#ffffff'): WCAGAudit {
  const c = colord(isValidHexColor(colorHex) ? colorHex : '#ff4b0b')
  const bg = colord(isValidHexColor(bgHex) ? bgHex : '#ffffff')
  const white = colord('#ffffff')
  const dark = colord('#0f172a')

  const ratioVsWhite = Number(c.contrast(white).toFixed(2))
  const ratioVsDark = Number(c.contrast(dark).toFixed(2))
  const ratioVsBg = Number(c.contrast(bg).toFixed(2))

  return {
    ratioVsWhite,
    ratioVsDark,
    ratioVsBg,
    passAANormalWhite: ratioVsWhite >= 4.5,
    passAAANormalWhite: ratioVsWhite >= 7.0,
    passAALargeWhite: ratioVsWhite >= 3.0,
    passAAALargeWhite: ratioVsWhite >= 4.5,
    passAANormalDark: ratioVsDark >= 4.5,
    passAAANormalDark: ratioVsDark >= 7.0,
    passAALargeDark: ratioVsDark >= 3.0,
    passAAALargeDark: ratioVsDark >= 4.5,
    recommendedTextColor: ratioVsDark >= ratioVsWhite ? '#0f172a' : '#ffffff',
  }
}

export function getReadableTextColor(bgHex: string): string {
  const c = colord(isValidHexColor(bgHex) ? bgHex : '#ffffff')
  return c.isDark() ? '#ffffff' : '#0f172a'
}
