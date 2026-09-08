import React, { useState } from 'react'
import { Copy, Check, Download, Code2 } from 'lucide-react'
import type { ThemeTokens } from '../types'
import { generateTonalScale } from '../utils/colorUtils'

interface TokenExporterProps {
  theme: ThemeTokens
}

type ExportFormat = 'css' | 'tailwind4' | 'json'

export function TokenExporter({ theme }: TokenExporterProps) {
  const [format, setFormat] = useState<ExportFormat>('css')
  const [copied, setCopied] = useState(false)

  const tonalScale = generateTonalScale(theme.accent)

  const cssTokens = `:root {
  /* Marca Principal */
  --accent: ${theme.accent};
  --accent-light: ${theme.accentLight || tonalScale['400']};
  --accent-dark: ${theme.accentDark || tonalScale['700']};
  
  /* Superficie y Texto */
  --background: ${theme.background};
  --surface: ${theme.surface};
  --ink: ${theme.ink};
  --muted: ${theme.muted};
  --border: ${theme.border};
  
  /* Tipografía y Espaciado */
  --font-display: ${theme.fontDisplay};
  --font-body: ${theme.fontBody};
  --heading-size: ${theme.headingSize};
  --body-size: ${theme.bodySize};
  --radius: ${theme.radius}px;
  --space: ${theme.spacing}px;
  --btn-style: ${theme.buttonStyle};
  
  /* Degradado */
  --gradient-brand: linear-gradient(${theme.gradient.angle}deg, ${theme.gradient.from}, ${theme.gradient.via ? theme.gradient.via + ', ' : ''}${theme.gradient.to});
}`

  const tailwind4Tokens = `@theme {
  --color-accent: ${theme.accent};
  --color-accent-light: ${theme.accentLight || tonalScale['400']};
  --color-accent-dark: ${theme.accentDark || tonalScale['700']};
  
  --color-background: ${theme.background};
  --color-surface: ${theme.surface};
  --color-ink: ${theme.ink};
  --color-muted: ${theme.muted};
  --color-border: ${theme.border};
  
  --font-display: ${theme.fontDisplay};
  --font-sans: ${theme.fontBody};
  
  --radius-brand: ${theme.radius}px;
}`

  const jsonTokens = JSON.stringify(
    {
      theme: {
        colors: {
          accent: theme.accent,
          accentLight: theme.accentLight || tonalScale['400'],
          accentDark: theme.accentDark || tonalScale['700'],
          background: theme.background,
          surface: theme.surface,
          ink: theme.ink,
          muted: theme.muted,
          border: theme.border,
          tonalScale,
        },
        typography: {
          fontDisplay: theme.fontDisplay,
          fontBody: theme.fontBody,
          headingSize: theme.headingSize,
          bodySize: theme.bodySize,
        },
        layout: {
          radius: theme.radius,
          spacing: theme.spacing,
          buttonStyle: theme.buttonStyle,
        },
        gradient: theme.gradient,
      },
    },
    null,
    2
  )

  const activeContent = format === 'css' ? cssTokens : format === 'tailwind4' ? tailwind4Tokens : jsonTokens

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(activeContent)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      // Fallback
    }
  }

  const handleDownload = () => {
    const filename = format === 'json' ? 'theme-tokens.json' : 'theme-tokens.css'
    const blob = new Blob([activeContent], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="bg-white border border-line rounded-xl p-5 space-y-4 shadow-2xs">
      <div className="flex items-center justify-between">
        <h2 className="text-[11px] font-bold uppercase tracking-widest text-primary/70 flex items-center gap-1.5">
          <Code2 className="w-3.5 h-3.5 text-accent" />
          Exportación de Tokens
        </h2>

        {/* Selector de formato */}
        <div className="flex bg-surface rounded-lg p-0.5 border border-line">
          <button
            type="button"
            onClick={() => setFormat('css')}
            className={`text-[10px] font-bold px-2 py-1 rounded-md transition-colors ${
              format === 'css' ? 'bg-primary text-white shadow-xs' : 'text-primary/60 hover:text-primary'
            }`}
          >
            CSS :root
          </button>
          <button
            type="button"
            onClick={() => setFormat('tailwind4')}
            className={`text-[10px] font-bold px-2 py-1 rounded-md transition-colors ${
              format === 'tailwind4' ? 'bg-primary text-white shadow-xs' : 'text-primary/60 hover:text-primary'
            }`}
          >
            Tailwind 4
          </button>
          <button
            type="button"
            onClick={() => setFormat('json')}
            className={`text-[10px] font-bold px-2 py-1 rounded-md transition-colors ${
              format === 'json' ? 'bg-primary text-white shadow-xs' : 'text-primary/60 hover:text-primary'
            }`}
          >
            JSON
          </button>
        </div>
      </div>

      {/* Visor de código */}
      <div className="relative">
        <pre className="bg-[#0f172a] text-emerald-300 rounded-xl p-4 text-[11px] font-mono leading-relaxed overflow-x-auto max-h-72 border border-slate-800 shadow-inner">
          {activeContent}
        </pre>
      </div>

      {/* Botones de acción */}
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center justify-center gap-1.5 bg-accent hover:bg-accent-dark text-white font-bold py-2 px-3 rounded-lg text-xs transition-all active:scale-[0.98] shadow-xs"
        >
          {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? 'Copiado' : 'Copiar'}
        </button>

        <button
          type="button"
          onClick={handleDownload}
          className="inline-flex items-center justify-center gap-1.5 bg-surface hover:bg-slate-200 text-primary/80 font-bold py-2 px-3 rounded-lg text-xs border border-line transition-all active:scale-[0.98]"
        >
          <Download className="w-3.5 h-3.5" /> Descargar
        </button>
      </div>

      <p className="text-[10px] text-primary/50 leading-relaxed">
        Pega estos tokens en tu aplicación web o panel de administración para heredar todo el sistema de diseño instantáneamente.
      </p>
    </div>
  )
}
