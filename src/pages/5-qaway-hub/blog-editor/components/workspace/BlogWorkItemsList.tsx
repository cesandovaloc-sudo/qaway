import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CheckCircle2,
  Circle,
  Clock,
  Trash2,
  Send,
  Plus,
  Archive,
  Image as ImageIcon,
} from 'lucide-react'
import type { Post, PostStatus } from '../../types'
import { useBlog } from '../../context/BlogContext'

interface BlogWorkItemsListProps {
  posts: Post[]
  selectedCategoryFilter?: string | null
  searchQuery: string
}

export default function BlogWorkItemsList({
  posts,
  selectedCategoryFilter,
  searchQuery,
}: BlogWorkItemsListProps) {
  const navigate = useNavigate()
  const { setStatus, deletePost } = useBlog()
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  // Filtrado de posts
  const filteredPosts = posts.filter(p => {
    const matchesCat = !selectedCategoryFilter || p.category.toLowerCase() === selectedCategoryFilter.toLowerCase()
    const matchesSearch =
      !searchQuery ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCat && matchesSearch
  })

  const groups: { id: PostStatus; label: string; color: string }[] = [
    { id: 'borrador', label: 'Borradores & En Redacción', color: '#ff4b0b' },
    { id: 'publicado', label: 'Publicados en Vivo', color: '#00b090' },
    { id: 'archivado', label: 'Archivados', color: '#71717a' },
  ]

  const toggleSelectOne = (id: string) => {
    const next = new Set(selectedIds)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelectedIds(next)
  }

  const handleBulkStatus = async (status: PostStatus) => {
    for (const id of selectedIds) {
      await setStatus(id, status)
    }
    setSelectedIds(new Set())
  }

  const handleBulkDelete = async () => {
    if (window.confirm(`¿Seguro que deseas eliminar ${selectedIds.size} artículo(s)?`)) {
      for (const id of selectedIds) {
        await deletePost(id)
      }
      setSelectedIds(new Set())
    }
  }

  return (
    <div className="space-y-6 font-sans">
      {/* Barra Superior de Métricas & Acciones en Lote (Bulk Actions) */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-3.5 border-b border-line">
        <div className="flex items-center gap-3">
          <span className="text-sm font-normal text-muted">
            Mostrando <strong className="font-semibold text-primary">{filteredPosts.length}</strong> de <strong className="font-semibold text-primary">{posts.length}</strong> artículos
            {selectedCategoryFilter && (
              <span className="ml-1.5 text-accent font-semibold">• Categoría: {selectedCategoryFilter}</span>
            )}
          </span>

          {selectedIds.size > 0 && (
            <div className="flex items-center gap-2 bg-surface-muted border border-line rounded-md px-3 py-1 text-xs">
              <span className="font-semibold text-primary">{selectedIds.size} seleccionados:</span>
              <button
                type="button"
                onClick={() => handleBulkStatus('publicado')}
                className="text-success hover:underline font-semibold flex items-center gap-1 cursor-pointer ml-1.5"
              >
                <Send className="w-3.5 h-3.5" /> Publicar
              </button>
              <button
                type="button"
                onClick={() => handleBulkStatus('archivado')}
                className="text-muted hover:underline font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Archive className="w-3.5 h-3.5" /> Archivar
              </button>
              <button
                type="button"
                onClick={handleBulkDelete}
                className="text-danger hover:underline font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" /> Eliminar
              </button>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => navigate('/editor')}
          className="inline-flex items-center gap-1.5 bg-[#24262e] hover:bg-[#2f323c] text-white px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Añadir Post</span>
        </button>
      </div>

      {/* Tabla agrupada por estado (Estilo Plane Work Items) */}
      <div className="space-y-5">
        {groups.map(grp => {
          const items = filteredPosts.filter(p => p.status === grp.id)
          if (items.length === 0 && grp.id === 'archivado') return null

          return (
            <div key={grp.id} className="bg-white border border-line rounded-xl overflow-hidden shadow-xs">
              {/* Encabezado del Grupo */}
              <div className="bg-[#fafafc] px-4 py-2.5 border-b border-line flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: grp.color }}
                  />
                  <h3 className="font-semibold text-xs sm:text-sm uppercase tracking-wider text-muted">
                    {grp.label}
                  </h3>
                  <span className="text-xs font-mono text-muted bg-surface px-2 py-0.5 rounded border border-line">
                    {items.length}
                  </span>
                </div>
              </div>

              {/* Filas de Artículos */}
              {items.length === 0 ? (
                <div className="py-8 text-center text-sm text-muted-light italic">
                  No hay artículos en este estado.
                </div>
              ) : (
                <div className="divide-y divide-line">
                  {items.map((post, idx) => {
                    const isChecked = selectedIds.has(post.id)
                    const isPub = post.status === 'publicado'

                    return (
                      <div
                        key={post.id}
                        className={`px-4 py-3 flex items-center gap-3.5 hover:bg-surface-subtle transition-colors group ${
                          isChecked ? 'bg-surface-muted' : ''
                        }`}
                      >
                        {/* Checkbox de selección */}
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleSelectOne(post.id)}
                          className="w-4 h-4 rounded text-accent focus:ring-accent border-line cursor-pointer shrink-0"
                        />

                        {/* Botón de toggle rápido de publicación */}
                        <button
                          type="button"
                          onClick={() => setStatus(post.id, isPub ? 'borrador' : 'publicado')}
                          className="text-muted hover:text-success transition-colors cursor-pointer shrink-0"
                          title={isPub ? 'Cambiar a borrador' : 'Publicar inmediatamente'}
                        >
                          {isPub ? (
                            <CheckCircle2 className="w-5 h-5 text-success" />
                          ) : (
                            <Circle className="w-5 h-5 text-muted group-hover:text-primary" />
                          )}
                        </button>

                        {/* Miniatura de Portada */}
                        <div
                          onClick={() => navigate(`/editor/${post.id}`)}
                          className="w-10 h-10 rounded-lg bg-surface-muted overflow-hidden border border-line shrink-0 cursor-pointer"
                        >
                          {post.coverUrl ? (
                            <img
                              src={post.coverUrl}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted-light opacity-40">
                              <ImageIcon className="w-4 h-4" />
                            </div>
                          )}
                        </div>

                        {/* Clave / Código */}
                        <span className="text-xs font-mono font-medium text-muted select-none shrink-0 w-16">
                          POST-{idx + 1 < 10 ? `0${idx + 1}` : idx + 1}
                        </span>

                        {/* Título y Extracto con buen tamaño y peso armónico */}
                        <div
                          onClick={() => navigate(`/editor/${post.id}`)}
                          className="flex-1 min-w-0 cursor-pointer pr-2"
                        >
                          <h4 className="text-[15px] sm:text-base font-semibold text-primary group-hover:text-accent transition-colors truncate leading-snug">
                            {post.title}
                          </h4>
                          <p className="text-[13px] text-muted truncate max-w-2xl font-normal leading-normal mt-0.5">
                            {post.excerpt || 'Sin extracto'}
                          </p>
                        </div>

                        {/* Categoría */}
                        <span className="text-xs font-medium px-2.5 py-1 rounded-md bg-surface-muted text-primary/80 border border-line shrink-0">
                          {post.category}
                        </span>

                        {/* Tiempo de Lectura */}
                        <span className="text-xs font-mono text-muted flex items-center gap-1 shrink-0">
                          <Clock className="w-3.5 h-3.5 text-muted-light" /> ~{post.readingTime || 2}m
                        </span>

                        {/* Fecha */}
                        <span className="text-xs font-mono text-muted shrink-0 hidden sm:inline">
                          {new Date(post.updatedAt).toLocaleDateString('es-PE', {
                            day: 'numeric',
                            month: 'short',
                          })}
                        </span>

                        {/* Acciones Rápidas */}
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => navigate(`/editor/${post.id}`)}
                            className="px-3 py-1 text-xs sm:text-sm font-semibold text-accent hover:bg-accent/10 rounded-md transition-colors cursor-pointer"
                          >
                            Editar
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm(`¿Eliminar "${post.title}"?`)) {
                                deletePost(post.id)
                              }
                            }}
                            className="p-1.5 text-muted hover:text-danger hover:bg-danger/10 rounded-md transition-colors cursor-pointer"
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
