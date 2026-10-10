// ─────────────────────────────────────────────────────────────
// Importación de productos desde Excel/CSV (SheetJS).
// Columnas aceptadas (sinónimos en español, sin distinguir
// mayúsculas ni acentos): nombre, sku, descripción, marca,
// precio, stock, categoría, estado, condición.
// ─────────────────────────────────────────────────────────────
import * as XLSX from 'xlsx'
import type { ProductStatus } from '@/types'

export interface ExcelProductRow {
  name: string
  sku?: string
  description?: string
  brand?: string
  base_price?: number
  cost?: number
  stock?: number
  category?: string
  subcategory?: string
  status?: ProductStatus
  condition?: number
  image_url?: string
}

export interface ExcelParseResult {
  products: ExcelProductRow[]
  /** Errores por fila (número de fila en la hoja + motivo) */
  errors: string[]
  /** Encabezados detectados en la hoja */
  headers: string[]
}

// Sinónimos normalizados (minúsculas, sin acentos)
const HEADER_SYNONYMS: Record<keyof Omit<ExcelProductRow, 'name'> | 'name', string[]> = {
  name: ['nombre', 'nombre del producto', 'nombre producto', 'titulo', 'producto', 'articulo', 'item'],
  sku: ['sku', 'codigo', 'cod', 'referencia', 'codigo interno', 'codigo de barras'],
  description: ['descripcion', 'detalle', 'detalles', 'desc', 'observaciones'],
  brand: ['marca'],
  base_price: ['precio', 'precio base', 'precio de venta', 'precio venta', 'precio publico', 'pv', 'precio unitario', 'precio referencia'],
  cost: ['precio de compra', 'costo', 'costo unitario', 'precio compra'],
  stock: ['stock', 'cantidad', 'unidades', 'existencia', 'inventario'],
  category: ['categoria', 'rubro', 'clasificacion'],
  subcategory: ['subcategoria', 'sub rubro', 'subclasificacion', 'categoria adicional'],
  status: ['estado', 'status', 'estado de publicacion'],
  condition: ['condicion', 'estado fisico', 'estado condicion'],
  image_url: ['imagen', 'foto', 'url imagen', 'link imagen', 'imagen principal', 'foto de referencia', 'url de imagen'],
}

const STATUS_MAP: Record<string, ProductStatus> = {
  activo: 'active',
  active: 'active',
  publicado: 'active',
  inactivo: 'inactive',
  inactive: 'inactive',
  borrador: 'inactive',
  draft: 'inactive',
  archivado: 'archived',
  archived: 'archived',
}

function normalizeHeader(value: unknown): string {
  return String(value ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ')
}

/**
 * Texto limpio: recorta y quita un '=' inicial (defensa contra inyección de
 * fórmulas/DDE: una celda '=cmd|...' no debe llegar cruda al insert).
 */
function cleanText(value: unknown): string {
  return String(value ?? '').trim().replace(/^=+/, '')
}

/**
 * Convierte un valor de celda a número. Convención de formato local:
 * punto como separador de miles y coma como decimal ('1.500,50' → 1500.5,
 * '249,90' → 249.9). No cubre el formato US (coma-miles/punto-decimal).
 */
export function parseNumber(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value !== 'string') return undefined
  let text = value.trim().replace(/[sS]\/\.?|\$|US\$|\s|%/g, '')
  if (!text) return undefined
  // '1.500,50' → mil separado por punto, decimal por coma → 1500.5
  if (text.includes(',') && text.includes('.')) {
    text = text.replace(/\./g, '').replace(',', '.')
  } else if (text.includes(',')) {
    text = text.replace(',', '.')
  }
  const parsed = parseFloat(text)
  return Number.isFinite(parsed) ? parsed : undefined
}

function parseStatus(value: unknown): ProductStatus | undefined {
  const key = normalizeHeader(value)
  if (!key) return undefined
  return STATUS_MAP[key]
}

function firstCell(row: Record<string, unknown>, headerName?: string): unknown {
  if (headerName !== undefined) return row[headerName] ?? null
  return Object.values(row)[0] ?? null
}

/**
 * Lee la primera hoja del archivo y mapea cada fila a un producto.
 * Las filas sin nombre se reportan en `errors` (con el número de fila real de la hoja).
 */
export async function parseProductExcel(file: File): Promise<ExcelParseResult> {
  const buffer = await file.arrayBuffer()
  const workbook = XLSX.read(buffer, { type: 'array' })
  const sheet = workbook.Sheets[workbook.SheetNames[0]]
  if (!sheet) return { products: [], errors: ['El archivo no tiene hojas de datos'], headers: [] }

  const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: null })
  if (!rawRows.length) return { products: [], errors: ['El archivo no tiene filas de datos'], headers: [] }

  const headers = Object.keys(rawRows[0])
  const normalized = headers.map((h) => ({ raw: h, key: normalizeHeader(h) }))
  // Primera columna no mapeada = nombre (fichas simples con una sola columna)
  const col = (field: keyof Omit<ExcelProductRow, 'name'> | 'name'): string | undefined =>
    normalized.find((n) => HEADER_SYNONYMS[field].includes(n.key))?.raw
  const nameCol = col('name')
  const singleCol = headers.length === 1

  const products: ExcelProductRow[] = []
  const errors: string[] = []

  rawRows.forEach((row, index) => {
    const rowNumber = index + 2 // fila 1 = encabezados

    const rawName = singleCol && nameCol === undefined
      ? firstCell(row)
      : firstCell(row, nameCol)
    const name = typeof rawName === 'string' ? cleanText(rawName) : ''
    const readText = (field: 'sku' | 'description' | 'brand' | 'category' | 'subcategory' | 'image_url') => {
      const header = col(field)
      return header !== undefined ? cleanText(row[header]) || undefined : undefined
    }

    if (!name) {
      errors.push(`Fila ${rowNumber}: falta el nombre del producto`)
      return
    }

    const priceRaw = col('base_price') !== undefined ? row[col('base_price')!] : null
    const costRaw = col('cost') !== undefined ? row[col('cost')!] : null
    const stockRaw = col('stock') !== undefined ? row[col('stock')!] : null
    const conditionRaw = col('condition') !== undefined ? row[col('condition')!] : null

    const product: ExcelProductRow = {
      name,
      sku: readText('sku'),
      description: readText('description'),
      brand: readText('brand'),
      base_price: parseNumber(priceRaw),
      cost: parseNumber(costRaw),
      stock: parseNumber(stockRaw),
      category: readText('category'),
      subcategory: readText('subcategory'),
      status: col('status') !== undefined ? parseStatus(row[col('status')!]) : undefined,
      image_url: readText('image_url'),
    }
    const condition = parseNumber(conditionRaw)
    if (condition !== undefined) {
      product.condition = Math.min(10, Math.max(1, Math.round(condition)))
    }

    products.push(product)
  })

  return { products, errors, headers }
}

/** Columnas recomendadas para la plantilla (hint de UI). */
export const EXCEL_TEMPLATE_COLUMNS = ['Nombre', 'SKU', 'Descripción', 'Marca', 'Precio de Venta', 'Precio de Compra', 'Stock', 'Categoría', 'Subcategoría', 'Estado', 'Condición', 'URL de Imagen']

/** Descarga un archivo Excel de modelo listo para llenar. */
export function downloadExcelTemplate() {
  const instructionsRow = [
    '(Obligatorio) Nombre completo del producto',
    '(Opcional) Código único o código de barras',
    '(Opcional) Detalles y descripción',
    '(Opcional) Marca del producto',
    '(Opcional) Precio de venta (ej: 150.50)',
    '(Opcional) Precio de compra (ej: 100.00)',
    '(Opcional) Cantidad en inventario (Solo números enteros)',
    '(Opcional) Categoría principal',
    '(Opcional) Categoría secundaria',
    '(Opcional) Escribir: activo, inactivo o archivado',
    '(Opcional) Estado físico: Número del 1 al 10',
    '(Opcional) Enlace web a la foto principal',
  ]
  const ws = XLSX.utils.aoa_to_sheet([EXCEL_TEMPLATE_COLUMNS, instructionsRow])
  
  // Anchos de columna sugeridos
  ws['!cols'] = [
    { wch: 30 }, // Nombre
    { wch: 15 }, // SKU
    { wch: 40 }, // Descripción
    { wch: 15 }, // Marca
    { wch: 15 }, // Precio Venta
    { wch: 15 }, // Precio Compra
    { wch: 10 }, // Stock
    { wch: 20 }, // Categoría
    { wch: 20 }, // Subcategoría
    { wch: 15 }, // Estado
    { wch: 12 }, // Condición
    { wch: 35 }, // URL Imagen
  ]

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Productos')
  
  XLSX.writeFile(wb, 'plantilla_inventario.xlsx')
}
