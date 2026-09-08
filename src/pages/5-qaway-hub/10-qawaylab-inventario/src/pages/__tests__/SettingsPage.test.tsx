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

const tax = {
  id: 'tax-1',
  codigo: '10',
  descripcion: 'IGV',
  tasa: 18,
  tipo: 'igv' as const,
  active: true,
  created_at: new Date().toISOString(),
}

const serie = {
  id: 'serie-1',
  tipo_doc: '03' as const,
  serie: 'B001',
  descripcion: 'Boleta principal',
  correlativo_actual: 0,
  active: true,
  created_at: new Date().toISOString(),
}

const unit = {
  id: 'unit-1',
  codigo: 'NIU',
  descripcion: 'Unidad',
  active: true,
  created_at: new Date().toISOString(),
}

beforeEach(() => {
  vi.clearAllMocks()
  mockedService.getBusinessSettings.mockResolvedValue(settings)
  mockedService.getTaxes.mockResolvedValue([tax])
  mockedService.getSeries.mockResolvedValue([serie])
  mockedService.getUnits.mockResolvedValue([unit])
})

describe('SettingsPage', () => {
  it('should render the settings header and tabs', async () => {
    render(<SettingsPage />)
    expect(screen.getByText('Configuración')).toBeDefined()
    expect(screen.getByText('Negocio')).toBeDefined()
    expect(screen.getByText('Series')).toBeDefined()
    expect(screen.getByText('Impuestos')).toBeDefined()
    expect(screen.getByText('Unidades')).toBeDefined()
  })

  it('should load and show business settings', async () => {
    render(<SettingsPage />)
    await waitFor(() => {
      expect(screen.getByDisplayValue('QAWAY LAB SAC')).toBeDefined()
    })
    expect(screen.getByText('Sin conectar')).toBeDefined()
  })

  it('should save business settings', async () => {
    mockedService.updateBusinessSettings.mockResolvedValue({ ...settings, razon_social: 'QAWAY LAB SAC' })
    render(<SettingsPage />)
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

  it('should show series tab with the seeded series', async () => {
    render(<SettingsPage />)
    fireEvent.click(screen.getByText('Series'))
    await waitFor(() => {
      expect(screen.getByText('B001')).toBeDefined()
    })
    expect(screen.getByText('Boleta')).toBeDefined()
  })

  it('should show taxes tab with IGV', async () => {
    render(<SettingsPage />)
    fireEvent.click(screen.getByText('Impuestos'))
    await waitFor(() => {
      expect(screen.getAllByText('IGV').length).toBeGreaterThan(0)
    })
  })

  it('should show units tab with NIU', async () => {
    render(<SettingsPage />)
    fireEvent.click(screen.getByText('Unidades'))
    await waitFor(() => {
      expect(screen.getByText('NIU')).toBeDefined()
    })
  })
})
