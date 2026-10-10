import { useEffect, useMemo, useState } from 'react'
import { BookOpen, Clock, Eye, FileText, Pencil, Plus, Save } from 'lucide-react'
import { useProjectsDataset } from '@/hooks/useProjects'
import { projectsService } from '@/services/projectsService'
import {
  PROJECT_DOC_CATEGORY_META,
  type ProjectDocCategory,
} from '@/types/project.types'

// ─────────────────────────────────────────────────────────────────────────
// DocsTab.tsx — e) Wiki y Docs estilo Notion (Task 6.1)
// Navegador lateral de documentos + lienzo de lectura/edición con marcas
// temporales y persistencia reactiva en el store.
// ─────────────────────────────────────────────────────────────────────────

interface DocsTabProps {
  projectId: string
}

const CATEGORIES = Object.keys(PROJECT_DOC_CATEGORY_META) as ProjectDocCategory[]

function formatDateTime(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('es-PE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function DocsTab({ projectId }: DocsTabProps) {
  const dataset = useProjectsDataset()

  const docs = useMemo(
    () =>
      dataset.docs
        .filter((doc) => doc.projectId === projectId)
        .sort((a, b) => b.lastEdited.localeCompare(a.lastEdited)),
    [dataset, projectId],
  )

  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [editing, setEditing] = useState(false)
  const [preview, setPreview] = useState(false)
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState<ProjectDocCategory>('general')
  const [content, setContent] = useState('')

  const selected = docs.find((doc) => doc.id === selectedId) ?? docs[0] ?? null

  useEffect(() => {
    if (!selected) {
      setSelectedId(null)
      return
    }
    setSelectedId((prev) => prev ?? selected.id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId])

  useEffect(() => {
    if (selected && !docs.some((doc) => doc.id === selected.id)) {
      setSelectedId(docs[0]?.id ?? null)
    }
  }, [docs, selected])

  useEffect(() => {
    if (selected) {
      setTitle(selected.title)
      setCategory(selected.category)
      setContent(selected.content)
      setEditing(false)
      setPreview(false)
    }
  }, [selected?.id])

  const dirty =
    selected !== null &&
    (title.trim() !== selected.title ||
      category !== selected.category ||
      content !== selected.content)

  const handleNew = () => {
    const doc = projectsService.createDoc({
      projectId,
      title: 'Nuevo documento',
      icon: '📄',
      category: 'general',
      author: 'Equipo de proyecto',
      content: '# Nuevo documento\n\nEscribe aquí el contenido…',
    })
    setSelectedId(doc.id)
    setEditing(true)
  }

  const handleSave = () => {
    if (!selected || !title.trim()) return
    projectsService.updateDoc(selected.id, {
      title: title.trim(),
      category,
      content,
    })
    setEditing(false)
  }

  const paragraphs = content.split('\n').filter((line) => line.trim() !== '')

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[280px_1fr]">
      {/* Navegador lateral */}
      <aside className="rounded-2xl border border-zinc-200 bg-white p-3 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
        <div className="mb-2 flex items-center justify-between px-1">
          <h3 className="flex items-center gap-2 text-sm font-bold text-zinc-900">
            <BookOpen size={15} className="text-zinc-400" /> Wiki
            <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] font-bold text-zinc-500">
              {docs.length}
            </span>
          </h3>
          <button
            type="button"
            onClick={handleNew}
            aria-label="Nuevo documento"
            className="grid h-8 w-8 place-items-center rounded-lg bg-brand text-white transition-colors hover:bg-brand-hover"
          >
            <Plus size={15} />
          </button>
        </div>
        {docs.length === 0 ? (
          <p className="px-1 py-8 text-center text-xs text-zinc-400">
            Sin documentos. Crea el primero con +.
          </p>
        ) : (
          <ul className="max-h-[420px] space-y-1 overflow-y-auto">
            {docs.map((doc) => {
              const active = selected?.id === doc.id
              return (
                <li key={doc.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(doc.id)}
                    className={`flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2.5 text-left transition-colors ${
                      active ? 'bg-zinc-900 text-white' : 'hover:bg-zinc-50'
                    }`}
                  >
                    <span className="text-lg leading-none">{doc.icon}</span>
                    <span className="min-w-0">
                      <span
                        className={`block truncate text-[13px] font-bold ${active ? 'text-white' : 'text-zinc-800'}`}
                      >
                        {doc.title}
                      </span>
                      <span
                        className={`block truncate text-[11px] ${active ? 'text-zinc-300' : 'text-zinc-400'}`}
                      >
                        {PROJECT_DOC_CATEGORY_META[doc.category].label} · {doc.author}
                      </span>
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </aside>

      {/* Lienzo */}
      <section className="min-h-[420px] rounded-2xl border border-zinc-200 bg-white p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] md:p-7">
        {!selected ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 py-16 text-center">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-zinc-100 text-zinc-400">
              <FileText size={22} />
            </div>
            <p className="text-sm font-semibold text-zinc-700">Sin documento seleccionado</p>
            <p className="max-w-sm text-[13px] text-zinc-400">
              Crea tu primer documento de proyecto: requerimientos, minutas o manuales.
            </p>
          </div>
        ) : (
          <>
            <div className="flex flex-wrap items-center gap-2 border-b border-zinc-100 pb-4">
              <span className="text-3xl leading-none">{selected.icon}</span>
              <div className="min-w-0 flex-1">
                {editing ? (
                  <input
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    placeholder="Título del documento"
                    className="w-full bg-transparent text-xl font-extrabold tracking-tight text-zinc-900 outline-none placeholder:text-zinc-300"
                  />
                ) : (
                  <h3 className="truncate text-xl font-extrabold tracking-tight text-zinc-900">
                    {selected.title}
                  </h3>
                )}
                <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-[11px] text-zinc-400">
                  <span className="font-semibold">{selected.author}</span>
                  <span className="inline-flex items-center gap-1">
                    <Clock size={11} /> {formatDateTime(selected.lastEdited)}
                  </span>
                  <span className="rounded bg-zinc-100 px-1.5 py-px font-bold uppercase tracking-wide">
                    {PROJECT_DOC_CATEGORY_META[selected.category].label}
                  </span>
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPreview((prev) => !prev)}
                  aria-label="Alternar vista previa"
                  className={`inline-flex h-9 items-center gap-1.5 rounded-lg border px-3 text-xs font-bold transition-colors ${
                    preview
                      ? 'border-zinc-900 bg-zinc-900 text-white'
                      : 'border-zinc-200 text-zinc-600 hover:bg-zinc-50'
                  }`}
                >
                  <Eye size={14} /> Vista
                </button>
                {editing ? (
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={!dirty || !title.trim()}
                    className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-brand px-4 text-xs font-bold text-white transition-colors hover:bg-brand-hover disabled:opacity-50"
                  >
                    <Save size={14} /> Guardar
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setEditing(true)}
                    className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-zinc-200 px-4 text-xs font-bold text-zinc-700 transition-colors hover:bg-zinc-50"
                  >
                    <Pencil size={14} /> Editar
                  </button>
                )}
              </div>
            </div>

            {editing && (
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <label className="text-xs font-semibold text-zinc-500">
                  Categoría{' '}
                  <select
                    value={category}
                    onChange={(event) => setCategory(event.target.value as ProjectDocCategory)}
                    className="ml-1 h-9 rounded-lg border border-zinc-200 bg-white px-2 text-xs font-bold text-zinc-700 outline-none focus:border-brand"
                  >
                    {CATEGORIES.map((option) => (
                      <option key={option} value={option}>
                        {PROJECT_DOC_CATEGORY_META[option].label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            )}

            <div className="mt-4">
              {editing && !preview ? (
                <textarea
                  value={content}
                  onChange={(event) => setContent(event.target.value)}
                  rows={16}
                  placeholder="Escribe el contenido (Markdown)…"
                  className="w-full resize-y rounded-xl border border-zinc-200 bg-zinc-50/60 p-4 font-mono text-[13px] leading-relaxed text-zinc-800 outline-none focus:border-brand focus:bg-white"
                />
              ) : (
                <article className="prose-sm max-w-none space-y-3 text-[14px] leading-relaxed text-zinc-700">
                  {paragraphs.map((line, index) => {
                    const trimmed = line.trim()
                    if (trimmed.startsWith('### ')) {
                      return <h4 key={index} className="text-base font-extrabold text-zinc-900">{trimmed.slice(4)}</h4>
                    }
                    if (trimmed.startsWith('## ')) {
                      return <h3 key={index} className="text-lg font-extrabold text-zinc-900">{trimmed.slice(3)}</h3>
                    }
                    if (trimmed.startsWith('# ')) {
                      return <h2 key={index} className="text-xl font-extrabold text-zinc-900">{trimmed.slice(2)}</h2>
                    }
                    if (trimmed.startsWith('- ')) {
                      return (
                        <p key={index} className="flex gap-2">
                          <span className="text-brand">•</span>
                          <span>{trimmed.slice(2)}</span>
                        </p>
                      )
                    }
                    return <p key={index}>{line}</p>
                  })}
                </article>
              )}
            </div>
          </>
        )}
      </section>
    </div>
  )
}

export default DocsTab
