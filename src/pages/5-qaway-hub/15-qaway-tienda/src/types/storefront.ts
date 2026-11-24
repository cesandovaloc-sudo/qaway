export interface StoreTenant {
  id: string;
  slug: string;
  name: string;
  logoUrl?: string | null;
  bannerUrl?: string | null;
  primaryColor?: string;
  accentColor?: string;
  whatsapp?: string | null;
  email?: string | null;
}

export interface StoreCategory {
  id: string;
  slug: string;
  name: string;
  imageUrl?: string | null;
  parentId?: string | null;
}

export interface StoreProduct {
  id: string;
  slug: string;
  sku?: string | null;
  name: string;
  brand?: string | null;
  description?: string | null;
  categorySlug: string;
  categoryName?: string;
  price: number;
  compareAtPrice?: number | null;
  stock: number;
  images: string[];
  variants?: { type: string; options: string[] }[];
  tags?: string[];
}

export interface StoreBanner {
  id: string;
  title: string;
  subtitle?: string;
  imageUrl: string;
  ctaLabel?: string;
  ctaHref?: string;
}

export interface StoreHomeData {
  tenant: StoreTenant;
  banners: StoreBanner[];
  categories: StoreCategory[];
  featured: StoreProduct[];
  offers: StoreProduct[];
}

export interface StoreCategoryPageData {
  tenant: StoreTenant;
  categories: StoreCategory[];
  category: StoreCategory;
  products: StoreProduct[];
  total: number;
}

export interface StoreProductPageData {
  tenant: StoreTenant;
  categories: StoreCategory[];
  product: StoreProduct | null;
  related: StoreProduct[];
}

export interface StoreSearchResult {
  tenant: StoreTenant;
  categories: StoreCategory[];
  products: StoreProduct[];
  total: number;
  q: string;
}

export interface CartItem {
  product_id: string;
  title: string;
  unit_price: number;
  quantity: number;
  product_type: 'course' | 'digital' | 'service' | 'physical';
  image_url?: string | null;
  metadata?: Record<string, unknown>;
}
