import { supabase } from '@/config/supabase'

export type MovimientoTipoES = 'Entrada' | 'Salida' | 'Transferencia' | 'Ajuste'

export interface MovimientoReal {
  id: string
  tipo: MovimientoTipoES
  cantidad: number
  fecha: string
  producto_id: string | null
  referencia: string | null
  motivo: string | null
}

// Mapeo DB -> ES (fuente de verdad: 4-MovimientosPanel.jsx)
function mapTipo(dbType: string | null): MovimientoTipoES {
  const t = (dbType || '').toLowerCase()
  if (t === 'entry') return 'Entrada'
  if (t === 'exit' || t === 'sale') return 'Salida'
  if (t === 'transfer') return 'Transferencia'
  return 'Ajuste'
}

// Optimizado: 2 queries máximo (productos del tenant + movimientos).
// Sin N+1, con límite para no saturar el tablero.
export const movementService = {
  async getMovements(opts?: { tenant_id?: string; limit?: number }): Promise<MovimientoReal[]> {
    const limit = opts?.limit ?? 500
    try {
      // 1) Resolver productos del tenant (reutiliza RLS/tenant del adapter vía products)
      let productIds: string[] | null = null
      if (opts?.tenant_id) {
        const { data: prods } = await supabase
          .from('products')
          .select('id')
          .eq('tenant_id', opts.tenant_id)
          .limit(2000)
        if (prods) productIds = prods.map((p: { id: string }) => p.id)
        if (productIds && productIds.length === 0) return []
      }

      // 2) Movimientos (1 sola query, ordenados, con límite)
      let query = supabase
        .from('inventory_movements')
        .select('id, product_id, type, quantity, reference, notes, created_at')
        .order('created_at', { ascending: false })
        .limit(limit)

      if (productIds) query = query.in('product_id', productIds)

      const { data, error } = await query
      if (error) {
        console.warn('[movementService] fallback sin movimientos:', error.message)
        return []
      }
      return (data || []).map((m: Record<string, unknown>) => ({
        id: String(m.id),
        tipo: mapTipo(String(m.type ?? '')),
        cantidad: Number(m.quantity) || 0,
        fecha: String(m.created_at ?? ''),
        producto_id: (m.product_id as string) ?? null,
        referencia: (m.reference as string) ?? null,
        motivo: (m.notes as string) ?? null,
      }))
    } catch (err) {
      console.warn('[movementService] error:', err)
      return []
    }
  },

  // Métricas FASE 2: mismas reglas que el tablero inferior (sumas por tipo).
  // Entradas/Salidas filtradas a últimos 30 días; Transferencias/Ajustes totales.
  calcMetrics(movs: MovimientoReal[]) {
    const now = Date.now()
    const within30d = (iso: string) => {
      if (!iso) return true // sin fecha (mock) cuenta como reciente, igual que inferior
      const t = new Date(iso).getTime()
      if (Number.isNaN(t)) return true
      return now - t <= 30 * 24 * 3600 * 1000
    }
    const qtySum = (kind: MovimientoTipoES, onlyRecent = false) =>
      movs
        .filter((m) => m.tipo === kind && (!onlyRecent || within30d(m.fecha)))
        .reduce((s, m) => s + (m.cantidad || 0), 0)
    const count = (kind: MovimientoTipoES, onlyRecent = false) =>
      movs.filter((m) => m.tipo === kind && (!onlyRecent || within30d(m.fecha))).length
    const entradas = qtySum('Entrada', true)
    const salidas = qtySum('Salida', true)
    return {
      entradas,
      salidas,
      transferencias: qtySum('Transferencia'),
      ajustes: qtySum('Ajuste'),
      cEntradas: count('Entrada', true),
      cSalidas: count('Salida', true),
      cTransferencias: count('Transferencia'),
      cAjustes: count('Ajuste'),
      totalMovido: entradas - salidas,
    }
  },
}
