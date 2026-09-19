import React, { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCRM } from '../context/CRMContext'
import { 
  Target, CheckSquare, Square, Clock, Plus, Search, 
  Phone, Calendar, MessageSquare, FileText, X, AlertCircle, 
  Trash2, CheckCircle2, User, Building2, ChevronRight,
  Flame, Check
} from 'lucide-react'

const INITIAL_TASKS = [
  {
    id: 'task-1',
    title: 'Llamada de seguimiento para revisión de propuesta técnica',
    clientName: 'Vallet Inmobiliaria SAC',
    leadId: 'client-vallet-1',
    type: 'call',
    priority: 'high',
    dueDate: 'Hoy, 15:30',
    completed: false,
    agent: 'Andrés Valencia'
  },
  {
    id: 'task-2',
    title: 'Configurar ventana WABA de 24h y demo de menú degustación',
    clientName: 'Mesa Selecta Gourmet',
    leadId: 'client-mesaselecta-2',
    type: 'whatsapp',
    priority: 'medium',
    dueDate: 'Hoy, 17:00',
    completed: false,
    agent: 'Martín Rojas'
  },
  {
    id: 'task-3',
    title: 'Enviar presupuesto de integración de pasarela de pagos',
    clientName: 'Aurea Skincare Lab',
    leadId: 'client-aurea-4',
    type: 'proposal',
    priority: 'high',
    dueDate: 'Mañana, 10:00',
    completed: false,
    agent: 'Sofía Castillo'
  },
  {
    id: 'task-4',
    title: 'Reunión de inducción al módulo de citas médicas',
    clientName: 'CoraVet Clínica Veterinaria',
    leadId: 'client-coravet-3',
    type: 'meeting',
    priority: 'medium',
    dueDate: '22 Sep, 11:30',
    completed: true,
    agent: 'Andrés Valencia'
  },
  {
    id: 'task-5',
    title: 'Validar entrega de credenciales y acceso a panel CRM',
    clientName: 'Alejandro Ruiz',
    leadId: null,
    type: 'whatsapp',
    priority: 'low',
    dueDate: '24 Sep, 16:00',
    completed: false,
    agent: 'Martín Rojas'
  }
]

const TASK_TYPE_CONFIG = {
  call: { label: 'Llamada Telefónica', icon: Phone, color: 'text-blue-600 bg-blue-50 border-blue-200' },
  whatsapp: { label: 'Mensaje WhatsApp', icon: MessageSquare, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
  meeting: { label: 'Reunión / Demo', icon: Calendar, color: 'text-purple-600 bg-purple-50 border-purple-200' },
  proposal: { label: 'Propuesta / Cotización', icon: FileText, color: 'text-amber-600 bg-amber-50 border-amber-200' }
}

const PRIORITY_CONFIG = {
  high: { label: 'Alta', color: 'text-red-700 bg-red-50 border-red-200' },
  medium: { label: 'Media', color: 'text-blue-700 bg-blue-50 border-blue-200' },
  low: { label: 'Baja', color: 'text-zinc-600 bg-zinc-100 border-zinc-200' }
}

export default function TareasView({ onNavigateToChat }) {
  const { leads, setSelectedLeadId, globalSearchQuery, setGlobalSearchQuery } = useCRM()

  // Estado de tareas con persistencia en localStorage
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem('qaway_crm_tasks')
    if (saved) {
      try { return JSON.parse(saved) } catch (e) { return INITIAL_TASKS }
    }
    return INITIAL_TASKS
  })

  useEffect(() => {
    localStorage.setItem('qaway_crm_tasks', JSON.stringify(tasks))
  }, [tasks])

  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('pending') // 'pending' | 'completed' | 'all'
  const [showNewTaskModal, setShowNewTaskModal] = useState(false)

  // Formulario de nueva tarea
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [newTaskType, setNewTaskType] = useState('call')
  const [newTaskPriority, setNewTaskPriority] = useState('medium')
  const [newTaskClient, setNewTaskClient] = useState('')
  const [newTaskDueDate, setNewTaskDueDate] = useState('')

  const effectiveSearch = globalSearchQuery || searchTerm

  // Métricas de cabecera
  const stats = useMemo(() => {
    const total = tasks.length
    const pending = tasks.filter(t => !t.completed).length
    const whatsappFollowups = tasks.filter(t => !t.completed && t.type === 'whatsapp').length
    const meetings = tasks.filter(t => !t.completed && t.type === 'meeting').length
    const completed = tasks.filter(t => t.completed).length
    return { total, pending, whatsappFollowups, meetings, completed }
  }, [tasks])

  // Filtrado reactivo de tareas
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const query = effectiveSearch.toLowerCase()
      const matchesSearch = !query || 
        task.title.toLowerCase().includes(query) || 
        task.clientName.toLowerCase().includes(query) || 
        task.agent.toLowerCase().includes(query)

      const matchesType = typeFilter === 'all' || task.type === typeFilter
      const matchesStatus = 
        statusFilter === 'all' ? true :
        statusFilter === 'pending' ? !task.completed : task.completed

      return matchesSearch && matchesType && matchesStatus
    })
  }, [tasks, effectiveSearch, typeFilter, statusFilter])

  // Toggle completar tarea
  const toggleTask = (taskId) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t))
  }

  // Eliminar tarea
  const deleteTask = (taskId) => {
    setTasks(prev => prev.filter(t => t.id !== taskId))
  }

  // Crear nueva tarea
  const handleCreateTask = (e) => {
    e.preventDefault()
    if (!newTaskTitle.trim()) return

    const newTask = {
      id: 'task-' + Date.now(),
      title: newTaskTitle.trim(),
      clientName: newTaskClient.trim() || 'Prospecto General',
      leadId: null,
      type: newTaskType,
      priority: newTaskPriority,
      dueDate: newTaskDueDate.trim() || 'Pronto',
      completed: false,
      agent: 'Andrés Valencia'
    }

    setTasks(prev => [newTask, ...prev])
    setNewTaskTitle('')
    setNewTaskClient('')
    setNewTaskDueDate('')
    setShowNewTaskModal(false)
  }

  const handleOpenChat = (leadId) => {
    if (leadId) {
      if (setSelectedLeadId) setSelectedLeadId(leadId)
      if (onNavigateToChat) onNavigateToChat(leadId)
    }
  }

  return (
    <div className="bg-transparent text-zinc-900 max-w-7xl mx-auto space-y-6">
      
      {/* ── 1. CABECERA LIBRE SOBRE EL LIENZO ────────────────────── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
            Tareas & Seguimientos Comerciales
          </h1>
          <p className="text-[14px] text-zinc-500 font-medium mt-1">
            Planificador de quehaceres, recordatorios de llamadas y cierres con clientes.
          </p>
        </div>
      </div>

      {/* ── 2. CUATRO TARJETAS KPI INDEPENDIENTES CON LÍNEA DE TENDENCIA ──────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        {/* Pendientes */}
        <div className="bg-white border border-zinc-200/80 rounded-2xl p-4 shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all hover:-translate-y-0.5 flex flex-col justify-between">
          <div>
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Pendientes</span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <p className="text-3xl font-extrabold text-zinc-900 tracking-tight">{stats.pending}</p>
              <span className="text-xs text-amber-600 font-bold">por resolver</span>
            </div>
          </div>
          <div className="h-8 w-full mt-3 -mb-1">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 100 28" preserveAspectRatio="none">
              <polyline
                fill="none"
                stroke="#f59e0b"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                points="0,22 15,20 30,23 45,15 60,17 75,10 90,13 100,6"
              />
            </svg>
          </div>
        </div>

        {/* WhatsApp Pendiente */}
        <div className="bg-white border border-zinc-200/80 rounded-2xl p-4 shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all hover:-translate-y-0.5 flex flex-col justify-between">
          <div>
            <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">WhatsApp Pendiente</span>
            <div className="flex items-baseline gap-1 mt-1">
              <p className="text-3xl font-extrabold text-emerald-800 tracking-tight">{stats.whatsappFollowups}</p>
              <span className="text-xs text-emerald-600 font-bold">mensajes</span>
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
                points="0,24 15,21 30,22 45,17 60,18 75,12 90,14 100,9"
              />
            </svg>
          </div>
        </div>

        {/* Demos / Reuniones */}
        <div className="bg-white border border-zinc-200/80 rounded-2xl p-4 shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all hover:-translate-y-0.5 flex flex-col justify-between">
          <div>
            <span className="text-xs font-semibold text-purple-600 uppercase tracking-wider">Demos / Reuniones</span>
            <div className="flex items-baseline gap-1 mt-1">
              <p className="text-3xl font-extrabold text-purple-800 tracking-tight">{stats.meetings}</p>
              <span className="text-xs text-purple-600 font-bold">agendadas</span>
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

        {/* Completadas */}
        <div className="bg-white border border-zinc-200/80 rounded-2xl p-4 shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all hover:-translate-y-0.5 flex flex-col justify-between">
          <div>
            <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Completadas</span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <p className="text-3xl font-extrabold text-blue-800 tracking-tight">{stats.completed}</p>
              <span className="text-xs text-blue-500 font-medium">de {stats.total}</span>
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
                points="0,23 15,22 30,18 45,20 60,14 75,16 90,9 100,5"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* ── 3. BARRA DE HERRAMIENTAS STICKY: BÚSQUEDA, FILTROS Y CTA ──────── */}
      <div className="sticky top-0 z-20 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white/95 backdrop-blur-md border border-zinc-200/80 px-4 py-3 rounded-xl shadow-[0_4px_16px_rgba(0,0,0,0.03)]">
        {/* Buscador */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar tarea, cliente o asesor..."
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

        {/* Filtros y CTA */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Filtro Tipo */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3.5 py-2 bg-zinc-50 border border-zinc-200/80 rounded-xl text-xs sm:text-[13px] text-zinc-700 focus:outline-none focus:border-zinc-400 cursor-pointer font-semibold"
          >
            <option value="all">Todos los Tipos</option>
            <option value="call">Llamadas</option>
            <option value="whatsapp">WhatsApp</option>
            <option value="meeting">Reuniones / Demos</option>
            <option value="proposal">Propuestas</option>
          </select>

          {/* Filtro Estado */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3.5 py-2 bg-zinc-50 border border-zinc-200/80 rounded-xl text-xs sm:text-[13px] text-zinc-700 focus:outline-none focus:border-zinc-400 cursor-pointer font-semibold"
          >
            <option value="pending">Solo Pendientes</option>
            <option value="completed">Completadas</option>
            <option value="all">Todas las Tareas</option>
          </select>

          {/* Botón Nueva Tarea */}
          <button
            onClick={() => setShowNewTaskModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#ff4b0b] hover:bg-[#e03f06] text-white rounded-xl text-xs sm:text-[13px] font-bold shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Nueva Tarea</span>
          </button>
        </div>
      </div>

      {/* ── 4. LISTADO DE TAREAS MODULAR ───────────────────────────── */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-zinc-200 rounded-2xl bg-white">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mb-2" />
            <h4 className="text-base font-bold text-zinc-800">¡Al día con las tareas!</h4>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-sm mt-1">
              No hay tareas que coincidan con los filtros actuales. Puedes crear una nueva tarea para agendar un seguimiento comercial.
            </p>
          </div>
        ) : (
          filteredTasks.map((task) => {
            const typeConfig = TASK_TYPE_CONFIG[task.type] || TASK_TYPE_CONFIG.call
            const priorityConfig = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.medium
            const TypeIcon = typeConfig.icon

            return (
              <motion.div
                key={task.id}
                layout
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 rounded-2xl border transition-all gap-4 ${
                  task.completed 
                    ? 'bg-zinc-50/60 border-zinc-200/60 opacity-60' 
                    : 'bg-white border-zinc-200/80 hover:border-zinc-300 hover:shadow-xs'
                }`}
              >
                {/* Lado Izquierdo: Checkbox y Detalle */}
                <div className="flex items-start gap-3.5 flex-1 min-w-0">
                  <button
                    onClick={() => toggleTask(task.id)}
                    className="mt-0.5 text-zinc-400 hover:text-[#ff4b0b] transition-colors shrink-0"
                    title={task.completed ? 'Marcar como pendiente' : 'Marcar como completada'}
                  >
                    {task.completed ? (
                      <div className="w-5 h-5 rounded-md bg-emerald-500 text-white flex items-center justify-center">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    ) : (
                      <Square className="w-5 h-5 text-zinc-300 hover:text-[#ff4b0b]" />
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    <p className={`text-[14px] font-bold leading-tight ${task.completed ? 'line-through text-zinc-400' : 'text-zinc-900'}`}>
                      {task.title}
                    </p>

                    <div className="flex flex-wrap items-center gap-2 mt-2 text-[12px] text-zinc-500">
                      {/* Cliente */}
                      <span className="flex items-center gap-1 font-semibold text-zinc-700">
                        <Building2 className="w-3.5 h-3.5 text-zinc-400" />
                        <span className="truncate max-w-[160px]">{task.clientName}</span>
                      </span>

                      <span className="text-zinc-300">•</span>

                      {/* Tipo */}
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-semibold border ${typeConfig.color}`}>
                        <TypeIcon className="w-3.5 h-3.5" />
                        <span>{typeConfig.label}</span>
                      </span>

                      {/* Prioridad */}
                      <span className={`inline-flex items-center gap-0.5 px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider border ${priorityConfig.color}`}>
                        {task.priority === 'high' && <Flame className="w-3 h-3 text-red-500 inline" />}
                        <span>{priorityConfig.label}</span>
                      </span>

                      <span className="text-zinc-300">•</span>

                      {/* Fecha Límite */}
                      <span className="flex items-center gap-1 text-zinc-500 font-mono text-[11.5px] font-medium">
                        <Clock className="w-3.5 h-3.5 text-zinc-400" />
                        <span>{task.dueDate}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Lado Derecho: Asesor y Acciones */}
                <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-100">
                  <span className="text-[12px] text-zinc-500 font-semibold">
                    {task.agent}
                  </span>

                  <div className="flex items-center gap-1.5">
                    {task.leadId && (
                      <button
                        onClick={() => handleOpenChat(task.leadId)}
                        title="Ir a conversación en WhatsApp"
                        className="p-2 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors"
                      >
                        <MessageSquare className="w-4 h-4" />
                      </button>
                    )}

                    <button
                      onClick={() => deleteTask(task.id)}
                      title="Eliminar tarea"
                      className="p-2 rounded-lg text-zinc-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            )
          })
        )}
      </div>

      {/* ── 4. MODAL: NUEVA TAREA ──────────────────────────────────── */}
      <AnimatePresence>
        {showNewTaskModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowNewTaskModal(false)}
              className="fixed inset-0 bg-black/30 backdrop-blur-xs"
            />

            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-2xl border border-zinc-200 shadow-2xl p-6 w-full max-w-md relative z-10 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#ff4b0b]/10 text-[#ff4b0b] flex items-center justify-center">
                    <Target className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-zinc-900">Crear Nueva Tarea Comercial</h3>
                </div>
                <button 
                  onClick={() => setShowNewTaskModal(false)}
                  className="p-1 text-zinc-400 hover:text-zinc-600 rounded-lg hover:bg-zinc-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateTask} className="space-y-3 text-xs">
                <div>
                  <label className="block text-zinc-600 font-semibold mb-1">Título de la Tarea / Acción</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Llamar para coordinar reunión de cierre..."
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-zinc-800 placeholder:text-zinc-400 focus:outline-none focus:border-[#ff4b0b]"
                  />
                </div>

                <div>
                  <label className="block text-zinc-600 font-semibold mb-1">Cliente o Empresa Asociada</label>
                  <input
                    type="text"
                    placeholder="Ej. Vallet Inmobiliaria SAC"
                    value={newTaskClient}
                    onChange={(e) => setNewTaskClient(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-zinc-800 placeholder:text-zinc-400 focus:outline-none focus:border-[#ff4b0b]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-zinc-600 font-semibold mb-1">Tipo de Tarea</label>
                    <select
                      value={newTaskType}
                      onChange={(e) => setNewTaskType(e.target.value)}
                      className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-zinc-800 focus:outline-none focus:border-[#ff4b0b]"
                    >
                      <option value="call">Llamada</option>
                      <option value="whatsapp">WhatsApp</option>
                      <option value="meeting">Reunión / Demo</option>
                      <option value="proposal">Propuesta</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-zinc-600 font-semibold mb-1">Prioridad</label>
                    <select
                      value={newTaskPriority}
                      onChange={(e) => setNewTaskPriority(e.target.value)}
                      className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-zinc-800 focus:outline-none focus:border-[#ff4b0b]"
                    >
                      <option value="high">Alta</option>
                      <option value="medium">Media</option>
                      <option value="low">Baja</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-zinc-600 font-semibold mb-1">Fecha / Hora Límite</label>
                  <input
                    type="text"
                    placeholder="Ej. Hoy, 16:00 o 25 Sep"
                    value={newTaskDueDate}
                    onChange={(e) => setNewTaskDueDate(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-zinc-800 placeholder:text-zinc-400 focus:outline-none focus:border-[#ff4b0b]"
                  />
                </div>

                <div className="pt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowNewTaskModal(false)}
                    className="flex-1 py-2 px-4 rounded-xl border border-zinc-200 text-zinc-600 hover:bg-zinc-50 font-semibold transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 px-4 rounded-xl bg-[#ff4b0b] hover:bg-[#e03f06] text-white font-semibold shadow-xs transition-colors"
                  >
                    Guardar Tarea
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  )
}

