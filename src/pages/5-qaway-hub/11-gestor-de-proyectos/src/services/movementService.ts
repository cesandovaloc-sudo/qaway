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

// Mapeo ES -> DB (inverso, sin inventar: sale/exit ambos son Salida al leer)
function mapTipoToDb(tipo: MovimientoTipoES): string {
  if (tipo === 'Entrada') return 'entry'
  if (tipo === 'Salida') return 'exit'
  if (tipo === 'Transferencia') return 'transfer'
  return 'adjustment'
}
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
  // Tendencias reales: últimos 30d vs 30d previos (sin inventar; "—" si no hay base).
  calcMetrics(movs: MovimientoReal[]) {
    const now = Date.now()
    const DAY = 24 * 3600 * 1000
    const age = (iso: string) => {
      if (!iso) return 0 // sin fecha cuenta como reciente, igual que inferior
      const t = new Date(iso).getTime()
      if (Number.isNaN(t)) return 0
      return now - t
    }
    const within30d = (iso: string) => age(iso) <= 30 * DAY
    const withinPrev30d = (iso: string) => age(iso) > 30 * DAY && age(iso) <= 60 * DAY
    const qtySum = (kind: MovimientoTipoES, onlyRecent = false) =>
      movs
        .filter((m) => m.tipo === kind && (!onlyRecent || within30d(m.fecha)))
        .reduce((s, m) => s + (m.cantidad || 0), 0)
    const qtyPrev30 = (kind: MovimientoTipoES) =>
      movs
        .filter((m) => m.tipo === kind && withinPrev30d(m.fecha))
        .reduce((s, m) => s + (m.cantidad || 0), 0)
    const trend = (kind: MovimientoTipoES) => {
      const cur = movs
        .filter((m) => m.tipo === kind && within30d(m.fecha))
        .reduce((s, m) => s + (m.cantidad || 0), 0)
      const prev = qtyPrev30(kind)
      if (!prev) return cur > 0 ? { txt: '↑ nuevo', dir: 'up' as const } : { txt: '—', dir: 'flat' as const }
      const pct = ((cur - prev) / prev) * 100
      const dir = pct >= 0 ? ('up' as const) : ('down' as const)
      const arrow = pct >= 0 ? '↑' : '↓'
      return { txt: `${arrow} ${Math.abs(pct).toFixed(0)}%`, dir }
    }
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
      tEntradas: trend('Entrada'),
      tSalidas: trend('Salida'),
      tTransferencias: trend('Transferencia'),
      tAjustes: trend('Ajuste'),
    }
  },

  // Crea un movimiento real en inventory_movements (lógica del tablero inferior, pero persistente).
  // Resuelve product_id por SKU/nombre dentro del tenant; no inventa productos.
  async createMovement(input: {
    tenant_id?: string
    tipo: MovimientoTipoES
    cantidad: number
    producto?: string
    sku?: string
    referencia?: string
    motivo?: string
    ubicacion?: string
    proveedor?: string
    nota?: string
  }): Promise<MovimientoReal> {
    const qty = Number(input.cantidad) || 0
    if (!input.producto?.trim() || qty <= 0) throw new Error('Completa el producto y una cantidad mayor que cero.')
    // 1) Resolver product_id en el tenant
    let productQuery = supabase.from('products').select('id, sku, name').limit(1)
    if (input.tenant_id) productQuery = productQuery.eq('tenant_id', input.tenant_id)
    if (input.sku?.trim()) productQuery = productQuery.eq('sku', input.sku.trim())
    else productQuery = productQuery.ilike('name', `%${input.producto.trim()}%`)
    const { data: prod, error: prodErr } = await productQuery.maybeSingle()
    if (prodErr) throw prodErr
    if (!prod?.id) throw new Error('Producto no encontrado en esta empresa. Créalo primero en Productos.')
    // 2) Insertar movimiento (from/to null: ubicaciones libres por ahora)
    const notes = [input.motivo, input.ubicacion ? `Ubicación: ${input.ubicacion}` : '', input.proveedor ? `Proveedor: ${input.proveedor}` : '', input.nota || ''].filter(Boolean).join(' | ') || null
    const payload: Record<string, unknown> = {
      product_id: prod.id,
      type: mapTipoToDb(input.tipo),
      quantity: qty,
      reference: input.referencia || null,
      notes,
    }
    const { data, error } = await supabase.from('inventory_movements').insert(payload).select('id, product_id, type, quantity, reference, notes, created_at').single()
    if (error) throw error
    return {
      id: String(data.id),
      tipo: input.tipo,
      cantidad: qty,
      fecha: String(data.created_at ?? new Date().toISOString()),
      producto_id: String(data.product_id ?? prod.id),
      referencia: (data.reference as string) ?? input.referencia ?? null,
      motivo: (data.notes as string) ?? notes,
    }
  },
}
