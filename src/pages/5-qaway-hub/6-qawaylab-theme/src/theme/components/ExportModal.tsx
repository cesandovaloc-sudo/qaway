import React, { useState, useEffect } from 'react'
import { X, Copy, Check, Download, FileCode2, Smartphone, Terminal, FileJson } from 'lucide-react'
import type { DesignSystemTheme } from '../types'
import { buildPrimitiveTokens } from '../utils/colorUtils'

interface ExportModalProps {
  isOpen: boolean
  onClose: () => void
  theme: DesignSystemTheme
}

type ExportFormat = 'w3c_json' | 'css_alias' | 'tailwind4' | 'swiftui' | 'compose'

export function ExportModal({ isOpen, onClose, theme }: ExportModalProps) {
  const [format, setFormat] = useState<ExportFormat>('w3c_json')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const primitives = buildPrimitiveTokens(theme.brandHex, theme.neutralHex)

  // 1. W3C Design Tokens Standard JSON (Tokens Studio / Style Dictionary)
  const w3cTokensJson = JSON.stringify(
    {
      $schema: 'https://design-tokens.github.io/community-group/format/',
      color: {
        primitive: {
          brand: Object.fromEntries(
            Object.entries(primitives.brand).map(([k, v]) => [k, { $value: v, $type: 'color' }])
          ),
          neutral: Object.fromEntries(
            Object.entries(primitives.neutral).map(([k, v]) => [k, { $value: v, $type: 'color' }])
          ),
        },
        semantic: {
          light: {
            'bg-page': { $value: '{color.primitive.neutral.50}', $type: 'color' },
            'bg-surface': { $value: '#ffffff', $type: 'color' },
            'action-primary': { $value: '{color.primitive.brand.500}', $type: 'color' },
            'text-primary': { $value: '{color.primitive.neutral.950}', $type: 'color' },
            'text-muted': { $value: '{color.primitive.neutral.500}', $type: 'color' },
            'border-default': { $value: '{color.primitive.neutral.200}', $type: 'color' },
          },
          dark: {
            'bg-page': { $value: '{color.primitive.neutral.950}', $type: 'color' },
            'bg-surface': { $value: '{color.primitive.neutral.900}', $type: 'color' },
            'action-primary': { $value: '{color.primitive.brand.500}', $type: 'color' },
            'text-primary': { $value: '{color.primitive.neutral.50}', $type: 'color' },
            'text-muted': { $value: '{color.primitive.neutral.400}', $type: 'color' },
            'border-default': { $value: '{color.primitive.neutral.800}', $type: 'color' },
          },
        },
      },
    },
    null,
    2
  )

  // 2. CSS Variables con Alias Semánticos
  const cssVariables = `/* ========================================================= */
/* CAPA 1: TOKENS PRIMITIVOS (Global Tokens)                 */
/* ========================================================= */
:root {
  /* Brand Scale */
  --color-brand-50: ${primitives.brand['50']};
  --color-brand-100: ${primitives.brand['100']};
  --color-brand-500: ${primitives.brand['500']};
  --color-brand-700: ${primitives.brand['700']};
  --color-brand-900: ${primitives.brand['900']};

  /* Neutral Scale */
  --color-neutral-50: ${primitives.neutral['50']};
  --color-neutral-100: ${primitives.neutral['100']};
  --color-neutral-200: ${primitives.neutral['200']};
  --color-neutral-500: ${primitives.neutral['500']};
  --color-neutral-800: ${primitives.neutral['800']};
  --color-neutral-900: ${primitives.neutral['900']};
  --color-neutral-950: ${primitives.neutral['950']};
}

/* ========================================================= */
/* CAPA 2: TOKENS SEMÁNTICOS (Modo Claro)                    */
/* ========================================================= */
:root, [data-theme="light"] {
  --color-bg-page: var(--color-neutral-50);
  --color-bg-surface: #ffffff;
  --color-action-primary: var(--color-brand-500);
  --color-text-primary: var(--color-neutral-950);
  --color-text-muted: var(--color-neutral-500);
  --color-border-default: var(--color-neutral-200);
  --radius-brand: ${theme.radiusValue}px;
}

/* ========================================================= */
/* CAPA 2: TOKENS SEMÁNTICOS (Modo Oscuro)                   */
/* ========================================================= */
[data-theme="dark"] {
  --color-bg-page: var(--color-neutral-950);
  --color-bg-surface: var(--color-neutral-900);
  --color-action-primary: var(--color-brand-500);
  --color-text-primary: var(--color-neutral-50);
  --color-text-muted: var(--color-neutral-400);
  --color-border-default: var(--color-neutral-800);
}`

  // 3. Tailwind CSS v4 @theme
  const tailwind4Theme = `@theme {
  --color-brand-500: ${primitives.brand['500']};
  --color-neutral-50: ${primitives.neutral['50']};
  --color-neutral-950: ${primitives.neutral['950']};
  
  --color-bg-page: var(--color-bg-page);
  --color-bg-surface: var(--color-bg-surface);
  --color-action-primary: var(--color-action-primary);
  --color-text-primary: var(--color-text-primary);
  --color-text-muted: var(--color-text-muted);
  --color-border-default: var(--color-border-default);
  
  --font-display: ${theme.fontDisplay};
  --font-sans: ${theme.fontBody};
  --radius-brand: ${theme.radiusValue}px;
}`

  // 4. Swift / SwiftUI (iOS)
  const swiftUITokens = `import SwiftUI

public enum QawayDesignTokens {
    // Primitives
    public static let brand500 = Color(hex: "${primitives.brand['500']}")
    public static let neutral50 = Color(hex: "${primitives.neutral['50']}")
    public static let neutral950 = Color(hex: "${primitives.neutral['950']}")
    
    // Semantics (Dynamic Color)
    public static let bgPage = Color("bgPage") // Resolves neutral50 on Light, neutral950 on Dark
    public static let actionPrimary = brand500
    public static let textPrimary = Color("textPrimary")
}`

  // 5. Kotlin / Jetpack Compose (Android)
  const composeTokens = `package com.qawaylab.theme

import androidx.compose.ui.graphics.Color

object QawayTokens {
    val Brand500 = Color(0xFF${primitives.brand['500'].replace('#', '')})
    val Neutral50 = Color(0xFF${primitives.neutral['50'].replace('#', '')})
    val Neutral950 = Color(0xFF${primitives.neutral['950'].replace('#', '')})
    
    // Semantic Colors
    val ActionPrimary = Brand500
}`

  const formatMap: Record<ExportFormat, { content: string; filename: string }> = {
    w3c_json: { content: w3cTokensJson, filename: 'tokens.w3c.json' },
    css_alias: { content: cssVariables, filename: 'tokens.css' },
    tailwind4: { content: tailwind4Theme, filename: 'theme.tailwind.css' },
    swiftui: { content: swiftUITokens, filename: 'QawayTokens.swift' },
    compose: { content: composeTokens, filename: 'QawayTokens.kt' },
  }

  const active = formatMap[format]

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(active.content)
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    } catch {
      // Fallback
    }
  }

  const handleDownload = () => {
    const blob = new Blob([active.content], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = active.filename
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/70">
          <div className="flex items-center gap-3">
            <FileCode2 className="w-5 h-5 text-slate-800" />
            <div>
              <h2 className="text-sm font-bold text-slate-900">Exportador Universal de Design Tokens</h2>
              <p className="text-xs text-slate-500">Compilación en formatos W3C, Style Dictionary, Tailwind y Móvil</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Pestañas de Formato Estándar */}
        <div className="px-6 pt-4 pb-2 flex flex-wrap items-center justify-between gap-2">
          <div className="flex bg-slate-100 rounded-xl p-1 border border-slate-200 overflow-x-auto">
            <button
              type="button"
              onClick={() => setFormat('w3c_json')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                format === 'w3c_json' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <FileJson className="w-3.5 h-3.5 text-amber-500" /> W3C JSON (Figma/Tokens Studio)
            </button>
            <button
              type="button"
              onClick={() => setFormat('css_alias')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                format === 'css_alias' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Terminal className="w-3.5 h-3.5 text-blue-500" /> CSS Variables (Alias)
            </button>
            <button
              type="button"
              onClick={() => setFormat('tailwind4')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                format === 'tailwind4' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Tailwind v4 (@theme)
            </button>
            <button
              type="button"
              onClick={() => setFormat('swiftui')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                format === 'swiftui' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" /> iOS (SwiftUI)
            </button>
            <button
              type="button"
              onClick={() => setFormat('compose')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                format === 'compose' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" /> Android (Compose)
            </button>
          </div>

          <span className="text-[11px] font-mono text-slate-400 font-semibold">{active.filename}</span>
        </div>

        {/* Consola de Código */}
        <div className="p-6 pt-2 flex-1 overflow-hidden flex flex-col">
          <pre className="flex-1 bg-slate-950 text-emerald-300 rounded-2xl p-4 text-xs font-mono leading-relaxed overflow-auto border border-slate-800 shadow-inner">
            {active.content}
          </pre>
        </div>

        {/* Pie de Acciones */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          <p className="text-xs text-slate-500">
            Formato estándar compatible con pipelines de Style Dictionary y CI/CD.
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer active:scale-95"
            >
              <Download className="w-3.5 h-3.5" /> Descargar {active.filename}
            </button>
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-5 py-2 text-white text-xs font-bold rounded-xl shadow-sm transition-all hover:opacity-90 active:scale-95 cursor-pointer"
              style={{ backgroundColor: theme.brandHex }}
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? '¡Copiado!' : 'Copiar al Portapapeles'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
