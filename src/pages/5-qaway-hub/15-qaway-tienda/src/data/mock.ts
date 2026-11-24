import type { StoreCategory, StoreHomeData, StoreProduct, StoreTenant } from '../types/storefront';

const tenant: StoreTenant = {
  id: 'tenant-demo',
  slug: 'demo',
  name: 'Qaway Store',
  logoUrl: null,
  bannerUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600&h=700&fit=crop&auto=format',
  primaryColor: '#1e364b',
  accentColor: '#16a34a',
  whatsapp: '51999999999',
  email: 'tienda@qawaylab.com',
};

const categories: StoreCategory[] = [
  { id: 'c1', slug: 'mujer', name: 'Mujer', imageUrl: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&h=400&fit=crop&auto=format' },
  { id: 'c2', slug: 'hombre', name: 'Hombre', imageUrl: 'https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?w=400&h=400&fit=crop&auto=format' },
  { id: 'c3', slug: 'accesorios', name: 'Accesorios', imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop&auto=format' },
  { id: 'c4', slug: 'calzado', name: 'Calzado', imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop&auto=format' },
];

const img = (u: string) => `https://images.unsplash.com/${u}?w=900&h=1100&fit=crop&auto=format`;

const products: StoreProduct[] = [
  { id: 'p1', slug: 'casaca-urbana', sku: 'QW-001', name: 'Casaca Urbana', brand: 'Qaway Basics', description: 'Casaca ligera con acabado premium, ideal para uso diario. Corte moderno, bolsillos funcionales y forro suave.', categorySlug: 'mujer', categoryName: 'Mujer', price: 149.9, compareAtPrice: 199.9, stock: 12, images: [img('photo-1591047139829-d91aecb6caea'), img('photo-1544022613-e87ca75a784a'), img('photo-1551028719-00167b16eac5')], variants: [{ type: 'Talla', options: ['S', 'M', 'L', 'XL'] }] },
  { id: 'p2', slug: 'vestido-essential', sku: 'QW-002', name: 'Vestido Essential', brand: 'Qaway Basics', description: 'Vestido de corte limpio con tela suave y caída natural. Perfecto para oficina o salida casual.', categorySlug: 'mujer', categoryName: 'Mujer', price: 129.9, compareAtPrice: 169.9, stock: 8, images: [img('photo-1496747611176-843222e1e57c'), img('photo-1539008835657-9e8e9680c956'), img('photo-1515372039744-b8f02a3ae446')], variants: [{ type: 'Talla', options: ['S', 'M', 'L'] }] },
  { id: 'p3', slug: 'blusa-lino', sku: 'QW-003', name: 'Blusa de Lino', brand: 'Nova Line', description: 'Blusa fresca de lino con silueta relajada y botones frontales.', categorySlug: 'mujer', categoryName: 'Mujer', price: 99.9, compareAtPrice: 129.9, stock: 14, images: [img('photo-1564257631407-4deb1f99d992'), img('photo-1485968579580-b6d095142e6e')], variants: [{ type: 'Talla', options: ['S', 'M', 'L'] }] },
  { id: 'p4', slug: 'pantalon-wide', sku: 'QW-004', name: 'Pantalón Wide Leg', brand: 'Nova Line', description: 'Pantalón de pierna ancha con tiro alto y caída elegante.', categorySlug: 'mujer', categoryName: 'Mujer', price: 119.9, compareAtPrice: null, stock: 10, images: [img('photo-1509631179647-0177331693ae'), img('photo-1475181649798-7398303e89d5')], variants: [{ type: 'Talla', options: ['26', '28', '30', '32'] }] },
  { id: 'p5', slug: 'abrigo-classic', sku: 'QW-005', name: 'Abrigo Classic', brand: 'Qaway Basics', description: 'Abrigo estructurado con acabado premium para temporada fría.', categorySlug: 'mujer', categoryName: 'Mujer', price: 259.9, compareAtPrice: 329.9, stock: 5, images: [img('photo-1539533018447-63fcce2678e3'), img('photo-1548624149-f9b1859aa7d0'), img('photo-1520975954732-35dd22299614')], variants: [{ type: 'Talla', options: ['S', 'M', 'L'] }] },

  { id: 'p6', slug: 'polera-minimal', sku: 'QW-006', name: 'Polera Minimal', brand: 'Qaway Studio', description: 'Polera de algodón con diseño minimalista y corte regular.', categorySlug: 'hombre', categoryName: 'Hombre', price: 89.9, compareAtPrice: null, stock: 20, images: [img('photo-1521572163474-6864f9cf17ab'), img('photo-1583743814966-8936f5b7be1a'), img('photo-1562157873-818bc0726f68')], variants: [{ type: 'Talla', options: ['S', 'M', 'L', 'XL'] }] },
  { id: 'p7', slug: 'camisa-lino', sku: 'QW-007', name: 'Camisa Lino', brand: 'Qaway Basics', description: 'Camisa de lino fresca y elegante para clima cálido.', categorySlug: 'hombre', categoryName: 'Hombre', price: 119.9, compareAtPrice: 149.9, stock: 9, images: [img('photo-1596755094514-f87e34085b2c'), img('photo-1594938298603-c8148c4dae35')], variants: [{ type: 'Talla', options: ['S', 'M', 'L', 'XL'] }] },
  { id: 'p8', slug: 'chaqueta-denim', sku: 'QW-008', name: 'Chaqueta Denim', brand: 'Urban Form', description: 'Chaqueta denim clásica con lavado medio y bolsillos frontales.', categorySlug: 'hombre', categoryName: 'Hombre', price: 169.9, compareAtPrice: 219.9, stock: 11, images: [img('photo-1495105787522-5334e3ffa0ef'), img('photo-1516257984-b1b4d707412e')], variants: [{ type: 'Talla', options: ['S', 'M', 'L', 'XL'] }] },
  { id: 'p9', slug: 'pantalon-chino', sku: 'QW-009', name: 'Pantalón Chino', brand: 'Urban Form', description: 'Pantalón chino versátil, cómodo y fácil de combinar.', categorySlug: 'hombre', categoryName: 'Hombre', price: 109.9, compareAtPrice: null, stock: 16, images: [img('photo-1473966968600-fa801b869a1a'), img('photo-1624378439575-d8705ad7ae80')], variants: [{ type: 'Talla', options: ['30', '32', '34', '36'] }] },
  { id: 'p10', slug: 'hoodie-essential', sku: 'QW-010', name: 'Hoodie Essential', brand: 'Qaway Studio', description: 'Hoodie de algodón suave con capucha y bolsillo frontal.', categorySlug: 'hombre', categoryName: 'Hombre', price: 139.9, compareAtPrice: 169.9, stock: 13, images: [img('photo-1556821840-3a63f95609a7'), img('photo-1578768079052-aa76e52ff62e')], variants: [{ type: 'Talla', options: ['S', 'M', 'L', 'XL'] }] },

  { id: 'p11', slug: 'reloj-classic', sku: 'QW-011', name: 'Reloj Classic', brand: 'Qaway Time', description: 'Reloj de diseño clásico con correa de cuero y esfera limpia.', categorySlug: 'accesorios', categoryName: 'Accesorios', price: 249.9, compareAtPrice: 299.9, stock: 5, images: [img('photo-1523275335684-37898b6baf30'), img('photo-1524592094714-0f0654e20314'), img('photo-1522312346375-d1a52e2b99b3')], variants: [{ type: 'Color', options: ['Negro', 'Marrón'] }] },
  { id: 'p12', slug: 'mochila-essential', sku: 'QW-012', name: 'Mochila Essential', brand: 'Qaway Studio', description: 'Mochila funcional con compartimentos organizados para el día a día.', categorySlug: 'accesorios', categoryName: 'Accesorios', price: 159.9, compareAtPrice: null, stock: 10, images: [img('photo-1547949003-9792a18a2601'), img('photo-1553062407-98eeb64c6a62'), img('photo-1622560480605-d83c853bc5c3')], variants: [{ type: 'Color', options: ['Negro', 'Arena'] }] },
  { id: 'p13', slug: 'cartera-city', sku: 'QW-013', name: 'Cartera City', brand: 'Qaway Studio', description: 'Cartera compacta con diseño urbano y acabados metálicos.', categorySlug: 'accesorios', categoryName: 'Accesorios', price: 139.9, compareAtPrice: 179.9, stock: 7, images: [img('photo-1584917865442-de89df76afd3'), img('photo-1566150905458-1bf1fc113f0d')], variants: [{ type: 'Color', options: ['Beige', 'Negro'] }] },
  { id: 'p14', slug: 'lentes-urban', sku: 'QW-014', name: 'Lentes Urban', brand: 'Nova Line', description: 'Lentes de sol con protección UV y marco liviano.', categorySlug: 'accesorios', categoryName: 'Accesorios', price: 79.9, compareAtPrice: 99.9, stock: 18, images: [img('photo-1572635196237-14b3f281503f'), img('photo-1511499767150-a48a237f0083')], variants: [{ type: 'Color', options: ['Negro', 'Carey'] }] },
  { id: 'p15', slug: 'cinturon-leather', sku: 'QW-015', name: 'Cinturón Leather', brand: 'Qaway Time', description: 'Cinturón de cuero con hebilla metálica minimalista.', categorySlug: 'accesorios', categoryName: 'Accesorios', price: 69.9, compareAtPrice: null, stock: 22, images: [img('photo-1624222247344-550fb60583dc'), img('photo-1553062407-98eeb64c6a62')], variants: [{ type: 'Talla', options: ['S', 'M', 'L'] }] },

  { id: 'p16', slug: 'zapatilla-urban', sku: 'QW-016', name: 'Zapatilla Urban', brand: 'Qaway Move', description: 'Zapatilla urbana cómoda para todo el día, suela liviana y diseño versátil.', categorySlug: 'calzado', categoryName: 'Calzado', price: 189.9, compareAtPrice: 229.9, stock: 15, images: [img('photo-1542291026-7eec264c27ff'), img('photo-1606107557195-0e29a4b5b4aa'), img('photo-1525966222134-fcfa99b8ae77')], variants: [{ type: 'Talla', options: ['38', '39', '40', '41', '42'] }] },
  { id: 'p17', slug: 'sneaker-blanca', sku: 'QW-017', name: 'Sneaker Blanca', brand: 'Qaway Move', description: 'Sneaker blanca de cuero sintético, fácil de combinar.', categorySlug: 'calzado', categoryName: 'Calzado', price: 169.9, compareAtPrice: 199.9, stock: 12, images: [img('photo-1549298916-b41d501d3772'), img('photo-1512374382149-233c42b6a83b')], variants: [{ type: 'Talla', options: ['38', '39', '40', '41', '42'] }] },
  { id: 'p18', slug: 'botin-city', sku: 'QW-018', name: 'Botín City', brand: 'Urban Form', description: 'Botín urbano con suela robusta y acabado mate.', categorySlug: 'calzado', categoryName: 'Calzado', price: 219.9, compareAtPrice: 259.9, stock: 6, images: [img('photo-1520639888713-7851133b1ed0'), img('photo-1608256246200-53e635b5b65f')], variants: [{ type: 'Talla', options: ['39', '40', '41', '42'] }] },
  { id: 'p19', slug: 'sandalia-soft', sku: 'QW-019', name: 'Sandalia Soft', brand: 'Nova Line', description: 'Sandalia cómoda con plantilla suave y diseño minimalista.', categorySlug: 'calzado', categoryName: 'Calzado', price: 99.9, compareAtPrice: null, stock: 17, images: [img('photo-1562273138-f46be4ebdf33'), img('photo-1603487742131-4160ec999306')], variants: [{ type: 'Talla', options: ['35', '36', '37', '38', '39'] }] },
  { id: 'p20', slug: 'loafer-premium', sku: 'QW-020', name: 'Loafer Premium', brand: 'Qaway Basics', description: 'Loafer elegante para looks formales y smart casual.', categorySlug: 'calzado', categoryName: 'Calzado', price: 199.9, compareAtPrice: 239.9, stock: 8, images: [img('photo-1614252235316-8c857d38b5f4'), img('photo-1533867617858-e7b97e060509')], variants: [{ type: 'Talla', options: ['39', '40', '41', '42'] }] },
];

export function getMockTenant(slug: string): StoreTenant {
  return { ...tenant, slug: slug || tenant.slug, name: slug && slug !== 'demo' ? slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : tenant.name };
}
export function getMockCategories() { return categories; }
export function getMockProducts() { return products; }
export function getMockHome(slug: string): StoreHomeData {
  const featured = [products[0], products[5], products[10], products[15], products[1], products[7], products[11], products[16]];
  const offers = products.filter(p => p.compareAtPrice).slice(0, 8);
  return {
    tenant: getMockTenant(slug),
    banners: [
      { id: 'b1', title: 'Nueva colección', subtitle: 'Piezas esenciales con diseño limpio y calidad premium.', imageUrl: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1600&h=800&fit=crop&auto=format', ctaLabel: 'Comprar ahora', ctaHref: `/tienda/${slug}/c/mujer` },
    ],
    categories,
    featured,
    offers,
  };
}
export function getMockCategoryPage(slug: string, categorySlug: string) {
  const cat = categories.find(c => c.slug === categorySlug) || categories[0];
  const list = products.filter(p => p.categorySlug === cat.slug);
  return { tenant: getMockTenant(slug), categories, category: cat, products: list.length ? list : products, total: (list.length ? list : products).length };
}
export function getMockProductPage(slug: string, productSlug: string) {
  const product = products.find(p => p.slug === productSlug) || products[0];
  const related = products.filter(p => p.categorySlug === product.categorySlug && p.id !== product.id).slice(0, 4);
  return { tenant: getMockTenant(slug), categories, product, related: related.length ? related : products.filter(p => p.id !== product.id).slice(0, 4) };
}
