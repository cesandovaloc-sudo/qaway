import { Link } from 'react-router-dom'
import { useData } from '@/hooks/useData'
import { useAuth } from '@/contexts/AuthContext'
import { getCertificates } from '@/lib/services'

function formatDate(dateStr: string | null | undefined) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('es-ES', {
    year: 'numeric', month: 'long', day: 'numeric',
  })
}

export default function Certificates() {
  const { user } = useAuth()

  const { data: certificates, loading } = useData(
    () => user?.id ? getCertificates(user.id) : Promise.resolve([]),
    [user?.id]
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
          <p className="mt-3 text-sm text-surface-500">Cargando certificados...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="section-title">Mis Certificados</h1>
        <p className="section-subtitle mt-1">Certificados obtenidos al completar tus cursos</p>
      </div>

      {certificates && certificates.length > 0 ? (
        <div className="space-y-4">
          {certificates.map((cert) => {
            const course = cert.course
            const pdfUrl = cert.certificate_url || '#'

            return (
              <div key={cert.id} className="card p-6 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-none bg-surface-100 text-2xl">
                    🎓
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-surface-900 truncate">
                      {course?.title || 'Curso'}
                    </h3>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="badge-success text-xs">✓ Válido</span>
                      <span className="text-xs text-surface-400">
                        Emitido: {formatDate(cert.issued_at)}
                      </span>
                      {course?.duration && (
                        <>
                          <span className="text-xs text-surface-300">·</span>
                          <span className="text-xs text-surface-400">{course.duration}</span>
                        </>
                      )}
                    </div>
                    {course?.instructor?.full_name && (
                      <p className="text-xs text-surface-400 mt-1">
                        Instructor: {course.instructor.full_name}
                      </p>
                    )}
                  </div>
                </div>
                {pdfUrl !== '#' ? (
                  <a
                    href={pdfUrl}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary text-sm shrink-0"
                  >
                    Descargar PDF
                  </a>
                ) : (
                  <span className="text-xs text-surface-400 shrink-0">No disponible</span>
                )}
              </div>
            )
          })}
        </div>
      ) : (
        <div className="card p-12 text-center">
          <span className="text-5xl block mb-4">🎓</span>
          <h3 className="text-lg font-semibold text-surface-900 mb-2">Sin certificados aún</h3>
          <p className="text-sm text-surface-500 mb-6">
            Completa un curso para obtener tu primer certificado
          </p>
          <Link to="/cursos" className="btn-primary">
            Explorar Cursos
          </Link>
        </div>
      )}
    </div>
  )
}
