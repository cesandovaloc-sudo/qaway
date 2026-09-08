import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import OrderSummary from '@qawaylab/pago/components/storefront/OrderSummary'
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

describe('OrderSummary (storefront del módulo)', () => {
  it('muestra una fila por ítem con cantidad × título y el total de línea', () => {
    render(<OrderSummary items={[makeItem(), makeItem({ product_id: 'prod-2', title: 'Medias', unit_price: 29.9, quantity: 1 })]} />)

    expect(screen.getByText('2 × Zapatillas Running Pro')).toBeInTheDocument()
    expect(screen.getByText('S/ 499.80')).toBeInTheDocument()
    expect(screen.getByText('1 × Medias')).toBeInTheDocument()
    expect(screen.getByText('S/ 29.90')).toBeInTheDocument()
  })

  it('muestra Productos con la suma de cantidades de los ítems', () => {
    render(<OrderSummary items={[makeItem(), makeItem({ product_id: 'prod-2', quantity: 3 })]} />)

    expect(screen.getByText('Productos')).toBeInTheDocument()
    expect(screen.getByText('5')).toBeInTheDocument()
  })

  it('calcula el Subtotal a partir de los ítems y lo formatea con S/ y 2 decimales', () => {
    render(<OrderSummary items={[makeItem()]} />)

    // Con un solo ítem, el total de línea y el subtotal coinciden: scope por fila
    const subtotalRow = screen.getByText('Subtotal').closest('.summary-row') as HTMLElement
    expect(subtotalRow).toHaveTextContent('S/ 499.80')
  })

  it('respeta count y subtotal explícitos en vez de recalcularlos', () => {
    render(<OrderSummary items={[makeItem()]} count={9} subtotal={999.5} />)

    expect(screen.getByText('9')).toBeInTheDocument()
    expect(screen.getByText('S/ 999.50')).toBeInTheDocument()
    // Las filas de ítems siguen calculándose de items
    expect(screen.getByText('2 × Zapatillas Running Pro')).toBeInTheDocument()
  })

  it('usa los defaults de delivery y permite valores custom', () => {
    const { rerender } = render(<OrderSummary items={[makeItem()]} />)

    expect(screen.getByText('Delivery / Acceso')).toBeInTheDocument()
    expect(screen.getByText('Gratis')).toBeInTheDocument()

    rerender(
      <OrderSummary
        items={[makeItem()]}
        deliveryLabel="Envío a domicilio"
        deliveryValue="S/ 15.00"
      />,
    )

    expect(screen.getByText('Envío a domicilio')).toBeInTheDocument()
    expect(screen.getByText('S/ 15.00')).toBeInTheDocument()
  })

  it('muestra la nota por defecto y permite customizarla', () => {
    const { rerender } = render(<OrderSummary items={[makeItem()]} />)

    expect(
      screen.getByText('Puedes elegir el beneficio de descuento o soporte al completar tu pedido.'),
    ).toBeInTheDocument()

    rerender(<OrderSummary items={[makeItem()]} note="Nota personalizada" />)
    expect(screen.getByText('Nota personalizada')).toBeInTheDocument()
  })

  it('renderiza la acción (CTA) provista', () => {
    render(
      <OrderSummary items={[makeItem()]} action={<button>Pagar ahora</button>} />,
    )

    expect(screen.getByRole('button', { name: 'Pagar ahora' })).toBeInTheDocument()
  })

  it('no se rompe sin ítems (Productos 0 y Subtotal S/ 0.00)', () => {
    render(<OrderSummary items={[]} />)

    expect(screen.getByText('Productos')).toBeInTheDocument()
    expect(screen.getByText('0')).toBeInTheDocument()
    expect(screen.getByText('S/ 0.00')).toBeInTheDocument()
  })

  it('formatea precios inválidos como S/ 0.00 en lugar de romper', () => {
    render(<OrderSummary items={[makeItem({ unit_price: NaN })]} />)

    // Fila del ítem y subtotal se muestran como S/ 0.00 sin romper
    expect(screen.getAllByText('S/ 0.00')).toHaveLength(2)
  })
})
