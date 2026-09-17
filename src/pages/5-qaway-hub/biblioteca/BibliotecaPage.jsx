import { useMemo, useState } from 'react'
import { Search, LibraryBig, Sparkles, AppWindow, FolderGit2, ArrowUpRight, SlidersHorizontal, BookOpen } from 'lucide-react'
import { Link } from 'react-router-dom'
import SEED from './biblioteca.seed.json'

/**
 * BIBLIOTECA — Maqueta visual v2 con seed real
 * Mismo diseño propuesto, ahora conectado a biblioteca.seed.json.
 * Sin router nuevo, sin backend, solo filtro local.
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
  const selected = ITEMS.find((it) => it.id === selectedId) || null

  const filtered = useMemo(() => {
    const group = TIPO_GROUP[tipo]
    const query = q.trim().toLowerCase()
    return ITEMS.filter((it) => {
      if (group && !group.includes(it.tipo)) return false
      if (costo !== 'todos' && it.costo !== costo) return false
      const hay = `${it.nombre} ${it.nombre_simple || ''} ${it.funcionalidad_corta} ${it.caso_uso} ${it.categoria} ${it.subcategoria} ${it.costo} ${(it.plataforma || []).join(' ')} ${it.nivel} ${(it.nichos || []).join(' ')} ${(it.tags || []).join(' ')} ${(it.integraciones || []).join(' ')} ${(it.alias_busqueda || []).join(' ')} ${it.curso_repo?.modulo || ''} ${it.curso_repo?.leccion || ''}`.toLowerCase()
      if (funcion && !hay.includes(funcion.toLowerCase().slice(0, 4))) return false
      if (nicho && !hay.includes(nicho.toLowerCase().slice(0, 4))) return false
      if (query && !hay.includes(query)) return false
      return true
    })
  }, [tipo, funcion, nicho, costo, q])

  const destacados = ITEMS.filter((it) => DESTACADOS_IDS.includes(it.id))

  return (
    <div className="min-h-screen" style={{ background: '#0E0E11', color: '#F2EFE6' }}>
      {/* Barra superior de archivo */}
      <header className="border-b" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
        <div className="mx-auto flex max-w-6xl flex-col gap-5 px-6 py-10">
          <Link to="/" aria-label="Volver al inicio" className="flex h-10 w-10 items-center justify-center rounded-full" style={{ background: '#D8FF3E', color: '#0E0E11' }}>
            <LibraryBig size={18} />
          </Link>
          <div className="flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.22em]" style={{ color: '#8B8B93' }}>
            <span className="flex items-center gap-2">
              <BookOpen size={14} /> Biblioteca — Índice vivo
            </span>
            <span>{String(ITEMS.length).padStart(3, '0')} ítems · seed-v3</span>
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
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar por nombre, funcionalidad, nicho…"
              className="w-full bg-transparent text-sm outline-none placeholder:text-[#5c5c64]"
            />
            <span className="hidden rounded-full px-3 py-1 font-mono text-[11px] sm:block" style={{ background: '#D8FF3E', color: '#0E0E11' }}>
              Ctrl K
            </span>
          </div>
        </div>
      </header>

      {/* Destacados — no olvidar */}
      <div className="mx-auto max-w-6xl px-6 pt-6">
        <div className="mb-3 flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.2em]" style={{ color: '#8B8B93' }}>
          <span>Destacados — no olvidar</span>
          <span>{destacados.length} fijos</span>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {destacados.map((d) => (
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
                <h3 className="mt-3 text-[22px] leading-tight" style={{ fontFamily: 'Georgia, serif' }}>{d.nombre_simple || d.nombre}</h3>
                <p className="font-mono text-[11px] uppercase tracking-widest" style={{ color: '#8B8B93' }}>{d.nombre}</p>
                <p className="mt-2 text-sm" style={{ color: '#C9C9CF' }}>{d.funcionalidad_corta}</p>
              </div>
              <button onClick={() => setSelectedId(d.id)} className="mt-4 flex items-center gap-1 text-sm font-medium" style={{ color: '#D8FF3E' }}>
                Abrir ficha <ArrowUpRight size={16} />
              </button>
            </article>
          ))}
        </div>
      </div>

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
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="font-mono text-[11px] uppercase tracking-[0.2em]" style={{ color: '#8B8B93' }}>Costo:</span>
          {COSTOS.map((c) => (
            <button
              key={c}
              onClick={() => setCosto(c)}
              className="rounded-full border px-3 py-1.5 text-[13px]"
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
          <span>Resultado — {filtered.length}/{ITEMS.length}</span>
          <span>Orden: Recientes</span>
        </div>
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
                  <span className="rounded-full px-3 py-1 font-mono text-[11px] uppercase tracking-widest" style={{ background: '#0E0E11', color: '#D8FF3E' }}>
                    {c.tipo}
                  </span>
                </div>
                <h3 className="mt-4 text-[22px] leading-tight" style={{ fontFamily: 'Georgia, serif' }}>{c.nombre_simple || c.nombre}</h3>
                <p className="font-mono text-[11px] uppercase tracking-widest" style={{ color: '#8a8a90' }}>{c.nombre}</p>
                <p className="mt-2 text-sm" style={{ color: '#55555c' }}>{c.funcionalidad_corta}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {(c.nichos || []).slice(0, 2).map((n) => (
                    <span key={n} className="rounded-full border px-2.5 py-1 text-xs" style={{ borderColor: 'rgba(0,0,0,0.15)', color: '#55555c' }}>
                      {n}
                    </span>
                  ))}
                </div>
                <p className="mt-3 font-mono text-[11px] uppercase tracking-widest" style={{ color: '#8a8a90' }}>
                  {c.costo} · {(c.plataforma || []).join('/')} · {c.nivel}
                </p>
              </div>
              <div className="mt-6 flex items-center justify-between border-t pt-4" style={{ borderColor: 'rgba(0,0,0,0.1)' }}>
                <span className="font-mono text-[11px] uppercase tracking-widest" style={{ color: '#8a8a90' }}>{c.instalacion?.metodo} · {c.acceso?.requiere_key ? c.acceso?.tipo_key : 'sin-key'}</span>
                <button onClick={() => setSelectedId(c.id)} className="flex items-center gap-1 text-sm font-medium">
                  Abrir ficha <ArrowUpRight size={16} />
                </button>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-3 rounded-2xl border px-5 py-4 sm:flex-row" style={{ borderColor: 'rgba(255,255,255,0.08)', background: '#131316' }}>
          <p className="font-mono text-[11px] uppercase tracking-[0.2em]" style={{ color: '#8B8B93' }}>Seed v3 · {filtered.length} visibles</p>
          <div className="flex gap-2">
            <span className="rounded-full border px-4 py-2 text-sm" style={{ borderColor: 'rgba(255,255,255,0.12)', color: '#5c5c64' }}>← Anterior</span>
            <span className="rounded-full px-4 py-2 text-sm font-medium" style={{ background: '#D8FF3E', color: '#0E0E11' }}>Siguiente →</span>
          </div>
        </div>
      </main>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center" style={{ background: 'rgba(0,0,0,0.6)' }} onClick={() => setSelectedId(null)}>
          <div className="w-full max-w-lg rounded-[18px] p-6" style={{ background: '#F2EFE6', color: '#0E0E11' }} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs" style={{ color: '#8a8a90' }}>{selected.id} · {selected.categoria} / {selected.subcategoria}</span>
              <span className="rounded-full px-3 py-1 font-mono text-[11px] uppercase tracking-widest" style={{ background: '#0E0E11', color: '#D8FF3E' }}>
                {selected.tipo} · {selected.costo}
              </span>
            </div>
            <h3 className="mt-3 text-[28px] leading-tight" style={{ fontFamily: 'Georgia, serif' }}>{selected.nombre_simple || selected.nombre}</h3>
            <p className="font-mono text-[11px] uppercase tracking-widest" style={{ color: '#8a8a90' }}>{selected.nombre}</p>
            <p className="mt-1 text-sm font-medium">{selected.funcionalidad_corta}</p>
            <p className="mt-2 text-sm" style={{ color: '#55555c' }}>{selected.caso_uso}</p>
            <div className="mt-4 grid grid-cols-2 gap-3 text-[13px]">
              <div><p className="font-mono text-[11px] uppercase tracking-widest" style={{ color: '#8a8a90' }}>Instalación</p><p>{selected.instalacion?.metodo} · {selected.instalacion?.formato}</p></div>
              <div><p className="font-mono text-[11px] uppercase tracking-widest" style={{ color: '#8a8a90' }}>Acceso</p><p>{selected.acceso?.requiere_key ? selected.acceso?.tipo_key : 'sin-key'}{selected.acceso?.costo_ref ? ` · ${selected.acceso.costo_ref}` : ''}</p></div>
              <div><p className="font-mono text-[11px] uppercase tracking-widest" style={{ color: '#8a8a90' }}>Stack</p><p>{selected.stack?.rendimiento}{selected.stack?.lenguaje ? ` · ${selected.stack.lenguaje}` : ''}</p></div>
              <div><p className="font-mono text-[11px] uppercase tracking-widest" style={{ color: '#8a8a90' }}>Plataforma / Nivel</p><p>{(selected.plataforma || []).join('/')} · {selected.nivel}</p></div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {[...(selected.integraciones || []), ...(selected.tags || [])].map((t) => (
                <span key={t} className="rounded-full border px-2.5 py-1 text-xs" style={{ borderColor: 'rgba(0,0,0,0.15)', color: '#55555c' }}>{t}</span>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {(selected.nichos || []).map((n) => (
                <span key={n} className="rounded-full border px-2.5 py-1 text-xs" style={{ borderColor: 'rgba(0,0,0,0.15)', color: '#55555c' }}>{n}</span>
              ))}
            </div>
            {selected.curso_repo?.usar_en_curso && (
              <p className="mt-4 rounded-[12px] px-3 py-2 text-[13px] font-medium" style={{ background: '#0E0E11', color: '#D8FF3E' }}>
                Uso en curso: {selected.curso_repo.modulo} · {selected.curso_repo.leccion} · {selected.curso_repo.rol} — {selected.curso_repo.resultado_esperado}
              </p>
            )}
            <p className="mt-4 font-mono text-[11px] uppercase tracking-widest" style={{ color: '#8a8a90' }}>
              {selected.popularidad?.estrellas || selected.popularidad?.nota} · {selected.estado} · prioridad {selected.prioridad_qaway}
            </p>
            <button onClick={() => setSelectedId(null)} className="mt-5 w-full rounded-full py-3 text-sm font-medium" style={{ background: '#0E0E11', color: '#D8FF3E' }}>
              Cerrar ficha
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
