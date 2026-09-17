import { useState, useEffect } from 'react'
import { supabase } from '@/config/supabase'

export const CORAVET_TENANT_ID = '06bacf31-6699-4ef5-9843-e58b835c6b2b'

export interface CoraVetProduct {
  id: string
  name: string
  price: number
  category: string
  image_url?: string | null
  slug?: string
  description?: string | null
}

export const FALLBACK_PRODUCTS: CoraVetProduct[] = [
  {
    id: 'cv-1',
    name: 'Royal Canin Adulto',
    price: 89.90,
    category: 'Alimentos',
    image_url: 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?auto=format&fit=crop&w=600&q=80',
    slug: 'royal-canin-adulto',
  },
  {
    id: 'cv-2',
    name: 'Bravecto Antipulgas',
    price: 159.90,
    category: 'Medicamentos',
    image_url: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80',
    slug: 'bravecto-antipulgas',
  },
  {
    id: 'cv-3',
    name: 'Shampoo Dermocare',
    price: 69.90,
    category: 'Higiene y cuidado',
    image_url: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=600&q=80',
    slug: 'shampoo-dermocare',
  },
  {
    id: 'cv-4',
    name: 'Cama Premium Confort',
    price: 149.90,
    category: 'Accesorios',
    image_url: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&w=600&q=80',
    slug: 'cama-premium-confort',
  },
  {
    id: 'cv-5',
    name: 'Pelota Interactiva Mordedera',
    price: 35.00,
    category: 'Juguetes',
    image_url: 'https://images.unsplash.com/photo-1576201836106-db1758fd1c97?auto=format&fit=crop&w=600&q=80',
    slug: 'pelota-interactiva',
  },
  {
    id: 'cv-6',
    name: 'Pack Nutrición + Protección',
    price: 219.00,
    category: 'Promociones',
    image_url: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=600&q=80',
    slug: 'pack-nutricion-proteccion',
  },
]

/**
 * Consulta de productos de CoraVet directamente aislados por tenant_id
 */
export async function fetchCoraVetProducts(): Promise<CoraVetProduct[]> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('id, name, price, category, image_url, slug, description')
      .eq('tenant_id', CORAVET_TENANT_ID)
      .eq('status', 'active')
      .order('created_at', { ascending: true })

    if (error || !data || data.length === 0) {
      return FALLBACK_PRODUCTS
    }

    return data.map((item) => ({
      id: item.id,
      name: item.name,
      price: Number(item.price) || 0,
      category: item.category || 'General',
      image_url: item.image_url,
      slug: item.slug,
      description: item.description,
    }))
  } catch {
    return FALLBACK_PRODUCTS
  }
}

/**
 * Hook de React con estrategia Stale-While-Revalidate:
 * 1. Inicializa inmediatamente con FALLBACK_PRODUCTS (render instantáneo a 0ms).
 * 2. En segundo plano consulta Supabase y actualiza de forma transparente.
 */
export function useCoraVetProducts() {
  const [products, setProducts] = useState<CoraVetProduct[]>(FALLBACK_PRODUCTS)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let isMounted = true

    async function load() {
      setLoading(true)
      const freshProducts = await fetchCoraVetProducts()
      if (isMounted) {
        setProducts(freshProducts)
        setLoading(false)
      }
    }

    load()

    return () => {
      isMounted = false
    }
  }, [])

  return { products, loading }
}
