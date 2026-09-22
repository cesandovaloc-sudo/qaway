import React, { useState, useEffect, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { HubIcon } from '@/components/ui/icons'
import {
  AlertCircle, ArrowRight, BarChart3, Bell, Bot, Briefcase, Building2, Calendar, ChevronDown, Clock, CreditCard,
  FileImage, FlaskConical, FolderKanban, HelpCircle, Home, Instagram, LayoutGrid, Menu, MessageSquare,
  Package, PenSquare, Plus, Receipt, RefreshCw, Route, Search, Settings, Shield, Sparkles,
  Star, Tag, Target, TrendingUp, User, UserPlus, Users, Wrench, X, Zap,
} from '@/components/ui/icons/hubIcons'
import { getAuthUser, logoutUser } from '@/config/auth'
import { supabase } from '@/config/supabase'
import { useAppAccess } from './hooks/useAppAccess'
import { AppSwitcherDropdown } from './5-gestor-de-proyectos/components/v2/AppSwitcherDropdown'
import EmpresasModule from './HubSuperEmpresasModule'

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
  { icon: PenSquare, title: 'Editor de Blog', description: 'Plataforma editorial para crear, estructurar y publicar articulos.', path: '/hub/blog-editor', access: 'pro', badge: 'Listo', category: 'Herramientas', pillar: 'Creacion', tone: 'bg-[#ff4b0b]/10 text-[#ff4b0b]', preview: '/assets/hub-previews/preview-academy.png', published: true, app: 'blog' },
  { icon: Calendar, title: 'Consola WABA + CRM', description: 'Panel ejecutivo para campana: integracion WhatsApp API.', path: '/hub/waba-crm', access: 'pro', badge: 'Destacado', category: 'Panel de control', pillar: 'IA', tone: 'bg-[#191918] text-white', preview: '/assets/hub-previews/preview-agentes.png', published: false },
  { icon: MessageSquare, title: 'Consola CRM Comercial', description: 'Bandeja multiagente de WhatsApp, atribucion en tiempo real.', path: '/hub/crm', access: 'pro', badge: 'Nuevo', category: 'Panel de control', pillar: 'Marketing', tone: 'bg-[#ff4b0b]/10 text-[#ff4b0b]', preview: '/assets/hub-previews/preview-crm.jpg', published: false, app: 'crm' },
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

// Rutas internas del panel (30.X): mismo archivo, enlace propio por punto.
// /hub/panel[/empresas|/usuarios|/aplicaciones|/planes|/suscripciones|/pagos|/reportes|/soporte|/configuracion|/marketing|/automatizacion|/ia|/creacion][?q=texto]
const PANEL_SLUGS = {
  Inicio: '', Empresas: 'empresas', Usuarios: 'usuarios', Aplicaciones: 'aplicaciones',
  Planes: 'planes', Suscripciones: 'suscripciones', Pagos: 'pagos', Reportes: 'reportes',
  Soporte: 'soporte', Configuracion: 'configuracion', Todas: '',
  Marketing: 'marketing', Automatizacion: 'automatizacion', IA: 'ia', 'Creacion de Contenido': 'creacion',
}
const PANEL_TABS = Object.fromEntries(
  Object.entries(PANEL_SLUGS).filter(([, s]) => s).map(([t, s]) => [s, t]),
)

function displayName(email) {
  if (!email) return 'Carlos Sandoval'
  const base = email.split('@')[0].replace(/[._-]+/g, ' ').trim()
  if (!base) return 'Carlos Sandoval'
  return base.split(' ').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}

function SuperAdminDashboard({ setActiveTab, navigate }) {
  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner / Header Greeting */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-zinc-400">Sábado, 20 de Septiembre de 2026</p>
          <h1 className="mt-1 text-2xl md:text-3xl font-extrabold tracking-tight text-zinc-950">Super Administrador</h1>
          <p className="mt-1 text-xs md:text-sm text-zinc-500">Gestiona empresas, usuarios, aplicaciones y el crecimiento de Qaway Lab desde un solo lugar.</p>
        </div>
        <div className="hidden lg:block text-right">
          <p className="text-xs italic text-zinc-400 font-serif">“Tecnología para negocios que avanzan.”</p>
        </div>
      </div>

      {/* Row 1: 4 KPI Cards */}
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
              <span className="text-2xl font-extrabold text-zinc-950">4</span>
              <span className="inline-flex items-center text-[11px] font-bold text-emerald-600">↑ 0%</span>
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
              <span className="text-2xl font-extrabold text-zinc-950">12</span>
              <span className="inline-flex items-center text-[11px] font-bold text-emerald-600">↑ 20%</span>
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
              <span className="text-2xl font-extrabold text-zinc-950">8</span>
              <span className="inline-flex items-center text-[11px] font-bold text-emerald-600">↑ 33%</span>
            </div>
          </div>
          <div className="w-16 h-8 opacity-80">
            <svg className="w-full h-full" viewBox="0 0 60 30" fill="none">
              <path d="M0 26 C15 20, 30 24, 45 14 L60 12" stroke="#a855f7" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* KPI 4: Ingresos MRR */}
        <div className="bg-white rounded-2xl p-5 border border-zinc-200/80 shadow-xs flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <HubIcon icon={CreditCard} size={16} className="w-4 h-4" />
              </span>
              <span className="text-xs font-bold text-zinc-500">Ingresos MRR</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-zinc-950">S/ 2,900</span>
              <span className="inline-flex items-center text-[11px] font-bold text-emerald-600">↑ 15%</span>
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
                <p className="text-xs text-zinc-500 mt-0.5">Ingresos recurrentes mensuales (MRR)</p>
              </div>
              <select className="text-xs font-semibold bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-1.5 text-zinc-700 outline-none">
                <option>Últimos 9 meses</option>
                <option>Año 2026</option>
              </select>
            </div>
            <div className="h-48 flex items-end justify-between gap-2 pt-4 px-2">
              {[
                { month: 'Ene', val: 'S/ 1,000', height: '35%' },
                { month: 'Feb', val: 'S/ 1,150', height: '40%' },
                { month: 'Mar', val: 'S/ 1,400', height: '48%' },
                { month: 'Abr', val: 'S/ 1,950', height: '62%' },
                { month: 'May', val: 'S/ 2,300', height: '74%' },
                { month: 'Jun', val: 'S/ 2,150', height: '68%' },
                { month: 'Jul', val: 'S/ 2,500', height: '80%' },
                { month: 'Ago', val: 'S/ 2,850', height: '90%' },
                { month: 'Set', val: 'S/ 3,100', height: '100%' },
              ].map((b, i) => (
                <div key={i} className="flex-1 flex flex-col items-center h-full justify-end group relative">
                  <div className="absolute -top-7 opacity-0 group-hover:opacity-100 transition-opacity bg-zinc-900 text-white text-[10px] font-mono px-2 py-0.5 rounded-md whitespace-nowrap z-10">
                    {b.val}
                  </div>
                  <div className="w-full bg-gradient-to-t from-[#ff4b0b] to-[#ff7a45] rounded-t-lg transition-all duration-300 group-hover:brightness-110" style={{ height: b.height }} />
                  <span className="text-[11px] font-medium text-zinc-400 mt-2">{b.month}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Companies by Plan Donut Chart */}
          <div className="bg-white rounded-2xl p-6 border border-zinc-200/80 shadow-xs">
            <h3 className="text-base font-bold text-zinc-950 mb-4">Empresas por plan</h3>
            <div className="flex flex-col sm:flex-row items-center justify-around gap-6">
              <div className="relative w-40 h-40 flex items-center justify-center shrink-0">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path className="text-zinc-100" strokeWidth="4.5" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  <path stroke="#f97316" strokeWidth="4.5" strokeDasharray="50, 100" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  <path stroke="#3b82f6" strokeWidth="4.5" strokeDasharray="25, 100" strokeDashoffset="-50" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  <path stroke="#eab308" strokeWidth="4.5" strokeDasharray="25, 100" strokeDashoffset="-75" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                </svg>
                <div className="absolute text-center">
                  <span className="block text-[10px] text-zinc-400 font-medium">Total</span>
                  <span className="block text-lg font-extrabold text-zinc-950">4</span>
                  <span className="block text-[9px] text-zinc-400">empresas</span>
                </div>
              </div>
              <div className="space-y-3 w-full sm:w-auto">
                <div className="flex items-center justify-between sm:justify-start gap-4 text-xs font-semibold">
                  <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-orange-500" /><span className="text-zinc-700">Premium</span></div>
                  <span className="text-zinc-500">2 <span className="text-zinc-400">(50%)</span></span>
                </div>
                <div className="flex items-center justify-between sm:justify-start gap-4 text-xs font-semibold">
                  <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-blue-500" /><span className="text-zinc-700">Intermedio</span></div>
                  <span className="text-zinc-500">1 <span className="text-zinc-400">(25%)</span></span>
                </div>
                <div className="flex items-center justify-between sm:justify-start gap-4 text-xs font-semibold">
                  <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-yellow-500" /><span className="text-zinc-700">Básico</span></div>
                  <span className="text-zinc-500">1 <span className="text-zinc-400">(25%)</span></span>
                </div>
                <div className="flex items-center justify-between sm:justify-start gap-4 text-xs font-semibold">
                  <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-zinc-300" /><span className="text-zinc-700">Sin plan</span></div>
                  <span className="text-zinc-500">0 <span className="text-zinc-400">(0%)</span></span>
                </div>
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
              {[
                { title: 'Nueva empresa registrada', detail: 'Vallet Inmobiliaria', time: 'hace 2 horas', icon: User, color: 'text-blue-500 bg-blue-50' },
                { title: 'Usuario invitado', detail: 'ana@epc.pe', time: 'hace 4 horas', icon: User, color: 'text-purple-500 bg-purple-50' },
                { title: 'Suscripción actualizada', detail: 'EPC Contable → CRM Premium', time: 'hace 6 horas', icon: Tag, color: 'text-orange-500 bg-orange-50' },
                { title: 'Nuevo pago recibido', detail: 'S/ 650.00', time: 'hace 1 día', icon: Plus, color: 'text-emerald-500 bg-emerald-50' },
                { title: 'Aplicación activada', detail: 'Agenda → CoraVet', time: 'hace 1 día', icon: Calendar, color: 'text-indigo-500 bg-indigo-50' },
              ].map((act, i) => (
                <div key={i} className="flex items-start gap-3 text-xs">
                  <span className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${act.color}`}>
                    <HubIcon icon={act.icon} size={13} className="w-3.5 h-3.5" />
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-zinc-900 truncate">{act.title}</p>
                    <p className="text-zinc-500 text-[11px] truncate">{act.detail}</p>
                  </div>
                  <span className="text-[10px] text-zinc-400 whitespace-nowrap">{act.time}</span>
                </div>
              ))}
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
          <button onClick={() => goTab('Aplicaciones')} className="text-xs font-bold text-zinc-700 hover:text-zinc-950 transition-colors flex items-center gap-1 self-start sm:self-auto">
            Gestionar aplicaciones <HubIcon icon={ArrowRight} size={14} className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { title: 'CRM Comercial', activeCount: '3 empresas activas', users: '12 usuarios', icon: MessageSquare, bg: 'bg-[#ff4b0b]', path: '/hub/crm' },
            { title: 'Qaway Agenda', activeCount: '2 empresas activas', users: '8 usuarios', icon: Calendar, bg: 'bg-indigo-600', path: '/hub/agenda' },
            { title: 'Inventario & ERP', activeCount: '2 empresas activas', users: '6 usuarios', icon: Package, bg: 'bg-orange-500', path: '/hub/inventario' },
            { title: 'Marketing Studio', activeCount: '1 empresa activa', users: '4 usuarios', icon: Instagram, bg: 'bg-gradient-to-tr from-purple-600 to-pink-500', path: '/hub/marketing' },
            { title: 'Automatizaciones', activeCount: '1 empresa activa', users: '3 usuarios', icon: Zap, bg: 'bg-zinc-900', path: '/hub/automatizaciones' },
            { title: 'Creación de Contenido', activeCount: '1 empresa activa', users: '2 usuarios', icon: Sparkles, bg: 'bg-purple-600', path: '/hub/creador-contenido' },
            { title: 'Analítica & Reportes', activeCount: '2 empresas activas', users: '5 usuarios', icon: BarChart3, bg: 'bg-blue-600', path: '/hub/analytics' },
            { title: 'Pagos & Facturación', activeCount: '2 empresas activas', users: '3 usuarios', icon: CreditCard, bg: 'bg-blue-500', path: '/hub/pagos' },
          ].map((app, i) => (
            <div key={i} className="rounded-xl border border-zinc-200/80 p-4 bg-zinc-50/30 flex flex-col justify-between hover:border-zinc-300 transition-all group">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className={`w-9 h-9 rounded-xl ${app.bg} text-white flex items-center justify-center shadow-xs`}>
                    <HubIcon icon={app.icon} size={18} className="w-4.5 h-4.5" />
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    Activo
                  </span>
                </div>
                <h4 className="text-xs font-bold text-zinc-950 group-hover:text-[#ff4b0b] transition-colors">{app.title}</h4>
                <p className="text-[11px] text-zinc-500 mt-1">{app.activeCount}</p>
                <p className="text-[10px] text-zinc-400">{app.users}</p>
              </div>
              <Link to={app.path} className="mt-4 inline-flex items-center gap-1 text-[11px] font-bold text-zinc-700 hover:text-zinc-950 transition-colors">
                Ver detalles <HubIcon icon={ArrowRight} size={12} className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          ))}
        </div>
      </div>
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
  const authUser = useMemo(() => getAuthUser(), [])
  const { denied } = useAppAccess()
  // Contexto real (sesion + tenant) para las vistas que viven dentro del shell (30.X).
  const [panelAuth, setPanelAuth] = useState(null)
  useEffect(() => {
    let alive = true
    ;(async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session || !alive) return
      const { data: me } = await supabase.from('users').select('tenant_id').eq('id', session.user.id).single()
      if (alive) setPanelAuth({ session, tenantId: me?.tenant_id || null })
    })()
    return () => { alive = false }
  }, [])
  const name = displayName(authUser?.email)
  const avatar = 'https://i.pravatar.cc/150?img=11'

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

  const handleLogout = () => { logoutUser(); navigate('/login', { replace: true }) }

  return (
    <div className="flex h-screen w-full bg-[#111111] overflow-hidden font-sans text-white selection:bg-[#ff4b0b] selection:text-white">
      {/* ── LEFT SIDEBAR (Dark Shell) ───────────────────────────────── */}
      <aside className={`${isSidebarCollapsed ? 'w-[72px]' : 'w-64'} shrink-0 flex flex-col border-r border-white/10 bg-[#111111] transition-all duration-300 ease-in-out`}>
        {/* LOGO */}
        <button onClick={() => goTab('Inicio')} className={`h-16 flex items-center ${isSidebarCollapsed ? 'justify-center' : 'px-6'} border-b border-white/10 shrink-0 cursor-pointer hover:bg-white/5 transition-colors group w-full text-left`}>
          <div className="flex items-center gap-3">
            <span className="font-bold text-white tracking-wide text-lg leading-tight">
              {isSidebarCollapsed ? (
                <span className="text-[#ff4b0b]">Q</span>
              ) : (
                <div className="flex flex-col">
                  <span>Qaway <span className="text-[#ff4b0b]">Lab</span></span>
                  <span className="text-[10px] font-semibold text-zinc-400 tracking-wider">Super Administrador</span>
                </div>
              )}
            </span>
          </div>
        </button>

        {/* NAVIGATION (10 Modules) */}
        <nav className={`flex-1 py-4 ${isSidebarCollapsed ? 'px-2' : 'px-3'} flex flex-col gap-1 overflow-y-auto custom-scrollbar`}>
          {SUPER_ADMIN_NAV.map((nav) => {
            const Icon = nav.icon
            const isActive = activeTab === nav.id
            return (
              <button
                key={nav.id}
                onClick={() => goTab(nav.id)}
                title={isSidebarCollapsed ? nav.label : ''}
                className={`flex items-center ${isSidebarCollapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2.5'} rounded-xl text-xs font-semibold transition-all w-full text-left ${isActive ? 'bg-[#ff4b0b] text-white shadow-lg shadow-[#ff4b0b]/20 font-bold' : 'text-white/65 hover:text-white hover:bg-white/5'}`}
              >
                <HubIcon icon={Icon} size={16} className="w-4 h-4 shrink-0" />
                {!isSidebarCollapsed && <span className="truncate">{nav.label}</span>}
              </button>
            )
          })}
        </nav>

        {/* BOTTOM HELP BOX */}
        {!isSidebarCollapsed && (
          <div className="p-3 border-t border-white/5">
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-xs">
              <div className="flex items-center gap-2 text-orange-400 font-bold mb-1">
                <HubIcon icon={HelpCircle} size={14} className="w-3.5 h-3.5" />
                <span>¿Necesitas ayuda?</span>
              </div>
              <p className="text-zinc-400 text-[10px] leading-relaxed mb-2.5">Accede a la documentación o contacta al equipo.</p>
              <button className="w-full py-1.5 px-2.5 bg-white/10 hover:bg-white/15 text-white text-[10px] font-bold rounded-xl transition-colors flex items-center justify-center gap-1">
                Centro de Ayuda <HubIcon icon={ArrowRight} size={12} className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}
      </aside>

      {/* ── RIGHT AREA ────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* HEADER TOPBAR */}
        <header className="h-[72px] border-b border-white/5 flex items-center justify-between px-5 lg:px-6 shrink-0 bg-[#111111] relative z-50 shadow-sm">
          {/* Lado Izquierdo */}
          <div className="flex items-center gap-2 lg:gap-3">
            <button onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} className="p-2 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors" title={isSidebarCollapsed ? "Expandir menú" : "Contraer menú"}>
              <HubIcon icon={Menu} size={20} className="w-5 h-5 lg:w-[22px] lg:h-[22px]" />
            </button>
            
            {/* Tenant Global Switcher Pill */}
            <div className="relative">
              <button type="button" className="flex items-center gap-2 h-9 px-3 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 text-white text-xs font-bold transition-all cursor-pointer">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Qaway Lab (Global)</span>
                <HubIcon icon={ChevronDown} size={14} className="w-3.5 h-3.5 text-white/50" />
              </button>
            </div>

            <div className="relative">
              <button type="button" onClick={() => setIsWaffleOpen(!isWaffleOpen)} className="group flex items-center gap-2 h-9 px-3 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 text-white/80 transition-all duration-300 ease-out cursor-pointer" title="Ecosistema de Aplicaciones">
                <div className="grid grid-cols-3 gap-[3px] w-3.5 h-3.5 place-items-center">
                  {[...Array(9)].map((_, i) => (<span key={i} className="w-[3px] h-[3px] rounded-full bg-white/70 group-hover:bg-[#ff4b0b] transition-colors" />))}
                </div>
                <span className="text-xs font-bold text-white max-w-0 overflow-hidden group-hover:max-w-16 transition-all duration-350 ease-out whitespace-nowrap">Apps</span>
                <HubIcon icon={ChevronDown} size={14} className="w-3.5 h-3.5 text-white/40 group-hover:text-white/80 transition-transform duration-200" />
              </button>
              <AppSwitcherDropdown isOpen={isWaffleOpen} onClose={() => setIsWaffleOpen(false)} />
            </div>
          </div>

          {/* Search, Notifications & User Profile */}
          <div className="flex items-center gap-3 lg:gap-5 relative">
            <div className="relative block">
              <HubIcon icon={Search} size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-white/40" />
              <input ref={searchInputRef} type="text" value={globalSearchQuery} onChange={(e) => setGlobalSearchQuery(e.target.value)} placeholder="Buscar empresas, usuarios, apps..."
                className="bg-[#18181b] border border-white/10 rounded-full pl-10 pr-16 py-2 text-xs text-white placeholder:text-white/40 focus:outline-none focus:border-[#ff4b0b]/50 focus:bg-[#202024] w-[240px] md:w-[320px] lg:w-[400px] transition-all shadow-inner" />
              {globalSearchQuery ? (
                <button onClick={() => setGlobalSearchQuery('')} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors"><HubIcon icon={X} size={16} className="w-4 h-4" /></button>
              ) : (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-white/10 rounded-md text-white/50 border border-white/5">Ctrl</kbd>
                  <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-white/10 rounded-md text-white/50 border border-white/5">K</kbd>
                </div>
              )}
              <AnimatePresence>
                {globalSearchQuery.trim() !== '' && (
                  <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }} transition={{ duration: 0.15 }}
                    className="absolute top-[calc(100%+12px)] left-0 w-full bg-[#1c1c1f] border border-white/10 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.6)] z-[100] overflow-hidden">
                    {filtered.length === 0 ? (
                      <div className="p-6 text-center"><p className="text-sm text-white/50 font-medium">No se encontraron resultados para "{globalSearchQuery}"</p></div>
                    ) : (
                      <div className="flex flex-col">
                        <div className="px-4 py-3 border-b border-white/5 bg-white/5"><span className="text-xs font-bold text-white/50 uppercase tracking-wider">Resultados Rápidos</span></div>
                        <ul className="py-2">
                          {filtered.slice(0, 5).map(app => {
                            const Icon = app.icon
                            return (
                              <li key={app.path}>
                                <Link to={app.path} onClick={() => setGlobalSearchQuery('')} className="w-full px-4 py-3 hover:bg-white/5 transition-colors flex items-center gap-4 text-left group">
                                  <div className="w-9 h-9 rounded-full bg-[#ff4b0b]/10 text-[#ff4b0b] font-bold text-[13px] flex items-center justify-center shrink-0 border border-[#ff4b0b]/20"><HubIcon icon={Icon} size={16} className="w-4 h-4" /></div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-white truncate group-hover:text-[#ff4b0b] transition-colors">{app.title}</p>
                                    <div className="flex items-center gap-2 text-xs text-white/40 mt-1"><span className="truncate">{app.pillar}</span><span className="px-1.5 py-0.5 rounded-sm bg-white/5 text-white/50">{app.badge || 'Pro'}</span></div>
                                  </div>
                                  <HubIcon icon={MessageSquare} size={20} className="w-5 h-5 text-white/20 group-hover:text-[#ff4b0b] opacity-0 group-hover:opacity-100 transition-all shrink-0" />
                                </Link>
                              </li>
                            )
                          })}
                        </ul>
                        <div className="px-4 py-3 bg-white/5 border-t border-white/5 flex items-center justify-between text-xs text-white/40"><span>Saltar directo a la app</span><span>Esc para cerrar</span></div>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Notifications Bell */}
            <button className="relative p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer" title="Notificaciones (0)">
              <HubIcon icon={Bell} size={20} className="w-5 h-5 lg:w-[22px] lg:h-[22px]" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-[#ff4b0b] rounded-full ring-2 ring-[#111111]" />
            </button>

            {/* User Profile Dropdown */}
            <div className="relative z-[100] ml-1">
              <button onClick={() => setIsProfileOpen(!isProfileOpen)} className="flex items-center gap-3 cursor-pointer p-1 lg:p-1.5 rounded-full hover:bg-white/5 transition-colors text-left border border-transparent focus:outline-none">
                <img src={avatar} alt={name} className="w-8 h-8 lg:w-9 lg:h-9 rounded-full border border-white/10 object-cover" />
                <div className="hidden lg:flex flex-col justify-center">
                  <span className="text-white text-xs font-bold leading-none">{name}</span>
                  <span className="text-[10px] text-white/50 leading-none mt-1">Super Administrador</span>
                </div>
                <HubIcon icon={ChevronDown} size={16} className={`w-4 h-4 text-white/50 hidden lg:block transition-transform duration-200 ${isProfileOpen ? 'rotate-180 text-white' : ''}`} />
              </button>
              <AnimatePresence>
                {isProfileOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsProfileOpen(false)} aria-label="Cerrar perfil" />
                    <motion.div initial={{ opacity: 0, scale: 0.95, originY: 0, originX: 1 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.15, ease: "easeOut" }}
                      className="absolute right-0 top-[calc(100%+8px)] w-72 bg-[#18181b] border border-white/10 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.6)] z-[100] overflow-hidden">
                      <div className="p-5 border-b border-white/5 bg-white/5 flex items-center gap-4">
                        <img src={avatar} alt={name} className="w-12 h-12 rounded-full border border-white/10 object-cover shrink-0" />
                        <div className="flex-1 min-w-0"><p className="text-sm font-bold text-white truncate">{name}</p><p className="text-xs text-white/50 truncate mt-0.5">{authUser?.email || 'admin@qaway.pe'}</p></div>
                      </div>
                      <div className="p-2 border-t border-white/5 bg-black/20">
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
                  tenantId={panelAuth.tenantId}
                  session={panelAuth.session}
                  onCreateCompany={() => navigate('/hub/bienvenida')}
                  onOpenCompany={(company) => company?.id && navigate(`/hub/panel/empresas?empresa=${company.id}`)}
                />
              ) : (
                <div className="py-24 text-center">
                  <p className="text-sm font-semibold text-zinc-400">Cargando módulo de empresas...</p>
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
            ) : (
              /* Dashboard Principal de Super Administrador */
              <SuperAdminDashboard setActiveTab={goTab} navigate={navigate} />
            )}
          </div>
        </main>

        {/* FLOATING ACTION BUTTONS */}
        <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-50">
          <button className="group relative flex items-center justify-center w-[52px] h-[52px] rounded-full bg-gradient-to-tr from-indigo-600 to-purple-500 text-white shadow-[0_8px_30px_rgba(79,70,229,0.4)] hover:-translate-y-1 transition-all duration-300 ease-out border border-white/10" title="Qaway IA Insights">
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
