import { supabase } from '@/config/supabase'

// ── Types ──
export interface PricingRule {
  id: string
  name: string
  type: PricingRuleType
  condition: PricingCondition
  discount_type: DiscountType
  value: number
  priority: number
  is_active: boolean
  valid_from: string | null
  valid_to: string | null
  created_at: string
}

export type PricingRuleType = 'quantity' | 'date' | 'customer' | 'product' | 'campaign'
export type DiscountType = 'percentage' | 'fixed' | 'fixed_price'
export type ConditionOperator = 'gte' | 'lte' | 'eq' | 'neq' | 'in' | 'between'

export interface PricingCondition {
  field: string
  operator: ConditionOperator
  value: string | number | string[]
}

// ── Interface ──
export interface PricingRulesAdapter {
  getRules(): Promise<PricingRule[]>
  getRuleById(id: string): Promise<PricingRule | null>
  createRule(data: Partial<PricingRule>): Promise<PricingRule | null>
  updateRule(id: string, data: Partial<PricingRule>): Promise<PricingRule | null>
  deleteRule(id: string): Promise<boolean>
  toggleActive(id: string, isActive: boolean): Promise<boolean>
}

// ── Supabase Implementation ──
export const supabasePricingRulesAdapter: PricingRulesAdapter = {
  async getRules() {
    const { data, error } = await supabase
      .from('pricing_rules')
      .select('*')
      .order('priority', { ascending: true })

    if (error) {
      console.error('Error fetching pricing rules:', error)
      return []
    }
    return data || []
  },

  async getRuleById(id) {
    const { data, error } = await supabase
      .from('pricing_rules')
      .select('*')
      .eq('id', id)
      .single()

    if (error) return null
    return data
  },

  async createRule(ruleData) {
    const { data, error } = await supabase
      .from('pricing_rules')
      .insert(ruleData)
      .select()
      .single()

    if (error) {
      console.error('Error creating pricing rule:', error)
      return null
    }
    return data
  },

  async updateRule(id, ruleData) {
    const { data, error } = await supabase
      .from('pricing_rules')
      .update(ruleData)
      .eq('id', id)
      .select()
      .single()

    if (error) return null
    return data
  },

  async deleteRule(id) {
    const { error } = await supabase
      .from('pricing_rules')
      .delete()
      .eq('id', id)
    return !error
  },

  async toggleActive(id, isActive) {
    const { error } = await supabase
      .from('pricing_rules')
      .update({ is_active: isActive })
      .eq('id', id)
    return !error
  },
}

// ── Service ──
let adapter: PricingRulesAdapter = supabasePricingRulesAdapter

export function setPricingRulesAdapter(newAdapter: PricingRulesAdapter) {
  adapter = newAdapter
}

export const pricingRulesService = {
  async getRules(): Promise<PricingRule[]> {
    return adapter.getRules()
  },

  async getRuleById(id: string): Promise<PricingRule | null> {
    return adapter.getRuleById(id)
  },

  async createRule(data: Partial<PricingRule>): Promise<PricingRule | null> {
    return adapter.createRule(data)
  },

  async updateRule(id: string, data: Partial<PricingRule>): Promise<PricingRule | null> {
    return adapter.updateRule(id, data)
  },

  async deleteRule(id: string): Promise<boolean> {
    return adapter.deleteRule(id)
  },

  async toggleActive(id: string, isActive: boolean): Promise<boolean> {
    return adapter.toggleActive(id, isActive)
  },

  // Helper: evaluate a rule against context
  evaluateRule(rule: PricingRule, context: Record<string, unknown>): boolean {
    if (!rule.is_active) return false

    // Check date validity
    if (rule.valid_from && new Date(rule.valid_from) > new Date()) return false
    if (rule.valid_to && new Date(rule.valid_to) < new Date()) return false

    // Evaluate condition
    const { field, operator, value } = rule.condition
    const fieldValue = context[field]

    switch (operator) {
      case 'gte': return Number(fieldValue) >= Number(value)
      case 'lte': return Number(fieldValue) <= Number(value)
      case 'eq': return fieldValue === value
      case 'neq': return fieldValue !== value
      case 'in': return Array.isArray(value) && value.includes(String(fieldValue))
      case 'between': {
        const [min, max] = value as unknown as [number, number]
        return Number(fieldValue) >= min && Number(fieldValue) <= max
      }
      default: return false
    }
  },

  // Helper: apply discount to price
  applyRule(price: number, rule: PricingRule): number {
    switch (rule.discount_type) {
      case 'percentage':
        return Math.round(price * (1 - rule.value / 100) * 100) / 100
      case 'fixed':
        return Math.max(0, price - rule.value)
      case 'fixed_price':
        return rule.value
      default:
        return price
    }
  },
}

// ── Type labels ──
export const ruleTypeLabels: Record<PricingRuleType, string> = {
  quantity: 'Por cantidad',
  date: 'Por fecha',
  customer: 'Por cliente',
  product: 'Por producto',
  campaign: 'Por campaña',
}

export const discountTypeLabels: Record<DiscountType, string> = {
  percentage: 'Porcentaje',
  fixed: 'Descuento fijo',
  fixed_price: 'Precio fijo',
}

export const operatorLabels: Record<ConditionOperator, string> = {
  gte: '≥',
  lte: '≤',
  eq: '=',
  neq: '≠',
  in: 'en',
  between: 'entre',
}
