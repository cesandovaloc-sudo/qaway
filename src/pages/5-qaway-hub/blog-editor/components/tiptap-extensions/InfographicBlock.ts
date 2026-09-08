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

    return [
      'div',
      mergeAttributes(HTMLAttributes, {
        'data-type': 'infographic-block',
        'data-infographic': JSON.stringify(data),
        class: 'my-6 p-4 sm:p-6 rounded-3xl border border-line bg-surface-subtle shadow-2xs font-sans clear-both select-none',
      }),
    ]
  },

  addNodeView() {
    return ReactNodeViewRenderer(InfographicBlockComponent)
  },
})
