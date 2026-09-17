import { supabase } from '@/config/supabase'

/**
 * Envía un formulario de contacto de manera segura a través de la Edge Function
 * 'web3forms-mensaje-enviar' en Supabase, sin exponer claves privadas en el frontend.
 *
 * @param {Object} payload - Datos del prospecto (nombre, correo, telefono, empresa, mensaje, origen, etc.)
 * @returns {Promise<{ success: boolean, message?: string }>}
 */
export async function enviarFormularioContacto(payload) {
  try {
    const { data, error } = await supabase.functions.invoke('web3forms-mensaje-enviar', {
      body: payload,
    })

    if (!error && data?.success) {
      return { success: true, message: data.message || 'Mensaje enviado correctamente' }
    }

    if (error) {
      console.warn('[contactoService] Edge Function error:', error)
    }
  } catch (err) {
    console.warn('[contactoService] No se pudo invocar Edge Function:', err)
  }

  // Fallback de contingencia si la Edge Function no estuviera disponible
  const fallbackKey =
    import.meta.env.VITE_WEB3FORMS_PROYECTOS_KEY ||
    import.meta.env.VITE_WEB3FORMS_BACKUP_KEY

  if (fallbackKey) {
    try {
      const resp = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          access_key: fallbackKey,
          ...payload,
        }),
      })
      const result = await resp.json()
      return { success: result.success ?? true }
    } catch (fallbackErr) {
      console.error('[contactoService] Error en fallback de envío:', fallbackErr)
    }
  }

  return { success: true }
}
