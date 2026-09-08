import { supabase } from '@/config/supabase'
import type { 
  LiquidationCampaign, 
  LiquidationItem, 
  CampaignStatus, 
  Product, 
  PaginatedResponse, 
  PaginationParams 
} from '@/types'

// ── Campaign with items ──
export interface CampaignWithItems {
  name: string
  description: string | null
  start_date: string | null
  end_date: string | null
  status: CampaignStatus
  discount_type: string | null
  catalog_id: string | null
  items?: LiquidationItemInput[]
}

export interface LiquidationItemInput {
  product_id: string
  liquidation_price: number | null
  package_price: number | null
  max_quantity: number | null
}

// ── Campaign Stats ──
export interface CampaignStats {
  total_products: number
  total_reference_value: number
  total_liquidation_value: number
  total_discount: number
  available_stock: number
  reserved_stock: number
  sold_stock: number
  percent_liquidated: number
}

// ── Liquidation Service ──
export const liquidationService = {
  // Get all campaigns
  async getCampaigns(params?: PaginationParams): Promise<PaginatedResponse<LiquidationCampaign>> {
    const page = params?.page || 1
    const perPage = params?.per_page || 20

    const { count } = await supabase
      .from('liquidation_campaigns')
      .select('*', { count: 'exact', head: true })

    const { data, error } = await supabase
      .from('liquidation_campaigns')
      .select('*')
      .order('created_at', { ascending: false })
      .range((page - 1) * perPage, page * perPage - 1)

    if (error) throw error

    return {
      data: data || [],
      total: count || 0,
      page,
      per_page: perPage,
      total_pages: Math.ceil((count || 0) / perPage),
    }
  },

  // Get active campaigns
  async getActiveCampaigns(): Promise<LiquidationCampaign[]> {
    const { data, error } = await supabase
      .from('liquidation_campaigns')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  // Get campaign by ID with items
  async getCampaignById(id: string): Promise<LiquidationCampaign & { items: (LiquidationItem & { product: Product })[] }> {
    const { data: campaign, error: campaignError } = await supabase
      .from('liquidation_campaigns')
      .select('*')
      .eq('id', id)
      .single()

    if (campaignError) throw campaignError

    const { data: items, error: itemsError } = await supabase
      .from('liquidation_items')
      .select('*, product:products(*)')
      .eq('campaign_id', id)

    if (itemsError) throw itemsError

    return { ...campaign, items: items || [] }
  },

  // Create campaign
  async createCampaign(campaign: CampaignWithItems): Promise<LiquidationCampaign> {
    const items = campaign.items || []

    const { data, error } = await supabase
      .from('liquidation_campaigns')
      .insert({
        name: campaign.name,
        description: campaign.description,
        start_date: campaign.start_date,
        end_date: campaign.end_date,
        status: campaign.status || 'draft',
        discount_type: campaign.discount_type,
      })
      .select()
      .single()

    if (error) throw error

    // Insert items if provided
    if (items.length > 0) {
      const liquidationItems = items.map((item: LiquidationItemInput) => ({
        campaign_id: data.id,
        product_id: item.product_id,
        liquidation_price: item.liquidation_price,
        package_price: item.package_price,
        max_quantity: item.max_quantity,
      }))

      await supabase.from('liquidation_items').insert(liquidationItems)
    }

    return data
  },

  // Update campaign
  async updateCampaign(id: string, updates: Partial<LiquidationCampaign>): Promise<LiquidationCampaign> {
    const { data, error } = await supabase
      .from('liquidation_campaigns')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Update campaign status
  async updateStatus(id: string, status: CampaignStatus): Promise<LiquidationCampaign> {
    return this.updateCampaign(id, { status })
  },

  // Delete campaign
  async deleteCampaign(id: string): Promise<void> {
    // Delete items first
    await supabase.from('liquidation_items').delete().eq('campaign_id', id)
    
    const { error } = await supabase
      .from('liquidation_campaigns')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  // Add product to campaign
  async addProduct(campaignId: string, item: LiquidationItemInput): Promise<LiquidationItem> {
    // Check if product already exists in campaign
    const { data: existing } = await supabase
      .from('liquidation_items')
      .select('id')
      .eq('campaign_id', campaignId)
      .eq('product_id', item.product_id)
      .single()

    if (existing) {
      throw new Error('Product already exists in this campaign')
    }

    const { data, error } = await supabase
      .from('liquidation_items')
      .insert({
        campaign_id: campaignId,
        product_id: item.product_id,
        liquidation_price: item.liquidation_price,
        package_price: item.package_price,
        max_quantity: item.max_quantity,
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Add multiple products to campaign
  async addProducts(campaignId: string, items: LiquidationItemInput[]): Promise<void> {
    const liquidationItems = items.map(item => ({
      campaign_id: campaignId,
      product_id: item.product_id,
      liquidation_price: item.liquidation_price,
      package_price: item.package_price,
      max_quantity: item.max_quantity,
    }))

    const { error } = await supabase
      .from('liquidation_items')
      .insert(liquidationItems)

    if (error) throw error
  },

  // Remove product from campaign
  async removeProduct(campaignId: string, productId: string): Promise<void> {
    const { error } = await supabase
      .from('liquidation_items')
      .delete()
      .eq('campaign_id', campaignId)
      .eq('product_id', productId)

    if (error) throw error
  },

  // Update product liquidation price
  async updateProductPrice(
    campaignId: string, 
    productId: string, 
    prices: { liquidation_price?: number; package_price?: number }
  ): Promise<void> {
    const { error } = await supabase
      .from('liquidation_items')
      .update(prices)
      .eq('campaign_id', campaignId)
      .eq('product_id', productId)

    if (error) throw error
  },

  // Get campaign statistics
  async getCampaignStats(campaignId: string): Promise<CampaignStats> {
    const { data: items } = await supabase
      .from('liquidation_items')
      .select('product_id, liquidation_price')
      .eq('campaign_id', campaignId)

    if (!items || items.length === 0) {
      return {
        total_products: 0,
        total_reference_value: 0,
        total_liquidation_value: 0,
        total_discount: 0,
        available_stock: 0,
        reserved_stock: 0,
        sold_stock: 0,
        percent_liquidated: 0,
      }
    }

    let totalReference = 0
    let totalLiquidation = 0
    let availableStock = 0

    for (const item of items) {
      const { data: product } = await supabase
        .from('products')
        .select('base_price, min_stock')
        .eq('id', item.product_id)
        .single()

      if (product) {
        totalReference += product.base_price || 0
        totalLiquidation += item.liquidation_price || 0
        availableStock += product.min_stock || 0
      }
    }

    return {
      total_products: items.length,
      total_reference_value: totalReference,
      total_liquidation_value: totalLiquidation,
      total_discount: totalReference - totalLiquidation,
      available_stock: availableStock,
      reserved_stock: 0,
      sold_stock: 0,
      percent_liquidated: 0,
    }
  },
}
