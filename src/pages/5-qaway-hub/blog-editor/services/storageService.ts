import { getSupabaseClient } from './supabaseClient'

export interface UploadResult {
  url: string
  source: 'supabase' | 'local_blob'
  filename: string
}

/**
 * Comprime y convierte un archivo local File en DataURL base64 optimizada (máx 1280px)
 */
/**
 * Comprime y convierte un archivo local File en WebP (máx 1440px)
 */
export function compressImageToWebpBlob(file: File, quality = 0.85): Promise<{ blob: Blob; dataUrl: string }> {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const maxWidth = 1440
        const maxHeight = 1440
        let width = img.width
        let height = img.height

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width)
            width = maxWidth
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height)
            height = maxHeight
          }
        }

        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height)
          const dataUrl = canvas.toDataURL('image/webp', quality)
          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve({ blob, dataUrl })
              } else {
                resolve({ blob: file, dataUrl })
              }
            },
            'image/webp',
            quality
          )
        } else {
          resolve({ blob: file, dataUrl: e.target?.result as string })
        }
      }
      img.onerror = () => resolve({ blob: file, dataUrl: e.target?.result as string })
      img.src = e.target?.result as string
    }
    reader.onerror = () => {
      resolve({ blob: file, dataUrl: URL.createObjectURL(file) })
    }
    reader.readAsDataURL(file)
  })
}

export async function compressAndReadFile(file: File): Promise<string> {
  const { dataUrl } = await compressImageToWebpBlob(file)
  return dataUrl
}

/**
 * Sube una imagen a Supabase Storage bucket 'blog-media' convertida nativamente a WebP
 * con compresión garantizada.
 */
export async function uploadImage(file: File): Promise<UploadResult> {
  try {
    const { blob: webpBlob, dataUrl } = await compressImageToWebpBlob(file)
    const supabase = getSupabaseClient()

    if (supabase) {
      try {
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.webp`
        const filePath = `posts/${fileName}`

        const { data, error } = await supabase.storage
          .from('blog-media')
          .upload(filePath, webpBlob, {
            contentType: 'image/webp',
            cacheControl: '3600',
            upsert: false,
          })

        if (!error && data) {
          const { data: publicUrlData } = supabase.storage
            .from('blog-media')
            .getPublicUrl(filePath)

          if (publicUrlData?.publicUrl) {
            return {
              url: publicUrlData.publicUrl,
              source: 'supabase',
              filename: file.name.replace(/\.[^/.]+$/, '') + '.webp',
            }
          }
        } else if (error) {
          console.warn('Supabase storage falló, usando compresión local:', error.message)
        }
      } catch (storageErr) {
        console.warn('Error conectando con Supabase Storage:', storageErr)
      }
    }

    // Fallback local con compresión WebP optimizada
    return {
      url: dataUrl,
      source: 'local_blob',
      filename: file.name.replace(/\.[^/.]+$/, '') + '.webp',
    }
  } catch (err) {
    console.error('Error procesando imagen:', err)
    const objectUrl = URL.createObjectURL(file)
    return {
      url: objectUrl,
      source: 'local_blob',
      filename: file.name,
    }
  }
}
