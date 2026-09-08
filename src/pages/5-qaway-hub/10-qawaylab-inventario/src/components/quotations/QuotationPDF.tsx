import { useState } from 'react'
import { Download, Loader2 } from 'lucide-react'
import type { QuotationWithItems } from '@/services/quotationService'
import { statusConfig } from '@/services/quotationService'

interface QuotationPDFProps {
  quotation: QuotationWithItems
  onGenerated?: (pdfUrl: string) => void
}

// ── Print Layout (hidden, rendered for PDF capture) ──
function QuotationPrintLayout({ quotation }: { quotation: QuotationWithItems }) {
  const status = statusConfig[quotation.status] || statusConfig.draft

  const formatDate = (date: string | null) => {
    if (!date) return '—'
    return new Date(date).toLocaleDateString('es-PE', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    })
  }

  const formatCurrency = (amount: number) => `S/ ${amount.toFixed(2)}`

  const subtotal = quotation.items.reduce((sum, item) => {
    const itemTotal = item.quantity * item.unit_price
    const itemDiscount = item.discount || 0
    return sum + (itemTotal - itemDiscount)
  }, 0)

  const discount = quotation.discount || 0
  const total = subtotal - discount

  return (
    <div style={{ fontFamily: 'Inter, system-ui, sans-serif', padding: '40px', color: '#111827', background: '#fff' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px', borderBottom: '2px solid #e5e7eb', paddingBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#111827', margin: 0 }}>COTIZACIÓN</h1>
          <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>
            #{quotation.id.slice(0, 8).toUpperCase()}
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{
            display: 'inline-block',
            padding: '4px 12px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: 600,
            background: '#f3f4f6',
            color: '#374151',
          }}>
            {status.label}
          </div>
          <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '8px' }}>
            Fecha: {formatDate(quotation.created_at)}
          </p>
          {quotation.valid_until && (
            <p style={{ fontSize: '13px', color: '#6b7280' }}>
              Válida hasta: {formatDate(quotation.valid_until)}
            </p>
          )}
        </div>
      </div>

      {/* Client Info */}
      {quotation.customer && (
        <div style={{ marginBottom: '32px', padding: '16px', background: '#f9fafb', borderRadius: '8px' }}>
          <h3 style={{ fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 8px 0' }}>
            Cliente
          </h3>
          <p style={{ fontSize: '16px', fontWeight: 600, color: '#111827', margin: 0 }}>
            {quotation.customer.name}
          </p>
          {quotation.customer.company && (
            <p style={{ fontSize: '14px', color: '#6b7280', margin: '4px 0 0 0' }}>
              {quotation.customer.company}
            </p>
          )}
          {quotation.customer.email && (
            <p style={{ fontSize: '13px', color: '#9ca3af', margin: '2px 0 0 0' }}>
              {quotation.customer.email}
            </p>
          )}
          {quotation.customer.phone && (
            <p style={{ fontSize: '13px', color: '#9ca3af', margin: '2px 0 0 0' }}>
              {quotation.customer.phone}
            </p>
          )}
        </div>
      )}

      {/* Items Table */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '32px' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
            <th style={{ textAlign: 'left', padding: '12px 8px', fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Producto
            </th>
            <th style={{ textAlign: 'center', padding: '12px 8px', fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>
              Cantidad
            </th>
            <th style={{ textAlign: 'right', padding: '12px 8px', fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>
              Precio Unit.
            </th>
            <th style={{ textAlign: 'right', padding: '12px 8px', fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>
              Descuento
            </th>
            <th style={{ textAlign: 'right', padding: '12px 8px', fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>
              Subtotal
            </th>
          </tr>
        </thead>
        <tbody>
          {quotation.items.map((item, index) => {
            const itemTotal = item.quantity * item.unit_price
            const itemDiscount = item.discount || 0
            const itemSubtotal = itemTotal - itemDiscount

            return (
              <tr key={index} style={{ borderBottom: '1px solid #f3f4f6' }}>
                <td style={{ padding: '12px 8px', fontSize: '14px', color: '#111827' }}>
                  <div style={{ fontWeight: 500 }}>{item.product?.name || 'Producto'}</div>
                  {item.product?.sku && (
                    <div style={{ fontSize: '12px', color: '#9ca3af' }}>SKU: {item.product.sku}</div>
                  )}
                </td>
                <td style={{ textAlign: 'center', padding: '12px 8px', fontSize: '14px', color: '#374151' }}>
                  {item.quantity}
                </td>
                <td style={{ textAlign: 'right', padding: '12px 8px', fontSize: '14px', color: '#374151' }}>
                  {formatCurrency(item.unit_price)}
                </td>
                <td style={{ textAlign: 'right', padding: '12px 8px', fontSize: '14px', color: itemDiscount > 0 ? '#059669' : '#9ca3af' }}>
                  {itemDiscount > 0 ? `-${formatCurrency(itemDiscount)}` : '—'}
                </td>
                <td style={{ textAlign: 'right', padding: '12px 8px', fontSize: '14px', fontWeight: 600, color: '#111827' }}>
                  {formatCurrency(itemSubtotal)}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>

      {/* Totals */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '32px' }}>
        <div style={{ width: '280px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f3f4f6' }}>
            <span style={{ fontSize: '14px', color: '#6b7280' }}>Subtotal</span>
            <span style={{ fontSize: '14px', color: '#374151' }}>{formatCurrency(subtotal)}</span>
          </div>
          {discount > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f3f4f6' }}>
              <span style={{ fontSize: '14px', color: '#6b7280' }}>Descuento</span>
              <span style={{ fontSize: '14px', color: '#059669' }}>-{formatCurrency(discount)}</span>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderTop: '2px solid #111827', marginTop: '4px' }}>
            <span style={{ fontSize: '16px', fontWeight: 700, color: '#111827' }}>Total</span>
            <span style={{ fontSize: '18px', fontWeight: 700, color: '#111827' }}>{formatCurrency(total)}</span>
          </div>
        </div>
      </div>

      {/* Notes */}
      {quotation.notes && (
        <div style={{ padding: '16px', background: '#f9fafb', borderRadius: '8px', marginBottom: '32px' }}>
          <h3 style={{ fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 8px 0' }}>
            Notas
          </h3>
          <p style={{ fontSize: '14px', color: '#374151', margin: 0, whiteSpace: 'pre-wrap' }}>
            {quotation.notes}
          </p>
        </div>
      )}

      {/* Footer */}
      <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '24px', marginTop: '40px' }}>
        <p style={{ fontSize: '12px', color: '#9ca3af', textAlign: 'center', margin: 0 }}>
          Generado por Inventario Qaway · {new Date().toLocaleDateString('es-PE')}
        </p>
      </div>
    </div>
  )
}

// ── PDF Generator Component ──
export function QuotationPDF({ quotation, onGenerated }: QuotationPDFProps) {
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generatePDF = async () => {
    try {
      setGenerating(true)
      setError(null)

      // Dynamically import jsPDF and html2canvas
      const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
        import('jspdf'),
        import('html2canvas'),
      ])

      // Create a temporary container for rendering
      const container = document.createElement('div')
      container.style.position = 'absolute'
      container.style.left = '-9999px'
      container.style.top = '0'
      container.style.width = '794px' // A4 width in pixels
      container.style.background = '#ffffff'
      document.body.appendChild(container)

      // Render the content
      const { createRoot } = await import('react-dom/client')
      const root = createRoot(container)
      
      await new Promise<void>((resolve) => {
        root.render(
          <QuotationPrintLayout quotation={quotation} />
        )
        // Wait for render
        setTimeout(resolve, 100)
      })

      // Generate canvas
      const canvas = await html2canvas(container, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: 794,
        windowWidth: 794,
      })

      // Clean up
      root.unmount()
      document.body.removeChild(container)

      // Create PDF
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF('p', 'mm', 'a4')
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)

      // Generate filename
      const customerName = quotation.customer?.name || 'cliente'
      const date = new Date().toISOString().slice(0, 10)
      const filename = `cotizacion-${customerName.toLowerCase().replace(/\s+/g, '-')}-${date}.pdf`

      // Trigger download
      pdf.save(filename)

      if (onGenerated) {
        const pdfBlob = pdf.output('blob')
        const pdfUrl = URL.createObjectURL(pdfBlob)
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
      <button
        onClick={generatePDF}
        disabled={generating}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        title="Exportar a PDF"
      >
        {generating ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Download className="w-4 h-4" />
        )}
        <span className="hidden sm:inline">PDF</span>
      </button>
      {error && (
        <p className="text-xs text-red-600 mt-1">{error}</p>
      )}
    </div>
  )
}
