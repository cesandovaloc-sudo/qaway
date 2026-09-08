import { describe, it, expect } from 'vitest'

// Helper functions to test
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
    minimumFractionDigits: 2,
  }).format(value)
}

const formatDate = (date: string | null): string => {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('es-PE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('es-PE').format(value)
}

const calculateDiscount = (subtotal: number, discountPercent: number): number => {
  return subtotal * (discountPercent / 100)
}

const calculateTotal = (subtotal: number, discount: number): number => {
  return subtotal - discount
}

const getConditionLabel = (condition: number): string => {
  const labels: Record<number, string> = {
    10: 'Nuevo',
    9: 'Excelente',
    8: 'Muy bueno',
    7: 'Bueno',
    6: 'Aceptable',
    5: 'Regular',
    4: 'Deteriorado',
    3: 'Malo',
    2: 'Muy malo',
    1: 'Para repuesto',
  }
  return labels[condition] || 'Desconocido'
}

const getConditionColor = (condition: number): string => {
  if (condition >= 8) return 'text-green-600 bg-green-50'
  if (condition >= 5) return 'text-yellow-600 bg-yellow-50'
  return 'text-red-600 bg-red-50'
}

describe('formatters', () => {
  describe('formatCurrency', () => {
    it('should format number as Peruvian currency', () => {
      expect(formatCurrency(100)).toContain('100')
      expect(formatCurrency(1000)).toContain('1,000')
      expect(formatCurrency(0)).toContain('0')
    })

    it('should handle decimal values', () => {
      expect(formatCurrency(99.99)).toContain('99.99')
    })
  })

  describe('formatDate', () => {
    it('should format date string', () => {
      const result = formatDate('2026-01-15')
      expect(result).not.toBe('—')
      expect(result).toContain('2026')
    })

    it('should return dash for null', () => {
      expect(formatDate(null)).toBe('—')
    })
  })

  describe('formatNumber', () => {
    it('should format number with locale', () => {
      expect(formatNumber(1000)).toContain('1')
      expect(formatNumber(1000000)).toContain('1')
    })
  })

  describe('calculateDiscount', () => {
    it('should calculate discount amount', () => {
      expect(calculateDiscount(100, 10)).toBe(10)
      expect(calculateDiscount(200, 25)).toBe(50)
      expect(calculateDiscount(150, 0)).toBe(0)
    })
  })

  describe('calculateTotal', () => {
    it('should calculate total after discount', () => {
      expect(calculateTotal(100, 10)).toBe(90)
      expect(calculateTotal(200, 50)).toBe(150)
      expect(calculateTotal(100, 0)).toBe(100)
    })
  })

  describe('getConditionLabel', () => {
    it('should return correct label for condition', () => {
      expect(getConditionLabel(10)).toBe('Nuevo')
      expect(getConditionLabel(8)).toBe('Muy bueno')
      expect(getConditionLabel(5)).toBe('Regular')
      expect(getConditionLabel(1)).toBe('Para repuesto')
    })

    it('should return Desconocido for invalid condition', () => {
      expect(getConditionLabel(11)).toBe('Desconocido')
      expect(getConditionLabel(0)).toBe('Desconocido')
    })
  })

  describe('getConditionColor', () => {
    it('should return green for high condition', () => {
      expect(getConditionColor(10)).toContain('green')
      expect(getConditionColor(8)).toContain('green')
    })

    it('should return yellow for medium condition', () => {
      expect(getConditionColor(7)).toContain('yellow')
      expect(getConditionColor(5)).toContain('yellow')
    })

    it('should return red for low condition', () => {
      expect(getConditionColor(4)).toContain('red')
      expect(getConditionColor(1)).toContain('red')
    })
  })
})
