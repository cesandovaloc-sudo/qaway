import React, { useState, useEffect, useMemo } from 'react'
import { TenantAgentWorkspace, GoldenExample, ChatMessage, CorrectionLogItem } from '../types/agent.types'
import {
  CheckCircle2,
  XCircle,
  Edit3,
  Sparkles,
  MessageSquare,
  AlertCircle,
  User,
  Bot,
  Clock,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  Eye,
  Flag,
  ArrowRight,
  RotateCcw,
  Download,
  Trash2
} from 'lucide-react'

interface Props {
  workspace: TenantAgentWorkspace
  onUpdateWorkspace: (updater: (prev: TenantAgentWorkspace) => TenantAgentWorkspace) => void
}

export const AgentLiveTrainingStudio: React.FC<Props> = ({
  workspace,
  onUpdateWorkspace
}) => {
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'needs_review'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedConversation, setSelectedConversation] = useState<LiveConversation | null>(null)
  const [showCorrectionModal, setShowCorrectionModal] = useState(false)
  const [correctionDraft, setCorrectionDraft] = useState({ userQuery: '', badReply: '', humanCorrection: '' })

  // Simular conversaciones en vivo (en producción: Supabase Realtime + conversations table)
  const [liveConversations, setLiveConversations] = useState<LiveConversation[]>(() => generateMockConversations(workspace))

  const updateConversation = (id: string, updates: Partial<LiveConversation>) => {
    // En producción: update Supabase conversations table
    console.log('[LiveTraining] Update conversation', id, updates)
  }

  const handleApproveMessage = (conversationId: string, messageIndex: number) => {
    setLiveConversations(prev => prev.map(conv => {
      if (conv.id !== conversationId) return conv
      return {
        ...conv,
        messages: conv.messages.map((msg, i) => i === messageIndex ? { ...msg, status: 'approved' as const } : msg)
      }
    }))
  }

  const handleRejectMessage = (conversationId: string, messageIndex: number) => {
    setLiveConversations(prev => prev.map(conv => {
      if (conv.id !== conversationId) return conv
      return {
        ...conv,
        messages: conv.messages.map((msg, i) => i === messageIndex ? { ...msg, status: 'rejected' as const } : msg)
      }
    }))
  }

  const handleOpenCorrection = (conversationId: string, messageIndex: number) => {
    const conv = liveConversations.find(c => c.id === conversationId)
    const msg = conv?.messages[messageIndex]
    if (!msg || msg.sender !== 'agent') return

    const userMsg = conv.messages[messageIndex - 1]
    setCorrectionDraft({
      userQuery: userMsg?.text || '',
      badReply: msg.text,
      humanCorrection: ''
    })
    setShowCorrectionModal(true)
  }

  const handleSaveCorrection = () => {
    if (!correctionDraft.humanCorrection.trim()) return

    const newCorrection: CorrectionLogItem = {
      id: `corr-${Date.now()}`,
      timestamp: Date.now(),
      dateString: new Date().toLocaleString(),
      userQuery: correctionDraft.userQuery,
      badAgentReply: correctionDraft.badReply,
      humanCorrection: correctionDraft.humanCorrection,
      status: 'aplicado'
    }

    const newGoldenExample: GoldenExample = {
      id: `gold-live-${Date.now()}`,
      category: 'tecnica',
      userQuestion: correctionDraft.userQuery,
      idealAnswer: correctionDraft.humanCorrection,
      rationale: 'Corregido en vivo desde Live Training Studio',
      isApproved: true
    }

    onUpdateWorkspace(prev => ({
      ...prev,
      correctionLogs: [newCorrection, ...(prev.correctionLogs || [])],
      goldenExamples: [newGoldenExample, ...(prev.goldenExamples || [])]
    }))

    setShowCorrectionModal(false)
    setCorrectionDraft({ userQuery: '', badReply: '', humanCorrection: '' })
  }

  const pendingCount = liveConversations.reduce((acc, c) => acc + c.messages.filter(m => m.status === 'pending').length, 0)
  const approvedCount = liveConversations.reduce((acc, c) => acc + c.messages.filter(m => m.status === 'approved').length, 0)

  // Filtrado local
  const filteredConversations = useMemo(() => {
    return liveConversations.filter(conv => {
      if (filterStatus !== 'all') {
        const hasStatus = conv.messages.some(m => m.status === filterStatus)
        if (!hasStatus) return false
      }
      if (searchQuery) {
        const q = searchQuery.toLowerCase()
        const hay = `${conv.userName} ${conv.messages.map(m => m.text).join(' ')}`.toLowerCase()
        if (!hay.includes(q)) return false
      }
      return true
    })
  }, [liveConversations, filterStatus, searchQuery])

  return (
    <div className="space-y-6">
      {/* Cabecera */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 text-xs font-bold mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              Entrenamiento en Vivo • Human-in-the-Loop
            </div>
            <h2 className="text-xl font-black text-slate-800 tracking-tight">
              Supervisión de Conversaciones en Tiempo Real
            </h2>
            <p className="text-xs text-slate-500 max-w-2xl">
              Revisa, aprueba o corrige cada respuesta del agente. Cada corrección se convierte automáticamente en Ejemplo de Oro.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setLiveConversations(generateMockConversations(workspace))}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Simular nuevas
            </button>
          </div>
        </div>

        {/* Métricas Live */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-5 mt-5 border-t border-slate-100">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Conversaciones activas</span>
            <span className="text-xl font-black text-slate-800">{liveConversations.length}</span>
          </div>
          <div className="bg-amber-50/60 p-3 rounded-xl border border-amber-100">
            <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider block">Pendientes de revisión</span>
            <span className="text-xl font-black text-amber-700">{pendingCount}</span>
          </div>
          <div className="bg-emerald-50/60 p-3 rounded-xl border border-emerald-100">
            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block">Aprobadas</span>
            <span className="text-xl font-black text-emerald-700">{approvedCount}</span>
          </div>
          <div className="bg-indigo-50/60 p-3 rounded-xl border border-indigo-100">
            <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider block">Modo entrenamiento</span>
            <span className="text-xl font-black text-indigo-700">{workspace.aiSettings.trainingMode ? 'ACTIVO' : 'INACTIVO'}</span>
          </div>
        </div>
      </div>

      {/* Filtros y búsqueda */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por usuario, mensaje, tema..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#4f46e5]"
            />
          </div>

          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value as any)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#4f46e5] cursor-pointer"
          >
            <option value="all">Todos</option>
            <option value="pending">Pendientes</option>
            <option value="approved">Aprobadas</option>
            <option value="needs_review">Requieren corrección</option>
          </select>

          {workspace.aiSettings.trainingMode && (
            <span className="ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold animate-pulse">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              MODO ENTRENAMIENTO ACTIVO — Supervisión obligatoria
            </span>
          )}
        </div>
      </div>

      {/* Lista de conversaciones */}
      <div className="space-y-4">
        {filteredConversations.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 text-center border border-slate-200/80 space-y-3">
            <MessageSquare className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-sm font-bold text-slate-700">No hay conversaciones con este filtro</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">Prueba cambiar los filtros o simular nuevas conversaciones.</p>
          </div>
        ) : (
          filteredConversations.map(conv => (
            <LiveConversationCard
              key={conv.id}
              conversation={conv}
              onSelect={() => setSelectedConversation(conv)}
              onApprove={handleApproveMessage}
              onReject={handleRejectMessage}
              onCorrect={handleOpenCorrection}
            />
          ))
        )}
      </div>

      {/* Modal detalle conversación */}
      {selectedConversation && (
        <LiveConversationModal
          conversation={selectedConversation}
          onClose={() => setSelectedConversation(null)}
          onApprove={handleApproveMessage}
          onReject={handleRejectMessage}
          onCorrect={handleOpenCorrection}
        />
      )}

      {/* Modal corrección */}
      {showCorrectionModal && (
        <CorrectionModal
          draft={correctionDraft}
          onChange={setCorrectionDraft}
          onSave={handleSaveCorrection}
          onCancel={() => setShowCorrectionModal(false)}
        />
      )}
    </div>
  )
}

// Tipos internos
interface LiveConversation {
  id: string
  userName: string
  userPhone?: string
  channel: 'whatsapp' | 'web'
  startedAt: number
  lastActivity: number
  messages: LiveMessage[]
  tags: string[]
}

interface LiveMessage extends ChatMessage {
  status: 'pending' | 'approved' | 'rejected' | 'corrected'
  reviewBy?: string
  reviewAt?: number
}

function generateMockConversations(workspace: TenantAgentWorkspace): LiveConversation[] {
  const now = Date.now()
  const conversations: LiveConversation[] = []

  const mockData = [
    {
      userName: 'María González',
      userPhone: '+51 987 654 321',
      channel: 'whatsapp' as const,
      messages: [
        { id: 'm1', sender: 'user', text: 'Hola, ¿tienen Royal Canin para gatos?', timestamp: now - 3600000, time: '10:15', status: 'pending' as const },
        { id: 'm2', sender: 'agent', text: 'En CoraVet nos especializamos en salud animal. Ofrecemos consulta médica, vacunación y urgencias 24h. ¿Te interesa agendar una consulta?', timestamp: now - 3590000, time: '10:16', status: 'pending' as const },
        { id: 'm3', sender: 'user', text: '¿Cuánto cuesta la consulta?', timestamp: now - 3580000, time: '10:17', status: 'pending' as const },
        { id: 'm4', sender: 'agent', text: 'La consulta general es desde S/ 45. Incluye evaluación integral, control de peso y triaje. ¿Quieres agendar?', timestamp: now - 3570000, time: '10:18', status: 'pending' as const }
      ],
      tags: ['precio', 'servicios']
    },
    {
      userName: 'Carlos Mendoza',
      userPhone: '+51 912 345 678',
      channel: 'whatsapp' as const,
      messages: [
        { id: 'm1', sender: 'user', text: 'Mi perro vomitó sangre, ¿qué le doy?', timestamp: now - 7200000, time: '08:30', status: 'pending' as const },
        { id: 'm2', sender: 'agent', text: '¡Atención prioritaria! El vómito con sangre es ALERTA CRÍTICA. No le des remedios caseros. Acude DE INMEDIATO a Urgencias 24h.', timestamp: now - 7190000, time: '08:31', status: 'approved' as const }
      ],
      tags: ['urgencia', 'golden_example']
    },
    {
      userName: 'Ana Torres',
      userPhone: '+51 998 877 665',
      channel: 'web' as const,
      messages: [
        { id: 'm1', sender: 'user', text: 'Quiero comprar un departamento en Miraflores', timestamp: now - 1800000, time: '11:45', status: 'pending' as const },
        { id: 'm2', sender: 'agent', text: 'En Vallet Inmobiliaria tenemos el Proyecto Alto Miraflores: 1, 2 y 3 dormitorios frente a parque, certificación Edge. Desde $125,000 USD. ¿Te interesa agendar visita?', timestamp: now - 1790000, time: '11:46', status: 'pending' as const }
      ],
      tags: ['inmobiliaria', 'calificacion']
    },
    {
      userName: 'Pedro Ruiz',
      userPhone: '+51 955 444 333',
      channel: 'whatsapp' as const,
      messages: [
        { id: 'm1', sender: 'user', text: 'Son unos estafadores, nadie me responde', timestamp: now - 5400000, time: '09:20', status: 'pending' as const },
        { id: 'm2', sender: 'agent', text: 'Lamento sinceramente cualquier demora. En Qaway Lab nos tomamos muy en serio la satisfacción. Estoy elevando tu caso con soporte técnico para atención prioritaria.', timestamp: now - 5390000, time: '09:21', status: 'approved' as const }
      ],
      tags: ['queja', 'golden_example']
    },
    {
      userName: 'Lucía Fernández',
      userPhone: '+51 944 222 111',
      channel: 'web' as const,
      messages: [
        { id: 'm1', sender: 'user', text: '¿Hacen apps móviles para iPhone y Android?', timestamp: now - 9000000, time: '07:10', status: 'needs_review' as const },
        { id: 'm2', sender: 'agent', text: 'No, solo hacemos páginas web en React.', timestamp: now - 9000000 + 5000, time: '07:10', status: 'rejected' as const }
      ],
      tags: ['corrección_pendiente', 'fuera_catalogo']
    }
  ]

  return mockData.map((c, i) => ({
    id: `conv-${Date.now()}-${i}`,
    userName: c.userName,
    userPhone: c.userPhone,
    channel: c.channel,
    startedAt: c.messages[0].timestamp,
    lastActivity: c.messages[c.messages.length - 1].timestamp,
    messages: c.messages.map((m, idx) => ({
      ...m,
      id: m.id || `msg-${Date.now()}-${idx}`,
      status: m.status || 'pending'
    })),
    tags: c.tags
  }))
}

// Componentes hijos
function LiveConversationCard({ conversation, onSelect, onApprove, onReject, onCorrect }: any) {
  const lastMsg = conversation.messages[conversation.messages.length - 1]
  const pendingMsgs = conversation.messages.filter(m => m.status === 'pending' && m.sender === 'agent').length

  return (
    <div
      className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all cursor-pointer"
      onClick={onSelect}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm shrink-0">
            <User className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-slate-800 truncate">{conversation.userName}</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                {conversation.channel === 'whatsapp' ? 'WhatsApp' : 'Web'}
              </span>
              {conversation.tags.map(t => (
                <span key={t} className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700">{t}</span>
              ))}
            </div>
            <p className="text-xs text-slate-500 truncate mt-0.5">{lastMsg.text.slice(0, 80)}</p>
            <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400">
              <Clock className="w-3 h-3" />
              <span>{new Date(conversation.lastActivity).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              {conversation.userPhone && <span>• {conversation.userPhone}</span>}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {pendingMsgs > 0 && (
            <span className="bg-amber-50 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-200 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> {pendingMsgs} pendientes
            </span>
          )}
          <span className="text-[10px] text-slate-400">Ver →</span>
        </div>
      </div>
    </div>
  )
}

function LiveConversationModal({ conversation, onClose, onApprove, onReject, onCorrect }: any) {
  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[85vh] overflow-hidden shadow-2xl flex flex-col">
        <div className="flex items-center justify-between border-b border-slate-100 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800">{conversation.userName}</h3>
              <p className="text-xs text-slate-500 flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold">
                  {conversation.channel === 'whatsapp' ? 'WhatsApp' : 'Web'}
                </span>
                {conversation.tags.map(t => (
                  <span key={t} className="px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 text-[10px] font-bold">{t}</span>
                ))}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl font-bold">×</button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[60vh]">
          {conversation.messages.map((msg, idx) => (
            <LiveMessageBubble
              key={msg.id}
              message={msg}
              index={idx}
              onApprove={() => onApprove(conversation.id, idx)}
              onReject={() => onReject(conversation.id, idx)}
              onCorrect={() => onCorrect(conversation.id, idx)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

function LiveMessageBubble({ message, index, onApprove, onReject, onCorrect }: any) {
  const isAgent = message.sender === 'agent'
  const statusColors = {
    pending: 'bg-amber-50 border-amber-200 text-amber-700',
    approved: 'bg-emerald-50 border-emerald-200 text-emerald-700',
    rejected: 'bg-rose-50 border-rose-200 text-rose-700',
    corrected: 'bg-indigo-50 border-indigo-200 text-indigo-700'
  }
  const statusLabels = {
    pending: 'Pendiente',
    approved: 'Aprobado',
    rejected: 'Rechazado',
    corrected: 'Corregido'
  }

  return (
    <div className={`flex ${isAgent ? 'justify-start' : 'justify-end'}`}>
      <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-xs shadow-xs ${isAgent ? 'rounded-tl-xs' : 'rounded-tr-xs'} border ${statusColors[message.status]}`}>
        <div className="flex items-center justify-between mb-1">
          <span className="font-bold text-[10px] uppercase tracking-wider">
            {isAgent ? (
              <>
                <Bot className="w-3 h-3 inline mr-1" /> {message.sender === 'agent' ? 'Agente' : 'Sistema'}
              </>
            ) : (
              <>
                <User className="w-3 h-3 inline mr-1" /> Cliente
              </>
            )}
          </span>
          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded">{statusLabels[message.status]}</span>
        </div>
        <p className="whitespace-pre-wrap leading-relaxed">{message.text}</p>
        <div className="flex items-center justify-end gap-1 mt-1 text-[9px]">
          <span>{message.time}</span>
          {isAgent && message.status === 'pending' && (
            <div className="flex items-center gap-1">
              <button onClick={onApprove} className="p-1.5 rounded hover:bg-emerald-100 text-emerald-700" title="Aprobar">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </button>
              <button onClick={onReject} className="p-1.5 rounded hover:bg-rose-100 text-rose-700" title="Rechazar">
                <XCircle className="w-3.5 h-3.5" />
              </button>
              <button onClick={onCorrect} className="p-1.5 rounded hover:bg-indigo-100 text-indigo-700" title="Corregir → Golden Example">
                <Sparkles className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function CorrectionModal({ draft, onChange, onSave, onCancel }: any) {
  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 border border-slate-200">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-sm font-black text-slate-800">Corregir Respuesta → Golden Example</h3>
          <button onClick={onCancel} className="text-slate-400 hover:text-slate-600 font-black text-lg">×</button>
        </div>

        <div className="space-y-3">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/70 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Consulta del Cliente</span>
            <p className="font-bold text-slate-800 text-xs sm:text-sm">"{draft.userQuery}"</p>
          </div>

          <div className="bg-rose-50/50 p-3 rounded-xl border border-rose-200/70 space-y-1">
            <span className="text-[10px] font-bold text-rose-800 uppercase tracking-wider">Respuesta Incorrecta del Agente</span>
            <p className="text-slate-800 leading-relaxed whitespace-pre-wrap text-xs">{draft.badReply}</p>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Corrección Humana (Golden Answer) *</label>
            <textarea
              required
              rows={4}
              placeholder="Escribe la respuesta ideal que debería haber dado el agente..."
              value={draft.humanCorrection}
              onChange={e => onChange({ ...draft, humanCorrection: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#4f46e5]"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button onClick={onCancel} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer">Cancelar</button>
            <button onClick={onSave} disabled={!draft.humanCorrection.trim()} className="flex-1 bg-[#4f46e5] hover:bg-[#4338ca] text-white py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs disabled:opacity-50">Guardar y Convertir a Golden Example</button>
          </div>
        </div>
      </div>
    </div>
  )
}