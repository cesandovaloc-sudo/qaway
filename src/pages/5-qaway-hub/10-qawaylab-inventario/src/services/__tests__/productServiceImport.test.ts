import { describe, it, expect, vi, afterEach } from 'vitest'
import { productService, setProductAdapter } from '../productService'
import { supabaseProductAdapter } from '../adapters/supabaseProductAdapter'

describe('productService.createProducts (importación Excel)', () => {
  afterEach(() => {
    // Restaurar el adapter real para no afectar otros tests del archivo
    setProductAdapter(supabaseProductAdapter)
  })

  it('genera SKU y slug faltantes y devuelve la cantidad insertada', async () => {
    const createProducts = vi.fn().mockResolvedValue([{ id: 'prod-1' }, { id: 'prod-2' }])
    setProductAdapter({ createProducts } as unknown as typeof supabaseProductAdapter)

    const count = await productService.createProducts([
      { name: 'Zapatillas Running Pro', base_price: 249.9 },
      { name: 'Medias Deportivas', sku: 'MED-002', base_price: 29.9 },
    ])

    expect(count).toBe(2)
    expect(createProducts).toHaveBeenCalledWith([
      expect.objectContaining({
        name: 'Zapatillas Running Pro',
        base_price: 249.9,
        slug: 'zapatillas-running-pro',
        sku: expect.stringMatching(/^ZRP-/),
      }),
      expect.objectContaining({
        name: 'Medias Deportivas',
        sku: 'MED-002',
        slug: 'medias-deportivas-1',
      }),
    ])
  })

  it('respeta el slug existente y no genera SKU cuando ya viene', async () => {
    const createProducts = vi.fn().mockResolvedValue([{ id: 'prod-1' }])
    setProductAdapter({ createProducts } as unknown as typeof supabaseProductAdapter)

    await productService.createProducts([
      { name: 'Curso Notion', slug: 'curso-notion', sku: 'SKU-1' },
    ])

    expect(createProducts).toHaveBeenCalledWith([
      expect.objectContaining({ name: 'Curso Notion', slug: 'curso-notion', sku: 'SKU-1' }),
    ])
  })

  it('devuelve 0 cuando el adapter no inserta nada', async () => {
    const createProducts = vi.fn().mockResolvedValue([])
    setProductAdapter({ createProducts } as unknown as typeof supabaseProductAdapter)

    const count = await productService.createProducts([{ name: 'Solo' }])

    expect(count).toBe(0)
  })

  it('slugs sin acentos para nombres con tildes', async () => {
    const createProducts = vi.fn().mockResolvedValue([{ id: 'prod-1' }])
    setProductAdapter({ createProducts } as unknown as typeof supabaseProductAdapter)

    await productService.createProducts([{ name: 'Zapatillas de Cuero Auténtico' }])

    expect(createProducts).toHaveBeenCalledWith([
      expect.objectContaining({ slug: 'zapatillas-de-cuero-autentico' }),
    ])
  })
})
