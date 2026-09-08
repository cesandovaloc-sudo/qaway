import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Compass } from 'lucide-react'
import { setPageMeta } from '@/utils/seo'

export default function NotFoundPage() {
  useEffect(() => {
    setPageMeta({ title: 'Página no encontrada | Qaway Lab', robots: 'noindex' })
  }, [])

  return (
    <div className="min-h-dvh bg-surface flex items-center justify-center px-4">
      <div className="text-center">
        <div className="w-14 h-14 bg-brand/10 rounded-2xl flex items-center justify-center mx-auto mb-5">
          <Compass size={26} className="text-brand" />
        </div>
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted mb-2">404</p>
        <h1 className="font-display text-2xl font-semibold text-ink mb-2">Página no encontrada</h1>
        <p className="text-sm text-muted mb-6 max-w-sm mx-auto">
          La ruta que buscas no existe o fue movida.
        </p>
        <Link
          to="/"
          className="inline-flex items-center px-4 py-2 bg-brand text-white rounded-lg text-sm font-medium hover:bg-brand-light transition-colors"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  )
}
