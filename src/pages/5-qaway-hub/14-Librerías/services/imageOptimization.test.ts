import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  IMAGE_PRESETS,
  calcularDestino,
  esImagenPermitida,
  nombreWebp,
  optimizarAvatar,
  optimizarEvidencia,
  optimizarImagen,
  optimizarProducto,
} from './imageOptimization'

class FileReaderMock {
  result: string | ArrayBuffer | null = null
  onload: (() => void) | null = null
  onerror: (() => void) | null = null
  readAsDataURL() {
    this.result = 'data:image/png;base64,AAAA'
    this.onload?.()
  }
}

class ImageMock {
  onload: (() => void) | null = null
  onerror: (() => void) | null = null
  naturalWidth = 800
  naturalHeight = 400
  set src(_valor: string) {
    this.onload?.()
  }
}

function instalarDom(calidad: { calidad?: number } = {}) {
  const drawImage = vi.fn()
  const toBlob = vi.fn((cb: (blob: Blob | null) => void, _tipo: string, calidadWebp: number) => {
    calidad.calidad = calidadWebp
    cb(new Blob(['webp'], { type: 'image/webp' }))
  })

  vi.stubGlobal('FileReader', FileReaderMock)
  vi.stubGlobal('Image', ImageMock)
  vi.spyOn(document, 'createElement').mockImplementation(((tag: string) => {
    if (tag !== 'canvas') {
      // @ts-ignore — conserva el comportamiento original para otros tags
      return Object.getPrototypeOf(document).createElement.call(document, tag)
    }
    return {
      width: 0,
      height: 0,
      getContext: () => ({ imageSmoothingEnabled: false, imageSmoothingQuality: 'low', drawImage }),
      toBlob,
    }
  }) as any)

  return { drawImage, toBlob }
}

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('núcleo de optimización de imágenes', () => {
  it('valida sólo PNG, JPG y WebP', () => {
    expect(esImagenPermitida({ type: 'image/png', name: 'a.png' })).toBe(true)
    expect(esImagenPermitida({ type: 'image/jpeg', name: 'a.jpg' })).toBe(true)
    expect(esImagenPermitida({ type: 'image/webp', name: 'a.webp' })).toBe(true)
    expect(esImagenPermitida({ type: 'image/gif', name: 'a.gif' })).toBe(false)
    expect(esImagenPermitida({ type: 'application/pdf', name: 'a.pdf' })).toBe(false)
    expect(esImagenPermitida(null)).toBe(false)
  })

  it('normaliza el nombre de salida a WebP', () => {
    expect(nombreWebp('Foto.PNG')).toBe('Foto.webp')
    expect(nombreWebp('sin_extension')).toBe('sin_extension.webp')
  })

  it('publica los tres presets sin recorte involuntario', () => {
    expect(IMAGE_PRESETS.avatar).toEqual({ mode: 'avatar', maxEdge: 512, quality: 0.85 })
    expect(IMAGE_PRESETS.product).toEqual({ mode: 'general', maxEdge: 1200, quality: 0.85 })
    expect(IMAGE_PRESETS.evidence).toEqual({ mode: 'general', maxEdge: 1440, quality: 0.9 })
  })

  it('recorta cuadrado centrado para avatar sin ampliar imagen pequeña', () => {
    const destino = calcularDestino(800, 400, { mode: 'avatar', maxEdge: 512 })
    expect(destino).toMatchObject({ sx: 200, sy: 0, ladoOrigen: 400, width: 400, height: 400 })
    expect(calcularDestino(200, 200, { mode: 'avatar', maxEdge: 512 }).width).toBe(200)
  })

  it('conserva la proporción para producto y evidencia', () => {
    expect(calcularDestino(800, 400, { mode: 'general', maxEdge: 400 }))
      .toMatchObject({ width: 400, height: 200 })
    expect(calcularDestino(800, 400, { mode: 'general', maxEdge: 1200 }))
      .toMatchObject({ width: 800, height: 400 })
  })

  it('avatar recorta y devuelve Blob WebP con metadata', async () => {
    const { drawImage } = instalarDom()
    const archivo = new File(['png'], 'perfil.PNG', { type: 'image/png' })
    const resultado = await optimizarAvatar(archivo)

    expect(resultado.blob.type).toBe('image/webp')
    expect(resultado.fileName).toBe('perfil.webp')
    expect(resultado.width).toBe(400)
    expect(resultado.height).toBe(400)
    expect(resultado.mode).toBe('avatar')
    expect(drawImage).toHaveBeenCalledWith(expect.anything(), 200, 0, 400, 400, 0, 0, 400, 400)
  })

  it('producto y evidencia usan su preset de tamaño y calidad', async () => {
    const calidad: { calidad?: number } = {}
    instalarDom(calidad)
    const archivo = new File(['png'], 'producto.jpg', { type: 'image/jpeg' })

    const producto = await optimizarProducto(archivo)
    expect(producto.mode).toBe('general')
    expect(producto.width).toBe(800)
    expect(producto.height).toBe(400)

    await optimizarEvidencia(archivo)
    expect(calidad.calidad).toBe(0.9)
  })

  it('respeta overrides explícitos de maxEdge', async () => {
    instalarDom()
    const archivo = new File(['png'], 'foto.png', { type: 'image/png' })
    const resultado = await optimizarImagen(archivo, { maxEdge: 400 })
    expect(resultado.width).toBe(400)
    expect(resultado.height).toBe(200)
  })

  it('falla con error en vez de devolver el archivo original', async () => {
    instalarDom()
    const archivo = new File(['gif'], 'animado.gif', { type: 'image/gif' })
    await expect(optimizarImagen(archivo)).rejects.toThrow('Formato no permitido')
  })
})
