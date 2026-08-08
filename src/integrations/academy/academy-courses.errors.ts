/** Errores tipados del catálogo de Academy (separados de errores genéricos). */
export class AcademyCatalogError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options)
    this.name = 'AcademyCatalogError'
  }
}

export class AcademyCatalogTimeoutError extends AcademyCatalogError {
  constructor() {
    super('Academy no respondió dentro del tiempo límite')
    this.name = 'AcademyCatalogTimeoutError'
  }
}

export class AcademyCatalogInvalidResponseError extends AcademyCatalogError {
  constructor() {
    super('La respuesta de Academy no cumple el contrato de cursos')
    this.name = 'AcademyCatalogInvalidResponseError'
  }
}

export class AcademyCatalogNotConfiguredError extends AcademyCatalogError {
  constructor() {
    super('Faltan las variables de Academy (VITE_ACADEMY_SUPABASE_URL / _ANON_KEY)')
    this.name = 'AcademyCatalogNotConfiguredError'
  }
}
