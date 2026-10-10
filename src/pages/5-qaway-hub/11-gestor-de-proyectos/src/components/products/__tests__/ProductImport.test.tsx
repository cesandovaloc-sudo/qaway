import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ProductImport from '@/components/products/ProductImport'
import { parseProductExcel } from '@/utils/excelImport'
import { productService } from '@/services/productService'

vi.mock('@/utils/excelImport', () => ({
  parseProductExcel: vi.fn(),
  downloadExcelTemplate: vi.fn(),
  EXCEL_TEMPLATE_COLUMNS: ['Nombre', 'SKU', 'Precio', 'Stock'],
}))

vi.mock('@/services/productService', () => ({
  productService: { createProducts: vi.fn() },
}))

function makeRows() {
  return [
    { name: 'Zapatillas Running Pro', base_price: 249.9, stock: 5 },
    { name: 'Medias Deportivas', base_price: 29.9 },
  ]
}

describe('ProductImport (importación Excel)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(parseProductExcel).mockResolvedValue({
      products: makeRows(),
      errors: [],
      headers: ['Nombre', 'Precio'],
    })
    vi.mocked(productService.createProducts).mockResolvedValue(2)
  })

  it('abre con las columnas reconocidas y sin botón de importar activo', () => {
    render(<ProductImport onClose={vi.fn()} onImported={vi.fn()} />)

    expect(screen.getByText('Importar productos')).toBeInTheDocument()
    expect(screen.getByText(/Selecciona un archivo Excel o CSV/)).toBeInTheDocument()
    expect(screen.getByText('Nombre · SKU · Precio · Stock')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Importar 0 productos' })).toBeDisabled()
  })

  it('al subir un archivo muestra la preview y habilita la importación', async () => {
    const user = userEvent.setup()
    render(<ProductImport onClose={vi.fn()} onImported={vi.fn()} />)

    const input = screen.getByLabelText(/Selecciona un archivo Excel/)
    await user.upload(input, new File(['x'], 'productos.xlsx'))

    expect(parseProductExcel).toHaveBeenCalledTimes(1)
    expect(await screen.findByText('2 productos listos para importar')).toBeInTheDocument()
    expect(screen.getByText('Zapatillas Running Pro')).toBeInTheDocument()
    expect(screen.getByText('S/ 249.90 · 5 u.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Importar 2 productos' })).toBeEnabled()
  })

  it('importa los productos, muestra el mensaje de éxito y llama onImported', async () => {
    const user = userEvent.setup()
    const onImported = vi.fn()
    render(<ProductImport onClose={vi.fn()} onImported={onImported} />)

    await user.upload(screen.getByLabelText(/Selecciona un archivo Excel/), new File(['x'], 'productos.xlsx'))
    await screen.findByText('2 productos listos para importar')
    await user.click(screen.getByRole('button', { name: 'Importar 2 productos' }))

    expect(productService.createProducts).toHaveBeenCalledWith([
      expect.objectContaining({ name: 'Zapatillas Running Pro', base_price: 249.9 }),
      expect.objectContaining({ name: 'Medias Deportivas', base_price: 29.9 }),
    ])
    expect(await screen.findByText('2 productos importados correctamente.')).toBeInTheDocument()
    expect(onImported).toHaveBeenCalledWith(2)
  })

  it('muestra las filas omitidas y deshabilita importar cuando no hay productos válidos', async () => {
    const user = userEvent.setup()
    vi.mocked(parseProductExcel).mockResolvedValue({
      products: [],
      errors: ['Fila 2: falta el nombre del producto'],
      headers: ['Nombre'],
    })
    render(<ProductImport onClose={vi.fn()} onImported={vi.fn()} />)

    await user.upload(screen.getByLabelText(/Selecciona un archivo Excel/), new File(['x'], 'malo.xlsx'))

    expect(await screen.findByText('1 fila omitida')).toBeInTheDocument()
    expect(screen.getByText('Fila 2: falta el nombre del producto')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Importar 0 productos' })).toBeDisabled()
  })

  it('muestra el error del servicio si la importación falla', async () => {
    const user = userEvent.setup()
    vi.mocked(productService.createProducts).mockRejectedValueOnce(new Error('RLS denegado'))
    render(<ProductImport onClose={vi.fn()} onImported={vi.fn()} />)

    await user.upload(screen.getByLabelText(/Selecciona un archivo Excel/), new File(['x'], 'productos.xlsx'))
    await screen.findByText('2 productos listos para importar')
    await user.click(screen.getByRole('button', { name: 'Importar 2 productos' }))

    expect(await screen.findByText('Error al importar: RLS denegado')).toBeInTheDocument()
  })

  it('muestra el error si el archivo no se puede leer', async () => {
    const user = userEvent.setup()
    vi.mocked(parseProductExcel).mockRejectedValueOnce(new Error('archivo corrupto'))
    render(<ProductImport onClose={vi.fn()} onImported={vi.fn()} />)

    await user.upload(screen.getByLabelText(/Selecciona un archivo Excel/), new File(['x'], 'roto.xlsx'))

    expect(await screen.findByText('No se pudo leer el archivo: archivo corrupto')).toBeInTheDocument()
  })
})
