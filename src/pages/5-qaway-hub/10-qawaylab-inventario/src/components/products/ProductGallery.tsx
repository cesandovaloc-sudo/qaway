import { useState } from 'react'
import { ChevronLeft, ChevronRight, Star, Trash2, ImageIcon } from 'lucide-react'
import type { ProductImage } from '@/types'

interface ProductGalleryProps {
  images: ProductImage[]
  productName: string
  onDelete?: (imageId: string) => void
  onSetPrimary?: (imageId: string) => void
}

export function ProductGallery({ images, productName, onDelete, onSetPrimary }: ProductGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  const sortedImages = [...images].sort((a, b) => a.sort_order - b.sort_order)
  const currentImage = sortedImages[currentIndex]

  const goToPrevious = () => {
    setCurrentIndex(prev => prev === 0 ? sortedImages.length - 1 : prev - 1)
  }

  const goToNext = () => {
    setCurrentIndex(prev => prev === sortedImages.length - 1 ? 0 : prev + 1)
  }

  if (sortedImages.length === 0) {
    return (
      <div className="aspect-square bg-gray-100 rounded-lg flex flex-col items-center justify-center">
        <ImageIcon className="w-16 h-16 text-gray-300 mb-2" />
        <p className="text-gray-500">Sin imágenes</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Main Image */}
      <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
        <img
          src={currentImage.processed_url || currentImage.original_url}
          alt={currentImage.alt || productName}
          className="w-full h-full object-contain"
        />

        {/* Navigation Arrows */}
        {sortedImages.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-white/80 hover:bg-white rounded-full shadow-md transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-gray-700" />
            </button>
            <button
              onClick={goToNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white/80 hover:bg-white rounded-full shadow-md transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-gray-700" />
            </button>
          </>
        )}

        {/* Primary Badge */}
        {currentImage.is_primary && (
          <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-1 bg-yellow-500 text-white text-xs font-medium rounded-full">
            <Star className="w-3 h-3" />
            Principal
          </div>
        )}

        {/* Image Counter */}
        <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/60 text-white text-xs rounded-full">
          {currentIndex + 1} / {sortedImages.length}
        </div>
      </div>

      {/* Thumbnails */}
      {sortedImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {sortedImages.map((image, index) => (
            <button
              key={image.id}
              onClick={() => setCurrentIndex(index)}
              className={`relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                index === currentIndex
                  ? 'border-orange-500'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <img
                src={image.processed_url || image.original_url}
                alt={image.alt || ''}
                className="w-full h-full object-cover"
              />
              {image.is_primary && (
                <div className="absolute top-0.5 right-0.5">
                  <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Actions */}
      {(onDelete || onSetPrimary) && currentImage && (
        <div className="flex items-center gap-2">
          {!currentImage.is_primary && onSetPrimary && (
            <button
              onClick={() => onSetPrimary(currentImage.id)}
              className="flex items-center gap-1 px-3 py-1.5 text-sm text-yellow-600 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors"
            >
              <Star className="w-4 h-4" />
              Principal
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(currentImage.id)}
              className="flex items-center gap-1 px-3 py-1.5 text-sm text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Eliminar
            </button>
          )}
        </div>
      )}
    </div>
  )
}
