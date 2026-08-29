import { Node, mergeAttributes } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'
import CtaBlockComponent from './CtaBlockComponent'

export const CtaBlock = Node.create({
  name: 'ctaBlock',
  group: 'block',
  atom: true,
  draggable: true,
  selectable: true,

  addAttributes() {
    return {
      type: { default: 'card' },
      title: { default: '¿Listo para escalar tus ventas?' },
      description: { default: '' },
      buttonText: { default: 'Hablar con un Asesor' },
      buttonUrl: { default: '#' },
      cardBgColor: { default: '#18181b' },
      cardTextColor: { default: '#ffffff' },
      buttonBgColor: { default: '#FF5B26' },
      buttonTextColor: { default: '#ffffff' },
      passiveText: { default: '' },
    }
  },

  addNodeView() {
    return ReactNodeViewRenderer(CtaBlockComponent)
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="cta-block"]',
        getAttrs: element => {
          const el = element as HTMLElement
          return {
            type: el.getAttribute('data-cta-type') || 'card',
            title: el.getAttribute('data-title') || '',
            description: el.getAttribute('data-description') || '',
            buttonText: el.getAttribute('data-button-text') || 'Ver Más',
            buttonUrl: el.getAttribute('data-button-url') || '#',
            cardBgColor: el.getAttribute('data-card-bg') || '#18181b',
            cardTextColor: el.getAttribute('data-card-color') || '#ffffff',
            buttonBgColor: el.getAttribute('data-button-bg') || '#FF5B26',
            buttonTextColor: el.getAttribute('data-button-color') || '#ffffff',
            passiveText: el.getAttribute('data-passive-text') || '',
          }
        },
      },
    ]
  },

  renderHTML({ node, HTMLAttributes }) {
    const {
      type,
      title,
      description,
      buttonText,
      buttonUrl,
      cardBgColor,
      cardTextColor,
      buttonBgColor,
      buttonTextColor,
      passiveText,
    } = node.attrs

    if (type === 'passive') {
      return [
        'div',
        mergeAttributes(HTMLAttributes, {
          'data-type': 'cta-block',
          'data-cta-type': 'passive',
          'data-title': title,
          'data-button-text': buttonText,
          'data-button-url': buttonUrl,
          'data-button-bg': buttonBgColor,
          'data-passive-text': passiveText,
          class: 'my-5 text-left clear-both not-prose',
        }),
        [
          'a',
          {
            href: buttonUrl,
            target: '_blank',
            rel: 'noopener noreferrer',
            class: 'font-bold text-sm sm:text-base hover:underline no-underline inline-block',
            style: `color: ${buttonBgColor || '#FF5B26'} !important;`,
          },
          `<< ${passiveText || title} [${buttonText || 'Descargar'}] >>`,
        ],
      ]
    }

    if (type === 'button') {
      return [
        'div',
        mergeAttributes(HTMLAttributes, {
          'data-type': 'cta-block',
          'data-cta-type': 'button',
          'data-button-text': buttonText,
          'data-button-url': buttonUrl,
          'data-button-bg': buttonBgColor,
          'data-button-color': buttonTextColor,
          class: 'my-6 text-center sm:text-left not-prose',
        }),
        [
          'a',
          {
            href: buttonUrl,
            target: '_blank',
            rel: 'noopener noreferrer',
            class:
              'inline-flex items-center gap-2 font-bold text-xs sm:text-sm px-6 py-3 rounded-xl shadow-md transition-transform hover:scale-105 no-underline',
            style: `background-color: ${buttonBgColor || '#FF5B26'} !important; color: ${buttonTextColor || '#ffffff'} !important;`,
          },
          `${buttonText} →`,
        ],
      ]
    }

    // Default 'card'
    const finalCardBg = cardBgColor || '#18181b'
    const finalCardText = cardTextColor || '#ffffff'
    const isLightCard = finalCardBg.toLowerCase() === '#ffffff' || finalCardBg.toLowerCase() === '#fafafc'

    return [
      'div',
      mergeAttributes(HTMLAttributes, {
        'data-type': 'cta-block',
        'data-cta-type': 'card',
        'data-title': title,
        'data-description': description,
        'data-button-text': buttonText,
        'data-button-url': buttonUrl,
        'data-card-bg': finalCardBg,
        'data-card-color': finalCardText,
        'data-button-bg': buttonBgColor,
        'data-button-color': buttonTextColor,
        class: `not-prose my-8 p-6 sm:p-8 rounded-2xl ${isLightCard ? 'border border-line shadow-md' : 'border border-line/20 shadow-xl'} flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 clear-both`,
        style: `background-color: ${finalCardBg} !important; color: ${finalCardText} !important;`,
      }),
      [
        'div',
        { class: 'space-y-1.5 max-w-xl' },
        ['h3', { class: 'font-display font-bold text-lg sm:text-xl tracking-tight m-0', style: `color: ${finalCardText} !important;` }, title],
        description ? ['p', { class: 'text-xs sm:text-sm leading-relaxed m-0 opacity-90', style: `color: ${finalCardText} !important;` }, description] : '',
      ],
      [
        'a',
        {
          href: buttonUrl,
          target: '_blank',
          rel: 'noopener noreferrer',
          class:
            'inline-flex items-center gap-2 font-bold text-xs sm:text-sm px-5 py-2.5 rounded-xl shadow-lg transition-transform hover:scale-105 shrink-0 no-underline',
          style: `background-color: ${buttonBgColor || '#FF5B26'} !important; color: ${buttonTextColor || '#ffffff'} !important;`,
        },
        `${buttonText} →`,
      ],
    ]
  },
})
