import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import SettingsPage from '@/pages/SettingsPage'
import { fiscalService } from '@/services/fiscalService'

vi.mock('@/services/fiscalService', () => ({
  fiscalService: {
    getBusinessSettings: vi.fn(),
    updateBusinessSettings: vi.fn(),
    getTaxes: vi.fn(),
    getSeries: vi.fn(),
    getUnits: vi.fn(),
    createTax: vi.fn(),
    updateTax: vi.fn(),
    deleteTax: vi.fn(),
    createUnit: vi.fn(),
    updateUnit: vi.fn(),
    deleteUnit: vi.fn(),
    createSeries: vi.fn(),
    updateSeries: vi.fn(),
    deleteSeries: vi.fn(),
    nextCorrelativo: vi.fn(),
  },
}))

const mockedService = fiscalService as unknown as Record<keyof typeof fiscalService, ReturnType<typeof vi.fn>>

const settings = {
  id: '00000000-0000-0000-0000-000000000001',
  ruc: '20100039207',
  razon_social: 'QAWAY LAB SAC',
  nombre_comercial: 'QAWAY LAB',
  direccion: 'Av. Principal 123',
  regimen: 'general',
  igv_rate: 18,
  moneda: 'PEN',
  sunat_connected: false,
  sunat_connection_meta: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}

beforeEach(() => {
  vi.clearAllMocks()
  mockedService.getBusinessSettings.mockResolvedValue(settings)
})

describe('SettingsPage', () => {
  it('should render the settings header and tabs', async () => {
    render(<SettingsPage />)
    expect(screen.getByText('Configuración')).toBeDefined()
    expect(screen.getByText('Negocio')).toBeDefined()
    expect(screen.getByText('Usuarios & Cargos')).toBeDefined()
  })

  it('should show governance users and roles by default', async () => {
    render(<SettingsPage />)
    expect(screen.getByText('Usuarios de la organización')).toBeDefined()
    expect(screen.getByText('Cargos dinámicos y facultades')).toBeDefined()
    expect(screen.getByText('Nuevo Usuario')).toBeDefined()
    expect(screen.getByText('Nuevo Cargo')).toBeDefined()
  })

  it('should load and show business settings', async () => {
    render(<SettingsPage />)
    fireEvent.click(screen.getByText('Negocio'))
    await waitFor(() => {
      expect(screen.getByDisplayValue('QAWAY LAB SAC')).toBeDefined()
    })
    expect(screen.getByText('Sin conectar')).toBeDefined()
  })

  it('should save business settings', async () => {
    mockedService.updateBusinessSettings.mockResolvedValue({ ...settings, razon_social: 'QAWAY LAB SAC' })
    render(<SettingsPage />)
    fireEvent.click(screen.getByText('Negocio'))
    await waitFor(() => {
      expect(screen.getByDisplayValue('QAWAY LAB SAC')).toBeDefined()
    })
    fireEvent.click(screen.getByText('Guardar'))
    await waitFor(() => {
      expect(mockedService.updateBusinessSettings).toHaveBeenCalled()
    })
    await waitFor(() => {
      expect(screen.getByText('Guardado')).toBeDefined()
    })
  })
})
