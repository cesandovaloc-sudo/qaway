import { supabase } from '@/config/supabase';
import { getMockCategoryPage, getMockHome, getMockProductPage, getMockCategories, getMockTenant, getMockProducts } from '../data/mock';
import type {
  StoreCategory,
  StoreCategoryPageData,
  StoreHomeData,
  StoreProduct,
  StoreProductPageData,
  StoreSearchResult,
  StoreTenant,
} from '../types/storefront';

/**
 * Contrato de storefront para UI.
 * UI solo consume este servicio; no hacer queries Supabase dispersas.
 */
export interface StorefrontService {
  getHome(tenantSlug: string): Promise<StoreHomeData>;
  getCategoryPage(tenantSlug: string, categorySlug: string): Promise<StoreCategoryPageData>;
  getProductPage(tenantSlug: string, productSlug: string): Promise<StoreProductPageData>;
  getCategories(tenantSlug: string): Promise<StoreCategory[]>;
  search(tenantSlug: string, q: string): Promise<StoreSearchResult>;
}

type AnyRecord = Record<string, any>;

function slugify(value: string) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function mapTenant(row: AnyRecord | null, fallbackSlug: string): StoreTenant {
  const branding = (row?.branding && typeof row.branding === 'object') ? row.branding : {};
  const content = (row?.content && typeof row.content === 'object') ? row.content : {};
  const contact = (content.contact && typeof content.contact === 'object') ? content.contact : {};
  return {
    id: String(row?.id || `tenant-${fallbackSlug}`),
    slug: String(row?.slug || fallbackSlug),
    name: String(row?.name || getMockTenant(fallbackSlug).name),
    logoUrl: branding.logo_url ?? branding.logoUrl ?? row?.logo_url ?? null,
    bannerUrl: branding.banner_url ?? branding.bannerUrl ?? branding.cover_url ?? row?.banner_url ?? null,
    primaryColor: branding.primary_color ?? branding.primaryColor ?? '#1e364b',
    accentColor: branding.accent_color ?? branding.accentColor ?? '#16a34a',
    whatsapp: contact.whatsapp ?? branding.whatsapp ?? row?.whatsapp ?? null,
    email: contact.email ?? branding.email ?? row?.email ?? null,
  };
}

function mapImages(row: AnyRecord): string[] {
  const imgs: string[] = [];
  const push = (v: any) => {
    const url = typeof v === 'string' ? v : v?.processed_url || v?.original_url || v?.url || v?.src;
    if (typeof url === 'string' && url.startsWith('http') && !imgs.includes(url)) imgs.push(url);
  };
  if (Array.isArray(row?.images)) row.images.forEach(push);
  push(row?.image_url);
  push(row?.image);
  return imgs;
}

function mapProduct(row: AnyRecord, categories: StoreCategory[]): StoreProduct | null {
  const id = String(row?.id || '');
  if (!id) return null;
  const name = String(row?.name || row?.title || 'Producto');
  const categoryId = row?.category_id ? String(row.category_id) : null;
  const cat = categories.find(c => c.id === categoryId) || categories.find(c => c.slug === slugify(String(row?.category || '')));
  const categorySlug = cat?.slug || slugify(String(row?.category || 'general')) || 'general';
  const categoryName = cat?.name || row?.category || 'General';
  const images = mapImages(row);
  const fallback = getMockProducts().find(p => p.slug === String(row?.slug || '')) || null;
  return {
    id,
    slug: String(row?.slug || slugify(name) || id),
    sku: row?.sku ?? null,
    name,
    brand: row?.brand ?? null,
    description: row?.description ?? row?.short_description ?? null,
    categorySlug,
    categoryName,
    price: Number(row?.base_price ?? row?.price ?? row?.unit_price ?? 0),
    compareAtPrice: row?.compare_at_price != null ? Number(row.compare_at_price) : (row?.old_price != null ? Number(row.old_price) : null),
    stock: Number(row?.stock ?? 0),
    images: images.length ? images : (fallback?.images || ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=900&h=1100&fit=crop&auto=format']),
    variants: Array.isArray(row?.variants) ? row.variants : fallback?.variants,
    tags: Array.isArray(row?.tags) ? row.tags : [],
  };
}

function mapCategory(row: AnyRecord): StoreCategory {
  const name = String(row?.name || 'Categoría');
  return {
    id: String(row?.id || slugify(name)),
    slug: String(row?.slug || slugify(name)),
    name,
    imageUrl: row?.image_url ?? row?.imageUrl ?? row?.banner_url ?? null,
    parentId: row?.parent_id ?? null,
  };
}

async function resolveTenant(tenantSlug: string): Promise<{ tenant: StoreTenant; tenantId: string | null }> {
  try {
    // Intenta por slug, luego por id; si la columna slug no existe, el error cae al fallback.
    let row: AnyRecord | null = null;
    const bySlug = await supabase.from('tenants').select('id,slug,name,branding,content,logo_url,banner_url').eq('slug', tenantSlug).maybeSingle();
    if (!bySlug.error && bySlug.data) row = bySlug.data;
    if (!row) {
      const byId = await supabase.from('tenants').select('id,slug,name,branding,content,logo_url,banner_url').eq('id', tenantSlug).maybeSingle();
      if (!byId.error && byId.data) row = byId.data;
    }
    if (row) return { tenant: mapTenant(row, tenantSlug), tenantId: String(row.id) };
  } catch {}
  return { tenant: getMockTenant(tenantSlug), tenantId: null };
}

async function fetchCategories(tenantId: string | null): Promise<StoreCategory[]> {
  try {
    let query = supabase.from('categories').select('id,name,slug,image_url,parent_id,tenant_id,sort_order').order('sort_order', { ascending: true }).order('name', { ascending: true });
    if (tenantId) query = query.or(`tenant_id.eq.${tenantId},tenant_id.is.null`);
    const { data, error } = await query;
    if (!error && Array.isArray(data)) {
      if (data.length) return data.map(mapCategory);
      // Tenant real resuelto pero sin categorías: devolver vacío (no mock).
      if (tenantId) return [];
    }
  } catch {}
  // Fallback mock solo para demo/tenant no resuelto.
  return tenantId ? [] : getMockCategories();
}

async function fetchProducts(tenantId: string | null, categories: StoreCategory[]): Promise<StoreProduct[]> {
  try {
    let query = supabase
      .from('inv_products')
      .select('id,sku,name,slug,description,short_description,category,category_id,brand,type,status,commercial_status,base_price,compare_at_price,stock,stock_qty,quantity,min_stock,image_url,images,variants,tags,tenant_id,created_at')
      .order('created_at', { ascending: false })
      .limit(200);
    if (tenantId) query = query.eq('tenant_id', tenantId);
    const { data, error } = await query;
    if (!error && Array.isArray(data)) {
      const mapped = data
        .filter((p: AnyRecord) => {
          const status = String(p.status || 'active');
          const commercial = String(p.commercial_status || 'available');
          return status !== 'inactive' && status !== 'archived' && commercial !== 'unavailable';
        })
        .map((p: AnyRecord) => mapProduct(p, categories))
        .filter(Boolean) as StoreProduct[];
      // Tenant real resuelto: devolver resultado real aunque esté vacío.
      if (tenantId) return mapped;
      if (mapped.length) return mapped;
    }
  } catch {}
  // Fallback mock solo para demo/tenant no resuelto.
  return tenantId ? [] : getMockProducts();
}

const supabaseStorefrontService: StorefrontService = {
  async getHome(tenantSlug) {
    const { tenant, tenantId } = await resolveTenant(tenantSlug);
    const categories = await fetchCategories(tenantId);
    const products = await fetchProducts(tenantId, categories);
    const offers = products.filter(p => p.compareAtPrice && p.compareAtPrice > p.price);
    const featured = products.slice(0, 8);
    const fallback = getMockHome(tenantSlug);
    const isResolvedTenant = Boolean(tenantId);
    return {
      tenant,
      banners: fallback.banners.map(b => ({ ...b, ctaHref: `/tienda/${tenant.slug}/c/${categories[0]?.slug || 'mujer'}` })),
      categories: categories.length ? categories : (isResolvedTenant ? [] : fallback.categories),
      featured: featured.length ? featured : (isResolvedTenant ? [] : fallback.featured),
      offers: (offers.length ? offers : (isResolvedTenant ? [] : fallback.offers)).slice(0, 8),
    };
  },

  async getCategoryPage(tenantSlug, categorySlug) {
    const { tenant, tenantId } = await resolveTenant(tenantSlug);
    const categories = await fetchCategories(tenantId);
    const category = categories.find(c => c.slug === categorySlug) || { id: categorySlug, slug: categorySlug, name: categorySlug };
    const products = await fetchProducts(tenantId, categories);
    const filtered = categorySlug ? products.filter(p => p.categorySlug === category.slug) : products;
    return {
      tenant,
      categories: categories.length ? categories : (tenantId ? [] : getMockCategories()),
      category,
      products: filtered,
      total: filtered.length,
    };
  },

  async getProductPage(tenantSlug, productSlug) {
    const { tenant, tenantId } = await resolveTenant(tenantSlug);
    const categories = await fetchCategories(tenantId);
    const products = await fetchProducts(tenantId, categories);
    const product = products.find(p => p.slug === productSlug) || products.find(p => p.id === productSlug) || (!tenantId ? products[0] : null);
    const related = product
      ? products.filter(p => p.categorySlug === product.categorySlug && p.id !== product.id).slice(0, 4)
      : [];
    return {
      tenant,
      categories: categories.length ? categories : (tenantId ? [] : getMockCategories()),
      product: product as StoreProduct,
      related,
    };
  },

  async getCategories(tenantSlug) {
    const { tenantId } = await resolveTenant(tenantSlug);
    return fetchCategories(tenantId);
  },

  async search(tenantSlug, q) {
    const { tenant, tenantId } = await resolveTenant(tenantSlug);
    const categories = await fetchCategories(tenantId);
    const products = await fetchProducts(tenantId, categories);
    const term = q.toLowerCase().trim();
    const filtered = products.filter(p =>
      !term ||
      p.name.toLowerCase().includes(term) ||
      (p.brand || '').toLowerCase().includes(term) ||
      (p.categoryName || '').toLowerCase().includes(term) ||
      (p.description || '').toLowerCase().includes(term)
    );
    return { tenant, categories, products: filtered, total: filtered.length, q };
  },
};

export const storefrontService: StorefrontService = supabaseStorefrontService;
