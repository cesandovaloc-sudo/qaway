import { useNavigate } from 'react-router-dom'
import {
  Clock,
  Send,
  Archive,
  Plus,
  RotateCcw,
} from 'lucide-react'
import type { Post, PostStatus } from '../../types'
import { useBlog } from '../../context/BlogContext'

interface BlogKanbanBoardProps {
  posts: Post[]
  selectedCategoryFilter?: string | null
  searchQuery: string
}

export default function BlogKanbanBoard({
  posts,
  selectedCategoryFilter,
  searchQuery,
}: BlogKanbanBoardProps) {
  const navigate = useNavigate()
  const { setStatus } = useBlog()

  const filteredPosts = posts.filter(p => {
    const matchesCat = !selectedCategoryFilter || p.category.toLowerCase() === selectedCategoryFilter.toLowerCase()
    const matchesSearch =
      !searchQuery ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCat && matchesSearch
  })

  const columns: { id: PostStatus; label: string; color: string }[] = [
    { id: 'borrador', label: 'Borradores & En Redacción', color: '#ff4b0b' },
    { id: 'publicado', label: 'Publicados en Vivo', color: '#00b090' },
    { id: 'archivado', label: 'Archivados', color: '#71717a' },
  ]

  return (
    <div className="space-y-5 font-sans">
      <div className="flex items-center justify-between pb-3.5 border-b border-line">
        <span className="text-sm font-normal text-muted">
          Tablero Kanban del Flujo Editorial (<strong className="font-semibold text-primary">{filteredPosts.length}</strong> artículos)
        </span>
        <button
          type="button"
          onClick={() => navigate('/editor')}
          className="inline-flex items-center gap-1.5 bg-[#24262e] hover:bg-[#2f323c] text-white px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Añadir Post</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
        {columns.map(col => {
          const colItems = filteredPosts.filter(p => p.status === col.id)

          return (
            <div
              key={col.id}
              className="bg-[#fafafc] border border-line rounded-xl p-3.5 space-y-3.5 min-h-[520px] flex flex-col"
            >
              {/* Header Columna */}
              <div className="flex items-center justify-between px-1 pb-2.5 border-b border-line">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: col.color }}
                  />
                  <h3 className="font-semibold text-xs sm:text-sm uppercase tracking-wider text-muted">
                    {col.label}
                  </h3>
                </div>
                <span className="text-xs font-mono text-muted bg-white px-2 py-0.5 rounded-md border border-line">
                  {colItems.length}
                </span>
              </div>

              {/* Lista de Tarjetas de la Columna */}
              <div className="space-y-3.5 flex-1">
                {colItems.length === 0 ? (
                  <div className="h-36 border border-dashed border-line rounded-lg flex items-center justify-center text-sm text-muted-light italic bg-white/50">
                    Sin artículos aquí
                  </div>
                ) : (
                  colItems.map(post => (
                    <div
                      key={post.id}
                      className="bg-white border border-line hover:border-accent/50 rounded-xl p-4 shadow-xs hover:shadow-md transition-all space-y-3 group"
                    >
                      {/* Portada Mini */}
                      {post.coverUrl && (
                        <div
                          onClick={() => navigate(`/editor/${post.id}`)}
                          className="h-32 rounded-lg overflow-hidden border border-line bg-surface-muted cursor-pointer"
                        >
                          <img
                            src={post.coverUrl}
                            alt=""
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      )}

                      <div
                        onClick={() => navigate(`/editor/${post.id}`)}
                        className="cursor-pointer space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium px-2 py-0.5 rounded bg-surface-muted text-primary/80 border border-line">
                            {post.category}
                          </span>
                          <span className="text-xs font-mono text-muted flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-muted-light" /> ~{post.readingTime || 2}m
                          </span>
                        </div>

                        <h4 className="text-[15px] sm:text-base font-semibold text-primary group-hover:text-accent transition-colors leading-snug line-clamp-2">
                          {post.title}
                        </h4>

                        <p className="text-[13px] text-muted line-clamp-2 leading-relaxed font-normal">
                          {post.excerpt || 'Sin extracto'}
                        </p>
                      </div>

                      {/* Acciones de Flujo de Estado */}
                      <div className="pt-2.5 border-t border-line/80 flex items-center justify-between text-xs">
                        <button
                          type="button"
                          onClick={() => navigate(`/editor/${post.id}`)}
                          className="text-accent hover:underline font-semibold text-xs sm:text-sm cursor-pointer"
                        >
                          Editar →
                        </button>

                        <div className="flex items-center gap-1.5">
                          {col.id === 'borrador' && (
                            <button
                              type="button"
                              onClick={() => setStatus(post.id, 'publicado')}
                              className="px-2.5 py-1 bg-success/10 hover:bg-success/20 text-success text-xs font-semibold rounded-md flex items-center gap-1 cursor-pointer transition-colors"
                              title="Publicar en vivo"
                            >
                              <Send className="w-3.5 h-3.5" /> Publicar
                            </button>
                          )}

                          {col.id === 'publicado' && (
                            <button
                              type="button"
                              onClick={() => setStatus(post.id, 'archivado')}
                              className="px-2.5 py-1 bg-surface-muted hover:bg-line text-muted text-xs font-semibold rounded-md flex items-center gap-1 cursor-pointer transition-colors"
                              title="Archivar post"
                            >
                              <Archive className="w-3.5 h-3.5" /> Archivar
                            </button>
                          )}

                          {col.id === 'archivado' && (
                            <button
                              type="button"
                              onClick={() => setStatus(post.id, 'borrador')}
                              className="px-2.5 py-1 bg-surface-muted hover:bg-line text-muted text-xs font-semibold rounded-md flex items-center gap-1 cursor-pointer transition-colors"
                              title="Restaurar a borrador"
                            >
                              <RotateCcw className="w-3.5 h-3.5" /> Reabrir
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
