import { useState, useEffect, useCallback } from 'react'
import { productDetailService, type ProductDetail } from '@/services/productDetailService'
import type { Product } from '@/types'

export function useProduct(productId: string | null) {
  const [product, setProduct] = useState<ProductDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProduct = useCallback(async () => {
    if (!productId) {
      setProduct(null)
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      const data = await productDetailService.getProductById(productId)
      setProduct(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching product')
    } finally {
      setLoading(false)
    }
  }, [productId])

  const updateProduct = async (updates: Partial<Product>) => {
    if (!productId) return
    const updated = await productDetailService.updateProduct(productId, updates)
    setProduct(prev => prev ? { ...prev, ...updated } : null)
    return updated
  }

  const deleteProduct = async () => {
    if (!productId) return
    await productDetailService.deleteProduct(productId)
  }

  const addImage = async (image: { original_url: string; alt?: string }) => {
    if (!productId) return
    const newImage = await productDetailService.addImage({
      product_id: productId,
      original_url: image.original_url,
      processed_url: null,
      is_primary: false,
      alt: image.alt || null,
      sort_order: product?.images.length || 0,
    })
    setProduct(prev => prev ? { ...prev, images: [...prev.images, newImage] } : null)
    return newImage
  }

  const deleteImage = async (imageId: string) => {
    await productDetailService.deleteImage(imageId)
    setProduct(prev => prev ? {
      ...prev,
      images: prev.images.filter(img => img.id !== imageId)
    } : null)
  }

  const setPrimaryImage = async (imageId: string) => {
    if (!productId) return
    await productDetailService.setPrimaryImage(productId, imageId)
    setProduct(prev => prev ? {
      ...prev,
      images: prev.images.map(img => ({
        ...img,
        is_primary: img.id === imageId
      }))
    } : null)
  }

  useEffect(() => {
    fetchProduct()
  }, [fetchProduct])

  return {
    product,
    loading,
    error,
    fetchProduct,
    updateProduct,
    deleteProduct,
    addImage,
    deleteImage,
    setPrimaryImage,
  }
}
