import React, { useState, useEffect, useRef, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { HubIcon } from '@/components/ui/icons'
import {
  AlertCircle, ArrowRight, BarChart3, Bell, Bot, Building2, Calendar, ChevronDown, ChevronRight, Clock, CreditCard,
  FileImage, FolderKanban, HelpCircle, Home, Instagram, LayoutGrid, Menu, MessageSquare,
  Package, PenSquare, Plus, Receipt, Search, Settings, Shield, Sparkles,
  Star, Tag, User, UserPlus, Users, X, Zap, Check, Layers, Globe, Filter, SlidersHorizontal,
} from '@/components/ui/icons/hubIcons'
import { Sun, Moon, Contrast, Activity } from 'lucide-react'
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip, ResponsiveContainer,
} from 'recharts'
import { logoutUser } from '@/config/auth'
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
  { icon: Sparkles, title: 'Creador de Contenido Modular (5 Skills)', description: 'Fabrica de contenidos con IA: Radar viral, Guiones con retencion medida.', path: '/hub/creador-contenido', access: 'pro', badge: 'Nuevo', category: 'Marketing & Creacion', pillar: 'Creacion', tone: 'bg-[#ff4b0b]/10 text-[#ff4b0b]', preview: '/assets/hub-previews/preview-creador.png', published: true },
  { icon: FileImage, title: 'Optimizador de Imagenes WebP', description: 'Herramienta interactiva para comprimir y convertir imagenes PNG y JPG a WebP.', path: '/hub/optimizador-webp', access: 'free', badge: 'Gratis', category: 'Herramientas', pillar: 'Automatizacion', tone: 'bg-[#ff4b0b]/10 text-[#ff4b0b]', preview: '/assets/hub-previews/preview-inventario.png', published: false },
  { icon: Instagram, title: 'Descargador & Extractor de Instagram', description: 'Extractor y descargador multimedia de publicaciones.', path: '/hub/descargador-ig', access: 'free', badge: 'Borrador', category: 'Herramientas', pillar: 'Marketing', tone: 'bg-[#ff4b0b]/10 text-[#ff4b0b]', preview: '/assets/hub-previews/preview-creador.png', published: false },
  { icon: FolderKanban, title: 'Gestor de Proyectos & Entregas', description: 'Trazabilidad y portal de cliente: ciclo de 6 hitos.', path: '/hub/gestor-proyectos', access: 'pro', badge: 'Pro', category: 'Product Management', pillar: 'Automatizacion', tone: 'bg-[#ff4b0b]/10 text-[#ff4b0b]', preview: '/assets/hub-previews/preview-agenda.png', published: false },
  { icon: PenSquare, title: 'Editor de Blog', description: 'Plataforma editorial para crear, estructurar y publicar articulos.', path: '/hub/blog-editor', access: 'pro', badge: 'Listo', category: 'Herramientas', pillar: 'Creacion', tone: 'bg-[#ff4b0b]/10 text-[#ff4b0b]', preview: '/assets/hub-previews/hub-portada.webp', published: true, app: 'blog' },
  { icon: Calendar, title: 'Consola WABA + CRM', description: 'Panel ejecutivo para campana: integracion WhatsApp API.', path: '/hub/waba-crm', access: 'pro', badge: 'Destacado', category: 'Panel de control', pillar: 'IA', tone: 'bg-[#ff4b0b]/10 text-[#ff4b0b]', preview: '/assets/hub-previews/preview-agentes.png', published: false },
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

// Un "nombre" que viene como correo (cuenta sin full_name en BD) nunca debe pintarse
// tal cual en pantalla: s.admin@qawaylab.com → "S Admin". Solo capa de presentación;
// no toca el modelo de usuarios.
function nameWords(raw) {
  if (!raw) return []
  let text = String(raw).trim()
  if (text.includes('@')) text = text.split('@')[0]
  return text
    .replace(/[._-]+/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
}

// Nombre legible completo para superficies de identidad (dropdown de perfil).
function readableName(full) {
  const words = nameWords(full)
  return words.length > 0 ? words.join(' ') : null
}

// Formato ejecutivo del estándar del proyecto (Estandar_Arquetipos_Disenos_y_Layouts_SaaS.md:365):
// "Carlos Enrique Sandoval Ocaña" → "Carlos S." · "Juanito Alimaña" → "Juanito A."
// Si el nombre proviene de un correo (sin full_name real en BD) se humaniza sin acortar más.
function shortName(full) {
  const words = nameWords(full)
  if (words.length === 0) return null
  if (typeof full === 'string' && full.includes('@')) return words.join(' ')
  if (words.length === 1) return words[0]
  if (words.length === 2) return `${words[0]} ${words[1].charAt(0).toUpperCase()}.`
  return `${words[0]} ${words[2].charAt(0).toUpperCase()}.`
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
  const [appMeta, setAppMeta] = useState({})
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
        supabase.from('app_catalog').select('id, name, slug'),
      ])
      if (!alive) return
      setCompany(tenantRes.data)
      setSubs(subsRes.data || [])
      setAppMeta(Object.fromEntries((appsRes.data || []).map((a) => [a.id, a])))
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
          <p className="text-xs italic text-zinc-400">“Tecnología para negocios que avanzan.”</p>
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
            <h2 className="text-sm font-bold text-zinc-950">Aplicaciones contratadas</h2>
            <p className="mt-1 text-xs text-zinc-500">Estado de tus apps y el plan de cada una.</p>
          </div>
          {subs.length === 0 ? (
            <div className="px-5 py-8 text-center">
              <p className="text-sm font-semibold text-zinc-600">{loading ? 'Cargando aplicaciones…' : 'Aún no tienes aplicaciones contratadas.'}</p>
              <button type="button" onClick={() => setActiveTab('Aplicaciones')} className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#ff4b0b] px-5 text-sm font-bold text-white shadow-sm transition hover:bg-[#e03f06]">Ver aplicaciones disponibles</button>
            </div>
          ) : (
            <div className="divide-y divide-zinc-50 px-5">
              {subs.map((sub) => {
                const [label, classes] = statusMeta[sub.status] || [sub.status, 'bg-zinc-100 text-zinc-600']
                const cat = appMeta[sub.app_id]
                const route = cat?.slug && WORKER_APP_ROUTES[cat.slug] ? appWorkerRoute(cat.slug) : null
                const row = (
                  <div className="flex items-center justify-between py-3.5">
                    <div className="flex items-center gap-3">
                      <span className="w-9 h-9 rounded-xl bg-zinc-100 text-zinc-600 flex items-center justify-center shrink-0"><HubIcon icon={LayoutGrid} size={16} className="w-4 h-4" /></span>
                      <div>
                        <p className="text-sm font-bold text-zinc-900">{cat?.name || 'Aplicación'}</p>
                        <p className="text-[11px] text-zinc-500 capitalize">Plan {sub.plan || '—'}</p>
                      </div>
                    </div>
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ${classes}`}>{label}</span>
                  </div>
                )
                return route && sub.status !== 'cancelled' && sub.status !== 'suspended' ? (
                  <Link key={sub.app_id} to={route} className="block transition-colors hover:bg-orange-50/40">
                    {row}
                  </Link>
                ) : (
                  <div key={sub.app_id}>{row}</div>
                )
              })}
            </div>
          )}
        </div>

        {/* Acciones rápidas */}
        <div className="bg-white rounded-2xl border border-zinc-200/80 shadow-xs p-5">
          <h2 className="text-sm font-bold text-zinc-950">Acciones rápidas</h2>
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
  'bg-[#ff4b0b]', 'bg-[#ff7a45]', 'bg-[#ff9b73]',
  'bg-gradient-to-tr from-[#ff4b0b] to-[#ff7a45]', 'bg-zinc-900',
  'bg-[#ff4b0b]', 'bg-[#ff7a45]', 'bg-[#ff9b73]',
]

const STANDARD_CATEGORIES = [
  'Salud y Veterinaria',
  'Inmobiliaria y Construcción',
  'Retail y Comercio',
  'Gastronomía y Alimentos',
  'Contabilidad y Finanzas',
  'Tecnología y Software',
  'Servicios Profesionales',
]

function resolveTenantCategory(t) {
  if (t?.category && STANDARD_CATEGORIES.includes(t.category)) return t.category
  const text = `${t?.category || ''} ${t?.industry || ''} ${t?.sector || ''} ${t?.name || ''} ${t?.slug || ''}`.toLowerCase()
  if (text.match(/vet|salud|clinic|medic|mascot|canin/)) return 'Salud y Veterinaria'
  if (text.match(/inmob|epc|const|prop|hogar|bienes|edif/)) return 'Inmobiliaria y Construcción'
  if (text.match(/retail|tiend|ecom|comerc|vent|market/)) return 'Retail y Comercio'
  if (text.match(/gastro|rest|cafe|comid|alimen|bar/)) return 'Gastronomía y Alimentos'
  if (text.match(/conta|finan|tribut|audi|fiscal/)) return 'Contabilidad y Finanzas'
  if (text.match(/tech|soft|digit|ia|agenc|cloud|dev/)) return 'Tecnología y Software'
  return 'Servicios Profesionales'
}

const TIME_LABELS = {
  realtime: 'Tiempo Real',
  today: 'Hoy',
  '7days': 'Últimos 7 días',
  '30days': 'Últimos 30 días',
  all: 'Histórico Completo',
}

function SuperAdminDashboard({ setActiveTab, navigate }) {
  // Datos crudos desde Supabase
  const [rawData, setRawData] = useState({ tenants: [], users: [], subs: [], apps: [], pays: [], orders: [], roles: [] })
  const [loading, setLoading] = useState(true)

  // 1. Filtro temporal general (CRM)
  const [timeRange, setTimeRange] = useState('realtime')
  const [showTimeMenu, setShowTimeMenu] = useState(false)
  const timeMenuRef = useRef(null)

  // 1. Dropdown Acciones Rápidas en Cabecera
  const [showActionsMenu, setShowActionsMenu] = useState(false)
  const actionsMenuRef = useRef(null)

  // Selector temporal para gráfico horizontal de crecimiento (30 d / 90 d / 12 m / Todo)
  const [revenueTimeRange, setRevenueTimeRange] = useState('12m')

  // 1. Modal Nueva Métrica (Super Admin)
  const [isMetricModalOpen, setIsMetricModalOpen] = useState(false)
  const [customMetrics, setCustomMetrics] = useState([])
  const [metricForm, setMetricForm] = useState({ name: '', source: 'tenants', target: 50, unit: 'num' })

  // 2. Estados y Refs para la Barra de Filtros Cascada (Multiselección)
  const [selectedCategories, setSelectedCategories] = useState([])
  const [showCategoryMenu, setShowCategoryMenu] = useState(false)
  const categoryMenuRef = useRef(null)

  const [selectedTenantIds, setSelectedTenantIds] = useState([])
  const [showTenantMenu, setShowTenantMenu] = useState(false)
  const [tenantSearch, setTenantSearch] = useState('')
  const tenantMenuRef = useRef(null)

  const [selectedAppIds, setSelectedAppIds] = useState([])
  const [showAppMenu, setShowAppMenu] = useState(false)
  const appMenuRef = useRef(null)

  const [selectedPlans, setSelectedPlans] = useState([])
  const [showPlanMenu, setShowPlanMenu] = useState(false)
  const planMenuRef = useRef(null)

  // 3. Selectores de tiempo específicos para los 3 gráficos
  const [rendimientoPeriod, setRendimientoPeriod] = useState('Mensual')
  const [showRendimientoMenu, setShowRendimientoMenu] = useState(false)
  const rendimientoMenuRef = useRef(null)

  const [appTimeframe, setAppTimeframe] = useState('Este mes')
  const [showAppTimeframeMenu, setShowAppTimeframeMenu] = useState(false)
  const appTimeframeMenuRef = useRef(null)

  const [planTimeframe, setPlanTimeframe] = useState('Este mes')
  const [showPlanTimeframeMenu, setShowPlanTimeframeMenu] = useState(false)
  const planTimeframeMenuRef = useRef(null)

  // Listener global de click fuera para cerrar todos los dropdowns
  useEffect(() => {
    function handleClickOutside(event) {
      if (timeMenuRef.current && !timeMenuRef.current.contains(event.target)) setShowTimeMenu(false)
      if (actionsMenuRef.current && !actionsMenuRef.current.contains(event.target)) setShowActionsMenu(false)
      if (categoryMenuRef.current && !categoryMenuRef.current.contains(event.target)) setShowCategoryMenu(false)
      if (tenantMenuRef.current && !tenantMenuRef.current.contains(event.target)) setShowTenantMenu(false)
      if (appMenuRef.current && !appMenuRef.current.contains(event.target)) setShowAppMenu(false)
      if (planMenuRef.current && !planMenuRef.current.contains(event.target)) setShowPlanMenu(false)
      if (rendimientoMenuRef.current && !rendimientoMenuRef.current.contains(event.target)) setShowRendimientoMenu(false)
      if (appTimeframeMenuRef.current && !appTimeframeMenuRef.current.contains(event.target)) setShowAppTimeframeMenu(false)
      if (planTimeframeMenuRef.current && !planTimeframeMenuRef.current.contains(event.target)) setShowPlanTimeframeMenu(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Carga de datos globales (plataforma = is_admin)
  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        const [t, u, s, a, p, o, r] = await Promise.all([
          supabase.from('tenants').select('id, name, client_code, category, industry, sector, status, deleted_at, created_at'),
          supabase.from('users').select('id, full_name, email, created_at'),
          supabase.from('tenant_app_subscriptions').select('tenant_id, app_id, plan, status'),
          supabase.from('app_catalog').select('id, name, slug'),
          supabase.from('payments').select('amount, created_at, status, tenant_id'),
          supabase.from('orders').select('amount, total_amount, created_at, status, tenant_id'),
          supabase.from('user_app_roles').select('app_id'),
        ])
        if (!alive) return
        setRawData({
          tenants: t.data || [],
          users: u.data || [],
          subs: s.data || [],
          apps: a.data || [],
          pays: p.data || [],
          orders: o.data || [],
          roles: r.data || [],
        })
      } catch (err) {
        console.error('Error cargando datos SuperAdmin:', err)
      } finally {
        if (alive) setLoading(false)
      }
    })()
    return () => { alive = false }
  }, [])

  // Handlers para multiselección
  const toggleCategory = (cat) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    )
  }

  const toggleTenant = (id) => {
    setSelectedTenantIds((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    )
  }

  const toggleApp = (id) => {
    setSelectedAppIds((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    )
  }

  const togglePlan = (p) => {
    setSelectedPlans((prev) =>
      prev.includes(p) ? prev.filter((item) => item !== p) : [...prev, p]
    )
  }

  const resetFilters = () => {
    setSelectedCategories([])
    setSelectedTenantIds([])
    setSelectedAppIds([])
    setSelectedPlans([])
    setTenantSearch('')
  }

  const hasAnyFilter =
    selectedCategories.length > 0 ||
    selectedTenantIds.length > 0 ||
    selectedAppIds.length > 0 ||
    selectedPlans.length > 0

  // Cálculo reactivo con useMemo cruzando filtros y telemetría
  const live = useMemo(() => {
    const { tenants, users, subs, apps, pays, orders, roles } = rawData

    // 1. Filtrado de Empresas
    let filteredTenants = tenants.filter((x) => !x.deleted_at)

    if (selectedCategories.length > 0) {
      filteredTenants = filteredTenants.filter((t) =>
        selectedCategories.includes(resolveTenantCategory(t))
      )
    }

    if (selectedTenantIds.length > 0) {
      filteredTenants = filteredTenants.filter((t) => selectedTenantIds.includes(t.id))
    }

    if (selectedAppIds.length > 0) {
      const tenantsWithApps = new Set(
        subs.filter((s) => selectedAppIds.includes(s.app_id)).map((s) => s.tenant_id)
      )
      filteredTenants = filteredTenants.filter((t) => tenantsWithApps.has(t.id))
    }

    if (selectedPlans.length > 0) {
      const tenantsWithPlans = new Set(
        subs
          .filter((s) =>
            selectedPlans.some((p) =>
              String(s.plan || '').toLowerCase().includes(p.toLowerCase())
            )
          )
          .map((s) => s.tenant_id)
      )
      if (selectedPlans.includes('Sin plan')) {
        const withAnySub = new Set(subs.map((s) => s.tenant_id))
        tenants.forEach((t) => {
          if (!withAnySub.has(t.id)) tenantsWithPlans.add(t.id)
        })
      }
      filteredTenants = filteredTenants.filter((t) => tenantsWithPlans.has(t.id))
    }

    const filteredTenantIds = new Set(filteredTenants.map((t) => t.id))
    const activeTenants = filteredTenants.filter((x) => String(x.status) === 'active').length

    // 2. Suscripciones filtradas
    let activeSubs = subs.filter(
      (s) => String(s.status) === 'active' && filteredTenantIds.has(s.tenant_id)
    )
    if (selectedAppIds.length > 0) {
      activeSubs = activeSubs.filter((s) => selectedAppIds.includes(s.app_id))
    }
    if (selectedPlans.length > 0) {
      activeSubs = activeSubs.filter((s) =>
        selectedPlans.some((p) =>
          String(s.plan || '').toLowerCase().includes(p.toLowerCase())
        )
      )
    }

    const activeApps = new Set(activeSubs.map((x) => x.app_id)).size

    // 3. MRR Recurrente de suscripciones filtradas
    const mrr = activeSubs.reduce((acc, sub) => {
      const plan = String(sub.plan || '').toLowerCase()
      if (plan.includes('premi')) return acc + 199
      if (plan.includes('inter')) return acc + 99
      return acc + 49
    }, 0)

    // 4. Pagos y Pedidos con filtro temporal (CRM timeRange)
    const now = new Date()
    let timeCutoff = 0
    if (timeRange === 'today') {
      timeCutoff = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
    } else if (timeRange === '7days') {
      timeCutoff = now.getTime() - 7 * 24 * 60 * 60 * 1000
    } else if (timeRange === '30days') {
      timeCutoff = now.getTime() - 30 * 24 * 60 * 60 * 1000
    } else if (timeRange === 'realtime') {
      timeCutoff = now.getTime() - 24 * 60 * 60 * 1000
    }

    const paidPayments = pays.filter((x) => {
      const validStatus = ['completed', 'paid', 'approved'].includes(String(x.status || '').toLowerCase())
      const validTime = !timeCutoff || new Date(x.created_at).getTime() >= timeCutoff
      const validTenant = !x.tenant_id || filteredTenantIds.has(x.tenant_id)
      return validStatus && validTime && validTenant
    })

    const paidOrders = orders.filter((x) => {
      const validStatus = ['completed', 'paid', 'delivered', 'entregado'].includes(String(x.status || '').toLowerCase())
      const validTime = !timeCutoff || new Date(x.created_at).getTime() >= timeCutoff
      const validTenant = !x.tenant_id || filteredTenantIds.has(x.tenant_id)
      return validStatus && validTime && validTenant
    })

    const revPayments = paidPayments.reduce((acc, p) => acc + (Number(p.amount) || 0), 0)
    const revOrders = paidOrders.reduce((acc, o) => acc + (Number(o.total_amount || o.amount) || 0), 0)
    const revenue = revPayments + revOrders
    const revFmt = new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN', maximumFractionDigits: 0 })

    // 5. Donut por plan
    const planCounts = { Premium: 0, Intermedio: 0, Básico: 0, 'Sin plan': 0 }
    activeSubs.forEach((x) => {
      const plan = String(x.plan || '').toLowerCase().trim()
      if (plan.includes('premi')) planCounts.Premium += 1
      else if (plan.includes('inter')) planCounts.Intermedio += 1
      else planCounts.Básico += 1
    })
    const withSub = new Set(activeSubs.map((x) => x.tenant_id))
    filteredTenants.forEach((x) => {
      if (!withSub.has(x.id)) planCounts['Sin plan'] += 1
    })
    const planTotal = Math.max(filteredTenants.length, 1)
    const planColors = { Premium: '#ff4b0b', Intermedio: '#ff7a45', Básico: '#ff9b73', 'Sin plan': '#d4d4d8' }
    let cursor = 0
    const donut = Object.keys(planCounts)
      .map((label) => {
        const from = (cursor / planTotal) * 360
        cursor += planCounts[label]
        return planCounts[label] ? `${planColors[label]} ${from}deg ${(cursor / planTotal) * 360}deg` : null
      })
      .filter(Boolean)

    // 6. Transacciones para gráficos
    const allTransactions = [
      ...paidPayments.map((p) => ({ amount: Number(p.amount) || 0, date: new Date(p.created_at) })),
      ...paidOrders.map((o) => ({ amount: Number(o.total_amount || o.amount) || 0, date: new Date(o.created_at) })),
    ].filter((x) => !Number.isNaN(x.date.getTime()))

    // 7. Rendimiento Comercial (LineChart según rendimientoPeriod)
    let rendimientoData = []
    if (rendimientoPeriod === 'Diario') {
      const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i)
        const dayTxs = allTransactions.filter(
          (tx) => tx.date.getDate() === d.getDate() && tx.date.getMonth() === d.getMonth()
        )
        rendimientoData.push({
          name: days[d.getDay()],
          ingresos: Math.round(dayTxs.reduce((sum, tx) => sum + tx.amount, 0)),
          operaciones: dayTxs.length,
        })
      }
    } else if (rendimientoPeriod === 'Semanal') {
      for (let i = 3; i >= 0; i--) {
        const semStart = new Date(now.getTime() - (i + 1) * 7 * 24 * 60 * 60 * 1000)
        const semEnd = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000)
        const semTxs = allTransactions.filter((tx) => tx.date >= semStart && tx.date < semEnd)
        rendimientoData.push({
          name: `Sem ${4 - i}`,
          ingresos: Math.round(semTxs.reduce((sum, tx) => sum + tx.amount, 0)),
          operaciones: semTxs.length,
        })
      }
    } else if (rendimientoPeriod === 'Trimestral') {
      const quarters = ['T1', 'T2', 'T3', 'T4']
      const currentQ = Math.floor(now.getMonth() / 3)
      for (let i = 0; i < 4; i++) {
        const qIndex = (currentQ - 3 + i + 4) % 4
        const qTxs = allTransactions.filter((tx) => Math.floor(tx.date.getMonth() / 3) === qIndex)
        rendimientoData.push({
          name: quarters[qIndex],
          ingresos: Math.round(qTxs.reduce((sum, tx) => sum + tx.amount, 0)),
          operaciones: qTxs.length,
        })
      }
    } else {
      // Mensual (default)
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
        const key = `${d.getFullYear()}-${d.getMonth()}`
        const monthTxs = allTransactions.filter(
          (tx) => `${tx.date.getFullYear()}-${tx.date.getMonth()}` === key
        )
        rendimientoData.push({
          name: d.toLocaleDateString('es-PE', { month: 'short' }),
          ingresos: Math.round(monthTxs.reduce((sum, tx) => sum + tx.amount, 0)),
          operaciones: monthTxs.length,
        })
      }
    }

    // 8. Datos para gráfico de Ingresos por Aplicación (BarChart horizontal)
    const appStats = apps.map((a) => {
      const appSubs = activeSubs.filter((s) => s.app_id === a.id)
      const subRev = appSubs.reduce((acc, s) => {
        const pl = String(s.plan || '').toLowerCase()
        return acc + (pl.includes('premi') ? 199 : pl.includes('inter') ? 99 : 49)
      }, 0)
      return {
        name: a.name || a.slug || 'App',
        facturacion: subRev,
        subs: appSubs.length,
      }
    }).sort((a, b) => b.facturacion - a.facturacion).slice(0, 5)

    // 9. Ecosistema general
    const rolesByApp = {}
    roles.forEach((r) => { rolesByApp[r.app_id] = (rolesByApp[r.app_id] || 0) + 1 })
    const ecosystem = apps.map((a, i) => ({
      title: a.name || a.slug || 'Aplicación',
      slug: a.slug || '',
      active: activeSubs.filter((x) => x.app_id === a.id).length,
      users: rolesByApp[a.id] || 0,
      tone: ECOSYSTEM_TONES[i % ECOSYSTEM_TONES.length],
      path: a.slug ? appWorkerRoute(a.slug) : null,
    })).sort((x, y) => y.active - x.active).slice(0, 8)

    // 10. Actividad reciente
    const recent = [
      ...filteredTenants.map((x) => ({
        title: 'Nueva empresa registrada',
        detail: x.name || '—',
        time: x.created_at,
        color: 'text-blue-500 bg-blue-50',
      })),
      ...users.map((x) => ({
        title: 'Nuevo usuario registrado',
        detail: x.full_name || x.email || '—',
        time: x.created_at,
        color: 'text-orange-500 bg-orange-50',
      })),
    ]
      .filter((x) => x.time)
      .sort((a, b) => new Date(b.time) - new Date(a.time))
      .slice(0, 6)

    // 11. Gráfico horizontal amplio de Crecimiento de ingresos y ventas (bars mensuales)
    const count = revenueTimeRange === '30d' ? 4 : revenueTimeRange === '90d' ? 3 : revenueTimeRange === '12m' ? 12 : 12
    const months = []
    for (let i = count - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const key = `${d.getFullYear()}-${d.getMonth()}`
      const val = allTransactions
        .filter((tx) => `${tx.date.getFullYear()}-${tx.date.getMonth()}` === key)
        .reduce((sum, tx) => sum + tx.amount, 0)
      months.push({
        month: d.toLocaleDateString('es-PE', { month: 'short' }),
        val,
      })
    }
    const hasRevenue = months.some((m) => m.val > 0)
    const maxVal = Math.max(...months.map((m) => m.val), 1)
    const bars = months.map((m) => ({
      ...m,
      height: `${Math.max(Math.round((m.val / maxVal) * 100), 6)}%`,
      label: revFmt.format(m.val),
    }))

    return {
      activeTenants,
      totalTenants: filteredTenants.length,
      allTenantsCount: tenants.length,
      totalUsers: users.length,
      activeApps,
      revenue,
      mrr,
      revFmt,
      planCounts,
      planTotal,
      donut,
      rendimientoData,
      appStats,
      ecosystem,
      recent,
      bars,
      hasRevenue,
      tenantsList: tenants,
      appsList: apps,
    }
  }, [rawData, selectedCategories, selectedTenantIds, selectedAppIds, selectedPlans, timeRange, rendimientoPeriod, revenueTimeRange])

  const today = new Date().toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  const money = live ? (live.revenue > 0 ? live.revFmt.format(live.revenue) : 'S/ 0') : '—'
  const mrrDisplay = live ? (live.mrr > 0 ? live.revFmt.format(live.mrr) : 'S/ 0') : '—'

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner / Header Greeting con Botones de CRM (Paso 1) */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-zinc-400 capitalize">{today}</p>
          <h1 className="mt-1 text-2xl md:text-3xl font-extrabold tracking-tight text-zinc-950">Super Administrador</h1>
          <p className="mt-1 text-xs md:text-sm text-zinc-500">Gestiona empresas, usuarios, facturación consolidada e inventario desde un solo lugar.</p>
        </div>

        <div className="flex items-center gap-2.5 relative flex-wrap sm:flex-nowrap">
          {/* Cápsula de telemetría estilo CRM */}
          <span className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-100/90 border border-zinc-200/80 text-xs font-semibold text-zinc-700 shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>{live.activeTenants} {live.activeTenants === 1 ? 'empresa activa' : 'empresas activas'}</span>
            <span className="text-zinc-300">·</span>
            <span>{hasAnyFilter ? `${live.totalTenants} filtradas` : `${live.allTenantsCount} registradas`}</span>
          </span>

          {/* Botón Nueva Métrica (Solo Super Administrador) */}
          <button
            type="button"
            onClick={() => setIsMetricModalOpen(true)}
            className="flex items-center gap-1.5 bg-[#ff4b0b] hover:bg-[#e03f06] text-white text-sm font-semibold px-3.5 py-2.5 rounded-xl transition-all shadow-[0_2px_10px_rgba(255,75,11,0.25)] active:scale-[0.98] cursor-pointer"
            title="Crear métrica personalizada (Super Administrador)"
          >
            <HubIcon icon={Plus} size={15} className="w-4 h-4" />
            <span>Nueva Métrica</span>
          </button>

          {/* Botón Desplegable Acciones Rápidas (Icono con hover y click) */}
          <div
            className="relative"
            ref={actionsMenuRef}
            onMouseEnter={() => setShowActionsMenu(true)}
            onMouseLeave={() => setShowActionsMenu(false)}
          >
            <button
              type="button"
              onClick={() => setShowActionsMenu((v) => !v)}
              className="h-[38px] w-[38px] flex items-center justify-center bg-zinc-100 hover:bg-zinc-200/80 border border-zinc-200/80 text-zinc-800 rounded-xl transition-all active:scale-[0.98] cursor-pointer"
              title="Acciones Rápidas de Super Administrador"
            >
              <HubIcon icon={Zap} size={15} className="w-4 h-4 text-amber-500 fill-amber-500" />
            </button>

            {showActionsMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white border border-zinc-200 rounded-2xl shadow-xl z-50 p-2 text-xs animate-in fade-in duration-150">
                <p className="px-2.5 py-1 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Acciones de Plataforma</p>
                <div className="space-y-1 mt-1">
                  {[
                    { icon: Building2, title: 'Crear nueva empresa', to: '/hub/bienvenida' },
                    { icon: UserPlus, title: 'Invitar usuario', to: '/hub/invitar' },
                    { icon: Tag, title: 'Gestionar planes', tab: 'Planes' },
                    { icon: CreditCard, title: 'Ver suscripciones', tab: 'Suscripciones' },
                    { icon: BarChart3, title: 'Generar reporte', tab: 'Reportes' },
                    { icon: Settings, title: 'Configuración general', tab: 'Configuración' },
                  ].map((act, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        setShowActionsMenu(false)
                        if (act.to) navigate(act.to)
                        else if (act.tab) setActiveTab(act.tab)
                      }}
                      className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-left transition-colors font-semibold text-zinc-700 hover:bg-zinc-50 hover:text-zinc-950 cursor-pointer"
                    >
                      <span className="w-6 h-6 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-600 shrink-0">
                        <HubIcon icon={act.icon} size={13} className="w-3.5 h-3.5" />
                      </span>
                      <span className="truncate">{act.title}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Selector de Rango de Tiempo Interactivo (CRM) */}
          <div className="relative" ref={timeMenuRef}>
            <button
              type="button"
              onClick={() => setShowTimeMenu((v) => !v)}
              className="flex items-center gap-2 bg-white border border-zinc-200/80 text-xs font-semibold px-3.5 py-2.5 rounded-xl hover:bg-zinc-50 transition-all shadow-[0_2px_8px_rgba(0,0,0,0.04)] cursor-pointer"
            >
              <HubIcon icon={Calendar} size={15} className="w-4 h-4 text-zinc-500" />
              <span>{TIME_LABELS[timeRange] || 'Tiempo Real'}</span>
              <HubIcon icon={ChevronDown} size={14} className={`w-3.5 h-3.5 text-zinc-400 transition-transform ${showTimeMenu ? 'rotate-180' : ''}`} />
            </button>

            {showTimeMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-zinc-200 rounded-2xl shadow-xl z-50 py-1.5 text-xs overflow-hidden">
                {Object.entries(TIME_LABELS).map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => {
                      setTimeRange(key)
                      setShowTimeMenu(false)
                    }}
                    className={`w-full text-left px-4 py-2 font-medium transition-colors flex items-center justify-between ${
                      timeRange === key ? 'bg-zinc-50 text-zinc-900 font-bold' : 'text-zinc-600 hover:bg-zinc-50'
                    }`}
                  >
                    <span>{label}</span>
                    {timeRange === key && <span className="w-1.5 h-1.5 rounded-full bg-zinc-900" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Barra de Filtros Encadenados Progresivos con Sticky (Paso 2) */}
      <div className="sticky top-0 z-30 flex items-center flex-wrap gap-2 mb-6 bg-white/95 backdrop-blur-md border border-zinc-200/80 px-3.5 py-2.5 rounded-xl shadow-[0_4px_16px_rgba(0,0,0,0.03)]">
        <div className="flex items-center gap-2 relative flex-wrap sm:flex-nowrap">
          {/* 1. CATEGORÍA / RUBRO (Multiselección) */}
          <div className="relative" ref={categoryMenuRef}>
            <button
              type="button"
              onClick={() => {
                setShowCategoryMenu((v) => !v)
                setShowTenantMenu(false)
                setShowAppMenu(false)
                setShowPlanMenu(false)
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border transition-all active:scale-[0.98] ${
                selectedCategories.length > 0
                  ? 'bg-zinc-100 hover:bg-zinc-200/70 border-zinc-300 text-zinc-900 font-bold shadow-2xs'
                  : 'bg-zinc-50 hover:bg-zinc-100 border-zinc-200/80 text-zinc-600 font-medium'
              }`}
            >
              <HubIcon icon={Globe} size={14} className="w-3.5 h-3.5 opacity-70" />
              <span>
                {selectedCategories.length === 0
                  ? 'Categoría: Todas'
                  : selectedCategories.length === 1
                  ? selectedCategories[0]
                  : `${selectedCategories.length} Categorías`}
              </span>
              <HubIcon icon={ChevronDown} size={14} className="w-3.5 h-3.5 opacity-60" />
            </button>

            {showCategoryMenu && (
              <div className="absolute left-0 top-[calc(100%+6px)] w-64 bg-white border border-zinc-200 rounded-xl shadow-xl z-50 p-2.5 text-xs animate-in fade-in duration-150">
                <p className="px-2.5 py-1 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Categoría / Rubro</p>
                <div className="space-y-1 mt-1 max-h-56 overflow-y-auto">
                  <button
                    type="button"
                    onClick={() => setSelectedCategories([])}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg font-medium transition-colors flex items-center justify-between ${
                      selectedCategories.length === 0 ? 'bg-zinc-100 text-zinc-900 font-bold' : 'text-zinc-700 hover:bg-zinc-50'
                    }`}
                  >
                    <span>Todas las Categorías</span>
                    {selectedCategories.length === 0 && <HubIcon icon={Check} size={14} className="w-3.5 h-3.5 text-zinc-900" />}
                  </button>
                  {STANDARD_CATEGORIES.map((cat) => {
                    const isSelected = selectedCategories.includes(cat)
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => toggleCategory(cat)}
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg font-medium transition-colors flex items-center justify-between ${
                          isSelected ? 'bg-zinc-900 text-white font-semibold' : 'text-zinc-700 hover:bg-zinc-50'
                        }`}
                      >
                        <span className="truncate pr-2">{cat}</span>
                        {isSelected && <HubIcon icon={Check} size={14} className="w-3.5 h-3.5 text-white shrink-0" />}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          <span className="text-zinc-300 font-light">/</span>

          {/* 2. EMPRESA / TENANT (Multiselección con buscador) */}
          <div className="relative" ref={tenantMenuRef}>
            <button
              type="button"
              onClick={() => {
                setShowTenantMenu((v) => !v)
                setShowCategoryMenu(false)
                setShowAppMenu(false)
                setShowPlanMenu(false)
              }}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs border transition-all active:scale-[0.98] ${
                selectedTenantIds.length > 0
                  ? 'bg-zinc-100 hover:bg-zinc-200/70 border-zinc-300 text-zinc-900 font-bold shadow-2xs'
                  : 'bg-zinc-50 hover:bg-zinc-100 border-zinc-200/80 text-zinc-600 font-medium'
              }`}
            >
              <span className={`w-2 h-2 rounded-full shrink-0 ${selectedTenantIds.length === 0 ? 'bg-emerald-500' : 'bg-[#ff4b0b]'}`} />
              <span className="max-w-[190px] truncate text-left">
                {selectedTenantIds.length === 0
                  ? 'Empresas: Todas'
                  : selectedTenantIds.length === 1
                  ? (live.tenantsList.find((t) => t.id === selectedTenantIds[0])?.name || '1 Empresa')
                  : `${selectedTenantIds.length} Empresas`}
              </span>
              <HubIcon icon={ChevronDown} size={14} className="w-3.5 h-3.5 opacity-60 shrink-0" />
            </button>

            {showTenantMenu && (
              <div className="absolute left-0 top-[calc(100%+6px)] w-80 bg-white border border-zinc-200 rounded-xl shadow-xl z-50 p-2.5 text-xs animate-in fade-in duration-150">
                <div className="relative mb-2">
                  <HubIcon icon={Search} size={14} className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-2.5" />
                  <input
                    type="text"
                    placeholder="Buscar empresa por nombre o código..."
                    value={tenantSearch}
                    onChange={(e) => setTenantSearch(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-zinc-800 outline-none focus:border-zinc-400 font-medium"
                    autoFocus
                  />
                </div>

                <div className="max-h-56 overflow-y-auto space-y-1">
                  <button
                    type="button"
                    onClick={() => setSelectedTenantIds([])}
                    className={`w-full text-left px-3 py-2 rounded-lg font-medium transition-colors flex items-center justify-between ${
                      selectedTenantIds.length === 0 ? 'bg-zinc-100 text-zinc-900 font-bold' : 'text-zinc-700 hover:bg-zinc-50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span>Todas las Empresas</span>
                    </div>
                    {selectedTenantIds.length === 0 && <HubIcon icon={Check} size={14} className="w-3.5 h-3.5 text-zinc-900" />}
                  </button>

                  {live.tenantsList
                    .filter((t) => {
                      const matchText = `${t.name || ''} ${t.client_code || ''}`.toLowerCase()
                      return matchText.includes(tenantSearch.toLowerCase())
                    })
                    .map((t) => {
                      const isSelected = selectedTenantIds.includes(t.id)
                      return (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => toggleTenant(t.id)}
                          className={`w-full text-left px-3 py-2 rounded-lg font-medium transition-colors flex items-center justify-between ${
                            isSelected ? 'bg-zinc-900 text-white font-semibold' : 'text-zinc-700 hover:bg-zinc-50'
                          }`}
                        >
                          <div className="flex flex-col min-w-0 pr-2">
                            <div className="flex items-center gap-1.5">
                              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${String(t.status) === 'active' ? 'bg-emerald-500' : 'bg-zinc-400'}`} />
                              <span className="truncate font-semibold">{t.name}</span>
                            </div>
                            <span className={`text-[10px] truncate ${isSelected ? 'text-white/70' : 'text-zinc-400'}`}>
                              {resolveTenantCategory(t)} {t.client_code ? `· ${t.client_code}` : ''}
                            </span>
                          </div>
                          {isSelected && <HubIcon icon={Check} size={14} className="w-3.5 h-3.5 text-white shrink-0" />}
                        </button>
                      )
                    })}
                </div>
              </div>
            )}
          </div>

          <span className="text-zinc-300 font-light">/</span>

          {/* 3. APLICACIÓN (Multiselección) */}
          <div className="relative" ref={appMenuRef}>
            <button
              type="button"
              onClick={() => {
                setShowAppMenu((v) => !v)
                setShowCategoryMenu(false)
                setShowTenantMenu(false)
                setShowPlanMenu(false)
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border transition-all active:scale-[0.98] ${
                selectedAppIds.length > 0
                  ? 'bg-zinc-100 hover:bg-zinc-200/70 border-zinc-300 text-zinc-900 font-bold shadow-2xs'
                  : 'bg-zinc-50 hover:bg-zinc-100 border-zinc-200/80 text-zinc-600 font-medium'
              }`}
            >
              <HubIcon icon={Layers} size={14} className="w-3.5 h-3.5 opacity-70" />
              <span className="max-w-[160px] truncate">
                {selectedAppIds.length === 0
                  ? 'Aplicación: Todas'
                  : selectedAppIds.length === 1
                  ? (live.appsList.find((a) => a.id === selectedAppIds[0])?.name || '1 Aplicación')
                  : `${selectedAppIds.length} Aplicaciones`}
              </span>
              <HubIcon icon={ChevronDown} size={14} className="w-3.5 h-3.5 opacity-60" />
            </button>

            {showAppMenu && (
              <div className="absolute left-0 top-[calc(100%+6px)] w-60 bg-white border border-zinc-200 rounded-xl shadow-xl z-50 p-2 text-xs animate-in fade-in duration-150">
                <p className="px-2.5 py-1 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Aplicación del Ecosistema</p>
                <div className="space-y-1 mt-1 max-h-56 overflow-y-auto">
                  <button
                    type="button"
                    onClick={() => setSelectedAppIds([])}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg font-medium transition-colors flex items-center justify-between ${
                      selectedAppIds.length === 0 ? 'bg-zinc-100 text-zinc-900 font-bold' : 'text-zinc-700 hover:bg-zinc-50'
                    }`}
                  >
                    <span>Todas las Aplicaciones</span>
                    {selectedAppIds.length === 0 && <HubIcon icon={Check} size={14} className="w-3.5 h-3.5 text-zinc-900" />}
                  </button>
                  {live.appsList.map((app) => {
                    const isSelected = selectedAppIds.includes(app.id)
                    return (
                      <button
                        key={app.id}
                        type="button"
                        onClick={() => toggleApp(app.id)}
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg font-medium transition-colors flex items-center justify-between ${
                          isSelected ? 'bg-zinc-900 text-white font-semibold' : 'text-zinc-700 hover:bg-zinc-50'
                        }`}
                      >
                        <span className="truncate pr-2">{app.name}</span>
                        {isSelected && <HubIcon icon={Check} size={14} className="w-3.5 h-3.5 text-white shrink-0" />}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          <span className="text-zinc-300 font-light">/</span>

          {/* 4. PLAN (Multiselección) */}
          <div className="relative" ref={planMenuRef}>
            <button
              type="button"
              onClick={() => {
                setShowPlanMenu((v) => !v)
                setShowCategoryMenu(false)
                setShowTenantMenu(false)
                setShowAppMenu(false)
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border transition-all active:scale-[0.98] ${
                selectedPlans.length > 0
                  ? 'bg-zinc-100 hover:bg-zinc-200/70 border-zinc-300 text-zinc-900 font-bold shadow-2xs'
                  : 'bg-zinc-50 hover:bg-zinc-100 border-zinc-200/80 text-zinc-600 font-medium'
              }`}
            >
              <HubIcon icon={SlidersHorizontal} size={14} className="w-3.5 h-3.5 opacity-70" />
              <span className="max-w-[150px] truncate">
                {selectedPlans.length === 0
                  ? 'Plan: Todos'
                  : selectedPlans.length === 1
                  ? selectedPlans[0]
                  : `${selectedPlans.length} Planes`}
              </span>
              <HubIcon icon={ChevronDown} size={14} className="w-3.5 h-3.5 opacity-60" />
            </button>

            {showPlanMenu && (
              <div className="absolute left-0 top-[calc(100%+6px)] w-52 bg-white border border-zinc-200 rounded-xl shadow-xl z-50 p-2 text-xs animate-in fade-in duration-150">
                <p className="px-2.5 py-1 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Plan de Suscripción</p>
                <div className="space-y-1 mt-1">
                  <button
                    type="button"
                    onClick={() => setSelectedPlans([])}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg font-medium transition-colors flex items-center justify-between ${
                      selectedPlans.length === 0 ? 'bg-zinc-100 text-zinc-900 font-bold' : 'text-zinc-700 hover:bg-zinc-50'
                    }`}
                  >
                    <span>Todos los Planes</span>
                    {selectedPlans.length === 0 && <HubIcon icon={Check} size={14} className="w-3.5 h-3.5 text-zinc-900" />}
                  </button>
                  {['Premium', 'Intermedio', 'Básico', 'Sin plan'].map((p) => {
                    const isSelected = selectedPlans.includes(p)
                    return (
                      <button
                        key={p}
                        type="button"
                        onClick={() => togglePlan(p)}
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg font-medium transition-colors flex items-center justify-between ${
                          isSelected ? 'bg-zinc-900 text-white font-semibold' : 'text-zinc-700 hover:bg-zinc-50'
                        }`}
                      >
                        <span className="truncate pr-2">{p}</span>
                        {isSelected && <HubIcon icon={Check} size={14} className="w-3.5 h-3.5 text-white shrink-0" />}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {/* BOTÓN RESTABLECER FILTROS */}
          {hasAnyFilter && (
            <button
              type="button"
              onClick={resetFilters}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-600 rounded-lg text-xs font-semibold transition-colors ml-auto shrink-0 cursor-pointer"
              title="Restablecer todos los filtros"
            >
              <span>Restablecer</span>
              <HubIcon icon={X} size={13} className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Row 1: KPI Cards con Telemetría Reactiva */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* KPI 1: Empresas Activas */}
          <div className="bg-white border border-zinc-200/80 rounded-xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 hover:shadow-[0_10px_25px_rgba(0,0,0,0.06)] transition-all duration-200 ease-out cursor-default">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
                  <HubIcon icon={Building2} size={16} className="w-4 h-4" />
                </span>
                <span className="text-xs font-semibold text-zinc-600">Empresas activas</span>
              </div>
              <span className="text-[10px] font-bold text-zinc-400">Total: {live.totalTenants}</span>
            </div>
            <div className="mt-2.5 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold tracking-tight text-zinc-950">{live.activeTenants}</span>
            </div>
            {live.activeTenants > 0 ? (
              <p className="text-xs font-semibold text-blue-600 mt-1.5 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" /> Ecosistema activo
              </p>
            ) : (
              <p className="text-xs font-medium text-zinc-400 mt-1.5 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-300" /> Sin empresas activas
              </p>
            )}
            <svg className="w-full h-7 mt-2" viewBox="0 0 100 20" preserveAspectRatio="none">
              {live.activeTenants > 0 ? (
                <polyline fill="none" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" points="0,15 20,12 40,14 60,8 80,10 100,3" />
              ) : (
                <polyline fill="none" stroke="#e4e4e7" strokeWidth="1.5" strokeLinecap="round" points="0,15 100,15" />
              )}
            </svg>
          </div>

          {/* KPI 2: MRR Recurrente */}
          <div className="bg-white border border-zinc-200/80 rounded-xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 hover:shadow-[0_10px_25px_rgba(0,0,0,0.06)] transition-all duration-200 ease-out cursor-default">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
                  <HubIcon icon={CreditCard} size={16} className="w-4 h-4" />
                </span>
                <span className="text-xs font-semibold text-zinc-600">MRR Recurrente</span>
              </div>
              <span className="text-[10px] font-bold text-emerald-600">Suscripciones</span>
            </div>
            <div className="mt-2.5 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold tracking-tight text-zinc-950">{mrrDisplay}</span>
            </div>
            {live.mrr > 0 ? (
              <p className="text-xs font-semibold text-emerald-600 mt-1.5 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> ARR: S/ {(live.mrr * 12).toLocaleString('es-PE')}
              </p>
            ) : (
              <p className="text-xs font-medium text-zinc-400 mt-1.5 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-300" /> Sin cobros recurrentes
              </p>
            )}
            <svg className="w-full h-7 mt-2" viewBox="0 0 100 20" preserveAspectRatio="none">
              {live.mrr > 0 ? (
                <polyline fill="none" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" points="0,18 20,14 40,16 60,8 80,9 100,2" />
              ) : (
                <polyline fill="none" stroke="#e4e4e7" strokeWidth="1.5" strokeLinecap="round" points="0,15 100,15" />
              )}
            </svg>
          </div>

          {/* KPI 3: Usuarios Totales */}
          <div className="bg-white border border-zinc-200/80 rounded-xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 hover:shadow-[0_10px_25px_rgba(0,0,0,0.06)] transition-all duration-200 ease-out cursor-default">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-orange-50 text-[#ff4b0b]">
                  <HubIcon icon={Users} size={16} className="w-4 h-4" />
                </span>
                <span className="text-xs font-semibold text-zinc-600">Usuarios totales</span>
              </div>
              <span className="text-[10px] font-bold text-orange-600">Directorio BD</span>
            </div>
            <div className="mt-2.5 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold tracking-tight text-zinc-950">{live.totalUsers}</span>
            </div>
            <p className="text-xs font-semibold text-[#ff4b0b] mt-1.5 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ff4b0b] animate-pulse" /> {live.activeApps} apps asignadas
            </p>
            <svg className="w-full h-7 mt-2" viewBox="0 0 100 20" preserveAspectRatio="none">
              <polyline fill="none" stroke="#ff4b0b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" points="0,16 20,12 40,15 60,6 80,10 100,2" />
            </svg>
          </div>

          {/* KPI 4: Facturación Consolidada */}
          <div className="bg-white border border-zinc-200/80 rounded-xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 hover:shadow-[0_10px_25px_rgba(0,0,0,0.06)] transition-all duration-200 ease-out cursor-default">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-purple-50 text-purple-600">
                  <HubIcon icon={Receipt} size={16} className="w-4 h-4" />
                </span>
                <span className="text-xs font-semibold text-zinc-600">Caja consolidada</span>
              </div>
              <span className="text-[10px] font-bold text-purple-600">Inventario + Pagos</span>
            </div>
            <div className="mt-2.5 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold tracking-tight text-zinc-950">{money}</span>
            </div>
            {live.revenue > 0 ? (
              <p className="text-xs font-semibold text-purple-600 mt-1.5 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" /> Cobros completados
              </p>
            ) : (
              <p className="text-xs font-medium text-zinc-400 mt-1.5 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-300" /> Sin cobros registrados
              </p>
            )}
            <svg className="w-full h-7 mt-2" viewBox="0 0 100 20" preserveAspectRatio="none">
              {live.revenue > 0 ? (
                <polyline fill="none" stroke="#a855f7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" points="0,14 20,16 40,10 60,12 80,5 100,2" />
              ) : (
                <polyline fill="none" stroke="#e4e4e7" strokeWidth="1.5" strokeLinecap="round" points="0,15 100,15" />
              )}
            </svg>
          </div>

        {/* Tarjetas de Métricas Personalizadas (Super Administrador) */}
        {customMetrics.map((cm) => (
          <div key={cm.id} className="bg-white border border-zinc-200/80 rounded-xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 hover:shadow-[0_10px_25px_rgba(0,0,0,0.06)] transition-all duration-200 ease-out cursor-default relative group">
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-orange-50 text-[#ff4b0b]">
                  <Activity className="w-4 h-4" />
                </div>
                <span className="text-xs font-semibold text-zinc-600 truncate max-w-[140px]">{cm.name}</span>
              </div>
              <button
                type="button"
                onClick={() => setCustomMetrics((prev) => prev.filter((m) => m.id !== cm.id))}
                className="opacity-0 group-hover:opacity-100 text-zinc-400 hover:text-red-500 transition-all p-1"
                title="Eliminar métrica"
              >
                <HubIcon icon={X} size={14} className="w-3.5 h-3.5" />
              </button>
            </div>
            <h3 className="text-3xl font-extrabold tracking-tight text-zinc-900 mt-2">
              {cm.unit === 'currency' ? `S/ ${cm.val.toLocaleString('es-PE')}` : cm.unit === 'pct' ? `${cm.val}%` : cm.val}
            </h3>
            <p className="text-xs font-semibold text-[#ff4b0b] mt-1.5 flex items-center gap-1.5">
              Personalizada por Super Admin
            </p>
            <svg className="w-full h-7 mt-2" viewBox="0 0 100 20" preserveAspectRatio="none">
              <polyline fill="none" stroke="#ff4b0b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" points="0,15 25,8 50,14 75,6 100,2" />
            </svg>
          </div>
        ))}
      </div>

      {/* Row 2: Gráfico Horizontal de Crecimiento (2 Cols) + Actividad Reciente al Lado (1 Col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Left: Gráfico Horizontal de Crecimiento de Ventas e Ingresos (lg:col-span-2) */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-zinc-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
              <div>
                <h3 className="text-sm font-bold text-zinc-950">Crecimiento de ingresos y ventas</h3>
                <p className="text-xs text-zinc-500 mt-0.5">Pagos de pasarelas y pedidos comerciales consolidado por mes</p>
              </div>
              <div className="flex items-center gap-1.5 bg-zinc-100 p-1 rounded-xl border border-zinc-200/60">
                {[
                  { id: '30d', label: '30 d' },
                  { id: '90d', label: '90 d' },
                  { id: '12m', label: '12 m' },
                  { id: 'all', label: 'Todo' },
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setRevenueTimeRange(t.id)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                      revenueTimeRange === t.id
                        ? 'bg-white text-zinc-950 shadow-2xs font-bold'
                        : 'text-zinc-500 hover:text-zinc-900'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {live && live.hasRevenue ? (
              <div className="h-56 flex items-end justify-between gap-2 pt-6 px-2">
                {live.bars.map((b, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center h-full justify-end group relative">
                    <div className="absolute -top-7 opacity-0 group-hover:opacity-100 transition-opacity bg-zinc-900 text-white text-[10px] font-mono px-2 py-0.5 rounded-md whitespace-nowrap z-10 shadow-sm pointer-events-none">
                      {b.label}
                    </div>
                    <div
                      className="w-full bg-gradient-to-t from-[#ff4b0b] to-[#ff7a45] rounded-t-lg transition-all duration-300 ease-out group-hover:brightness-110"
                      style={{ height: b.height }}
                    />
                    <span className="text-[11px] font-medium text-zinc-400 mt-2">{b.month}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-56 flex items-center justify-center rounded-xl bg-zinc-50/70 border border-dashed border-zinc-200">
                <p className="text-xs text-zinc-400 font-medium">
                  {live ? 'Sin cobros ni ventas registradas en este período.' : 'Cargando datos en vivo…'}
                </p>
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center justify-between text-[11px] text-zinc-400 font-medium">
            <span>Volumen consolidado: {money}</span>
            <span className="text-zinc-500 font-semibold">MRR estimado: {mrrDisplay}</span>
          </div>
        </div>

        {/* Right: Actividad Reciente al Lado a la Misma Altura (lg:col-span-1) */}
        <div className="lg:col-span-1 bg-white rounded-2xl p-6 border border-zinc-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <h3 className="text-sm font-bold text-zinc-950">Actividad reciente</h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('Empresas')}
                className="text-[11px] font-bold text-zinc-500 hover:text-zinc-950 transition-colors flex items-center gap-0.5 cursor-pointer"
              >
                Ver todo <HubIcon icon={ArrowRight} size={12} className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-3">
              {live.recent.map((act, i) => (
                <div key={i} className="flex items-start gap-3 text-xs p-2 rounded-xl hover:bg-zinc-50 transition-colors">
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${act.color}`}>
                    <HubIcon icon={act.title.includes('empresa') ? Building2 : User} size={13} className="w-3.5 h-3.5" />
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-zinc-900 truncate">{act.title}</p>
                    <p className="text-zinc-500 text-[11px] truncate mt-0.5">{act.detail}</p>
                  </div>
                  <span className="text-[10px] font-medium text-zinc-400 whitespace-nowrap bg-zinc-100 px-2 py-0.5 rounded-full">
                    {timeAgo(act.time)}
                  </span>
                </div>
              ))}
              {live.recent.length === 0 && (
                <p className="text-xs text-zinc-400 py-6 text-center">Sin actividad registrada todavía.</p>
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center justify-between text-[11px] text-zinc-400 font-medium">
            <span>En vivo</span>
            <span className="text-emerald-600 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Sincronizado
            </span>
          </div>
        </div>
      </div>

      {/* Row 3: Fila de 3 Tarjetas de Gráficos Analíticos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        
        {/* Gráfico 1: Rendimiento Comercial */}
        <div className="bg-white border border-zinc-200/80 rounded-xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 hover:shadow-[0_10px_25px_rgba(0,0,0,0.06)] transition-all duration-200 cursor-default">
          <div className="flex justify-between items-center mb-5 relative">
            <h4 className="text-base font-bold text-zinc-900 tracking-tight">Rendimiento comercial</h4>
            
            {/* Dropdown Interactivo */}
            <div className="relative" ref={rendimientoMenuRef}>
              <button
                type="button"
                onClick={() => {
                  setShowRendimientoMenu((v) => !v)
                  setShowAppTimeframeMenu(false)
                  setShowPlanTimeframeMenu(false)
                }}
                className="text-xs font-semibold flex items-center gap-1 bg-zinc-100 hover:bg-zinc-200 transition-colors text-zinc-700 px-2.5 py-1.5 rounded-lg active:scale-[0.98]"
              >
                <span>{rendimientoPeriod}</span>
                <HubIcon icon={ChevronDown} size={14} className="w-3.5 h-3.5 text-zinc-500" />
              </button>

              {showRendimientoMenu && (
                <div className="absolute right-0 mt-1.5 w-36 bg-white border border-zinc-200 rounded-xl shadow-xl z-50 py-1 text-xs animate-in fade-in duration-150">
                  {['Diario', 'Semanal', 'Mensual', 'Trimestral'].map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => {
                        setRendimientoPeriod(p)
                        setShowRendimientoMenu(false)
                      }}
                      className={`w-full text-left px-3 py-1.5 font-medium transition-colors ${
                        rendimientoPeriod === p ? 'bg-zinc-50 text-zinc-900 font-bold' : 'text-zinc-600 hover:bg-zinc-50'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4 mb-4 text-xs font-semibold text-zinc-500">
            <div className="flex items-center gap-1.5"><div className="w-3 h-1 rounded-full bg-[#ff4b0b]"></div> Ingresos (S/)</div>
            <div className="flex items-center gap-1.5"><div className="w-3 h-1 rounded-full bg-zinc-900"></div> Transacciones</div>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={live.rendimientoData} margin={{ top: 5, right: 0, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f1f4" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#71717a' }} dy={10} />
                <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#71717a' }} tickFormatter={(val) => `S/${val >= 1000 ? `${Math.round(val / 1000)}k` : val}`} />
                <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#71717a' }} />
                <RechartsTooltip contentStyle={{ borderRadius: '10px', border: '1px solid #e4e4e7', fontSize: '12px', boxShadow: '0 4px 12px -2px rgba(0,0,0,0.08)' }} />
                <Line yAxisId="left" type="monotone" dataKey="ingresos" name="Ingresos (S/)" stroke="#ff4b0b" strokeWidth={2.5} dot={{ r: 0 }} activeDot={{ r: 5, strokeWidth: 0, fill: '#ff4b0b' }} />
                <Line yAxisId="right" type="monotone" dataKey="operaciones" name="Transacciones" stroke="#18181b" strokeWidth={2.5} dot={{ r: 0 }} activeDot={{ r: 5, strokeWidth: 0, fill: '#18181b' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico 2: Ingresos por Aplicación */}
        <div className="bg-white border border-zinc-200/80 rounded-xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 hover:shadow-[0_10px_25px_rgba(0,0,0,0.06)] transition-all duration-200 cursor-default">
          <div className="flex justify-between items-center mb-5 relative">
            <h4 className="text-base font-bold text-zinc-900 tracking-tight">Ingresos por aplicación</h4>
            
            {/* Dropdown Interactivo */}
            <div className="relative" ref={appTimeframeMenuRef}>
              <button
                type="button"
                onClick={() => {
                  setShowAppTimeframeMenu((v) => !v)
                  setShowRendimientoMenu(false)
                  setShowPlanTimeframeMenu(false)
                }}
                className="text-xs font-semibold flex items-center gap-1 bg-zinc-100 hover:bg-zinc-200 transition-colors text-zinc-700 px-2.5 py-1.5 rounded-lg active:scale-[0.98]"
              >
                <span>{appTimeframe}</span>
                <HubIcon icon={ChevronDown} size={14} className="w-3.5 h-3.5 text-zinc-500" />
              </button>

              {showAppTimeframeMenu && (
                <div className="absolute right-0 mt-1.5 w-40 bg-white border border-zinc-200 rounded-xl shadow-xl z-50 py-1 text-xs animate-in fade-in duration-150">
                  {['Este mes', 'Últimos 30 días', 'Este trimestre', 'Año actual'].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => {
                        setAppTimeframe(t)
                        setShowAppTimeframeMenu(false)
                      }}
                      className={`w-full text-left px-3 py-1.5 font-medium transition-colors ${
                        appTimeframe === t ? 'bg-zinc-50 text-zinc-900 font-bold' : 'text-zinc-600 hover:bg-zinc-50'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4 mb-4 text-xs font-semibold text-zinc-500">
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm bg-[#ff4b0b]"></div> Facturado</div>
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm bg-zinc-200"></div> Suscripciones</div>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={live.appStats} layout="vertical" margin={{ top: 0, right: 15, left: 5, bottom: 0 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#52525b', fontWeight: 500 }} width={95} />
                <RechartsTooltip cursor={{ fill: '#f4f4f5' }} contentStyle={{ borderRadius: '10px', border: '1px solid #e4e4e7', fontSize: '12px', boxShadow: '0 4px 12px -2px rgba(0,0,0,0.08)' }} />
                <Bar dataKey="facturacion" name="Facturado (S/)" stackId="a" fill="#ff4b0b" barSize={16} radius={[0, 0, 0, 0]} />
                <Bar dataKey="subs" name="Suscripciones" stackId="a" fill="#e4e4e7" barSize={16} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico 3: Empresas por Plan */}
        <div className="bg-white border border-zinc-200/80 rounded-xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 hover:shadow-[0_10px_25px_rgba(0,0,0,0.06)] transition-all duration-200 cursor-default flex flex-col justify-between">
          <div className="flex justify-between items-center mb-3 relative">
            <h4 className="text-base font-bold text-zinc-900 tracking-tight">Empresas por plan</h4>
            
            {/* Dropdown Interactivo */}
            <div className="relative" ref={planTimeframeMenuRef}>
              <button
                type="button"
                onClick={() => {
                  setShowPlanTimeframeMenu((v) => !v)
                  setShowRendimientoMenu(false)
                  setShowAppTimeframeMenu(false)
                }}
                className="text-xs font-semibold flex items-center gap-1 bg-zinc-100 hover:bg-zinc-200 transition-colors text-zinc-700 px-2.5 py-1.5 rounded-lg active:scale-[0.98]"
              >
                <span>{planTimeframe}</span>
                <HubIcon icon={ChevronDown} size={14} className="w-3.5 h-3.5 text-zinc-500" />
              </button>

              {showPlanTimeframeMenu && (
                <div className="absolute right-0 mt-1.5 w-40 bg-white border border-zinc-200 rounded-xl shadow-xl z-50 py-1 text-xs animate-in fade-in duration-150">
                  {['Este mes', 'Últimos 30 días', 'Este trimestre', 'Año actual'].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => {
                        setPlanTimeframe(t)
                        setShowPlanTimeframeMenu(false)
                      }}
                      className={`w-full text-left px-3 py-1.5 font-medium transition-colors ${
                        planTimeframe === t ? 'bg-zinc-50 text-zinc-900 font-bold' : 'text-zinc-600 hover:bg-zinc-50'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-around gap-4 py-2">
            <div className="relative w-32 h-32 flex items-center justify-center shrink-0">
              <div
                className="w-32 h-32 rounded-full"
                style={{
                  background:
                    live.donut.length > 0
                      ? `conic-gradient(${live.donut.join(', ')})`
                      : 'conic-gradient(#e4e4e7 0deg 360deg)',
                }}
              />
              <div className="absolute w-[72%] h-[72%] bg-white rounded-full flex items-center justify-center shadow-xs">
                <div className="text-center">
                  <span className="block text-[9px] text-zinc-400 font-medium">Total</span>
                  <span className="block text-base font-extrabold text-zinc-950">{live.planTotal}</span>
                  <span className="block text-[8px] text-zinc-400">empresas</span>
                </div>
              </div>
            </div>

            <div className="space-y-1.5 flex-1 pl-2">
              {Object.entries(live.planCounts).map(([label, count]) => {
                const pct = Math.round((count / live.planTotal) * 100)
                const color =
                  label === 'Premium'
                    ? '#ff4b0b'
                    : label === 'Intermedio'
                    ? '#ff7a45'
                    : label === 'Básico'
                    ? '#ff9b73'
                    : '#d4d4d8'
                return (
                  <button
                    key={label}
                    type="button"
                    onClick={() => setActiveTab('Empresas')}
                    className="w-full flex items-center justify-between gap-2 text-xs font-semibold p-1 rounded-lg hover:bg-zinc-50 transition-colors text-left"
                    title={`Ver empresas con plan ${label}`}
                  >
                    <div className="flex items-center gap-1.5 truncate">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: color }} />
                      <span className="text-zinc-700 truncate">{label}</span>
                    </div>
                    <span className="text-zinc-500 shrink-0 text-[11px]">
                      {count} <span className="text-zinc-400 font-normal">({pct}%)</span>
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="border-t border-zinc-100 pt-2 text-right">
            <button
              type="button"
              onClick={() => setActiveTab('Empresas')}
              className="text-xs font-bold text-orange-600 hover:text-orange-700 transition-colors inline-flex items-center gap-1"
            >
              Ver todas las empresas →
            </button>
          </div>
        </div>

      </div>

      {/* Notas del Administrador (Barra Informativa Exclusiva de Super Admin) */}
      <div className="bg-amber-50/60 rounded-2xl p-4 border border-amber-200/80 shadow-2xs flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3 min-w-0">
          <span className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700 shrink-0">
            <HubIcon icon={PenSquare} size={15} className="w-4 h-4" />
          </span>
          <div className="min-w-0">
            <span className="text-xs font-bold text-amber-900 block">Notas del administrador</span>
            <p className="text-xs text-amber-800/90 truncate font-medium">
              Revisar renovaciones de planes este mes. Monitorear límites de almacenamiento y cuotas de consumo de agentes IA.
            </p>
          </div>
        </div>
      </div>

      {/* Modal Nueva Métrica (Super Administrador) */}
      {isMetricModalOpen && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl border border-zinc-200 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-5 border-b border-zinc-100 bg-zinc-50/50">
              <div>
                <h2 className="text-base font-extrabold text-zinc-900">Crear Métrica Personalizada</h2>
                <p className="text-xs text-zinc-500 font-medium">Exclusivo de Super Administrador para monitorización en vivo.</p>
              </div>
              <button
                type="button"
                onClick={() => setIsMetricModalOpen(false)}
                className="p-1.5 hover:bg-zinc-200 rounded-full transition-colors cursor-pointer text-zinc-500"
              >
                <HubIcon icon={X} size={16} className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault()
                if (!metricForm.name.trim()) return
                const newMetric = {
                  id: `metric_${Date.now()}`,
                  name: metricForm.name.trim(),
                  val: Number(metricForm.target) || 0,
                  unit: metricForm.unit,
                  source: metricForm.source,
                }
                setCustomMetrics((prev) => [...prev, newMetric])
                setMetricForm({ name: '', source: 'tenants', target: 50, unit: 'num' })
                setIsMetricModalOpen(false)
              }}
              className="p-6 space-y-4"
            >
              <div>
                <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1.5">Nombre de la Métrica</label>
                <input
                  type="text"
                  required
                  placeholder="ej. Tasa de Retención, LTV Estimado, Clientes VIP"
                  value={metricForm.name}
                  onChange={(e) => setMetricForm({ ...metricForm, name: e.target.value })}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs font-semibold text-zinc-800 outline-none focus:border-[#ff4b0b] focus:ring-1 focus:ring-[#ff4b0b]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1.5">Origen de Datos</label>
                  <select
                    value={metricForm.source}
                    onChange={(e) => setMetricForm({ ...metricForm, source: e.target.value })}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs font-semibold text-zinc-800 outline-none focus:border-[#ff4b0b]"
                  >
                    <option value="tenants">Empresas / Tenants</option>
                    <option value="subs">Suscripciones / MRR</option>
                    <option value="pays">Pasarelas / Pagos</option>
                    <option value="orders">Inventario / Ventas</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1.5">Unidad de Medida</label>
                  <select
                    value={metricForm.unit}
                    onChange={(e) => setMetricForm({ ...metricForm, unit: e.target.value })}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs font-semibold text-zinc-800 outline-none focus:border-[#ff4b0b]"
                  >
                    <option value="num">Número entero (123)</option>
                    <option value="currency">Moneda (S/ 1,234)</option>
                    <option value="pct">Porcentaje (85%)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1.5">Valor Inicial / Meta</label>
                <input
                  type="number"
                  required
                  placeholder="ej. 100"
                  value={metricForm.target}
                  onChange={(e) => setMetricForm({ ...metricForm, target: e.target.value })}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs font-semibold text-zinc-800 outline-none focus:border-[#ff4b0b]"
                />
              </div>

              <div className="pt-3 border-t border-zinc-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsMetricModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-zinc-600 hover:bg-zinc-100 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-sm font-bold bg-[#ff4b0b] hover:bg-[#e03f06] text-white transition-colors shadow-xs cursor-pointer"
                >
                  Guardar Métrica
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Row 3: Ecosystem Applications Grid */}
      <div className="bg-white rounded-2xl p-6 border border-zinc-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <h3 className="text-sm font-bold text-zinc-950">Aplicaciones del ecosistema</h3>
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
          <p className="text-xs italic text-zinc-400">“Tecnología para negocios que avanzan.”</p>
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
          <h3 className="text-sm font-bold text-zinc-950">Mis aplicaciones</h3>
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
      const { data: me } = await supabase.from('users').select('tenant_id, role, is_platform_admin, permissions, full_name, avatar_url, created_at').eq('id', session.user.id).maybeSingle()
      if (!alive) return

      // Si el usuario fue eliminado en Supabase o su cuenta ya no existe:
      // limpiar la sesión residual de localStorage y redirigir a /login
      if (!me) {
        await supabase.auth.signOut().catch(() => {})
        navigate('/login', { replace: true })
        return
      }

      const metaIsPlatform = session.user.app_metadata?.role === 'platform_admin' || session.user.user_metadata?.role === 'platform_admin'
      const dbIsPlatform = me.role === 'admin' && me.is_platform_admin === true
      const isPlatformAdmin = dbIsPlatform || metaIsPlatform
      const role = isPlatformAdmin ? 'platform_admin' : (me.role || 'user')
      // Admin de marca = rol 'admin' con tenant (dueño o co-admin) o plataforma.
      const isTenantAdmin = isPlatformAdmin || (me.role === 'admin' && Boolean(me.tenant_id))
      if (!isPlatformAdmin && !me.tenant_id) {
        navigate('/onboarding/tu-empresa', { replace: true })
        return
      }
      let tenantName = null
      if (me.tenant_id) {
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
    ;(async () => {        const { data } = await supabase.from('tenants').select('id, name, client_code').order('name')
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
    if (panelAuth.isPlatformAdmin && !actingAsBrand) return SUPER_ADMIN_NAV
    if (effectiveIsTenantAdmin) return TENANT_ADMIN_NAV
    const granted = new Set(panelAuth.permissions?.panel || [])
    return [
      ...WORKER_BASE_NAV,
      ...TENANT_ADMIN_NAV.filter((nav) => granted.has(nav.id) && !ADMIN_ONLY_NAV.has(nav.id)),
    ]
  }, [panelAuth, effectiveIsTenantAdmin, actingAsBrand])

  // Guard por tab: una sección no permitida vuelve a Inicio (defensa en capas, sin backend).
  // 'Mi cuenta' vive fuera del sidebar (se abre desde el menú de perfil), así que no está en
  // navItems: se excluye del guard para que F5 / URL directa en /hub/panel/mi-cuenta no rebote.
  const allowedTabIds = useMemo(() => new Set(navItems.map((nav) => nav.id)), [navItems])
  useEffect(() => {
    if (!panelAuth) return
    if (activeTab === 'Todas' || activeTab === 'Mi cuenta') return
    if (!allowedTabIds.has(activeTab)) navigate('/hub/panel')
  }, [panelAuth, activeTab, navigate, allowedTabIds])

  const name = identityResolved ? (panelAuth?.fullName || displayName(authUser?.email)) : null
  // Foto estable por usuario: solo avatar real (users.avatar_url). El onboarding nunca
  // asigna foto; sin ella se muestran las siglas. Neutra hasta resolver la identidad.
  const avatar = identityResolved ? (panelAuth?.avatarUrl || null) : null
  const initials = identityResolved && name ? nameWords(name).join(' ').split(' ').filter(Boolean).slice(0, 2).map((x) => x[0]).join('').toUpperCase() : ''

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
      // El detalle crudo de Supabase ("Bucket not found", "violates row-level security", etc.)
      // distingue bucket inexistente vs permisos RLS vs proyecto equivocado. Jamás lo tragar.
      if (upErr) throw new Error(`No se pudo subir la foto a Supabase Storage. Detalle real: ${upErr.message}`)
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

  // Búsqueda de personas en vivo (lógica "potente" del CRM en el Hub): escribe "fernando"
  // → usuarios reales de Supabase, con su marca (nombre + código) para que se entienda
  // a qué empresa pertenece. RLS limita el alcance: admin de marca solo ve a los suyos;
  // plataforma (sin scope) consulta el listado global. Debounce para no martillar la BD.
  const [searchUsers, setSearchUsers] = useState([])
  const [isSearchingUsers, setIsSearchingUsers] = useState(false)
  useEffect(() => {
    const q = globalSearchQuery.trim().toLowerCase()
    if (q.length < 2 || !panelAuth) { setSearchUsers([]); setIsSearchingUsers(false); return }
    if (!isPlatformAdmin && !effectiveIsTenantAdmin) { setSearchUsers([]); return }
    setIsSearchingUsers(true)
    let alive = true
    const t = setTimeout(async () => {
      try {
        let query = supabase
          .from('users')
          .select('id, full_name, email, avatar_url, role, tenant_id')
          .or(`full_name.ilike.%${q}%,email.ilike.%${q}%`)
          .limit(6)
        if (!isPlatformAdmin) query = query.eq('tenant_id', effectiveTenantId)
        const { data } = await query
        if (!alive) return
        const tenantMap = new Map((tenantOptions || []).map((t) => [t.id, t]))
        setSearchUsers((data || []).map((u) => ({
          id: u.id,
          name: nameWords(u.full_name || u.email || '?').join(' '),
          email: u.email || '',
          role: u.role || 'user',
          avatarUrl: u.avatar_url || null,
          tenantName: u.tenant_id
            ? (tenantMap.get(u.tenant_id)?.name || (u.tenant_id === effectiveTenantId ? effectiveTenantName : null))
            : null,
          tenantCode: u.tenant_id ? (tenantMap.get(u.tenant_id)?.client_code || null) : null,
        })))
      } catch (_) {
        if (alive) setSearchUsers([])
      } finally {
        if (alive) setIsSearchingUsers(false)
      }
    }, 250)
    return () => { alive = false; clearTimeout(t) }
  }, [globalSearchQuery, panelAuth, isPlatformAdmin, effectiveIsTenantAdmin, effectiveTenantId, effectiveTenantName, tenantOptions])

  // Marcas en el buscador (solo plataforma): escribe "zulens" → aparece la marca con su
  // código y un clic activa el contexto "ver como". Usa el catálogo ya cargado (sin query extra).
  const searchTenants = useMemo(() => {
    const q = globalSearchQuery.trim().toLowerCase()
    if (q.length < 2 || !isPlatformAdmin || !Array.isArray(tenantOptions)) return []
    return tenantOptions
      .filter((t) => (t.name || '').toLowerCase().includes(q) || (t.client_code || '').toLowerCase().includes(q))
      .slice(0, 4)
  }, [globalSearchQuery, isPlatformAdmin, tenantOptions])

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
                className={`flex items-center ${isSidebarCollapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2.5'} rounded-lg text-sm font-medium transition-all w-full text-left ${isActive ? 'bg-[var(--hub-hover)] text-white' : 'text-white/65 hover:text-white hover:bg-[var(--hub-chip)]'}`}
              >
                <HubIcon icon={Icon} size={16} className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#ff4b0b]' : ''}`} />
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

            {/* Waffle App Switcher — mismo orden que el CRM: hamburguesa primero, luego Apps */}
            <div className="relative">
              <button type="button" onClick={() => setIsWaffleOpen(!isWaffleOpen)} className="group flex items-center gap-2 h-10 px-3 rounded-full border border-[var(--hub-border)] bg-[var(--hub-chip)] hover:bg-[var(--hub-hover)] hover:border-white/20 text-white/80 transition-all duration-300 ease-out cursor-pointer" title="Ecosistema de Aplicaciones">
                <div className="grid grid-cols-3 gap-[3px] w-4 h-4 place-items-center">
                  {[...Array(9)].map((_, i) => (<span key={i} className="w-[3px] h-[3px] rounded-full bg-white/70 group-hover:bg-[#ff4b0b] transition-colors" />))}
                </div>
                <span className="text-sm font-bold text-white max-w-0 overflow-hidden group-hover:max-w-16 transition-all duration-350 ease-out whitespace-nowrap">Apps</span>
                <HubIcon icon={ChevronDown} size={14} className="w-3.5 h-3.5 text-[var(--hub-faint)] group-hover:text-white/80 transition-transform duration-200" />
              </button>
              <AppSwitcherDropdown isOpen={isWaffleOpen} onClose={() => setIsWaffleOpen(false)} />
            </div>

            {/* Tenant Global Switcher Pill: plataforma elige la marca ("ver como");
                el resto de roles la ve como indicador estático de su marca. */}
            <div className="relative">
              {isPlatformAdmin ? (
                <>
                  <button
                    type="button"
                    onClick={() => setIsTenantSwitcherOpen((o) => !o)}
                    className="flex items-center gap-2 h-10 px-3 rounded-full border border-[var(--hub-border)] bg-[var(--hub-chip)] hover:bg-[var(--hub-hover)] text-white text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#ff4b0b]/40 cursor-pointer transition-all"
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
                                  <span className="ml-auto text-[10px] font-semibold text-[var(--hub-faint)] shrink-0">{t.client_code}</span>
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
                    className="flex items-center gap-2 h-10 px-3 rounded-full border border-[var(--hub-border)] bg-[var(--hub-chip)] hover:bg-[var(--hub-hover)] text-white text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#ff4b0b]/40 cursor-pointer transition-all"
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
                <button type="button" className="flex items-center gap-2 h-10 px-3 rounded-full border border-[var(--hub-border)] bg-[var(--hub-chip)] text-white text-sm font-bold cursor-default" title="Tu marca">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="max-w-40 truncate">{panelAuth?.tenantName || 'Mi empresa'}</span>
                </button>
              )}
            </div>

          </div>

          {/* Search, Notifications & User Profile */}
          <div className="flex items-center gap-3 lg:gap-5 relative">
            <div className="relative block">
              <HubIcon icon={Search} size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[var(--hub-faint)]" />
              <input ref={searchInputRef} type="text" value={globalSearchQuery} onChange={(e) => setGlobalSearchQuery(e.target.value)} placeholder="Buscar empresas, usuarios, apps..."
                className="bg-[var(--hub-surface)] border border-[var(--hub-border)] rounded-full pl-10 pr-16 py-2.5 text-sm text-white placeholder:text-[var(--hub-faint)] focus:outline-none focus:border-[#ff4b0b]/50 focus:bg-[var(--hub-surface-strong)] w-[240px] md:w-[320px] lg:w-[420px] transition-all shadow-inner" />
              {globalSearchQuery ? (
                <button onClick={() => setGlobalSearchQuery('')} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--hub-dim)] hover:text-white transition-colors"><HubIcon icon={X} size={16} className="w-4 h-4" /></button>
              ) : (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  <kbd className="px-2 py-0.5 text-[11px] font-mono bg-[var(--hub-hover)] rounded-md text-[var(--hub-dim)] border border-[var(--hub-border-soft)]">Ctrl</kbd>
                  <kbd className="px-2 py-0.5 text-[11px] font-mono bg-[var(--hub-hover)] rounded-md text-[var(--hub-dim)] border border-[var(--hub-border-soft)]">K</kbd>
                </div>
              )}
              <AnimatePresence>
                {globalSearchQuery.trim() !== '' && (
                  <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }} transition={{ duration: 0.15 }}
                    className="absolute top-[calc(100%+12px)] left-0 w-full bg-[var(--hub-pop)] border border-[var(--hub-border)] rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.6)] z-[100] overflow-hidden">
                    {(filtered.length === 0 && searchUsers.length === 0 && searchTenants.length === 0 && !isSearchingUsers) ? (
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
                                    <div className="flex items-center gap-2 text-xs text-[var(--hub-faint)] mt-1"><span className="truncate">{app.pillar}</span><span className="px-1.5 py-0.5 rounded-md bg-[var(--hub-chip)] text-[var(--hub-dim)]">{app.badge || 'Pro'}</span></div>
                                  </div>
                                  <HubIcon icon={MessageSquare} size={20} className="w-5 h-5 text-[var(--hub-faint)] group-hover:text-[#ff4b0b] opacity-0 group-hover:opacity-100 transition-all shrink-0" />
                                </Link>
                              </li>
                            )
                          })}
                        </ul>
                        {searchTenants.length > 0 && (
                          <>
                            <div className="px-4 py-2.5 border-t border-[var(--hub-border-soft)] bg-[var(--hub-chip)]"><span className="text-xs font-bold text-[var(--hub-dim)] uppercase tracking-wider">Marcas</span></div>
                            <ul className="py-2">
                              {searchTenants.map((t) => (
                                <li key={t.id}>
                                  <button type="button" onClick={() => { setScopedTenant({ id: t.id, name: t.name }); setActiveTab('Inicio'); setGlobalSearchQuery('') }} className="w-full px-4 py-3 hover:bg-[var(--hub-chip)] transition-colors flex items-center gap-4 text-left group">
                                    <span className="w-9 h-9 rounded-full bg-[#ff4b0b]/10 text-[#ff4b0b] font-bold text-[11px] flex items-center justify-center shrink-0 border border-[#ff4b0b]/20">{(t.name || '?').slice(0, 2).toUpperCase()}</span>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-semibold text-white truncate group-hover:text-[#ff4b0b] transition-colors">{t.name}</p>
                                      {t.client_code && <p className="text-xs text-[var(--hub-faint)] mt-0.5">Código {t.client_code}</p>}
                                    </div>
                                    <span className="shrink-0 inline-flex items-center gap-1.5 px-2 py-1 rounded-lg border border-[var(--hub-border-soft)] text-[10px] font-bold text-[var(--hub-dim)] group-hover:text-white group-hover:border-white/20 transition-colors">
                                      <HubIcon icon={ChevronRight} size={12} className="w-3 h-3" /> Ver como
                                    </span>
                                  </button>

                                </li>
                              ))}
                            </ul>
                          </>
                        )}
                        {(searchUsers.length > 0 || isSearchingUsers) && (
                          <>
                            <div className="px-4 py-2.5 border-t border-[var(--hub-border-soft)] bg-[var(--hub-chip)]"><span className="text-xs font-bold text-[var(--hub-dim)] uppercase tracking-wider">Personas</span></div>
                            {isSearchingUsers && searchUsers.length === 0 ? (
                              <div className="px-4 py-3.5 flex items-center gap-4">
                                <span className="h-9 w-9 rounded-full bg-[var(--hub-hover)] animate-pulse shrink-0" />
                                <span className="h-3 w-44 rounded bg-[var(--hub-hover)] animate-pulse" />
                              </div>
                            ) : (
                              <ul className="py-2">
                                {searchUsers.map((u) => {
                                  const roleChip = u.role === 'admin' ? 'bg-[#ff4b0b]/15 text-orange-300'
                                    : u.role === 'editor' ? 'bg-sky-500/15 text-sky-300'
                                    : u.role === 'viewer' ? 'bg-emerald-500/15 text-emerald-300'
                                    : u.role === 'guest' ? 'bg-amber-500/15 text-amber-300'
                                    : 'bg-white/10 text-[var(--hub-dim)]'
                                  const roleLabel = u.role === 'admin' ? 'Admin' : u.role === 'editor' ? 'Editor' : u.role === 'viewer' ? 'Viewer' : u.role === 'guest' ? 'Invitado' : 'Miembro'
                                  const uInitials = u.name.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase() || '?'
                                  return (
                                    <li key={u.id}>
                                      <button type="button" onClick={() => { setGlobalSearchQuery(''); navigate(`/hub/panel/usuarios?usuario=${u.id}`) }} className="w-full px-4 py-3 hover:bg-[var(--hub-chip)] transition-colors flex items-center gap-4 text-left group">
                                        {u.avatarUrl ? (
                                          <img src={u.avatarUrl} alt={u.name} className="w-9 h-9 rounded-full object-cover border border-[var(--hub-border)] shrink-0" />
                                        ) : (
                                          <span className="w-9 h-9 rounded-full bg-[var(--hub-hover)] text-[var(--hub-dim)] font-bold text-[11px] flex items-center justify-center shrink-0 border border-[var(--hub-border)]">{uInitials}</span>
                                        )}
                                        <div className="flex-1 min-w-0">
                                          <div className="flex items-center gap-2 min-w-0">
                                            <p className="text-sm font-semibold text-white truncate group-hover:text-[#ff4b0b] transition-colors">{u.name}</p>
                                            <span className={`shrink-0 px-1.5 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wide ${roleChip}`}>{roleLabel}</span>
                                          </div>
                                          <div className="flex items-center gap-2 text-xs text-[var(--hub-faint)] mt-1">
                                            {u.email && <span className="truncate">{u.email}</span>}
                                            {u.tenantName && (
                                              <span className="ml-auto shrink-0 inline-flex items-center gap-1.5 px-1.5 py-0.5 rounded-md bg-[var(--hub-chip)] border border-[var(--hub-border-soft)] text-[10px] font-semibold text-[var(--hub-dim)]">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                                {u.tenantName}{u.tenantCode ? ` · ${u.tenantCode}` : ''}
                                              </span>
                                            )}
                                          </div>
                                        </div>
                                        <HubIcon icon={ChevronRight} size={16} className="w-4 h-4 text-[var(--hub-faint)] group-hover:text-[#ff4b0b] opacity-0 group-hover:opacity-100 transition-all shrink-0" />
                                      </button>
                                    </li>
                                  )
                                })}
                              </ul>
                            )}
                          </>
                        )}
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
                ) : identityResolved ? (
                  <span onClick={(e) => { e.stopPropagation(); goTab('Mi cuenta') }} title={initials ? 'Sube tu foto de perfil — clic para subirla' : undefined} className="relative inline-flex w-8 h-8 lg:w-9 lg:h-9 rounded-full border border-[var(--hub-border)] bg-[var(--hub-chip)] text-[var(--hub-dim)] font-bold items-center justify-center text-xs lg:text-sm select-none cursor-pointer hover:border-[#ff4b0b]/60 hover:text-white transition-colors">{initials || '?'}
                    <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#ff4b0b] ring-2 ring-[#111111]" aria-hidden="true" />
                  </span>
                ) : (
                  <span className="w-8 h-8 lg:w-9 lg:h-9 rounded-full border border-[var(--hub-border)] bg-[var(--hub-hover)] animate-pulse" aria-hidden="true" />
                )}
                <div className="hidden lg:flex flex-col justify-center">
                  {identityResolved ? (
                    <>
                      <span className="text-white text-[13px] font-bold leading-none">{shortName(name) || name}</span>
                      <span className="text-[10px] text-[var(--hub-dim)] leading-none mt-1.5">{isPlatformAdmin ? 'Super Administrador' : (panelAuth?.isTenantAdmin ? 'Administrador de empresa' : 'Miembro del equipo')}</span>
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
                        ) : identityResolved ? (
                          <span title={initials ? 'Sube tu foto de perfil' : undefined} className="relative inline-flex w-12 h-12 rounded-full border border-[var(--hub-border)] bg-[var(--hub-hover)] text-[var(--hub-dim)] font-bold items-center justify-center text-sm select-none shrink-0">{initials || '?'}
                            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-[#ff4b0b] ring-2 ring-[var(--hub-surface)]" aria-hidden="true" />
                          </span>
                        ) : (
                          <span className="w-12 h-12 rounded-full border border-[var(--hub-border)] bg-[var(--hub-hover)] animate-pulse shrink-0" aria-hidden="true" />
                        )}
                        <div className="flex-1 min-w-0">
                          {identityResolved ? (
                            <><p className="text-sm font-bold text-white truncate">{readableName(name) || name}</p><p className="text-xs text-[var(--hub-dim)] truncate mt-0.5">{authUser?.email || 'Verificando identidad…'}</p></>
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
                    <button onClick={() => { setGlobalSearchQuery(''); goTab('Inicio') }} className="mt-4 h-10 px-5 rounded-xl bg-zinc-950 text-white text-sm font-bold">Limpiar filtros</button>
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
                              <h3 className="text-sm font-bold text-zinc-950 tracking-tight pr-2">{route.title}</h3>
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
          <button className="group relative flex items-center justify-center w-[52px] h-[52px] rounded-full bg-gradient-to-tr from-[#ff4b0b] to-[#ff7a45] text-white shadow-[0_8px_30px_rgba(255,75,11,0.4)] hover:-translate-y-1 transition-all duration-300 ease-out border border-[var(--hub-border)]" title="Qaway IA Insights">
            <HubIcon icon={Sparkles} size={24} className="w-6 h-6 animate-pulse" />
          </button>
          <button className="group relative flex items-center justify-center w-[52px] h-[52px] rounded-full bg-gradient-to-tr from-[#ff4b0b] to-[#ff7a45] text-white shadow-[0_8px_30px_rgba(255,75,11,0.4)] hover:-translate-y-1 transition-all duration-300 ease-out border border-white/20" title="Chatbot de Ayuda">
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
