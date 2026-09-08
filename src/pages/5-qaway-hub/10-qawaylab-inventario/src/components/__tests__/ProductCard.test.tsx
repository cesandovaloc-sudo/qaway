import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import ProductCard from '@qawaylab/pago/components/storefront/ProductCard'

function makeProduct(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    id: 'prod-1',
    name: 'Zapatillas Running Pro',
    price: 249.9,
    category: 'Calzado',
    description: 'Ideal para entrenamiento diario.',
    slug: 'zapatillas-running-pro',
    images: [{ processed_url: 'https://cdn.qawaylab.com/zap.jpg' }],
    ...overrides,
  }
}

function renderCard(props: Record<string, unknown> = {}) {
  const { product, ...rest } = props
  return render(
    <MemoryRouter>
      <ProductCard product={(product as Record<string, unknown>) ?? makeProduct()} {...rest} />
    </MemoryRouter>,
  )
}

describe('ProductCard (storefront del módulo)', () => {
  it('renderiza nombre, categoría, descripción y precio formateado', () => {
    renderCard()

    expect(screen.getByText('Zapatillas Running Pro')).toBeInTheDocument()
    expect(screen.getByText('Calzado')).toBeInTheDocument()
    expect(screen.getByText('Ideal para entrenamiento diario.')).toBeInTheDocument()
    expect(screen.getByText('S/ 249.90')).toBeInTheDocument()
  })

  it('renderiza la imagen con alt igual al nombre del producto', () => {
    renderCard()

    const img = screen.getByRole('img')
    expect(img).toHaveAttribute('src', 'https://cdn.qawaylab.com/zap.jpg')
    expect(img).toHaveAttribute('alt', 'Zapatillas Running Pro')
  })

  it('con slug genera el link "Ver producto" a /producto/:slug', () => {
    renderCard()

    expect(screen.getByRole('link', { name: 'Ver producto' })).toHaveAttribute(
      'href',
      '/producto/zapatillas-running-pro',
    )
  })

  it('detailHref custom gana sobre el slug', () => {
    renderCard({ detailHref: '/remates/mi-catalogo/123' })

    expect(screen.getByRole('link', { name: 'Ver producto' })).toHaveAttribute(
      'href',
      '/remates/mi-catalogo/123',
    )
  })

  it('sin slug ni detailHref no muestra el CTA', () => {
    renderCard({ product: makeProduct({ slug: null }) })

    expect(screen.queryByRole('link', { name: 'Ver producto' })).not.toBeInTheDocument()
  })

  it('action custom reemplaza el CTA por defecto', () => {
    renderCard({ action: <button>Agregar al carrito</button> })

    expect(screen.getByRole('button', { name: 'Agregar al carrito' })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Ver producto' })).not.toBeInTheDocument()
  })

  it('sin categoría ni descripción no los renderiza', () => {
    renderCard({
      product: makeProduct({ category: '', description: null, slug: 'solo-precio' }),
    })

    expect(screen.queryByText('Calzado')).not.toBeInTheDocument()
    expect(screen.queryByText('Ideal para entrenamiento diario.')).not.toBeInTheDocument()
  })

  it('normaliza el shape del inventario (name/base_price/images)', () => {
    renderCard({
      product: {
        id: 'prod-9',
        name: 'Medias Deportivas',
        base_price: 29.9,
        images: [{ original_url: 'https://cdn.qawaylab.com/medias.jpg' }],
      },
    })

    expect(screen.getByText('Medias Deportivas')).toBeInTheDocument()
    expect(screen.getByText('S/ 29.90')).toBeInTheDocument()
    expect(screen.getByRole('img')).toHaveAttribute(
      'src',
      'https://cdn.qawaylab.com/medias.jpg',
    )
  })

  it('sin imagen no renderiza <img>', () => {
    const { container } = renderCard({ product: makeProduct({ images: [] }) })

    expect(container.querySelector('img')).toBeNull()
  })

  it('formatea precios inválidos como S/ 0.00', () => {
    renderCard({ product: makeProduct({ price: null, base_price: null }) })

    expect(screen.getByText('S/ 0.00')).toBeInTheDocument()
  })
})
