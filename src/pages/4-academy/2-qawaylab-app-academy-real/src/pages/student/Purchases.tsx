import { Link } from 'react-router-dom'
import { useData } from '@/hooks/useData'
import { useAuth } from '@/contexts/AuthContext'
import { getPayments } from '@/lib/services'

const STATUS_COLORS: Record<string, string> = {
  completed: 'badge-success',
  pending: 'badge-warning',
  failed: 'badge-danger',
  refunded: 'badge',
}

const STATUS_LABELS: Record<string, string> = {
  completed: 'Completado',
  pending: 'Pendiente',
  failed: 'Fallido',
  refunded: 'Reembolsado',
}

export default function Purchases() {
  const { user } = useAuth()
  const { data: purchases, loading, error } = useData(
    () => user?.id ? getPayments(user.id) : Promise.resolve([]),
    [user?.id]
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
          <p className="mt-3 text-sm text-surface-500">Cargando compras...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="card p-12 text-center">
        <span className="text-5xl block mb-4">❌</span>
        <h3 className="text-lg font-semibold text-surface-900 mb-2">Error al cargar</h3>
        <p className="text-sm text-surface-500 mb-6">No pudimos cargar tu historial de compras</p>
        <Link to="/academy/app/panel" className="btn-primary">Volver al Panel</Link>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="section-title">Mis Compras</h1>
        <p className="section-subtitle mt-1">
          {purchases && purchases.length > 0
            ? `${purchases.length} compra${purchases.length !== 1 ? 's' : ''}`
            : 'Historial de todos tus cursos adquiridos'}
        </p>
      </div>

      {purchases && purchases.length > 0 ? (
        <div className="space-y-4">
          {purchases.map((p) => {
            const course = p.course
            const amount = p.amount ? `$${Number(p.amount).toFixed(2)}` : '—'
            return (
              <div key={p.id} className="card flex items-center gap-4 p-5">
                <div className="h-16 w-24 flex-shrink-0 overflow-hidden rounded-none bg-surface-100 flex items-center justify-center text-2xl">
                  📚
                </div>
                <div className="flex-1 min-w-0">
                  {course?.title ? (
                    <h3 className="font-semibold text-surface-900 truncate">{course.title}</h3>
                  ) : (
                    <h3 className="font-semibold text-surface-600">Curso eliminado</h3>
                  )}
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-sm text-surface-500">{amount}</span>
                    <span className="text-xs text-surface-400">·</span>
                    <span className="text-xs text-surface-400">
                      {p.created_at ? new Date(p.created_at).toLocaleDateString('es-PE', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      }) : '—'}
                    </span>
                    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[String(p.status || '')] || 'badge'}`}>
                      {STATUS_LABELS[String(p.status || '')] || p.status}
                    </span>
                  </div>
                </div>
                {p.status === 'completed' && course?.slug && (
                  <Link to={`/panel/cursos/${course.slug}`} className="btn-ghost text-sm shrink-0">
                    Ir al curso →
                  </Link>
                )}
              </div>
            )
          })}
        </div>
      ) : (
        <div className="card p-12 text-center">
          <span className="text-5xl block mb-4">🛒</span>
          <h3 className="text-lg font-semibold text-surface-900 mb-2">No tienes compras aún</h3>
          <p className="text-sm text-surface-500 mb-6">
            Explora el catálogo y encuentra el curso perfecto para ti
          </p>
          <Link to="/academy/app/cursos" className="btn-primary">
            Explorar Cursos
          </Link>
        </div>
      )}
    </div>
  )
}
