import { supabase } from '@/config/supabase'
import type { UgelMonitoringV2Row, DirectionCode, TerritoryStatus } from './types'

export interface TerritoryUgelDbRecord {
  id: string
  region: string
  number: number
  name: string
  milestone_code: string
  phase1_files: number
  phase1_total: number
  phase1_date: string
  phase2_files: number
  phase2_total: number
  phase2_date: string
  drive_status: TerritoryStatus
  drive_files: number
  drive_total: number
  drive_date: string
  directions: Record<string, TerritoryStatus>
  observation: string
  gestor_name: string
  gestor_phone: string
  created_at?: string
  updated_at?: string
}

function mapDbToUgelRow(r: TerritoryUgelDbRecord): UgelMonitoringV2Row {
  return {
    id: r.id,
    number: r.number,
    name: r.name,
    phase1Files: r.phase1_files,
    phase1Total: r.phase1_total,
    phase1Date: r.phase1_date,
    phase2Files: r.phase2_files,
    phase2Total: r.phase2_total,
    phase2Date: r.phase2_date,
    driveStatus: r.drive_status,
    driveFiles: r.drive_files,
    driveTotal: r.drive_total,
    driveDate: r.drive_date,
    directions: (r.directions || {}) as Record<DirectionCode, TerritoryStatus>,
    observation: r.observation || '',
    gestorName: r.gestor_name || 'Carlos Sandoval',
    gestorPhone: r.gestor_phone || '+51964112233',
  }
}

function mapUgelRowToDb(u: UgelMonitoringV2Row): Partial<TerritoryUgelDbRecord> {
  return {
    id: u.id,
    number: u.number,
    name: u.name,
    phase1_files: u.phase1Files,
    phase1_total: u.phase1Total,
    phase1_date: u.phase1Date,
    phase2_files: u.phase2Files,
    phase2_total: u.phase2Total,
    phase2_date: u.phase2Date,
    drive_status: u.driveStatus,
    drive_files: u.driveFiles,
    drive_total: u.driveTotal,
    drive_date: u.driveDate,
    directions: u.directions,
    observation: u.observation,
    gestor_name: u.gestorName,
    gestor_phone: u.gestorPhone,
    updated_at: new Date().toISOString(),
  }
}

export const territoryMonitoringService = {
  /**
   * Cargar todas las UGELs de la Región Junín desde Supabase
   */
  async fetchJuninUgels(): Promise<UgelMonitoringV2Row[]> {
    const { data, error } = await supabase
      .from('territory_ugel_monitoring')
      .select('*')
      .eq('region', 'Junín')
      .order('number', { ascending: true })

    if (error) {
      console.error('[TerritoryService] Error fetching from Supabase:', error)
      throw error
    }

    if (!data || data.length === 0) {
      return []
    }

    return (data as unknown as TerritoryUgelDbRecord[]).map(mapDbToUgelRow)
  },

  /**
   * Actualizar una UGEL en Supabase (Resiliente y persistente en la nube)
   */
  async updateUgel(row: UgelMonitoringV2Row): Promise<void> {
    const dbPayload = mapUgelRowToDb(row)
    const { error } = await supabase
      .from('territory_ugel_monitoring')
      .update(dbPayload)
      .eq('id', row.id)

    if (error) {
      console.error(`[TerritoryService] Error updating UGEL ${row.name} in Supabase:`, error)
      throw error
    }
  },

  /**
   * Actualizar campo específico de una UGEL en Supabase
   */
  async updateUgelFields(id: string, fields: Partial<TerritoryUgelDbRecord>): Promise<void> {
    const { error } = await supabase
      .from('territory_ugel_monitoring')
      .update({
        ...fields,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)

    if (error) {
      console.error(`[TerritoryService] Error updating fields for ${id} in Supabase:`, error)
      throw error
    }
  },
}
