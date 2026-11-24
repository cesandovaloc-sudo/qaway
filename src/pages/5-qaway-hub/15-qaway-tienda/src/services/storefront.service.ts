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

function buildTemplateCategories(): StoreCategory[] {
  const mock = getMockCategories();
  return mock.map((c, i) => ({
    id: `template-cat-${i + 1}`,
    slug: `categoria-${i + 1}`,
    name: `Categoría ${i + 1}`,
    imageUrl: null,
    parentId: null,
  }));
}

function buildTemplateProducts(): StoreProduct[] {
  const mockCats = getMockCategories();
  const catMap = new Map(mockCats.map((c, i) => [c.slug, { slug: `categoria-${i + 1}`, name: `Categoría ${i + 1}` }]));
  const mockProducts = getMockProducts();
  return mockProducts.map((p, i) => {
    const cat = catMap.get(p.categorySlug) || { slug: 'categoria-1', name: 'Categoría 1' };
    return {
      id: `template-prod-${i + 1}`,
      slug: `producto-${i + 1}`,
      sku: null,
      name: `Producto ${i + 1}`,
      brand: null,
      description: 'Espacio listo para tu producto. Cuando cargues tu catálogo, aquí se mostrará la información real.',
      categorySlug: cat.slug,
      categoryName: cat.name,
      price: 0,
      compareAtPrice: null,
      stock: 0,
      images: [],
      variants: p.variants || [],
      tags: [],
    };
  });
}

function buildTemplateHome(tenant: StoreTenant): StoreHomeData {
  const categories = buildTemplateCategories();
  const products = buildTemplateProducts();
  const featured = products.slice(0, 8);
  return {
    tenant,
    banners: [
      {
        id: 'template-banner-1',
        title: 'Banner principal',
        subtitle: 'Espacio listo para la imagen principal de tu tienda.',
        imageUrl: '',
        ctaLabel: 'Ver más',
        ctaHref: `/tienda/${tenant.slug}/c/${categories[0]?.slug || 'categoria-1'}`,
      },
    ],
    categories,
    featured,
    offers: [],
  };
}

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

async function checkCanManageTenant(tenantId: string): Promise<boolean> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    let user = session?.user ?? null;
    if (!user) {
      const { data: { user: u } } = await supabase.auth.getUser();
      user = u ?? null;
    }
    if (!user) return false;
    const { data: profile } = await supabase
      .from('users')
      .select('tenant_id,role,is_platform_admin')
      .eq('id', user.id)
      .maybeSingle();
    if (!profile) return false;
    if (profile.is_platform_admin === true) return true;
    return String(profile.tenant_id || '') === String(tenantId) && String(profile.role || '').toLowerCase() === 'admin';
  } catch {
    return false;
  }
}

async function resolveTenant(tenantSlug: string): Promise<{ tenant: StoreTenant; tenantId: string | null; isDemo: boolean }> {
  try {
    let row: AnyRecord | null = null;
    const bySlug = await supabase.from('tenants').select('id,slug,name,branding,content,features').eq('slug', tenantSlug).maybeSingle();
    if (!bySlug.error && bySlug.data) row = bySlug.data;
    if (!row) {
      const byId = await supabase.from('tenants').select('id,slug,name,branding,content,features').eq('id', tenantSlug).maybeSingle();
      if (!byId.error && byId.data) row = byId.data;
    }
    if (row) {
      const tenantId = String(row.id);
      const features = (row.features && typeof row.features === 'object') ? row.features : {};
      const isPublished = features.storefront_published === true;
      const canManage = await checkCanManageTenant(tenantId);
      const tenant = mapTenant(row, tenantSlug);
      tenant.isPublished = isPublished;
      tenant.canManage = canManage;
      return { tenant, tenantId, isDemo: false };
    }
    if (bySlug.error) console.error('[storefront] resolveTenant error', tenantSlug, bySlug.error.message);
  } catch (e) {
    console.error('[storefront] resolveTenant error', tenantSlug, e);
  }
  const isDemo = tenantSlug === 'demo';
  if (isDemo) {
    const tenant = getMockTenant(tenantSlug);
    tenant.isPublished = true;
    tenant.canManage = false;
    return { tenant, tenantId: null, isDemo: true };
  }
  return {
    tenant: {
      id: `tenant-${tenantSlug}`,
      slug: tenantSlug,
      name: tenantSlug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
      logoUrl: null,
      bannerUrl: null,
      primaryColor: '#1e364b',
      accentColor: '#16a34a',
      whatsapp: null,
      email: null,
      isPublished: false,
      canManage: false,
    },
    tenantId: null,
    isDemo: false,
  };
}

async function fetchCategories(tenantId: string | null, isDemo: boolean): Promise<StoreCategory[]> {
  if (!tenantId && !isDemo) return [];
  try {
    let query = supabase.from('categories').select('id,name,slug,image_url,parent_id,tenant_id,sort_order').order('sort_order', { ascending: true }).order('name', { ascending: true });
    if (tenantId) query = query.or(`tenant_id.eq.${tenantId},tenant_id.is.null`);
    const { data, error } = await query;
    if (!error && Array.isArray(data)) {
      if (data.length) return data.map(mapCategory);
      if (tenantId) return [];
    }
  } catch {}
  return isDemo ? getMockCategories() : [];
}

async function fetchProducts(tenantId: string | null, categories: StoreCategory[], isDemo: boolean): Promise<StoreProduct[]> {
  if (!tenantId && !isDemo) return [];
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
      if (tenantId) return mapped;
      if (mapped.length) return mapped;
    }
  } catch {}
  return isDemo ? getMockProducts() : [];
}

const supabaseStorefrontService: StorefrontService = {
  async getHome(tenantSlug) {
    const { tenant, tenantId, isDemo } = await resolveTenant(tenantSlug);
    const categories = await fetchCategories(tenantId, isDemo);
    const products = await fetchProducts(tenantId, categories, isDemo);
    if (isDemo) {
      const fallback = getMockHome(tenantSlug);
      return {
        ...fallback,
        tenant,
        banners: fallback.banners.map(b => ({ ...b, ctaHref: `/tienda/${tenant.slug}/c/${categories[0]?.slug || 'mujer'}` })),
        categories: categories.length ? categories : fallback.categories,
        featured: products.length ? products.slice(0, 8) : fallback.featured,
        offers: (products.filter(p => p.compareAtPrice && p.compareAtPrice > p.price).length ? products.filter(p => p.compareAtPrice && p.compareAtPrice > p.price) : fallback.offers).slice(0, 8),
      };
    }
    if (!products.length && !categories.length) return buildTemplateHome(tenant);
    const displayCategories = categories.length ? categories : buildTemplateCategories();
    const displayProducts = products.length ? products : buildTemplateProducts();
    return {
      tenant,
      banners: [{ id: 'template-banner-1', title: 'Banner principal', subtitle: 'Espacio listo para la imagen principal de tu tienda.', imageUrl: '', ctaLabel: 'Ver más', ctaHref: `/tienda/${tenant.slug}/c/${displayCategories[0]?.slug || 'categoria-1'}` }],
      categories: displayCategories,
      featured: displayProducts.slice(0, 8),
      offers: displayProducts.filter(p => p.compareAtPrice && p.compareAtPrice > p.price).slice(0, 8),
    };
  },

  async getCategoryPage(tenantSlug, categorySlug) {
    const { tenant, tenantId, isDemo } = await resolveTenant(tenantSlug);
    const categories = await fetchCategories(tenantId, isDemo);
    const products = await fetchProducts(tenantId, categories, isDemo);
    if (isDemo) {
      const fallback = getMockCategoryPage(tenantSlug, categorySlug);
      return { ...fallback, tenant };
    }
    if (!products.length && !categories.length) {
      const tplCategories = buildTemplateCategories();
      const tplProducts = buildTemplateProducts();
      const category = tplCategories.find(c => c.slug === categorySlug) || tplCategories[0] || { id: categorySlug, slug: categorySlug, name: categorySlug };
      const list = tplProducts.filter(p => p.categorySlug === category.slug);
      return { tenant, categories: tplCategories, category, products: list.length ? list : tplProducts, total: (list.length ? list : tplProducts).length };
    }
    const displayCategories = categories.length ? categories : buildTemplateCategories();
    const category = displayCategories.find(c => c.slug === categorySlug) || { id: categorySlug, slug: categorySlug, name: categorySlug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) };
    const filtered = categorySlug ? products.filter(p => p.categorySlug === category.slug) : products;
    return { tenant, categories: displayCategories, category, products: filtered, total: filtered.length };
  },

  async getProductPage(tenantSlug, productSlug) {
    const { tenant, tenantId, isDemo } = await resolveTenant(tenantSlug);
    const categories = await fetchCategories(tenantId, isDemo);
    const products = await fetchProducts(tenantId, categories, isDemo);
    if (isDemo) {
      const fallback = getMockProductPage(tenantSlug, productSlug);
      return { ...fallback, tenant };
    }
    if (!products.length && !categories.length) {
      const tplCategories = buildTemplateCategories();
      const tplProducts = buildTemplateProducts();
      const product = tplProducts.find(p => p.slug === productSlug) || tplProducts[0] || null;
      const related = product ? tplProducts.filter(p => p.categorySlug === product.categorySlug && p.id !== product.id).slice(0, 4) : [];
      return { tenant, categories: tplCategories, product: product as StoreProduct, related };
    }
    const displayCategories = categories.length ? categories : buildTemplateCategories();
    const product = products.find(p => p.slug === productSlug) || products.find(p => p.id === productSlug) || null;
    const related = product ? products.filter(p => p.categorySlug === product.categorySlug && p.id !== product.id).slice(0, 4) : [];
    return { tenant, categories: displayCategories, product: product as StoreProduct, related };
  },

  async getCategories(tenantSlug) {
    const { tenantId, isDemo } = await resolveTenant(tenantSlug);
    const categories = await fetchCategories(tenantId, isDemo);
    return categories.length ? categories : (isDemo ? getMockCategories() : buildTemplateCategories());
  },

  async search(tenantSlug, q) {
    const { tenant, tenantId, isDemo } = await resolveTenant(tenantSlug);
    const categories = await fetchCategories(tenantId, isDemo);
    const products = await fetchProducts(tenantId, categories, isDemo);
    const displayCategories = categories.length ? categories : (isDemo ? getMockCategories() : buildTemplateCategories());
    const term = q.toLowerCase().trim();
    const filtered = products.filter(p =>
      !term ||
      p.name.toLowerCase().includes(term) ||
      (p.brand || '').toLowerCase().includes(term) ||
      (p.categoryName || '').toLowerCase().includes(term) ||
      (p.description || '').toLowerCase().includes(term)
    );
    return { tenant, categories: displayCategories, products: filtered, total: filtered.length, q };
  },
};

export const storefrontService: StorefrontService = supabaseStorefrontService;
