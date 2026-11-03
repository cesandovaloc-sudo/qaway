import { supabase, supabaseConfigured } from '../../../config/supabase'
import type { EntidadReportData } from './intervencionData'
import { getDefaultReportData } from './intervencionData'

const STORAGE_KEY = 'qaway_reporte_intervencion_excel_v13'

function sanitizePreambulos(parsedPreambulos: any, defPreambulos: any) {
  if (!parsedPreambulos) return defPreambulos
  return {
    ...defPreambulos,
    ...parsedPreambulos,
    planes:
      parsedPreambulos.planes && parsedPreambulos.planes.includes('Se abordaron las disposiciones relacionadas con la elaboración')
        ? parsedPreambulos.planes
        : defPreambulos.planes,
    cuadro03: {
      ...defPreambulos.cuadro03,
      ...(parsedPreambulos.cuadro03 || {}),
      consolidado:
        parsedPreambulos.cuadro03?.consolidado && parsedPreambulos.cuadro03.consolidado.includes('En el periodo reportado')
          ? parsedPreambulos.cuadro03.consolidado
          : defPreambulos.cuadro03.consolidado,
    },
  }
}

export interface SyncStatus {
  state: 'idle' | 'saving' | 'synced' | 'error'
  lastSyncTime: string | null
  message: string
}

export const intervencionSyncService = {
  /**
   * Guarda los datos de una entidad tanto en localStorage como en Supabase
   */
  async saveEntidadData(
    entidadId: string,
    entidadName: string,
    region: string,
    data: EntidadReportData,
    numberIndex: number = 1
  ): Promise<boolean> {
    // 1. Guardar siempre de forma reactiva e inmediata en localStorage
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      const fullStore = saved ? JSON.parse(saved) : {}
      fullStore[entidadId] = data
      localStorage.setItem(STORAGE_KEY, JSON.stringify(fullStore))
    } catch (e) {
      console.warn('[SyncService] Error al guardar en localStorage:', e)
    }

    // 2. Si Supabase no está configurado, terminamos aquí
    if (!supabaseConfigured) {
      return true
    }

    // 3. Persistir en la tabla territory_ugel_monitoring de Supabase
    try {
      const dbId = `${entidadId}_P03`
      const payload = {
        id: dbId,
        region: region,
        number: numberIndex,
        name: `${entidadName} (P03)`,
        milestone_code: 'AT_PRODUCTO_03',
        observation: JSON.stringify(data),
        updated_at: new Date().toISOString(),
      }

      const { error } = await supabase
        .from('territory_ugel_monitoring')
        .upsert(payload, { onConflict: 'id' })

      if (error) {
        console.error('[SyncService] Error al guardar en Supabase:', error)
        return false
      }

      return true
    } catch (err) {
      console.error('[SyncService] Excepción al sincronizar con Supabase:', err)
      return false
    }
  },

  /**
   * Intenta recuperar los datos de Supabase para una entidad; si no existen, recurre a localStorage
   */
  async loadEntidadData(entidadId: string): Promise<EntidadReportData | null> {
    // Primero probar Supabase
    if (supabaseConfigured) {
      try {
        const dbId = `${entidadId}_P03`
        const { data, error } = await supabase
          .from('territory_ugel_monitoring')
          .select('observation')
          .eq('id', dbId)
          .maybeSingle()

        if (!error && data?.observation) {
          try {
            const parsed = JSON.parse(data.observation)
            if (parsed && typeof parsed === 'object') {
              const def = getDefaultReportData(entidadId)
              // Validar si la data de Supabase viene con esquema obsoleto (ej. conteo de escuelas o planes con CDL)
              const hasStaleCDL = parsed.nivelesCDL && (parsed.nivelesCDL[0]?.totalIIEE !== undefined || !parsed.nivelesCDL[0]?.codigoDireccion || parsed.nivelesCDL.length !== def.nivelesCDL.length)
              const hasStalePlanes = parsed.planes && (parsed.planes.length > 1 || parsed.planes.some((p: any) => p.documentoAprobacion?.includes('0842') || p.planNombre?.includes('Cuadro de Distribución') || p.planNombre?.includes('Hito 1.6') || p.planNombre?.includes('Rutas') || p.planNombre?.includes('Cronograma') || p.planNombre?.includes('Protocolo')))
              const isDRE = entidadId.startsWith('dre-')
              const hasStaleHitos = isDRE && parsed.hitos && parsed.hitos.length > 1

              const rawCDL = (!hasStaleCDL && parsed.nivelesCDL && parsed.nivelesCDL.length > 0) ? parsed.nivelesCDL : def.nivelesCDL
              const cleanCDL = rawCDL.map((n: any) => ({
                ...n,
                fechaEntrega: n.fechaEntrega ? n.fechaEntrega.split(' ')[0] : '22/10/2026',
              }))

              const sanitized: EntidadReportData = {
                ...def,
                ...parsed,
                resumen: { ...def.resumen, ...(parsed.resumen || {}) },
                registroCuadro03: (parsed.registroCuadro03 && parsed.registroCuadro03.length > 0) ? parsed.registroCuadro03 : def.registroCuadro03,
                hitos: (!hasStaleHitos && parsed.hitos && parsed.hitos.length > 0) ? parsed.hitos : def.hitos,
                nivelesCDL: cleanCDL,
                planes: (!hasStalePlanes && parsed.planes && parsed.planes.length > 0) ? parsed.planes : def.planes,
                comunicacionDirectores: (parsed.comunicacionDirectores && parsed.comunicacionDirectores.length > 0) ? parsed.comunicacionDirectores : def.comunicacionDirectores,
                participantes: (parsed.participantes && parsed.participantes.length > 0) ? parsed.participantes : def.participantes,
                evidencias: (parsed.evidencias && parsed.evidencias.length > 0) ? parsed.evidencias : def.evidencias,
                preambulos: sanitizePreambulos(parsed.preambulos, def.preambulos),
              }

              // Actualizar también localStorage para tener réplica fresca
              const saved = localStorage.getItem(STORAGE_KEY)
              const fullStore = saved ? JSON.parse(saved) : {}
              fullStore[entidadId] = sanitized
              localStorage.setItem(STORAGE_KEY, JSON.stringify(fullStore))
              return sanitized
            }
          } catch {
            // ignore JSON parse error
          }
        }
      } catch (err) {
        console.warn('[SyncService] No se pudo leer de Supabase, usando localStorage:', err)
      }
    }

    // Fallback: localStorage
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const fullStore = JSON.parse(saved)
        if (fullStore[entidadId]) {
          const def = getDefaultReportData(entidadId)
          const parsed = fullStore[entidadId]
          const hasStaleCDL = parsed.nivelesCDL && (parsed.nivelesCDL[0]?.totalIIEE !== undefined || !parsed.nivelesCDL[0]?.codigoDireccion || parsed.nivelesCDL.length !== def.nivelesCDL.length)
          const hasStalePlanes = parsed.planes && parsed.planes.some((p: any) => p.planNombre?.includes('Cuadro de Distribución') || p.planNombre?.includes('Hito 1.6'))
          const isDRE = entidadId.startsWith('dre-')
          const hasStaleHitos = isDRE && parsed.hitos && parsed.hitos.length > 1

          const rawCDL = (!hasStaleCDL && parsed.nivelesCDL && parsed.nivelesCDL.length > 0) ? parsed.nivelesCDL : def.nivelesCDL
          const cleanCDL = rawCDL.map((n: any) => ({
            ...n,
            fechaEntrega: n.fechaEntrega ? n.fechaEntrega.split(' ')[0] : '22/10/2026',
          }))

          return {
            ...def,
            ...parsed,
            resumen: { ...def.resumen, ...(parsed.resumen || {}) },
            registroCuadro03: (parsed.registroCuadro03 && parsed.registroCuadro03.length > 0) ? parsed.registroCuadro03 : def.registroCuadro03,
            hitos: (!hasStaleHitos && parsed.hitos && parsed.hitos.length > 0) ? parsed.hitos : def.hitos,
            nivelesCDL: cleanCDL,
            planes: (!hasStalePlanes && parsed.planes && parsed.planes.length > 0) ? parsed.planes : def.planes,
            comunicacionDirectores: (parsed.comunicacionDirectores && parsed.comunicacionDirectores.length > 0) ? parsed.comunicacionDirectores : def.comunicacionDirectores,
            participantes: (parsed.participantes && parsed.participantes.length > 0) ? parsed.participantes : def.participantes,
            evidencias: (parsed.evidencias && parsed.evidencias.length > 0) ? parsed.evidencias : def.evidencias,
            preambulos: sanitizePreambulos(parsed.preambulos, def.preambulos),
          }
        }
      }
    } catch (e) {
      console.warn('[SyncService] Error leyendo localStorage:', e)
    }

    return null
  },

  /**
   * Cargar todas las entidades guardadas en Supabase
   */
  async loadAllRemoteData(): Promise<Record<string, EntidadReportData>> {
    const result: Record<string, EntidadReportData> = {}

    if (supabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('territory_ugel_monitoring')
          .select('id, observation')
          .eq('milestone_code', 'AT_PRODUCTO_03')

        if (!error && data && data.length > 0) {
          for (const item of data) {
            if (item.id.endsWith('_P03') && item.observation) {
              const baseId = item.id.replace('_P03', '')
              try {
                const parsed = JSON.parse(item.observation)
                if (parsed && typeof parsed === 'object') {
                  const def = getDefaultReportData(baseId)
                  const hasStaleCDL = parsed.nivelesCDL && (parsed.nivelesCDL[0]?.totalIIEE !== undefined || !parsed.nivelesCDL[0]?.codigoDireccion || parsed.nivelesCDL.length !== def.nivelesCDL.length)
                  const hasStalePlanes = parsed.planes && (parsed.planes.length > 1 || parsed.planes.some((p: any) => p.documentoAprobacion?.includes('0842') || p.planNombre?.includes('Cuadro de Distribución') || p.planNombre?.includes('Hito 1.6') || p.planNombre?.includes('Rutas') || p.planNombre?.includes('Cronograma') || p.planNombre?.includes('Protocolo')))
                  const isDRE = baseId.startsWith('dre-')
                  const hasStaleHitos = isDRE && parsed.hitos && parsed.hitos.length > 1

                  result[baseId] = {
                    ...def,
                    ...parsed,
                    resumen: { ...def.resumen, ...(parsed.resumen || {}) },
                    registroCuadro03: (parsed.registroCuadro03 && parsed.registroCuadro03.length > 0) ? parsed.registroCuadro03 : def.registroCuadro03,
                    hitos: (!hasStaleHitos && parsed.hitos && parsed.hitos.length > 0) ? parsed.hitos : def.hitos,
                    nivelesCDL: (!hasStaleCDL && parsed.nivelesCDL && parsed.nivelesCDL.length > 0) ? parsed.nivelesCDL : def.nivelesCDL,
                    planes: (!hasStalePlanes && parsed.planes && parsed.planes.length > 0) ? parsed.planes : def.planes,
                    comunicacionDirectores: (parsed.comunicacionDirectores && parsed.comunicacionDirectores.length > 0) ? parsed.comunicacionDirectores : def.comunicacionDirectores,
                    participantes: (parsed.participantes && parsed.participantes.length > 0) ? parsed.participantes : def.participantes,
                    evidencias: (parsed.evidencias && parsed.evidencias.length > 0) ? parsed.evidencias : def.evidencias,
                    preambulos: sanitizePreambulos(parsed.preambulos, def.preambulos),
                  }
                }
              } catch {
                // ignore
              }
            }
          }
        }
      } catch (err) {
        console.warn('[SyncService] Error recuperando lotes remotos:', err)
      }
    }

    // Mezclar con localStorage para no perder nada
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const localStore = JSON.parse(saved)
        return { ...result, ...localStore }
      }
    } catch {
      // ignore
    }

    return result
  },
}
