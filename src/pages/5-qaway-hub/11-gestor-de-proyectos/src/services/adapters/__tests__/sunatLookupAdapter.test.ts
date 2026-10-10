import { describe, it, expect, vi, beforeEach } from 'vitest'

const { invokeMock } = vi.hoisted(() => ({ invokeMock: vi.fn() }))

vi.mock('@/config/supabase', () => ({
  supabaseConfigured: true,
  supabase: { functions: { invoke: invokeMock } },
}))

import { sunatLookupAdapter } from '../sunatLookupAdapter'

describe('sunatLookupAdapter', () => {
  beforeEach(() => {
    invokeMock.mockReset()
  })

  it('returns the normalized result on success (RUC)', async () => {
    invokeMock.mockResolvedValue({
      data: {
        success: true,
        data: { fiscal_name: 'LOVE FOR PETS S.A.C.', address: 'AV. EJEMPLO 123', raw: { ruc: '20131312955' } },
      },
      error: null,
    })

    const result = await sunatLookupAdapter.lookup('RUC', '20131312955')

    expect(result).toEqual({
      fiscal_name: 'LOVE FOR PETS S.A.C.',
      address: 'AV. EJEMPLO 123',
      raw: { ruc: '20131312955' },
    })
    expect(invokeMock).toHaveBeenCalledWith('consulta-ruc-dni', {
      body: { doc_type: 'RUC', doc_number: '20131312955' },
    })
  })

  it('normalizes null address to null (DNI)', async () => {
    invokeMock.mockResolvedValue({
      data: { success: true, data: { fiscal_name: 'JUAN PEREZ GOMEZ', address: null } },
      error: null,
    })

    const result = await sunatLookupAdapter.lookup('DNI', '12345678')
    expect(result.address).toBeNull()
    expect(result.fiscal_name).toBe('JUAN PEREZ GOMEZ')
  })

  it('throws when the edge function returns an error', async () => {
    invokeMock.mockResolvedValue({
      data: null,
      error: { message: 'Functions fetch failed' },
    })

    await expect(sunatLookupAdapter.lookup('RUC', '20131312955')).rejects.toThrow(
      'Consulta SUNAT falló',
    )
  })

  it('throws the provider error when success is false', async () => {
    invokeMock.mockResolvedValue({
      data: { success: false, error: 'Documento no encontrado' },
      error: null,
    })

    await expect(sunatLookupAdapter.lookup('RUC', '20131312955')).rejects.toThrow(
      'Documento no encontrado',
    )
  })

  it('throws when the response is empty', async () => {
    invokeMock.mockResolvedValue({ data: null, error: null })

    await expect(sunatLookupAdapter.lookup('RUC', '20131312955')).rejects.toThrow(
      'respuesta vacía',
    )
  })
})
