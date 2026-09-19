import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCRM } from '../context/CRMContext'
import { 
  Briefcase, Search, DollarSign, Calendar, MessageSquare, 
  Phone, Mail, UserCheck, Sparkles, ExternalLink, ShieldCheck, 
  TrendingUp, X, ChevronRight, CheckCircle2, Layers, 
  FileText, Award, ArrowUpRight, Clock, Building2
} from 'lucide-react'

const DEMO_CLIENTS = [
  {
    id: 'client-vallet-1',
    client_name: 'Vallet Inmobiliaria SAC',
    name: 'Vallet Inmobiliaria SAC',
    contact_info: '+51 984 112 233',
    whatsapp: '+51 984 112 233',
    email: 'gerencia@valletinmobiliaria.pe',
    budget: 4800,
    status: 'ganado',
    campaignName: 'Desarrollo Web & Apps',
    agent: 'Andrés Valencia',
    created_at: '2026-08-15T10:30:00Z',
    metadata: { service: 'Plataforma Web Inmobiliaria + CRM Sync' },
    history: [
      { sender: 'lead', text: 'Buenas tardes, requerimos integrar el catálogo de propiedades con WhatsApp.', time: '10:30' },
      { sender: 'agent', text: '¡Excelente! Tenemos el módulo listo con filtros por zona y sincronización automática.', time: '10:32' },
      { sender: 'lead', text: 'Perfecto, aprobamos la propuesta para iniciar el despliegue.', time: '11:15' }
    ]
  },
  {
    id: 'client-mesaselecta-2',
    client_name: 'Mesa Selecta Gourmet',
    name: 'Mesa Selecta Gourmet',
    contact_info: '+51 977 456 789',
    whatsapp: '+51 977 456 789',
    email: 'contacto@mesaselecta.pe',
    budget: 3200,
    status: 'ganado',
    campaignName: 'Agentes IA & Chatbots',
    agent: 'Martín Rojas',
    created_at: '2026-08-28T14:15:00Z',
    metadata: { service: 'Agente IA Autónomo WABA para Reservas' },
    history: [
      { sender: 'lead', text: 'Hola, queremos que la IA tome reservas y confirme menús degustación.', time: '14:15' },
      { sender: 'agent', text: 'Configurado con ventana de 24h y Google Calendar sincronizado.', time: '14:20' }
    ]
  },
  {
    id: 'client-coravet-3',
    client_name: 'CoraVet Clínica Veterinaria',
    name: 'CoraVet Clínica Veterinaria',
    contact_info: '+51 961 889 900',
    whatsapp: '+51 961 889 900',
    email: 'administracion@coravet.pe',
    budget: 2900,
    status: 'ganado',
    campaignName: 'SaaS & Automatización',
    agent: 'Andrés Valencia',
    created_at: '2026-09-05T09:00:00Z',
    metadata: { service: 'Sistema de Citas Médicas e Historial Clínico' },
    history: [
      { sender: 'lead', text: 'Necesitamos recordatorios automáticos 2 horas antes de cada consulta médica.', time: '09:00' },
      { sender: 'agent', text: 'Automatización desplegada con Cloud API y templates WABA.', time: '09:05' }
    ]
  },
  {
    id: 'client-aurea-4',
    client_name: 'Aurea Skincare Lab',
    name: 'Aurea Skincare Lab',
    contact_info: '+51 955 221 144',
    whatsapp: '+51 955 221 144',
    email: 'ventas@aureaskincare.com',
    budget: 3950,
    status: 'ganado',
    campaignName: 'Branding & Consultoría',
    agent: 'Sofía Castillo',
    created_at: '2026-09-10T16:40:00Z',
    metadata: { service: 'Branding Digital, E-commerce y Meta Ads CTWA' },
    history: [
      { sender: 'lead', text: '¿Podemos rastrear el ROAS de las ventas desde los anuncios de Instagram?', time: '16:40' },
      { sender: 'agent', text: 'Sí, mediante atribución nativa Click-to-WhatsApp en el CRM.', time: '16:45' }
    ]
  }
]

export default function ClientesView({ onNavigateToChat }) {
  const { leads, setSelectedLeadId, globalSearchQuery, setGlobalSearchQuery } = useCRM()

  const [searchTerm, setSearchTerm] = useState('')
  const [serviceFilter, setServiceFilter] = useState('all')
  const [selectedClientDrawer, setSelectedClientDrawer] = useState(null)

  const effectiveSearch = globalSearchQuery || searchTerm

  // 1. Filtrar prospectos que ya son Clientes (estado 'ganado' o acuerdos cerrados)
  const realWonClients = useMemo(() => {
    return leads.filter(l => l.status === 'ganado' || l.stage === 'ganado')
  }, [leads])

  const isUsingDemo = realWonClients.length === 0
  const clientsList = useMemo(() => {
    if (realWonClients.length > 0) return realWonClients
    // Fallback con cuentas empresariales demostrativas de Qaway Lab
    return DEMO_CLIENTS
  }, [realWonClients])

  // 2. Métricas de Cartera y Facturación Acumulada
  const metrics = useMemo(() => {
    const totalClients = clientsList.length
    const totalRevenue = clientsList.reduce((acc, curr) => acc + (Number(curr.budget) || 0), 0)
    const avgTicket = totalClients > 0 ? Math.round(totalRevenue / totalClients) : 0
    const totalLeads = leads.length || clientsList.length || 1
    const conversionRate = Math.min(100, Math.round((clientsList.length / totalLeads) * 100))

    return { totalClients, totalRevenue, avgTicket, conversionRate }
  }, [clientsList, leads])

  // 3. Filtrado reactivo en la tabla
  const filteredClients = useMemo(() => {
    return clientsList.filter(client => {
      const name = (client.client_name || client.name || '').toLowerCase()
      const phone = (client.contact_info || client.whatsapp || '').toLowerCase()
      const email = (client.email || '').toLowerCase()
      const campaign = (client.campaignName || client.campaign_name || '').toLowerCase()
      const service = (client.metadata?.service || '').toLowerCase()
      const query = effectiveSearch.toLowerCase()

      const matchesSearch = !query || 
        name.includes(query) || 
        phone.includes(query) || 
        email.includes(query) || 
        campaign.includes(query)

      const matchesService = serviceFilter === 'all' || 
        service.includes(serviceFilter) || 
        campaign.includes(serviceFilter)

      return matchesSearch && matchesService
    })
  }, [clientsList, searchTerm, serviceFilter])

  const handleOpenChat = (clientId) => {
    if (setSelectedLeadId) setSelectedLeadId(clientId)
    if (onNavigateToChat) onNavigateToChat(clientId)
  }

  return (
    <div className="bg-transparent text-zinc-900 max-w-7xl mx-auto space-y-6">
      
      {/* ── 1. CABECERA LIBRE SOBRE EL LIENZO ────────────────────── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
              Cartera de Clientes & Cuentas Clave
            </h1>
            {isUsingDemo && (
              <span className="text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200/70 px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" /> Cuentas Demostrativas
              </span>
            )}
          </div>
          <p className="text-[14px] text-zinc-500 font-medium mt-1">
            Gestión de cuentas activas, facturación acumulada (LTV) y seguimiento de contratos.
          </p>
        </div>
      </div>

      {/* ── 2. CUATRO TARJETAS KPI INDEPENDIENTES CON LÍNEA DE TENDENCIA ──────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        {/* Clientes Activos */}
        <div className="bg-white border border-zinc-200/80 rounded-2xl p-4 shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all hover:-translate-y-0.5 flex flex-col justify-between">
          <div>
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Clientes Activos</span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <p className="text-3xl font-extrabold text-zinc-900 tracking-tight">{metrics.totalClients}</p>
              <span className="text-xs text-emerald-600 font-bold">Cerrados</span>
            </div>
          </div>
          <div className="h-8 w-full mt-3 -mb-1">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 100 28" preserveAspectRatio="none">
              <polyline
                fill="none"
                stroke="#ff4b0b"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                points="0,22 15,20 30,23 45,15 60,17 75,10 90,13 100,6"
              />
            </svg>
          </div>
        </div>

        {/* Cartera Total */}
        <div className="bg-white border border-zinc-200/80 rounded-2xl p-4 shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all hover:-translate-y-0.5 flex flex-col justify-between">
          <div>
            <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Cartera Total</span>
            <div className="flex items-baseline gap-1 mt-1">
              <p className="text-3xl font-extrabold text-emerald-800 tracking-tight">${metrics.totalRevenue.toLocaleString()}</p>
              <span className="text-xs text-emerald-600 font-bold">USD</span>
            </div>
          </div>
          <div className="h-8 w-full mt-3 -mb-1">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 100 28" preserveAspectRatio="none">
              <polyline
                fill="none"
                stroke="#10b981"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                points="0,23 15,22 30,18 45,20 60,14 75,16 90,9 100,5"
              />
            </svg>
          </div>
        </div>

        {/* Ticket Promedio */}
        <div className="bg-white border border-zinc-200/80 rounded-2xl p-4 shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all hover:-translate-y-0.5 flex flex-col justify-between">
          <div>
            <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Ticket Promedio</span>
            <div className="flex items-baseline gap-1 mt-1">
              <p className="text-3xl font-extrabold text-blue-800 tracking-tight">${metrics.avgTicket.toLocaleString()}</p>
              <span className="text-xs text-blue-600 font-bold">USD</span>
            </div>
          </div>
          <div className="h-8 w-full mt-3 -mb-1">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 100 28" preserveAspectRatio="none">
              <polyline
                fill="none"
                stroke="#3b82f6"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                points="0,24 15,21 30,22 45,17 60,18 75,12 90,14 100,9"
              />
            </svg>
          </div>
        </div>

        {/* Tasa de Cierre */}
        <div className="bg-white border border-zinc-200/80 rounded-2xl p-4 shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all hover:-translate-y-0.5 flex flex-col justify-between">
          <div>
            <span className="text-xs font-semibold text-purple-600 uppercase tracking-wider">Tasa de Cierre</span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <p className="text-3xl font-extrabold text-purple-800 tracking-tight">{metrics.conversionRate}%</p>
              <span className="text-xs text-purple-500 font-medium">del embudo</span>
            </div>
          </div>
          <div className="h-8 w-full mt-3 -mb-1">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 100 28" preserveAspectRatio="none">
              <polyline
                fill="none"
                stroke="#8b5cf6"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                points="0,25 15,22 30,24 45,19 60,20 75,15 90,16 100,11"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* ── 3. BARRA DE HERRAMIENTAS STICKY: BÚSQUEDA Y FILTROS ──────────── */}
      <div className="sticky top-0 z-30 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white/95 backdrop-blur-md border border-zinc-200/80 px-4 py-3 rounded-xl shadow-[0_4px_16px_rgba(0,0,0,0.03)]">
        {/* Buscador */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por cliente, empresa, teléfono o servicio..."
            value={effectiveSearch}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              if (setGlobalSearchQuery) setGlobalSearchQuery(e.target.value)
            }}
            className="w-full pl-9 pr-4 py-2 bg-zinc-50 border border-zinc-200/80 rounded-xl text-xs sm:text-[13px] text-zinc-800 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#ff4b0b]/20 focus:border-[#ff4b0b] transition-all"
          />
          {effectiveSearch && (
            <button 
              onClick={() => {
                setSearchTerm('')
                if (setGlobalSearchQuery) setGlobalSearchQuery('')
              }} 
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filtro de Servicios */}
        <div className="flex items-center gap-2">
          <select
            value={serviceFilter}
            onChange={(e) => setServiceFilter(e.target.value)}
            className="px-3.5 py-2 bg-zinc-50 border border-zinc-200/80 rounded-xl text-xs sm:text-[13px] text-zinc-700 focus:outline-none focus:border-zinc-400 cursor-pointer font-semibold"
          >
            <option value="all">Todos los Servicios</option>
            <option value="web">Desarrollo Web & Apps</option>
            <option value="saas">SaaS & Automatización</option>
            <option value="ia">Agentes IA & Chatbots</option>
            <option value="notion">Sistemas Notion</option>
            <option value="branding">Branding & Consultoría</option>
          </select>
        </div>
      </div>

      {/* ── 4. TABLA MODULAR DE CLIENTES CONVERTIDOS ─────────────────── */}
      <div className="bg-white border border-zinc-200/80 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.02)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-zinc-50/80 border-b border-zinc-200/60 text-zinc-500 font-bold uppercase tracking-wider text-[12px] select-none">
              <th className="py-3.5 px-4">Cliente / Cuenta</th>
              <th className="py-3.5 px-4">Contacto Directo</th>
              <th className="py-3.5 px-4">Servicio Contratado</th>
              <th className="py-3.5 px-4">Valor de Cuenta</th>
              <th className="py-3.5 px-4">Estado de Entrega</th>
              <th className="py-3.5 px-4">Asesor Asignado</th>
              <th className="py-3.5 px-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {filteredClients.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-12 text-zinc-400">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <Award className="w-8 h-8 text-zinc-300" />
                    <p className="text-sm font-medium text-zinc-600">No se encontraron clientes activos</p>
                    <p className="text-xs text-zinc-400 max-w-sm">
                      Los prospectos que alcancen el estado &quot;Ganado&quot; en el embudo comercial aparecerán automáticamente en esta cartera.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredClients.map((client) => {
                const clientName = client.client_name || client.name || 'Cliente Empresarial'
                const phone = client.contact_info || client.whatsapp || 'Sin registrar'
                const email = client.email || 'contacto@empresa.com'
                const budget = Number(client.budget) || 0
                const service = client.metadata?.service || client.campaignName || client.campaign_name || 'Solución Integral Digital'
                const agent = client.agent || 'Equipo Qaway'
                const formattedDate = client.created_at 
                  ? new Date(client.created_at).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })
                  : 'Reciente'

                // Iniciales para el avatar
                const initials = clientName
                  .split(' ')
                  .map(w => w[0])
                  .filter(Boolean)
                  .slice(0, 2)
                  .join('')
                  .toUpperCase() || 'QL'

                return (
                  <tr 
                    key={client.id}
                    className="hover:bg-zinc-50/70 transition-colors group cursor-pointer"
                    onClick={() => setSelectedClientDrawer(client)}
                  >
                    {/* Cliente / Cuenta */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#ff4b0b]/15 to-[#ff4b0b]/30 text-[#ff4b0b] font-bold flex items-center justify-center text-[13px] shrink-0 border border-[#ff4b0b]/20">
                          {initials}
                        </div>
                        <div>
                          <p className="text-[14px] font-bold text-zinc-900 leading-tight group-hover:text-[#ff4b0b] transition-colors">
                            {clientName}
                          </p>
                          <div className="flex items-center gap-1.5 mt-0.5 text-[11.5px] text-zinc-400 font-medium">
                            <Building2 className="w-3 h-3 text-zinc-400" />
                            <span>Cuenta Verificada</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Contacto Directo */}
                    <td className="py-4 px-4" onClick={(e) => e.stopPropagation()}>
                      <div className="flex flex-col space-y-0.5">
                        <a 
                          href={`https://wa.me/${phone.replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1.5 text-zinc-800 hover:text-[#ff4b0b] font-mono text-[12px] font-semibold transition-colors"
                        >
                          <Phone className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{phone}</span>
                        </a>
                        <span className="flex items-center gap-1 text-[11.5px] text-zinc-400">
                          <Mail className="w-3 h-3" />
                          <span className="truncate max-w-[150px]">{email}</span>
                        </span>
                      </div>
                    </td>

                    {/* Servicio Contratado */}
                    <td className="py-4 px-4">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-100/80 border border-zinc-200/70 text-zinc-800 text-[12px] font-semibold">
                        <Layers className="w-3.5 h-3.5 text-[#ff4b0b]" />
                        <span className="truncate max-w-[160px]">{service}</span>
                      </div>
                    </td>

                    {/* Valor de Cuenta */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-1 font-bold text-zinc-900">
                        <span className="text-emerald-700 font-extrabold text-[15px]">${budget.toLocaleString()}</span>
                        <span className="text-xs text-zinc-400 font-normal">USD</span>
                      </div>
                      <span className="text-[11px] text-zinc-400 font-medium">Alta: {formattedDate}</span>
                    </td>

                    {/* Estado de Entrega */}
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11.5px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Activo / Ganado</span>
                      </span>
                    </td>

                    {/* Asesor Asignado */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2 text-zinc-700 font-medium text-[12.5px]">
                        <div className="w-6 h-6 rounded-full bg-zinc-200 flex items-center justify-center text-[11px] font-bold text-zinc-700">
                          {agent[0] || 'Q'}
                        </div>
                        <span className="truncate max-w-[120px]">{agent}</span>
                      </div>
                    </td>

                    {/* Acciones */}
                    <td className="py-4 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenChat(client.id)}
                          title="Abrir chat en WhatsApp Cloud"
                          className="p-2 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800 transition-colors border border-emerald-200/60"
                        >
                          <MessageSquare className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setSelectedClientDrawer(client)}
                          title="Ver Expediente Completo"
                          className="p-2 rounded-lg bg-zinc-100 text-zinc-700 hover:bg-zinc-200 transition-colors"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>

      {/* ── 4. DRAWER LATERAL: EXPEDIENTE COMPLETO DEL CLIENTE ───────── */}
      <AnimatePresence>
        {selectedClientDrawer && (
          <>
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedClientDrawer(null)}
              className="fixed inset-0 bg-black/20 backdrop-blur-xs z-40"
            />

            {/* Panel Flotante */}
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white border-l border-zinc-200 z-50 p-6 flex flex-col shadow-2xl overflow-y-auto"
            >
              {/* Cabecera del Drawer */}
              <div className="flex items-start justify-between border-b border-zinc-100 pb-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 mb-1.5">
                    <ShieldCheck className="w-3 h-3" />
                    <span>Cuenta de Cliente Activa</span>
                  </div>
                  <h3 className="text-lg font-bold text-zinc-900 leading-tight">
                    {selectedClientDrawer.client_name || selectedClientDrawer.name || 'Cliente Empresarial'}
                  </h3>
                  <p className="text-xs text-zinc-500 mt-0.5">Expediente comercial sincronizado</p>
                </div>
                <button 
                  onClick={() => setSelectedClientDrawer(null)}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Contenido del Expediente */}
              <div className="space-y-5 py-5 flex-1">
                {/* Resumen Financiero del Cliente */}
                <div className="bg-gradient-to-br from-zinc-50 to-zinc-100/80 p-4 rounded-xl border border-zinc-200/80">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Valor Acordado / Presupuesto</span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-2xl font-black text-emerald-700">
                      ${(Number(selectedClientDrawer.budget) || 0).toLocaleString()}
                    </span>
                    <span className="text-xs font-semibold text-zinc-500">USD</span>
                  </div>
                  <p className="text-[11px] text-zinc-500 mt-1">
                    Asesor a cargo: <strong className="text-zinc-700">{selectedClientDrawer.agent || 'Equipo Qaway'}</strong>
                  </p>
                </div>

                {/* Datos de Contacto y Canales */}
                <div className="space-y-2.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Datos de Contacto</h4>
                  <div className="bg-zinc-50 border border-zinc-200/70 rounded-xl p-3 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-500 flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-zinc-400" /> WhatsApp
                      </span>
                      <span className="font-mono text-zinc-800 font-medium">
                        {selectedClientDrawer.contact_info || selectedClientDrawer.whatsapp || 'No registrado'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between border-t border-zinc-100 pt-2">
                      <span className="text-zinc-500 flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-zinc-400" /> Correo
                      </span>
                      <span className="text-zinc-800 truncate max-w-[200px]">
                        {selectedClientDrawer.email || 'contacto@empresa.com'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between border-t border-zinc-100 pt-2">
                      <span className="text-zinc-500 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-zinc-400" /> Alta de Cliente
                      </span>
                      <span className="text-zinc-700">
                        {selectedClientDrawer.created_at 
                          ? new Date(selectedClientDrawer.created_at).toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric' })
                          : 'Reciente'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Servicios y Entregables */}
                <div className="space-y-2.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Servicios Contratados</h4>
                  <div className="p-3 bg-zinc-50 border border-zinc-200/70 rounded-xl space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-md bg-[#ff4b0b]/10 text-[#ff4b0b] flex items-center justify-center">
                        <Layers className="w-3.5 h-3.5" />
                      </div>
                      <span className="font-medium text-zinc-800 text-xs">
                        {selectedClientDrawer.metadata?.service || selectedClientDrawer.campaignName || 'Solución Integral Digital'}
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-500 leading-relaxed">
                      Proyecto en curso bajo el marco de desarrollo de Qaway Lab con soporte técnico y automatización omnicanal.
                    </p>
                  </div>
                </div>

                {/* Historial Reciente de Mensajes */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Historial de Comunicación</h4>
                    <span className="text-[10px] text-zinc-400">
                      {selectedClientDrawer.history?.length || 0} mensajes
                    </span>
                  </div>
                  
                  <div className="bg-zinc-50 border border-zinc-200/70 rounded-xl p-3 max-h-48 overflow-y-auto space-y-2">
                    {selectedClientDrawer.history && selectedClientDrawer.history.length > 0 ? (
                      selectedClientDrawer.history.slice(-3).map((msg, idx) => (
                        <div 
                          key={idx} 
                          className={`p-2 rounded-lg text-xs ${
                            msg.sender === 'lead' || msg.sender === 'customer'
                              ? 'bg-white border border-zinc-200/80 text-zinc-800 mr-4'
                              : 'bg-[#ff4b0b]/10 text-zinc-900 ml-4 border border-[#ff4b0b]/20'
                          }`}
                        >
                          <p className="leading-snug">{msg.text}</p>
                          <span className="text-[9px] text-zinc-400 block mt-1 text-right">{msg.time || ''}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-zinc-400 text-center py-3">No hay historial previo registrado.</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Botones de Acción Inferiores */}
              <div className="border-t border-zinc-100 pt-4 flex gap-2">
                <button
                  onClick={() => {
                    handleOpenChat(selectedClientDrawer.id)
                    setSelectedClientDrawer(null)
                  }}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-[#ff4b0b] hover:bg-[#e03f06] text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Abrir Chat en WABA</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  )
}

