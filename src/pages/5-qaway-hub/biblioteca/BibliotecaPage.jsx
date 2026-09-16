import { useState } from 'react'
import { Search, LibraryBig, Sparkles, AppWindow, FolderGit2, ArrowUpRight, SlidersHorizontal, BookOpen } from 'lucide-react'

/**
 * BIBLIOTECA — Maqueta visual v1
 * Solo diseño, sin información real. Sin conexión a datos ni router.
 * Paleta propia de propuesta, aislada de la web actual.
 */

const TIPOS = [
  { id: 'todos', label: 'Todos', icon: LibraryBig },
  { id: 'skills', label: 'Skills', icon: Sparkles },
  { id: 'apps', label: 'Apps', icon: AppWindow },
  { id: 'repos', label: 'Repos', icon: FolderGit2 },
]

const FUNCIONALIDADES = ['Automatizar', 'Diseñar', 'Vender', 'Medir', 'Atender', 'Publicar']
const NICHOS = ['Salud', 'Gastronomía', 'Educación', 'Retail', 'Servicios', 'Inmobiliaria']

const MOCK_CARDS = Array.from({ length: 6 }).map((_, i) => ({
  index: String(i + 1).padStart(2, '0'),
  tipo: ['Skill', 'App', 'Repo'][i % 3],
  nombre: 'Nombre del ítem',
  funcion: 'Funcionalidad breve en una línea…',
  nichos: ['Nicho A', 'Nicho B'],
}))

export default function BibliotecaPage() {
  const [tipo, setTipo] = useState('todos')
  const [funcion, setFuncion] = useState(null)
  const [nicho, setNicho] = useState(null)

  return (
    <div className="min-h-screen" style={{ background: '#0E0E11', color: '#F2EFE6' }}>
      {/* Barra superior de archivo */}
      <header className="border-b" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
        <div className="mx-auto flex max-w-6xl flex-col gap-5 px-6 py-10">
          <div className="flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.22em]" style={{ color: '#8B8B93' }}>
            <span className="flex items-center gap-2">
              <BookOpen size={14} /> Biblioteca — Índice vivo
            </span>
            <span>000 ítems · maqueta</span>
          </div>
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <h1 className="max-w-xl leading-[0.95]" style={{ fontFamily: 'Georgia, "Times New Roman", serif', fontSize: 'clamp(2.6rem,6vw,4.4rem)' }}>
              Todo lo que<br />sabemos <em style={{ color: '#D8FF3E' }}>hacer.</em>
            </h1>
            <p className="max-w-sm text-sm leading-relaxed" style={{ color: '#8B8B93' }}>
              Maqueta de exploración. Aquí vivirán skills, aplicaciones y repositorios para llegar rápido a la información.
            </p>
          </div>

          {/* Buscador maqueta */}
          <div className="flex items-center gap-3 rounded-2xl border px-4 py-3" style={{ borderColor: 'rgba(255,255,255,0.1)', background: '#16161A' }}>
            <Search size={18} style={{ color: '#D8FF3E' }} />
            <input
              disabled
              placeholder="Buscar por nombre, funcionalidad, nicho… (maqueta)"
              className="w-full bg-transparent text-sm outline-none placeholder:text-[#5c5c64]"
            />
            <span className="hidden rounded-full px-3 py-1 font-mono text-[11px] sm:block" style={{ background: '#D8FF3E', color: '#0E0E11' }}>
              ⌘K
            </span>
          </div>
        </div>
      </header>

      {/* Filtros */}
      <div className="mx-auto max-w-6xl px-6 py-6">
        <div className="flex flex-wrap items-center gap-2">
          {TIPOS.map((t) => {
            const Icon = t.icon
            const active = tipo === t.id
            return (
              <button
                key={t.id}
                onClick={() => setTipo(t.id)}
                className="flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition"
                style={{
                  borderColor: active ? '#D8FF3E' : 'rgba(255,255,255,0.12)',
                  background: active ? '#D8FF3E' : 'transparent',
                  color: active ? '#0E0E11' : '#F2EFE6',
                }}
              >
                <Icon size={15} /> {t.label}
              </button>
            )
          })}
          <span className="ml-auto flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest" style={{ color: '#8B8B93' }}>
            <SlidersHorizontal size={13} /> Filtros visuales
          </span>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <div className="rounded-2xl border p-4" style={{ borderColor: 'rgba(255,255,255,0.08)', background: '#131316' }}>
            <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.2em]" style={{ color: '#8B8B93' }}>Funcionalidad</p>
            <div className="flex flex-wrap gap-2">
              {FUNCIONALIDADES.map((f) => (
                <button
                  key={f}
                  onClick={() => setFuncion(funcion === f ? null : f)}
                  className="rounded-full border px-3 py-1.5 text-[13px]"
                  style={{
                    borderColor: funcion === f ? '#D8FF3E' : 'rgba(255,255,255,0.12)',
                    color: funcion === f ? '#D8FF3E' : '#C9C9CF',
                  }}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border p-4" style={{ borderColor: 'rgba(255,255,255,0.08)', background: '#131316' }}>
            <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.2em]" style={{ color: '#8B8B93' }}>Nicho de mercado</p>
            <div className="flex flex-wrap gap-2">
              {NICHOS.map((n) => (
                <button
                  key={n}
                  onClick={() => setNicho(nicho === n ? null : n)}
                  className="rounded-full border px-3 py-1.5 text-[13px]"
                  style={{
                    borderColor: nicho === n ? '#D8FF3E' : 'rgba(255,255,255,0.12)',
                    color: nicho === n ? '#D8FF3E' : '#C9C9CF',
                  }}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Grid maqueta */}
      <main className="mx-auto max-w-6xl px-6 pb-16">
        <div className="mb-4 flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.2em]" style={{ color: '#8B8B93' }}>
          <span>Resultado — maqueta</span>
          <span>Orden: Recientes</span>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {MOCK_CARDS.map((c) => (
            <article
              key={c.index}
              className="group flex flex-col justify-between rounded-[18px] p-5 transition hover:-translate-y-1"
              style={{ background: '#F2EFE6', color: '#0E0E11' }}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs" style={{ color: '#8a8a90' }}>{c.index}</span>
                  <span className="rounded-full px-3 py-1 font-mono text-[11px] uppercase tracking-widest" style={{ background: '#0E0E11', color: '#D8FF3E' }}>
                    {c.tipo}
                  </span>
                </div>
                <h3 className="mt-4 text-[22px] leading-tight" style={{ fontFamily: 'Georgia, serif' }}>{c.nombre}</h3>
                <p className="mt-2 text-sm" style={{ color: '#55555c' }}>{c.funcion}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {c.nichos.map((n) => (
                    <span key={n} className="rounded-full border px-2.5 py-1 text-xs" style={{ borderColor: 'rgba(0,0,0,0.15)', color: '#55555c' }}>
                      {n}
                    </span>
                  ))}
                </div>
              </div>
              <div className="mt-6 flex items-center justify-between border-t pt-4" style={{ borderColor: 'rgba(0,0,0,0.1)' }}>
                <span className="font-mono text-[11px] uppercase tracking-widest" style={{ color: '#8a8a90' }}>v0.0 · —</span>
                <span className="flex items-center gap-1 text-sm font-medium">
                  Abrir ficha <ArrowUpRight size={16} />
                </span>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-3 rounded-2xl border px-5 py-4 sm:flex-row" style={{ borderColor: 'rgba(255,255,255,0.08)', background: '#131316' }}>
          <p className="font-mono text-[11px] uppercase tracking-[0.2em]" style={{ color: '#8B8B93' }}>Paginación — maqueta · 01 / 08</p>
          <div className="flex gap-2">
            <span className="rounded-full border px-4 py-2 text-sm" style={{ borderColor: 'rgba(255,255,255,0.12)', color: '#5c5c64' }}>← Anterior</span>
            <span className="rounded-full px-4 py-2 text-sm font-medium" style={{ background: '#D8FF3E', color: '#0E0E11' }}>Siguiente →</span>
          </div>
        </div>
      </main>
    </div>
  )
}
