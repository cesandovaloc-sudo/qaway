import { describe, it, expect, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import ProductDetail from '@qawaylab/pago/components/storefront/ProductDetail'

function makeProduct(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    id: 'prod-1',
    name: 'Zapatillas Running Pro',
    price: 249.9,
    category: 'Calzado',
    description: 'Ideal para entrenamiento diario.',
    images: [{ processed_url: 'https://cdn.qawaylab.com/zap.jpg' }],
    facts: [
      ['Material', 'Malla transpirable'],
      ['Garantía', '1 año'],
    ],
    ...overrides,
  }
}

function renderDetail(props: Record<string, unknown> = {}) {
  const { product, ...rest } = props
  return render(
    <MemoryRouter>
      <ProductDetail product={(product as Record<string, unknown>) ?? makeProduct()} {...rest} />
    </MemoryRouter>,
  )
}

describe('ProductDetail (storefront del módulo)', () => {
  it('devuelve null sin producto', () => {
    const { container } = render(
      <MemoryRouter>
        <ProductDetail product={undefined} />
      </MemoryRouter>,
    )

    expect(container.querySelector('.section')).toBeNull()
  })

  it('renderiza la galería con 3 imágenes del producto (alt = nombre)', () => {
    const { container } = renderDetail()

    const images = container.querySelectorAll('img')
    expect(images).toHaveLength(3)
    for (const img of Array.from(images)) {
      expect(img.getAttribute('src')).toBe('https://cdn.qawaylab.com/zap.jpg')
      expect(img.getAttribute('alt')).toBe('Zapatillas Running Pro')
    }
  })

  it('sin imagen no renderiza la galería', () => {
    const { container } = renderDetail({ product: makeProduct({ images: [] }) })

    expect(container.querySelectorAll('img')).toHaveLength(0)
  })

  it('muestra breadcrumb con link Catálogo y la categoría (catalogHref custom)', () => {
    renderDetail({ catalogHref: '/remates/mi-catalogo' })

    expect(screen.getByRole('link', { name: 'Catálogo' })).toHaveAttribute(
      'href',
      '/remates/mi-catalogo',
    )
    expect(screen.getByText('/ Calzado')).toBeInTheDocument()
  })

  it('muestra nombre, categoría (eyebrow), descripción y precio formateado', () => {
    renderDetail()

    expect(screen.getByText('Zapatillas Running Pro')).toBeInTheDocument()
    expect(screen.getByText('Calzado')).toBeInTheDocument()
    expect(screen.getByText('Ideal para entrenamiento diario.')).toBeInTheDocument()
    expect(screen.getByText('S/ 249.90')).toBeInTheDocument()
  })

  it('sin descripción no la muestra', () => {
    renderDetail({ product: makeProduct({ description: null }) })

    expect(screen.queryByText('Ideal para entrenamiento diario.')).not.toBeInTheDocument()
  })

  it('selector de cantidad con opciones 1-6 y valor inicial 1', () => {
    renderDetail()

    const select = screen.getByRole('combobox')
    expect(select).toHaveValue('1')
    expect(screen.getAllByRole('option')).toHaveLength(6)
  })

  it('cambiar la cantidad y agregar llama onAddToCart con producto y cantidad', async () => {
    const user = userEvent.setup()
    const onAddToCart = vi.fn()
    renderDetail({ onAddToCart })

    await user.selectOptions(screen.getByRole('combobox'), '3')
    await user.click(screen.getByRole('button', { name: 'Agregar a mi pedido' }))

    expect(onAddToCart).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'prod-1', name: 'Zapatillas Running Pro' }),
      3,
    )
  })

  it('tras agregar muestra el aviso con link "Revisar pedido" (cartHref default y custom)', async () => {
    const user = userEvent.setup()
    const { rerender } = renderDetail({ onAddToCart: vi.fn() })

    await user.click(screen.getByRole('button', { name: 'Agregar a mi pedido' }))

    expect(screen.getByText('Producto agregado.')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Revisar pedido' })).toHaveAttribute(
      'href',
      '/carrito',
    )

    rerender(
      <MemoryRouter>
        <ProductDetail
          product={makeProduct()}
          cartHref="/mi-carrito"
          onAddToCart={vi.fn()}
        />
      </MemoryRouter>,
    )
    await user.click(screen.getByRole('button', { name: 'Agregar a mi pedido' }))
    expect(screen.getByRole('link', { name: 'Revisar pedido' })).toHaveAttribute(
      'href',
      '/mi-carrito',
    )
  })

  it('sin onAddToCart el botón no falla y aún muestra el aviso', async () => {
    const user = userEvent.setup()
    renderDetail()

    await user.click(screen.getByRole('button', { name: 'Agregar a mi pedido' }))

    expect(screen.getByText('Producto agregado.')).toBeInTheDocument()
  })

  it('renderiza los facts como label/valor', () => {
    renderDetail()

    const facts = screen.getByText('Material').closest('.facts') as HTMLElement
    expect(within(facts).getByText('Material')).toBeInTheDocument()
    expect(within(facts).getByText('Malla transpirable')).toBeInTheDocument()
    expect(within(facts).getByText('Garantía')).toBeInTheDocument()
    expect(within(facts).getByText('1 año')).toBeInTheDocument()
  })

  it('sin facts no los renderiza', () => {
    renderDetail({ product: makeProduct({ facts: [] }) })

    expect(screen.queryByText('Material')).not.toBeInTheDocument()
    expect(screen.queryByText('Garantía')).not.toBeInTheDocument()
  })

  it('normaliza el shape del inventario (name/base_price/images) y formatea el precio', () => {
    renderDetail({
      product: {
        id: 'prod-9',
        name: 'Medias Deportivas',
        base_price: 29.9,
        images: [{ original_url: 'https://cdn.qawaylab.com/medias.jpg' }],
      },
    })

    expect(screen.getByText('Medias Deportivas')).toBeInTheDocument()
    expect(screen.getByText('S/ 29.90')).toBeInTheDocument()
  })
})
