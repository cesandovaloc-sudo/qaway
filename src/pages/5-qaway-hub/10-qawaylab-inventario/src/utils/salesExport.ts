// ─────────────────────────────────────────────────────────────
// Exportación del reporte de ventas a Excel (SheetJS).
//
// ⚠️ OBSERVACIÓN INTERNA (CIERRE DEL PROYECTO):
// - Las etiquetas de columnas replican el formato de un reporte de
//   referencia para poder validar contra él. Antes de la entrega final
//   hay que VARIAR LIGERAMENTE los enunciados y NO dejar ningún rastro
//   de ese sistema de referencia en el producto.
// - Las columnas con `enabled: false` no existen en nuestra base.
//   TODO VALIDAR: si al final no resultan relevantes, ELIMINARLAS.
// - OBSERVACIONES y NOTAS se unifican en sales.notes (evita duplicar).
// ─────────────────────────────────────────────────────────────
import * as XLSX from 'xlsx'
import { supabase } from '@/config/supabase'
import type { Sale, SaleItem } from '@/types'
import { round2 } from '@/utils/sales'

export interface SalesReportColumn {
  key: string
  label: string
  group: 'Documento' | 'Cliente' | 'Item'
  enabled: boolean
  /** Nota interna para el cierre de validación */
  note?: string
}

export type SalesReportRow = Record<string, string | number>

export interface SalesReportData {
  rows: SalesReportRow[]
  from: string | null
  to: string | null
  company: { name: string; address: string }
}

export interface SalesReportFilters {
  /** Fecha inicial (YYYY-MM-DD) */
  desde?: string
  /** Fecha final (YYYY-MM-DD) */
  hasta?: string
}

export const SALES_REPORT_COLUMNS: SalesReportColumn[] = [
  // ── Documento ──
  { key: 'numero', label: 'NÚMERO', group: 'Documento', enabled: true },
  { key: 'fecha', label: 'FECHA', group: 'Documento', enabled: true },
  { key: 'moneda', label: 'MONEDA', group: 'Documento', enabled: true },
  { key: 'igv', label: 'IGV', group: 'Documento', enabled: true },
  { key: 'total', label: 'IMPORTE TOTAL DEL COMPROBANTE', group: 'Documento', enabled: true },
  { key: 'descuento', label: 'DESCUENTO GLOBAL CON IGV', group: 'Documento', enabled: true },
  { key: 'estado', label: 'ESTADO', group: 'Documento', enabled: true },
  { key: 'vendedor', label: 'VENDEDOR', group: 'Documento', enabled: true },
  {
    key: 'observaciones',
    label: 'OBSERVACIONES / NOTAS',
    group: 'Documento',
    enabled: true,
    note: 'Unifica OBSERVACIONES y NOTAS en sales.notes',
  },
  {
    key: 'documentos',
    label: 'DOCUMENTOS',
    group: 'Documento',
    enabled: false,
    note: 'Comprobante (boleta/factura). Disponible al emitir comprobantes.',
  },

  // ── Cliente ──
  { key: 'nombre_cliente', label: 'NOMBRE (CLIENTE)', group: 'Cliente', enabled: true },
  { key: 'direccion_cliente', label: 'DIRECCIÓN (CLIENTE)', group: 'Cliente', enabled: true },
  { key: 'ruc_dni_cliente', label: 'RUC/DNI (CLIENTE)', group: 'Cliente', enabled: true },
  { key: 'email_cliente', label: 'EMAIL (CLIENTE)', group: 'Cliente', enabled: true },

  // ── Item ──
  { key: 'codigo_item', label: 'CÓDIGO (ITEM)', group: 'Item', enabled: true },
  { key: 'descripcion_item', label: 'DESCRIPCIÓN (ITEM)', group: 'Item', enabled: true },
  { key: 'categoria_item', label: 'CATEGORÍA (ITEM)', group: 'Item', enabled: true },
  { key: 'valor_unitario', label: 'VALOR UNITARIO (ITEM)', group: 'Item', enabled: true },
  { key: 'precio_unitario', label: 'PRECIO UNITARIO (ITEM)', group: 'Item', enabled: true },
  { key: 'cantidad', label: 'CANTIDAD (ITEM)', group: 'Item', enabled: true },
  { key: 'total_item', label: 'TOTAL (ITEM)', group: 'Item', enabled: true },
  { key: 'tipo_impuesto', label: 'TIPO DE IMPUESTO (ITEM)', group: 'Item', enabled: true },

  // Columnas que no existen en la base actual ── TODO VALIDAR: si no resultan relevantes, ELIMINAR.
  { key: 'tipo_cambio', label: 'TIPO DE CAMBIO', group: 'Item', enabled: false, note: 'No existe campo en la base.' },
  { key: 'recargo_consumo', label: 'RECARGO AL CONSUMO', group: 'Item', enabled: false, note: 'No existe campo en la base.' },
  { key: 'orden_compra', label: 'ORDEN DE COMPRA', group: 'Item', enabled: false, note: 'No existe campo en la base.' },
  { key: 'guia_remision', label: 'GUÍA DE REMISIÓN', group: 'Item', enabled: false, note: 'No existe campo en la base.' },
  { key: 'alias_item', label: 'ALIAS (ITEM)', group: 'Item', enabled: false, note: 'No existe campo en la base.' },
]

export function enabledReportColumnKeys(columns: SalesReportColumn[] = SALES_REPORT_COLUMNS): string[] {
  return columns.filter(col => col.enabled).map(col => col.key)
}

function formatDateEs(iso: string): string {
  const d = new Date(iso)
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  return `${day}/${month}/${d.getFullYear()}`
}

function formatTitleDate(iso: string): string {
  return new Date(iso)
    .toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric' })
    .toUpperCase()
}

function saleEstado(sale: Sale): string {
  if (sale.status === 'cancelled') return 'Anulada'
  if (sale.payment_status === 'pagado') return 'Pagado'
  if (sale.payment_status === 'parcial') return 'Parcial'
  return 'Deuda'
}

function valorUnitario(item: SaleItem, sale: Sale, igvRate: number): number {
  // VALOR UNITARIO se deriva. Mientras no se aplique IGV (igv_total = 0),
  // el precio ingresado es el valor final y coincide con el precio unitario.
  // Con IGV activo (FASE 3) el precio unitario incluye IGV → se divide.
  const hasIgv = (sale.igv_total ?? 0) > 0
  return hasIgv ? round2((item.unit_price ?? 0) / (1 + igvRate / 100)) : round2(item.unit_price ?? 0)
}

export interface SalesReportEnrichment {
  customerEmails: Record<string, string>
  userNames: Record<string, string>
  products: Record<string, { sku: string | null; category_id: string | null }>
  categories: Record<string, string>
}

export function buildReportRows(
  sales: Sale[],
  items: SaleItem[],
  enrichment: SalesReportEnrichment,
  igvRate = 18,
): SalesReportRow[] {
  const itemsBySale = new Map<string, SaleItem[]>()
  for (const saleItem of items) {
    const group = itemsBySale.get(saleItem.sale_id) ?? []
    group.push(saleItem)
    itemsBySale.set(saleItem.sale_id, group)
  }

  const rows: SalesReportRow[] = []
  for (const sale of sales) {
    const base: SalesReportRow = {
      numero: sale.sale_number,
      fecha: formatDateEs(sale.created_at),
      moneda: sale.currency || 'PEN',
      igv: sale.igv_total ?? 0,
      total: sale.total ?? 0,
      descuento: sale.discount ?? 0,
      estado: saleEstado(sale),
      vendedor: enrichment.userNames[sale.created_by ?? ''] ?? '',
      observaciones: sale.notes ?? '',
      documentos: '',
      nombre_cliente: sale.customer_name || sale.fiscal_name || 'Cliente ocasional',
      direccion_cliente: sale.fiscal_address ?? '',
      ruc_dni_cliente: [sale.doc_type, sale.doc_number].filter(Boolean).join(' ') || '',
      email_cliente: enrichment.customerEmails[sale.customer_id ?? ''] ?? '',
    }

    const saleItems = itemsBySale.get(sale.id) ?? []
    if (saleItems.length === 0) {
      rows.push({
        ...base,
        codigo_item: '',
        descripcion_item: '',
        categoria_item: '',
        valor_unitario: '',
        precio_unitario: '',
        cantidad: '',
        total_item: '',
        tipo_impuesto: '',
      })
      continue
    }

    for (const saleItem of saleItems) {
      const product = enrichment.products[saleItem.product_id ?? ''] ?? null
      const category = product?.category_id ? enrichment.categories[product.category_id] ?? '' : ''
      rows.push({
        ...base,
        codigo_item: product?.sku ?? '',
        descripcion_item: saleItem.product_title,
        categoria_item: category,
        valor_unitario: valorUnitario(saleItem, sale, igvRate),
        precio_unitario: saleItem.unit_price ?? 0,
        cantidad: saleItem.quantity ?? 0,
        total_item: saleItem.subtotal ?? round2((saleItem.quantity ?? 0) * (saleItem.unit_price ?? 0)),
        tipo_impuesto: saleItem.tax_code ?? '',
      })
    }
  }
  return rows
}

export function buildSalesWorkbook(data: SalesReportData, selectedKeys: string[]): XLSX.WorkBook {
  const selected = SALES_REPORT_COLUMNS.filter(col => selectedKeys.includes(col.key))
  const headerRow = selected.map(col => col.label)

  const title =
    data.from && data.to
      ? `REPORTE DE VENTAS DEL ${formatTitleDate(data.from)} AL ${formatTitleDate(data.to)}`
      : 'REPORTE DE VENTAS'

  const aoa: (string | number)[][] = []
  aoa.push([data.company.name || 'REPORTE DE VENTAS'])
  aoa.push([data.company.address || ''])
  aoa.push([title])
  aoa.push([])
  aoa.push(headerRow)
  for (const row of data.rows) {
    aoa.push(selected.map(col => row[col.key] ?? ''))
  }

  const ws = XLSX.utils.aoa_to_sheet(aoa)
  ws['!cols'] = selected.map(col => ({ wch: Math.max(10, Math.min(40, col.label.length + 4)) }))
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Ventas')
  return wb
}

async function safeSelectAll<T extends { id: string }>(table: string, ids: string[], column: string): Promise<T[]> {
  if (ids.length === 0) return []
  const { data, error } = await supabase.from(table).select('*').in(column, ids)
  if (error) return []
  return (data ?? []) as T[]
}

export async function fetchSalesReportData(filters: SalesReportFilters = {}): Promise<SalesReportData> {
  let query = supabase.from('sales').select('*').order('created_at', { ascending: true })
  if (filters.desde) query = query.gte('created_at', `${filters.desde}T00:00:00`)
  if (filters.hasta) query = query.lte('created_at', `${filters.hasta}T23:59:59.999`)
  const { data: sales, error } = await query
  if (error) throw error
  const list = (sales ?? []) as Sale[]

  if (list.length === 0) {
    return { rows: [], from: null, to: null, company: { name: '', address: '' } }
  }

  const saleIds = list.map(s => s.id)
  const { data: rawItems, error: itemsError } = await supabase.from('sale_items').select('*').in('sale_id', saleIds)
  if (itemsError) throw itemsError
  const items = (rawItems ?? []) as SaleItem[]

  const customerIds = [...new Set(list.map(s => s.customer_id).filter((v): v is string => Boolean(v)))]
  const customers = await safeSelectAll<{ id: string; email: string | null }>('customers', customerIds, 'id')
  const customerEmails: Record<string, string> = {}
  for (const c of customers) customerEmails[c.id] = c.email ?? ''

  const userIds = [...new Set(list.map(s => s.created_by).filter((v): v is string => Boolean(v)))]
  const users = await safeSelectAll<{ id: string; full_name: string | null }>('users', userIds, 'id')
  const userNames: Record<string, string> = {}
  for (const u of users) userNames[u.id] = u.full_name ?? ''

  const productIds = [...new Set(items.map(i => i.product_id).filter((v): v is string => Boolean(v)))]
  const productsRaw = await safeSelectAll<{ id: string; sku: string | null; category_id: string | null }>(
    'products',
    productIds,
    'id',
  )
  const products: Record<string, { sku: string | null; category_id: string | null }> = {}
  for (const p of productsRaw) products[p.id] = { sku: p.sku, category_id: p.category_id }

  const categoryIds = [...new Set(productsRaw.map(p => p.category_id).filter((v): v is string => Boolean(v)))]
  const categoriesRaw = await safeSelectAll<{ id: string; name: string | null }>('categories', categoryIds, 'id')
  const categories: Record<string, string> = {}
  for (const c of categoriesRaw) categories[c.id] = c.name ?? ''

  let igvRate = 18
  let companyName = ''
  let companyAddress = ''
  const { data: settings, error: settingsError } = await supabase
    .from('business_settings')
    .select('razon_social, nombre_comercial, direccion, igv_rate')
    .limit(1)
  if (!settingsError && settings && settings[0]) {
    const s = settings[0] as { razon_social?: string | null; nombre_comercial?: string | null; direccion?: string | null; igv_rate?: number | string | null }
    igvRate = Number(s.igv_rate ?? 18) || 18
    companyName = s.razon_social || s.nombre_comercial || ''
    companyAddress = s.direccion || ''
  }

  const rows = buildReportRows(list, items, { customerEmails, userNames, products, categories }, igvRate)
  return {
    rows,
    from: list[0].created_at,
    to: list[list.length - 1].created_at,
    company: { name: companyName, address: companyAddress },
  }
}

export async function exportSalesReport(
  selectedKeys: string[],
  filters: SalesReportFilters = {},
): Promise<string> {
  const data = await fetchSalesReportData(filters)
  const wb = buildSalesWorkbook(data, selectedKeys)
  const filename = `ReporteVentas_${new Date().toISOString().slice(0, 10)}.xlsx`
  XLSX.writeFile(wb, filename)
  return filename
}
