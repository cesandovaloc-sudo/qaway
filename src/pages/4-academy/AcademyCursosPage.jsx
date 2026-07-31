import React, { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Search, ArrowLeft, ArrowRight, BookOpen, Clock, Tag, Sparkles, Filter } from 'lucide-react'
import { courseCatalog } from '../../data/academyCourses'
import './academy.css'

const categories = ['Todos', 'Inteligencia artificial', 'Productividad', 'Marketing', 'Diseño', 'Automatización']
const formats = ['Todos', 'Curso práctico', 'Taller guiado', 'Programa', 'Ruta', 'Serie gratuita']

export default function AcademyCursosPage() {
  const [activeCategory, setActiveCategory] = useState('Todos')
  const [activeFormat, setActiveFormat] = useState('Todos')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredCourses = useMemo(() => {
    return courseCatalog.filter((course) => {
      const matchCategory = activeCategory === 'Todos' || course.category === activeCategory
      const matchFormat = activeFormat === 'Todos' || course.format === activeFormat
      const matchSearch =
        !searchQuery.trim() ||
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.text.toLowerCase().includes(searchQuery.toLowerCase())
      return matchCategory && matchFormat && matchSearch
    })
  }, [activeCategory, activeFormat, searchQuery])

  return (
    <div className="academy-page min-h-screen bg-[#f8f7f4] text-[#20201f] pt-24 pb-20">
      {/* Header / Hero del Catálogo */}
      <section className="max-w-[92rem] mx-auto px-6 sm:px-10 py-10">
        <div className="mb-6">
          <Link
            to="/academy"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[#ff4b0b] hover:text-[#d93a00] transition-colors"
          >
            <ArrowLeft size={15} />
            Volver a Qaway Academy
          </Link>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 pb-8 border-b border-[#20201f]/10">
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.22em] text-[#ff4b0b] block mb-3">
              Directorio Oficial de Cursos
            </span>
            <h1 className="text-[clamp(2.5rem,4.5vw,4.5rem)] font-bold leading-[0.92] tracking-[-0.05em] text-[#20201f]">
              Catálogo completo de <span className="text-[#ff4b0b]">cursos y talleres.</span>
            </h1>
            <p className="mt-4 max-w-2xl text-[clamp(1rem,1.1vw,1.15rem)] leading-[1.55] text-[#55534f]">
              Encuentra programas prácticos diseñados para desarrollar capacidades reales, estructurar flujos con IA y aplicar herramientas en tu trabajo.
            </p>
          </div>

          <div className="w-full lg:w-96">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#55534f]" size={18} />
              <input
                type="text"
                placeholder="Buscar por nombre o tema..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-white border border-[#20201f]/15 text-sm text-[#20201f] placeholder:text-[#888682] focus:outline-none focus:border-[#ff4b0b] transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Filtros por Categoría y Formato */}
        <div className="mt-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            <span className="text-xs font-bold uppercase tracking-wider text-[#888682] mr-2 flex items-center gap-1">
              <Filter size={14} /> Tema:
            </span>
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 text-xs font-bold transition-all whitespace-nowrap ${
                  activeCategory === cat
                    ? 'bg-[#ff4b0b] text-white border border-[#ff4b0b]'
                    : 'bg-white text-[#55534f] border border-[#20201f]/15 hover:border-[#ff4b0b] hover:text-[#ff4b0b]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-[#888682] whitespace-nowrap">Formato:</span>
            <select
              value={activeFormat}
              onChange={(e) => setActiveFormat(e.target.value)}
              className="bg-white border border-[#20201f]/15 px-3 py-2 text-xs font-bold text-[#20201f] focus:outline-none focus:border-[#ff4b0b]"
            >
              {formats.map((fmt) => (
                <option key={fmt} value={fmt}>{fmt}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Indicador de resultados */}
        <div className="mt-6 text-xs font-semibold text-[#888682]">
          Mostrando {filteredCourses.length} {filteredCourses.length === 1 ? 'curso' : 'cursos'} disponibles
        </div>
      </section>

      {/* Grid de Cursos */}
      <section className="max-w-[92rem] mx-auto px-6 sm:px-10 py-6">
        {filteredCourses.length === 0 ? (
          <div className="bg-white border border-[#20201f]/10 p-16 text-center max-w-xl mx-auto my-12">
            <Sparkles className="mx-auto text-[#ff4b0b] mb-4" size={36} />
            <h3 className="text-xl font-bold text-[#20201f] mb-2">No encontramos cursos con esos filtros</h3>
            <p className="text-sm text-[#55534f] mb-6">Prueba seleccionando otra categoría o borrando el término de búsqueda.</p>
            <button
              type="button"
              onClick={() => { setActiveCategory('Todos'); setActiveFormat('Todos'); setSearchQuery(''); }}
              className="px-5 py-2.5 bg-[#ff4b0b] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#d93a00] transition-colors"
            >
              Restablecer filtros
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCourses.map((course, idx) => (
              <motion.article
                key={`${course.category}-${course.title}-${idx}`}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.06 }}
                className="bg-white border border-[#20201f]/12 flex flex-col justify-between hover:border-[#ff4b0b]/40 hover:shadow-lg transition-all group"
              >
                <div>
                  <div className="relative aspect-[16/9] overflow-hidden bg-[#191918]">
                    <img
                      src={course.image}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    {course.featured && (
                      <span className="absolute top-3 left-3 bg-[#ff4b0b] text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1">
                        {course.featured}
                      </span>
                    )}
                    <span className="absolute bottom-3 right-3 bg-[#20201f]/80 backdrop-blur-md text-white text-[11px] font-semibold px-2.5 py-0.5">
                      {course.category}
                    </span>
                  </div>

                  <div className="p-6">
                    <div className="flex items-center gap-4 text-xs font-semibold text-[#888682] mb-3">
                      <span className="flex items-center gap-1.5"><BookOpen size={14} className="text-[#ff4b0b]" /> {course.format}</span>
                      <span className="flex items-center gap-1.5"><Clock size={14} className="text-[#ff4b0b]" /> {course.duration}</span>
                    </div>

                    <h3 className="text-xl font-bold text-[#20201f] leading-tight group-hover:text-[#ff4b0b] transition-colors mb-3">
                      {course.title}
                    </h3>

                    <p className="text-sm text-[#55534f] leading-relaxed line-clamp-3">
                      {course.text}
                    </p>
                  </div>
                </div>

                <div className="px-6 pb-6 pt-2 border-t border-[#20201f]/08 flex items-center justify-between mt-4">
                  <span className="text-xs font-bold text-[#ff4b0b] uppercase tracking-wider">
                    {course.external ? 'Serie Gratuita' : 'Inscripción abierta'}
                  </span>
                  {course.external ? (
                    <a
                      href={course.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-xs font-bold text-[#20201f] hover:text-[#ff4b0b] transition-colors"
                    >
                      Ver en YouTube
                      <ArrowRight size={15} />
                    </a>
                  ) : (
                    <Link
                      to="/academy#formulario"
                      className="inline-flex items-center gap-2 text-xs font-bold text-[#20201f] hover:text-[#ff4b0b] transition-colors"
                    >
                      Más información
                      <ArrowRight size={15} />
                    </Link>
                  )}
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </section>

      {/* CTA Final para Asesoría Corporativa */}
      <section className="max-w-[92rem] mx-auto px-6 sm:px-10 mt-16">
        <div className="bg-[#20201f] text-white p-10 sm:p-14 flex flex-col lg:flex-row items-center justify-between gap-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.22em] text-[#ff4b0b] block mb-2">
              ¿Buscas capacitación para tu equipo?
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Diseñamos talleres y programas corporativos a medida.
            </h2>
            <p className="mt-2 text-sm text-[#a09e99] max-w-xl">
              Adaptamos nuestro método práctico a las herramientas, flujos e industria de tu empresa.
            </p>
          </div>
          <Link
            to="/academy#formulario"
            className="px-6 py-3.5 bg-[#ff4b0b] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#d93a00] transition-colors whitespace-nowrap flex items-center gap-2"
          >
            Solicitar asesoría corporativa
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </div>
  )
}
