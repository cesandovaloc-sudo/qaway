import { describe, it, expect, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import CartView from '@qawaylab/pago/components/storefront/CartView'
import type { CartItem } from '../../../contracts/commerce/v1.types'

function makeItem(overrides: Partial<CartItem> = {}): CartItem {
  return {
    product_id: 'prod-1',
    title: 'Zapatillas Running Pro',
    unit_price: 249.9,
    quantity: 2,
    product_type: 'physical',
    ...overrides,
  }
}

function renderCartView(props: Record<string, unknown> = {}) {
  return render(
    <MemoryRouter initialEntries={['/carrito']}>
      <CartView {...props} />
    </MemoryRouter>,
  )
}

describe('CartView (storefront del módulo)', () => {
  it('estado vacío: muestra "Tu pedido está vacío" y link al catálogo por defecto', () => {
    renderCartView()

    expect(screen.getByText('Tu pedido está vacío')).toBeInTheDocument()
    const link = screen.getByRole('link', { name: 'Ver catálogo' })
    expect(link).toHaveAttribute('href', '/')
  })

  it('estado vacío: respeta emptyHref custom', () => {
    renderCartView({ emptyHref: '/remates/mi-catalogo' })

    expect(screen.getByRole('link', { name: 'Ver catálogo' })).toHaveAttribute(
      'href',
      '/remates/mi-catalogo',
    )
  })

  it('con ítems renderiza la lista y el resumen con el CTA por defecto', () => {
    renderCartView({ items: [makeItem()] })

    expect(screen.getByText('Zapatillas Running Pro')).toBeInTheDocument()
    expect(screen.getByText('Resumen')).toBeInTheDocument()
    expect(screen.getByText('Productos')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Continuar con el pedido' })).toHaveAttribute(
      'href',
      '/checkout',
    )
  })

  it('el CTA por defecto respeta checkoutHref custom', () => {
    renderCartView({ items: [makeItem()], checkoutHref: '/finalizar' })

    expect(screen.getByRole('link', { name: 'Continuar con el pedido' })).toHaveAttribute(
      'href',
      '/finalizar',
    )
  })

  it('action custom reemplaza el CTA por defecto', () => {
    renderCartView({
      items: [makeItem()],
      action: <button>Pagar ahora</button>,
    })

    expect(screen.getByRole('button', { name: 'Pagar ahora' })).toBeInTheDocument()
    expect(
      screen.queryByRole('link', { name: 'Continuar con el pedido' }),
    ).not.toBeInTheDocument()
  })

  it('usa count y subtotal explícitos en el resumen cuando vienen', () => {
    renderCartView({ items: [makeItem()], count: 9, subtotal: 999.5 })

    const summary = screen.getByText('Resumen').closest('.order-summary') as HTMLElement
    expect(within(summary).getByText('9')).toBeInTheDocument()
    expect(within(summary).getByText('S/ 999.50')).toBeInTheDocument()
  })

  it('calcula count y subtotal de los items cuando no vienen', () => {
    renderCartView({ items: [makeItem(), makeItem({ product_id: 'prod-2', quantity: 1 })] })

    const summary = screen.getByText('Resumen').closest('.order-summary') as HTMLElement
    // 2 + 1 = 3 productos; 2×249.90 + 1×249.90 = 749.70
    expect(within(summary).getByText('3')).toBeInTheDocument()
    expect(within(summary).getByText('S/ 749.70')).toBeInTheDocument()
  })

  it('muestra el encabezado con eyebrow, title y copy (defaults y custom)', () => {
    const { rerender } = renderCartView()
    expect(screen.getByText('Compra')).toBeInTheDocument()
    expect(screen.getByText('Mi pedido.')).toBeInTheDocument()

    rerender(
      <MemoryRouter initialEntries={['/carrito']}>
        <CartView eyebrow="Checkout" title="Revisa tu compra." copy="Último paso." />
      </MemoryRouter>,
    )
    expect(screen.getByText('Checkout')).toBeInTheDocument()
    expect(screen.getByText('Revisa tu compra.')).toBeInTheDocument()
    expect(screen.getByText('Último paso.')).toBeInTheDocument()
  })

  it('propaga onUpdateQuantity y onRemove a los ítems', async () => {
    const user = userEvent.setup()
    const onUpdateQuantity = vi.fn()
    const onRemove = vi.fn()
    renderCartView({ items: [makeItem()], onUpdateQuantity, onRemove })

    await user.click(screen.getByRole('button', { name: 'Sumar uno' }))
    expect(onUpdateQuantity).toHaveBeenCalledWith('prod-1', 3)

    await user.click(screen.getByRole('button', { name: 'Retirar' }))
    expect(onRemove).toHaveBeenCalledWith('prod-1')
  })

  it('propaga fallbackImage a ítems sin imagen', () => {
    const { container } = renderCartView({
      items: [makeItem({ image_url: null })],
      fallbackImage: 'https://cdn.qawaylab.com/fallback.jpg',
    })

    expect(container.querySelector('img')?.getAttribute('src')).toBe(
      'https://cdn.qawaylab.com/fallback.jpg',
    )
  })
})
