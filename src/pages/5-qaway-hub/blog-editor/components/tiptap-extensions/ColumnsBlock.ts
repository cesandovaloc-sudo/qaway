import { Node, mergeAttributes } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'
import ColumnsBlockComponent from './ColumnsBlockComponent'

export const ColumnsBlock = Node.create({
  name: 'columnsBlock',
  group: 'block',
  atom: true,
  draggable: true,
  selectable: true,

  addAttributes() {
    return {
      layoutType: { default: 'equal' },
      col1Title: { default: '' },
      col1Text: { default: '' },
      col2Type: { default: 'text' },
      col2Title: { default: '' },
      col2Text: { default: '' },
      col2ImageUrl: { default: '' },
      col2ImageAlt: { default: '' },
      col2ImageCaption: { default: '' },
    }
  },

  addNodeView() {
    return ReactNodeViewRenderer(ColumnsBlockComponent)
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="columns-block"]',
        getAttrs: element => {
          const el = element as HTMLElement
          return {
            layoutType: el.getAttribute('data-layout-type') || 'equal',
            col1Title: el.getAttribute('data-col1-title') || '',
            col1Text: el.getAttribute('data-col1-text') || '',
            col2Type: el.getAttribute('data-col2-type') || 'text',
            col2Title: el.getAttribute('data-col2-title') || '',
            col2Text: el.getAttribute('data-col2-text') || '',
            col2ImageUrl: el.getAttribute('data-col2-img-url') || '',
            col2ImageAlt: el.getAttribute('data-col2-img-alt') || '',
            col2ImageCaption: el.getAttribute('data-col2-img-caption') || '',
          }
        },
      },
    ]
  },

  renderHTML({ node, HTMLAttributes }) {
    const {
      layoutType,
      col1Title,
      col1Text,
      col2Type,
      col2Title,
      col2Text,
      col2ImageUrl,
      col2ImageAlt,
      col2ImageCaption,
    } = node.attrs

    let containerClasses = 'mt-4 mb-2 grid grid-cols-1 md:grid-cols-2 gap-6 items-start clear-both'
    let col1Classes = 'space-y-3'
    let col2Classes = 'space-y-3'

    if (layoutType === 'cards') {
      col1Classes = 'p-6 rounded-2xl bg-surface-muted border border-line shadow-xs space-y-3'
      col2Classes = 'p-6 rounded-2xl bg-surface-muted border border-line shadow-xs space-y-3'
    } else if (layoutType === 'highlight') {
      col1Classes = 'p-6 rounded-2xl bg-[#18181b] text-white border border-line/20 shadow-md space-y-3'
      col2Classes = 'p-6 rounded-2xl bg-surface-muted border border-line shadow-xs space-y-3'
    }

    const col1Content: any[] = ['div', { class: col1Classes }]
    if (col1Title) {
      col1Content.push([
        'h3',
        {
          class: `font-display font-bold text-xl sm:text-2xl tracking-tight leading-tight m-0 ${
            layoutType === 'highlight' ? 'text-white' : 'text-primary'
          }`,
        },
        col1Title,
      ])
    }

    // Dividir los párrafos por saltos de línea (Enter) para que tengan espacio real
    const p1List = (col1Text || '').split(/\n+/).filter(Boolean)
    if (p1List.length > 0) {
      p1List.forEach((pText: string) => {
        col1Content.push([
          'p',
          {
            class: `text-sm sm:text-base leading-relaxed m-0 ${
              layoutType === 'highlight' ? 'text-zinc-300' : 'text-primary'
            }`,
          },
          pText,
        ])
      })
    } else if (col1Text) {
      col1Content.push([
        'p',
        {
          class: `text-sm sm:text-base leading-relaxed m-0 ${
            layoutType === 'highlight' ? 'text-zinc-300' : 'text-primary'
          }`,
        },
        col1Text,
      ])
    }

    const col2Content: any[] = ['div', { class: col2Classes }]
    if (col2Type === 'image' && col2ImageUrl) {
      const figureContent: any[] = [
        'figure',
        { class: 'm-0 clear-both block text-center' },
        [
          'img',
          {
            src: col2ImageUrl,
            alt: col2ImageAlt || col1Title || 'Imagen complementaria',
            class: 'w-full h-auto rounded-2xl border border-line shadow-xs object-contain block',
          },
        ],
      ]
      if (col2ImageCaption) {
        figureContent.push([
          'figcaption',
          { class: 'text-xs text-center text-muted italic mt-1.5' },
          col2ImageCaption,
        ])
      }
      col2Content.push(figureContent)
    } else {
      if (col2Title) {
        col2Content.push([
          'h3',
          { class: 'font-display font-bold text-xl sm:text-2xl tracking-tight leading-tight text-primary m-0' },
          col2Title,
        ])
      }
      const p2List = (col2Text || '').split(/\n+/).filter(Boolean)
      if (p2List.length > 0) {
        p2List.forEach((pText: string) => {
          col2Content.push([
            'p',
            { class: 'text-sm sm:text-base leading-relaxed text-primary m-0' },
            pText,
          ])
        })
      } else if (col2Text) {
        col2Content.push([
          'p',
          { class: 'text-sm sm:text-base leading-relaxed text-primary m-0' },
          col2Text,
        ])
      }
    }

    return [
      'div',
      mergeAttributes(HTMLAttributes, {
        'data-type': 'columns-block',
        'data-layout-type': layoutType,
        'data-col1-title': col1Title,
        'data-col1-text': col1Text,
        'data-col2-type': col2Type,
        'data-col2-title': col2Title,
        'data-col2-text': col2Text,
        'data-col2-img-url': col2ImageUrl,
        'data-col2-img-alt': col2ImageAlt,
        'data-col2-img-caption': col2ImageCaption,
        class: containerClasses,
      }),
      col1Content,
      col2Content,
    ]
  },
})
