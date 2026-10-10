// ── Product Condition (Likert Scale 1-10) ──
export type ProductCondition = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10

export const conditionConfig: Record<ProductCondition, { label: string; description: string; color: string }> = {
  10: { label: 'Nuevo', description: 'Sin uso, empaque original', color: 'text-emerald-600' },
  9: { label: 'Excelente', description: 'Casi nuevo, mínimo uso', color: 'text-emerald-500' },
  8: { label: 'Muy bueno', description: 'Uso leve, sin defectos visibles', color: 'text-green-500' },
  7: { label: 'Bueno', description: 'Uso normal, signos menores', color: 'text-blue-500' },
  6: { label: 'Aceptable', description: 'Uso visible, funciona perfecto', color: 'text-blue-400' },
  5: { label: 'Regular', description: 'Desgaste notable, funciona', color: 'text-amber-500' },
  4: { label: 'Deteriorado', description: 'Daños visibles, funciona parcialmente', color: 'text-orange-500' },
  3: { label: 'Malo', description: 'Daños significativos', color: 'text-orange-600' },
  2: { label: 'Muy malo', description: 'Casi inutilizable', color: 'text-red-500' },
  1: { label: 'Para repuesto', description: 'Solo piezas', color: 'text-red-600' },
}

// ── Helper: Get condition color class ──
export function getConditionColor(condition: ProductCondition): string {
  return conditionConfig[condition]?.color || 'text-gray-500'
}

// ── Helper: Get condition label ──
export function getConditionLabel(condition: ProductCondition): string {
  return conditionConfig[condition]?.label || 'Desconocido'
}

// ── Helper: Get condition description ──
export function getConditionDescription(condition: ProductCondition): string {
  return conditionConfig[condition]?.description || ''
}

// ── Product Video ──
export interface ProductVideo {
  id: string
  product_id: string
  url: string
  thumbnail_url: string | null
  title: string | null
  duration: number | null
  sort_order: number
  created_at: string
}
