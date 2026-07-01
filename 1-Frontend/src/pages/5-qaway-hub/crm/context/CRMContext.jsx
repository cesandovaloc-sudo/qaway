import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react'
import { supabase } from '../../../../config/supabase'

const CRMContext = createContext()

// Helper function to map Supabase snake_case to frontend camelCase
const mapLeadToFrontend = (lead) => ({
  ...lead,
  campaignName: lead.campaign_name,
  campaignId: lead.campaign_id,
  lastMessage: lead.last_message,
  unreadCount: lead.unread_count || 0,
  history: lead.history || []
})

export function CRMProvider({ children }) {
  const [leads, setLeads] = useState([])
  const [campaigns, setCampaigns] = useState([])
  const [selectedLeadId, setSelectedLeadId] = useState(null)
  
  const [currentRole, setCurrentRole] = useState('management')
  const [customMetrics, setCustomMetrics] = useState([])

  const addCustomMetric = useCallback((metric) => {
    if (currentRole === 'management') setCustomMetrics(prev => [...prev, metric])
  }, [currentRole])

  const removeCustomMetric = useCallback((id) => {
    if (currentRole === 'management') setCustomMetrics(prev => prev.filter(m => m.id !== id))
  }, [currentRole])

  // Carga inicial y Suscripción Realtime a Supabase
  useEffect(() => {
    async function loadData() {
      // 1. Cargar Campañas
      const { data: campsData } = await supabase.from('campaigns').select('*')
      if (campsData) setCampaigns(campsData)

      // 2. Cargar Leads
      const { data: leadsData } = await supabase.from('leads').select('*').order('created_at', { ascending: false })
      if (leadsData) {
        const mapped = leadsData.map(mapLeadToFrontend)
        setLeads(mapped)
        if (mapped.length > 0 && !selectedLeadId) {
          setSelectedLeadId(mapped[0].id)
        }
      }
    }
    
    loadData()

    // 3. Suscripción en Tiempo Real para nuevos Leads (Webhook Hostinger -> Supabase -> CRM)
    const channel = supabase.channel('realtime-leads')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'leads' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          const newMappedLead = mapLeadToFrontend(payload.new)
          setLeads(prev => [newMappedLead, ...prev])
        } else if (payload.eventType === 'UPDATE') {
          const updatedMappedLead = mapLeadToFrontend(payload.new)
          setLeads(prev => prev.map(l => l.id === payload.new.id ? updatedMappedLead : l))
        } else if (payload.eventType === 'DELETE') {
          setLeads(prev => prev.filter(l => l.id !== payload.old.id))
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
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
    
    // 2. DB Update (en segundo plano)
    const { error } = await supabase
      .from('leads')
      .update({ status: newStatus })
      .eq('id', leadId)
      
    if (error) console.error("Error updating lead status in Supabase:", error)
  }, [])

  // Enviar mensaje de chat (simulado para UI, guardado en DB)
  const sendChatMessage = useCallback(async (leadId, text) => {
    const lead = leads.find(l => l.id === leadId)
    if (!lead) return

    const newMessage = { sender: 'agent', text, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
    const updatedHistory = [...(lead.history || []), newMessage]

    // 1. Optimistic UI Update
    setLeads(prev => prev.map(l => {
      if (l.id === leadId) {
        return { ...l, lastMessage: text, history: updatedHistory, unreadCount: 0 }
      }
      return l
    }))

    // 2. DB Update
    await supabase
      .from('leads')
      .update({ last_message: text, history: updatedHistory, unread_count: 0 })
      .eq('id', leadId)
  }, [leads])

  // Simular la llegada de un lead por webhook (Insert directo a Supabase)
  const simulateIncomingWebhook = useCallback(async (newLead) => {
    const leadToInsert = {
      name: newLead.name,
      whatsapp: newLead.whatsapp,
      email: newLead.email,
      campaign_id: newLead.campaignId,
      campaign_name: newLead.campaignName,
      status: 'new',
      priority: 'medium',
      budget: newLead.budget || 0,
      agent: 'Agente Qaway A',
      last_message: newLead.lastMessage,
      history: [{ sender: 'lead', text: newLead.lastMessage, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }],
      metadata: newLead.metadata || {},
      unread_count: 1
    }

    const { error } = await supabase.from('leads').insert([leadToInsert])
    if (error) {
      console.error("Error insertando lead de simulación:", error)
      alert("Error de Supabase: " + error.message)
    } else {
      console.log("Insert exitoso en Supabase. Si no lo ves, recarga la página o habilita Realtime en tu base de datos.")
    }
    // NOTA: El canal Realtime se encarga de hacer el setLeads() automáticamente al detectar el INSERT.
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

  const contextValue = useMemo(() => ({
    leads: visibleLeads,
    campaigns,
    selectedLeadId,
    setSelectedLeadId,
    selectedLead,
    updateLeadStatus,
    sendChatMessage,
    simulateIncomingWebhook,
    getGlobalStats,
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
    currentRole,
    customMetrics,
    updateLeadStatus,
    sendChatMessage,
    simulateIncomingWebhook,
    getGlobalStats,
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
