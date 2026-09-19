import { supabase } from '../../../../config/supabase'
import { WABA_SERVICE_WINDOW_MS } from '../types'

/**
 * Determina el timestamp del último mensaje enviado por el cliente/lead
 * @param {Array} history 
 * @param {string} createdAt 
 * @returns {number}
 */
export function getLastCustomerMessageTimestamp(history = [], createdAt = null) {
  if (Array.isArray(history) && history.length > 0) {
    for (let i = history.length - 1; i >= 0; i--) {
      const msg = history[i]
      if (msg && (msg.sender === 'lead' || msg.sender === 'customer')) {
        if (msg.timestamp) return Number(msg.timestamp)
      }
    }
  }
  if (createdAt) {
    const parsed = new Date(createdAt).getTime()
    if (!isNaN(parsed)) return parsed
  }
  return Date.now()
}

/**
 * Evalúa si la ventana de servicio de 24 horas de Meta está activa
 * @param {number} lastCustomerTimestamp 
 * @returns {boolean}
 */
export function checkIs24hWindowActive(lastCustomerTimestamp) {
  if (!lastCustomerTimestamp) return false
  return (Date.now() - lastCustomerTimestamp) <= WABA_SERVICE_WINDOW_MS
}

/**
 * Transforma un registro de Supabase (snake_case) al modelo canónico del frontend (camelCase)
 * Enriquecido con metadatos de WABA (atribución referral y ventana de 24h)
 * @param {Object} rawLead 
 * @returns {Object}
 */
export function mapLeadToFrontend(rawLead) {
  if (!rawLead) return null
  const history = Array.isArray(rawLead.history) ? rawLead.history : []
  const lastCustomerTimestamp = getLastCustomerMessageTimestamp(history, rawLead.created_at)
  const is24hOpen = checkIs24hWindowActive(lastCustomerTimestamp)

  // Extracción de atribución referral si existe en metadata o columna directa
  const referral = rawLead.metadata?.referral || rawLead.referral || null
  const isHumanRequested = Boolean(rawLead.is_human_requested || rawLead.metadata?.is_human_requested)
  const channel = rawLead.channel || rawLead.metadata?.channel || 'whatsapp'
  const humanHandoffRequestedAt = rawLead.human_handoff_requested_at || rawLead.metadata?.human_handoff_requested_at || null

  return {
    ...rawLead,
    campaignName: rawLead.campaign_name,
    campaignId: rawLead.campaign_id,
    lastMessage: rawLead.last_message,
    unreadCount: rawLead.unread_count || 0,
    history,
    referral,
    channel,
    isHumanRequested,
    humanHandoffRequestedAt,
    lastCustomerMessageTimestamp: lastCustomerTimestamp,
    is24hWindowActive: is24hOpen
  }
}

/**
 * Adaptador de Operaciones de Datos del CRM
 * Desacopla la persistencia (Supabase / Webhooks / API) del árbol de componentes de React
 */
export const crmAdapter = {
  /**
   * Obtiene la lista de tenants/marcas activas
   * @returns {Promise<Array>}
   */
  async getTenants() {
    try {
      const { data, error } = await supabase
        .from('tenants')
        .select('id, client_code, slug, name, status, branding')
        .eq('status', 'active')
        .order('name', { ascending: true })
      if (error) {
        console.error('[CRM Adapter] Error al obtener tenants:', error)
        return []
      }
      return data || []
    } catch (err) {
      console.error('[CRM Adapter] Error inesperado en getTenants:', err)
      return []
    }
  },

  /**
   * Obtiene la lista completa de campañas (filtradas opcionalmente por tenant)
   * @param {string|null} tenantId 
   * @returns {Promise<Array>}
   */
  async getCampaigns(tenantId = null) {
    try {
      let query = supabase.from('campaigns').select('*')
      if (tenantId && tenantId !== 'all') {
        query = query.eq('tenant_id', tenantId)
      }
      const { data, error } = await query
      if (error) {
        console.error('[CRM Adapter] Error al obtener campañas:', error)
        return []
      }
      return data || []
    } catch (err) {
      console.error('[CRM Adapter] Error inesperado en getCampaigns:', err)
      return []
    }
  },

  /**
   * Obtiene todos los leads ordenados cronológicamente (filtrados opcionalmente por tenant)
   * @param {string|null} tenantId
   * @returns {Promise<Array>}
   */
  async getLeads(tenantId = null) {
    try {
      let query = supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false })
      if (tenantId && tenantId !== 'all') {
        query = query.eq('tenant_id', tenantId)
      }
      const { data, error } = await query
      if (error) {
        console.error('[CRM Adapter] Error al obtener leads:', error)
        return []
      }
      return (data || []).map(mapLeadToFrontend)
    } catch (err) {
      console.error('[CRM Adapter] Error inesperado en getLeads:', err)
      return []
    }
  },

  /**
   * Actualiza la etapa de embudo de un lead en base de datos
   * @param {string} leadId 
   * @param {string} status 
   * @returns {Promise<{error: any}>}
   */
  async updateLeadStatus(leadId, status) {
    try {
      const { error } = await supabase
        .from('leads')
        .update({ status })
        .eq('id', leadId)
      if (error) console.error('[CRM Adapter] Error al actualizar status:', error)
      return { error }
    } catch (err) {
      console.error('[CRM Adapter] Error inesperado en updateLeadStatus:', err)
      return { error: err }
    }
  },

  /**
   * Actualiza el historial de chat y último mensaje de un lead
   * @param {string} leadId 
   * @param {string} text 
   * @param {Array} history 
   * @param {number} unreadCount 
   * @returns {Promise<{error: any}>}
   */
  async updateLeadChat(leadId, text, history, unreadCount = 0) {
    try {
      const { error } = await supabase
        .from('leads')
        .update({
          last_message: text,
          history,
          unread_count: unreadCount
        })
        .eq('id', leadId)
      if (error) console.error('[CRM Adapter] Error al actualizar chat:', error)
      return { error }
    } catch (err) {
      console.error('[CRM Adapter] Error inesperado en updateLeadChat:', err)
      return { error: err }
    }
  },

  /**
   * Inserta un nuevo lead en Supabase con tenant_id obligatorio
   * @param {Object} leadPayload 
   * @returns {Promise<{data: any, error: any}>}
   */
  async insertLead(leadPayload) {
    try {
      const payloadWithTenant = {
        ...leadPayload,
        tenant_id: leadPayload.tenant_id || '00000000-0000-0000-0000-000000000001'
      }
      const { data, error } = await supabase.from('leads').insert([payloadWithTenant])
      return { data, error }
    } catch (err) {
      console.error('[CRM Adapter] Error inesperado en insertLead:', err)
      return { data: null, error: err }
    }
  },

  /**
   * Suscribe a cambios en tiempo real en la tabla leads
   * @param {Object} callbacks 
   * @param {Function} callbacks.onInsert 
   * @param {Function} callbacks.onUpdate 
   * @param {Function} callbacks.onDelete 
   * @returns {Function} Función de desuscripción (cleanup)
   */
  subscribeToLeads({ onInsert, onUpdate, onDelete }) {
    const channel = supabase
      .channel('realtime-leads')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'leads' }, (payload) => {
        if (payload.eventType === 'INSERT' && onInsert) {
          onInsert(mapLeadToFrontend(payload.new))
        } else if (payload.eventType === 'UPDATE' && onUpdate) {
          onUpdate(mapLeadToFrontend(payload.new))
        } else if (payload.eventType === 'DELETE' && onDelete) {
          onDelete(payload.old.id)
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  },

  /**
   * Envía un mensaje saliente de WhatsApp a través de la Edge Function oficial
   * @param {Object} params
   * @param {string} params.to - Teléfono del cliente en formato internacional
   * @param {string} params.text - Contenido del mensaje
   * @param {string} [params.leadId] - UUID del lead
   * @param {string} [params.type] - 'text' | 'template' | 'flow'
   * @param {string} [params.templateName] - Nombre de plantilla HSM de Meta
   * @returns {Promise<{success: boolean, wamid?: string, error?: any}>}
   */
  async sendWhatsAppMessage({ to, text, leadId, type = 'text', templateName = null }) {
    try {
      const { data, error } = await supabase.functions.invoke('whatsapp-mensaje-enviar', {
        body: { to, text, leadId, type, templateName }
      })

      if (error) {
        console.warn('[CRM Adapter] Edge function whatsapp-mensaje-enviar reportó error, usando fallback local:', error)
        return { success: false, error }
      }
      return { success: true, ...data }
    } catch (err) {
      console.error('[CRM Adapter] Error al invocar whatsapp-mensaje-enviar:', err)
      return { success: false, error: err }
    }
  }
}

