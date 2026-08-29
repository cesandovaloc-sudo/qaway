import { getSupabaseClient } from './supabaseClient'

export interface UploadResult {
  url: string
  source: 'supabase' | 'local_blob'
  filename: string
}

/**
 * Comprime y convierte un archivo local File en DataURL base64 optimizada (máx 1280px)
 */
export function compressAndReadFile(file: File): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const maxWidth = 1280
        const maxHeight = 1280
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
          // Comprimir a JPEG calidad 0.82
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.82)
          resolve(compressedDataUrl)
        } else {
          resolve(e.target?.result as string)
        }
      }
      img.onerror = () => resolve(e.target?.result as string)
      img.src = e.target?.result as string
    }
    reader.onerror = () => {
      // Fallback
      resolve(URL.createObjectURL(file))
    }
    reader.readAsDataURL(file)
  })
}

/**
 * Sube una imagen a Supabase Storage bucket 'blog-media' si está disponible,
 * con compresión local garantizada para que nunca sature la memoria.
 */
export async function uploadImage(file: File): Promise<UploadResult> {
  try {
    const supabase = getSupabaseClient()

    if (supabase) {
      try {
        const fileExt = file.name.split('.').pop() || 'jpg'
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`
        const filePath = `posts/${fileName}`

        const { data, error } = await supabase.storage
          .from('blog-media')
          .upload(filePath, file, {
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
              filename: file.name,
            }
          }
        } else if (error) {
          console.warn('Supabase storage falló, usando compresión local:', error.message)
        }
      } catch (storageErr) {
        console.warn('Error conectando con Supabase Storage:', storageErr)
      }
    }

    // Fallback local con compresión optimizada
    const compressedUrl = await compressAndReadFile(file)
    return {
      url: compressedUrl,
      source: 'local_blob',
      filename: file.name,
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
