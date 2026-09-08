import { Mark, mergeAttributes } from '@tiptap/core'

export interface PendingLinkAttributes {
  topic?: string
  note?: string
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    pendingLink: {
      setPendingLink: (attributes?: PendingLinkAttributes) => ReturnType
      togglePendingLink: (attributes?: PendingLinkAttributes) => ReturnType
      unsetPendingLink: () => ReturnType
    }
    hiddenDraft: {
      setHiddenDraft: () => ReturnType
      toggleHiddenDraft: () => ReturnType
      unsetHiddenDraft: () => ReturnType
    }
  }
}

export const PendingLinkMark = Mark.create({
  name: 'pendingLink',

  addOptions() {
    return {
      HTMLAttributes: {},
    }
  },

  addAttributes() {
    return {
      topic: {
        default: '',
        parseHTML: element => element.getAttribute('data-topic') || '',
        renderHTML: attributes => {
          if (!attributes.topic) return {}
          return { 'data-topic': attributes.topic }
        },
      },
      note: {
        default: '',
        parseHTML: element => element.getAttribute('data-note') || '',
        renderHTML: attributes => {
          if (!attributes.note) return {}
          return { 'data-note': attributes.note }
        },
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-pending-link="true"]',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'span',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        'data-pending-link': 'true',
        class: 'pending-link-anchor cursor-pointer bg-amber-500/15 text-amber-900 border-b-2 border-dashed border-amber-500 px-1 py-0.5 rounded font-medium transition-colors hover:bg-amber-500/25',
        title: HTMLAttributes['data-topic']
          ? `📌 Enlace pendiente: ${HTMLAttributes['data-topic']}`
          : '📌 Enlace pendiente de vincular',
      }),
      0,
    ]
  },

  addCommands() {
    return {
      setPendingLink:
        attributes =>
        ({ commands }) => {
          return commands.setMark(this.name, attributes)
        },
      togglePendingLink:
        attributes =>
        ({ commands }) => {
          return commands.toggleMark(this.name, attributes)
        },
      unsetPendingLink:
        () =>
        ({ commands }) => {
          return commands.unsetMark(this.name)
        },
    }
  },
})

export const HiddenDraftMark = Mark.create({
  name: 'hiddenDraft',

  addOptions() {
    return {
      HTMLAttributes: {},
    }
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-hidden-draft="true"]',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'span',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        'data-hidden-draft': 'true',
        class: 'hidden-draft-span opacity-65 bg-zinc-200/70 line-through decoration-zinc-400 decoration-1 px-1 py-0.5 rounded border border-dashed border-zinc-400 text-zinc-700 select-text',
        title: '🔒 Fragmento en borrador: oculto al público exterior',
      }),
      0,
    ]
  },

  addCommands() {
    return {
      setHiddenDraft:
        () =>
        ({ commands }) => {
          return commands.setMark(this.name)
        },
      toggleHiddenDraft:
        () =>
        ({ commands }) => {
          return commands.toggleMark(this.name)
        },
      unsetHiddenDraft:
        () =>
        ({ commands }) => {
          return commands.unsetMark(this.name)
        },
    }
  },
})
