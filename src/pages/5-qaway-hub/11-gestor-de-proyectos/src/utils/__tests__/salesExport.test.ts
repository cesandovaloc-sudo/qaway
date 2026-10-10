import { describe, it, expect } from 'vitest'
import * as XLSX from 'xlsx'
import {
  SALES_REPORT_COLUMNS,
  buildReportRows,
  buildSalesWorkbook,
  enabledReportColumnKeys,
} from '@/utils/salesExport'
import type { Sale, SaleItem } from '@/types'

const sale = (over: Partial<Sale> = {}): Sale => ({
  id: 's-1',
  sale_number: 'V-000001',
  customer_id: 'c-1',
  customer_name: 'Juan Pérez',
  doc_type: 'DNI',
  doc_number: '12345678',
  fiscal_name: null,
  fiscal_address: 'Av. Principal 123',
  subtotal: 100,
  discount: 10,
  igv_total: 0,
  total: 90,
  currency: 'PEN',
  payment_status: 'pagado',
  status: 'active',
  payment_method: 'efectivo',
  notes: 'Nota de prueba',
  created_by: 'u-1',
  created_at: '2026-08-13T18:00:00.000Z',
  paid_at: null,
  ...over,
})

const item = (over: Partial<SaleItem> = {}): SaleItem => ({
  id: 'i-1',
  sale_id: 's-1',
  product_id: 'p-1',
  product_title: 'Laptop X',
  quantity: 2,
  unit_price: 50,
  subtotal: 100,
  tax_code: '10',
  unit_sunat: 'NIU',
  ...over,
})

const enrichment = {
  customerEmails: { 'c-1': 'juan@correo.pe' },
  userNames: { 'u-1': 'Ana Vendedora' },
  products: { 'p-1': { sku: 'SKU-001', category_id: 'cat-1' } },
  categories: { 'cat-1': 'Computadoras' },
}

describe('SALES_REPORT_COLUMNS', () => {
  it('debe tener claves y etiquetas únicas', () => {
    const keys = SALES_REPORT_COLUMNS.map(col => col.key)
    const labels = SALES_REPORT_COLUMNS.map(col => col.label)
    expect(new Set(keys).size).toBe(keys.length)
    expect(new Set(labels).size).toBe(labels.length)
    keys.forEach(key => expect(key).toBeTruthy())
    labels.forEach(label => expect(label).toBeTruthy())
  })

  it('las columnas deshabilitadas llevan nota interna', () => {
    const disabled = SALES_REPORT_COLUMNS.filter(col => !col.enabled)
    expect(disabled.length).toBeGreaterThan(0)
    disabled.forEach(col => expect(col.note).toBeTruthy())
  })

  it('enabledReportColumnKeys excluye las deshabilitadas', () => {
    const keys = enabledReportColumnKeys()
    expect(keys.length).toBe(SALES_REPORT_COLUMNS.filter(col => col.enabled).length)
    expect(keys).not.toContain('tipo_cambio')
    expect(keys).not.toContain('alias_item')
  })
})

describe('buildReportRows', () => {
  it('genera una fila por item con campos de documento y cliente', () => {
    const rows = buildReportRows([sale()], [item()], enrichment)
    expect(rows).toHaveLength(1)
    const row = rows[0]
    expect(row.numero).toBe('V-000001')
    expect(row.fecha).toBe('13/08/2026')
    expect(row.moneda).toBe('PEN')
    expect(row.igv).toBe(0)
    expect(row.total).toBe(90)
    expect(row.descuento).toBe(10)
    expect(row.estado).toBe('Pagado')
    expect(row.vendedor).toBe('Ana Vendedora')
    expect(row.observaciones).toBe('Nota de prueba')
    expect(row.nombre_cliente).toBe('Juan Pérez')
    expect(row.direccion_cliente).toBe('Av. Principal 123')
    expect(row.ruc_dni_cliente).toBe('DNI 12345678')
    expect(row.email_cliente).toBe('juan@correo.pe')
  })

  it('rellena los campos de item (sku, categoría, total)', () => {
    const rows = buildReportRows([sale()], [item()], enrichment)
    const row = rows[0]
    expect(row.codigo_item).toBe('SKU-001')
    expect(row.descripcion_item).toBe('Laptop X')
    expect(row.categoria_item).toBe('Computadoras')
    expect(row.cantidad).toBe(2)
    expect(row.total_item).toBe(100)
    expect(row.tipo_impuesto).toBe('10')
  })

  it('valor unitario = precio unitario cuando no hay IGV aplicado', () => {
    const rows = buildReportRows([sale()], [item({ unit_price: 50 })], enrichment)
    expect(rows[0].valor_unitario).toBe(50)
    expect(rows[0].precio_unitario).toBe(50)
  })

  it('valor unitario se divide entre (1 + tasa IGV) cuando la venta aplica IGV', () => {
    const withIgv = sale({ igv_total: 36, total: 218 })
    const rows = buildReportRows([withIgv], [item({ unit_price: 118 })], enrichment, 18)
    expect(rows[0].valor_unitario).toBe(100)
    expect(rows[0].precio_unitario).toBe(118)
  })

  it('estado refleja anuladas y deudas', () => {
    const anulada = buildReportRows([sale({ status: 'cancelled' })], [], enrichment)
    expect(anulada[0].estado).toBe('Anulada')
    const deuda = buildReportRows([sale({ payment_status: 'deuda' })], [], enrichment)
    expect(deuda[0].estado).toBe('Deuda')
    const parcial = buildReportRows([sale({ payment_status: 'parcial' })], [], enrichment)
    expect(parcial[0].estado).toBe('Parcial')
  })

  it('sin items genera una sola fila con columnas de item vacías', () => {
    const rows = buildReportRows([sale()], [], enrichment)
    expect(rows).toHaveLength(1)
    expect(rows[0].descripcion_item).toBe('')
    expect(rows[0].cantidad).toBe('')
  })

  it('una venta con varios items genera varias filas con los datos base repetidos', () => {
    const rows = buildReportRows([sale()], [item(), item({ id: 'i-2', product_title: 'Mouse' })], enrichment)
    expect(rows).toHaveLength(2)
    expect(rows[0].numero).toBe(rows[1].numero)
    expect(rows[1].descripcion_item).toBe('Mouse')
  })
})

describe('buildSalesWorkbook', () => {
  const data = {
    rows: buildReportRows([sale()], [item()], enrichment),
    from: '2026-08-13T18:00:00.000Z',
    to: '2026-08-13T18:00:00.000Z',
    company: { name: 'QAWAY LAB S.A.C.', address: 'Av. Empresa 456' },
  }

  it('construye la hoja con encabezado de empresa, título y columnas seleccionadas', () => {
    const wb = buildSalesWorkbook(data, ['numero', 'fecha', 'total'])
    expect(wb.SheetNames).toEqual(['Ventas'])
    const ws = wb.Sheets['Ventas']
    const aoa = XLSX.utils.sheet_to_json<(string | number)[]>(ws, { header: 1 })
    expect(aoa[0][0]).toBe('QAWAY LAB S.A.C.')
    expect(aoa[1][0]).toBe('Av. Empresa 456')
    expect(String(aoa[2][0])).toContain('REPORTE DE VENTAS DEL')
    expect(aoa[4]).toEqual(['NÚMERO', 'FECHA', 'IMPORTE TOTAL DEL COMPROBANTE'])
  })

  it('escribe los datos en la fila siguiente al encabezado', () => {
    const wb = buildSalesWorkbook(data, ['numero', 'total', 'cantidad'])
    const ws = wb.Sheets['Ventas']
    const aoa = XLSX.utils.sheet_to_json<(string | number)[]>(ws, { header: 1 })
    expect(aoa[5][0]).toBe('V-000001')
    expect(aoa[5][1]).toBe(90)
    expect(aoa[5][2]).toBe(2)
  })

  it('omitir claves no seleccionadas', () => {
    const wb = buildSalesWorkbook(data, ['email_cliente'])
    const ws = wb.Sheets['Ventas']
    const aoa = XLSX.utils.sheet_to_json<(string | number)[]>(ws, { header: 1 })
    expect(aoa[4]).toEqual(['EMAIL (CLIENTE)'])
    expect(aoa[5][0]).toBe('juan@correo.pe')
  })
})
