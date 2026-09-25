import React, { useState, useEffect, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { HubIcon } from '@/components/ui/icons'
import {
  AlertCircle, ArrowRight, BarChart3, Bell, Bot, Building2, Calendar, ChevronDown, ChevronRight, Clock, CreditCard,
  FileImage, FolderKanban, HelpCircle, Home, Instagram, LayoutGrid, Menu, MessageSquare,
  Package, PenSquare, Plus, Receipt, Search, Settings, Shield, Sparkles,
  Star, Tag, User, UserPlus, Users, X, Zap,
} from '@/components/ui/icons/hubIcons'
import { Sun, Moon, Contrast } from 'lucide-react'
import { logoutUser } from '@/config/auth'
import { avatarFor } from '@/lib/userAvatar'
import { supabase } from '@/config/supabase'
import { useAppAccess } from './hooks/useAppAccess'
import { AppSwitcherDropdown } from './5-gestor-de-proyectos/components/v2/AppSwitcherDropdown'
import EmpresasModule from './HubSuperEmpresasModule'
import UsersModule from './HubSuperUsersModule'
import AplicacionesModule from './HubsuperAplicacionesModule'
import PlanesPreciosPage from './HubSuperPlanesPreciosPage'
import SuscripcionesPanel from './HubSuperSuscripcionesPanel'
import PagosPanel from './HubSuperPagosPanel'
import ReportesPanel from './HubSuperReportesPanel'
import SupportPanel from './HubSuperSupportPanel'
import ConfiguracionPanel from './HubSuperConfiguracionPanel'
import HubProfilePanel from './HubSuperAdminProfilePanel'

class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false, error: null, errorInfo: null } }
  static getDerivedStateFromError(error) { return { hasError: true, error } }
  componentDidCatch(error, errorInfo) {
    console.error('HubPanel Error:', error, errorInfo)
    this.setState({ error, errorInfo })
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-full bg-[#111111] text-zinc-200 flex items-center justify-center p-6 select-none">
          <div className="max-w-md w-full bg-zinc-900/90 border border-zinc-800 rounded-2xl p-7 shadow-2xl backdrop-blur-sm text-center">
            <div className="w-12 h-12 rounded-full bg-zinc-800 border border-zinc-700/60 flex items-center justify-center mx-auto mb-4 text-amber-400/90">
              <HubIcon icon={AlertCircle} size={24} className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-white mb-2">Ocurrió un inconveniente temporal en el Hub</h2>
            {this.state.error && (
              <div className="text-left bg-black/60 border border-red-500/30 rounded-xl p-3 mb-4 text-xs font-mono text-red-400 overflow-auto max-h-48 select-text">
                <p className="font-bold text-red-300 mb-1">{this.state.error.name}: {this.state.error.message}</p>
                {this.state.error.stack && <p className="text-[10px] text-zinc-400 whitespace-pre-wrap">{this.state.error.stack.slice(0, 300)}</p>}
              </div>
            )}
            <div className="flex items-center justify-center gap-3 mb-4">
              <button type="button" onClick={() => window.location.reload()} className="px-4 py-2 bg-white text-zinc-950 text-xs font-bold rounded-xl hover:bg-zinc-200 transition-colors shadow-xs">Recargar módulo</button>
              <a href="/hub" className="px-4 py-2 bg-zinc-800 text-zinc-300 text-xs font-semibold rounded-xl hover:bg-zinc-700 transition-colors border border-zinc-700/50">Volver al Hub</a>
            </div>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

// Catálogo literal de HubPage
const ROUTES = [
  { icon: Bot, title: 'Agentes de IA Responsable (Ley 31814)', description: 'Configuracion, entrenamiento y simulacion en vivo de Agentes IA Consultivos para WhatsApp y Web.', path: '/hub/agentes', access: 'pro', badge: 'Ley 31814 & PAIR', category: 'Inteligencia Artificial', pillar: 'IA', tone: 'bg-indigo-600/10 text-indigo-600', preview: '/assets/hub-previews/preview-agentes.png', published: true },
  { icon: Calendar, title: 'Qaway Agenda & Sistema de Citas', description: 'Software de reservas y calendario estilo Calendly.', path: '/hub/agenda', access: 'pro', badge: 'Nuevo SaaS', category: 'Gestion & Productividad', pillar: 'Automatizacion', tone: 'bg-indigo-500/10 text-indigo-500', preview: '/assets/hub-previews/preview-agenda.png', published: true, app: 'agenda' },
  { icon: CreditCard, title: 'Qaway Pagos & Checkout Multi-metodo', description: 'Pasarela de pagos multi-metodo: Tarjeta Stripe, Yape, Plin, PagoEfectivo.', path: '/hub/pagos', access: 'pro', badge: 'Modulo Pagos', category: 'Comercio & Finanzas', pillar: 'Marketing', tone: 'bg-emerald-500/10 text-emerald-500', preview: '/assets/hub-previews/preview-pagos.png', published: true },
  { icon: Package, title: 'Qaway Inventario & ERP Comercial', description: 'Sistema integral de gestion de productos, stock, almacenes, movimientos Kardex.', path: '/hub/inventario', access: 'pro', badge: 'SaaS ERP', category: 'Logistica & Almacenes', pillar: 'Automatizacion', tone: 'bg-[#ff4b0b]/10 text-[#ff4b0b]', preview: '/assets/hub-previews/preview-inventario.png', published: true, app: 'inventario' },
  { icon: Star, title: 'Qaway Academy (LMS Cursos & Certificaciones)', description: 'Plataforma educativa integral: Catalogo de cursos, reproductor de lecciones.', path: '/hub/academy', access: 'pro', badge: 'LMS Real', category: 'Educacion & Cursos', pillar: 'Creacion', tone: 'bg-[#ff4b0b]/10 text-[#ff4b0b]', preview: '/assets/hub-previews/preview-academy.png', published: true },
  { icon: Sparkles, title: 'Creador de Contenido Modular (5 Skills)', description: 'Fabrica de contenidos con IA: Radar viral, Guiones con retencion medida.', path: '/hub/creador-contenido', access: 'pro', badge: 'Nuevo', category: 'Marketing & Creacion', pillar: 'Creacion', tone: 'bg-[#fe6612]/10 text-[#fe6612]', preview: '/assets/hub-previews/preview-creador.png', published: true },
  { icon: FileImage, title: 'Optimizador de Imagenes WebP', description: 'Herramienta interactiva para comprimir y convertir imagenes PNG y JPG a WebP.', path: '/hub/optimizador-webp', access: 'free', badge: 'Gratis', category: 'Herramientas', pillar: 'Automatizacion', tone: 'bg-[#fe6612]/10 text-[#fe6612]', preview: '/assets/hub-previews/preview-inventario.png', published: false },
  { icon: Instagram, title: 'Descargador & Extractor de Instagram', description: 'Extractor y descargador multimedia de publicaciones.', path: '/hub/descargador-ig', access: 'free', badge: 'Borrador', category: 'Herramientas', pillar: 'Marketing', tone: 'bg-[#ff4b0b]/10 text-[#ff4b0b]', preview: '/assets/hub-previews/preview-creador.png', published: false },
  { icon: FolderKanban, title: 'Gestor de Proyectos & Entregas', description: 'Trazabilidad y portal de cliente: ciclo de 6 hitos.', path: '/hub/gestor-proyectos', access: 'pro', badge: 'Pro', category: 'Product Management', pillar: 'Automatizacion', tone: 'bg-[#fe6612]/10 text-[#fe6612]', preview: '/assets/hub-previews/preview-agenda.png', published: false },
  { icon: PenSquare, title: 'Editor de Blog', description: 'Plataforma editorial para crear, estructurar y publicar articulos.', path: '/hub/blog-editor', access: 'pro', badge: 'Listo', category: 'Herramientas', pillar: 'Creacion', tone: 'bg-[#ff4b0b]/10 text-[#ff4b0b]', preview: '/assets/hub-previews/hub-portada.webp', published: true, app: 'blog' },
  { icon: Calendar, title: 'Consola WABA + CRM', description: 'Panel ejecutivo para campana: integracion WhatsApp API.', path: '/hub/waba-crm', access: 'pro', badge: 'Destacado', category: 'Panel de control', pillar: 'IA', tone: 'bg-[#191918] text-white', preview: '/assets/hub-previews/preview-agentes.png', published: false },
  { icon: MessageSquare, title: 'Consola CRM Comercial', description: 'Bandeja multiagente de WhatsApp, atribucion en tiempo real.', path: '/hub/crm', access: 'pro', badge: 'Nuevo', category: 'Panel de control', pillar: 'Marketing', tone: 'bg-[#ff4b0b]/10 text-[#ff4b0b]', preview: '/assets/hub-previews/preview-crm.jpg', published: true, app: 'crm' },
]

const PILLARS = [
  { label: 'Todas', match: null },
  { label: 'Marketing', match: 'Marketing' },
  { label: 'Automatizacion', match: 'Automatizacion' },
  { label: 'IA', match: 'IA' },
  { label: 'Creacion de Contenido', match: 'Creacion' },
]

const PILLAR_GRADIENTS = {
  'IA':            'bg-[linear-gradient(135deg,#ffffff_0%,#f5f7ff_50%,#eef2ff_100%)]',
  'Automatizacion':'bg-[linear-gradient(135deg,#ffffff_0%,#f0f9ff_50%,#e0f2fe_100%)]',
  'Marketing':     'bg-[linear-gradient(135deg,#ffffff_0%,#f8faff_50%,#e8f0fe_100%)]',
  'Creacion':      'bg-[linear-gradient(135deg,#ffffff_0%,#faf5ff_50%,#f3e8ff_100%)]',
  'Herramientas':  'bg-[linear-gradient(135deg,#ffffff_0%,#f8fafc_50%,#f1f5f9_100%)]',
}

const SUPER_ADMIN_NAV = [
  { id: 'Inicio', label: 'Inicio', icon: Home },
  { id: 'Empresas', label: 'Empresas', icon: Building2 },
  { id: 'Usuarios', label: 'Usuarios', icon: Users },
  { id: 'Aplicaciones', label: 'Aplicaciones', icon: LayoutGrid },
  { id: 'Planes', label: 'Planes y Precios', icon: Tag },
  { id: 'Suscripciones', label: 'Suscripciones', icon: Clock },
  { id: 'Pagos', label: 'Pagos', icon: Receipt },
  { id: 'Reportes', label: 'Reportes', icon: BarChart3 },
  { id: 'Soporte', label: 'Soporte', icon: HelpCircle },
  { id: 'Configuracion', label: 'Configuración', icon: Settings },
]

// Navegación del Tenant Admin: mismo shell y mismo diseño, solo los módulos permitidos
// para su empresa (se excluye el listado global de Empresas). No se duplica el panel.
const TENANT_ADMIN_NAV = SUPER_ADMIN_NAV.filter((nav) => nav.id !== 'Empresas')

// Navegación base del trabajador (editor/viewer/guest): su espacio y sus apps.
// Usuarios y Configuración son EXCLUSIVAS de administrador (jamás otorgables);
// el resto de secciones administrativas se habilitan por usuario vía
// users.permissions.panel (editables por el administrador de la marca).
const WORKER_BASE_NAV = [
  { id: 'Inicio', label: 'Inicio', icon: Home },
  { id: 'Aplicaciones', label: 'Aplicaciones', icon: LayoutGrid },
]
const ADMIN_ONLY_NAV = new Set(['Usuarios', 'Configuracion'])
const MODULE_TABS = ['Usuarios', 'Aplicaciones', 'Planes', 'Suscripciones', 'Pagos', 'Reportes', 'Soporte', 'Configuracion']

// Píldora de marca (admin de empresa): agrupación por rol para el listado rápido del equipo.
const BRAND_ROLE_GROUPS = [
  { key: 'admin', label: 'Administradores', dot: 'bg-orange-400' },
  { key: 'editor', label: 'Editores', dot: 'bg-sky-400' },
  { key: 'viewer', label: 'Visualizadores', dot: 'bg-emerald-400' },
  { key: 'guest', label: 'Invitados', dot: 'bg-amber-400' },
]

// Rutas internas del panel (30.X): mismo archivo, enlace propio por punto.
// /hub/panel[/empresas|/usuarios|/aplicaciones|/planes|/suscripciones|/pagos|/reportes|/soporte|/configuracion|/marketing|/automatizacion|/ia|/creacion][?q=texto]
const PANEL_SLUGS = {
  Inicio: '', Empresas: 'empresas', Usuarios: 'usuarios', Aplicaciones: 'aplicaciones',
  Planes: 'planes', Suscripciones: 'suscripciones', Pagos: 'pagos', Reportes: 'reportes',
  Soporte: 'soporte', Configuracion: 'configuracion', Todas: '',
  'Mi cuenta': 'mi-cuenta',
  Marketing: 'marketing', Automatizacion: 'automatizacion', IA: 'ia', 'Creacion de Contenido': 'creacion',
}
const PANEL_TABS = Object.fromEntries(
  Object.entries(PANEL_SLUGS).filter(([, s]) => s).map(([t, s]) => [s, t]),
)

function displayName(email) {
  if (!email) return null
  const base = email.split('@')[0].replace(/[._-]+/g, ' ').trim()
  if (!base) return null
  return base.split(' ').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

// Optimización local del avatar antes de Storage: recorte cuadrado centrado + WebP comprimido.
// Evita subir PNG/JPG pesados (causa del flash y la lentitud del avatar) al mantener ~512px y
// WebP < 200 KB. No toca el modelo de usuarios: solo alimenta el upload.
async function optimizeAvatar(file, maxSize = 512) {
  const dataUrl = await fileToDataUrl(file)
  const img = await new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('La imagen no pudo procesarse.'))
    image.src = dataUrl
  })
  const side = Math.min(img.width, img.height)
  const sx = (img.width - side) / 2
  const sy = (img.height - side) / 2
  const canvas = document.createElement('canvas')
  canvas.width = maxSize
  canvas.height = maxSize
  const ctx = canvas.getContext('2d')
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(img, sx, sy, side, side, 0, 0, maxSize, maxSize)
  const blob = await new Promise((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('No se pudo generar la imagen optimizada.'))), 'image/webp', 0.85)
  })
  return blob
}

function TenantAdminDashboard({ tenantId, tenantName, setActiveTab }) {
  const [company, setCompany] = useState(null)
  const [subs, setSubs] = useState([])
  const [appNames, setAppNames] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let alive = true
    ;(async () => {
      if (!tenantId) {
        if (alive) setLoading(false)
        return
      }
      const [tenantRes, subsRes, appsRes] = await Promise.all([
        supabase.from('tenants').select('name, client_code, status').eq('id', tenantId).maybeSingle(),
        supabase.from('tenant_app_subscriptions').select('app_id, plan, status').eq('tenant_id', tenantId),
        supabase.from('app_catalog').select('id, name'),
      ])
      if (!alive) return
      setCompany(tenantRes.data)
      setSubs(subsRes.data || [])
      setAppNames(Object.fromEntries((appsRes.data || []).map((a) => [a.id, a.name])))
      setLoading(false)
    })()
    return () => { alive = false }
  }, [tenantId])

  const activeApps = subs.filter((s) => s.status === 'active' || s.status === 'trialing')
  const plans = [...new Set(activeApps.map((s) => s.plan).filter(Boolean))]
  const statusMeta = {
    active: ['Activo', 'bg-emerald-50 text-emerald-600'],
    trialing: ['En prueba', 'bg-sky-50 text-sky-600'],
    suspended: ['Suspendido', 'bg-amber-50 text-amber-600'],
    cancelled: ['Cancelado', 'bg-red-50 text-red-600'],
  }
  const today = new Date().toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  const displayCompany = company?.name || tenantName || 'Mi empresa'

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner / Header Greeting */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-zinc-400 capitalize">{today}</p>
          <h1 className="mt-1 text-2xl md:text-3xl font-extrabold tracking-tight text-zinc-950">{displayCompany}</h1>
          <p className="mt-1 text-xs md:text-sm text-zinc-500">Gestiona los usuarios, aplicaciones, suscripciones y soporte de tu empresa desde un solo lugar.</p>
        </div>
        <div className="hidden lg:block text-right">
          <p className="text-xs italic text-zinc-400 font-serif">“Tecnología para negocios que avanzan.”</p>
        </div>
      </div>

      {/* Cuenta sin marca asignada: aviso honesto, sin datos de ejemplo. */}
      {!tenantId && (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">
          <HubIcon icon={HelpCircle} size={16} className="w-4 h-4 mt-0.5 shrink-0" />
          <p>
            Tu cuenta aún no está vinculada a una empresa. La administración de la plataforma
            debe asignar tu marca para activar las secciones del panel.
          </p>
        </div>
      )}

      {/* KPIs (misma tarjeta visual que el resumen global) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-zinc-200/80 shadow-xs">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0"><HubIcon icon={Building2} size={16} className="w-4 h-4" /></span>
            <span className="text-xs font-bold text-zinc-500">Código de empresa</span>
          </div>
          <div className="text-2xl font-extrabold text-zinc-950">{loading ? '—' : (company?.client_code || '—')}</div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-zinc-200/80 shadow-xs">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0"><HubIcon icon={LayoutGrid} size={16} className="w-4 h-4" /></span>
            <span className="text-xs font-bold text-zinc-500">Aplicaciones contratadas</span>
          </div>
          <div className="text-2xl font-extrabold text-zinc-950">{loading ? '—' : subs.length}</div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-zinc-200/80 shadow-xs">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-8 h-8 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center shrink-0"><HubIcon icon={Zap} size={16} className="w-4 h-4" /></span>
            <span className="text-xs font-bold text-zinc-500">Aplicaciones activas</span>
          </div>
          <div className="text-2xl font-extrabold text-zinc-950">{loading ? '—' : activeApps.length}</div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-zinc-200/80 shadow-xs">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0"><HubIcon icon={CreditCard} size={16} className="w-4 h-4" /></span>
            <span className="text-xs font-bold text-zinc-500">Plan contratado</span>
          </div>
          <div className="text-xl font-extrabold text-zinc-950 capitalize truncate">{loading ? '—' : (plans[0] ? plans.join(', ') : '—')}</div>
        </div>
      </div>

      {/* Row 2: Apps contratadas + Acciones rápidas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-zinc-200/80 shadow-xs overflow-hidden">
          <div className="border-b border-zinc-100 px-5 py-5">
            <h2 className="text-base font-bold">Aplicaciones contratadas</h2>
            <p className="mt-1 text-xs text-zinc-500">Estado de tus apps y el plan de cada una.</p>
          </div>
          {subs.length === 0 ? (
            <div className="px-5 py-8 text-center">
              <p className="text-sm font-semibold text-zinc-600">{loading ? 'Cargando aplicaciones…' : 'Aún no tienes aplicaciones contratadas.'}</p>
              <button type="button" onClick={() => setActiveTab('Aplicaciones')} className="mt-4 h-10 px-5 rounded-xl bg-[#ff4b0b] text-white text-sm font-bold transition hover:bg-[#e94308]">Ver aplicaciones disponibles</button>
            </div>
          ) : (
            <div className="divide-y divide-zinc-50 px-5">
              {subs.map((sub) => {
                const [label, classes] = statusMeta[sub.status] || [sub.status, 'bg-zinc-100 text-zinc-600']
                return (
                  <div key={sub.app_id} className="flex items-center justify-between py-3.5">
                    <div className="flex items-center gap-3">
                      <span className="w-9 h-9 rounded-xl bg-zinc-100 text-zinc-600 flex items-center justify-center shrink-0"><HubIcon icon={LayoutGrid} size={16} className="w-4 h-4" /></span>
                      <div>
                        <p className="text-sm font-bold text-zinc-900">{appNames[sub.app_id] || 'Aplicación'}</p>
                        <p className="text-[11px] text-zinc-500 capitalize">Plan {sub.plan || '—'}</p>
                      </div>
                    </div>
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ${classes}`}>{label}</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Acciones rápidas */}
        <div className="bg-white rounded-2xl border border-zinc-200/80 shadow-xs p-5">
          <h2 className="text-base font-bold">Acciones rápidas</h2>
          <p className="mt-1 text-xs text-zinc-500">Atajos a las secciones de tu panel.</p>
          <div className="mt-4 flex flex-col gap-2">
            {[
              ['Usuarios', Users, 'Administra el equipo de tu empresa'],
              ['Aplicaciones', LayoutGrid, 'Revisa tus apps contratadas'],
              ['Suscripciones', Clock, 'Estado y renovaciones'],
              ['Soporte', HelpCircle, 'Tickets y ayuda'],
            ].map(([tab, Icon, desc]) => (
              <button key={tab} type="button" onClick={() => setActiveTab(tab)} className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-left transition-colors hover:border-zinc-300 hover:bg-white">
                <span className="w-8 h-8 rounded-lg bg-white border border-zinc-200 text-zinc-600 flex items-center justify-center shrink-0"><HubIcon icon={Icon} size={15} className="w-3.5 h-3.5" /></span>
                <span className="min-w-0">
                  <span className="block text-xs font-bold text-zinc-900">{tab}</span>
                  <span className="block text-[11px] text-zinc-500 truncate">{desc}</span>
                </span>
                <HubIcon icon={ArrowRight} size={14} className="w-3.5 h-3.5 ml-auto text-zinc-400" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function timeAgo(iso) {
  if (!iso) return '—'
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return '—'
  const seconds = Math.round((Date.now() - date.getTime()) / 1000)
  if (seconds < 45) return 'hace un momento'
  if (seconds < 3600) return `hace ${Math.round(seconds / 60)} min`
  const hours = Math.round(seconds / 3600)
  if (hours < 24) return `hace ${hours} h`
  const days = Math.round(hours / 24)
  if (days < 30) return `hace ${days} d`
  return date.toLocaleDateString('es-PE', { day: 'numeric', month: 'short' })
}

function ecosystemIcon(slug) {
  const s = String(slug || '').toLowerCase()
  if (s.includes('crm') || s.includes('waba')) return MessageSquare
  if (s.includes('agenda') || s.includes('cita')) return Calendar
  if (s.includes('invent')) return Package
  if (s.includes('marketing') || s.includes('instagram')) return Instagram
  if (s.includes('automat')) return Zap
  if (s.includes('creaci') || s.includes('contenido') || s.includes('creador')) return Sparkles
  if (s.includes('analit') || s.includes('reporte')) return BarChart3
  if (s.includes('pago') || s.includes('checkout') || s.includes('cobro')) return CreditCard
  if (s.includes('blog')) return PenSquare
  return LayoutGrid
}

const ECOSYSTEM_TONES = [
  'bg-[#ff4b0b]', 'bg-indigo-600', 'bg-orange-500',
  'bg-gradient-to-tr from-purple-600 to-pink-500', 'bg-zinc-900',
  'bg-purple-600', 'bg-blue-600', 'bg-blue-500',
]

function SuperAdminDashboard({ setActiveTab, navigate }) {
  const [live, setLive] = useState(null)

  // Datos globales reales (plataforma = is_admin). Consultas guardadas:
  // si algo falla se muestra "—", nunca se inventan cifras.
  useEffect(() => {
    let alive = true
    ;(async () => {
      let data = { tenants: [], users: [], subs: [], apps: [], pays: [], roles: [] }
      try {
        const [t, u, s, a, p, r] = await Promise.all([
          supabase.from('tenants').select('id, name, status, deleted_at, created_at'),
          supabase.from('users').select('id, full_name, email, created_at'),
          supabase.from('tenant_app_subscriptions').select('tenant_id, app_id, plan, status'),
          supabase.from('app_catalog').select('id, name, slug'),
          supabase.from('payments').select('amount, created_at, status'),
          supabase.from('user_app_roles').select('app_id'),
        ])
        data = {
          tenants: t.data || [],
          users: u.data || [],
          subs: s.data || [],
          apps: a.data || [],
          pays: p.data || [],
          roles: r.data || [],
        }
      } catch {
        data = { tenants: [], users: [], subs: [], apps: [], pays: [], roles: [] }
      }
      if (!alive) return

      const activeTenants = data.tenants.filter((x) => String(x.status) === 'active' && !x.deleted_at).length
      const activeSubs = data.subs.filter((x) => String(x.status) === 'active')
      const activeApps = new Set(activeSubs.map((x) => x.app_id)).size
      const earned = data.pays.filter((x) => x.status === 'completed' || x.status === 'paid')
      const revenue = earned.reduce((acc, p) => acc + (Number(p.amount) || 0), 0)
      const revFmt = new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN', maximumFractionDigits: 0 })

      // Donut por plan (desde suscripciones activas reales).
      const planCounts = { Premium: 0, Intermedio: 0, Básico: 0, 'Sin plan': 0 }
      activeSubs.forEach((x) => {
        const plan = String(x.plan || '').toLowerCase().trim()
        if (plan.includes('premi')) planCounts.Premium += 1
        else if (plan.includes('inter')) planCounts.Intermedio += 1
        else planCounts.Básico += 1
      })
      const withSub = new Set(activeSubs.map((x) => x.tenant_id))
      data.tenants.forEach((x) => { if (!withSub.has(x.id)) planCounts['Sin plan'] += 1 })
      const planTotal = Math.max(data.tenants.length, 1)
      const planColors = { Premium: '#f97316', Intermedio: '#3b82f6', Básico: '#eab308', 'Sin plan': '#d4d4d8' }
      let cursor = 0
      const donut = Object.keys(planCounts).map((label) => {
        const from = (cursor / planTotal) * 360
        cursor += planCounts[label]
        return planCounts[label] ? `${planColors[label]} ${from}deg ${(cursor / planTotal) * 360}deg` : null
      }).filter(Boolean)

      // Ingresos por mes (últimos 9 meses) para el gráfico.
      const monthSum = new Map()
      earned.forEach((p) => {
        const d = new Date(p.created_at)
        if (Number.isNaN(d.getTime())) return
        const key = `${d.getFullYear()}-${d.getMonth()}`
        monthSum.set(key, (monthSum.get(key) || 0) + (Number(p.amount) || 0))
      })
      const now = new Date()
      const months = []
      for (let i = 8; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
        months.push({
          month: d.toLocaleDateString('es-PE', { month: 'short' }),
          val: monthSum.get(`${d.getFullYear()}-${d.getMonth()}`) || 0,
        })
      }
      const hasRevenue = months.some((m) => m.val > 0)
      const maxVal = Math.max(...months.map((m) => m.val), 1)
      const bars = months.map((m) => ({ ...m, height: `${Math.round((m.val / maxVal) * 100)}%`, label: revFmt.format(m.val) }))

      // Ecosistema: apps reales (top 8 por suscripciones activas).
      const rolesByApp = {}
      data.roles.forEach((r) => { rolesByApp[r.app_id] = (rolesByApp[r.app_id] || 0) + 1 })
      const ecosystem = data.apps.map((a, i) => ({
        title: a.name || a.slug || 'Aplicación',
        slug: a.slug || '',
        active: activeSubs.filter((x) => x.app_id === a.id).length,
        users: rolesByApp[a.id] || 0,
        tone: ECOSYSTEM_TONES[i % ECOSYSTEM_TONES.length],
        path: a.slug ? `/hub/${a.slug}` : '/hub',
      })).sort((x, y) => y.active - x.active).slice(0, 8)

      // Actividad reciente real (tenants y usuarios más nuevos).
      const recent = [
        ...data.tenants.map((x) => ({ title: 'Nueva empresa registrada', detail: x.name || '—', time: x.created_at, color: 'text-blue-500 bg-blue-50' })),
        ...data.users.map((x) => ({ title: 'Nuevo usuario registrado', detail: x.full_name || x.email || '—', time: x.created_at, color: 'text-orange-500 bg-orange-50' })),
      ].filter((x) => x.time).sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 5)

      if (alive) setLive({
        activeTenants, totalUsers: data.users.length, activeApps, revenue, revFmt,
        planCounts, planTotal, donut, bars, hasRevenue, ecosystem, recent,
      })
    })()
    return () => { alive = false }
  }, [])

  const today = new Date().toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  const money = live ? (live.revenue > 0 ? live.revFmt.format(live.revenue) : 'S/ 0') : '—'

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner / Header Greeting */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-zinc-400 capitalize">{today}</p>
          <h1 className="mt-1 text-2xl md:text-3xl font-extrabold tracking-tight text-zinc-950">Super Administrador</h1>
          <p className="mt-1 text-xs md:text-sm text-zinc-500">Gestiona empresas, usuarios, aplicaciones y el crecimiento de Qaway Lab desde un solo lugar.</p>
        </div>
        <div className="hidden lg:block text-right">
          <p className="text-xs italic text-zinc-400 font-serif">“Tecnología para negocios que avanzan.”</p>
        </div>
      </div>

      {/* Row 1: 4 KPI Cards (datos reales, sin cifras inventadas) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Empresas Activas */}
        <div className="bg-white rounded-2xl p-5 border border-zinc-200/80 shadow-xs flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <HubIcon icon={Building2} size={16} className="w-4 h-4" />
              </span>
              <span className="text-xs font-bold text-zinc-500">Empresas activas</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-zinc-950">{live ? live.activeTenants : '—'}</span>
            </div>
          </div>
          <div className="w-16 h-8 opacity-80">
            <svg className="w-full h-full" viewBox="0 0 60 30" fill="none">
              <path d="M0 25 C15 20, 30 22, 45 15 L60 18" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* KPI 2: Usuarios Totales */}
        <div className="bg-white rounded-2xl p-5 border border-zinc-200/80 shadow-xs flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-8 h-8 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
                <HubIcon icon={Users} size={16} className="w-4 h-4" />
              </span>
              <span className="text-xs font-bold text-zinc-500">Usuarios totales</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-zinc-950">{live ? live.totalUsers : '—'}</span>
            </div>
          </div>
          <div className="w-16 h-8 opacity-80">
            <svg className="w-full h-full" viewBox="0 0 60 30" fill="none">
              <path d="M0 22 C15 25, 30 18, 45 12 L60 10" stroke="#f97316" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* KPI 3: Aplicaciones Activas */}
        <div className="bg-white rounded-2xl p-5 border border-zinc-200/80 shadow-xs flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                <HubIcon icon={LayoutGrid} size={16} className="w-4 h-4" />
              </span>
              <span className="text-xs font-bold text-zinc-500">Aplicaciones activas</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-zinc-950">{live ? live.activeApps : '—'}</span>
            </div>
          </div>
          <div className="w-16 h-8 opacity-80">
            <svg className="w-full h-full" viewBox="0 0 60 30" fill="none">
              <path d="M0 26 C15 20, 30 24, 45 14 L60 12" stroke="#a855f7" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* KPI 4: Ingresos */}
        <div className="bg-white rounded-2xl p-5 border border-zinc-200/80 shadow-xs flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <HubIcon icon={CreditCard} size={16} className="w-4 h-4" />
              </span>
              <span className="text-xs font-bold text-zinc-500">Ingresos</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-zinc-950">{money}</span>
            </div>
          </div>
          <div className="w-16 h-8 opacity-80">
            <svg className="w-full h-full" viewBox="0 0 60 30" fill="none">
              <path d="M0 24 C15 22, 30 15, 45 10 L60 5" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>
        </div>
      </div>

      {/* Row 2: Analytics & Actions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Charts */}
        <div className="lg:col-span-2 space-y-6">
          {/* Revenue Chart */}
          <div className="bg-white rounded-2xl p-6 border border-zinc-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-base font-bold text-zinc-950">Crecimiento de ingresos</h3>
                <p className="text-xs text-zinc-500 mt-0.5">Pagos completados por mes</p>
              </div>
              <span className="text-xs font-semibold bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-1.5 text-zinc-700">Últimos 9 meses</span>
            </div>
            {live && live.hasRevenue ? (
              <div className="h-48 flex items-end justify-between gap-1.5 pt-4 px-2">
                {live.bars.map((b, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center h-full justify-end group relative">
                    <div className="absolute -top-7 opacity-0 group-hover:opacity-100 transition-opacity bg-zinc-900 text-white text-[10px] font-mono px-2 py-0.5 rounded-md whitespace-nowrap z-10">
                      {b.label}
                    </div>
                    <div className="w-full bg-gradient-to-t from-[#ff4b0b] to-[#ff7a45] rounded-t-lg transition-all duration-300 group-hover:brightness-110" style={{ height: b.height }} />
                    <span className="text-[11px] font-medium text-zinc-400 mt-2">{b.month}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-48 flex items-center justify-center rounded-xl bg-zinc-50/70 border border-dashed border-zinc-200">
                <p className="text-xs text-zinc-400 font-medium">{live ? 'Sin ingresos registrados todavía.' : 'Cargando…'}</p>
              </div>
            )}
          </div>

          {/* Companies by Plan Donut Chart */}
          <div className="bg-white rounded-2xl p-6 border border-zinc-200/80 shadow-xs">
            <h3 className="text-base font-bold text-zinc-950 mb-4">Empresas por plan</h3>
            <div className="flex flex-col sm:flex-row items-center justify-around gap-6">
              <div className="relative w-40 h-40 flex items-center justify-center shrink-0">
                <div className="w-40 h-40 rounded-full" style={{ background: live && live.donut.length ? `conic-gradient(${live.donut.join(', ')})` : 'conic-gradient(#e4e4e7 0deg 360deg)' }} />
                <div className="absolute w-[72%] h-[72%] bg-white rounded-full flex items-center justify-center">
                  <div className="text-center">
                    <span className="block text-[10px] text-zinc-400 font-medium">Total</span>
                    <span className="block text-lg font-extrabold text-zinc-950">{live ? live.planTotal : '—'}</span>
                    <span className="block text-[9px] text-zinc-400">empresas</span>
                  </div>
                </div>
              </div>
              <div className="space-y-3 w-full sm:w-auto">
                {(live ? Object.entries(live.planCounts) : []).map(([label, count]) => {
                  const pct = live ? Math.round((count / live.planTotal) * 100) : 0
                  const color = label === 'Premium' ? '#f97316' : label === 'Intermedio' ? '#3b82f6' : label === 'Básico' ? '#eab308' : '#d4d4d8'
                  return (
                    <div key={label} className="flex items-center justify-between sm:justify-start gap-4 text-xs font-semibold">
                      <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full" style={{ background: color }} /><span className="text-zinc-700">{label}</span></div>
                      <span className="text-zinc-500">{live ? count : '—'} <span className="text-zinc-400">({pct}%)</span></span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (1 Col): Quick Actions, Activity & Notes */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-5 border border-zinc-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-zinc-950">Acciones rápidas</h3>
              <button className="w-6 h-6 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-600 flex items-center justify-center transition-colors">
                <HubIcon icon={Plus} size={14} className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="space-y-2">
              {[
                { icon: Building2, title: 'Crear nueva empresa', to: '/hub/bienvenida' },
                { icon: UserPlus, title: 'Invitar usuario', to: '/hub/invitar' },
                { icon: Tag, title: 'Gestionar planes', tab: 'Planes' },
                { icon: CreditCard, title: 'Ver suscripciones', tab: 'Suscripciones' },
                { icon: BarChart3, title: 'Generar reporte', tab: 'Reportes' },
              ].map((act, i) => (
                <button key={i} onClick={() => (act.to ? navigate(act.to) : setActiveTab(act.tab))} className="w-full flex items-center gap-3 p-2.5 rounded-xl border border-zinc-100 bg-zinc-50/50 hover:bg-zinc-100/80 text-left transition-colors text-xs font-semibold text-zinc-800 group">
                  <span className="w-7 h-7 rounded-lg bg-white border border-zinc-200/60 flex items-center justify-center text-zinc-600 group-hover:text-zinc-950 transition-colors shadow-2xs">
                    <HubIcon icon={act.icon} size={14} className="w-3.5 h-3.5" />
                  </span>
                  <span>{act.title}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-zinc-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-zinc-950">Actividad reciente</h3>
              <button className="text-[11px] font-bold text-zinc-500 hover:text-zinc-950 transition-colors flex items-center gap-0.5">
                Ver todo <HubIcon icon={ArrowRight} size={12} className="w-3 h-3" />
              </button>
            </div>
            <div className="space-y-3">
              {(live ? live.recent : []).map((act, i) => (
                <div key={i} className="flex items-start gap-3 text-xs">
                  <span className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${act.color}`}>
                    <HubIcon icon={act.title.includes('empresa') ? Building2 : User} size={13} className="w-3.5 h-3.5" />
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-zinc-900 truncate">{act.title}</p>
                    <p className="text-zinc-500 text-[11px] truncate">{act.detail}</p>
                  </div>
                  <span className="text-[10px] text-zinc-400 whitespace-nowrap">{timeAgo(act.time)}</span>
                </div>
              ))}
              {live && live.recent.length === 0 && (
                <p className="text-xs text-zinc-400 py-2">Sin actividad registrada todavía.</p>
              )}
            </div>
          </div>

          <div className="bg-amber-50/60 rounded-2xl p-5 border border-amber-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                📝 Notas del administrador
              </span>
              <button className="text-amber-700 hover:text-amber-950 p-1 rounded-md transition-colors">
                <HubIcon icon={PenSquare} size={13} className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-xs text-amber-800/90 leading-relaxed font-medium">
              Revisar renovaciones de planes este mes. Preparar reporte trimestral para dirección.
            </p>
          </div>
        </div>
      </div>

      {/* Row 3: Ecosystem Applications Grid */}
      <div className="bg-white rounded-2xl p-6 border border-zinc-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <h3 className="text-base font-bold text-zinc-950">Aplicaciones del ecosistema</h3>
            <p className="text-xs text-zinc-500 mt-0.5">Estado general de las aplicaciones en todas las empresas.</p>
          </div>
          <button onClick={() => setActiveTab('Aplicaciones')} className="text-xs font-bold text-zinc-700 hover:text-zinc-950 transition-colors flex items-center gap-1 self-start sm:self-auto">
            Gestionar aplicaciones <HubIcon icon={ArrowRight} size={14} className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {(live ? live.ecosystem : []).map((app, i) => (
            <div key={i} className="rounded-xl border border-zinc-200/80 p-4 bg-zinc-50/30 flex flex-col justify-between hover:border-zinc-300 transition-all group">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className={`w-9 h-9 rounded-xl ${app.tone} text-white flex items-center justify-center shadow-xs`}>
                    <HubIcon icon={ecosystemIcon(app.slug)} size={18} className="w-4.5 h-4.5" />
                  </span>
                  {app.active > 0 ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Activo
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-zinc-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-zinc-300" />
                      Sin activos
                    </span>
                  )}
                </div>
                <h4 className="text-xs font-bold text-zinc-950 group-hover:text-[#ff4b0b] transition-colors">{app.title}</h4>
                <p className="text-[11px] text-zinc-500 mt-1">{app.active} {app.active === 1 ? 'empresa activa' : 'empresas activas'}</p>
                <p className="text-[10px] text-zinc-400">{app.users} usuarios</p>
              </div>
              <Link to={app.path} className="mt-4 inline-flex items-center gap-1 text-[11px] font-bold text-zinc-700 hover:text-zinc-950 transition-colors">
                Ver detalles <HubIcon icon={ArrowRight} size={12} className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          ))}
          {live && live.ecosystem.length === 0 && (
            <p className="text-xs text-zinc-400 col-span-full py-2">Sin aplicaciones en el catálogo todavía.</p>
          )}
        </div>
      </div>
    </div>
  )
}

function RestrictedCard({ tabLabel }) {
  return (
    <div className="rounded-2xl border border-zinc-200/80 bg-white p-10 text-center">
      <div className="mx-auto grid h-11 w-11 place-items-center rounded-full bg-zinc-100 text-zinc-500">
        <HubIcon icon={Shield} size={18} className="w-4.5 h-4.5" />
      </div>
      <p className="mt-3 text-sm font-extrabold text-zinc-900">Acceso restringido</p>
      <p className="mt-1 text-xs text-zinc-500">
        {tabLabel} es una sección administrativa. Solicita acceso a tu administrador para poder verla.
      </p>
    </div>
  )
}

const WORKER_ROLE_LABEL = {
  platform_admin: 'Super Administrador',
  admin: 'Administrador',
  editor: 'Editor',
  viewer: 'Visor',
  guest: 'Invitado',
}

const WORKER_APP_ROUTES = {
  crm: '/hub/crm',
  inventario: '/hub/inventario',
  agenda: '/hub/agenda',
  blog: '/hub/blog-editor',
}

function appWorkerRoute(slug) {
  return WORKER_APP_ROUTES[slug] || '/hub'
}

// Inicio del trabajador (editor/viewer/guest): "Mi espacio", sin datos
// administrativos de la empresa. Solo sus apps asignadas (user_app_roles
// propias, RLS uar_own_read) y los accesos que su administrador le otorgó.
function WorkerHome({ panelAuth, name, avatar }) {
  const [apps, setApps] = useState(null) // null = cargando

  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        const [{ data: mine }, { data: catalog }] = await Promise.all([
          supabase.from('user_app_roles').select('app_id, role'),
          supabase.from('app_catalog').select('id, name, slug'),
        ])
        const byId = Object.fromEntries((catalog || []).map((a) => [a.id, a]))
        const rows = (mine || [])
          .filter((r) => byId[r.app_id])
          .map((r) => ({ title: byId[r.app_id].name, slug: byId[r.app_id].slug }))
          .sort((a, b) => a.title.localeCompare(b.title))
        if (alive) setApps(rows)
      } catch {
        if (alive) setApps([])
      }
    })()
    return () => { alive = false }
  }, [])

  const granted = (panelAuth?.permissions?.panel || [])
    .filter((s) => TENANT_ADMIN_NAV.some((n) => n.id === s) && !ADMIN_ONLY_NAV.has(s))
  const roleLabel = WORKER_ROLE_LABEL[panelAuth?.role] || panelAuth?.role || 'Usuario'
  const safeName = name || ''
  const initials = safeName.split(' ').filter(Boolean).slice(0, 2).map((x) => x[0]).join('').toUpperCase()

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-zinc-400 capitalize">
            {new Date().toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
          <h1 className="mt-1 text-2xl md:text-3xl font-extrabold tracking-tight text-zinc-950">Mi espacio</h1>
          <p className="mt-1 text-xs md:text-sm text-zinc-500">Bienvenido{name ? `, ${name}` : ''}. Aquí están las aplicaciones que tu administrador habilitó para ti.</p>
        </div>
        <div className="hidden lg:block text-right">
          <p className="text-xs italic text-zinc-400 font-serif">“Tecnología para negocios que avanzan.”</p>
        </div>
      </div>

      {/* Estado personal */}
      <div className="bg-white rounded-2xl p-5 border border-zinc-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <span className="relative flex w-10 h-10 shrink-0 items-center justify-center rounded-full bg-zinc-950 text-white font-extrabold text-xs overflow-hidden">
            {initials || '?'}
            {avatar && (
              <img key={avatar} src={avatar} alt="" onError={(e) => e.currentTarget.remove()} className="absolute inset-0 h-full w-full object-cover" />
            )}
          </span>
          <div>
            <p className="text-sm font-extrabold text-zinc-950">{name || 'Cargando…'}</p>
            <p className="text-xs text-zinc-500">{roleLabel}</p>
          </div>
        </div>
        <div className="sm:ml-auto grid grid-cols-2 gap-6 sm:flex sm:items-center text-center">
          <div>
            <p className="text-lg font-extrabold text-zinc-950">{panelAuth?.tenantName || '—'}</p>
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Empresa</p>
          </div>
          <div>
            <p className="text-lg font-extrabold text-zinc-950">{apps ? apps.length : '…'}</p>
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Apps asignadas</p>
          </div>
        </div>
      </div>

      {/* Mis aplicaciones */}
      <div>
        <div className="mb-3">
          <h3 className="text-base font-bold text-zinc-950">Mis aplicaciones</h3>
          <p className="text-xs text-zinc-500 mt-0.5">Solo las apps donde tienes acceso asignado.</p>
        </div>
        {apps ? (
          apps.length ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {apps.map((app, i) => (
                <Link key={app.slug} to={appWorkerRoute(app.slug)} className="group block">
                  <div className="rounded-xl border border-zinc-200/80 p-4 bg-zinc-50/30 flex flex-col justify-between hover:border-zinc-300 transition-all h-full">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className={`w-9 h-9 rounded-xl ${ECOSYSTEM_TONES[i % ECOSYSTEM_TONES.length]} text-white flex items-center justify-center shadow-xs`}>
                          <HubIcon icon={ecosystemIcon(app.slug)} size={18} className="w-4.5 h-4.5" />
                        </span>
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          Activo
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-zinc-950 group-hover:text-[#ff4b0b] transition-colors">{app.title}</h4>
                    </div>
                    <span className="mt-4 inline-flex items-center gap-1 text-[11px] font-bold text-zinc-700 hover:text-zinc-950 transition-colors">
                      Abrir <HubIcon icon={ArrowRight} size={12} className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-zinc-200 bg-white/60 p-8 text-center">
              <p className="text-xs text-zinc-500">
                Tu administrador aún no te ha asignado aplicaciones. Cuando lo haga aparecerán aquí.
              </p>
            </div>
          )
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-32 animate-pulse rounded-xl border border-zinc-200/80 bg-zinc-100" />
            ))}
          </div>
        )}
      </div>

      {/* Accesos adicionales otorgados por el administrador */}
      {granted.length > 0 && (
        <div className="bg-white rounded-2xl p-5 border border-zinc-200/80 shadow-xs">
          <h3 className="text-sm font-bold text-zinc-950 mb-3">Accesos adicionales</h3>
          <div className="flex flex-wrap gap-2">
            {granted.map((id) => {
              const nav = TENANT_ADMIN_NAV.find((n) => n.id === id)
              return (
                <Link key={id} to={`/hub/panel/${PANEL_SLUGS[id] || ''}`} className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs font-bold text-zinc-800 hover:border-zinc-300 hover:bg-white transition-colors">
                  <HubIcon icon={nav.icon} size={14} className="w-3.5 h-3.5" />
                  {nav.label}
                </Link>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

function HubPanelContent() {
  const navigate = useNavigate()
  const location = useLocation()
  const [activeTab, setActiveTab] = useState(() => {
    const seg = (location.pathname.split('/').filter(Boolean).pop() || '').toLowerCase()
    if (!seg || seg === 'panel') return 'Inicio'
    return PANEL_TABS[seg] || 'Inicio'
  })
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [isWaffleOpen, setIsWaffleOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  // Tema del shell del Hub: 'claro' | 'contraste' (actual) | 'oscuro'. Persistido localmente.
  const [themeMode, setThemeMode] = useState(() => localStorage.getItem('qaway.hubTheme') || 'contraste')
  useEffect(() => {
    localStorage.setItem('qaway.hubTheme', themeMode)
    document.documentElement.style.colorScheme = themeMode === 'claro' ? 'light' : 'dark'
  }, [themeMode])
  // Selector de marca del super admin ("ver como"): entra contextualmente a cualquier tenant.
  // Solo para plataforma; el resto ve su marca como indicador estático.
  const [isTenantSwitcherOpen, setIsTenantSwitcherOpen] = useState(false)
  const [isBrandUsersOpen, setIsBrandUsersOpen] = useState(false) // píldora de marca: listado rápido del equipo
  const [brandUsers, setBrandUsers] = useState(null) // null = cargando; [] = sin invitados
  const [tenantOptions, setTenantOptions] = useState(null) // null = cargando, [] = sin marcas
  const [scopedTenant, setScopedTenant] = useState(() => {
    try {
      const raw = sessionStorage.getItem('qaway.scopedTenant')
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  })
  const [globalSearchQuery, setGlobalSearchQuery] = useState(
    () => new URLSearchParams(location.search).get('q') || '',
  )
  // Navegación con enlace: cada punto actualiza la ruta (push normal para que Atrás funcione).
  const goTab = (t) => {
    setActiveTab(t)
    const slug = PANEL_SLUGS[t]
    navigate(slug ? `/hub/panel/${slug}` : '/hub/panel')
  }
  // Atrás/Adelante del navegador: el tab sigue a la URL (el estado inicial solo corre al montar).
  useEffect(() => {
    const seg = (location.pathname.split('/').filter(Boolean).pop() || '').toLowerCase()
    const tab = !seg || seg === 'panel' ? 'Inicio' : (PANEL_TABS[seg] || 'Inicio')
    setActiveTab((prev) => (prev === tab ? prev : tab))
  }, [location.pathname])
  const searchInputRef = useRef(null)
  const { denied } = useAppAccess()
  // Contexto real (sesion + tenant) para las vistas que viven dentro del shell (30.X).
  const [panelAuth, setPanelAuth] = useState(null)
  useEffect(() => {
    let alive = true
    ;(async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session || !alive) return
      const { data: me } = await supabase.from('users').select('tenant_id, role, is_platform_admin, permissions, full_name, avatar_url, created_at').eq('id', session.user.id).single()
      if (!alive) return
      const metaIsPlatform = session.user.app_metadata?.role === 'platform_admin' || session.user.user_metadata?.role === 'platform_admin'
      const dbIsPlatform = me?.role === 'admin' && me?.is_platform_admin === true
      const isPlatformAdmin = dbIsPlatform || metaIsPlatform
      const role = isPlatformAdmin ? 'platform_admin' : (me?.role || 'user')
      // Admin de marca = rol 'admin' con tenant (dueño o co-admin) o plataforma.
      const isTenantAdmin = isPlatformAdmin || (me?.role === 'admin' && Boolean(me?.tenant_id))
      if (!isPlatformAdmin && !me?.tenant_id) {
        navigate('/onboarding/tu-empresa', { replace: true })
        return
      }
      let tenantName = null
      if (me?.tenant_id) {
        const { data: tenant } = await supabase.from('tenants').select('name, status').eq('id', me.tenant_id).maybeSingle()
        tenantName = tenant?.name || null
        if (!isPlatformAdmin && tenant?.status === 'draft') {
          navigate('/onboarding/tu-hub', { replace: true })
          return
        }
      }
      if (alive) setPanelAuth({
        session,
        tenantId: me?.tenant_id || null,
        role,
        isPlatformAdmin,
        isTenantAdmin,
        tenantName,
        permissions: me?.permissions || {},
        fullName: me?.full_name || null,
        avatarUrl: me?.avatar_url || null,
        createdAt: me?.created_at || null,
      })
    })()
    return () => { alive = false }
  }, [])

  // Identidad para mostrar (nombre/email/foto): fuente única de verdad = sesión Supabase.
  // Mientras panelAuth no está resuelto, NO se deriva identidad legacy: estado neutro.
  const identityResolved = Boolean(panelAuth?.session?.user)
  const authUser = useMemo(() => {
    const u = panelAuth?.session?.user
    if (!u) return null
    return {
      id: u.id,
      email: u.email || null,
      role: panelAuth.role || null,
    }
  }, [panelAuth])

  // Sincronización de sesión multi-tab: si en el mismo perfil otro usuario inicia
  // sesión (o la cierra), este tab recarga/redirige para no mostrar datos del
  // usuario anterior ni quedarse con una sesión reemplazada.
  useEffect(() => {
    const currentUserId = () => panelAuth?.session?.user?.id
    const onHubPath = () => window.location.pathname.startsWith('/hub/panel')
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        sessionStorage.removeItem('qaway.scopedTenant')
        setScopedTenant(null)
        setPanelAuth(null)
        navigate('/login', { replace: true })
        return
      }
      // 'INITIAL_SESSION' se emite al suscribirse: no es un cambio de sesión real,
      // ignorarlo para no recargar la página en bucle en cada montaje.
      if (event === 'INITIAL_SESSION') return
      const sid = session?.user?.id
      const otherUser = sid && sid !== currentUserId()
      if (otherUser && onHubPath()) {
        window.location.reload()
      }
    })
    const onStorage = (e) => {
      if (!e.key || !e.key.includes('-auth-token')) return
      if (e.newValue !== e.oldValue && onHubPath()) {
        window.location.reload()
      }
    }
    window.addEventListener('storage', onStorage)
    return () => {
      sub?.subscription?.unsubscribe()
      window.removeEventListener('storage', onStorage)
    }
  }, [panelAuth, navigate])

  // Rol resuelto (BD = fuente de verdad; mientras panelAuth carga NO se asume ningún rol):
  //   platform_admin → nav global; admin de marca (dueño o co-admin) → nav de empresa;
  //   trabajador (editor/viewer/guest) → Inicio "Mi espacio" + Aplicaciones + secciones otorgadas.
  const isPlatformAdmin = panelAuth ? panelAuth.isPlatformAdmin : false

  // Marcas para el selector (solo plataforma; RLS tenants_select_rls_scope lo permite).
  useEffect(() => {
    if (!panelAuth?.isPlatformAdmin) return
    let alive = true
    ;(async () => {
      const { data } = await supabase.from('tenants').select('id, name').order('name')
      if (alive) setTenantOptions(data || [])
    })()
    return () => { alive = false }
  }, [panelAuth])

  // Persistencia del contexto "ver como" entre recargas.
  useEffect(() => {
    if (scopedTenant) sessionStorage.setItem('qaway.scopedTenant', JSON.stringify(scopedTenant))
    else sessionStorage.removeItem('qaway.scopedTenant')
  }, [scopedTenant])

  // Contexto efectivo: la plataforma puede "ver como" cualquier marca (mismos módulos);
  // el resto de roles usa su propio tenant (RLS). scopedTenant solo aplica a plataforma.
  const actingAsBrand = isPlatformAdmin && Boolean(scopedTenant)
  const effectiveTenantId = panelAuth ? (actingAsBrand ? scopedTenant.id : panelAuth.tenantId) : null
  const effectiveTenantName = panelAuth ? (actingAsBrand ? scopedTenant.name : panelAuth.tenantName) : null
  const effectiveIsTenantAdmin = panelAuth ? (actingAsBrand || panelAuth.isTenantAdmin) : false

  // Píldora de marca (admin de empresa): usuarios de SU tenant, agrupados por rol (RLS lo limita a su marca).
  useEffect(() => {
    if (isPlatformAdmin || !panelAuth?.isTenantAdmin) { setBrandUsers(null); return }
    let alive = true
    setBrandUsers(null)
    ;(async () => {
      const { data } = await supabase
        .from('users')
        .select('id, full_name, email, avatar_url, role, created_at')
        .eq('tenant_id', effectiveTenantId)
        .order('created_at', { ascending: false })
      if (alive) setBrandUsers(data || [])
    })()
    return () => { alive = false }
  }, [panelAuth, isPlatformAdmin, effectiveTenantId])

  const navItems = useMemo(() => {
    if (!panelAuth) return []
    if (effectiveIsTenantAdmin) return TENANT_ADMIN_NAV
    if (panelAuth.isPlatformAdmin) return SUPER_ADMIN_NAV
    const granted = new Set(panelAuth.permissions?.panel || [])
    return [
      ...WORKER_BASE_NAV,
      ...TENANT_ADMIN_NAV.filter((nav) => granted.has(nav.id) && !ADMIN_ONLY_NAV.has(nav.id)),
    ]
  }, [panelAuth, effectiveIsTenantAdmin])

  // Guard por tab: una sección no permitida vuelve a Inicio (defensa en capas, sin backend).
  const allowedTabIds = useMemo(() => new Set(navItems.map((nav) => nav.id)), [navItems])
  useEffect(() => {
    if (!panelAuth) return
    if (!allowedTabIds.has(activeTab) && activeTab !== 'Todas') navigate('/hub/panel')
  }, [panelAuth, activeTab, navigate, allowedTabIds])

  const name = identityResolved ? (panelAuth?.fullName || displayName(authUser?.email)) : null
  // Foto estable por usuario: avatar subido (users.avatar_url) o foto de stock por cuenta.
  // Neutra (null) hasta que la identidad actual esté resuelta: nunca pinta avatar anterior.
  const avatar = identityResolved ? (panelAuth?.avatarUrl || avatarFor(authUser?.email, panelAuth?.isPlatformAdmin)) : null

  // ── Mi cuenta / perfil (30.X): persistencia SOLO de identidad personal ──
  // Alcance aprobado: nombre completo → users.full_name; foto → users.avatar_url vía
  // Storage. Email, 2FA, sesiones, preferencias, empresa/usuarios/apps NO se persisten aquí.
  const selfId = panelAuth?.session?.user?.id
  const memberSince = panelAuth?.createdAt
    ? new Date(panelAuth.createdAt).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })
    : null

  const updateSelf = async (fields) => {
    if (!selfId) return
    const { error } = await supabase.from('users').update(fields).eq('id', selfId)
    if (error) throw error
  }

  const handleSaveProfile = async (payload = {}) => {
    const fullName = String(payload?.fullName || '').trim()
    if (!fullName || !selfId) return
    try {
      await updateSelf({ full_name: fullName })
      setPanelAuth((p) => (p ? { ...p, fullName } : p))
    } catch (e) {
      console.error('Mi cuenta · guardar perfil:', e)
      window.alert('No se pudo guardar el nombre. Inténtalo de nuevo.')
    }
  }

  const handleUploadAvatar = async (file) => {
    try {
      if (!selfId) throw new Error('Tu sesión no está disponible.')
      const blob = await optimizeAvatar(file)
      const path = `avatars/${selfId}.webp`
      const { error: upErr } = await supabase.storage
        .from('avatars')
        .upload(path, blob, { upsert: true, contentType: 'image/webp', cacheControl: '3600' })
      if (upErr) throw new Error('No se pudo subir la foto. Verifica que exista el bucket "avatars" en Supabase Storage.')
      const { data: pub } = supabase.storage.from('avatars').getPublicUrl(path)
      await updateSelf({ avatar_url: pub.publicUrl })
      setPanelAuth((p) => (p ? { ...p, avatarUrl: pub.publicUrl } : p))
      return pub.publicUrl
    } catch (e) {
      console.error('Mi cuenta · subir foto:', e)
      window.alert(e?.message || 'No se pudo subir la foto. Inténtalo de nuevo.')
      return null
    }
  }

  const handleDeleteAvatar = async () => {
    if (!selfId) return
    try { await supabase.storage.from('avatars').remove([`avatars/${selfId}.webp`]) }
    catch (e) { console.error('Mi cuenta · borrar foto (storage):', e) }
    try {
      await updateSelf({ avatar_url: null })
      setPanelAuth((p) => (p ? { ...p, avatarUrl: null } : p))
    } catch (e) {
      console.error('Mi cuenta · limpiar foto:', e)
      window.alert('No se pudo quitar la foto. Inténtalo de nuevo.')
    }
  }

  const profileProps = useMemo(() => {
    if (!panelAuth) return null
    const roleLabel = panelAuth.isPlatformAdmin
      ? 'Super Administrador'
      : (panelAuth.isTenantAdmin ? 'Administrador de empresa' : 'Miembro del equipo')
    return {
      fullName: panelAuth.fullName || '',
      email: authUser?.email || '',
      roleLabel,
      tenantName: effectiveTenantName || '—',
      avatarUrl: panelAuth.avatarUrl || '',
      memberSince: memberSince || '—',
    }
  }, [panelAuth, authUser, effectiveTenantName, memberSince])

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); searchInputRef.current?.focus() }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const filtered = useMemo(() => {
    const activePillar = PILLARS.find((p) => p.label === activeTab)
    const q = globalSearchQuery.trim().toLowerCase()
    return ROUTES.filter((route) => {
      const okApp = !route.app || (denied && typeof denied.has === 'function' ? !denied.has(route.app) : true)
      const okQ = !q ||
        (route.title && route.title.toLowerCase().includes(q)) ||
        (route.description && route.description.toLowerCase().includes(q)) ||
        (route.category && route.category.toLowerCase().includes(q)) ||
        (route.badge && route.badge.toLowerCase().includes(q))
      const okPillar = q ? true : (!activePillar?.match || (route.pillar && route.pillar.includes(activePillar.match)))
      return okApp && okPillar && okQ
    })
  }, [globalSearchQuery, activeTab, denied])

  const handleLogout = async () => {
    sessionStorage.removeItem('qaway.scopedTenant')
    setScopedTenant(null)
    logoutUser()
    try { await supabase.auth.signOut() } catch (_) {}
    navigate('/login', { replace: true })
  }

  const currentTabLabel = (TENANT_ADMIN_NAV.find((nav) => nav.id === activeTab) || SUPER_ADMIN_NAV.find((nav) => nav.id === activeTab))?.label || activeTab

  return (
    <div data-mode={themeMode} className="hub-shell flex h-screen w-full bg-[var(--hub-bg)] overflow-hidden font-sans text-[var(--hub-text)] selection:bg-[#ff4b0b] selection:text-white">
      {/* ── LEFT SIDEBAR (Dark Shell) ───────────────────────────────── */}
      <aside className={`hub-chrome ${isSidebarCollapsed ? 'w-[72px]' : 'w-64'} shrink-0 flex flex-col border-r border-[var(--hub-border)] bg-[var(--hub-bg)] transition-all duration-300 ease-in-out`}>
        {/* LOGO */}
        <button onClick={() => goTab('Inicio')} className={`h-16 flex items-center ${isSidebarCollapsed ? 'justify-center' : 'px-6'} border-b border-[var(--hub-border)] shrink-0 cursor-pointer hover:bg-[var(--hub-chip)] transition-colors group w-full text-left`}>
          <div className="flex items-center gap-3">
            <span className="font-bold text-white tracking-wide text-lg leading-tight">
              {isSidebarCollapsed ? (
                <span className="text-[#ff4b0b]">Q</span>
              ) : (
                <div className="flex flex-col">
                  <span>Qaway <span className="text-[#ff4b0b]">Lab</span></span>
                  <span className="text-[10px] font-semibold text-zinc-400 tracking-wider">{!panelAuth ? 'Cargando…' : (actingAsBrand ? `Ver como ${scopedTenant.name}` : (isPlatformAdmin ? 'Super Administrador' : (panelAuth?.isTenantAdmin ? 'Administración de empresa' : 'Mi espacio')))}</span>
                </div>
              )}
            </span>
          </div>
        </button>

        {/* NAVIGATION (10 Modules) */}
        <nav className={`flex-1 py-4 ${isSidebarCollapsed ? 'px-2' : 'px-3'} flex flex-col gap-1 overflow-y-auto custom-scrollbar`}>
          {navItems.map((nav) => {
            const Icon = nav.icon
            const isActive = activeTab === nav.id
            return (
              <button
                key={nav.id}
                onClick={() => goTab(nav.id)}
                title={isSidebarCollapsed ? nav.label : ''}
                className={`flex items-center ${isSidebarCollapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2.5'} rounded-xl text-xs font-semibold transition-all w-full text-left ${isActive ? 'bg-[#ff4b0b] text-white shadow-lg shadow-[#ff4b0b]/20 font-bold' : 'text-white/65 hover:text-white hover:bg-[var(--hub-chip)]'}`}
              >
                <HubIcon icon={Icon} size={16} className="w-4 h-4 shrink-0" />
                {!isSidebarCollapsed && <span className="truncate">{nav.label}</span>}
              </button>
            )
          })}
        </nav>

        {/* BOTTOM HELP BOX */}
        {!isSidebarCollapsed && (
          <div className="p-3 border-t border-[var(--hub-border-soft)]">
            <div className="p-3.5 rounded-2xl bg-[var(--hub-chip)] border border-[var(--hub-border)] text-xs">
              <div className="flex items-center gap-2 text-orange-400 font-bold mb-1">
                <HubIcon icon={HelpCircle} size={14} className="w-3.5 h-3.5" />
                <span>¿Necesitas ayuda?</span>
              </div>
              <p className="text-zinc-400 text-[10px] leading-relaxed mb-2.5">Accede a la documentación o contacta al equipo.</p>
              <button className="w-full py-1.5 px-2.5 bg-[var(--hub-hover)] hover:bg-[var(--hub-hover-strong)] text-white text-[10px] font-bold rounded-xl transition-colors flex items-center justify-center gap-1">
                Centro de Ayuda <HubIcon icon={ArrowRight} size={12} className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}
      </aside>

      {/* ── RIGHT AREA ────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* HEADER TOPBAR */}
        <header className="hub-chrome h-[72px] border-b border-[var(--hub-border-soft)] flex items-center justify-between px-5 lg:px-6 shrink-0 bg-[var(--hub-bg)] relative z-50 shadow-sm">
          {/* Lado Izquierdo */}
          <div className="flex items-center gap-2 lg:gap-3">
            <button onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} className="p-2 rounded-full text-[var(--hub-text-soft)] hover:text-white hover:bg-[var(--hub-hover)] transition-colors" title={isSidebarCollapsed ? "Expandir menú" : "Contraer menú"}>
              <HubIcon icon={Menu} size={20} className="w-5 h-5 lg:w-[22px] lg:h-[22px]" />
            </button>
            
            {/* Tenant Global Switcher Pill: plataforma elige la marca ("ver como");
                el resto de roles la ve como indicador estático de su marca. */}
            <div className="relative">
              {isPlatformAdmin ? (
                <>
                  <button
                    type="button"
                    onClick={() => setIsTenantSwitcherOpen((o) => !o)}
                    className="flex items-center gap-2 h-9 px-3 rounded-full border border-[var(--hub-border)] bg-[var(--hub-chip)] hover:bg-[var(--hub-hover)] text-white text-xs font-bold transition-all cursor-pointer"
                    title="Seleccionar marca (ver como)"
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="max-w-40 truncate">{scopedTenant ? scopedTenant.name : 'Qaway Lab (Global)'}</span>
                    <HubIcon icon={ChevronDown} size={14} className={`w-3.5 h-3.5 text-[var(--hub-dim)] transition-transform duration-200 ${isTenantSwitcherOpen ? 'rotate-180 text-white' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {isTenantSwitcherOpen && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setIsTenantSwitcherOpen(false)} aria-label="Cerrar selector" />
                        <motion.div
                          initial={{ opacity: 0, y: 6, scale: 0.97 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 6, scale: 0.97 }}
                          transition={{ duration: 0.15, ease: 'easeOut' }}
                          className="absolute left-0 top-[calc(100%+8px)] w-72 rounded-2xl bg-[var(--hub-surface)] border border-[var(--hub-border)] shadow-[0_20px_60px_rgba(0,0,0,0.6)] z-[100] overflow-hidden"
                        >
                          <div className="p-4 border-b border-[var(--hub-border-soft)] bg-[var(--hub-chip)]">
                            <p className="text-xs font-extrabold text-white">Cambiar de marca</p>
                            <p className="text-[10px] text-[var(--hub-dim)] mt-0.5">Entra como administrador de esa empresa.</p>
                          </div>
                          <div className="p-2 max-h-64 overflow-y-auto">
                            {tenantOptions === null ? (
                              <div className="space-y-2 p-2">
                                {[0, 1, 2].map((i) => <div key={i} className="h-8 animate-pulse rounded-lg bg-[var(--hub-chip)]" />)}
                              </div>
                            ) : tenantOptions.length === 0 ? (
                              <p className="px-3 py-4 text-xs text-[var(--hub-faint)]">Sin marcas registradas.</p>
                            ) : (
                              tenantOptions.map((t) => (
                                <button
                                  key={t.id}
                                  type="button"
                                  onClick={() => {
                                    setScopedTenant({ id: t.id, name: t.name })
                                    setActiveTab('Inicio')
                                    setIsTenantSwitcherOpen(false)
                                  }}
                                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left text-xs font-bold transition-colors ${scopedTenant?.id === t.id ? 'bg-orange-500/15 text-orange-300' : 'text-[var(--hub-text-soft)] hover:bg-[var(--hub-chip)] hover:text-white'}`}
                                >
                                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${scopedTenant?.id === t.id ? 'bg-orange-400' : 'bg-white/20'}`} />
                                  <span className="truncate">{t.name}</span>
                                </button>
                              ))
                            )}
                          </div>
                          <div className="p-2 border-t border-[var(--hub-border-soft)] bg-[var(--hub-footer)]">
                            <button
                              type="button"
                              onClick={() => { setScopedTenant(null); setActiveTab('Inicio'); setIsTenantSwitcherOpen(false) }}
                              disabled={!scopedTenant}
                              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold transition-colors ${scopedTenant ? 'text-red-400 hover:bg-red-400/10' : 'text-[var(--hub-faint)] cursor-default'}`}
                            >
                              <HubIcon icon={LayoutGrid} size={14} className="w-3.5 h-3.5" />
                              Vista global (Qaway Lab)
                            </button>
                          </div>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </>
              ) : (effectiveIsTenantAdmin && !isPlatformAdmin) ? (
                <>
                  <button
                    type="button"
                    onClick={() => setIsBrandUsersOpen((o) => !o)}
                    className="flex items-center gap-2 h-9 px-3 rounded-full border border-[var(--hub-border)] bg-[var(--hub-chip)] hover:bg-[var(--hub-hover)] text-white text-xs font-bold transition-all cursor-pointer"
                    title="Tu empresa — equipo"
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="max-w-40 truncate">{panelAuth?.tenantName || 'Mi empresa'}</span>
                    <HubIcon icon={ChevronDown} size={14} className={`w-3.5 h-3.5 text-[var(--hub-dim)] transition-transform duration-200 ${isBrandUsersOpen ? 'rotate-180 text-white' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {isBrandUsersOpen && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setIsBrandUsersOpen(false)} aria-label="Cerrar equipo" />
                        <motion.div
                          initial={{ opacity: 0, y: 6, scale: 0.97 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 6, scale: 0.97 }}
                          transition={{ duration: 0.15, ease: 'easeOut' }}
                          className="absolute left-0 top-[calc(100%+8px)] w-80 rounded-2xl bg-[var(--hub-surface)] border border-[var(--hub-border)] shadow-[0_20px_60px_rgba(0,0,0,0.6)] z-[100] overflow-hidden"
                        >
                          <div className="p-4 border-b border-[var(--hub-border-soft)] bg-[var(--hub-chip)]">
                            <p className="text-xs font-extrabold text-white">{effectiveTenantName}</p>
                            <p className="text-[10px] text-[var(--hub-dim)] mt-0.5">Tu equipo · toca un miembro para gestionarlo.</p>
                          </div>
                          <div className="max-h-72 overflow-y-auto p-2">
                            {brandUsers === null ? (
                              <div className="space-y-2 p-2">
                                {[0, 1, 2].map((i) => <div key={i} className="h-8 animate-pulse rounded-lg bg-[var(--hub-chip)]" />)}
                              </div>
                            ) : brandUsers.length === 0 ? (
                              <p className="px-3 py-4 text-xs text-[var(--hub-faint)]">Aún no tienes invitados en la empresa.</p>
                            ) : (
                              BRAND_ROLE_GROUPS.map((group) => {
                                const groupUsers = brandUsers.filter((u) => (u.role || 'viewer') === group.key)
                                if (!groupUsers.length) return null
                                return (
                                  <div key={group.key} className="mb-1">
                                    <div className="flex items-center gap-1.5 px-3 pt-2 pb-1">
                                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${group.dot}`} />
                                      <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--hub-faint)]">{group.label} · {groupUsers.length}</p>
                                    </div>
                                    {groupUsers.map((u) => (
                                      <button
                                        key={u.id}
                                        type="button"
                                        onClick={() => {
                                          setIsBrandUsersOpen(false)
                                          navigate(`/hub/panel/usuarios?usuario=${u.id}`)
                                        }}
                                        className="group w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-colors hover:bg-[var(--hub-chip)]"
                                        title={`Gestionar a ${u.full_name || 'este usuario'}`}
                                      >
                                        {u.avatar_url ? (
                                          <img src={u.avatar_url} alt="" className="w-6 h-6 rounded-full border border-[var(--hub-border)] object-cover shrink-0" />
                                        ) : (
                                          <span className="w-6 h-6 rounded-full bg-[var(--hub-hover)] text-[var(--hub-text-soft)] flex items-center justify-center text-[10px] font-bold shrink-0 uppercase">{u.full_name ? u.full_name.slice(0, 2) : '?'}</span>
                                        )}
                                        <span className="flex-1 min-w-0">
                                          <span className="block text-xs font-bold text-[var(--hub-text)] truncate">{u.full_name || 'Sin nombre'}</span>
                                          <span className="block text-[10px] text-[var(--hub-dim)] truncate">{u.email || ''}</span>
                                        </span>
                                        <HubIcon icon={ChevronRight} size={14} className="w-3.5 h-3.5 text-[var(--hub-faint)] opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                                      </button>
                                    ))}
                                  </div>
                                )
                              })
                            )}
                          </div>
                          <div className="p-2 border-t border-[var(--hub-border-soft)] bg-[var(--hub-footer)]">
                            <button
                              type="button"
                              onClick={() => { setIsBrandUsersOpen(false); setActiveTab('Inicio'); navigate('/hub/panel') }}
                              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold text-[var(--hub-text-soft)] hover:bg-[var(--hub-hover)] hover:text-white transition-colors"
                            >
                              <HubIcon icon={Home} size={14} className="w-3.5 h-3.5" />
                              Volver a mi panel
                            </button>
                          </div>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </>
              ) : (
                <button type="button" className="flex items-center gap-2 h-9 px-3 rounded-full border border-[var(--hub-border)] bg-[var(--hub-chip)] text-white text-xs font-bold cursor-default" title="Tu marca">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="max-w-40 truncate">{panelAuth?.tenantName || 'Mi empresa'}</span>
                </button>
              )}
            </div>

            <div className="relative">
              <button type="button" onClick={() => setIsWaffleOpen(!isWaffleOpen)} className="group flex items-center gap-2 h-9 px-3 rounded-full border border-[var(--hub-border)] bg-[var(--hub-chip)] hover:bg-[var(--hub-hover)] hover:border-white/20 text-white/80 transition-all duration-300 ease-out cursor-pointer" title="Ecosistema de Aplicaciones">
                <div className="grid grid-cols-3 gap-[3px] w-3.5 h-3.5 place-items-center">
                  {[...Array(9)].map((_, i) => (<span key={i} className="w-[3px] h-[3px] rounded-full bg-white/70 group-hover:bg-[#ff4b0b] transition-colors" />))}
                </div>
                <span className="text-xs font-bold text-white max-w-0 overflow-hidden group-hover:max-w-16 transition-all duration-350 ease-out whitespace-nowrap">Apps</span>
                <HubIcon icon={ChevronDown} size={14} className="w-3.5 h-3.5 text-[var(--hub-faint)] group-hover:text-white/80 transition-transform duration-200" />
              </button>
              <AppSwitcherDropdown isOpen={isWaffleOpen} onClose={() => setIsWaffleOpen(false)} />
            </div>
          </div>

          {/* Search, Notifications & User Profile */}
          <div className="flex items-center gap-3 lg:gap-5 relative">
            <div className="relative block">
              <HubIcon icon={Search} size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[var(--hub-faint)]" />
              <input ref={searchInputRef} type="text" value={globalSearchQuery} onChange={(e) => setGlobalSearchQuery(e.target.value)} placeholder="Buscar empresas, usuarios, apps..."
                className="bg-[var(--hub-surface)] border border-[var(--hub-border)] rounded-full pl-10 pr-16 py-2 text-xs text-white placeholder:text-[var(--hub-faint)] focus:outline-none focus:border-[#ff4b0b]/50 focus:bg-[var(--hub-surface-strong)] w-[240px] md:w-[320px] lg:w-[400px] transition-all shadow-inner" />
              {globalSearchQuery ? (
                <button onClick={() => setGlobalSearchQuery('')} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--hub-dim)] hover:text-white transition-colors"><HubIcon icon={X} size={16} className="w-4 h-4" /></button>
              ) : (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-[var(--hub-hover)] rounded-md text-[var(--hub-dim)] border border-[var(--hub-border-soft)]">Ctrl</kbd>
                  <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-[var(--hub-hover)] rounded-md text-[var(--hub-dim)] border border-[var(--hub-border-soft)]">K</kbd>
                </div>
              )}
              <AnimatePresence>
                {globalSearchQuery.trim() !== '' && (
                  <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }} transition={{ duration: 0.15 }}
                    className="absolute top-[calc(100%+12px)] left-0 w-full bg-[var(--hub-pop)] border border-[var(--hub-border)] rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.6)] z-[100] overflow-hidden">
                    {filtered.length === 0 ? (
                      <div className="p-6 text-center"><p className="text-sm text-[var(--hub-dim)] font-medium">No se encontraron resultados para "{globalSearchQuery}"</p></div>
                    ) : (
                      <div className="flex flex-col">
                        <div className="px-4 py-3 border-b border-[var(--hub-border-soft)] bg-[var(--hub-chip)]"><span className="text-xs font-bold text-[var(--hub-dim)] uppercase tracking-wider">Resultados Rápidos</span></div>
                        <ul className="py-2">
                          {filtered.slice(0, 5).map(app => {
                            const Icon = app.icon
                            return (
                              <li key={app.path}>
                                <Link to={app.path} onClick={() => setGlobalSearchQuery('')} className="w-full px-4 py-3 hover:bg-[var(--hub-chip)] transition-colors flex items-center gap-4 text-left group">
                                  <div className="w-9 h-9 rounded-full bg-[#ff4b0b]/10 text-[#ff4b0b] font-bold text-[13px] flex items-center justify-center shrink-0 border border-[#ff4b0b]/20"><HubIcon icon={Icon} size={16} className="w-4 h-4" /></div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-white truncate group-hover:text-[#ff4b0b] transition-colors">{app.title}</p>
                                    <div className="flex items-center gap-2 text-xs text-[var(--hub-faint)] mt-1"><span className="truncate">{app.pillar}</span><span className="px-1.5 py-0.5 rounded-sm bg-[var(--hub-chip)] text-[var(--hub-dim)]">{app.badge || 'Pro'}</span></div>
                                  </div>
                                  <HubIcon icon={MessageSquare} size={20} className="w-5 h-5 text-[var(--hub-faint)] group-hover:text-[#ff4b0b] opacity-0 group-hover:opacity-100 transition-all shrink-0" />
                                </Link>
                              </li>
                            )
                          })}
                        </ul>
                        <div className="px-4 py-3 bg-[var(--hub-chip)] border-t border-[var(--hub-border-soft)] flex items-center justify-between text-xs text-[var(--hub-faint)]"><span>Saltar directo a la app</span><span>Esc para cerrar</span></div>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Notifications Bell */}
            <button className="relative p-2 text-[var(--hub-text-soft)] hover:text-white hover:bg-[var(--hub-hover)] rounded-full transition-colors cursor-pointer" title="Notificaciones (0)">
              <HubIcon icon={Bell} size={20} className="w-5 h-5 lg:w-[22px] lg:h-[22px]" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-[#ff4b0b] rounded-full ring-2 ring-[#111111]" />
            </button>

            {/* User Profile Dropdown: neutro hasta resolver identidad actual; jamás pinta identidad anterior */}
            <div className="relative z-[100] ml-1">
              <button onClick={() => setIsProfileOpen(!isProfileOpen)} className="flex items-center gap-3 cursor-pointer p-1 lg:p-1.5 rounded-full hover:bg-[var(--hub-chip)] transition-colors text-left border border-transparent focus:outline-none" aria-label={identityResolved ? name : 'Cargando identidad'}>
                {identityResolved && avatar ? (
                  <img key={avatar} src={avatar} alt={name} className="w-8 h-8 lg:w-9 lg:h-9 rounded-full border border-[var(--hub-border)] object-cover" />
                ) : (
                  <span className="w-8 h-8 lg:w-9 lg:h-9 rounded-full border border-[var(--hub-border)] bg-[var(--hub-hover)] animate-pulse" aria-hidden="true" />
                )}
                <div className="hidden lg:flex flex-col justify-center">
                  {identityResolved ? (
                    <>
                      <span className="text-white text-xs font-bold leading-none">{name}</span>
                      <span className="text-[10px] text-[var(--hub-dim)] leading-none mt-1">{isPlatformAdmin ? 'Super Administrador' : (panelAuth?.isTenantAdmin ? 'Administrador de empresa' : 'Miembro del equipo')}</span>
                    </>
                  ) : (
                    <>
                      <span className="h-3 w-24 rounded bg-[var(--hub-hover)] animate-pulse" aria-hidden="true" />
                      <span className="h-2 w-16 rounded bg-[var(--hub-chip)] animate-pulse mt-1" aria-hidden="true" />
                    </>
                  )}
                </div>
                <HubIcon icon={ChevronDown} size={16} className={`w-4 h-4 text-[var(--hub-dim)] hidden lg:block transition-transform duration-200 ${isProfileOpen ? 'rotate-180 text-white' : ''}`} />
              </button>
              <AnimatePresence>
                {isProfileOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsProfileOpen(false)} aria-label="Cerrar perfil" />
                    <motion.div initial={{ opacity: 0, scale: 0.95, originY: 0, originX: 1 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.15, ease: "easeOut" }}
                      className="absolute right-0 top-[calc(100%+8px)] w-72 bg-[var(--hub-surface)] border border-[var(--hub-border)] rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.6)] z-[100] overflow-hidden">
                      <div className="p-5 border-b border-[var(--hub-border-soft)] bg-[var(--hub-chip)] flex items-center gap-4">
                        {identityResolved && avatar ? (
                          <img key={avatar} src={avatar} alt={name} className="w-12 h-12 rounded-full border border-[var(--hub-border)] object-cover shrink-0" />
                        ) : (
                          <span className="w-12 h-12 rounded-full border border-[var(--hub-border)] bg-[var(--hub-hover)] animate-pulse shrink-0" aria-hidden="true" />
                        )}
                        <div className="flex-1 min-w-0">
                          {identityResolved ? (
                            <><p className="text-sm font-bold text-white truncate">{name}</p><p className="text-xs text-[var(--hub-dim)] truncate mt-0.5">{authUser?.email || 'Verificando identidad…'}</p></>
                          ) : (
                            <><p className="h-4 w-32 rounded bg-[var(--hub-hover)] animate-pulse" aria-hidden="true" /><p className="h-3 w-40 rounded bg-[var(--hub-chip)] animate-pulse mt-2" aria-hidden="true" /></>
                          )}
                        </div>
                      </div>
                      <div className="p-2 border-t border-[var(--hub-border-soft)] bg-[var(--hub-footer)] space-y-0.5">
                        <button onClick={() => { setIsProfileOpen(false); goTab('Mi cuenta') }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-300 hover:text-white hover:bg-[var(--hub-hover)] rounded-lg transition-colors font-semibold">
                          <HubIcon icon={User} size={15} className="w-4 h-4 text-zinc-400 shrink-0" /> Mi cuenta
                        </button>
                        <button onClick={() => window.alert('Sección Seguridad disponible próximamente.')} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-400 hover:text-white hover:bg-[var(--hub-hover)] rounded-lg transition-colors font-semibold">
                          <HubIcon icon={Shield} size={15} className="w-4 h-4 text-zinc-500 shrink-0" /> Seguridad <span className="ml-auto text-[10px] text-zinc-600">Próximamente</span>
                        </button>
                        <div className="h-px bg-[var(--hub-border-soft)] my-1" />
                        <div className="flex items-center justify-between pl-4 pr-2 py-1.5">
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--hub-faint)]">Tema</span>
                          <div className="flex items-center gap-0.5">
                            <button onClick={() => setThemeMode('claro')} title="Claro" aria-label="Tema claro" className={`p-1.5 rounded-lg transition-colors ${themeMode === 'claro' ? 'text-white bg-[var(--hub-hover)]' : 'text-[var(--hub-faint)] hover:text-white hover:bg-[var(--hub-hover)]'}`}>
                              <Sun size={14} className="w-4 h-4" />
                            </button>
                            <button onClick={() => setThemeMode('contraste')} title="Claro-Oscuro (Contraste) — actual" aria-label="Tema claro-oscuro (contraste)" className={`p-1.5 rounded-lg transition-colors ${themeMode === 'contraste' ? 'text-white bg-[var(--hub-hover)]' : 'text-[var(--hub-faint)] hover:text-white hover:bg-[var(--hub-hover)]'}`}>
                              <Contrast size={14} className="w-4 h-4" />
                            </button>
                            <button onClick={() => setThemeMode('oscuro')} title="Oscuro" aria-label="Tema oscuro" className={`p-1.5 rounded-lg transition-colors ${themeMode === 'oscuro' ? 'text-white bg-[var(--hub-hover)]' : 'text-[var(--hub-faint)] hover:text-white hover:bg-[var(--hub-hover)]'}`}>
                              <Moon size={14} className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <button onClick={handleLogout} className="w-full flex items-center px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-colors font-bold">Cerrar Sesión</button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* ── MAIN CONTENT (Lienzo Maestro: #fafafa) ────────────────── */}
        <main className="flex-1 bg-[#fafafa] overflow-y-auto text-zinc-900 relative">
          <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.007] bg-[linear-gradient(to_right,#000_1px,transparent_1px),linear-gradient(to_bottom,#000_1px,transparent_1px)] bg-[size:32px_32px]" />
          <div className="relative z-10 p-6 md:p-8 min-h-full max-w-[1300px] mx-auto">
            {activeTab === 'Empresas' && !globalSearchQuery.trim() ? (
              /* Sección Empresas dentro del panel (30.X: Page/View en el shell). Diseño del módulo intacto. */
              panelAuth ? (
                <EmpresasModule
                  tenantId={effectiveTenantId}
                  session={panelAuth.session}
                  isPlatformAdmin={panelAuth.isPlatformAdmin}
                  onCreateCompany={() => navigate('/hub/bienvenida')}
                  onOpenCompany={(company) => company?.id && navigate(`/hub/panel/empresas?empresa=${company.id}`)}
                />
              ) : (
                <div className="py-24 text-center">
                  <p className="text-sm font-semibold text-zinc-400">Cargando módulo de empresas...</p>
                </div>
              )
            ) : panelAuth && MODULE_TABS.includes(activeTab) && !allowedTabIds.has(activeTab) ? (
              /* Defensa en capas: un trabajador sin otorgamiento no pinta módulos
                 administrativos aunque fuerce la URL (el guard de nav ya lo redirige). */
              <RestrictedCard tabLabel={currentTabLabel} />
            ) : activeTab === 'Usuarios' && !globalSearchQuery.trim() ? (
              /* Sección Usuarios dentro del panel (30.X: Page/View en el shell). Diseño del módulo intacto. */
              panelAuth ? (
                <UsersModule
                  tenantId={effectiveTenantId}
                  session={panelAuth.session}
                  supabase={supabase}
                  isPlatformAdmin={panelAuth.isPlatformAdmin}
                  tenantName={effectiveTenantName}
                  onInviteUser={() => navigate('/hub/invitar')}
                  onOpenUser={(user) => user?.id && navigate(`/hub/panel/usuarios?usuario=${user.id}`)}
                />
              ) : (
                <div className="py-24 text-center">
                  <p className="text-sm font-semibold text-zinc-400">Cargando módulo de usuarios...</p>
                </div>
              )
            ) : activeTab === 'Aplicaciones' && !globalSearchQuery.trim() ? (
              /* Sección Aplicaciones dentro del panel (30.X: Page/View en el shell). Diseño del módulo intacto. */
              panelAuth ? (
                <AplicacionesModule
                  tenantId={effectiveTenantId}
                  session={panelAuth.session}
                />
              ) : (
                <div className="py-24 text-center">
                  <p className="text-sm font-semibold text-zinc-400">Cargando módulo de aplicaciones...</p>
                </div>
              )
            ) : activeTab === 'Planes' && !globalSearchQuery.trim() ? (
              /* Sección Planes y Precios dentro del panel (30.X: Page/View en el shell). Diseño del módulo intacto. */
              <PlanesPreciosPage />
            ) : activeTab === 'Suscripciones' && !globalSearchQuery.trim() ? (
              /* Sección Suscripciones dentro del panel (30.X: Page/View en el shell). Diseño del módulo intacto. */
              <SuscripcionesPanel />
            ) : activeTab === 'Pagos' && !globalSearchQuery.trim() ? (
              /* Sección Pagos dentro del panel (30.X: Page/View en el shell). Diseño del módulo intacto. */
              <PagosPanel />
            ) : activeTab === 'Reportes' && !globalSearchQuery.trim() ? (
              /* Sección Reportes dentro del panel (30.X: Page/View en el shell). Diseño del módulo intacto. */
              <ReportesPanel />
            ) : activeTab === 'Soporte' && !globalSearchQuery.trim() ? (
              /* Sección Soporte dentro del panel (30.X: Page/View en el shell). Diseño del módulo intacto. */
              <SupportPanel />
            ) : activeTab === 'Configuracion' && !globalSearchQuery.trim() ? (
              /* Sección Configuración dentro del panel (30.X: Page/View en el shell). Diseño del módulo intacto. */
              <ConfiguracionPanel />
            ) : activeTab === 'Mi cuenta' && !globalSearchQuery.trim() ? (
              /* Sección Mi cuenta dentro del panel (30.X: Page/View en el shell). Perfil personal
                 desacoplado de empresa/usuarios/aplicaciones/planes; la identidad viene SOLO de la
                 sesión + fila de users por id (nunca de tenant/rol en carga). */
              panelAuth ? (
                <HubProfilePanel
                  profile={profileProps}
                  onSaveProfile={handleSaveProfile}
                  onUploadAvatar={handleUploadAvatar}
                  onDeleteAvatar={handleDeleteAvatar}
                  onOpenSecurity={() => window.alert('Sección Seguridad disponible próximamente.')}
                  onOpenActivity={() => window.alert('Actividad de la cuenta disponible próximamente.')}
                  onOpenHelp={() => goTab('Soporte')}
                />
              ) : (
                <div className="py-24 text-center">
                  <p className="text-sm font-semibold text-zinc-400">Cargando tu cuenta…</p>
                </div>
              )
            ) : globalSearchQuery.trim() !== '' || (activeTab !== 'Inicio' && activeTab !== 'Todas') ? (
              /* Explorer Grid de Aplicaciones */
              <div>
                <div className="sticky top-0 z-20 flex flex-wrap items-center gap-2 bg-[#fafafa]/90 backdrop-blur-md py-4 -mx-6 px-6 md:-mx-8 md:px-8 border-b border-zinc-200/50 mb-6">
                  {PILLARS.map((p) => (
                    <button key={p.label} onClick={() => goTab(p.label)}
                      className={`h-9 px-4 rounded-xl text-sm font-semibold border transition-all duration-300 outline-none focus:outline-none focus:ring-0 select-none [-webkit-tap-highlight-color:transparent] ${activeTab === p.label ? 'bg-zinc-950 text-white border-zinc-950' : 'border-zinc-200 bg-white text-zinc-600 hover:text-zinc-950 hover:border-zinc-300'}`}>{p.label}</button>
                  ))}
                  <button onClick={() => goTab('Inicio')} className="ml-auto text-xs font-bold text-zinc-700 hover:text-zinc-950 transition-colors flex items-center gap-1">
                    ← Volver a Inicio
                  </button>
                </div>
                {filtered.length === 0 ? (
                  <div className="mt-6 rounded-2xl border border-zinc-200 bg-white p-8 text-center">
                    <p className="text-[15px] font-semibold text-zinc-900">Sin resultados</p>
                    <button onClick={() => { setGlobalSearchQuery(''); goTab('Inicio') }} className="mt-4 h-10 px-5 rounded-full bg-zinc-950 text-white text-sm font-bold">Limpiar filtros</button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filtered.map((route) => {
                      const Icon = route.icon
                      const gradient = PILLAR_GRADIENTS[route.pillar] || PILLAR_GRADIENTS['Herramientas']
                      const hasPreview = Boolean(route.preview)
                      return (
                        <Link key={route.path} to={route.path} className="group block">
                          <article className={`relative flex min-h-[156px] overflow-hidden rounded-2xl border border-slate-200/90 shadow-[0_2px_10px_rgba(0,0,0,0.04)] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-[3px] hover:shadow-[0_12px_28px_rgba(15,23,42,0.09)] ${gradient}`}>
                            {hasPreview ? (
                              <div className="absolute right-0 top-0 bottom-0 w-[42%] pointer-events-none">
                                <div className="h-full w-full rounded-l-xl bg-white/60 overflow-hidden border-l border-black/[0.04]">
                                  <img src={route.preview} alt={route.title} className="h-full w-full object-cover object-left-top" loading="lazy" />
                                </div>
                              </div>
                            ) : (
                              <div className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl flex items-center justify-center opacity-10">
                                <Icon className="w-6 h-6 text-zinc-900" strokeWidth={1.5} />
                              </div>
                            )}
                            <div className="relative z-10 flex flex-col p-5 max-w-[58%]">
                              <span className={`w-8 h-8 mb-3 rounded-lg flex items-center justify-center shrink-0 shadow-sm border border-black/[0.03] ${route.tone}`}>
                                <HubIcon icon={Icon} size={16} className="w-4 h-4" />
                              </span>
                              <h3 className="text-[14px] font-extrabold leading-snug text-zinc-900 tracking-tight pr-2">{route.title}</h3>
                            </div>
                          </article>
                        </Link>
                      )
                    })}
                  </div>
                )}
              </div>
            ) : !panelAuth ? (
              /* Carga del contexto rol/tenant: nunca se pinta un dashboard (ni datos hardcodeados)
                 antes de saber quién es. Elimina el flash del Super Admin en accesos nuevos. */
              <div className="py-24 text-center">
                <div className="mx-auto h-9 w-9 animate-spin rounded-full border-2 border-zinc-300 border-t-[#ff4b0b]" />
                <p className="mt-3 text-sm font-semibold text-zinc-400">Cargando panel…</p>
              </div>
            ) : (
              /* Inicio por rol: global (platform), "ver como" una marca (platform con selector),
                 resumen de la empresa (admin de marca) o "Mi espacio" (trabajador). */
              actingAsBrand ? (
                <TenantAdminDashboard tenantId={effectiveTenantId} tenantName={effectiveTenantName} setActiveTab={goTab} />
              ) : panelAuth?.isPlatformAdmin ? (
                <SuperAdminDashboard setActiveTab={goTab} navigate={navigate} />
              ) : panelAuth?.isTenantAdmin ? (
                <TenantAdminDashboard tenantId={panelAuth.tenantId} tenantName={panelAuth.tenantName} setActiveTab={goTab} />
              ) : (
                <WorkerHome panelAuth={panelAuth} name={name} avatar={avatar} />
              )
            )}
          </div>
        </main>

        {/* FLOATING ACTION BUTTONS */}
        <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-50">
          <button className="group relative flex items-center justify-center w-[52px] h-[52px] rounded-full bg-gradient-to-tr from-indigo-600 to-purple-500 text-white shadow-[0_8px_30px_rgba(79,70,229,0.4)] hover:-translate-y-1 transition-all duration-300 ease-out border border-[var(--hub-border)]" title="Qaway IA Insights">
            <HubIcon icon={Sparkles} size={24} className="w-6 h-6 animate-pulse" />
          </button>
          <button className="group relative flex items-center justify-center w-[52px] h-[52px] rounded-full bg-gradient-to-tr from-[#ff4b0b] to-[#ff8c00] text-white shadow-[0_8px_30px_rgba(255,75,11,0.4)] hover:-translate-y-1 transition-all duration-300 ease-out border border-white/20" title="Chatbot de Ayuda">
            <HubIcon icon={MessageSquare} size={24} className="w-6 h-6 text-white" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default function HubPanelPage() {
  return (<ErrorBoundary><HubPanelContent /></ErrorBoundary>)
}
