import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { act, fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ProductsManager } from '@qawaylab/pago'

function makeProduct(overrides: Record<string, unknown> = {}) {
  return {
    id: 'prod-1',
    title: 'Curso de Ventas',
    slug: 'curso-de-ventas',
    type: 'course',
    price: 149.9,
    stock: 10,
    category: 'Ventas',
    status: 'active',
    ...overrides,
  }
}

function defaultManager(overrides: Record<string, unknown> = {}) {
  const getProducts = vi.fn().mockResolvedValue([makeProduct()])
  const createProduct = vi.fn().mockResolvedValue({ id: 'prod-9' })
  const updateProduct = vi.fn().mockResolvedValue({})
  const deleteProduct = vi.fn().mockResolvedValue({})
  const manager = {
    getProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    render: () =>
      render(<ProductsManager productsService={{ getProducts, createProduct, updateProduct, deleteProduct }} {...overrides} />),
  }
  return manager
}

describe('ProductsManager (módulo @qawaylab/pago)', () => {
  let alertMock: ReturnType<typeof vi.fn>
  let confirmMock: ReturnType<typeof vi.fn>

  beforeEach(() => {
    alertMock = vi.fn()
    confirmMock = vi.fn(() => true)
    vi.stubGlobal('alert', alertMock)
    vi.stubGlobal('confirm', confirmMock)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('muestra el spinner mientras carga', async () => {
    let resolve!: (value: unknown) => void
    const getProducts = vi.fn(() => new Promise((res) => { resolve = res }))
    render(<ProductsManager productsService={{ getProducts, createProduct: vi.fn(), updateProduct: vi.fn(), deleteProduct: vi.fn() }} />)

    expect(document.querySelector('.animate-spin')).not.toBeNull()

    await act(async () => { resolve([makeProduct()]) })
    expect(screen.getByText('Curso de Ventas')).toBeInTheDocument()
  })

  it('muestra el error si la carga falla', async () => {
    const getProducts = vi.fn().mockRejectedValue(new Error('Error al cargar'))
    render(<ProductsManager productsService={{ getProducts, createProduct: vi.fn(), updateProduct: vi.fn(), deleteProduct: vi.fn() }} />)

    expect(await screen.findByText('Error al cargar')).toBeInTheDocument()
  })

  it('muestra el estado vacío', async () => {
    const getProducts = vi.fn().mockResolvedValue([])
    render(<ProductsManager productsService={{ getProducts, createProduct: vi.fn(), updateProduct: vi.fn(), deleteProduct: vi.fn() }} />)

    expect(await screen.findByText('No hay productos. Crea el primero.')).toBeInTheDocument()
  })

  it('renderiza la lista con tipo, precio, stock, categoría, badge y botones', async () => {
    defaultManager().render()
    await screen.findByText('Curso de Ventas')

    const card = screen.getByText('Curso de Ventas').closest('.card-hover') as HTMLElement
    expect(within(card).getByText('Curso · S/149.90 · Stock: 10 · Ventas')).toBeInTheDocument()
    expect(within(card).getByText('Activo')).toBeInTheDocument()
    expect(within(card).getByRole('button', { name: 'Editar' })).toBeInTheDocument()
    expect(within(card).getByRole('button', { name: 'Archivar' })).toBeInTheDocument()
    expect(screen.getByText('Nuevo producto')).toBeInTheDocument()
  })

  it('autogenera el slug a partir del título al crear', async () => {
    const user = userEvent.setup()
    defaultManager().render()
    await screen.findByText('Curso de Ventas')

    await user.type(screen.getByLabelText('Título'), 'Curso 2026')

    expect(screen.getByLabelText('Slug')).toHaveValue('curso-2026')
  })

  it('crear producto envía el payload parseado, recarga y resetea el formulario', async () => {
    const user = userEvent.setup()
    const manager = defaultManager()
    manager.render()
    await screen.findByText('Curso de Ventas')

    await user.type(screen.getByLabelText('Título'), 'Curso 2026')
    await user.type(screen.getByLabelText('Precio'), '249.9')
    await user.selectOptions(screen.getByLabelText('Tipo'), 'digital')
    await user.click(screen.getByRole('button', { name: 'Crear producto' }))

    expect(manager.createProduct).toHaveBeenCalledWith({
      title: 'Curso 2026',
      slug: 'curso-2026',
      description: '',
      price: 249.9,
      type: 'digital',
      category: null,
      image_url: null,
      compare_price: null,
      stock: 0,
      status: 'draft',
    })
    expect(manager.getProducts).toHaveBeenCalledTimes(2) // carga inicial + recarga
    expect(screen.getByLabelText('Título')).toHaveValue('')
    expect(screen.getByLabelText('Slug')).toHaveValue('')
    expect(screen.getByText('Nuevo producto')).toBeInTheDocument()
  })

  it('submit con título vacío no llama a createProduct', async () => {
    const manager = defaultManager()
    manager.render()
    await screen.findByText('Curso de Ventas')

    fireEvent.submit(document.querySelector('form')!)

    expect(manager.createProduct).not.toHaveBeenCalled()
  })

  it('editar carga el producto en el formulario', async () => {
    const user = userEvent.setup()
    defaultManager().render()
    await screen.findByText('Curso de Ventas')

    await user.click(screen.getByRole('button', { name: 'Editar' }))

    expect(screen.getByText('Editar producto')).toBeInTheDocument()
    expect(screen.getByLabelText('Título')).toHaveValue('Curso de Ventas')
    expect(screen.getByLabelText('Slug')).toHaveValue('curso-de-ventas')
    expect(screen.getByLabelText('Precio')).toHaveValue(149.9)
    expect(screen.getByLabelText('Tipo')).toHaveValue('course')
    expect(screen.getByLabelText('Estado')).toHaveValue('active')
    expect(screen.getByRole('button', { name: 'Actualizar' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeInTheDocument()
  })

  it('cancelar resetea el formulario a nuevo producto', async () => {
    const user = userEvent.setup()
    defaultManager().render()
    await screen.findByText('Curso de Ventas')

    await user.click(screen.getByRole('button', { name: 'Editar' }))
    await user.click(screen.getByRole('button', { name: 'Cancelar' }))

    expect(screen.getByText('Nuevo producto')).toBeInTheDocument()
    expect(screen.getByLabelText('Título')).toHaveValue('')
    expect(screen.getByRole('button', { name: 'Crear producto' })).toBeInTheDocument()
  })

  it('actualizar envía el payload al updateProduct con el id del producto', async () => {
    const user = userEvent.setup()
    const manager = defaultManager()
    manager.render()
    await screen.findByText('Curso de Ventas')

    await user.click(screen.getByRole('button', { name: 'Editar' }))
    await user.clear(screen.getByLabelText('Precio'))
    await user.type(screen.getByLabelText('Precio'), '299.9')
    await user.click(screen.getByRole('button', { name: 'Actualizar' }))

    expect(manager.updateProduct).toHaveBeenCalledWith(
      'prod-1',
      expect.objectContaining({ title: 'Curso de Ventas', price: 299.9, stock: 10, type: 'course', status: 'active' }),
    )
  })

  it('archivar con confirm llama a deleteProduct y recarga', async () => {
    const user = userEvent.setup()
    const manager = defaultManager()
    manager.render()
    await screen.findByText('Curso de Ventas')

    await user.click(screen.getByRole('button', { name: 'Archivar' }))

    expect(confirmMock).toHaveBeenCalledWith('¿Archivar este producto?')
    expect(manager.deleteProduct).toHaveBeenCalledWith('prod-1')
    expect(manager.getProducts).toHaveBeenCalledTimes(2)
  })

  it('archivar con confirm cancelado no elimina', async () => {
    const user = userEvent.setup()
    const manager = defaultManager()
    manager.render()
    await screen.findByText('Curso de Ventas')

    confirmMock.mockReturnValueOnce(false)
    await user.click(screen.getByRole('button', { name: 'Archivar' }))

    expect(manager.deleteProduct).not.toHaveBeenCalled()
  })

  it('error al archivar muestra alert con el mensaje', async () => {
    const user = userEvent.setup()
    const manager = defaultManager()
    manager.deleteProduct.mockRejectedValueOnce(new Error('RLS denegado'))
    manager.render()
    await screen.findByText('Curso de Ventas')

    await user.click(screen.getByRole('button', { name: 'Archivar' }))

    expect(alertMock).toHaveBeenCalledWith(expect.stringContaining('Error: RLS denegado'))
  })

  it('muestra "Guardando..." y deshabilita el botón mientras crea', async () => {
    const user = userEvent.setup()
    let resolveCreate!: (value: unknown) => void
    const createProduct = vi.fn(() => new Promise((res) => { resolveCreate = res }))
    const getProducts = vi.fn().mockResolvedValue([])
    render(<ProductsManager productsService={{ getProducts, createProduct, updateProduct: vi.fn(), deleteProduct: vi.fn() }} />)

    await screen.findByText('No hay productos. Crea el primero.')
    await user.type(screen.getByLabelText('Título'), 'Nuevo Curso')
    await user.click(screen.getByRole('button', { name: 'Crear producto' }))

    expect(screen.getByRole('button', { name: 'Guardando...' })).toBeDisabled()

    await act(async () => { resolveCreate({ id: 'prod-9' }) })
    expect(screen.getByRole('button', { name: 'Crear producto' })).toBeInTheDocument()
  })

  it('error al crear muestra el mensaje en el formulario', async () => {
    const user = userEvent.setup()
    const manager = defaultManager()
    manager.createProduct.mockRejectedValueOnce(new Error('Slug duplicado'))
    manager.render()
    await screen.findByText('Curso de Ventas')

    await user.type(screen.getByLabelText('Título'), 'Nuevo Curso')
    await user.click(screen.getByRole('button', { name: 'Crear producto' }))

    expect(await screen.findByText('Slug duplicado')).toBeInTheDocument()
  })
})
