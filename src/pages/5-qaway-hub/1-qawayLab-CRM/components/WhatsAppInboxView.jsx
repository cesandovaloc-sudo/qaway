import React, { useState, useRef, useEffect } from 'react'
import { useCRM } from '../context/CRMContext'
import { Send, CheckCheck, User, Sparkles, Megaphone, Phone, Mail, Award, ShoppingCart, MailOpen, MessageSquare, Lock, FileText, CreditCard, ExternalLink } from 'lucide-react'

const META_TEMPLATES = [
  { id: 'tpl-welcome-notion', name: '👋 Bienvenida Notion', text: '¡Hola! Qué gusto saludarte. Vi que descargaste la versión básica de nuestra plantilla de Notion. Te comparto el link del tutorial en video de 3 minutos para que le saques el máximo provecho: qaway.link/notion-guide. ¿Tienes alguna duda?' },
  { id: 'tpl-promo-id-visual', name: '🎨 Promo Especial Identidad Visual', text: '¡Hola! Gracias por tu interés en el Curso de Identidad Visual de Qaway Academy. Las clases están grabadas y listas en alta definición con acceso de por vida. Hoy tenemos un descuento especial de lanzamiento del 20%. ¿Te comparto el temario?' },
  { id: 'tpl-followup-proposal', name: '📈 Seguimiento de Propuesta', text: 'Hola, te escribo para saber si tuviste oportunidad de revisar la propuesta/cotización formal que te enviamos para tu equipo. Quedo atento a cualquier ajuste que desees realizar.' }
]

const WABA_FLOWS = [
  {
    id: 'flow-quote',
    name: '📋 Formulario Cotización',
    title: 'Solicitud de Cotización Personalizada',
    body: 'Por favor completa este breve formulario interactivo para calcular tu presupuesto a medida sin salir de WhatsApp.',
    cta: 'Completar Formulario'
  },
  {
    id: 'flow-appointment',
    name: '📅 Agendar Cita',
    title: 'Reserva de Sesión Estratégica',
    body: 'Selecciona fecha y hora para tu sesión de diagnóstico con el equipo de Qaway Lab.',
    cta: 'Seleccionar Horario'
  }
]

const WABA_CATALOG = [
  {
    id: 'prod-notion',
    name: '📦 Plantilla Notion Pro',
    title: 'Sistema Operativo Digital en Notion',
    price: 19.00,
    body: 'Plantilla empresarial completa para gestionar clientes, proyectos y finanzas.',
    cta: 'Comprar con WhatsApp Pay'
  },
  {
    id: 'prod-academy',
    name: '🎨 Curso Identidad Visual',
    title: 'Curso Completo Identidad Visual',
    price: 49.00,
    body: 'Acceso de por vida a clases en alta definición con certificación oficial.',
    cta: 'Comprar con WhatsApp Pay'
  }
]

export default function WhatsAppInboxView() {
  const { leads, selectedLead, setSelectedLeadId, sendChatMessage, updateLeadStatus, is24hWindowActive } = useCRM()
  const is24hOpen = is24hWindowActive ? is24hWindowActive(selectedLead) : true
  const [inputText, setInputText] = useState('')
  const [actionTab, setActionTab] = useState('templates') // 'templates' | 'flows' | 'catalog'
  const chatContainerRef = useRef(null)
  
  // Referencias y estados para los paneles redimensionables ("Resizable")
  const containerRef = useRef(null)
  const [leftWidth, setLeftWidth] = useState(340) // Ancho inicial de columna chats
  const [rightWidth, setRightWidth] = useState(260) // Ancho inicial de columna ficha
  const isResizingLeft = useRef(false)
  const isResizingRight = useRef(false)

  // Manejo de cambio de tamaño arrastrando con mouse
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      
      if (isResizingLeft.current) {
        // Calcular nuevo ancho del panel izquierdo (mínimo 240px, máximo 480px)
        const newLeftWidth = Math.max(240, Math.min(480, e.clientX - rect.left))
        setLeftWidth(newLeftWidth)
      } else if (isResizingRight.current) {
        // Calcular nuevo ancho del panel derecho (mínimo 220px, máximo 400px)
        const newRightWidth = Math.max(220, Math.min(400, rect.right - e.clientX))
        setRightWidth(newRightWidth)
      }
    }

    const handleMouseUp = () => {
      isResizingLeft.current = false
      isResizingRight.current = false
      document.body.classList.remove('select-none')
      document.body.style.cursor = 'default'
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [])

  // Desplazar el chat de forma aislada sin afectar el scroll global de la ventana
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [selectedLead?.history])

  const handleSend = (e) => {
    e.preventDefault()
    if (!inputText.trim() || !is24hOpen) return
    sendChatMessage(selectedLead.id, inputText, 'text')
    setInputText('')
  }

  const handleSendTemplate = (templateText) => {
    sendChatMessage(selectedLead.id, templateText, 'template')
  }

  const handleSendFlow = (flow) => {
    sendChatMessage(selectedLead.id, flow.body, 'flow', {
      flowId: flow.id,
      title: flow.title,
      cta: flow.cta
    })
  }

  const handleSendCatalog = (prod) => {
    sendChatMessage(selectedLead.id, `${prod.title} - $${prod.price.toFixed(2)} USD`, 'product', {
      productId: prod.id,
      title: prod.title,
      price: prod.price,
      cta: prod.cta
    })
  }

  // --- EMPTY STATE PARA EVITAR PANTALLA BLANCA ---
  if (!leads || leads.length === 0 || !selectedLead?.id) {
    return (
      <div className="bg-white border border-zinc-200 rounded-[15px] overflow-hidden flex items-center justify-center h-[75vh] shadow-xs text-zinc-400">
        <div className="text-center">
          <MessageSquare className="w-12 h-12 mx-auto mb-3 text-zinc-200" />
          <p className="text-sm font-medium">Bandeja Vacía</p>
          <p className="text-xs mt-1 text-zinc-400">No hay chats disponibles en este momento.</p>
        </div>
      </div>
    )
  }

  return (
    <div 
      ref={containerRef}
      className="bg-white border border-zinc-200 rounded-[15px] overflow-hidden flex flex-col md:flex-row h-[75vh] shadow-xs relative"
    >
      
      {/* 1. Panel Izquierdo: Lista de Chats Activos */}
      <div 
        style={{ width: window.innerWidth >= 768 ? `${leftWidth}px` : '100%' }}
        className="border-r border-zinc-100 flex flex-col h-full bg-zinc-50/50 shrink-0 select-none md:select-text"
      >
        <div className="p-4 border-b border-zinc-100 shrink-0">
          <h4 className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-widest mb-1">Chats de WhatsApp</h4>
          <span className="text-xs font-bold text-zinc-800">Bandeja Compartida</span>
        </div>
        <div className="flex-1 overflow-y-auto divide-y divide-zinc-100 custom-scrollbar">
          {leads.map(lead => {
            const isSelected = lead.id === selectedLead.id
            return (
              <div
                key={lead.id}
                onClick={() => setSelectedLeadId(lead.id)}
                className={`p-5 cursor-pointer transition-all duration-200 flex flex-col justify-between min-h-[92px] ${
                  isSelected ? 'bg-white shadow-xs' : 'hover:bg-white/40'
                }`}
              >
                {/* Nombre del Cliente */}
                <div className="flex justify-between items-start gap-2 mb-1">
                  <h5 className={`text-base font-bold tracking-tight truncate ${
                    isSelected ? 'text-green-600' : 'text-zinc-950'
                  }`}>
                    {lead.name}
                  </h5>
                  <span className="text-[9px] bg-zinc-100 text-zinc-500 font-bold px-2 py-0.5 rounded border border-zinc-200/50 shrink-0">
                    {(lead.campaignName || '').includes('Notion') ? 'Notion' : 'Visual Academy'}
                  </span>
                </div>

                {/* Vista Previa del Mensaje */}
                <p className="text-[13px] text-zinc-500 truncate leading-relaxed">
                  {lead.lastMessage}
                </p>

                {/* Etiquetas e indicadores */}
                <div className="flex justify-between items-center mt-2">
                  <span className={`text-[9px] px-2 py-0.5 rounded font-extrabold uppercase tracking-wide ${
                    lead.status === 'new' ? 'bg-cyan-50 text-cyan-700 border border-cyan-100' :
                    lead.status === 'ganado' ? 'bg-green-50 text-green-700 border border-green-100' :
                    'bg-zinc-100 text-zinc-600 border border-zinc-200'
                  }`}>
                    {lead.status}
                  </span>

                  {lead.unreadCount > 0 && (
                    <span className="w-5 h-5 rounded-full bg-green-500 text-white font-extrabold text-[10px] flex items-center justify-center shadow-xs">
                      {lead.unreadCount}
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* 🚧 DIVISOR IZQUIERDO ARRASTRABLE (Estilo Premium con Grip de Arrastre) */}
      <div
        onMouseDown={(e) => {
          isResizingLeft.current = true
          document.body.classList.add('select-none')
          document.body.style.cursor = 'col-resize'
        }}
        className="hidden md:flex w-[6px] hover:w-[6px] bg-zinc-100 hover:bg-green-500/50 cursor-col-resize transition-all duration-300 shrink-0 self-stretch items-center justify-center group z-30"
        title="Arrastra para cambiar el tamaño de la lista de chats"
      >
        <div className="w-[2px] h-8 bg-zinc-300 rounded group-hover:bg-green-600/80 transition-colors" />
      </div>

      {/* 2. Panel Central: Ventana de Conversación */}
      <div className="flex-1 flex flex-col h-full bg-white min-w-0">
        
        {/* Cabecera del Chat Activo */}
        <div className="p-4 border-b border-zinc-100 flex justify-between items-center bg-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[15px] bg-zinc-50 border border-zinc-100 flex items-center justify-center text-zinc-400">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-base font-bold text-zinc-950">{selectedLead.name}</h4>
              <p className="text-[11px] text-zinc-400 font-bold">{selectedLead.whatsapp}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {is24hOpen ? (
              <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-1.5 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200/60" title="Ventana de 24h abierta: Mensajes de texto libre permitidos">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Ventana 24h Activa
              </span>
            ) : (
              <span className="text-[10px] text-amber-700 font-bold flex items-center gap-1.5 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200/60" title="Ventana de 24h cerrada: Meta requiere plantilla aprobada (HSM)">
                <Lock className="w-3 h-3 text-amber-600" /> Fuera de Ventana (Plantilla Requerida)
              </span>
            )}
            <span className="text-[10px] text-zinc-500 font-bold flex items-center gap-1.5 bg-zinc-50 px-2.5 py-1 rounded-lg border border-zinc-200/60">
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" /> Línea Oficial
            </span>
          </div>
        </div>

        {/* Burbujas de Chat con ref para scroll aislado */}
        <div
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar bg-zinc-50/20"
        >
          {(Array.isArray(selectedLead.history) ? selectedLead.history : []).map((msg, index) => {
            const isAgent = msg.sender === 'agent'
            return (
              <div key={index} className={`flex ${isAgent ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-[15px] p-3.5 text-[13px] leading-relaxed ${
                  isAgent
                    ? 'bg-zinc-950 text-white font-medium rounded-tr-none shadow-xs'
                    : 'bg-white text-zinc-800 rounded-tl-none border border-zinc-200/80 shadow-xs'
                }`}>
                  {msg.type === 'flow' ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-1.5 text-[9px] font-extrabold uppercase tracking-wider text-emerald-400">
                        <FileText className="w-3.5 h-3.5" /> WhatsApp Flow 3.0 (Nativo)
                      </div>
                      <p className="font-bold text-sm text-white">{msg.payload?.title || 'Formulario WhatsApp'}</p>
                      <p className="text-xs text-white/80 leading-relaxed whitespace-pre-line">{msg.text}</p>
                      <button
                        type="button"
                        onClick={() => alert(`Simulación WABA: El cliente abre el formulario interactivo "${msg.payload?.title || 'Formulario'}" directamente dentro de WhatsApp sin redirección externa.`)}
                        className="w-full mt-2 py-2 px-3 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-extrabold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-xs cursor-pointer"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-zinc-950" /> {msg.payload?.cta || 'Completar Formulario'}
                      </button>
                    </div>
                  ) : msg.type === 'product' ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-1.5 text-[9px] font-extrabold uppercase tracking-wider text-green-400">
                        <ShoppingCart className="w-3.5 h-3.5" /> Catálogo Oficial & Pagos
                      </div>
                      <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-3 text-left">
                        <p className="font-bold text-white text-sm">{msg.payload?.title || msg.text}</p>
                        <p className="text-xs text-zinc-400 mt-1 leading-relaxed">{msg.text}</p>
                        <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-zinc-800">
                          <span className="text-sm font-black text-white">${Number(msg.payload?.price || 0).toFixed(2)} USD</span>
                          <button
                            type="button"
                            onClick={() => alert(`Simulación WABA: Se dispara el checkout nativo de WhatsApp Pay para "${msg.payload?.title}".`)}
                            className="py-1 px-3 bg-white hover:bg-zinc-100 text-zinc-950 font-extrabold text-xs rounded-lg flex items-center gap-1.5 transition-all active:scale-95 shadow-xs cursor-pointer"
                          >
                            <CreditCard className="w-3.5 h-3.5 text-zinc-950" /> {msg.payload?.cta || 'Pagar en Chat'}
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="whitespace-pre-line">{msg.text}</p>
                  )}
                  <div className={`text-[8px] mt-1.5 flex justify-end items-center gap-1.5 ${isAgent ? 'text-white/60' : 'text-zinc-400'}`}>
                    {msg.time}
                    {isAgent && <CheckCheck className="w-3.5 h-3.5 text-green-400" />}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Barra de Comercio Conversacional (Plantillas HSM, WhatsApp Flows, Catálogo & Pagos) */}
        <div className={`p-3.5 bg-white border-t border-zinc-100 shrink-0 transition-colors ${!is24hOpen ? 'bg-amber-50/40' : ''}`}>
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-1 bg-zinc-100 p-0.5 rounded-lg border border-zinc-200/60">
              <button
                type="button"
                onClick={() => setActionTab('templates')}
                className={`py-1 px-2.5 rounded-md text-[10px] font-extrabold transition-all cursor-pointer ${
                  actionTab === 'templates'
                    ? 'bg-white text-zinc-900 shadow-2xs'
                    : 'text-zinc-500 hover:text-zinc-800'
                }`}
              >
                ✨ Plantillas HSM
              </button>
              <button
                type="button"
                onClick={() => setActionTab('flows')}
                className={`py-1 px-2.5 rounded-md text-[10px] font-extrabold transition-all flex items-center gap-1 cursor-pointer ${
                  actionTab === 'flows'
                    ? 'bg-white text-emerald-700 shadow-2xs'
                    : 'text-zinc-500 hover:text-zinc-800'
                }`}
              >
                <FileText className="w-3 h-3 text-emerald-600" /> WhatsApp Flows
              </button>
              <button
                type="button"
                onClick={() => setActionTab('catalog')}
                className={`py-1 px-2.5 rounded-md text-[10px] font-extrabold transition-all flex items-center gap-1 cursor-pointer ${
                  actionTab === 'catalog'
                    ? 'bg-white text-purple-700 shadow-2xs'
                    : 'text-zinc-500 hover:text-zinc-800'
                }`}
              >
                <ShoppingCart className="w-3 h-3 text-purple-600" /> Catálogo & Pagos
              </button>
            </div>

            {!is24hOpen && (
              <span className="text-[10px] font-bold text-amber-700 flex items-center gap-1 bg-amber-100/90 px-2 py-0.5 rounded-md shrink-0">
                <Lock className="w-3 h-3 text-amber-600" /> Envía plantilla para reabrir chat
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {actionTab === 'templates' && META_TEMPLATES.map(tpl => (
              <button
                key={tpl.id}
                type="button"
                onClick={() => handleSendTemplate(tpl.text)}
                className={`transition-all py-1.5 px-3 rounded-[15px] text-[10px] font-bold active:scale-95 shadow-2xs cursor-pointer ${
                  !is24hOpen
                    ? 'bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100 hover:border-amber-300'
                    : 'bg-zinc-50 hover:bg-green-50 hover:text-green-700 border border-zinc-200/70 hover:border-green-200 text-zinc-600'
                }`}
              >
                {tpl.name}
              </button>
            ))}

            {actionTab === 'flows' && WABA_FLOWS.map(flow => (
              <button
                key={flow.id}
                type="button"
                onClick={() => handleSendFlow(flow)}
                className="bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 transition-all py-1.5 px-3 rounded-[15px] text-[10px] font-bold active:scale-95 shadow-2xs flex items-center gap-1.5 cursor-pointer"
              >
                <FileText className="w-3 h-3 text-emerald-600" />
                {flow.name}
              </button>
            ))}

            {actionTab === 'catalog' && WABA_CATALOG.map(prod => (
              <button
                key={prod.id}
                type="button"
                onClick={() => handleSendCatalog(prod)}
                className="bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 transition-all py-1.5 px-3 rounded-[15px] text-[10px] font-bold active:scale-95 shadow-2xs flex items-center gap-1.5 cursor-pointer"
              >
                <ShoppingCart className="w-3 h-3 text-purple-600" />
                {prod.name} <span className="font-extrabold text-purple-700">(${prod.price.toFixed(0)})</span>
              </button>
            ))}
          </div>
        </div>

        {/* Formulario de envío de mensajes */}
        <form onSubmit={handleSend} className="p-4 bg-white border-t border-zinc-100 flex gap-2 shrink-0">
          <input
            type="text"
            value={inputText}
            disabled={!is24hOpen}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={
              is24hOpen
                ? `Escribe a ${selectedLead.name}...`
                : 'Ventana de 24h cerrada. Selecciona una plantilla aprobada arriba para reactivar el chat...'
            }
            className={`flex-1 rounded-[15px] px-4 py-3 text-[13px] transition-all ${
              is24hOpen
                ? 'bg-zinc-50 border border-zinc-200 text-zinc-800 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-300 focus:bg-white'
                : 'bg-zinc-100/80 border border-zinc-200/60 text-zinc-400 placeholder:text-zinc-400 cursor-not-allowed'
            }`}
          />
          <button
            type="submit"
            disabled={!is24hOpen || !inputText.trim()}
            className={`px-5 py-3 rounded-[15px] transition-all duration-300 flex items-center justify-center font-bold text-xs gap-1.5 ${
              is24hOpen && inputText.trim()
                ? 'bg-zinc-950 hover:bg-zinc-800 text-white active:scale-95 cursor-pointer shadow-xs'
                : 'bg-zinc-200 text-zinc-400 cursor-not-allowed'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>Enviar</span>
          </button>
        </form>
      </div>

      {/* 🚧 DIVISOR DERECHO ARRASTRABLE (Estilo Premium con Grip de Arrastre) */}
      <div
        onMouseDown={(e) => {
          isResizingRight.current = true
          document.body.classList.add('select-none')
          document.body.style.cursor = 'col-resize'
        }}
        className="hidden md:flex w-[6px] hover:w-[6px] bg-zinc-100 hover:bg-green-500/50 cursor-col-resize transition-all duration-300 shrink-0 self-stretch items-center justify-center group z-30"
        title="Arrastra para cambiar el tamaño de la ficha del lead"
      >
        <div className="w-[2px] h-8 bg-zinc-300 rounded group-hover:bg-green-600/80 transition-colors" />
      </div>

      {/* 3. Panel Derecho: Ficha del lead */}
      <div 
        style={{ width: window.innerWidth >= 768 ? `${rightWidth}px` : '100%' }}
        className="border-l border-zinc-100 p-5 bg-zinc-50/50 flex flex-col gap-6 h-full overflow-y-auto custom-scrollbar shrink-0"
      >
        <div>
          <h4 className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-widest mb-3">Detalle del Lead</h4>
          
          <div className="space-y-4 text-xs">
            <div className="flex items-start gap-2">
              <Phone className="w-4 h-4 text-zinc-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-[9px] text-zinc-400 font-bold uppercase">WhatsApp</p>
                <p className="text-zinc-800 font-bold">{selectedLead.whatsapp}</p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Mail className="w-4 h-4 text-zinc-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-[9px] text-zinc-400 font-bold uppercase">Correo</p>
                <p className="text-zinc-800 font-bold truncate max-w-[140px]">{selectedLead.email}</p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Megaphone className="w-4 h-4 text-zinc-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-[9px] text-zinc-400 font-bold uppercase">Adquisición</p>
                <p className="text-zinc-800 font-bold truncate">{selectedLead.campaignName || 'Orgánico / Directo'}</p>
              </div>
            </div>

            {selectedLead.referral && (
              <div className="flex items-start gap-2 pt-3 border-t border-zinc-200/50">
                <Megaphone className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <p className="text-[9px] text-emerald-700 font-bold uppercase">Meta Ads (CTWA)</p>
                    <span className="text-[8px] bg-emerald-100 text-emerald-800 font-extrabold px-1.5 py-0.5 rounded">72h Gratis</span>
                  </div>
                  <p className="text-zinc-900 font-bold text-[11px] truncate mt-0.5">{selectedLead.referral.headline || 'Campaña Click-to-WhatsApp'}</p>
                  <p className="text-zinc-400 text-[9px] font-mono truncate">Ad ID: {selectedLead.referral.ad_id || 'N/A'}</p>
                </div>
              </div>
            )}

            {selectedLead.metadata?.wooCommerce && (
              <div className="flex items-start gap-2 pt-3 border-t border-zinc-200/50">
                <ShoppingCart className="w-4 h-4 text-purple-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-[9px] text-purple-600 font-bold uppercase">Compra en Web (WooCommerce)</p>
                  <p className="text-zinc-800 font-bold text-[10px]">Orden: {selectedLead.metadata.wooCommerce.orderId}</p>
                  <p className="text-zinc-500 text-[9px]">{(selectedLead.metadata.wooCommerce.products || []).join(', ')}</p>
                  <span className="text-[9px] font-extrabold text-green-600 mt-1 inline-block">${selectedLead.metadata.wooCommerce.total?.toFixed(2) || '0.00'}</span>
                </div>
              </div>
            )}

            {selectedLead.metadata?.mailing && (
              <div className="flex items-start gap-2 pt-3 border-t border-zinc-200/50">
                <MailOpen className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-[9px] text-blue-600 font-bold uppercase">Interacción Mailing</p>
                  <p className="text-zinc-800 font-bold text-[10px] truncate max-w-[140px]">{selectedLead.metadata.mailing.campaignName}</p>
                  <span className="text-[9px] font-extrabold text-zinc-500">Última Acción: <span className="text-zinc-800">{selectedLead.metadata.mailing.lastAction}</span></span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Acciones de Pipeline */}
        <div>
          <h4 className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-widest mb-3">Etapa en Embudo</h4>
          <div className="space-y-2">
            {['new', 'contactado', 'propuesta', 'negociacion', 'ganado'].map((stage, i) => {
              const isActive = selectedLead.status === stage
              return (
                <button
                  key={stage}
                  onClick={() => updateLeadStatus(selectedLead.id, stage)}
                  className={`w-full py-2 px-3 text-left rounded-[15px] text-[10px] font-bold uppercase transition-all duration-300 flex justify-between items-center border ${
                    isActive
                      ? 'border-qaway-accent text-zinc-900 bg-qaway-accent/10 shadow-[0_0_15px_rgba(255,210,0,0.25)]'
                      : 'bg-white hover:bg-zinc-100 text-zinc-500 hover:text-zinc-800 border-zinc-200/50'
                  }`}
                >
                  {i + 1}. {stage === 'new' ? 'Nuevo' :
                   stage === 'contactado' ? 'Contactado' :
                   stage === 'propuesta' ? 'Propuesta' :
                   stage === 'negociacion' ? 'Negociación' : 'Ganado'}
                  {isActive && <Award className="w-3.5 h-3.5 text-green-400" />}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
