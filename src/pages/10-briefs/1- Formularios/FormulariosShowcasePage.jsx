import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  Sparkles, Layers, ArrowRight, Eye, CheckCircle2,
  FileText, MessageSquare, Monitor, Kanban, LayoutGrid, Award
} from 'lucide-react'

export const FORM_MODELS = [
  {
    id: 'diagnostico-split',
    number: '01',
    title: 'Diagnóstico Split Studio',
    subtitle: 'Split Screen Hero + Micro-Quiz Editorial & Diagnostic (10 Pasos)',
    category: 'Lead Magnet & Diagnóstico',
    badge: 'Imagen 1 Referencia',
    badgeColor: 'bg-orange-50 text-[#ff4b0b] border-orange-200',
    description: 'Hero split-screen con imagen editorial, propuesta contundente a la izquierda y micro-quiz interactivo a la derecha con tips dinámicos, stepper de 10 puntos y reporte de madurez comercial con radar.',
    route: '/formularios/diagnostico-split',
    icon: Award,
    highlights: ['10 Pasos Interactivos', 'Consejos Dinámicos', 'Cálculo de Madurez', 'Lead Capture Final'],
  },
  {
    id: 'asistente-conversacional',
    number: '02',
    title: 'Asistente Conversacional Marketing OS',
    subtitle: 'Conversational Step Card con Historial de Pills & Quick-Select',
    category: 'Onboarding & Asistente',
    badge: 'Hub Marketing OS',
    badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
    description: 'Tarjeta flotante ergonómica basada en nuestro creador de Buyer Personas de Marketing OS. Incluye historial de preguntas previas editables, chips de 1-clic y atajo con tecla Enter.',
    route: '/formularios/asistente-conversacional',
    icon: MessageSquare,
    highlights: ['Historial de Respuestas', 'Navegación por Teclado', 'Quick-Select Chips', 'Exportación Rápida'],
  },
  {
    id: 'typeform-fluid',
    number: '03',
    title: 'Typeform / Linear Fluid Experience',
    subtitle: 'Full-Screen Focus Mode Inmersivo con Teclas A, B, C, D',
    category: 'Experiencia Inmersiva',
    badge: 'Inspiración Linear/Typeform',
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    description: 'Una sola pregunta a la vez en pantalla completa, navegación instantánea por teclado (A, B, C, D o flechas ↑↓), barra de progreso minimalista milimétrica y cero fricción visual.',
    route: '/formularios/typeform-fluid',
    icon: Monitor,
    highlights: ['Teclado Rápido [A-D]', 'Transiciones Verticales', 'Cero Distracciones', 'Dark Mode Minimalista'],
  },
  {
    id: 'trello-board',
    number: '04',
    title: 'Tablero Interactivo por Columnas',
    subtitle: 'Kanban Scope Selector & Visual Tag Checklist',
    category: 'Especificación Ágil',
    badge: 'Inspiración Trello',
    badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
    description: 'Flujo visual en 4 columnas temáticas (Equipo, Procesos, Activos y Prioridades). Permite al cliente armar su solución seleccionando tarjetas con tags de colores y puntos de alcance en vivo.',
    route: '/formularios/trello-board',
    icon: Kanban,
    highlights: ['4 Columnas Visuales', 'Puntos de Alcance en Vivo', 'Checklist Dinámico', 'Cards Interactivas'],
  },
  {
    id: 'notion-workspace',
    number: '05',
    title: 'Notion Living Document Workspace',
    subtitle: 'Documento Vivo Colaborativo con Bloques Desplegables & Autoguardado',
    category: 'Brief Colaborativo',
    badge: 'Inspiración Notion / Coda',
    badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
    description: 'Experiencia en formato de documento interactivo con portada, ícono, bloques desplegables (toggles), callouts con tips, sliders de presupuesto y simulación de autoguardado en la nube.',
    route: '/formularios/notion-workspace',
    icon: FileText,
    highlights: ['Bloques Colapsables', 'Sliders de Inversión', 'Autoguardado en Vivo', 'Exportación Markdown'],
  },
  {
    id: 'airbnb-card-deck',
    number: '06',
    title: 'Deck Visual & Floating Stepper',
    subtitle: 'Spatial Selection Grid + Bottom Navigation Bar',
    category: 'Selector Visual de Soluciones',
    badge: 'Inspiración Airbnb / Stripe',
    badgeColor: 'bg-rose-50 text-rose-700 border-rose-200',
    description: 'Cuadrícula de alta densidad con íconos visuales y micro-escalado ergonómico. Acompañado de una barra inferior flotante con stepper de 4 etapas y pantalla de confirmación.',
    route: '/formularios/airbnb-card-deck',
    icon: LayoutGrid,
    highlights: ['Grid de Iconografía Rica', 'Hover Micro-Scale 1.02', 'Floating Action Footer', 'Resumen Instantáneo'],
  },
]

export default function FormulariosShowcasePage() {
  const [activeCategory, setActiveCategory] = useState('all')

  const filteredModels = activeCategory === 'all'
    ? FORM_MODELS
    : FORM_MODELS.filter((m) => m.category.toLowerCase().includes(activeCategory.toLowerCase()))

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans selection:bg-[#ff4b0b] selection:text-white flex flex-col justify-between">
      {/* Header */}
      <header className="w-full border-b border-slate-200 bg-white/90 backdrop-blur-md px-6 py-4 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2 group">
            <span className="text-xl font-black tracking-tight text-slate-950">QAWAY</span>
            <span className="text-xs font-bold uppercase tracking-widest text-[#ff4b0b] bg-orange-50 px-2 py-0.5 rounded-md border border-orange-200">
              FORM LAB
            </span>
          </Link>
          <span className="hidden sm:inline-block text-slate-300">|</span>
          <span className="hidden sm:inline-block text-xs font-semibold text-slate-500">
            Suite de Formularios & Tests Interactivos Modernos
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/brief"
            className="text-xs font-bold text-slate-600 hover:text-slate-900 px-3.5 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors"
          >
            Ir a Brief Clásico →
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-12 space-y-10">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-orange-50 text-[#ff4b0b] text-xs font-bold border border-orange-200/80 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Colección Certificada • 6 Arquetipos de Alta Interacción</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-slate-950 tracking-tight leading-tight">
            Formularios & Diagnósticos <br className="hidden sm:inline" />
            <span className="text-[#ff4b0b]">Interactivos de Alta Conversión</span>
          </h1>

          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            Cada modelo ha sido diseñado desde cero con una arquitectura de UX única, física de movimiento suave, atajos de teclado y estándares de ergonomía sin patrones genéricos.
          </p>
        </div>

        {/* 6 Models Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FORM_MODELS.map((model) => {
            const Icon = model.icon

            return (
              <motion.div
                key={model.id}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-xs hover:shadow-xl hover:border-slate-300 transition-all flex flex-col justify-between group"
              >
                <div className="space-y-4">
                  {/* Top Bar inside Card */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-extrabold text-slate-400">
                      MOD {model.number}
                    </span>
                    <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${model.badgeColor}`}>
                      {model.badge}
                    </span>
                  </div>

                  {/* Title & Icon */}
                  <div className="space-y-2">
                    <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 group-hover:bg-[#ff4b0b]/10 group-hover:border-[#ff4b0b]/30 group-hover:text-[#ff4b0b] text-slate-800 transition-colors flex items-center justify-center">
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-extrabold text-slate-950 group-hover:text-[#ff4b0b] transition-colors leading-snug">
                      {model.title}
                    </h3>
                    <p className="text-xs font-semibold text-slate-400">
                      {model.subtitle}
                    </p>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {model.description}
                  </p>

                  {/* Highlights */}
                  <div className="pt-2 flex flex-wrap gap-1.5">
                    {model.highlights.map((h, i) => (
                      <span
                        key={i}
                        className="text-[10px] font-semibold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md border border-slate-200/60"
                      >
                        ✓ {h}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Card Action Button */}
                <div className="pt-6 mt-6 border-t border-slate-100">
                  <Link
                    to={model.route}
                    className="w-full py-3 px-4 rounded-xl bg-slate-900 group-hover:bg-[#ff4b0b] text-white text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm shadow-slate-950/10"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Probar este Formulario</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </motion.div>
            )
          })}
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-200 bg-white px-6 py-4 text-center text-xs text-slate-400">
        Qaway Lab • Suite de Formularios y Briefs de Próxima Generación
      </footer>
    </div>
  )
}
