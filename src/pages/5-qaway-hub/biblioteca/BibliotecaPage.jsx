import { useMemo, useState, useRef, useEffect } from 'react'
import {
  Search,
  LibraryBig,
  Sparkles,
  AppWindow,
  FolderGit2,
  ArrowUpRight,
  SlidersHorizontal,
  BookOpen,
  X,
  RotateCcw,
  Copy,
  Check,
  ExternalLink,
  Terminal,
  Code2,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import SEED from './biblioteca.seed.json'
import MATRIX from './skills-matrix.seed.json'

/**
 * BIBLIOTECA — Índice vivo de Skills, Aplicaciones y Repositorios
 * Conectado a biblioteca.seed.json v5 y skills-matrix.seed.json
 */

const TIPO_GROUP = {
  todos: null,
  skills: ['skill'],
  apps: ['app', 'infra', 'os'],
  repos: ['repo', 'lib'],
}

const TIPOS = [
  { id: 'todos', label: 'Todos', icon: LibraryBig },
  { id: 'skills', label: 'Skills', icon: Sparkles },
  { id: 'apps', label: 'Apps', icon: AppWindow },
  { id: 'repos', label: 'Repos', icon: FolderGit2 },
]

const FUNCIONALIDADES = ['Automatizar', 'Diseñar', 'Vender', 'Medir', 'Atender', 'Publicar']
const NICHOS = ['Salud', 'Gastronomía', 'Educación', 'Retail', 'Servicios', 'Inmobiliaria']
const COSTOS = ['todos', 'gratis', 'freemium', 'suscripcion']
const DESTACADOS_IDS = ['BIB-002', 'BIB-014']

const ITEMS = SEED.items || []

export default function BibliotecaPage() {
  const [tipo, setTipo] = useState('todos')
  const [funcion, setFuncion] = useState(null)
  const [nicho, setNicho] = useState(null)
  const [costo, setCosto] = useState('todos')
  const [q, setQ] = useState('')
  const [selectedId, setSelectedId] = useState(null)
  const [copiedCommand, setCopiedCommand] = useState(null)

  const inputRef = useRef(null)
  const selected = ITEMS.find((it) => it.id === selectedId) || null

  // Atajo de teclado Ctrl+K / Cmd+K para enfocar el buscador
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        inputRef.current?.focus()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const copyToClipboard = (text, id) => {
    if (!text) return
    navigator.clipboard.writeText(text)
    setCopiedCommand(id)
    setTimeout(() => setCopiedCommand(null), 2500)
  }

  const resetFilters = () => {
    setTipo('todos')
    setFuncion(null)
    setNicho(null)
    setCosto('todos')
    setQ('')
  }

  // Filtro inteligente de ítems de la Biblioteca
  const filtered = useMemo(() => {
    const group = TIPO_GROUP[tipo]
    const query = q.trim().toLowerCase()

    return ITEMS.filter((it) => {
      if (group && !group.includes(it.tipo)) return false
      if (costo !== 'todos' && it.costo !== costo) return false

      const searchableParts = [
        it.id,
        it.slug,
        it.nombre,
        it.nombre_simple,
        it.tipo,
        it.categoria,
        it.subcategoria,
        it.funcionalidad_corta,
        it.caso_uso,
        it.costo,
        it.nivel,
        it.instalacion?.metodo,
        it.instalacion?.formato,
        it.instalacion?.comando_ejemplo,
        it.acceso?.tipo_key,
        it.acceso?.costo_ref,
        it.stack?.lenguaje,
        it.stack?.rendimiento,
        it.url_repo,
        ...(it.plataforma || []),
        ...(it.nichos || []),
        ...(it.tags || []),
        ...(it.integraciones || []),
        ...(it.alias_busqueda || []),
        it.curso_repo?.modulo,
        it.curso_repo?.leccion,
      ].filter(Boolean).join(' ').toLowerCase()

      if (funcion && !searchableParts.includes(funcion.toLowerCase().slice(0, 4))) return false
      if (nicho && !searchableParts.includes(nicho.toLowerCase().slice(0, 4))) return false
      if (query && !searchableParts.includes(query)) return false
      return true
    })
  }, [tipo, funcion, nicho, costo, q])

  // Filtro en vivo de Skills instaladas
  const filteredSkills = useMemo(() => {
    const query = q.trim().toLowerCase()
    const all = (MATRIX.skills || []).filter((s) => s.estado !== 'descartada')
    if (!query) return all
    return all.filter((s) => {
      const searchable = [s.id, s.nombre, s.uso, s.nivel, s.origen, s.tipo, s.estado].filter(Boolean).join(' ').toLowerCase()
      return searchable.includes(query)
    })
  }, [q])

  // Destacados reactivos al filtro
  const filteredDestacados = useMemo(() => {
    const base = ITEMS.filter((it) => DESTACADOS_IDS.includes(it.id))
    const query = q.trim().toLowerCase()
    if (!query) return base
    return base.filter((it) => {
      const searchable = [it.id, it.slug, it.nombre, it.nombre_simple, it.funcionalidad_corta, it.instalacion?.comando_ejemplo, ...(it.tags || [])].filter(Boolean).join(' ').toLowerCase()
      return searchable.includes(query)
    })
  }, [q])

  const hasActiveFilters = Boolean(q || tipo !== 'todos' || costo !== 'todos' || funcion || nicho)

  return (
    <div className="min-h-screen font-sans" style={{ background: '#0E0E11', color: '#F2EFE6' }}>
      {/* Barra superior de archivo */}
      <header className="border-b" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
        <div className="mx-auto flex max-w-6xl flex-col gap-5 px-6 py-10">
          <Link to="/" aria-label="Volver al inicio" className="flex h-10 w-10 items-center justify-center rounded-full transition hover:opacity-90 shadow-md" style={{ background: '#D8FF3E', color: '#0E0E11' }}>
            <LibraryBig size={18} />
          </Link>
          <div className="flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.22em]" style={{ color: '#8B8B93' }}>
            <span className="flex items-center gap-2">
              <BookOpen size={14} /> Biblioteca — Índice vivo & comandos
            </span>
            <span>{String(ITEMS.length).padStart(3, '0')} ítems · seed-v5</span>
          </div>
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <h1 className="max-w-xl leading-[0.95]" style={{ fontFamily: 'Georgia, "Times New Roman", serif', fontSize: 'clamp(2.6rem,6vw,4.4rem)' }}>
              Todo lo que<br />sabemos <em style={{ color: '#D8FF3E' }}>hacer.</em>
            </h1>
            <p className="max-w-sm text-sm leading-relaxed" style={{ color: '#8B8B93' }}>
              Catálogo técnico con comandos de instalación ejecutables y enlaces oficiales a repositorios.
            </p>
          </div>

          {/* Buscador reactivo */}
          <div className="flex items-center gap-3 rounded-2xl border px-4 py-3 transition focus-within:border-[#D8FF3E]" style={{ borderColor: 'rgba(255,255,255,0.12)', background: '#16161A' }}>
            <Search size={18} style={{ color: '#D8FF3E' }} />
            <input
              ref={inputRef}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar por ID (BIB-002), comando de instalación, repo, skill o nicho…"
              className="w-full bg-transparent text-sm outline-none placeholder:text-[#5c5c64]"
            />
            {q && (
              <button
                type="button"
                onClick={() => setQ('')}
                className="rounded-full p-1 text-zinc-400 hover:text-white transition"
                title="Limpiar búsqueda"
              >
                <X size={16} />
              </button>
            )}
            <button
              type="button"
              onClick={() => inputRef.current?.focus()}
              className="hidden rounded-full px-3 py-1 font-mono text-[11px] sm:block transition hover:opacity-90"
              style={{ background: '#D8FF3E', color: '#0E0E11' }}
            >
              Ctrl K
            </button>
          </div>
        </div>
      </header>

      {/* Destacados — no olvidar */}
      {filteredDestacados.length > 0 && (
        <div className="mx-auto max-w-6xl px-6 pt-6">
          <div className="mb-3 flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.2em]" style={{ color: '#8B8B93' }}>
            <span>Destacados principales</span>
            <span>{filteredDestacados.length} recomendados</span>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {filteredDestacados.map((d) => (
              <article
                key={d.id}
                className="flex flex-col justify-between rounded-[18px] border p-5"
                style={{ borderColor: '#D8FF3E', background: '#16161A' }}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs" style={{ color: '#8B8B93' }}>{d.id} · Destacado</span>
                    <span className="rounded-full px-3 py-1 font-mono text-[11px] uppercase tracking-widest" style={{ background: '#D8FF3E', color: '#0E0E11' }}>
                      {d.tipo} · {d.costo}
                    </span>
                  </div>
                  <h3 className="mt-3 text-[22px] leading-tight font-extrabold" style={{ fontFamily: 'Georgia, serif' }}>{d.nombre_simple || d.nombre}</h3>
                  <p className="font-mono text-[11px] uppercase tracking-widest" style={{ color: '#8B8B93' }}>{d.nombre}</p>
                  <p className="mt-2 text-sm" style={{ color: '#C9C9CF' }}>{d.funcionalidad_corta}</p>

                  {/* Bloque rápido de comando de instalación */}
                  {d.instalacion?.comando_ejemplo && (
                    <div className="mt-3.5 flex items-center justify-between rounded-xl border px-3 py-2 font-mono text-xs" style={{ background: '#0E0E11', borderColor: 'rgba(216,255,62,0.3)', color: '#D8FF3E' }}>
                      <div className="flex items-center gap-2 min-w-0 truncate">
                        <Terminal size={14} className="shrink-0 text-zinc-500" />
                        <span className="truncate">{d.instalacion.comando_ejemplo}</span>
                      </div>
                      <button
                        onClick={() => copyToClipboard(d.instalacion.comando_ejemplo, d.id)}
                        className="ml-2 shrink-0 rounded-lg bg-zinc-800 p-1.5 text-zinc-300 hover:text-white transition"
                        title="Copiar comando"
                      >
                        {copiedCommand === d.id ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                      </button>
                    </div>
                  )}
                </div>

                <div className="mt-4 flex items-center justify-between border-t pt-3" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
                  {d.url_repo ? (
                    <a
                      href={d.url_repo}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 font-mono text-xs font-bold transition hover:underline"
                      style={{ color: '#8B8B93' }}
                    >
                      <ExternalLink size={13} /> Repo / Web
                    </a>
                  ) : (
                    <span className="font-mono text-xs text-zinc-600">Ver ficha técnica</span>
                  )}
                  <button onClick={() => setSelectedId(d.id)} className="flex items-center gap-1 text-sm font-bold hover:underline cursor-pointer" style={{ color: '#D8FF3E' }}>
                    Abrir ficha completa <ArrowUpRight size={16} />
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}

      {/* Skills instaladas — matriz única (filtradas en vivo) */}
      {filteredSkills.length > 0 && (
        <div className="mx-auto max-w-6xl px-6 pt-6">
          <div className="mb-3 flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.2em]" style={{ color: '#8B8B93' }}>
            <span>Skills instaladas — matriz única</span>
            <span>{filteredSkills.length} activas</span>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filteredSkills.map((s) => (
              <article
                key={s.id}
                className="rounded-[18px] border p-4"
                style={{ borderColor: 'rgba(255,255,255,0.12)', background: '#131316' }}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs" style={{ color: '#8B8B93' }}>{s.id}</span>
                  <span className="rounded-full px-3 py-1 font-mono text-[11px] uppercase tracking-widest" style={s.nivel === 'repo' ? { background: '#D8FF3E', color: '#0E0E11' } : { border: '1px solid rgba(255,255,255,0.2)', color: '#C9C9CF' }}>
                    {s.nivel}
                  </span>
                </div>
                <h4 className="mt-2 text-[17px] leading-tight font-extrabold" style={{ fontFamily: 'Georgia, serif' }}>{s.nombre}</h4>
                <p className="mt-1 text-[13px]" style={{ color: '#8B8B93' }}>{s.uso}</p>
                <p className="mt-2 truncate font-mono text-[11px]" style={{ color: '#5c5c64' }}>{s.origen}{s.estado === 'revisar' ? ' · revisar' : ''}</p>
              </article>
            ))}
          </div>
        </div>
      )}

      {/* Filtros con tope sticky */}
      <div className="sticky top-0 z-20 mx-auto max-w-6xl px-6 py-6" style={{ background: '#0E0E11', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="flex flex-wrap items-center gap-2">
          {TIPOS.map((t) => {
            const Icon = t.icon
            const active = tipo === t.id
            return (
              <button
                key={t.id}
                onClick={() => setTipo(t.id)}
                className="flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition cursor-pointer"
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

          <div className="ml-auto flex items-center gap-3">
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="flex items-center gap-1.5 rounded-full border px-3 py-1 font-mono text-[11px] uppercase tracking-widest transition cursor-pointer"
                style={{ borderColor: 'rgba(255,75,11,0.5)', color: '#ff4b0b', background: 'rgba(255,75,11,0.1)' }}
              >
                <RotateCcw size={12} /> Limpiar filtros
              </button>
            )}
            <span className="hidden sm:flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest" style={{ color: '#8B8B93' }}>
              <SlidersHorizontal size={13} /> Filtros visuales
            </span>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="font-mono text-[11px] uppercase tracking-[0.2em]" style={{ color: '#8B8B93' }}>Costo:</span>
          {COSTOS.map((c) => (
            <button
              key={c}
              onClick={() => setCosto(c)}
              className="rounded-full border px-3 py-1.5 text-[13px] transition cursor-pointer"
              style={{
                borderColor: costo === c ? '#D8FF3E' : 'rgba(255,255,255,0.12)',
                background: costo === c ? '#D8FF3E' : 'transparent',
                color: costo === c ? '#0E0E11' : '#C9C9CF',
              }}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <div className="rounded-2xl border p-4" style={{ borderColor: 'rgba(255,255,255,0.08)', background: '#131316' }}>
            <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.2em]" style={{ color: '#8B8B93' }}>Funcionalidad</p>
            <div className="flex flex-wrap gap-2">
              {FUNCIONALIDADES.map((f) => (
                <button
                  key={f}
                  onClick={() => setFuncion(funcion === f ? null : f)}
                  className="rounded-full border px-3 py-1.5 text-[13px] transition cursor-pointer"
                  style={{
                    borderColor: funcion === f ? '#D8FF3E' : 'rgba(255,255,255,0.12)',
                    color: funcion === f ? '#D8FF3E' : '#C9C9CF',
                    background: funcion === f ? 'rgba(216,255,62,0.1)' : 'transparent',
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
                  className="rounded-full border px-3 py-1.5 text-[13px] transition cursor-pointer"
                  style={{
                    borderColor: nicho === n ? '#D8FF3E' : 'rgba(255,255,255,0.12)',
                    color: nicho === n ? '#D8FF3E' : '#C9C9CF',
                    background: nicho === n ? 'rgba(216,255,62,0.1)' : 'transparent',
                  }}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Grid de Ítems */}
      <main className="mx-auto max-w-6xl px-6 pb-16">
        <div className="mb-4 flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.2em]" style={{ color: '#8B8B93' }}>
          <span>Resultado — {filtered.length}/{ITEMS.length}</span>
          <span>Orden: Recientes</span>
        </div>

        {filtered.length === 0 ? (
          <div className="my-8 rounded-[18px] border p-8 text-center" style={{ borderColor: 'rgba(255,255,255,0.08)', background: '#131316' }}>
            <Search size={36} className="mx-auto mb-3 text-zinc-500" />
            <h3 className="text-xl font-bold" style={{ fontFamily: 'Georgia, serif' }}>
              No se encontraron ítems para "{q || 'los filtros seleccionados'}"
            </h3>
            <p className="mt-2 text-sm text-[#8B8B93]">
              Prueba buscando por ID (ej. BIB-002), por comando de instalación o limpia los filtros.
            </p>
            <button
              onClick={resetFilters}
              className="mt-5 inline-flex items-center gap-2 rounded-full px-5 py-2.5 font-mono text-xs uppercase tracking-wider font-bold transition hover:opacity-90 cursor-pointer"
              style={{ background: '#D8FF3E', color: '#0E0E11' }}
            >
              <RotateCcw size={14} /> Restablecer filtros y búsqueda
            </button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((c) => (
              <article
                key={c.id}
                className="group flex flex-col justify-between rounded-[18px] p-5 transition hover:-translate-y-1"
                style={{ background: '#F2EFE6', color: '#0E0E11' }}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs" style={{ color: '#8a8a90' }}>{c.id}</span>
                    <span className="rounded-full px-3 py-1 font-mono text-[11px] uppercase tracking-widest font-bold" style={{ background: '#0E0E11', color: '#D8FF3E' }}>
                      {c.tipo}
                    </span>
                  </div>
                  <h3 className="mt-4 text-[22px] leading-tight font-extrabold" style={{ fontFamily: 'Georgia, serif' }}>{c.nombre_simple || c.nombre}</h3>
                  <p className="font-mono text-[11px] uppercase tracking-widest" style={{ color: '#8a8a90' }}>{c.nombre}</p>
                  <p className="mt-2 text-sm font-medium" style={{ color: '#55555c' }}>{c.funcionalidad_corta}</p>

                  {/* Vista previa de comando de instalación */}
                  {c.instalacion?.comando_ejemplo && (
                    <div className="mt-3 flex items-center justify-between rounded-xl border border-zinc-300 bg-white/80 px-2.5 py-1.5 font-mono text-[11px] text-zinc-900 shadow-xs">
                      <span className="truncate font-semibold">{c.instalacion.comando_ejemplo}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          copyToClipboard(c.instalacion.comando_ejemplo, `card-${c.id}`)
                        }}
                        className="ml-1 shrink-0 rounded p-1 text-zinc-500 hover:bg-zinc-100 transition"
                        title="Copiar comando"
                      >
                        {copiedCommand === `card-${c.id}` ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                      </button>
                    </div>
                  )}

                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {(c.nichos || []).slice(0, 2).map((n) => (
                      <span key={n} className="rounded-full border px-2 py-0.5 text-[11px]" style={{ borderColor: 'rgba(0,0,0,0.15)', color: '#55555c' }}>
                        {n}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between border-t pt-3" style={{ borderColor: 'rgba(0,0,0,0.1)' }}>
                  <span className="font-mono text-[10px] uppercase tracking-widest font-semibold" style={{ color: '#8a8a90' }}>
                    {c.instalacion?.metodo} · {c.acceso?.requiere_key ? c.acceso?.tipo_key : 'sin-key'}
                  </span>
                  <button onClick={() => setSelectedId(c.id)} className="flex items-center gap-1 text-xs font-bold hover:underline cursor-pointer">
                    Ver ficha <ArrowUpRight size={15} />
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}

        <div className="mt-8 flex flex-col items-center justify-between gap-3 rounded-2xl border px-5 py-4 sm:flex-row" style={{ borderColor: 'rgba(255,255,255,0.08)', background: '#131316' }}>
          <p className="font-mono text-[11px] uppercase tracking-[0.2em]" style={{ color: '#8B8B93' }}>Seed v5 · {filtered.length} visibles</p>
          <div className="flex gap-2">
            <span className="rounded-full border px-4 py-2 text-sm" style={{ borderColor: 'rgba(255,255,255,0.12)', color: '#5c5c64' }}>← Anterior</span>
            <span className="rounded-full px-4 py-2 text-sm font-medium" style={{ background: '#D8FF3E', color: '#0E0E11' }}>Siguiente →</span>
          </div>
        </div>
      </main>

      {/* Modal Ficha Completa Avanzada (Técnica y Accionable) */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center animate-in fade-in duration-150" style={{ background: 'rgba(0,0,0,0.75)' }} onClick={() => setSelectedId(null)}>
          <div className="w-full max-w-xl rounded-[20px] p-6 sm:p-7 shadow-2xl animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto" style={{ background: '#F2EFE6', color: '#0E0E11' }} onClick={(e) => e.stopPropagation()}>

            {/* Cabecera */}
            <div className="flex items-start justify-between border-b border-zinc-300/60 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold" style={{ color: '#8a8a90' }}>{selected.id}</span>
                  <span className="text-zinc-400">·</span>
                  <span className="font-mono text-xs text-zinc-600 font-semibold">{selected.categoria} / {selected.subcategoria}</span>
                </div>
                <h3 className="mt-1 text-2xl sm:text-3xl font-extrabold leading-tight" style={{ fontFamily: 'Georgia, serif' }}>{selected.nombre_simple || selected.nombre}</h3>
                <p className="font-mono text-xs font-bold uppercase tracking-wider text-zinc-500">{selected.nombre}</p>
              </div>
              <button
                onClick={() => setSelectedId(null)}
                className="rounded-full p-2 text-zinc-500 hover:bg-zinc-200 hover:text-zinc-900 transition"
              >
                <X size={20} />
              </button>
            </div>

            {/* Bloque Principal de Instalación y Ejecución */}
            <div className="my-4 rounded-2xl border p-4 shadow-inner" style={{ background: '#0E0E11', borderColor: '#D8FF3E', color: '#F2EFE6' }}>
              <div className="flex items-center justify-between mb-2">
                <span className="flex items-center gap-1.5 font-mono text-xs font-bold uppercase tracking-wider" style={{ color: '#D8FF3E' }}>
                  <Terminal size={15} /> Comando de Instalación / Ejecución:
                </span>
                {selected.instalacion?.comando_ejemplo && (
                  <button
                    onClick={() => copyToClipboard(selected.instalacion.comando_ejemplo, 'modal')}
                    className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1 font-mono text-xs font-bold transition cursor-pointer"
                    style={{ background: '#D8FF3E', color: '#0E0E11' }}
                  >
                    {copiedCommand === 'modal' ? (
                      <>
                        <Check size={14} /> ¡Copiado al portapapeles!
                      </>
                    ) : (
                      <>
                        <Copy size={14} /> Copiar comando
                      </>
                    )}
                  </button>
                )}
              </div>

              <div className="overflow-x-auto rounded-xl bg-black/80 p-3 font-mono text-xs text-[#D8FF3E] border border-zinc-800">
                <code>{selected.instalacion?.comando_ejemplo || 'Consultar repositorio oficial para el método de instalación.'}</code>
              </div>
            </div>

            {/* Botón Destacado de Repositorio u Oficial Web */}
            {selected.url_repo && (
              <div className="mb-4">
                <a
                  href={selected.url_repo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl py-3 px-4 font-mono text-xs uppercase tracking-wider font-extrabold transition shadow-md hover:opacity-90"
                  style={{ background: '#0E0E11', color: '#D8FF3E' }}
                >
                  <ExternalLink size={16} /> Abrir Repositorio Oficial / Documentación y Actualizaciones ↗
                </a>
              </div>
            )}

            {/* Descripción y Caso de Uso Real */}
            <div className="space-y-3 text-sm">
              <div className="rounded-xl border border-zinc-200/80 bg-white/60 p-3.5">
                <p className="font-mono text-[11px] font-extrabold uppercase tracking-wider text-zinc-500 mb-1">Funcionalidad Principal:</p>
                <p className="font-semibold text-zinc-900 leading-snug">{selected.funcionalidad_corta}</p>
              </div>

              <div className="rounded-xl border border-zinc-200/80 bg-white/60 p-3.5">
                <p className="font-mono text-[11px] font-extrabold uppercase tracking-wider text-zinc-500 mb-1">Caso de Uso de Producción:</p>
                <p className="text-zinc-700 leading-relaxed font-medium">{selected.caso_uso}</p>
              </div>
            </div>

            {/* Matriz Técnica de Atributos */}
            <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
              <div className="rounded-xl border border-zinc-200/60 bg-white/50 p-3">
                <p className="font-mono text-[10px] font-extrabold uppercase tracking-widest text-zinc-400">Método & Formato</p>
                <p className="font-bold text-zinc-800 mt-0.5">{selected.instalacion?.metodo} · {selected.instalacion?.formato}</p>
              </div>

              <div className="rounded-xl border border-zinc-200/60 bg-white/50 p-3">
                <p className="font-mono text-[10px] font-extrabold uppercase tracking-widest text-zinc-400">Acceso / API Key</p>
                <p className="font-bold text-zinc-800 mt-0.5">{selected.acceso?.requiere_key ? selected.acceso?.tipo_key : 'sin-key (gratis)'}{selected.acceso?.costo_ref ? ` · ${selected.acceso.costo_ref}` : ''}</p>
              </div>

              <div className="rounded-xl border border-zinc-200/60 bg-white/50 p-3">
                <p className="font-mono text-[10px] font-extrabold uppercase tracking-widest text-zinc-400">Stack & Rendimiento</p>
                <p className="font-bold text-zinc-800 mt-0.5">{selected.stack?.rendimiento}{selected.stack?.lenguaje ? ` (${selected.stack.lenguaje})` : ''}</p>
              </div>

              <div className="rounded-xl border border-zinc-200/60 bg-white/50 p-3">
                <p className="font-mono text-[10px] font-extrabold uppercase tracking-widest text-zinc-400">Plataforma / Nivel</p>
                <p className="font-bold text-zinc-800 mt-0.5">{(selected.plataforma || []).join('/')} · {selected.nivel}</p>
              </div>
            </div>

            {/* Tags e Integraciones */}
            <div className="mt-4 flex flex-wrap gap-1.5">
              {[...(selected.integraciones || []), ...(selected.tags || [])].map((t) => (
                <span key={t} className="rounded-full border border-zinc-300 bg-white/80 px-3 py-1 text-xs font-semibold text-zinc-700">#{t}</span>
              ))}
            </div>

            {selected.curso_repo?.usar_en_curso && (
              <div className="mt-4 rounded-xl p-3.5 font-medium border border-zinc-900" style={{ background: '#0E0E11', color: '#D8FF3E' }}>
                <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-400 font-bold mb-1">Módulo del Curso Relacionado:</p>
                <p className="text-xs font-bold">{selected.curso_repo.modulo} · {selected.curso_repo.leccion} ({selected.curso_repo.rol})</p>
                <p className="text-[11px] text-zinc-300 mt-1">Resultado: {selected.curso_repo.resultado_esperado}</p>
              </div>
            )}

            <div className="mt-4 flex items-center justify-between border-t border-zinc-300/60 pt-3 text-[11px] font-mono text-zinc-500">
              <span>Popularidad: {selected.popularidad?.estrellas || selected.popularidad?.nota}</span>
              <span>Prioridad Qaway: <strong className="text-zinc-800 uppercase">{selected.prioridad_qaway}</strong></span>
            </div>

            <button
              onClick={() => setSelectedId(null)}
              className="mt-5 w-full rounded-xl py-3 text-xs font-mono font-bold uppercase tracking-wider transition hover:opacity-90 shadow-sm cursor-pointer"
              style={{ background: '#0E0E11', color: '#F2EFE6' }}
            >
              Cerrar Ficha Técnica
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
