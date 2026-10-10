import { useState } from 'react'
import { Copy, Check, ExternalLink } from 'lucide-react'

interface QRCodeProps {
  url: string
  title?: string
  size?: number
}

export function QRCode({ url, title, size = 200 }: QRCodeProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Error copying:', err)
    }
  }

  // Generate QR code URL using a free API
  const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(url)}&bgcolor=ffffff&color=000000&margin=10`

  return (
    <div className="inline-flex flex-col items-center gap-3">
      {title && (
        <p className="text-sm font-medium text-gray-700">{title}</p>
      )}
      
      {/* QR Code Image */}
      <div className="bg-white p-2 rounded-lg border border-gray-200 shadow-sm">
        <img
          src={qrApiUrl}
          alt={`QR Code for ${title || url}`}
          width={size}
          height={size}
          className="block"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-green-600" />
              Copiado
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              Copiar enlace
            </>
          )}
        </button>
        
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 px-3 py-1.5 text-sm text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
          Abrir
        </a>
      </div>

      {/* URL Display */}
      <p className="text-xs text-gray-500 max-w-[200px] truncate" title={url}>
        {url}
      </p>
    </div>
  )
}
