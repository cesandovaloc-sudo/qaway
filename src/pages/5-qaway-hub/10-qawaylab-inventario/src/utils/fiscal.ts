// ─────────────────────────────────────────────────────────────
// Validación de documentos fiscales peruanos (SUNAT/RENIEC).
// Usado por el formulario de clientes y compartido con la capa
// de facturación (FASE 3). El mismo algoritmo vive en la BD
// (public.validate_doc_number) como defensa en profundidad.
// ─────────────────────────────────────────────────────────────
import type { CustomerDocType } from '@/types'

const RUC_WEIGHTS = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2]
const DNI_REGEX = /^[0-9]{8}$/
const RUC_REGEX = /^[0-9]{11}$/
const CE_REGEX = /^[0-9A-Za-z]{8,12}$/

/** Limpia el documento (espacios, guiones) para guardar/validar */
export function normalizeDocNumber(value: string): string {
  return value.trim().replace(/[\s-]/g, '')
}

/** DNI: 8 dígitos (RENIEC no publica dígito verificador) */
export function isValidDni(value: string): boolean {
  return DNI_REGEX.test(value)
}

/** RUC: 11 dígitos con dígito verificador (pesos 5-4-3-2-7-6-5-4-3-2) */
export function isValidRuc(value: string): boolean {
  if (!RUC_REGEX.test(value)) return false
  let total = 0
  for (let i = 0; i < 10; i++) {
    total += Number(value[i]) * RUC_WEIGHTS[i]
  }
  const remainder = total % 11
  const checkDigit = remainder === 0 ? 0 : 11 - remainder
  return checkDigit === Number(value[10])
}

export function isValidCe(value: string): boolean {
  return CE_REGEX.test(value)
}

export function isValidPassport(value: string): boolean {
  return value.length >= 6 && value.length <= 15
}

/**
 * Valida un documento según su tipo. Devuelve true si el documento
 * está vacío o el tipo es SIN_DOC (el documento es opcional).
 */
export function isValidDocNumber(
  docType: CustomerDocType | string | null | undefined,
  value: string | null | undefined,
): boolean {
  if (!value || value.trim() === '') return true
  const normalized = normalizeDocNumber(value)
  switch (docType) {
    case 'DNI':
      return isValidDni(normalized)
    case 'RUC':
      return isValidRuc(normalized)
    case 'CE':
      return isValidCe(normalized)
    case 'PASAPORTE':
      return isValidPassport(normalized)
    default:
      return true
  }
}

/** Etiquetas para la UI del tipo de documento */
export const docTypeOptions: { value: CustomerDocType; label: string }[] = [
  { value: 'DNI', label: 'DNI' },
  { value: 'RUC', label: 'RUC' },
  { value: 'CE', label: 'Carné de extranjería' },
  { value: 'PASAPORTE', label: 'Pasaporte' },
  { value: 'SIN_DOC', label: 'Sin documento' },
]
