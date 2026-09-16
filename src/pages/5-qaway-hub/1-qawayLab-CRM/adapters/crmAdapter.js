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

  return {
    ...rawLead,
    campaignName: rawLead.campaign_name,
    campaignId: rawLead.campaign_id,
    lastMessage: rawLead.last_message,
    unreadCount: rawLead.unread_count || 0,
    history,
    referral,
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
   * Obtiene la lista completa de campañas
   * @returns {Promise<Array>}
   */
  async getCampaigns() {
    try {
      const { data, error } = await supabase.from('campaigns').select('*')
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
   * Obtiene todos los leads ordenados cronológicamente
   * @returns {Promise<Array>}
   */
  async getLeads() {
    try {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false })
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
   * Inserta un nuevo lead en Supabase
   * @param {Object} leadPayload 
   * @returns {Promise<{data: any, error: any}>}
   */
  async insertLead(leadPayload) {
    try {
      const { data, error } = await supabase.from('leads').insert([leadPayload])
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
  }
}
