import { Node, mergeAttributes } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'
import LeadFormBlockComponent from './LeadFormBlockComponent'

export const LeadFormBlock = Node.create({
  name: 'leadFormBlock',
  group: 'block',
  atom: true,
  draggable: true,
  selectable: true,

  addAttributes() {
    return {
      type: { default: 'inline' },
      title: { default: 'Descarga la Guía de Automatización' },
      description: { default: 'Ingresa tus datos para recibir el PDF exclusivo.' },
      buttonText: { default: 'Obtener Guía Gratis →' },
      successMessage: { default: '¡Listo! Te hemos enviado el acceso a tu correo.' },
      downloadUrl: { default: '' },
      themeColor: { default: '#ff4b0b' },
      textColor: { default: '#ffffff' },
      fields: {
        default: {
          name: true,
          email: true,
          phone: false,
          company: false,
        },
      },
      triggerScrollPercent: { default: 50 },
    }
  },

  addNodeView() {
    return ReactNodeViewRenderer(LeadFormBlockComponent)
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="lead-form-block"]',
        getAttrs: element => {
          const el = element as HTMLElement
          let fields = { name: true, email: true, phone: false, company: false }
          try {
            const rawFields = el.getAttribute('data-fields')
            if (rawFields) fields = JSON.parse(rawFields)
          } catch {
            // fallback
          }

          return {
            type: el.getAttribute('data-form-type') || 'inline',
            title: el.getAttribute('data-title') || '',
            description: el.getAttribute('data-description') || '',
            buttonText: el.getAttribute('data-button-text') || 'Enviar',
            successMessage: el.getAttribute('data-success-message') || '',
            downloadUrl: el.getAttribute('data-download-url') || '',
            themeColor: el.getAttribute('data-theme-color') || '#ff4b0b',
            textColor: el.getAttribute('data-text-color') || '#ffffff',
            fields,
            triggerScrollPercent: parseInt(el.getAttribute('data-trigger-scroll') || '50', 10),
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
      successMessage,
      downloadUrl,
      themeColor,
      textColor,
      fields,
      triggerScrollPercent,
    } = node.attrs

    const fieldsJson = JSON.stringify(fields)

    return [
      'div',
      mergeAttributes(HTMLAttributes, {
        'data-type': 'lead-form-block',
        'data-form-type': type,
        'data-title': title,
        'data-description': description,
        'data-button-text': buttonText,
        'data-success-message': successMessage,
        'data-download-url': downloadUrl,
        'data-theme-color': themeColor,
        'data-text-color': textColor,
        'data-fields': fieldsJson,
        'data-trigger-scroll': triggerScrollPercent.toString(),
        class:
          'my-6 p-5 sm:p-6 rounded-2xl border border-line shadow-xs bg-[#fafafc] not-prose text-center sm:text-left transition-all',
      }),
      [
        'div',
        { class: 'max-w-xl mx-auto space-y-3' },
        [
          'div',
          { class: 'text-left' },
          ['h4', { class: 'text-base font-display font-bold text-[#18181b] m-0' }, title],
          description ? ['p', { class: 'text-xs text-[#71717a] mt-1 m-0 leading-relaxed' }, description] : '',
        ],
        [
          'form',
          { class: 'space-y-2 pt-1', onsubmit: 'return false;' },
          fields.name
            ? [
                'input',
                {
                  type: 'text',
                  placeholder: 'Tu nombre completo',
                  required: 'true',
                  class: 'w-full bg-white border border-line rounded-xl px-3.5 py-2 text-xs text-[#18181b] focus:outline-none',
                },
              ]
            : '',
          [
            'input',
            {
              type: 'email',
              placeholder: 'tu.correo@empresa.com',
              required: 'true',
              class: 'w-full bg-white border border-line rounded-xl px-3.5 py-2 text-xs text-[#18181b] focus:outline-none',
            },
          ],
          fields.phone
            ? [
                'input',
                {
                  type: 'tel',
                  placeholder: '+51 999 999 999 (WhatsApp)',
                  class: 'w-full bg-white border border-line rounded-xl px-3.5 py-2 text-xs text-[#18181b] focus:outline-none',
                },
              ]
            : '',
          [
            'button',
            {
              type: 'button',
              class: 'w-full font-bold text-xs px-5 py-2.5 rounded-xl shadow-xs transition-transform cursor-pointer',
              style: `background-color: ${themeColor}; color: ${textColor};`,
            },
            buttonText || 'Enviar',
          ],
        ],
      ],
    ]
  },
})
