import { describe, it, expect } from 'vitest'
import {
  isValidDni,
  isValidRuc,
  isValidCe,
  isValidPassport,
  isValidDocNumber,
  normalizeDocNumber,
  docTypeOptions,
} from '../fiscal'

describe('fiscal utils', () => {
  describe('isValidRuc', () => {
    it('accepts a valid RUC (check digit correcto)', () => {
      // 20131312955: ejemplo oficial SUNAT (dígito verificador 5)
      expect(isValidRuc('20131312955')).toBe(true)
    })

    it('rejects a RUC with wrong check digit', () => {
      expect(isValidRuc('20131312954')).toBe(false)
      expect(isValidRuc('20131312956')).toBe(false)
    })

    it('rejects malformed RUCs', () => {
      expect(isValidRuc('123')).toBe(false)
      expect(isValidRuc('12345678901')).toBe(false) // formato válido, dígito inválido
      expect(isValidRuc('2013131295a')).toBe(false)
      expect(isValidRuc('')).toBe(false)
    })
  })

  describe('isValidDni', () => {
    it('accepts 8 digits', () => {
      expect(isValidDni('12345678')).toBe(true)
      expect(isValidDni('00000001')).toBe(true)
    })

    it('rejects invalid DNIs', () => {
      expect(isValidDni('1234567')).toBe(false)
      expect(isValidDni('123456789')).toBe(false)
      expect(isValidDni('1234567a')).toBe(false)
    })
  })

  describe('isValidCe / isValidPassport', () => {
    it('validates carné de extranjería (8-12 alfanuméricos)', () => {
      expect(isValidCe('001234567')).toBe(true)
      expect(isValidCe('AB123456')).toBe(true)
      expect(isValidCe('1234567')).toBe(false)
      expect(isValidCe('1234567890123')).toBe(false)
    })

    it('validates passport (6-15 chars)', () => {
      expect(isValidPassport('A1234567')).toBe(true)
      expect(isValidPassport('12345')).toBe(false)
    })
  })

  describe('isValidDocNumber', () => {
    it('returns true when no document provided (optional)', () => {
      expect(isValidDocNumber('DNI', null)).toBe(true)
      expect(isValidDocNumber('DNI', '')).toBe(true)
      expect(isValidDocNumber('SIN_DOC', 'anything')).toBe(true)
    })

    it('routes by doc type', () => {
      expect(isValidDocNumber('DNI', '12345678')).toBe(true)
      expect(isValidDocNumber('DNI', '1234567')).toBe(false)
      expect(isValidDocNumber('RUC', '20131312955')).toBe(true)
      expect(isValidDocNumber('RUC', '20131312954')).toBe(false)
      expect(isValidDocNumber('CE', '001234567')).toBe(true)
      expect(isValidDocNumber('PASAPORTE', 'A1234567')).toBe(true)
    })

    it('accepts unknown/empty doc types without validation', () => {
      expect(isValidDocNumber(undefined, '123')).toBe(true)
    })
  })

  describe('normalizeDocNumber', () => {
    it('removes spaces and hyphens', () => {
      expect(normalizeDocNumber(' 20 131 312 955 ')).toBe('20131312955')
      expect(normalizeDocNumber('20-131-312-955')).toBe('20131312955')
    })
  })

  describe('docTypeOptions', () => {
    it('includes all SUNAT-relevant types', () => {
      const values = docTypeOptions.map(o => o.value)
      expect(values).toEqual(['DNI', 'RUC', 'CE', 'PASAPORTE', 'SIN_DOC'])
    })
  })
})
