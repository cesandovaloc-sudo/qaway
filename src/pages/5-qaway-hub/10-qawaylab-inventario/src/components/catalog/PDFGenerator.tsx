import { useState, useRef } from 'react'
import { Download, Loader2 } from 'lucide-react'
import type { CatalogFull } from '@/services/catalogService'

interface PDFGeneratorProps {
  catalog: CatalogFull
  onGenerated?: (pdfUrl: string) => void
}

export function PDFGenerator({ catalog, onGenerated }: PDFGeneratorProps) {
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  const generatePDF = async () => {
    try {
      setGenerating(true)
      setError(null)

      // Dynamically import jsPDF and html2canvas
      const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
        import('jspdf'),
        import('html2canvas'),
      ])

      if (!contentRef.current) {
        throw new Error('No content to generate PDF')
      }

      // Generate canvas from content
      const canvas = await html2canvas(contentRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
      })

      // Create PDF
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF('p', 'mm', 'a4')
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)

      // Generate filename
      const filename = `${catalog.slug || 'catalogo'}.pdf`
      
      // Save or return URL
      const pdfBlob = pdf.output('blob')
      const pdfUrl = URL.createObjectURL(pdfBlob)

      // Trigger download
      const link = document.createElement('a')
      link.href = pdfUrl
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      if (onGenerated) {
        onGenerated(pdfUrl)
      }
    } catch (err) {
      console.error('Error generating PDF:', err)
      setError(err instanceof Error ? err.message : 'Error al generar PDF')
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div>
      {/* Hidden content for PDF generation */}
      <div ref={contentRef} className="hidden">
        <CatalogPrintLayout catalog={catalog} />
      </div>

      {/* Generate Button */}
      <button
        onClick={generatePDF}
        disabled={generating}
        className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
      >
        {generating ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Download className="w-4 h-4" />
        )}
        {generating ? 'Generando...' : 'Descargar PDF'}
      </button>

      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
    </div>
  )
}

// ── Print Layout Component ──
function CatalogPrintLayout({ catalog }: { catalog: CatalogFull }) {
  const formatDate = (date: string | null) => {
    if (!date) return ''
    return new Date(date).toLocaleDateString('es-PE', { 
      day: '2-digit', 
      month: 'long', 
      year: 'numeric' 
    })
  }

  return (
    <div className="bg-white p-8" style={{ width: '210mm', minHeight: '297mm' }}>
      {/* Header */}
      <div className="text-center mb-8 border-b pb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{catalog.name}</h1>
        {catalog.description && (
          <p className="text-gray-600">{catalog.description}</p>
        )}
        {catalog.campaign && (
          <div className="mt-4 text-sm text-gray-500">
            {catalog.campaign.start_date && (
              <span>Válido desde {formatDate(catalog.campaign.start_date)}</span>
            )}
            {catalog.campaign.end_date && (
              <span> hasta {formatDate(catalog.campaign.end_date)}</span>
            )}
          </div>
        )}
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-2 gap-6">
        {catalog.items.map((item) => (
          <div key={item.id} className="border rounded-lg p-4">
            {/* Product Image */}
            {item.product?.images?.[0] && (
              <div className="mb-3 aspect-video bg-gray-100 rounded overflow-hidden">
                <img
                  src={item.product.images[0].processed_url || item.product.images[0].original_url}
                  alt={item.product.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Product Info */}
            <h3 className="font-semibold text-gray-900">{item.product?.name || 'Producto'}</h3>
            {item.product?.sku && (
              <p className="text-xs text-gray-500">{item.product.sku}</p>
            )}
            
            {item.show_description && item.product?.description && (
              <p className="text-sm text-gray-600 mt-2 line-clamp-2">{item.product.description}</p>
            )}

            {/* Price */}
            {item.show_price && (
              <div className="mt-3">
                {item.bundle ? (
                  <div>
                    <span className="text-lg font-bold text-green-600">
                      S/ {item.bundle.bundle_price.toFixed(2)}
                    </span>
                  </div>
                ) : item.product?.base_price ? (
                  <span className="text-lg font-bold text-gray-900">
                    S/ {item.product.base_price.toFixed(2)}
                  </span>
                ) : null}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-8 pt-6 border-t text-center text-sm text-gray-500">
        <p>Qaway Lab • Catálogo generado el {new Date().toLocaleDateString('es-PE')}</p>
      </div>
    </div>
  )
}
