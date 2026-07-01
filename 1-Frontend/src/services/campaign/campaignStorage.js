/**
 * ========================================================
 * SERVICIO DE ALMACENAMIENTO DE CAMPAÑA: campaignStorage
 * QAWAY CAMPAIGN CONSOLE
 * ========================================================
 */

/**
 * Guarda el estado actual de la campaña en la ubicación correspondiente
 * @param {string} appMode Modo de aplicación ('saas', 'local', 'white_label')
 * @param {Object} data Datos completos de la campaña
 */
export function saveCampaignState(appMode, data) {
  console.log(`[campaignStorage] Guardando campaña en modo: ${appMode}`)

  const key = `qaway_campaign_${data?.brief?.marca?.toLowerCase().replace(/[^a-z0-9]/g, '_') || 'active'}`

  if (appMode === 'local' || appMode === 'white_label') {
    // Almacenamiento directo local para PC o instalación autónoma
    localStorage.setItem(key, JSON.stringify({
      ...data,
      savedAt: new Date().toISOString()
    }))
  } else {
    // SaaS centralizado - Almacena localmente y prepara el payload para sincronizar con base de datos remota
    localStorage.setItem(key, JSON.stringify(data))
    
    // Simulación de llamada API a la web Qaway (WooCommerce o API Rest)
    /*
    fetch('/wp-json/qaway-api/v1/campaigns/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ campaign: data })
    }).then(res => res.json())
      .then(sync => console.log('[campaignStorage] Sincronización exitosa con servidor SaaS:', sync))
      .catch(err => console.error('[campaignStorage] Fallo de red guardando en SaaS:', err));
    */
  }
}

/**
 * Carga el estado de campaña guardado
 * @param {string} appMode Modo de aplicación
 * @param {string} [brandName] Nombre de marca para búsqueda
 * @returns {Object|null}
 */
export function loadCampaignState(appMode, brandName = 'active') {
  const key = `qaway_campaign_${brandName.toLowerCase().replace(/[^a-z0-9]/g, '_')}`
  const saved = localStorage.getItem(key)
  if (saved) {
    try {
      return JSON.parse(saved)
    } catch (e) {
      console.error('[campaignStorage] Error parseando datos guardados:', e)
      return null
    }
  }
  return null
}
