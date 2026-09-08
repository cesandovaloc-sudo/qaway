import type { AISuggestion } from '@/types'

// ── AI Analysis Result ──
export interface AIAnalysisResult {
  name: string
  category: string
  description: string
  brand: string | null
  material: string | null
  color: string | null
  condition: 'new' | 'good' | 'fair' | 'poor'
  estimated_quantity: number
  attributes: Record<string, string>
  confidence: 'high' | 'medium' | 'low'
  suggested_price: number | null
  suggested_cost: number | null
}

// ── AI Service Interface ──
export interface AIService {
  analyzeImage(imageUrl: string): Promise<AIAnalysisResult>
  suggestPrice(productData: Partial<AIAnalysisResult>): Promise<number | null>
}

// ── Environment Variables ──
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY
const AI_API_URL = import.meta.env.VITE_AI_API_URL || 'https://api.openai.com/v1/chat/completions'

// ── Real AI Implementation (OpenAI Vision) ──
class OpenAIVisionService implements AIService {
  private apiKey: string
  private apiUrl: string

  constructor() {
    this.apiKey = OPENAI_API_KEY || ''
    this.apiUrl = AI_API_URL
  }

  async analyzeImage(imageUrl: string): Promise<AIAnalysisResult> {
    if (!this.apiKey) {
      console.warn('OpenAI API key not configured, using mock analysis')
      return this.getMockAnalysis()
    }

    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: `Eres un asistente experto en identificar productos físicos. Analiza la imagen proporcionada y extrae la siguiente información en formato JSON:

{
  "name": "Nombre del producto (corto y descriptivo)",
  "category": "Categoría (ej: Mobiliario, Tecnología, Electrónica, Herramientas, Material, Otros)",
  "description": "Descripción detallada del producto",
  "brand": "Marca si es visible, null si no",
  "material": "Material principal si se identifica, null si no",
  "color": "Color predominante, null si no se identifica",
  "condition": "new | good | fair | poor (basado en apariencia visual)",
  "estimated_quantity": 1,
  "attributes": {},
  "confidence": "high | medium | low",
  "suggested_price": null,
  "suggested_cost": null
}

Responde SOLO con el JSON, sin texto adicional.`
            },
            {
              role: 'user',
              content: [
                { type: 'text', text: 'Analiza este producto y proporciona la información en el formato JSON especificado.' },
                { type: 'image_url', image_url: { url: imageUrl, detail: 'low' } }
              ]
            }
          ],
          max_tokens: 1000,
          temperature: 0.3,
        }),
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const data = await response.json()
      const content = data.choices?.[0]?.message?.content

      if (!content) {
        throw new Error('No analysis result from AI')
      }

      // Parse JSON response
      const result = JSON.parse(content) as AIAnalysisResult
      
      // Validate and normalize
      return {
        name: result.name || 'Producto sin nombre',
        category: result.category || 'Otros',
        description: result.description || '',
        brand: result.brand || null,
        material: result.material || null,
        color: result.color || null,
        condition: ['new', 'good', 'fair', 'poor'].includes(result.condition) 
          ? result.condition 
          : 'good',
        estimated_quantity: Math.max(1, result.estimated_quantity || 1),
        attributes: result.attributes || {},
        confidence: ['high', 'medium', 'low'].includes(result.confidence) 
          ? result.confidence 
          : 'medium',
        suggested_price: result.suggested_price || null,
        suggested_cost: result.suggested_cost || null,
      }
    } catch (error) {
      console.error('AI analysis failed:', error)
      // Fallback to mock analysis
      return this.getMockAnalysis()
    }
  }

  async suggestPrice(productData: Partial<AIAnalysisResult>): Promise<number | null> {
    if (!this.apiKey) {
      return null
    }

    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: `Eres un asistente experto en valoración de productos. Sugiere un precio de venta en Soles (S/) para el producto descrito. Responde SOLO con el número, sin texto adicional.`
            },
            {
              role: 'user',
              content: `Producto: ${productData.name || 'Desconocido'}
Categoría: ${productData.category || 'General'}
Marca: ${productData.brand || 'Sin marca'}
Estado: ${productData.condition || 'good'}
Descripción: ${productData.description || 'Sin descripción'}`
            }
          ],
          max_tokens: 10,
          temperature: 0.3,
        }),
      })

      if (!response.ok) {
        return null
      }

      const data = await response.json()
      const content = data.choices?.[0]?.message?.content
      const price = parseFloat(content)

      return isNaN(price) ? null : price
    } catch {
      return null
    }
  }

  private getMockAnalysis(): AIAnalysisResult {
    return {
      name: 'Producto detectado',
      category: 'General',
      description: 'Descripción del producto basada en el análisis de la imagen.',
      brand: null,
      material: null,
      color: null,
      condition: 'good',
      estimated_quantity: 1,
      attributes: {},
      confidence: 'medium',
      suggested_price: null,
      suggested_cost: null,
    }
  }
}

// ── Export singleton ──
export const aiService: AIService = new OpenAIVisionService()

// ── Helper to create suggestion objects ──
export function createSuggestion(
  type: AISuggestion['type'],
  value: string,
  confidence: AISuggestion['confidence'] = 'medium'
): Omit<AISuggestion, 'id' | 'product_id' | 'created_at'> {
  return {
    type,
    value,
    confidence,
    source: 'ai',
    status: 'pending',
  }
}

// ── Confidence badge styles ──
export const confidenceStyles: Record<string, { bg: string; text: string; label: string }> = {
  high: { bg: 'bg-emerald-50', text: 'text-emerald-700', label: 'Alta' },
  medium: { bg: 'bg-amber-50', text: 'text-amber-700', label: 'Media' },
  low: { bg: 'bg-red-50', text: 'text-red-700', label: 'Baja' },
}

// ── Condition labels ──
export const conditionLabels: Record<string, string> = {
  new: 'Nuevo',
  good: 'Bueno',
  fair: 'Regular',
  poor: 'Deteriorado',
}

// ── Helper to convert File to base64 data URL ──
export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

// ── Helper to upload image to Supabase Storage ──
export async function uploadImageToStorage(
  file: File,
  bucket: string = 'products'
): Promise<string | null> {
  try {
    const { supabase } = await import('@/config/supabase')
    
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
    const filePath = `original/${fileName}`

    const { error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (error) {
      console.error('Upload error:', error)
      return null
    }

    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath)

    return data.publicUrl
  } catch (error) {
    console.error('Storage error:', error)
    return null
  }
}
