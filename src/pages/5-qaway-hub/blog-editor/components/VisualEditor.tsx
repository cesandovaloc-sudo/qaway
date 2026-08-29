import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react'
import { useEditor, EditorContent, type Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import Youtube from '@tiptap/extension-youtube'
import { TextStyle } from '@tiptap/extension-text-style'
import Color from '@tiptap/extension-color'
import Highlight from '@tiptap/extension-highlight'
import { CtaBlock } from './tiptap-extensions/CtaBlock'
import { CustomImage } from './tiptap-extensions/CustomImage'
import { ColumnsBlock } from './tiptap-extensions/ColumnsBlock'
import { CalloutBlock } from './tiptap-extensions/CalloutBlock'
import { CustomBulletList, CustomOrderedList, CustomBlockquote } from './tiptap-extensions/CustomStructures'
import { InfographicBlock } from './tiptap-extensions/InfographicBlock'
import { LeadFormBlock } from './tiptap-extensions/LeadFormBlock'
import FixedToolbar from './FixedToolbar'
import type { ImageInsertData } from './modals/ImageAdvancedModal'
import type { CtaData } from './modals/CtaModal'
import type { BookmarkData } from './modals/BookmarkModal'
import type { ComparisonData } from './modals/ComparisonModal'
import type { ColumnsData } from './modals/ColumnsModal'
import type { CalloutData } from './modals/CalloutModal'
import type { InfographicData } from './modals/InfographicModal'
import type { LeadFormData } from '../types'
import type { FaqItem } from './modals/FaqModal'

export interface VisualEditorRef {
  insertAdvancedImage: (data: ImageInsertData) => void
  insertVideo: (url: string) => void
  insertCta: (data: CtaData) => void
  insertBookmark: (data: BookmarkData) => void
  insertComparison: (data: ComparisonData) => void
  insertColumns: (data: ColumnsData) => void
  insertCallout: (data: CalloutData) => void
  insertInfographic: (data: InfographicData) => void
  insertLeadForm: (data: LeadFormData) => void
  insertFaq: (faqs: FaqItem[]) => void
  generateToc: () => void
  getEditor: () => Editor | null
  undo: () => void
  redo: () => void
  canUndo: () => boolean
  canRedo: () => boolean
  getScrollTop: () => number
  setScrollTop: (top: number) => void
  findAndHighlightKeyword: (keyword: string, targetIndex: number) => { total: number; current: number }
}

interface VisualEditorProps {
  initialContent: string
  onChange: (content: { html: string; json: string; plainText: string }) => void
  onOpenImageModal: () => void
  onOpenVideoModal: () => void
  onOpenCtaModal: () => void
  onOpenBookmarkModal: () => void
  onOpenComparisonModal: () => void
  onOpenColumnsModal?: () => void
  onOpenCalloutModal?: () => void
  onOpenInfographicModal?: () => void
  onOpenLeadFormModal?: () => void
  onOpenFaqModal: () => void
  onOpenHubSpotTemplates?: () => void
}

const VisualEditor = forwardRef<VisualEditorRef, VisualEditorProps>(function VisualEditor(
  {
    initialContent,
    onChange,
    onOpenImageModal,
    onOpenVideoModal,
    onOpenCtaModal,
    onOpenBookmarkModal,
    onOpenComparisonModal,
    onOpenColumnsModal,
    onOpenCalloutModal,
    onOpenInfographicModal,
    onOpenLeadFormModal,
    onOpenFaqModal,
    onOpenHubSpotTemplates,
  },
  ref
) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4],
        },
        bulletList: false,
        orderedList: false,
        blockquote: false,
      }),
      CustomBulletList,
      CustomOrderedList,
      CustomBlockquote,
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      CustomImage,
      CtaBlock,
      ColumnsBlock,
      CalloutBlock,
      InfographicBlock,
      LeadFormBlock,
      Image.configure({
        inline: false,
        allowBase64: true,
        HTMLAttributes: {
          class: 'rounded-xl shadow-xs transition-all duration-200',
        },
      }),
      Youtube.configure({
        inline: false,
        width: 640,
        height: 360,
        HTMLAttributes: {
          class: 'w-full rounded-xl overflow-hidden shadow-md my-6 aspect-video',
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-accent font-semibold underline underline-offset-2 hover:text-accent-dark',
        },
      }),
      Placeholder.configure({
        placeholder: 'Escribe aquí tu contenido... Puedes usar títulos, párrafos, listas, videos, CTAs o fotos.',
      }),
    ],
    content: initialContent || '',
    editorProps: {
      attributes: {
        class: 'tiptap focus:outline-none min-h-full text-primary leading-relaxed text-base font-sans max-w-3xl mx-auto w-full',
      },
    },
    onUpdate: ({ editor }) => {
      onChange({
        html: editor.getHTML(),
        json: JSON.stringify(editor.getJSON()),
        plainText: editor.getText(),
      })
    },
  })

  useImperativeHandle(
    ref,
    () => ({
      insertAdvancedImage: (data: ImageInsertData) => {
        if (!editor) return
        editor
          .chain()
          .focus()
          .insertContent({
            type: 'customImage',
            attrs: {
              src: data.url,
              alt: data.alt || 'Imagen del artículo',
              caption: data.caption || '',
              align: data.align || 'center',
              width: data.width || (data.align === 'left' || data.align === 'right' ? '48%' : '80%'),
            },
          })
          .run()
      },

      insertVideo: (url: string) => {
        if (!editor) return
        const youtubeRegex =
          /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
        const match = url.match(youtubeRegex)

        if (match) {
          editor.chain().focus().setYoutubeVideo({ src: url }).run()
        } else {
          const embedHtml = `
            <div class="my-6 aspect-video w-full rounded-xl overflow-hidden shadow-md border border-line">
              <iframe src="${url}" class="w-full h-full border-0" allowfullscreen></iframe>
            </div>
          `
          editor.chain().focus().insertContent(embedHtml).run()
        }
      },

      insertCta: (data: CtaData) => {
        if (!editor) return
        editor
          .chain()
          .focus()
          .insertContent({
            type: 'ctaBlock',
            attrs: {
              type: data.type || 'card',
              title: data.title || '',
              description: data.description || '',
              buttonText: data.buttonText || 'Ver Más',
              buttonUrl: data.buttonUrl || '#',
              buttonBgColor: data.buttonBgColor || '#FF5B26',
              buttonTextColor: data.buttonTextColor || '#ffffff',
              passiveText: data.passiveText || '',
            },
          })
          .run()
      },

      insertBookmark: (data: BookmarkData) => {
        if (!editor) return
        const bookmarkHtml = `
          <a href="${data.url}" target="_blank" rel="noopener noreferrer" class="my-6 p-4 rounded-xl border border-line hover:border-accent bg-surface-muted/60 hover:bg-white transition-all shadow-xs flex items-center justify-between gap-4 block no-underline group clear-both">
            <div class="space-y-1 min-w-0 flex-1">
              <span class="text-[10px] font-bold uppercase tracking-wider text-muted flex items-center gap-1">
                <span>🔗</span> <span>${data.authorOrSite || new URL(data.url).hostname}</span>
              </span>
              <h4 class="font-display font-bold text-sm sm:text-base text-primary group-hover:text-accent transition-colors truncate m-0">
                ${data.title}
              </h4>
              <p class="text-xs text-muted line-clamp-2 m-0">${data.description}</p>
            </div>
            ${
              data.imageUrl
                ? `<img src="${data.imageUrl}" alt="${data.title}" class="w-20 h-20 rounded-lg object-cover shrink-0 border border-line" />`
                : ''
            }
          </a>
        `
        editor.chain().focus().insertContent(bookmarkHtml).run()
      },

      insertComparison: (data: ComparisonData) => {
        if (!editor) return
        const leftItems = (data.leftItems || [])
          .map(
            (p: string) =>
              `<li class="flex items-start gap-2 text-xs"><span class="text-danger font-bold">✕</span><span>${p}</span></li>`
          )
          .join('')
        const rightItems = (data.rightItems || [])
          .map(
            (p: string) =>
              `<li class="flex items-start gap-2 text-xs"><span class="text-success font-bold">✓</span><span>${p}</span></li>`
          )
          .join('')

        const comparisonHtml = `
          <div class="my-8 grid grid-cols-1 md:grid-cols-2 gap-4 clear-both">
            <div class="p-4 sm:p-5 rounded-2xl border border-rose-500/20 bg-rose-500/5 shadow-2xs space-y-3">
              <h4 class="font-display font-bold text-sm sm:text-base text-rose-950 flex items-center gap-2 m-0">
                <span>❌</span> <span>${data.leftTitle}</span>
              </h4>
              <ul class="space-y-2 pl-0 list-none m-0">${leftItems}</ul>
            </div>
            <div class="p-4 sm:p-5 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 shadow-2xs space-y-3">
              <h4 class="font-display font-bold text-sm sm:text-base text-emerald-950 flex items-center gap-2 m-0">
                <span>✅</span> <span>${data.rightTitle}</span>
              </h4>
              <ul class="space-y-2 pl-0 list-none m-0">${rightItems}</ul>
            </div>
          </div>
        `
        editor.chain().focus().insertContent(comparisonHtml).run()
      },

      insertColumns: (data: ColumnsData) => {
        if (!editor) return
        editor
          .chain()
          .focus()
          .insertContent({
            type: 'columnsBlock',
            attrs: {
              layoutType: data.layoutType || 'equal',
              col1Title: data.col1Title || '',
              col1Text: data.col1Text || '',
              col2Type: data.col2Type || 'text',
              col2Title: data.col2Title || '',
              col2Text: data.col2Text || '',
              col2ImageUrl: data.col2ImageUrl || '',
              col2ImageAlt: data.col2ImageAlt || '',
              col2ImageCaption: data.col2ImageCaption || '',
            },
          })
          .run()
      },

      insertCallout: (data: CalloutData) => {
        if (!editor) return
        editor
          .chain()
          .focus()
          .insertContent({
            type: 'calloutBlock',
            attrs: {
              calloutType: data.calloutType || 'tip',
              title: data.title || '',
              text: data.text || '',
              sourceUrl: data.sourceUrl || '',
              sourceLabel: data.sourceLabel || '',
            },
          })
          .run()
      },

      insertFaq: (faqs: FaqItem[]) => {
        if (!editor) return
        const faqDetails = faqs
          .map(
            f => `
            <details class="group border border-line rounded-xl p-3.5 bg-white shadow-2xs">
              <summary class="font-bold text-xs sm:text-sm text-primary cursor-pointer list-none flex items-center justify-between">
                <span>${f.question}</span>
                <span class="text-accent text-sm group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p class="text-xs sm:text-sm text-muted mt-2 leading-relaxed border-t border-line/60 pt-2 m-0">${f.answer}</p>
            </details>
          `
          )
          .join('')

        const faqHtml = `
          <div class="my-8 space-y-2.5 clear-both">
            <h4 class="font-display font-bold text-base sm:text-lg text-primary mb-3">Preguntas Frecuentes</h4>
            ${faqDetails}
          </div>
        `
        editor.chain().focus().insertContent(faqHtml).run()
      },

      insertInfographic: (data: InfographicData) => {
        if (!editor) return
        editor
          .chain()
          .focus()
          .insertContent({
            type: 'infographicBlock',
            attrs: {
              infographicData: data,
            },
          })
          .run()
      },

      insertLeadForm: (data: LeadFormData) => {
        if (!editor) return
        editor
          .chain()
          .focus()
          .insertContent({
            type: 'leadFormBlock',
            attrs: {
              type: data.type,
              title: data.title,
              description: data.description,
              buttonText: data.buttonText,
              successMessage: data.successMessage,
              downloadUrl: data.downloadUrl,
              themeColor: data.themeColor,
              textColor: data.textColor,
              fields: data.fields,
              triggerScrollPercent: data.triggerScrollPercent,
            },
          })
          .run()
      },

      generateToc: () => {
        if (!editor) return
        const headings: { text: string; level: number; id: string }[] = []
        const html = editor.getHTML()
        const doc = new DOMParser().parseFromString(html, 'text/html')

        doc.querySelectorAll('h1, h2, h3').forEach((node, index) => {
          const text = node.textContent?.trim() || ''
          if (text) {
            const level = parseInt(node.tagName.substring(1), 10)
            const id = `heading-${index}-${text.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`
            headings.push({ text, level, id })
          }
        })

        if (headings.length === 0) {
          alert('No se encontraron títulos H1, H2 o H3 para generar la tabla de contenidos.')
          return
        }

        const tocItems = headings
          .map(h => {
            const indent = h.level === 3 ? 'ml-4' : h.level === 2 ? 'ml-2' : ''
            return `<li class="${indent} text-xs"><a href="#${h.id}" class="text-accent hover:underline font-medium">${h.text}</a></li>`
          })
          .join('')

        const tocHtml = `
          <div class="my-6 p-4 sm:p-5 rounded-2xl bg-surface-muted border border-line shadow-2xs space-y-2.5 clear-both" data-toc="true">
            <strong class="font-display font-bold text-xs sm:text-sm text-primary block flex items-center gap-1.5">
              <span>📑</span> <span>Índice del Artículo</span>
            </strong>
            <ul class="space-y-1.5 pl-4 list-disc text-primary m-0">${tocItems}</ul>
          </div>
        `
        editor.chain().focus().insertContent(tocHtml).run()
      },

      undo: () => {
        if (editor) editor.chain().focus().undo().run()
      },
      redo: () => {
        if (editor) editor.chain().focus().redo().run()
      },
      canUndo: () => Boolean(editor?.can().undo()),
      canRedo: () => Boolean(editor?.can().redo()),
      getScrollTop: () => scrollContainerRef.current?.scrollTop || 0,
      setScrollTop: (top: number) => {
        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollTop = top
        }
      },
      findAndHighlightKeyword: (keyword: string, targetIndex: number) => {
        if (!editor || !keyword.trim()) return { total: 0, current: 0 }
        const cleanKw = keyword.trim().toLowerCase()
        const stopWords = new Set([
          'de', 'la', 'el', 'los', 'las', 'un', 'una', 'unos', 'unas',
          'para', 'por', 'con', 'en', 'y', 'o', 'a', 'del', 'al', 'se',
          'su', 'sus', 'tu', 'tus', 'que', 'como', 'es', 'son'
        ])
        const rawTerms = cleanKw.split(/\s+/).filter(Boolean)
        const sigTerms = rawTerms.filter(w => w.length > 2 && !stopWords.has(w))
        const searchTerms = sigTerms.length > 0 ? sigTerms : rawTerms

        const matches: { from: number; to: number }[] = []
        const doc = editor.state.doc

        doc.descendants((node, pos) => {
          if (node.isText && node.text) {
            const nodeText = node.text.toLowerCase()
            // 1. Coincidencia de frase exacta
            let exactIdx = 0
            while ((exactIdx = nodeText.indexOf(cleanKw, exactIdx)) !== -1) {
              matches.push({
                from: pos + exactIdx,
                to: pos + exactIdx + cleanKw.length,
              })
              exactIdx += cleanKw.length
            }

            // 2. Si no hay coincidencia exacta o la frase tiene varias palabras, buscar los términos individuales
            searchTerms.forEach(term => {
              let termIdx = 0
              while ((termIdx = nodeText.indexOf(term, termIdx)) !== -1) {
                const from = pos + termIdx
                const to = pos + termIdx + term.length
                if (!matches.some(m => Math.abs(m.from - from) < 3)) {
                  matches.push({ from, to })
                }
                termIdx += term.length
              }
            })
          }
        })

        // Ordenar coincidencias por posición en el documento
        matches.sort((a, b) => a.from - b.from)

        if (matches.length === 0) return { total: 0, current: 0 }

        const validIndex = ((targetIndex % matches.length) + matches.length) % matches.length
        const targetMatch = matches[validIndex]

        editor
          .chain()
          .focus()
          .setTextSelection({ from: targetMatch.from, to: targetMatch.to })
          .scrollIntoView()
          .run()

        return { total: matches.length, current: validIndex + 1 }
      },
      getEditor: () => editor,
    }),
    [editor]
  )

  const scrollContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (editor && initialContent && editor.getHTML() !== initialContent) {
      editor.commands.setContent(initialContent, { emitUpdate: false })
    }
  }, [initialContent, editor])

  if (!editor) return null

  return (
    <div className="flex flex-col h-full bg-white relative border border-line rounded-2xl overflow-hidden shadow-xs">
      {/* Barra de Herramientas Fija y Completa */}
      <FixedToolbar
        editor={editor}
        onOpenImageModal={onOpenImageModal}
        onOpenVideoModal={onOpenVideoModal}
        onOpenCtaModal={onOpenCtaModal}
        onOpenBookmarkModal={onOpenBookmarkModal}
        onOpenComparisonModal={onOpenComparisonModal}
        onOpenColumnsModal={onOpenColumnsModal}
        onOpenInfographicModal={onOpenInfographicModal}
        onOpenLeadFormModal={onOpenLeadFormModal}
        onOpenFaqModal={onOpenFaqModal}
        onOpenHubSpotTemplates={onOpenHubSpotTemplates}
        onGenerateToc={() => {
          if (!editor) return
          const headings: { text: string; level: number; id: string }[] = []
          const html = editor.getHTML()
          const doc = new DOMParser().parseFromString(html, 'text/html')

          doc.querySelectorAll('h1, h2, h3').forEach((node, index) => {
            const text = node.textContent?.trim() || ''
            if (text) {
              const level = parseInt(node.tagName.substring(1), 10)
              const id = `heading-${index}-${text.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`
              headings.push({ text, level, id })
            }
          })

          if (headings.length === 0) {
            alert('No se encontraron títulos H1, H2 o H3 para generar la tabla de contenidos.')
            return
          }

          const tocItems = headings
            .map(h => {
              const indent = h.level === 3 ? 'ml-4' : h.level === 2 ? 'ml-2' : ''
              return `<li class="${indent} text-xs"><a href="#${h.id}" class="text-accent hover:underline font-medium">${h.text}</a></li>`
            })
            .join('')

          const tocHtml = `
            <div class="my-6 p-4 sm:p-5 rounded-2xl bg-surface-muted border border-line shadow-2xs space-y-2.5 clear-both" data-toc="true">
              <strong class="font-display font-bold text-xs sm:text-sm text-primary block flex items-center gap-1.5">
                <span>📑</span> <span>Índice del Artículo</span>
              </strong>
              <ul class="space-y-1.5 pl-4 list-disc text-primary m-0">${tocItems}</ul>
            </div>
          `
          editor.chain().focus().insertContent(tocHtml).run()
        }}
        onInsertCallout={() => {
          if (onOpenCalloutModal) {
            onOpenCalloutModal()
          } else if (editor) {
            editor.chain().focus().insertContent({
              type: 'calloutBlock',
              attrs: {
                calloutType: 'tip',
                title: 'Nota Destacada',
                text: 'Añade aquí tu tip o recomendación.',
              },
            }).run()
          }
        }}
      />

      {/* Único Campo de Texto con Scroll Interno y Enmarcado */}
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-4 sm:p-6 min-h-0 bg-white">
        <EditorContent editor={editor} className="h-full" />
      </div>
    </div>
  )
})

export default VisualEditor
