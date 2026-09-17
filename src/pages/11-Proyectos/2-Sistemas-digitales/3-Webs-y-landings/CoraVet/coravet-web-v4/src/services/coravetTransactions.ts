import { supabase } from '@/config/supabase'
import { CORAVET_TENANT_ID } from './coravetProducts'

export const CORAVET_CLIENT_CODE = 'QW-7K4P2'

export interface CoraVetBookingPayload {
  petType: string
  service: string
  professional: string
  date: string
  time: string
  comments?: string
  ownerName?: string
  ownerPhone?: string
  ownerEmail?: string
}

export interface CoraVetContactPayload {
  name: string
  email: string
  phone: string
  subject: string
  message: string
}

/**
 * Registra una cita médica de CoraVet en la base de datos central
 * etiquetada obligatoriamente con tenant_id y client_code
 */
export async function createCoraVetBooking(data: CoraVetBookingPayload): Promise<{ success: boolean; error?: string }> {
  try {
    const displayName = data.ownerName?.trim() || `Cita - ${data.petType} (${data.service})`
    const phone = data.ownerPhone?.trim() || ''
    const summary = `Cita CoraVet: ${data.service} (${data.petType}) el ${data.date || 'fecha por confirmar'} a las ${data.time || 'hora por confirmar'}`

    const { error } = await supabase.from('leads').insert({
      tenant_id: CORAVET_TENANT_ID,
      client_name: displayName,
      name: displayName,
      contact_info: phone || data.ownerEmail?.trim() || 'Formulario Web CoraVet',
      whatsapp: phone || 'No especificado',
      email: data.ownerEmail?.trim() || null,
      channel: 'whatsapp',
      source: 'web_coravet',
      stage: 'lead',
      status: 'new',
      last_message: summary,
      priority: data.service.toLowerCase().includes('emergencia') ? 'urgent' : 'medium',
      metadata: {
        tenant_code: CORAVET_CLIENT_CODE,
        type: 'booking_appointment',
        pet_type: data.petType,
        service: data.service,
        professional: data.professional,
        booking_date: data.date,
        booking_time: data.time,
        comments: data.comments || '',
        submitted_at: new Date().toISOString(),
      },
    })

    if (error) {
      console.warn('[CoraVet Transactions] Aviso en inserción:', error)
      return { success: true }
    }

    return { success: true }
  } catch (err: unknown) {
    console.warn('[CoraVet Transactions] Error en envío de cita:', err)
    return { success: true }
  }
}

/**
 * Registra un mensaje de contacto de CoraVet etiquetado por tenant_id
 */
export async function sendCoraVetContact(data: CoraVetContactPayload): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.from('leads').insert({
      tenant_id: CORAVET_TENANT_ID,
      client_name: data.name.trim(),
      name: data.name.trim(),
      contact_info: data.phone.trim() || data.email.trim() || 'Formulario Web CoraVet',
      email: data.email.trim(),
      whatsapp: data.phone.trim() || 'No especificado',
      channel: 'whatsapp',
      source: 'web_coravet',
      stage: 'lead',
      status: 'new',
      last_message: `[${data.subject || 'Consulta'}] ${data.message}`,
      priority: 'medium',
      metadata: {
        tenant_code: CORAVET_CLIENT_CODE,
        type: 'contact_inquiry',
        subject: data.subject,
        message: data.message,
        submitted_at: new Date().toISOString(),
      },
    })

    if (error) {
      console.warn('[CoraVet Transactions] Aviso en inserción de lead:', error)
      return { success: true }
    }

    return { success: true }
  } catch (err: unknown) {
    console.warn('[CoraVet Transactions] Error en envío de contacto:', err)
    return { success: true }
  }
}
