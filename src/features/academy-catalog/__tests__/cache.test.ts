import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  ACADEMY_CACHE_KEY,
  readAcademyCatalogCache,
  writeAcademyCatalogCache,
  isAcademyCatalogCacheFresh,
} from '../academy-catalog.cache'
import { examplePublicCoursesV1 } from '../../../contracts/courses/v1.examples'

describe('academy-catalog.cache', () => {
  const originalWindow = globalThis.window

  beforeEach(() => {
    const store = new Map<string, string>()
    globalThis.window = {
      localStorage: {
        getItem: vi.fn((k: string) => store.get(k) ?? null),
        setItem: vi.fn((k: string, v: string) => void store.set(k, v)),
      },
    } as unknown as Window & typeof globalThis
  })

  afterEach(() => {
    globalThis.window = originalWindow
    vi.unstubAllEnvs()
  })

  it('escribe y lee una caché válida', () => {
    writeAcademyCatalogCache(examplePublicCoursesV1)
    const entry = readAcademyCatalogCache()
    expect(entry).not.toBeNull()
    expect(entry?.version).toBe(1)
    expect(entry?.courses).toHaveLength(3)
  })

  it('rechaza datos corruptos en localStorage', () => {
    globalThis.window.localStorage.setItem(ACADEMY_CACHE_KEY, '{"version":1,"cachedAt":"x","courses":[{bad}]}')
    expect(readAcademyCatalogCache()).toBeNull()
  })

  it('rechaza un JSON inválido', () => {
    globalThis.window.localStorage.setItem(ACADEMY_CACHE_KEY, 'not-json{')
    expect(readAcademyCatalogCache()).toBeNull()
  })

  it('marca fresca una caché recién escrita', () => {
    writeAcademyCatalogCache(examplePublicCoursesV1)
    const entry = readAcademyCatalogCache()
    expect(isAcademyCatalogCacheFresh(entry)).toBe(true)
  })

  it('marca caducada una caché vieja', () => {
    writeAcademyCatalogCache(examplePublicCoursesV1)
    const entry = readAcademyCatalogCache()
    entry!.cachedAt = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
    expect(isAcademyCatalogCacheFresh(entry)).toBe(false)
  })
})
