import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Menu, X, Printer, ArrowLeft, Calendar, Sparkles, Clock, Play,
  Check, RefreshCw, Download, ExternalLink, BookOpen, Lock, ShieldCheck, Mail, User
} from 'lucide-react'
import { WHATSAPP_LINK } from '@/data/navigation'
import { supabase } from '@/config/supabase'
import '@/styles/recursos-ebooks.css'

// Initial events for the Calendar Simulator
const INITIAL_EVENTS = [
  { id: '1', day: 'Lun', time: '09:00 - 10:00', title: 'Sincronización Semanal', category: 'ops', color: 'border-l-4 border-cyan-500 bg-cyan-950/20 text-cyan-200' },
  { id: '2', day: 'Lun', time: '14:00 - 15:30', title: 'Revisión Métricas Ads', category: 'marketing', color: 'border-l-4 border-indigo-500 bg-indigo-950/20 text-indigo-200' },
  { id: '3', day: 'Mar', time: '11:00 - 12:30', title: 'Diseño Visual Lab', category: 'creative', color: 'border-l-4 border-amber-500 bg-amber-950/20 text-amber-200' },
  { id: '4', day: 'Mié', time: '09:30 - 11:00', title: 'QA Técnico Lanzamiento', category: 'ops', color: 'border-l-4 border-cyan-500 bg-cyan-950/20 text-cyan-200' },
  { id: '5', day: 'Jue', time: '14:00 - 15:00', title: 'Consultoría PyME', category: 'strategy', color: 'border-l-4 border-purple-500 bg-purple-950/20 text-purple-200' },
  { id: '6', day: 'Vie', time: '10:00 - 11:00', title: 'Reporte Eficiencia IA', category: 'ops', color: 'border-l-4 border-cyan-500 bg-cyan-950/20 text-cyan-200' },
]

export default function EbookDigitalPage() {
  const navigate = useNavigate()
  const [scrollProgress, setScrollProgress] = useState(0)
  const [activeChapter, setActiveChapter] = useState('cover')
  // Inicializar abierto en desktop (ancho > 992px) y cerrado en móvil
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 992)
  const [isUnlocked, setIsUnlocked] = useState(false)
  const [navbarVisible, setNavbarVisible] = useState(true)
  const lastScrollY = useRef(0)
  const isLockScrolling = useRef(false)
  const lockTimeoutRef = useRef(null)

  // Ajustar menú según cambio de tamaño de pantalla
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 992) {
        setSidebarOpen(true)
      } else {
        setSidebarOpen(false)
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])
  const [showLockCard, setShowLockCard] = useState(false)
  const [lockName, setLockName] = useState('')
  const [lockEmail, setLockEmail] = useState('')
  const [isSubmittingLead, setIsSubmittingLead] = useState(false)
  const [leadError, setLeadError] = useState(null)

  // Calendar Simulator States
  const [events, setEvents] = useState(INITIAL_EVENTS)
  const [activePrompt, setActivePrompt] = useState(null)
  const [simStep, setSimStep] = useState(0) // 0: idle, 1: analyzing, 2: processing, 3: completed
  const [simText, setSimText] = useState('')

  const prompts = [
    {
      id: 'focus',
      label: '⚡ Bloquear Enfoque',
      text: 'Crear bloque de enfoque mañana temprano para diseño estratégico.',
      execText: 'Analizando agenda... Martes ocupado. Buscando Miércoles... Bloque de enfoque disponible de 08:00 a 09:30. Reservando y silenciando notificaciones con IA.',
      event: { id: 'evt-focus', day: 'Mié', time: '08:00 - 09:30', title: '⚡ Enfoque Estratégico [IA]', category: 'creative', color: 'border-l-4 border-emerald-500 bg-emerald-950/30 text-emerald-200 font-bold' }
    },
    {
      id: 'meeting',
      label: '👥 Reunión Feedback',
      text: 'Agendar feedback con Camila para el jueves a las 3:00 PM.',
      execText: 'Consultando disponibilidad de Camila... Espacio libre jueves 15:00. Creando evento, generando enlace de Meet y asignando plantilla de minuta con IA.',
      event: { id: 'evt-meeting', day: 'Jue', time: '15:00 - 16:00', title: '👥 Feedback: Camila [IA]', category: 'strategy', color: 'border-l-4 border-purple-500 bg-purple-950/30 text-purple-200 font-bold' }
    },
    {
      id: 'cleanup',
      label: '🧹 Liberar Viernes',
      text: 'Liberar la tarde del viernes para análisis creativo.',
      execText: 'Revisando agenda del Viernes tarde... Moviendo pendientes no urgentes. Bloqueando tarde de 12:00 a 16:00 para análisis creativo sin interrupciones.',
      event: { id: 'evt-cleanup', day: 'Vie', time: '12:00 - 16:00', title: '🧹 Análisis Creativo [IA]', category: 'creative', color: 'border-l-4 border-rose-500 bg-rose-950/30 text-rose-200 font-bold' }
    }
  ]

  // Check initial unlock state from localStorage
  useEffect(() => {
    const unlocked = localStorage.getItem('recurso_desbloqueado_google-calendar-dominado')
    if (unlocked === 'true') {
      setIsUnlocked(true)
    }
  }, [])

  // Track scroll position, active chapter (Scroll Spy) and lock gate threshold
  useEffect(() => {
    const handleScroll = () => {
      const winScroll = window.scrollY
      const height = document.documentElement.scrollHeight - window.innerHeight
      const scrolled = height > 0 ? (winScroll / height) * 100 : 0
      setScrollProgress(scrolled)

      const unlocked = localStorage.getItem('recurso_desbloqueado_google-calendar-dominado') === 'true'
      const isCurrentlyLocked = (!unlocked && scrolled >= 24.5)

      // Mantener navbarVisible siempre en true para sincronizar con el Navbar global que ahora es fijo
      if (!isLockScrolling.current) {
        setNavbarVisible(true)
        lastScrollY.current = winScroll
      }

      // Activar el bloqueo por scroll si no está desbloqueado
      if (!unlocked) {
        // Usamos >= 24.5 para evitar parpadeos de la tarjeta cuando el limitScroll redondea
        if (scrolled >= 24.5) {
          setShowLockCard(true)
          const limitScroll = Math.round(height * 0.25)
          if (winScroll > limitScroll + 5) {
            // Marcar como scroll programático para no disparar el tracker del navbar
            isLockScrolling.current = true
            window.scrollTo(0, limitScroll) // Instantáneo (más firme que smooth para una barrera)
            
            // Limpiar timeout anterior si el usuario sigue haciendo scroll compulsivamente
            if (lockTimeoutRef.current) clearTimeout(lockTimeoutRef.current)
            
            // Resetear el flag y sincronizar lastScrollY tras un breve instante
            lockTimeoutRef.current = setTimeout(() => {
              isLockScrolling.current = false
              lastScrollY.current = limitScroll
            }, 50)
          }
        } else {
          setShowLockCard(false)
        }
      } else {
        setShowLockCard(false)
      }

      // Intersection tracking for chapters
      const sections = ['cover', 'indice', 'cap1', 'cap2', 'cap3', 'cap4', 'cap5', 'cap6', 'cap7', 'cap8', 'cta-final', 'about']
      const scrollPosition = window.scrollY + 120

      for (const section of sections) {
        const el = document.getElementById(section)
        if (el) {
          const top = el.offsetTop
          const bottom = top + el.offsetHeight
          if (scrollPosition >= top && scrollPosition < bottom) {
            setActiveChapter(section)
            break
          }
        }
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleNavClick = (sectionId, isLockedChapter) => {
    if (isLockedChapter && !isUnlocked) {
      // Si el capítulo está bloqueado, forzar scroll al límite y mostrar el modal
      setShowLockCard(true)
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight
      const limitScroll = Math.round(height * 0.25)
      window.scrollTo({ top: limitScroll, behavior: 'smooth' })
      return
    }

    const el = document.getElementById(sectionId)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      setActiveChapter(sectionId)
      // Solo cerrar sidebar en móvil
      if (window.innerWidth <= 992) setSidebarOpen(false)
    }
  }

  // Notificar por correo
  const sendEmailNotification = async (subject, messageDetails) => {
    const primaryKey = import.meta.env.VITE_WEB3FORMS_MARKETING_KEY || ''
    const backupKey = import.meta.env.VITE_WEB3FORMS_BACKUP_KEY || ''
    
    const keysToSend = []
    if (primaryKey.trim()) keysToSend.push(primaryKey.trim())
    if (backupKey.trim()) keysToSend.push(backupKey.trim())

    if (keysToSend.length === 0) {
      console.warn('[Web3Forms] No se encontraron llaves de acceso configuradas en el .env.')
      return
    }

    try {
      await Promise.all(
        keysToSend.map(key =>
          fetch('https://api.web3forms.com/submit', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            body: JSON.stringify({
              access_key: key,
              subject: subject,
              from_name: 'Qaway Lab Visor Ebook',
              message: messageDetails
            })
          })
        )
      )
    } catch (err) {
      console.error('Error al enviar notificaciones Web3Forms:', err)
    }
  }

  const handleLeadSubmit = async (e) => {
    e.preventDefault()
    if (!lockName.trim() || !lockEmail.trim()) return

    setIsSubmittingLead(true)
    setLeadError(null)

    try {
      // 1. Registrar descarga en Supabase
      const { error } = await supabase
        .from('resource_downloads')
        .insert([
          {
            resource_id: 'google-calendar-dominado',
            name: lockName.trim(),
            email: lockEmail.trim().toLowerCase()
          }
        ])

      if (error) throw error

      // 2. Enviar correos de notificación vía Web3Forms
      const emailSubject = `Nueva suscripción (Scroll Gate): Ebook Google Calendar`
      const emailBody = `Un usuario ha desbloqueado la guía desde el lector web.\n\n` +
        `Recurso: Google Calendar Dominado (Ebook Digital Interactivo)\n` +
        `Nombre: ${lockName}\n` +
        `Correo: ${lockEmail}\n` +
        `Fecha: ${new Date().toLocaleString()}\n`

      await sendEmailNotification(emailSubject, emailBody)

      // 3. Registrar desbloqueo en localStorage y React state
      localStorage.setItem('recurso_desbloqueado_google-calendar-dominado', 'true')
      setIsUnlocked(true)
      setShowLockCard(false)
    } catch (err) {
      console.error('Error en Scroll Gate:', err)
      setLeadError(err.message || 'Error al procesar la suscripción. Inténtalo de nuevo.')
    } finally {
      setIsSubmittingLead(false)
    }
  }

  const handleRunSimulation = (prompt) => {
    if (simStep > 0) return
    setActivePrompt(prompt.id)
    setSimStep(1)
    setSimText('Orquestador IA: Analizando disponibilidad de agenda...')

    setTimeout(() => {
      setSimStep(2)
      setSimText(prompt.execText)
    }, 1500)

    setTimeout(() => {
      setSimStep(3)
      setSimText('¡Éxito! Evento sincronizado en Google Calendar en tiempo real.')
      setEvents(prev => {
        const clean = prev.filter(e => e.id !== prompt.event.id)
        return [...clean, prompt.event]
      })
    }, 3500)
  }

  const handleResetCalendar = () => {
    setEvents(INITIAL_EVENTS)
    setActivePrompt(null)
    setSimStep(0)
    setSimText('')
  }

  return (
    <div
      className="visor-layout"
      style={{
        paddingTop: navbarVisible ? '80px' : '0px',
        transition: 'padding-top 0.3s cubic-bezier(0.16,1,0.3,1)',
      }}
    >
      {/* Barra de progreso de lectura — estilos inline */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '3px',
        background: 'transparent',
        zIndex: 9999,
        pointerEvents: 'none',
      }}>
        <div style={{
          height: '100%',
          width: `${scrollProgress}%`,
          background: 'linear-gradient(90deg, #ffd200, #ff6600)',
          transition: 'width 0.1s ease-out',
          minWidth: scrollProgress > 0 ? '4px' : '0px',
        }} />
      </div>

      {/* LEFT NAVIGATION SIDEBAR */}
      <nav
        className={`visor-sidebar ${sidebarOpen ? 'open' : 'closed'}`}
        style={{ top: navbarVisible ? '80px' : '0px', transition: 'top 0.3s cubic-bezier(0.16,1,0.3,1)' }}
      >
        {/* Solo botón de colapso, oculto en desktop (sin ocupar espacio) */}
        <div className="flex justify-end mb-4 lg:hidden">
          <button
            onClick={() => setSidebarOpen(false)}
            className="visor-sidebar-close-btn"
            aria-label="Cerrar Menú"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        
        <div className="visor-section-title">Inicio</div>
        <div 
          onClick={() => handleNavClick('cover', false)} 
          className={`visor-nav-link ${activeChapter === 'cover' ? 'active' : ''}`}
        >
          <span className="visor-nav-num">→</span> Portada
        </div>
        <div 
          onClick={() => handleNavClick('indice', false)} 
          className={`visor-nav-link ${activeChapter === 'indice' ? 'active' : ''}`}
        >
          <span className="visor-nav-num">→</span> Índice de Contenidos
        </div>

        <div className="visor-section-title">Capítulos</div>
        {[
          { id: 'cap1', num: '01', title: '¿Qué es Calendar?', locked: false },
          { id: 'cap2', num: '02', title: 'La interfaz explicada', locked: true },
          { id: 'cap3', num: '03', title: 'Funciones principales', locked: true },
          { id: 'cap4', num: '04', title: 'Novedades 2025–2026', locked: true },
          { id: 'cap5', num: '05', title: 'Gemini + Calendar', locked: true },
          { id: 'cap6', num: '06', title: 'Integraciones clave', locked: true },
          { id: 'cap7', num: '07', title: 'Flujos n8n', locked: true },
          { id: 'cap8', num: '08', title: 'Tu sistema semanal', locked: true },
        ].map(chap => {
          const isLocked = chap.locked && !isUnlocked
          return (
            <div
              key={chap.id}
              onClick={() => handleNavClick(chap.id, chap.locked)}
              className={`visor-nav-link ${activeChapter === chap.id ? 'active' : ''} ${isLocked ? 'link-locked' : ''}`}
            >
              <span className="visor-nav-num">
                {isLocked ? <Lock className="w-2.5 h-2.5 inline-block mr-0.5" /> : chap.num}
              </span> 
              {chap.title}
            </div>
          )
        })}

        <div className="visor-section-title">Recursos</div>
        <div 
          onClick={() => handleNavClick('cta-final', true)} 
          className={`visor-nav-link ${activeChapter === 'cta-final' ? 'active' : ''} ${!isUnlocked ? 'link-locked' : ''}`}
        >
          <span className="visor-nav-num">
            {!isUnlocked ? <Lock className="w-2.5 h-2.5 inline-block mr-0.5" /> : '→'}
          </span> 
          Próximos pasos
        </div>
        <div 
          onClick={() => handleNavClick('about', false)} 
          className={`visor-nav-link ${activeChapter === 'about' ? 'active' : ''}`}
        >
          <span className="visor-nav-num">→</span> Sobre Qaway Lab
        </div>
      </nav>

      {/* MAIN CONTENT AREA */}
      <div className={`visor-main ${sidebarOpen ? '' : 'full-width'}`}>
        {/* Toolbar: solo se muestra cuando tiene contenido visible */}
        {(!sidebarOpen || isUnlocked) && (
          <header
            className="visor-toolbar no-print"
            style={{ top: navbarVisible ? '80px' : '0px', transition: 'top 0.3s cubic-bezier(0.16,1,0.3,1)' }}
          >
            <div className="visor-toolbar-left">
              {!sidebarOpen && (
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="visor-menu-btn"
                  aria-label="Abrir Menú"
                >
                  <Menu className="w-5 h-5" />
                </button>
              )}
            </div>
            <div className="visor-toolbar-actions">
              {isUnlocked && (
                <button
                  onClick={() => window.print()}
                  className="visor-btn-action"
                >
                  <Printer className="w-4 h-4" />
                  <span>Guardar en PDF / Imprimir</span>
                </button>
              )}
            </div>
          </header>
        )}

        {/* Ebook Readable Content Container */}
        <main className="visor-content-container">
          
          {/* ============ PORTADA / COVER ============ */}
          <section id="cover" className="chapter-section">
            <div className="bg-[#1a1815] border border-[#e5e1d8] rounded-[20px] overflow-hidden relative p-8 md:p-12 mb-8 min-h-[380px] flex flex-col justify-between text-white">
              <div className="absolute right-[-2rem] top-[-2rem] w-64 h-64 rounded-full border-[40px] border-[#ffd200]/5 pointer-events-none" />
              <div className="absolute right-12 bottom-[-3rem] w-48 h-48 rounded-full border-[30px] border-cyan-500/5 pointer-events-none" />
              
              <div className="relative z-10">
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#ffd200] border border-[#ffd200]/30 bg-[#ffd200]/5 px-3 py-1 rounded-full mb-4 inline-block">
                  📘 Guía Oficial 2026
                </span>
                <div className="text-zinc-500 text-xs uppercase tracking-wider font-semibold mb-2">Qaway Lab · Productividad con IA</div>
                <h1 className="font-serif text-white text-4xl md:text-5xl font-black leading-tight mb-4">
                  Google Calendar <span className="text-[#ffd200]">Dominado</span>
                </h1>
                <p className="text-zinc-400 text-sm md:text-base max-w-lg leading-relaxed mb-6">
                  La guía completa paso a paso para estructurar tu semana, sincronizar tus herramientas y automatizar la gestión de tu tiempo con Inteligencia Artificial.
                </p>
              </div>

              <div className="relative z-10 flex flex-wrap gap-x-8 gap-y-3 border-t border-white/5 pt-6 text-[11px] text-zinc-500">
                <div>
                  <span className="block uppercase tracking-wider text-[9px] text-zinc-600">Actualizado</span>
                  <span className="font-semibold text-zinc-300">Abril 22, 2026</span>
                </div>
                <div>
                  <span className="block uppercase tracking-wider text-[9px] text-zinc-600">Nivel</span>
                  <span className="font-semibold text-zinc-300">Básico a Avanzado</span>
                </div>
                <div>
                  <span className="block uppercase tracking-wider text-[9px] text-zinc-600">Autor</span>
                  <span className="font-semibold text-zinc-300">Qaway Lab</span>
                </div>
              </div>
            </div>
          </section>

          {/* ============ ÍNDICE DE CONTENIDOS ============ */}
          <section id="indice" className="chapter-section">
            <div className="chapter-card">
              <div className="chapter-header">
                <div className="chapter-num">Estructura de la guía</div>
                <h2 className="chapter-title">Índice de Contenidos</h2>
                <p className="chapter-desc">Explora los 8 capítulos que transformarán tu forma de organizar tu tiempo diario.</p>
              </div>
              <div className="chapter-body">
                <div className="visor-data-table-wrapper">
                  <table className="visor-data-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Capítulo</th>
                        <th>Enfoque Práctico</th>
                        <th>Formato</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td><strong>01</strong></td>
                        <td>¿Qué es Google Calendar?</td>
                        <td>Historia, planes Workspace vs Cuenta Personal</td>
                        <td><span className="chapter-tag ctag-yellow">Ebook</span></td>
                      </tr>
                      <tr>
                        <td><strong>02</strong></td>
                        <td>La interfaz explicada</td>
                        <td>Anatomía completa del grid, paneles y atajos de teclado</td>
                        <td><span className="chapter-tag ctag-blue">Ambos</span></td>
                      </tr>
                      <tr>
                        <td><strong>03</strong></td>
                        <td>Funciones principales</td>
                        <td>Eventos, tareas, recordatorios y calendarios secundarios</td>
                        <td><span className="chapter-tag ctag-green">Tutorial</span></td>
                      </tr>
                      <tr>
                        <td><strong>04</strong></td>
                        <td>Novedades 2025–2026</td>
                        <td>Timezones dinámicos y Help me schedule grupal</td>
                        <td><span className="chapter-tag ctag-yellow">Ebook</span></td>
                      </tr>
                      <tr>
                        <td><strong>05</strong></td>
                        <td>Gemini + Calendar</td>
                        <td>Uso de Inteligencia Artificial para agendar y buscar</td>
                        <td><span className="chapter-tag ctag-blue">Ambos</span></td>
                      </tr>
                      <tr>
                        <td><strong>06</strong></td>
                        <td>Integraciones clave</td>
                        <td>Notion, Slack, Zoom, WhatsApp y Gmail</td>
                        <td><span className="chapter-tag ctag-blue">Ambos</span></td>
                      </tr>
                      <tr>
                        <td><strong>07</strong></td>
                        <td>Flujos de automatización</td>
                        <td>Configuración paso a paso en n8n sin código</td>
                        <td><span className="chapter-tag ctag-green">Tutorial</span></td>
                      </tr>
                      <tr>
                        <td><strong>08</strong></td>
                        <td>Tu sistema semanal</td>
                        <td>Bloques de foco, reuniones agrupadas y la regla del 70%</td>
                        <td><span className="chapter-tag ctag-blue">Ambos</span></td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="hb-box hb-type-yellow">
                  <h4>⚡ Cómo aprovechar este recurso</h4>
                  <p>
                    Las secciones de <strong>Ebook</strong> te darán el criterio conceptual para planificar. Las marcadas como <strong>Tutorial</strong> te guiarán paso a paso en pantalla con configuraciones prácticas. Si es posible, realiza los tutoriales a la par con el video oficial de Qaway Lab.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* ============ CAP 1 (ABIERTO GRATIS) ============ */}
          <section id="cap1" className="chapter-section">
            <div className="chapter-card">
              <div className="chapter-header">
                <div className="chapter-num">Capítulo 01</div>
                <h2 className="chapter-title">¿Qué es Google Calendar?</h2>
                <p className="chapter-desc">Entendiendo la base de la herramienta de gestión de tiempo más usada del mundo.</p>
                <div className="chapter-tags">
                  <span className="chapter-tag ctag-yellow">📘 Ebook</span>
                </div>
              </div>
              <div className="chapter-body">
                <p className="lead">
                  Google Calendar no es simplemente una agenda para anotar cumpleaños. Es el núcleo operativo de millones de profesionales y marcas en todo el mundo.
                </p>

                <div className="def-box">
                  <div className="def-box-term">Definición</div>
                  <div className="def-box-body">
                    Google Calendar es una aplicación web y móvil de gestión de tiempo y calendarización desarrollada por Google en 2006. Permite planificar eventos individuales y grupales, coordinar recordatorios y tareas, y —gracias a la IA en 2025/2026— orquestar la agenda por completo con lenguaje natural.
                  </div>
                </div>

                <h3>Planes y versiones en 2026</h3>
                <div className="feat-grid">
                  <div className="feat-card fc-color-yellow">
                    <span className="feat-icon">🆓</span>
                    <h4 className="feat-title">Cuenta Personal</h4>
                    <p className="feat-desc">Gratuito con cualquier cuenta @gmail. Sin límites de eventos. Perfecto para iniciar.</p>
                  </div>
                  <div className="feat-card fc-color-blue">
                    <span className="feat-icon">💼</span>
                    <h4 className="feat-title">Workspace Business</h4>
                    <p className="feat-desc">Desde $6/mes. Permite usar tu propio dominio (ej. tú@tuempresa.com) y herramientas avanzadas de administración.</p>
                  </div>
                  <div className="feat-card fc-color-green">
                    <span className="feat-icon">🤖</span>
                    <h4 className="feat-title">Workspace + Gemini</h4>
                    <p className="feat-desc">Activa el panel lateral de IA y el agendador inteligente Help me schedule con procesamiento conversacional.</p>
                  </div>
                </div>

                <h3>¿Por qué sigue siendo el estándar del mercado?</h3>
                <ul className="checklist">
                  <li><strong>Ubicuidad:</strong> Se sincroniza al instante en computadoras, tablets, iPhone y Android de forma nativa.</li>
                  <li><strong>Ecosistema Integrado:</strong> Se conecta a la perfección con Gmail, Google Meet, Drive y Google Tasks.</li>
                  <li><strong>Compatibilidad:</strong> Prácticamente el 99% de las herramientas digitales (Notion, Make, Trello, Zoom) se conectan directamente con su API.</li>
                </ul>
              </div>
            </div>
          </section>

          {/* WRAPPER DE CAPÍTULOS BLOQUEADOS (SE DIFUMINA SI NO SE HA REGISTRADO) */}
          <div className={isUnlocked ? '' : 'locked-chapters'}>
            
            {/* ============ CAP 2 ============ */}
            <section id="cap2" className="chapter-section">
              <div className="chapter-card">
                <div className="chapter-header">
                  <div className="chapter-num">Capítulo 02</div>
                  <h2 className="chapter-title">La interfaz de Google Calendar explicada</h2>
                  <p className="chapter-desc">Aprende la anatomía y domina la consola de visualización rápida.</p>
                  <div className="chapter-tags">
                    <span className="chapter-tag ctag-yellow">📘 Ebook</span>
                    <span className="chapter-tag ctag-blue">🎬 Tutorial</span>
                  </div>
                </div>
                <div className="chapter-body">
                  <p className="lead">
                    Muchos usuarios apenas usan el 30% del potencial visual de Google Calendar porque desconocen cómo estructurar la consola de vistas.
                  </p>

                  <h3>Anatomía de la Consola Principal</h3>
                  <div className="ui-anatomy-box">
                    <div className="ui-anatomy-box-title">Zonas clave de la interfaz</div>
                    <div className="ui-anatomy-grid">
                      <div className="ui-anatomy-item">
                        <span className="ui-anatomy-item-num">01</span>
                        <h5 className="ui-anatomy-item-name">Botón Crear</h5>
                        <p className="ui-anatomy-item-desc">El disparador rápido en la esquina superior izquierda. Atajo: <code>C</code>.</p>
                      </div>
                      <div className="ui-anatomy-item">
                        <span className="ui-anatomy-item-num">02</span>
                        <h5 className="ui-anatomy-item-name">Mis Calendarios</h5>
                        <p className="ui-anatomy-item-desc">Tus diferentes capas de actividades (Trabajo, Contenido, Personal) ordenados por color.</p>
                      </div>
                      <div className="ui-anatomy-item">
                        <span className="ui-anatomy-item-num">03</span>
                        <h5 className="ui-anatomy-item-name">Barra de Vistas</h5>
                        <p className="ui-anatomy-item-desc">Botones para alternar la visualización por Día, Semana, Mes o Agenda de tareas.</p>
                      </div>
                      <div className="ui-anatomy-item">
                        <span className="ui-anatomy-item-num">04</span>
                        <h5 className="ui-anatomy-item-name">Panel Lateral Gemini</h5>
                        <p className="ui-anatomy-item-desc">Consola derecha donde la IA procesa órdenes conversacionales.</p>
                      </div>
                    </div>
                  </div>

                  <h3>Atajos de teclado indispensables</h3>
                  <div className="visor-data-table-wrapper">
                    <table className="visor-data-table">
                      <thead>
                        <tr>
                          <th>Tecla</th>
                          <th>Acción</th>
                          <th>Impacto Operativo</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td><code>C</code></td>
                          <td>Crear evento</td>
                          <td>Abre de inmediato la ventana para agendar sin usar el mouse.</td>
                        </tr>
                        <tr>
                          <td><code>T</code></td>
                          <td>Hoy (Today)</td>
                          <td>Vuelve a enfocar el día actual en la cuadrícula de forma inmediata.</td>
                        </tr>
                        <tr>
                          <td><code>W</code></td>
                          <td>Vista de Semana</td>
                          <td>Muestra el panorama de los 7 días de tu plan semanal.</td>
                        </tr>
                        <tr>
                          <td><code>M</code></td>
                          <td>Vista de Mes</td>
                          <td>Muestra la visión general del mes actual.</td>
                        </tr>
                        <tr>
                          <td><code>A</code></td>
                          <td>Vista Agenda</td>
                          <td>Lista lineal muy cómoda para enfocarse únicamente en tareas programadas.</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </section>

            {/* ============ CAP 3 ============ */}
            <section id="cap3" className="chapter-section">
              <div className="chapter-card">
                <div className="chapter-header">
                  <div className="chapter-num">Capítulo 03</div>
                  <h2 className="chapter-title">Funciones principales</h2>
                  <p className="chapter-desc">Aprende a diferenciar y gestionar eventos, tareas y calendarios.</p>
                  <div className="chapter-tags">
                    <span className="chapter-tag ctag-green">🎬 Tutorial</span>
                  </div>
                </div>
                <div className="chapter-body">
                  <p className="lead">
                    Un error común es agendar recordatorios como eventos de todo el día. Esto satura visualmente la agenda y reduce la efectividad del foco diario.
                  </p>

                  <h3>1. Bloques básicos de construcción</h3>
                  <div className="feat-grid">
                    <div className="feat-card fc-color-blue">
                      <span className="feat-icon">📅</span>
                      <h4 className="feat-title">Eventos</h4>
                      <p className="feat-desc">Actividades con hora y duración específicas (ej. Reunión con cliente a las 4:00 PM).</p>
                    </div>
                    <div className="feat-card fc-color-green">
                      <span className="feat-icon">✅</span>
                      <h4 className="feat-title">Tareas (Tasks)</h4>
                      <p className="feat-desc">Cosas por hacer que no requieren un horario fijo. Se marcan como completadas.</p>
                    </div>
                    <div className="feat-card fc-color-yellow">
                      <span className="feat-icon">🗓️</span>
                      <h4 className="feat-title">Calendarios Secundarios</h4>
                      <p className="feat-desc">Capas de visualización aislables (ej. Calendario de publicaciones de Redes Sociales).</p>
                    </div>
                  </div>

                  <h3>Cómo programar un Evento Perfecto</h3>
                  <ol className="steps-list">
                    <li>
                      <span className="steps-num">1</span>
                      <div className="steps-content">
                        <span className="steps-title">Establecer Título Claro y Descriptivo</span>
                        Evita títulos ambiguos como "Llamar". Usa nomenclaturas estructuradas: "📞 Cliente: Briefing de Diseño [Carlos G]".
                      </div>
                    </li>
                    <li>
                      <span className="steps-num">2</span>
                      <div className="steps-content">
                        <span className="steps-title">Añadir videoconferencia y ubicación</span>
                        Asocia el botón automático de Google Meet o incluye tu enlace permanente de Zoom. Así tus invitados no tendrán que pedirte el link minutos antes.
                      </div>
                    </li>
                    <li>
                      <span className="steps-num">3</span>
                      <div className="steps-content">
                        <span className="steps-title">Configurar alertas inteligentes</span>
                        Establece dos recordatorios: uno 24 horas antes (por si hay que reagendar) y otro 10 minutos antes (para conectarse a tiempo).
                      </div>
                    </li>
                  </ol>
                </div>
              </div>
            </section>

            {/* ============ CAP 4 ============ */}
            <section id="cap4" className="chapter-section">
              <div className="chapter-card">
                <div className="chapter-header">
                  <div className="chapter-num">Capítulo 04</div>
                  <h2 className="chapter-title">Novedades 2025 – 2026</h2>
                  <p className="chapter-desc">Las actualizaciones del último año que revolucionan la gestión corporativa.</p>
                  <div className="chapter-tags">
                    <span className="chapter-tag ctag-yellow">📘 Ebook</span>
                  </div>
                </div>
                <div className="chapter-body">
                  <p className="lead">
                    Google ha rediseñado la orquestación horaria para dar soporte al trabajo global y descentralizado en 2026.
                  </p>

                  <h3>Zona Horaria Dinámica</h3>
                  <p>
                    Si trabajas con equipos de diferentes países (Perú, España, México), ahora Calendar detecta automáticamente los desfases locales e incluye columnas de referencia horaria lateral. Ya no tienes que calcular de memoria qué hora es en Madrid al agendar.
                  </p>

                  <h3>Help me schedule (Gemini Grupal)</h3>
                  <div className="hb-box hb-type-blue">
                    <h4>💡 ¿Qué es?</h4>
                    <p>
                      Cuando intentas programar una reunión con 5 personas de tu equipo, en lugar de revisar sus calendarios uno por uno, Gemini analiza el historial de disponibilidad de todos y sugiere los 3 mejores espacios libres de forma automática.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* ============ CAP 5 ============ */}
            <section id="cap5" className="chapter-section">
              <div className="chapter-card">
                <div className="chapter-header">
                  <div className="chapter-num">Capítulo 05</div>
                  <h2 className="chapter-title">Gemini + Calendar (Inteligencia Artificial)</h2>
                  <p className="chapter-desc">Orquesta tu tiempo con lenguaje natural. ¡Prueba el simulador de IA en tiempo real!</p>
                  <div className="chapter-tags">
                    <span className="chapter-tag ctag-yellow">📘 Ebook</span>
                    <span className="chapter-tag ctag-blue">🎬 Tutorial</span>
                  </div>
                </div>
                <div className="chapter-body">
                  <p className="lead">
                    El panel lateral de Gemini en Google Calendar te permite conversar directamente con tu agenda. Puedes escribir instrucciones complejas y dejar que la IA resuelva el agendamiento.
                  </p>

                  {/* SIMULADOR DE GOOGLE CALENDAR EN VIVO */}
                  <div className="bg-[#0a0a0f] border border-white/5 rounded-2xl p-4 md:p-6 shadow-2xl relative overflow-hidden min-h-[460px] flex flex-col justify-between mb-8 text-white">
                    <div className="absolute inset-0 bg-linear-to-tr from-cyan-500/5 via-transparent to-transparent pointer-events-none" />
                    
                    <div className="flex items-center justify-between border-b border-white/5 pb-4 relative z-10">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                          <Calendar className="w-4.5 h-4.5 text-cyan-400" />
                        </div>
                        <div>
                          <h3 className="text-sm font-black text-white tracking-tight flex items-center gap-2 m-0 p-0 border-none">
                            Google Calendar Mock
                            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-cyan-400/10 text-cyan-400 border border-cyan-400/20">IA Activada</span>
                          </h3>
                          <p className="text-[10px] text-zinc-500 m-0 p-0">Agenda Semanal - Simulación en Vivo</p>
                        </div>
                      </div>
                      {events.length > INITIAL_EVENTS.length && (
                        <button 
                          onClick={handleResetCalendar}
                          className="text-[9px] font-bold text-zinc-400 hover:text-white border border-white/5 hover:bg-white/5 px-2.5 py-1 rounded-lg transition-all"
                        >
                          Reestablecer Agenda
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-5 gap-2 my-4 relative z-10 grow">
                      {['Lun', 'Mar', 'Mié', 'Jue', 'Vie'].map(day => {
                        const dayEvents = events.filter(e => e.day === day)
                        return (
                          <div key={day} className="bg-[#0f0f16]/60 border border-white/5 rounded-xl p-2 flex flex-col gap-2 min-h-[220px]">
                            <span className="text-[10px] font-black tracking-wider text-zinc-500 uppercase border-b border-white/5 pb-1 block text-center text-zinc-400">
                              {day}
                            </span>
                            
                            <AnimatePresence>
                              {dayEvents.map(evt => (
                                <motion.div
                                  key={evt.id}
                                  initial={{ opacity: 0, scale: 0.9, y: 5 }}
                                  animate={{ opacity: 1, scale: 1, y: 0 }}
                                  exit={{ opacity: 0, scale: 0.9 }}
                                  transition={{ type: "spring", stiffness: 140, damping: 15 }}
                                  className={`text-[9px] p-2 rounded-lg leading-tight transition-all duration-300 ${evt.color}`}
                                >
                                  <div className="flex items-center gap-1 mb-1 font-mono text-[8px] opacity-75">
                                    <Clock className="w-2.5 h-2.5" />
                                    <span>{evt.time}</span>
                                  </div>
                                  <div className="font-semibold truncate">{evt.title}</div>
                                </motion.div>
                              ))}
                            </AnimatePresence>
                            
                            {dayEvents.length === 0 && (
                              <div className="grow flex items-center justify-center border border-dashed border-white/5 rounded-lg">
                                <span className="text-[8px] text-zinc-700 uppercase tracking-widest font-mono">Libre</span>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>

                    <div className="bg-[#12121c] border border-white/5 rounded-xl p-3 flex items-center gap-3 min-h-[56px] relative z-10 text-left">
                      <div className="w-6 h-6 rounded-full bg-cyan-400/10 flex items-center justify-center shrink-0">
                        {simStep === 1 || simStep === 2 ? (
                          <RefreshCw className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
                        ) : simStep === 3 ? (
                          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                        )}
                      </div>
                      <div className="text-[10px] leading-relaxed">
                        {simStep === 0 ? (
                          <span className="text-zinc-500">Haz clic en los comandos sugeridos abajo para ver cómo la IA orquesta la agenda.</span>
                        ) : (
                          <span className={simStep === 3 ? "text-emerald-400 font-semibold" : "text-zinc-300"}>
                            {simText}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/2 border border-white/5 rounded-2xl p-4 space-y-3 mb-6">
                    <span className="text-[10px] font-black tracking-widest text-zinc-400 uppercase block mb-1">
                      Comandos de IA en vivo (Simulador)
                    </span>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      {prompts.map(p => {
                        const isActive = activePrompt === p.id
                        return (
                          <button
                            key={p.id}
                            onClick={() => handleRunSimulation(p)}
                            disabled={simStep === 1 || simStep === 2}
                            className={`text-left text-xs p-3 rounded-xl border transition-all duration-300 flex items-center justify-between group ${
                              isActive 
                                ? 'bg-cyan-500/10 border-cyan-400 text-white font-bold' 
                                : 'bg-[#12121a]/60 border-white/5 hover:border-white/10 text-zinc-300 hover:text-white'
                            }`}
                          >
                            <div className="flex flex-col gap-0.5 text-left">
                              <span className="font-bold text-[11px] group-hover:text-[#ffd200] transition-colors">{p.label}</span>
                              <span className="text-[9px] text-zinc-500 truncate max-w-[150px]">{p.text}</span>
                            </div>
                            <div className="w-6 h-6 rounded-lg bg-white/3 border border-white/5 flex items-center justify-center shrink-0 group-hover:bg-[#ffd200] group-hover:text-black transition-all">
                              {isActive && simStep === 3 ? (
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                              ) : (
                                <Play className="w-2.5 h-2.5" />
                              )}
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  <h3>Ejemplos de Prompts Útiles para el día a día</h3>
                  <div className="prompt-command-box">
                    <div className="prompt-command-label">Para Agendar</div>
                    <div className="prompt-command-text">
                      "Crea una reunión recurrente llamada 'Revisión Operativa' todos los martes a las 10:00 AM con marketing@qawaylab.com. Agrega Google Meet."
                    </div>
                  </div>
                  
                  <div className="prompt-command-box">
                    <div className="prompt-command-label">Para Buscar y Consolidar</div>
                    <div className="prompt-command-text">
                      "¿Qué reuniones tengo agendadas con Carlos para la próxima semana y a qué horas?"
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* ============ CAP 6 ============ */}
            <section id="cap6" className="chapter-section">
              <div className="chapter-card">
                <div className="chapter-header">
                  <div className="chapter-num">Capítulo 06</div>
                  <h2 className="chapter-title">Integraciones clave</h2>
                  <p className="chapter-desc">Conecta tu agenda a tu ecosistema de aplicaciones diarias.</p>
                  <div className="chapter-tags">
                    <span className="chapter-tag ctag-yellow">📘 Ebook</span>
                    <span className="chapter-tag ctag-blue">🎬 Tutorial</span>
                  </div>
                </div>
                <div className="chapter-body">
                  <p className="lead">
                    Google Calendar es sumamente potente cuando se integra con herramientas de videoconferencia y bases de datos.
                  </p>

                  <div className="int-grid">
                    <div className="int-card-box">
                      <div className="int-card-header">
                        <div className="int-card-logo" style={{ background: '#0a0a0f', border: '1px solid rgba(0, 0, 0, 0.1)' }}>N</div>
                        <div>
                          <div className="int-card-name">Notion</div>
                          <div className="int-card-type">Bases de datos</div>
                        </div>
                      </div>
                      <p className="int-card-desc">Sincroniza tus eventos con tu planificador semanal y centraliza tus minutas de reunión.</p>
                      <span className="int-card-badge ib-tag-make">Conexión via Make</span>
                    </div>

                    <div className="int-card-box">
                      <div className="int-card-header">
                        <div className="int-card-logo" style={{ background: '#4a154b' }}>S</div>
                        <div>
                          <div className="int-card-name">Slack</div>
                          <div className="int-card-type">Comunicación</div>
                        </div>
                      </div>
                      <p className="int-card-desc">Cambia tu estado a "En reunión" automáticamente y envía resúmenes diarios a canales de equipo.</p>
                      <span className="int-card-badge ib-tag-native">Nativa Google</span>
                    </div>

                    <div className="int-card-box">
                      <div className="int-card-header">
                        <div className="int-card-logo" style={{ background: '#25d366' }}>W</div>
                        <div>
                          <div className="int-card-name">WhatsApp</div>
                          <div className="int-card-type">Mensajería</div>
                        </div>
                      </div>
                      <p className="int-card-desc">Envía recordatorios automáticos de reuniones a tus clientes con el enlace de videollamada.</p>
                      <span className="int-card-badge ib-tag-n8n">Conexión via n8n</span>
                    </div>
                  </div>

                  <div className="hb-box hb-type-dark">
                    <h4>💡 Criterio de prioridad de integraciones</h4>
                    <p>
                      Si estás empezando, habilita <strong>Google Meet</strong> y <strong>Zoom</strong>. Son nativas y te ahorrarán fricción inmediata con tus clientes. Si lideras un equipo de trabajo, activa la integración de <strong>Slack</strong>. Deja las automatizaciones a medida (n8n/Make) para cuando tengas definido tu sistema semanal de bloques.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* ============ CAP 7 ============ */}
            <section id="cap7" className="chapter-section">
              <div className="chapter-card">
                <div className="chapter-header">
                  <div className="chapter-num">Capítulo 07</div>
                  <h2 className="chapter-title">Flujos de automatización con n8n</h2>
                  <p className="chapter-desc">Configura tus propios flujos automatizados de bajo coste y alta escala.</p>
                  <div className="chapter-tags">
                    <span className="chapter-tag ctag-green">🎬 Tutorial Avanzado</span>
                  </div>
                </div>
                <div className="chapter-body">
                  <p className="lead">
                    n8n te permite crear lógicas complejas de automatización conectando la API de Google Calendar con servicios externos de forma directa y visual.
                  </p>

                  <h3>Flujo 1: Recordatorios automáticos por WhatsApp</h3>
                  <p>
                    Envía un mensaje de texto amigable 15 minutos antes de la llamada para asegurar la asistencia de tu cliente.
                  </p>

                  <div className="flow-diagram">
                    <div className="flow-diagram-step fd-active">Calendar Trigger<br/><small>Nuevo evento</small></div>
                    <div className="flow-diagram-arrow">→</div>
                    <div className="flow-diagram-step">n8n Delay<br/><small>Esperar 15 min antes</small></div>
                    <div className="flow-diagram-arrow">→</div>
                    <div className="flow-diagram-step">WhatsApp API<br/><small>Enviar mensaje</small></div>
                    <div className="flow-diagram-arrow">→</div>
                    <div className="flow-diagram-step fd-end">Cliente notificado<br/><small>Mejora asistencia</small></div>
                  </div>

                  <h3>Flujo 2: Generar hojas de minutas en Notion</h3>
                  <p>
                    Cada vez que agendes un evento del tipo "Reunión", n8n creará automáticamente una página dentro de tu base de datos de Notion con la plantilla de minuta corporativa lista para rellenar.
                  </p>

                  <div className="flow-diagram">
                    <div className="flow-diagram-step fd-active">Calendar Event<br/><small>Creación de cita</small></div>
                    <div className="flow-diagram-arrow">→</div>
                    <div className="flow-diagram-step">n8n Parser<br/><small>Extrae invitados y hora</small></div>
                    <div className="flow-diagram-arrow">→</div>
                    <div className="flow-diagram-step">Notion Node<br/><small>Crea hoja con plantilla</small></div>
                    <div className="flow-diagram-arrow">→</div>
                    <div className="flow-diagram-step fd-end">Notion Listo<br/><small>Evita olvido de minutas</small></div>
                  </div>
                </div>
              </div>
            </section>

            {/* ============ CAP 8 ============ */}
            <section id="cap8" className="chapter-section">
              <div className="chapter-card">
                <div className="chapter-header">
                  <div className="chapter-num">Capítulo 08</div>
                  <h2 className="chapter-title">Tu sistema semanal con Google Calendar</h2>
                  <p className="chapter-desc">Implementa una rutina de organización práctica en 10 minutos semanales.</p>
                  <div className="chapter-tags">
                    <span className="chapter-tag ctag-yellow">📘 Ebook</span>
                    <span className="chapter-tag ctag-green">🎬 Tutorial</span>
                  </div>
                </div>
                <div className="chapter-body">
                  <p className="lead">
                    Un calendario sin un método detrás es solo una lista de interrupciones de otras personas. El secreto está en tomar el control de forma proactiva.
                  </p>

                  <h3>Los 3 bloques no negociables</h3>
                  <div className="feat-grid">
                    <div className="feat-card fc-color-blue">
                      <span className="feat-icon">🧠</span>
                      <h4 className="feat-title">Bloques de Foco Profundo</h4>
                      <p className="feat-desc">Franjas de 2 o 3 horas al día dedicadas a tareas de alta concentración sin llamadas ni notificaciones.</p>
                    </div>
                    <div className="feat-card fc-color-green">
                      <span className="feat-icon">🤝</span>
                      <h4 className="feat-title">Agrupación de Reuniones</h4>
                      <p className="feat-desc">Concentra tus reuniones en 2 días específicos de la semana para evitar tener tu tiempo fragmentado.</p>
                    </div>
                    <div className="feat-card fc-color-yellow">
                      <span className="feat-icon">📊</span>
                      <h4 className="feat-title">Bloque de Planificación</h4>
                      <p className="feat-desc">30 minutos los viernes por la tarde para limpiar pendientes e hilvanar la semana siguiente.</p>
                    </div>
                  </div>

                  <div className="hb-box hb-type-qaway">
                    <h4>⚠️ La Regla del 70% de Capacidad</h4>
                    <p>
                      Nunca llenes el 100% de tu calendario. Deja al menos un 30% libre para imprevistos, descansos y tareas espontáneas. Un calendario sobresaturado genera ansiedad y reduce la flexibilidad operativa ante emergencias comerciales.
                    </p>
                  </div>

                  <h3>Estructura Semanal Tipo Qaway Lab</h3>
                  <div className="visor-data-table-wrapper">
                    <table className="visor-data-table">
                      <thead>
                        <tr>
                          <th>Día</th>
                          <th>Franja Mañana (8:00 - 12:00)</th>
                          <th>Franja Tarde (14:00 - 17:00)</th>
                          <th>Foco Operativo</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td><strong>Lunes</strong></td>
                          <td>Planificación + Foco Creativo</td>
                          <td>Reuniones con clientes</td>
                          <td>Planificación y Lanzamientos</td>
                        </tr>
                        <tr>
                          <td><strong>Martes</strong></td>
                          <td>Producción de Contenido (Grabación)</td>
                          <td>Edición de videos</td>
                          <td>Desarrollo de Contenidos</td>
                        </tr>
                        <tr>
                          <td><strong>Miércoles</strong></td>
                          <td>Reuniones con equipo de soporte</td>
                          <td>Análisis de analíticas y métricas</td>
                          <td>Gestión y Control de Datos</td>
                        </tr>
                        <tr>
                          <td><strong>Jueves</strong></td>
                          <td>Foco en proyectos largos de marca</td>
                          <td>Atención a correos y mensajería</td>
                          <td>Estrategia y Crecimiento</td>
                        </tr>
                        <tr>
                          <td><strong>Viernes</strong></td>
                          <td>Revisión Semanal de Objetivos</td>
                          <td>Educación y Aprendizaje</td>
                          <td>Alineación de Agenda</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </section>

            {/* ============ CALL TO ACTION FINAL ============ */}
            <section id="cta-final" className="chapter-section no-print">
              <div className="visor-cta-block vcta-dark text-white">
                <div className="vcta-eyebrow">Próximos Pasos · Ecosistema Qaway Lab</div>
                <h3 className="vcta-title text-white">¿Listo para estructurar tu negocio?</h3>
                <p className="vcta-body">
                  Si quieres acelerar tu digitalización o automatizar tu operación con IA de forma personalizada, puedes agendar una consultoría estratégica con nuestro equipo técnico.
                </p>
                <div className="vcta-buttons">
                  <a 
                    href={WHATSAPP_LINK}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="vcta-btn vcta-btn-primary"
                  >
                    Agendar por WhatsApp
                  </a>
                  <button 
                    onClick={() => window.print()}
                    className="vcta-btn vcta-btn-outline text-white border-white/40 hover:border-white"
                  >
                    <Printer className="w-4 h-4 text-white" /> Guardar PDF de esta guía
                  </button>
                </div>
              </div>
            </section>

            {/* ============ SOBRE QAWAY LAB / AUTHOR ============ */}
            <footer id="about" className="visor-about-author text-white">
              <div className="visor-about-logo">Qaway<span>Lab</span></div>
              <p className="visor-about-tagline text-zinc-400">Innova & Aprende · Eficiencia, Automatización y Estrategia</p>
              <div className="visor-about-links no-print">
                <a href="https://www.tiktok.com/@qawaymyc" target="_blank" rel="noreferrer" className="visor-about-link text-zinc-300">TikTok</a>
                <a href="https://youtube.com/@qawaymyc" target="_blank" rel="noreferrer" className="visor-about-link text-zinc-300">YouTube</a>
                <a href={WHATSAPP_LINK} target="_blank" rel="noreferrer" className="visor-about-link text-zinc-300">WhatsApp</a>
              </div>
              <p className="visor-about-footer-text text-zinc-500">
                Guía desarrollada por Qaway Lab · Todos los derechos reservados &copy; 2026.
              </p>
            </footer>
          </div>
        </main>
      </div>

      {/* FLOATING SCROLL-GATE LOCK CARD OVERLAY */}
      <AnimatePresence>
        {showLockCard && !isUnlocked && (
          <div className={`scroll-gate-overlay no-print ${sidebarOpen ? '' : 'full-width'}`} style={{ zIndex: 9999 }}>
            <motion.div 
              key="lock-card"
              className="lock-card"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              transition={{ type: "spring", stiffness: 100, damping: 15 }}
            >
              <div className="lock-card-eyebrow">
                <Lock className="w-3.5 h-3.5 text-[#ffd200]" />
                <span>Recurso Bloqueado</span>
              </div>
              <h3 className="lock-card-title text-white">Sigue leyendo la guía completa</h3>
              <p className="lock-card-desc">
                Ingresa tu Nombre y Correo para desbloquear los 7 capítulos restantes, habilitar el simulador de IA en vivo y descargar la versión PDF.
              </p>

              <form onSubmit={handleLeadSubmit} className="lock-card-form">
                <div className="lock-card-input-group">
                  <label className="lock-card-label" htmlFor="leadName">Nombre completo</label>
                  <div className="relative">
                    <input
                      id="leadName"
                      type="text"
                      required
                      className="lock-card-input"
                      placeholder="Ej. Carlos García"
                      value={lockName}
                      onChange={(e) => setLockName(e.target.value)}
                      disabled={isSubmittingLead}
                    />
                  </div>
                </div>

                <div className="lock-card-input-group">
                  <label className="lock-card-label" htmlFor="leadEmail">Correo corporativo o personal</label>
                  <div className="relative">
                    <input
                      id="leadEmail"
                      type="email"
                      required
                      className="lock-card-input"
                      placeholder="carlos@empresa.com"
                      value={lockEmail}
                      onChange={(e) => setLockEmail(e.target.value)}
                      disabled={isSubmittingLead}
                    />
                  </div>
                </div>

                {leadError && (
                  <p className="text-xs text-red-400 mb-3 font-semibold leading-relaxed">
                    ⚠️ {leadError}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={isSubmittingLead}
                  className="lock-card-btn"
                >
                  {isSubmittingLead ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Procesando desbloqueo...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Desbloquear Guía Gratis</span>
                    </>
                  )}
                </button>
              </form>

              <div className="lock-card-footer text-[10px] text-zinc-500">
                <ShieldCheck className="w-3.5 h-3.5 text-zinc-600" />
                Suscripción gratuita. Puedes darte de baja cuando quieras.
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
