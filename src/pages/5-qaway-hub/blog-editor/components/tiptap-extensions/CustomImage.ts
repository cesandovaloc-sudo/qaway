import { Node, mergeAttributes } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'
import CustomImageComponent from './CustomImageComponent'

export type ImageAlignment = 'left' | 'center' | 'right' | 'full'

export const CustomImage = Node.create({
  name: 'customImage',
  group: 'block',
  atom: true,
  draggable: true,
  selectable: true,

  addAttributes() {
    return {
      src: { default: null },
      alt: { default: 'Imagen del artículo' },
      caption: { default: '' },
      align: { default: 'center' },
      width: { default: '80%' },
    }
  },

  addNodeView() {
    return ReactNodeViewRenderer(CustomImageComponent)
  },

  parseHTML() {
    return [
      {
        tag: 'figure[data-type="custom-image"]',
        getAttrs: element => {
          const el = element as HTMLElement
          const img = el.querySelector('img')
          const figcaption = el.querySelector('figcaption')
          return {
            src: img ? img.getAttribute('src') : el.getAttribute('data-src'),
            alt: img ? img.getAttribute('alt') : el.getAttribute('data-alt'),
            caption: figcaption ? figcaption.textContent : el.getAttribute('data-caption'),
            align: el.getAttribute('data-align') || 'center',
            width: el.getAttribute('data-width') || '80%',
          }
        },
      },
    ]
  },

  renderHTML({ node, HTMLAttributes }) {
    const { src, alt, caption, align, width } = node.attrs

    let figureClass = 'my-6 mx-auto block text-center clear-both'
    let imgClass = 'mx-auto rounded-xl border border-line shadow-xs object-cover block'
    let styleStr = `max-width: ${width || '80%'}; width: 100%; margin-left: auto; margin-right: auto;`

    if (align === 'left') {
      figureClass = 'float-left mr-6 mb-4 block'
      imgClass = 'rounded-xl border border-line shadow-xs object-cover block'
      styleStr = `max-width: ${width || '48%'};`
    } else if (align === 'right') {
      figureClass = 'float-right ml-6 mb-4 block'
      imgClass = 'rounded-xl border border-line shadow-xs object-cover block'
      styleStr = `max-width: ${width || '48%'};`
    } else if (align === 'full') {
      figureClass = 'w-full my-8 block clear-both mx-auto text-center'
      imgClass = 'w-full rounded-2xl border border-line shadow-sm object-cover block mx-auto'
      styleStr = 'width: 100%; margin-left: auto; margin-right: auto;'
    } else {
      // Center
      figureClass = 'my-6 mx-auto block text-center clear-both'
      imgClass = 'mx-auto rounded-xl border border-line shadow-xs object-cover block'
      styleStr = `max-width: ${width || '80%'}; width: 100%; margin-left: auto; margin-right: auto;`
    }

    const figureAttrs = mergeAttributes(HTMLAttributes, {
      'data-type': 'custom-image',
      'data-align': align,
      'data-width': width,
      'data-src': src,
      'data-alt': alt,
      'data-caption': caption,
      class: figureClass,
      style: align === 'left' || align === 'right' ? styleStr : undefined,
    })

    const imgElement: [string, Record<string, any>] = [
      'img',
      {
        src,
        alt: alt || 'Imagen del artículo',
        class: imgClass,
        style: styleStr,
      },
    ]

    if (caption) {
      return [
        'figure',
        figureAttrs,
        imgElement,
        ['figcaption', { class: 'text-xs text-center text-muted italic mt-1.5' }, caption],
      ]
    }

    return ['figure', figureAttrs, imgElement]
  },
})
