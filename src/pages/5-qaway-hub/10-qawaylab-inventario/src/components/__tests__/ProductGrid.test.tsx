import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import ProductGrid from '@qawaylab/pago/components/storefront/ProductGrid'

function makeProduct(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    id: 'prod-1',
    name: 'Zapatillas Running Pro',
    price: 249.9,
    slug: 'zapatillas-running-pro',
    ...overrides,
  }
}

function renderGrid(props: Record<string, unknown> = {}) {
  return render(
    <MemoryRouter>
      <ProductGrid {...props} />
    </MemoryRouter>,
  )
}

describe('ProductGrid (storefront del módulo)', () => {
  it('renderiza una ProductCard por producto', () => {
    renderGrid({
      products: [
        makeProduct(),
        makeProduct({ id: 'prod-2', name: 'Medias Deportivas', price: 29.9 }),
      ],
    })

    expect(screen.getByText('Zapatillas Running Pro')).toBeInTheDocument()
    expect(screen.getByText('Medias Deportivas')).toBeInTheDocument()
    expect(screen.getByText('S/ 249.90')).toBeInTheDocument()
    expect(screen.getByText('S/ 29.90')).toBeInTheDocument()
  })

  it('cada tarjeta conserva su propio link de detalle por slug', () => {
    renderGrid({
      products: [makeProduct(), makeProduct({ id: 'prod-2', name: 'Medias', slug: 'medias' })],
    })

    const links = screen.getAllByRole('link', { name: 'Ver producto' })
    expect(links).toHaveLength(2)
    expect(links[0]).toHaveAttribute('href', '/producto/zapatillas-running-pro')
    expect(links[1]).toHaveAttribute('href', '/producto/medias')
  })

  it('no se rompe con products vacío', () => {
    const { container } = renderGrid({ products: [] })

    expect(container.querySelector('.product-card')).toBeNull()
  })

  it('renderCard custom reemplaza las tarjetas por defecto', () => {
    renderGrid({
      products: [makeProduct()],
      renderCard: (product: Record<string, unknown>) => (
        <div data-testid="card-custom">{String(product.name)} (custom)</div>
      ),
    })

    expect(screen.getByText('Zapatillas Running Pro (custom)')).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Ver producto' })).not.toBeInTheDocument()
  })
})
