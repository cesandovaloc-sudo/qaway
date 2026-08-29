import { Node, mergeAttributes } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'
import InfographicBlockComponent from './InfographicBlockComponent'
import type { InfographicData } from '../modals/InfographicModal'

export const InfographicBlock = Node.create({
  name: 'infographicBlock',
  group: 'block',
  atom: true,
  draggable: true,
  selectable: true,

  addAttributes() {
    return {
      infographicData: {
        default: {
          type: 'flow',
          title: '',
          accentColor: '#ff4b0b',
          flowSteps: [],
        },
        parseHTML: element => {
          const raw = element.getAttribute('data-infographic')
          if (raw) {
            try {
              return JSON.parse(raw)
            } catch {
              return {}
            }
          }
          return {}
        },
        renderHTML: attributes => {
          return {
            'data-infographic': JSON.stringify(attributes.infographicData),
          }
        },
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="infographic-block"]',
        getAttrs: element => {
          const el = element as HTMLElement
          const raw = el.getAttribute('data-infographic')
          if (raw) {
            try {
              return { infographicData: JSON.parse(raw) }
            } catch {
              return {}
            }
          }
          return {}
        },
      },
      {
        tag: 'div[data-infographic]',
        getAttrs: element => {
          const el = element as HTMLElement
          const raw = el.getAttribute('data-infographic')
          if (raw) {
            try {
              return { infographicData: JSON.parse(raw) }
            } catch {
              return {}
            }
          }
          return {}
        },
      },
    ]
  },

  renderHTML({ node, HTMLAttributes }) {
    const data: InfographicData = node.attrs.infographicData || {
      type: 'flow',
      title: '',
      accentColor: '#ff4b0b',
    }
    const color = data.accentColor || '#ff4b0b'

    // Generación de HTML Estático Completo para Vista Previa y Blog Público
    let innerHtml = ''

    if (data.type === 'flow') {
      const isVertical = data.flowLayout === 'vertical'
      const stepsHtml = (data.flowSteps || [])
        .map(
          (step, idx, arr) => `
          <div class="relative flex flex-col justify-between">
            <div style="border-top: 3px solid ${color};" class="bg-white border border-line rounded-2xl p-3.5 sm:p-4 shadow-2xs h-full flex flex-col justify-between space-y-1.5">
              <div>
                <div class="flex items-center justify-between mb-1.5">
                  <span style="background-color: ${color};" class="w-5 h-5 rounded-full text-white font-bold text-[10px] flex items-center justify-center shadow-2xs">${step.stepNumber || idx + 1}</span>
                  <span class="text-[9px] font-bold text-muted uppercase tracking-wider">Paso ${idx + 1}</span>
                </div>
                <strong class="font-bold text-primary text-xs sm:text-sm block leading-snug">${step.title}</strong>
              </div>
              ${step.desc ? `<p class="text-[11px] text-muted leading-relaxed m-0">${step.desc}</p>` : ''}
            </div>
            ${!isVertical && idx < arr.length - 1 ? `<div class="hidden lg:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10 w-6 h-6 rounded-full bg-white border border-line shadow-2xs items-center justify-center text-xs font-bold" style="color: ${color};">➔</div>` : ''}
            ${isVertical && idx < arr.length - 1 ? `<div class="flex justify-center my-1 font-bold text-xs" style="color: ${color};">↓</div>` : ''}
          </div>
        `
        )
        .join('')

      const gridCols = isVertical
        ? 'grid-cols-1'
        : data.flowSteps && data.flowSteps.length <= 2
        ? 'grid-cols-1 sm:grid-cols-2'
        : data.flowSteps && data.flowSteps.length === 3
        ? 'grid-cols-1 sm:grid-cols-3'
        : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'

      innerHtml = `<div class="grid gap-3 sm:gap-3.5 ${gridCols}">${stepsHtml}</div>`
    } else if (data.type === 'stats') {
      const statsHtml = (data.statsItems || [])
        .map(
          st => `
          <div class="bg-white border border-line rounded-2xl p-4 sm:p-5 shadow-2xs text-center space-y-1">
            <div style="color: ${color};" class="font-display font-extrabold text-2xl sm:text-3xl tracking-tight leading-none">${st.value}</div>
            <div class="font-bold text-xs sm:text-sm text-primary leading-snug">${st.label}</div>
            ${st.subtext ? `<p class="text-[11px] text-muted leading-relaxed m-0">${st.subtext}</p>` : ''}
          </div>
        `
        )
        .join('')
      innerHtml = `<div class="grid grid-cols-1 sm:grid-cols-3 gap-3.5">${statsHtml}</div>`
    } else if (data.type === 'bars') {
      const barsHtml = (data.barItems || [])
        .map(
          b => `
          <div class="space-y-1">
            <div class="flex items-center justify-between text-xs">
              <span class="font-bold text-primary">${b.label}</span>
              <span class="font-mono font-bold" style="color: ${color};">${b.displayValue || `${b.percentage}%`}</span>
            </div>
            <div class="w-full h-2.5 bg-surface-muted rounded-full overflow-hidden">
              <div style="width: ${Math.max(4, Math.min(100, b.percentage))}%; background-color: ${color};" class="h-full rounded-full"></div>
            </div>
          </div>
        `
        )
        .join('')
      innerHtml = `<div class="space-y-3 bg-white border border-line rounded-2xl p-4 sm:p-5 shadow-2xs">${barsHtml}</div>`
    } else if (data.type === 'timeline') {
      const timelineHtml = (data.timelineItems || [])
        .map(
          tm => `
          <div class="relative space-y-1">
            <span style="background-color: ${color};" class="absolute -left-[27px] top-1 w-3.5 h-3.5 rounded-full border-2 border-white shadow-2xs"></span>
            <div class="flex items-center gap-2">
              <span style="color: ${color}; background-color: ${color}15;" class="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md">${tm.phase}</span>
              ${tm.dateOrBadge ? `<span class="text-[10px] text-muted font-medium">• ${tm.dateOrBadge}</span>` : ''}
            </div>
            <strong class="font-bold text-xs sm:text-sm text-primary block">${tm.title}</strong>
            <p class="text-xs text-muted leading-relaxed m-0">${tm.desc}</p>
          </div>
        `
        )
        .join('')
      innerHtml = `<div class="relative pl-6 space-y-5 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-line">${timelineHtml}</div>`
    } else if (data.type === 'features') {
      const featuresHtml = (data.featureItems || [])
        .map(
          ft => `
          <div class="bg-white border border-line rounded-2xl p-4 shadow-2xs space-y-1.5">
            <span class="text-xl block">${ft.iconEmoji || '✨'}</span>
            <strong class="font-bold text-xs sm:text-sm text-primary block leading-snug">${ft.title}</strong>
            <p class="text-[11px] text-muted leading-relaxed m-0">${ft.desc}</p>
          </div>
        `
        )
        .join('')
      innerHtml = `<div class="grid grid-cols-1 sm:grid-cols-3 gap-3.5">${featuresHtml}</div>`
    } else if (data.type === 'author_quote') {
      const q = data.authorQuote || { quote: '', name: '', role: '' }
      innerHtml = `
        <div style="border-left: 4px solid ${color};" class="bg-white border border-line rounded-2xl p-5 sm:p-6 shadow-2xs space-y-3">
          <p class="text-sm sm:text-base italic text-primary font-medium leading-relaxed m-0">"${q.quote}"</p>
          <div class="flex items-center gap-3 pt-3 border-t border-line">
            <span style="background-color: ${color}18; color: ${color};" class="w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0">${q.name?.charAt(0) || 'A'}</span>
            <div>
              <strong class="text-xs font-bold text-primary block">${q.name}</strong>
              <span class="text-[11px] text-muted block">${q.role}</span>
            </div>
          </div>
        </div>
      `
    }

    const titleHeader = data.title
      ? `
      <div class="mb-4 pb-2.5 border-b border-line flex items-center gap-2">
        <span style="background-color: ${color}18; color: ${color};" class="w-6 h-6 rounded-md flex items-center justify-center font-bold text-xs shrink-0">📊</span>
        <h4 class="font-display font-bold text-sm sm:text-base text-primary tracking-tight m-0">${data.title}</h4>
      </div>
    `
      : ''

    return [
      'div',
      mergeAttributes(HTMLAttributes, {
        'data-type': 'infographic-block',
        'data-infographic': JSON.stringify(data),
        class: 'my-6 p-4 sm:p-6 rounded-3xl border border-line bg-surface-subtle shadow-2xs font-sans clear-both select-none',
      }),
      ['div', {}, `${titleHeader}${innerHtml}`],
    ]
  },

  addNodeView() {
    return ReactNodeViewRenderer(InfographicBlockComponent)
  },
})
