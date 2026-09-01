import { Node, mergeAttributes } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'
import CalloutBlockComponent from './CalloutBlockComponent'

export const CalloutBlock = Node.create({
  name: 'calloutBlock',
  group: 'block',
  atom: true,
  draggable: true,
  selectable: true,

  addAttributes() {
    return {
      calloutType: { default: 'tip' },
      title: { default: 'Nota Destacada' },
      text: { default: '' },
      sourceUrl: { default: '' },
      sourceLabel: { default: '' },
    }
  },

  addNodeView() {
    return ReactNodeViewRenderer(CalloutBlockComponent)
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="callout-block"]',
        getAttrs: element => {
          const el = element as HTMLElement
          return {
            calloutType: el.getAttribute('data-callout-type') || 'tip',
            title: el.getAttribute('data-title') || '',
            text: el.getAttribute('data-text') || '',
            sourceUrl: el.getAttribute('data-source-url') || '',
            sourceLabel: el.getAttribute('data-source-label') || '',
          }
        },
      },
    ]
  },

  renderHTML({ node, HTMLAttributes }) {
    const {
      calloutType,
      title,
      text,
      sourceUrl,
      sourceLabel,
    } = node.attrs

    const styles = {
      tip: {
        bg: 'bg-amber-500/5',
        border: 'border-l-4 border-l-amber-500 border-amber-500/20',
        titleColor: 'text-amber-900',
        icon: '💡',
      },
      data: {
        bg: 'bg-blue-500/5',
        border: 'border-l-4 border-l-blue-500 border-blue-500/20',
        titleColor: 'text-blue-900',
        icon: '📊',
      },
      key: {
        bg: 'bg-emerald-500/5',
        border: 'border-l-4 border-l-emerald-500 border-emerald-500/20',
        titleColor: 'text-emerald-900',
        icon: '🎯',
      },
      warning: {
        bg: 'bg-rose-500/5',
        border: 'border-l-4 border-l-rose-500 border-rose-500/20',
        titleColor: 'text-rose-900',
        icon: '⚠️',
      },
    }

    const currentStyle = styles[calloutType as keyof typeof styles] || styles.tip

    const innerContent: any[] = [
      'div',
      { class: 'space-y-1 flex-1 min-w-0' },
      [
        'p',
        { class: 'text-base text-primary leading-relaxed m-0 font-sans' },
        title ? ['strong', { class: `font-bold mr-1.5 ${currentStyle.titleColor}` }, `${title}: `] : '',
        ['span', {}, text],
      ],
    ]

    if (sourceUrl) {
      innerContent.push([
        'div',
        { class: 'pt-2' },
        [
          'a',
          {
            href: sourceUrl,
            target: '_blank',
            rel: 'noopener noreferrer',
            class:
              'inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold px-3 py-1 rounded-md bg-white border border-accent/30 text-accent hover:bg-accent hover:text-white transition-all shadow-2xs no-underline',
          },
          sourceLabel || 'Ver fuente oficial →',
        ],
      ])
    }

    return [
      'div',
      mergeAttributes(HTMLAttributes, {
        'data-type': 'callout-block',
        'data-callout-type': calloutType,
        'data-title': title,
        'data-text': text,
        'data-source-url': sourceUrl,
        'data-source-label': sourceLabel,
        class: `my-4 p-4 sm:p-4.5 rounded-xl border ${currentStyle.border} ${currentStyle.bg} shadow-2xs clear-both flex items-start gap-2.5`,
      }),
      ['span', { class: 'text-base sm:text-lg shrink-0 select-none leading-none mt-0.5' }, currentStyle.icon],
      innerContent,
    ]
  },
})
