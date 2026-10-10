import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Package } from 'lucide-react'
import { StatCard } from '../dashboard/StatCard'

describe('StatCard', () => {
  it('should render with label and value', () => {
    render(
      <StatCard
        label="Productos"
        value={42}
        icon={Package}
        color="text-orange-600"
      />
    )

    expect(screen.getByText('Productos')).toBeInTheDocument()
    expect(screen.getByText('42')).toBeInTheDocument()
  })

  it('should render with string value', () => {
    render(
      <StatCard
        label="Valor"
        value="S/ 1,000"
        icon={Package}
        color="text-green-600"
      />
    )

    expect(screen.getByText('Valor')).toBeInTheDocument()
    expect(screen.getByText('S/ 1,000')).toBeInTheDocument()
  })

  it('should render icon', () => {
    const { container } = render(
      <StatCard
        label="Test"
        value={0}
        icon={Package}
        color="text-blue-600"
      />
    )

    // Check that SVG icon is rendered
    const svg = container.querySelector('svg')
    expect(svg).toBeInTheDocument()
  })
})
