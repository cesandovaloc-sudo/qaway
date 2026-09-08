import { supabase } from '@/config/supabase'
import { handleAuthError } from '@/lib/auth'
import { sunatLookupAdapter } from './adapters/sunatLookupAdapter'
import type {
  Customer,
  CustomerDocType,
  CustomerType,
  FiscalDocLookupResult,
  PaginatedResponse,
  PaginationParams,
} from '@/types'

// ── Customer Service ──
export const customerService = {
  // Get all customers
  async getCustomers(params?: PaginationParams): Promise<PaginatedResponse<Customer>> {
    const page = params?.page || 1
    const perPage = params?.per_page || 20

    const { count } = await supabase
      .from('customers')
      .select('*', { count: 'exact', head: true })

    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .order('created_at', { ascending: false })
      .range((page - 1) * perPage, page * perPage - 1)

    if (error) {
      await handleAuthError(error)
      throw error
    }

    return {
      data: data || [],
      total: count || 0,
      page,
      per_page: perPage,
      total_pages: Math.ceil((count || 0) / perPage),
    }
  },

  // Get customer by ID
  async getCustomerById(id: string): Promise<Customer> {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  },

  // Search customers (incluye documento fiscal)
  async searchCustomers(query: string): Promise<Customer[]> {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .or(`name.ilike.%${query}%,company.ilike.%${query}%,email.ilike.%${query}%,doc_number.ilike.%${query}%`)
      .order('name')
      .limit(10)

    if (error) throw error
    return data || []
  },

  // Consulta SUNAT/RENIEC (RUC → razón social + domicilio; DNI → nombres)
  async lookupFiscalDoc(docType: CustomerDocType, docNumber: string): Promise<FiscalDocLookupResult> {
    return sunatLookupAdapter.lookup(docType, docNumber)
  },

  // Create customer
  async createCustomer(customer: Omit<Customer, 'id' | 'created_at'>): Promise<Customer> {
    const { data, error } = await supabase
      .from('customers')
      .insert(customer)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Update customer
  async updateCustomer(id: string, updates: Partial<Customer>): Promise<Customer> {
    const { data, error } = await supabase
      .from('customers')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Delete customer
  async deleteCustomer(id: string): Promise<void> {
    const { error } = await supabase
      .from('customers')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  // Get customer stats
  async getCustomerStats(id: string): Promise<{ totalQuotations: number; totalValue: number }> {
    const { data: quotations } = await supabase
      .from('quotations')
      .select('total')
      .eq('customer_id', id)

    if (!quotations) return { totalQuotations: 0, totalValue: 0 }

    return {
      totalQuotations: quotations.length,
      totalValue: quotations.reduce((sum, q) => sum + (q.total || 0), 0),
    }
  },
}

// ── Customer Type Helpers ──
export const customerTypeConfig: Record<CustomerType, { label: string; color: string; bgColor: string }> = {
  individual: { label: 'Particular', color: 'text-blue-700', bgColor: 'bg-blue-100' },
  company: { label: 'Empresa', color: 'text-purple-700', bgColor: 'bg-purple-100' },
  wholesale: { label: 'Mayorista', color: 'text-green-700', bgColor: 'bg-green-100' },
  reseller: { label: 'Revendedor', color: 'text-orange-700', bgColor: 'bg-orange-100' },
}

// ── Document Type Helpers ──
export const docTypeConfig: Record<CustomerDocType, { label: string; color: string; bgColor: string }> = {
  DNI: { label: 'DNI', color: 'text-blue-700', bgColor: 'bg-blue-100' },
  RUC: { label: 'RUC', color: 'text-purple-700', bgColor: 'bg-purple-100' },
  CE: { label: 'CE', color: 'text-teal-700', bgColor: 'bg-teal-100' },
  PASAPORTE: { label: 'Pasaporte', color: 'text-amber-700', bgColor: 'bg-amber-100' },
  SIN_DOC: { label: 'Sin doc.', color: 'text-gray-500', bgColor: 'bg-gray-100' },
}
