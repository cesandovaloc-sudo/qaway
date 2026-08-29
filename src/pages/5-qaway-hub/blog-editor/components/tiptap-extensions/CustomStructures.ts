import BulletList from '@tiptap/extension-bullet-list'
import OrderedList from '@tiptap/extension-ordered-list'
import Blockquote from '@tiptap/extension-blockquote'

export const CustomBulletList = BulletList.extend({
  addAttributes() {
    return {
      listColor: {
        default: null,
        parseHTML: element =>
          element.getAttribute('data-list-color') ||
          element.style.getPropertyValue('--list-color') ||
          null,
        renderHTML: attributes => {
          if (!attributes.listColor) return {}
          return {
            'data-list-color': attributes.listColor,
            style: `--list-color: ${attributes.listColor};`,
          }
        },
      },
      listStyle: {
        default: 'disc',
        parseHTML: element => element.getAttribute('data-list-style') || 'disc',
        renderHTML: attributes => {
          if (!attributes.listStyle || attributes.listStyle === 'disc') return {}
          return {
            'data-list-style': attributes.listStyle,
          }
        },
      },
    }
  },
})

export const CustomOrderedList = OrderedList.extend({
  addAttributes() {
    return {
      listColor: {
        default: null,
        parseHTML: element =>
          element.getAttribute('data-list-color') ||
          element.style.getPropertyValue('--list-color') ||
          null,
        renderHTML: attributes => {
          if (!attributes.listColor) return {}
          return {
            'data-list-color': attributes.listColor,
            style: `--list-color: ${attributes.listColor};`,
          }
        },
      },
    }
  },
})

export const CustomBlockquote = Blockquote.extend({
  addAttributes() {
    return {
      borderColor: {
        default: null,
        parseHTML: element =>
          element.getAttribute('data-border-color') ||
          element.style.borderLeftColor ||
          null,
        renderHTML: attributes => {
          if (!attributes.borderColor) return {}
          return {
            'data-border-color': attributes.borderColor,
            style: `border-left-color: ${attributes.borderColor} !important; background-color: ${attributes.borderColor}12 !important;`,
          }
        },
      },
    }
  },
})
