import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react'
import { crmAdapter, checkIs24hWindowActive } from '../adapters/crmAdapter'

const CRMContext = createContext()

export function CRMProvider({ children }) {
  const [leads, setLeads] = useState([])
  const [campaigns, setCampaigns] = useState([])
  const [selectedLeadId, setSelectedLeadId] = useState(null)
  
  const [currentRole, setCurrentRole] = useState('management')
  const [customMetrics, setCustomMetrics] = useState([])
  const [globalSearchQuery, setGlobalSearchQuery] = useState('')

  const addCustomMetric = useCallback((metric) => {
    if (currentRole === 'management') setCustomMetrics(prev => [...prev, metric])
  }, [currentRole])

  const removeCustomMetric = useCallback((id) => {
    if (currentRole === 'management') setCustomMetrics(prev => prev.filter(m => m.id !== id))
  }, [currentRole])

  // Carga inicial y Suscripción Realtime desacoplada vía Adaptador
  useEffect(() => {
    async function loadData() {
      // 1. Cargar Campañas
      const campsData = await crmAdapter.getCampaigns()
      setCampaigns(campsData)

      // 2. Cargar Leads
      const leadsData = await crmAdapter.getLeads()
      setLeads(leadsData)
      if (leadsData.length > 0 && !selectedLeadId) {
        setSelectedLeadId(leadsData[0].id)
      }
    }
    
    loadData()

    // 3. Suscripción en Tiempo Real para nuevos Leads (Webhook Hostinger / Meta -> Supabase -> CRM)
    const unsubscribe = crmAdapter.subscribeToLeads({
      onInsert: (newMappedLead) => {
        setLeads(prev => [newMappedLead, ...prev])
      },
      onUpdate: (updatedMappedLead) => {
        setLeads(prev => prev.map(l => l.id === updatedMappedLead.id ? updatedMappedLead : l))
      },
      onDelete: (deletedId) => {
        setLeads(prev => prev.filter(l => l.id !== deletedId))
      }
    })

    return () => {
      unsubscribe()
    }
  }, []) // Se ejecuta una sola vez al montar

  const visibleLeads = currentRole === 'sales'
    ? leads.filter(l => l.agent === 'Agente Qaway A')
    : leads

  useEffect(() => {
    if (!visibleLeads.some(l => l.id === selectedLeadId) && visibleLeads.length > 0) {
      setSelectedLeadId(visibleLeads[0].id)
    }
  }, [currentRole, visibleLeads, selectedLeadId])

  // Mover un Lead en las etapas del Kanban
  const updateLeadStatus = useCallback(async (leadId, newStatus) => {
    // 1. Optimistic UI Update (instantáneo para el usuario)
    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status: newStatus } : l))
    
    // 2. DB Update desacoplado
    await crmAdapter.updateLeadStatus(leadId, newStatus)
  }, [])

  // Enviar mensaje de chat (simulado para UI, guardado en DB con timestamp)
  const sendChatMessage = useCallback(async (leadId, text, messageType = 'text', payload = null) => {
    const lead = leads.find(l => l.id === leadId)
    if (!lead) return

    const timestamp = Date.now()
    const newMessage = {
      sender: 'agent',
      text,
      time: new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      timestamp,
      type: messageType,
      ...(payload ? { payload } : {})
    }
    const updatedHistory = [...(lead.history || []), newMessage]

    // 1. Optimistic UI Update
    setLeads(prev => prev.map(l => {
      if (l.id === leadId) {
        return {
          ...l,
          lastMessage: text,
          history: updatedHistory,
          unreadCount: 0
        }
      }
      return l
    }))

    // 2. DB Update desacoplado
    await crmAdapter.updateLeadChat(leadId, text, updatedHistory, 0)

    // 3. Envío saliente hacia WhatsApp Cloud API vía Edge Function
    const targetLead = leads.find(l => l.id === leadId)
    if (targetLead?.whatsapp) {
      crmAdapter.sendWhatsAppMessage({
        to: targetLead.whatsapp,
        text,
        leadId,
        type: payload?.type || 'text',
        templateName: payload?.templateName || null
      }).catch(err => console.warn('[CRMContext] Fallback saliente:', err))
    }
  }, [leads])

  // Simular la llegada de un lead por webhook (Insert vía Adaptador)
  const simulateIncomingWebhook = useCallback(async (newLead) => {
    const timestamp = Date.now()
    const simId = 'sim-' + timestamp
    const leadToInsert = {
      id: simId,
      client_name: newLead.name,
      contact_info: newLead.whatsapp,
      name: newLead.name,
      whatsapp: newLead.whatsapp,
      email: newLead.email,
      campaign_id: newLead.campaignId,
      campaign_name: newLead.campaignName,
      status: newLead.isHumanRequested ? 'negociacion' : (newLead.status || 'new'),
      stage: newLead.isHumanRequested ? 'negociacion' : (newLead.status || 'new'),
      channel: newLead.channel || 'whatsapp',
      budget: newLead.budget || 0,
      agent: newLead.isHumanRequested ? 'Asesor Humano Requerido' : 'Agente Qaway A',
      last_message: newLead.lastMessage,
      is_human_requested: Boolean(newLead.isHumanRequested),
      created_at: new Date(timestamp).toISOString(),
      history: [{
        sender: 'lead',
        text: newLead.lastMessage,
        time: new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        timestamp,
        type: 'text'
      }],
      metadata: {
        ...(newLead.metadata || {}),
        channel: newLead.channel || 'whatsapp',
        referral: newLead.referral || null,
        is_human_requested: Boolean(newLead.isHumanRequested)
      },
      unread_count: 1
    }

    // Inserción en DB
    const { error } = await crmAdapter.insertLead(leadToInsert)
    if (error) {
      console.warn("[CRM Provider] Aviso de Supabase al insertar lead simulado:", error.message || error)
      // Fallback local instantáneo para garantizar reactividad en pruebas
      setLeads(prev => [leadToInsert, ...prev])
    } else {
      console.log("[CRM Provider] Lead simulado insertado exitosamente en Supabase.")
      // Si la suscripción Realtime tarda unos milisegundos, garantizamos la presencia en UI
      setLeads(prev => {
        if (prev.some(l => l.id === simId)) return prev
        return [leadToInsert, ...prev]
      })
    }
  }, [])

  // Obtener estadísticas globales
  const getGlobalStats = useCallback(() => {
    const totalSpend = campaigns.reduce((acc, c) => acc + (Number(c.spend) || 0), 0)
    const totalRevenue = campaigns.reduce((acc, c) => acc + (Number(c.revenue) || 0), 0)
    const totalLeads = visibleLeads.length
    const wonLeads = visibleLeads.filter(l => l.status === 'ganado').length
    const conversionRate = totalLeads > 0 ? ((wonLeads / totalLeads) * 100).toFixed(1) : 0
    const cac = wonLeads > 0 ? (totalSpend / wonLeads).toFixed(2) : 0
    const roi = totalSpend > 0 ? (((totalRevenue - totalSpend) / totalSpend) * 100).toFixed(0) : 0

    return { totalSpend, totalRevenue, totalLeads, wonLeads, conversionRate, cac, roi }
  }, [campaigns, visibleLeads])

  const selectedLead = visibleLeads.find(l => l.id === selectedLeadId) || visibleLeads[0] || {}

  const is24hWindowActive = useCallback((lead) => {
    if (!lead) return false
    if (typeof lead.is24hWindowActive === 'boolean') return lead.is24hWindowActive
    return checkIs24hWindowActive(lead.lastCustomerMessageTimestamp)
  }, [])

  const contextValue = useMemo(() => ({
    leads: visibleLeads,
    campaigns,
    selectedLeadId,
    setSelectedLeadId,
    selectedLead,
    globalSearchQuery,
    setGlobalSearchQuery,
    updateLeadStatus,
    sendChatMessage,
    simulateIncomingWebhook,
    getGlobalStats,
    is24hWindowActive,
    currentRole,
    setCurrentRole,
    customMetrics,
    addCustomMetric,
    removeCustomMetric
  }), [
    visibleLeads,
    campaigns,
    selectedLeadId,
    selectedLead,
    globalSearchQuery,
    currentRole,
    customMetrics,
    updateLeadStatus,
    sendChatMessage,
    simulateIncomingWebhook,
    getGlobalStats,
    is24hWindowActive,
    addCustomMetric,
    removeCustomMetric
  ])

  return (
    <CRMContext.Provider value={contextValue}>
      {children}
    </CRMContext.Provider>
  )
}

export function useCRM() {
  const context = useContext(CRMContext)
  if (!context) {
    throw new Error('useCRM debe usarse dentro de un CRMProvider')
  }
  return context
}
