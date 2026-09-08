// Re-export types from product.ts (includes ProductCondition and helpers)
export * from './product'

// Re-export types from user.ts (includes User, UserRole, permissions)
export * from './user'

// ── Product ──
export interface Product {
  id: string
  sku: string
  name: string
  slug: string
  description: string | null
  category_id: string | null
  subcategory_id: string | null
  brand: string | null
  type: ProductType
  status: ProductStatus
  condition: number  // 1-10 Likert scale
  unit: string
  min_stock: number
  location_id: string | null
  cost: number | null
  base_price: number | null
  commercial_status: CommercialStatus
  notes: string | null
  images?: ProductImage[]
  created_at: string
  updated_at: string
}

export type ProductType = 'simple' | 'variant' | 'composite'
export type ProductStatus = 'active' | 'inactive' | 'archived'
export type CommercialStatus = 'available' | 'reserved' | 'sold' | 'out_of_stock' | 'unavailable'

// ── Product Variant ──
export interface ProductVariant {
  id: string
  product_id: string
  name: string
  sku: string
  attributes: Record<string, string>
  stock: number
  cost: number | null
  price: number | null
  condition: number
  created_at: string
}

// ── Category ──
export interface Category {
  id: string
  name: string
  slug: string
  parent_id: string | null
  icon: string | null
  sort_order: number
  created_at: string
}

// ── Product Image ──
export interface ProductImage {
  id: string
  product_id: string
  original_url: string
  processed_url: string | null
  is_primary: boolean
  alt: string | null
  sort_order: number
  created_at: string
}

// ── Inventory Location ──
export interface InventoryLocation {
  id: string
  name: string
  code: string
  type: LocationType
  parent_id: string | null
  address: string | null
  created_at: string
}

export type LocationType = 'warehouse' | 'room' | 'office' | 'depot' | 'project' | 'shelf' | 'zone'

// ── Inventory Movement ──
export interface InventoryMovement {
  id: string
  product_id: string
  variant_id: string | null
  type: MovementType
  quantity: number
  from_location_id: string | null
  to_location_id: string | null
  notes: string | null
  created_by: string | null
  created_at: string
}

export type MovementType = 'entry' | 'exit' | 'transfer' | 'adjustment' | 'sale' | 'reservation'

// ── Price List ──
export interface PriceList {
  id: string
  name: string
  type: PriceListType
  is_active: boolean
  description: string | null
  created_at: string
}

export type PriceListType = 'normal' | 'wholesale' | 'offer' | 'liquidation' | 'institutional' | 'campaign'

// ── Product Price ──
export interface ProductPrice {
  id: string
  product_id: string
  price_list_id: string
  price: number
  min_quantity: number
  valid_from: string | null
  valid_to: string | null
}

// ── Bundle ──
export interface Bundle {
  id: string
  name: string
  sku: string
  description: string | null
  image_url: string | null
  total_individual_price: number
  bundle_price: number
  discount: number
  status: ProductStatus
  created_at: string
}

// ── Bundle Item ──
export interface BundleItem {
  id: string
  bundle_id: string
  product_id: string
  variant_id: string | null
  quantity: number
}

// ── Liquidation Campaign ──
export interface LiquidationCampaign {
  id: string
  name: string
  description: string | null
  start_date: string | null
  end_date: string | null
  status: CampaignStatus
  discount_type: string | null
  catalog_id: string | null
  created_at: string
}

export type CampaignStatus = 'draft' | 'preparing' | 'active' | 'paused' | 'finished' | 'archived'

// ── Liquidation Item ──
export interface LiquidationItem {
  id: string
  campaign_id: string
  product_id: string
  liquidation_price: number | null
  package_price: number | null
  max_quantity: number | null
}

// ── Catalog ──
export interface Catalog {
  id: string
  campaign_id: string | null
  name: string
  slug: string
  description: string | null
  is_public: boolean
  template: CatalogTemplate
  pdf_url: string | null
  public_url: string | null
  created_at: string
}

export type CatalogTemplate = 'minimal' | 'professional' | 'premium'

// ── Catalog Item ──
export interface CatalogItem {
  id: string
  catalog_id: string
  product_id: string
  bundle_id: string | null
  sort_order: number
  show_price: boolean
  show_description: boolean
}

// ── Customer ──
export type CustomerDocType = 'DNI' | 'RUC' | 'CE' | 'PASAPORTE' | 'SIN_DOC'

export interface Customer {
  id: string
  name: string
  company: string | null
  email: string | null
  phone: string | null
  type: CustomerType
  /** Documento fiscal (DNI/RUC/CE/Pasaporte) — requisito para facturación */
  doc_type: CustomerDocType | null
  doc_number: string | null
  /** Razón social / nombre legal (autocompletable desde SUNAT) */
  fiscal_name: string | null
  /** Domicilio fiscal */
  address: string | null
  /** Datos adicionales (género, alias, mascota…) */
  extra_data: Record<string, unknown> | null
  notes: string | null
  created_at: string
}

export type CustomerType = 'individual' | 'company' | 'wholesale' | 'reseller'

// ── Consulta SUNAT (RUC/DNI) ──
export interface FiscalDocLookupResult {
  /** Razón social (RUC) o nombres completos (DNI) */
  fiscal_name: string
  /** Domicilio fiscal (solo RUC normalmente) */
  address: string | null
  /** Respuesta cruda del proveedor (para auditoría) */
  raw?: Record<string, unknown>
}

// ── Configuración fiscal (FASE 0) ──
export interface BusinessSettings {
  id: string
  ruc: string | null
  razon_social: string | null
  nombre_comercial: string | null
  direccion: string | null
  regimen: string
  igv_rate: number
  moneda: string
  sunat_connected: boolean
  sunat_connection_meta: Record<string, unknown> | null
  created_at: string
  updated_at: string
}

export type TaxType = 'igv' | 'isc' | 'exonerado' | 'inafecto' | 'gratuito'

export interface Tax {
  id: string
  codigo: string
  descripcion: string
  tasa: number | null
  tipo: TaxType
  active: boolean
  created_at: string
}

export interface SunatUnit {
  id: string
  codigo: string
  descripcion: string
  active: boolean
  created_at: string
}

export interface InvoiceSeries {
  id: string
  tipo_doc: '01' | '03' | '07' | '08'
  serie: string
  descripcion: string | null
  correlativo_actual: number
  active: boolean
  created_at: string
}

// ── Ventas al crédito (FASE 2) ──
export type PaymentStatus = 'pagado' | 'deuda' | 'parcial'

export interface Sale {
  id: string
  sale_number: string
  customer_id: string | null
  customer_name: string | null
  doc_type: CustomerDocType | null
  doc_number: string | null
  fiscal_name: string | null
  fiscal_address: string | null
  subtotal: number
  discount: number
  igv_total: number
  total: number
  currency: string
  payment_status: PaymentStatus
  status: 'active' | 'cancelled'
  payment_method: string | null
  notes: string | null
  created_by: string | null
  created_at: string
  paid_at: string | null
}

export interface SaleItem {
  id: string
  sale_id: string
  product_id: string | null
  product_title: string
  quantity: number
  unit_price: number
  subtotal: number
  tax_code: string | null
  unit_sunat: string | null
}

export type PaymentMethod = 'efectivo' | 'yape' | 'tarjeta' | 'transferencia'

export interface SalePayment {
  id: string
  sale_id: string
  amount: number
  method: PaymentMethod
  received_at: string
  created_by: string | null
  notes: string | null
}

export interface SaleWithRelations extends Sale {
  items: SaleItem[]
  payments: SalePayment[]
}

// ── Facturación electrónica (FASE 3, schema preparado) ──
export type InvoiceStatus = 'generado' | 'enviado' | 'aceptado' | 'rechazado' | 'anulado'

export interface Invoice {
  id: string
  sale_id: string | null
  series_id: string | null
  correlativo: number | null
  numero: string
  tipo_doc: '01' | '03'
  doc_type: CustomerDocType | null
  doc_number: string | null
  fiscal_name: string | null
  fiscal_address: string | null
  moneda: string
  subtotal: number
  igv_total: number
  total: number
  igv_rate: number
  descuento: number
  estado: InvoiceStatus
  sunat_response: Record<string, unknown> | null
  xml_url: string | null
  pdf_url: string | null
  created_by: string | null
  emitted_at: string | null
  created_at: string
}

export interface InvoiceLine {
  id: string
  invoice_id: string
  product_title: string
  quantity: number
  unit_price: number
  tax_code: string | null
  igv_amount: number
  total: number
}

// ── Quotation ──
export interface Quotation {
  id: string
  customer_id: string | null
  status: QuotationStatus
  subtotal: number
  discount: number
  total: number
  valid_until: string | null
  notes: string | null
  created_at: string
}

export type QuotationStatus = 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired'

// ── Quotation Item ──
export interface QuotationItem {
  id: string
  quotation_id: string
  product_id: string
  bundle_id: string | null
  quantity: number
  unit_price: number
  discount: number
  subtotal: number
}

// ── AI Suggestion ──
export interface AISuggestion {
  id: string
  product_id: string | null
  type: SuggestionType
  value: string
  confidence: 'high' | 'medium' | 'low'
  source: string
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
}

export type SuggestionType = 'product_name' | 'category' | 'description' | 'attributes' | 'condition' | 'price' | 'bundle'

// ── Pricing Rules ──
export interface PricingRule {
  id: string
  name: string
  type: PricingRuleType
  condition_field: string
  condition_operator: 'eq' | 'gt' | 'lt' | 'gte' | 'lte' | 'between' | 'in'
  condition_value: unknown
  action_type: 'discount_percent' | 'discount_fixed' | 'set_price' | 'use_list'
  action_value: number | string
  priority: number
  is_active: boolean
  valid_from: string | null
  valid_to: string | null
  created_at: string
}

export type PricingRuleType = 'quantity' | 'date' | 'customer' | 'product' | 'campaign' | 'global'

// ── Dashboard Stats ──
export interface DashboardStats {
  total_products: number
  total_stock: number
  inventory_value: number
  low_stock_count: number
  out_of_stock_count: number
  active_products: number
  products_in_offer: number
  products_in_liquidation: number
}

// ── API Response ──
export interface ApiResponse<T> {
  data: T | null
  error: string | null
  loading: boolean
}

// ── Pagination ──
export interface PaginationParams {
  page: number
  per_page: number
  sort_by?: string
  sort_order?: 'asc' | 'desc'
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  per_page: number
  total_pages: number
}

// ── Filters ──
export interface ProductFilters {
  search?: string
  category_id?: string
  status?: ProductStatus
  commercial_status?: CommercialStatus
  location_id?: string
  min_price?: number
  max_price?: number
  min_stock?: number
  brand?: string
  condition_min?: number
  condition_max?: number
}
