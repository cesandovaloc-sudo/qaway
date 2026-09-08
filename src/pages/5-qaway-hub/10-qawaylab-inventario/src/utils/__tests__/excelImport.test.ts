import { describe, it, expect } from 'vitest'
import * as XLSX from 'xlsx'
import { parseProductExcel, parseNumber } from '../excelImport'

/** Construye un .xlsx real en memoria a partir de filas (primera = encabezados). */
function makeWorkbookFile(rows: (string | number)[][]): File {
  const sheet = XLSX.utils.aoa_to_sheet(rows)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, sheet, 'Productos')
  const buffer = XLSX.write(wb, { type: 'array', bookType: 'xlsx' }) as ArrayBuffer
  return new File([buffer], 'productos.xlsx', {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
}

describe('parseProductExcel (utils/excelImport)', () => {
  it('mapea encabezados con sinónimos y acentos a los campos del producto', async () => {
    const file = makeWorkbookFile([
      ['Nombre del Producto', 'SKU', 'Precio Base', 'Stock', 'Categoría', 'Marca', 'Descripción', 'Estado', 'Condición'],
      ['Zapatillas Running Pro', 'ZAP-001', 249.9, 12, 'Calzado', 'Nike', 'Zapatillas ligeras', 'Activo', 9],
    ])

    const result = await parseProductExcel(file)

    expect(result.errors).toEqual([])
    expect(result.products).toHaveLength(1)
    expect(result.products[0]).toEqual({
      name: 'Zapatillas Running Pro',
      sku: 'ZAP-001',
      description: 'Zapatillas ligeras',
      brand: 'Nike',
      base_price: 249.9,
      stock: 12,
      category: 'Calzado',
      status: 'active',
      condition: 9,
    })
  })

  it('interpreta precios con coma decimal y símbolo de moneda', async () => {
    const file = makeWorkbookFile([
      ['Nombre', 'Precio'],
      ['Medias Deportivas', 'S/ 249,90'],
      ['Polo Algodón', '$ 19.99'],
    ])

    const result = await parseProductExcel(file)

    expect(result.products[0].base_price).toBe(249.9)
    expect(result.products[1].base_price).toBe(19.99)
  })

  it('mapea estados en español e inglés', async () => {
    const file = makeWorkbookFile([
      ['Nombre', 'Estado'],
      ['A', 'Activo'],
      ['B', 'Borrador'],
      ['C', 'Archivado'],
      ['D', 'inactive'],
    ])

    const result = await parseProductExcel(file)

    expect(result.products.map((p) => p.status)).toEqual(['active', 'inactive', 'archived', 'inactive'])
  })

  it('acota la condición al rango 1-10', async () => {
    const file = makeWorkbookFile([
      ['Nombre', 'Condición'],
      ['A', 15],
      ['B', 0],
    ])

    const result = await parseProductExcel(file)

    expect(result.products[0].condition).toBe(10)
    expect(result.products[1].condition).toBe(1)
  })

  it('reporta filas sin nombre como errores con su número de fila', async () => {
    const file = makeWorkbookFile([
      ['Nombre', 'Precio'],
      ['Producto válido', 10],
      ['', 20],
      ['Otro válido', 30],
    ])

    const result = await parseProductExcel(file)

    expect(result.products).toHaveLength(2)
    expect(result.errors).toEqual(['Fila 3: falta el nombre del producto'])
  })

  it('un archivo de una sola columna (nombres) mapea la primera celda como nombre', async () => {
    const file = makeWorkbookFile([
      ['Producto'],
      ['Zapatillas Running Pro'],
      ['Medias Deportivas'],
    ])

    const result = await parseProductExcel(file)

    expect(result.errors).toEqual([])
    expect(result.products.map((p) => p.name)).toEqual(['Zapatillas Running Pro', 'Medias Deportivas'])
    expect(result.products[0].base_price).toBeUndefined()
  })

  it('archivo solo con encabezados devuelve lista vacía y error informativo', async () => {
    const file = makeWorkbookFile([['Nombre', 'Precio']])

    const result = await parseProductExcel(file)

    expect(result.products).toEqual([])
    expect(result.errors[0]).toContain('no tiene filas')
  })

  it('sanitiza celdas con "=" inicial (defensa contra fórmulas/DDE)', async () => {
    const file = makeWorkbookFile([
      ['Nombre', 'SKU', 'Descripción'],
      ['=2+5', '=HYPERLINK("x")', '=cmd|x'],
    ])

    const result = await parseProductExcel(file)

    expect(result.products[0].name).toBe('2+5')
    expect(result.products[0].sku).toBe('HYPERLINK("x")')
    expect(result.products[0].description).toBe('cmd|x')
  })

  it('parseNumber normaliza formatos locales e inválidos', () => {
    expect(parseNumber('S/ 1.500,50')).toBe(1500.5)
    expect(parseNumber('249,90')).toBe(249.9)
    expect(parseNumber('10')).toBe(10)
    expect(parseNumber(10)).toBe(10)
    expect(parseNumber('abc')).toBeUndefined()
    expect(parseNumber(null)).toBeUndefined()
    expect(parseNumber('')).toBeUndefined()
  })
})
