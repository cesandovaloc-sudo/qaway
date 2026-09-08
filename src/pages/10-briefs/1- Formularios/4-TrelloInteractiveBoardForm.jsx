import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  Kanban, CheckSquare, Layers, Clock, DollarSign, Send,
  Sparkles, CheckCircle2, RotateCcw, Plus, Tag, ChevronRight
} from 'lucide-react'

const BOARD_COLUMNS = [
  {
    id: 'col_team',
    title: '1. Equipo & Modelo de Negocio',
    badge: 'Fase 01',
    color: 'border-blue-500/30 bg-blue-500/5',
    tagColor: 'bg-blue-100 text-blue-700',
    cards: [
      { id: 'c1_1', title: 'Empresa B2B (Venta a empresas o profesionales)', desc: 'Ciclo de venta consultivo con propuestas y reuniones.', points: 15 },
      { id: 'c1_2', title: 'Comercio / E-commerce B2C', desc: 'Venta directa de productos o servicios al consumidor final.', points: 15 },
      { id: 'c1_3', title: 'Equipo comercial activo (> 2 personas)', desc: 'Requiere distribución de leads y control de ejecutivos.', points: 10 },
      { id: 'c1_4', title: 'Equipo unipersonal / Fundador directo', desc: 'Enfoque en máxima automatización para ahorrar horas de trabajo.', points: 10 },
    ],
  },
  {
    id: 'col_process',
    title: '2. Procesos que Necesitas Automatizar',
    badge: 'Fase 02',
    color: 'border-amber-500/30 bg-amber-500/5',
    tagColor: 'bg-amber-100 text-amber-700',
    cards: [
      { id: 'c2_1', title: 'Captación y calificación por WhatsApp', desc: 'Respuesta automática inteligente y derivación a asesor.', points: 20 },
      { id: 'c2_2', title: 'Agendamiento automático de citas / demos', desc: 'Sincronización con Google Calendar / Zoom sin fricción.', points: 15 },
      { id: 'c2_3', title: 'Envío de cotizaciones y contratos', desc: 'Generación dinámica de propuestas en PDF al instante.', points: 15 },
      { id: 'c2_4', title: 'Recordatorios y nutrición por Email/SMS', desc: 'Secuencias automatizadas para reactivar prospectos fríos.', points: 10 },
    ],
  },
  {
    id: 'col_tech',
    title: '3. Activos Digitales a Construir',
    badge: 'Fase 03',
    color: 'border-purple-500/30 bg-purple-500/5',
    tagColor: 'bg-purple-100 text-purple-700',
    cards: [
      { id: 'c3_1', title: 'Sitio Web Corporativo de Alta Autoridad', desc: 'Diseño ultra premium con SEO y velocidad de carga.', points: 25 },
      { id: 'c3_2', title: 'Landing Page de Alta Conversión para Pauta', desc: 'Estructura orientada a captura directa de leads.', points: 20 },
      { id: 'c3_3', title: 'CRM Comercial Personalizado', desc: 'Pipelines visuales, métricas y base de datos relacional.', points: 20 },
      { id: 'c3_4', title: 'Agente de IA para Atención al Cliente', desc: 'Bot entrenado con el conocimiento exacto de tu negocio.', points: 25 },
    ],
  },
  {
    id: 'col_priority',
    title: '4. Nivel de Prioridad & Entrega',
    badge: 'Fase 04',
    color: 'border-emerald-500/30 bg-emerald-500/5',
    tagColor: 'bg-emerald-100 text-emerald-700',
    cards: [
      { id: 'c4_1', title: 'Lanzamiento Flash (2 a 3 semanas)', desc: 'Prioridad máxima de despliegue con MVP funcional.', points: 15 },
      { id: 'c4_2', title: 'Entrega Integral por Hitos (4 a 6 semanas)', desc: 'Desarrollo en fases estructuradas con validación semanal.', points: 10 },
      { id: 'c4_3', title: 'Acompañamiento Continuo Mensual', desc: 'Soporte, iteración y optimización continua de conversión.', points: 15 },
    ],
  },
]

export default function TrelloInteractiveBoardForm() {
  const [selectedCards, setSelectedCards] = useState(['c1_1', 'c2_1', 'c3_1', 'c4_2'])
  const [companyName, setCompanyName] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const toggleCard = (cardId) => {
    setSelectedCards((prev) =>
      prev.includes(cardId) ? prev.filter((id) => id !== cardId) : [...prev, cardId]
    )
  }

  // Calculate scope points
  const totalPoints = BOARD_COLUMNS.flatMap((c) => c.cards)
    .filter((card) => selectedCards.includes(card.id))
    .reduce((acc, card) => acc + card.points, 0)

  const selectedCount = selectedCards.length

  const handleReset = () => {
    setSelectedCards([])
    setSubmitted(false)
  }

  return (
    <div className="min-h-screen bg-[#f1f5f9] text-slate-900 font-sans selection:bg-[#ff4b0b] selection:text-white flex flex-col justify-between">
      {/* Header Bar */}
      <header className="w-full border-b border-slate-200 bg-white px-6 py-4 flex items-center justify-between sticky top-0 z-30 shadow-xs">
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2 group">
            <span className="text-lg font-black tracking-tight text-slate-950">QAWAY</span>
            <span className="text-xs font-bold uppercase tracking-widest text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
              BOARD ONBOARDING
            </span>
          </Link>
          <span className="hidden sm:inline-block text-slate-300">|</span>
          <span className="hidden sm:inline-block text-xs font-semibold text-slate-500">
            Formulario 04: Tablero Interactivo por Columnas (Estilo Trello)
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/formularios"
            className="text-xs font-bold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
          >
            ← Ver los 6 Modelos
          </Link>
        </div>
      </header>

      {/* Board Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Board Title Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold text-blue-600">
              <Kanban className="w-4 h-4" />
              <span>TABLERO DE ALCANCE Y ESPECIFICACIÓN DE PROYECTO</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-950">
              Selecciona las tarjetas que componen el ecosistema de tu negocio
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Haz clic en cada tarjeta para agregar o remover requerimientos del alcance interactivo.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="px-4 py-2 rounded-2xl bg-slate-50 border border-slate-200 text-right">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Alcance Seleccionado
              </span>
              <span className="text-base font-black text-slate-900">
                {selectedCount} tarjetas • {totalPoints} pts
              </span>
            </div>
          </div>
        </div>

        {/* 4 Interactive Columns Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {BOARD_COLUMNS.map((col) => {
            const colSelected = col.cards.filter((c) => selectedCards.includes(c.id)).length

            return (
              <div
                key={col.id}
                className="bg-slate-200/60 rounded-3xl p-3 sm:p-4 flex flex-col justify-between border border-slate-300/70"
              >
                {/* Column Header */}
                <div>
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-300/80">
                    <div className="space-y-0.5">
                      <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md ${col.tagColor}`}>
                        {col.badge}
                      </span>
                      <h3 className="text-sm font-extrabold text-slate-900 pt-1">
                        {col.title}
                      </h3>
                    </div>
                    <span className="text-xs font-bold text-slate-500 bg-white px-2 py-1 rounded-lg border border-slate-200">
                      {colSelected}/{col.cards.length}
                    </span>
                  </div>

                  {/* Cards List */}
                  <div className="space-y-2.5">
                    {col.cards.map((card) => {
                      const isSelected = selectedCards.includes(card.id)

                      return (
                        <motion.div
                          key={card.id}
                          whileHover={{ y: -2 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => toggleCard(card.id)}
                          className={`p-3.5 rounded-2xl border transition-all cursor-pointer select-none ${
                            isSelected
                              ? 'bg-white border-blue-500 shadow-md ring-2 ring-blue-500/20'
                              : 'bg-white/90 border-slate-200 hover:border-slate-300 hover:bg-white shadow-2xs'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                              {card.title}
                            </h4>
                            <div
                              className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 mt-0.5 ${
                                isSelected
                                  ? 'bg-blue-600 border-blue-600 text-white'
                                  : 'border-slate-300 bg-slate-50'
                              }`}
                            >
                              {isSelected && <CheckSquare className="w-3 h-3" />}
                            </div>
                          </div>
                          <p className="mt-1.5 text-[11px] text-slate-500 leading-relaxed">
                            {card.desc}
                          </p>
                          <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] font-semibold text-slate-400">
                            <span>+{card.points} puntos de alcance</span>
                            <span className={isSelected ? 'text-blue-600 font-bold' : ''}>
                              {isSelected ? 'Incluido' : '+ Agregar'}
                            </span>
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Bottom Submission Summary Bar */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-md">
          {!submitted ? (
            <form
              onSubmit={(e) => {
                e.preventDefault()
                if (contactEmail) setSubmitted(true)
              }}
              className="flex flex-col lg:flex-row items-center justify-between gap-6"
            >
              <div className="space-y-1 text-center lg:text-left">
                <h3 className="text-lg font-black text-slate-950">
                  ¿Listo para convertir este tablero en una propuesta técnica?
                </h3>
                <p className="text-xs text-slate-500">
                  Has seleccionado <strong>{selectedCount} requerimientos</strong>. Déjanos tus datos para coordinar el kickoff del proyecto.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
                <input
                  type="text"
                  placeholder="Nombre de tu empresa"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full sm:w-56 px-4 py-3 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-blue-500"
                />
                <input
                  type="email"
                  required
                  placeholder="contacto@empresa.com"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="w-full sm:w-64 px-4 py-3 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-blue-500"
                />
                <button
                  type="submit"
                  disabled={selectedCount === 0}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-blue-500/20 shrink-0"
                >
                  <Send className="w-4 h-4" />
                  <span>Generar Propuesta con Tablero</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="text-center py-4 space-y-3">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
              <h3 className="text-xl font-black text-slate-950">
                ¡Tablero de requerimientos guardado con éxito!
              </h3>
              <p className="text-xs text-slate-600 max-w-md mx-auto">
                Nos pondremos en contacto con {contactEmail} con la cotización desglosada según las {selectedCount} tarjetas seleccionadas.
              </p>
              <button
                type="button"
                onClick={handleReset}
                className="mt-2 text-xs font-bold text-blue-600 hover:underline inline-flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Configurar otro tablero</span>
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-200 bg-white px-6 py-3 text-center text-xs text-slate-400">
        Qaway Lab Studio OS • Tableros Ágiles de Especificación y Alcance
      </footer>
    </div>
  )
}
