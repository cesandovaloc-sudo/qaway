import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import CartItems from '@qawaylab/pago/components/storefront/CartItems'
import type { CartItem } from '../../../contracts/commerce/v1.types'

function makeItem(overrides: Partial<CartItem> = {}): CartItem {
  return {
    product_id: 'prod-1',
    title: 'Zapatillas Running Pro',
    unit_price: 249.9,
    quantity: 2,
    product_type: 'physical',
    image_url: 'https://cdn.qawaylab.com/zap.jpg',
    ...overrides,
  }
}

describe('CartItems (storefront del módulo)', () => {
  it('renderiza cada ítem con título, precio unitario y cantidad', () => {
    render(<CartItems items={[makeItem()]} />)

    expect(screen.getByText('Zapatillas Running Pro')).toBeInTheDocument()
    expect(screen.getByText('S/ 249.90 c/u')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
  })

  it('muestra el total por línea (precio × cantidad)', () => {
    render(<CartItems items={[makeItem({ quantity: 3 })]} />)

    expect(screen.getByText('S/ 749.70')).toBeInTheDocument()
  })

  it('renderiza la imagen del ítem', () => {
    const { container } = render(<CartItems items={[makeItem()]} />)

    // el <img> es decorativo (alt=""), así que no expone rol "img"
    expect(container.querySelector('img')?.getAttribute('src')).toBe(
      'https://cdn.qawaylab.com/zap.jpg',
    )
  })

  it('usa fallbackImage cuando el ítem no trae imagen', () => {
    const { container } = render(
      <CartItems
        items={[makeItem({ image_url: null })]}
        fallbackImage="https://cdn.qawaylab.com/fallback.jpg"
      />,
    )

    expect(container.querySelector('img')?.getAttribute('src')).toBe(
      'https://cdn.qawaylab.com/fallback.jpg',
    )
  })

  it('no renderiza imagen sin image_url ni fallback', () => {
    const { container } = render(<CartItems items={[makeItem({ image_url: null })]} />)

    expect(container.querySelector('img')).toBeNull()
  })

  it('muestra la categoría como brand cuando existe', () => {
    render(<CartItems items={[{ ...makeItem(), category: 'Ropa' }]} />)

    expect(screen.getByText('Ropa')).toBeInTheDocument()
  })

  it('los botones de cantidad llaman onUpdateQuantity con el id y la cantidad ±1', async () => {
    const user = userEvent.setup()
    const onUpdateQuantity = vi.fn()
    render(
      <CartItems
        items={[makeItem()]}
        onUpdateQuantity={onUpdateQuantity}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Sumar uno' }))
    expect(onUpdateQuantity).toHaveBeenCalledWith('prod-1', 3)

    await user.click(screen.getByRole('button', { name: 'Restar uno' }))
    expect(onUpdateQuantity).toHaveBeenCalledWith('prod-1', 1)
  })

  it('onRemove muestra el botón Retirar y lo invoca con el id', async () => {
    const user = userEvent.setup()
    const onRemove = vi.fn()
    render(<CartItems items={[makeItem()]} onRemove={onRemove} />)

    await user.click(screen.getByRole('button', { name: 'Retirar' }))
    expect(onRemove).toHaveBeenCalledWith('prod-1')
  })

  it('sin onRemove no se muestra el botón Retirar', () => {
    render(<CartItems items={[makeItem()]} />)

    expect(screen.queryByRole('button', { name: 'Retirar' })).not.toBeInTheDocument()
  })

  it('normaliza ítems con el shape del inventario (product_id/name/base_price)', () => {
    render(
      <CartItems
        items={[
          {
            product_id: 'prod-9',
            name: 'Medias Deportivas',
            base_price: 29.9,
            quantity: 1,
            product_type: 'physical',
          },
        ]}
      />,
    )

    expect(screen.getByText('Medias Deportivas')).toBeInTheDocument()
    expect(screen.getByText('S/ 29.90 c/u')).toBeInTheDocument()
  })

  it('no se rompe con items vacíos', () => {
    const { container } = render(<CartItems items={[]} />)

    expect(container.querySelector('.cart-item')).toBeNull()
  })
})
