import { Link } from 'react-router-dom'
import { useData } from '@/hooks/useData'
import { useAuth } from '@/contexts/AuthContext'
import { getEnrollments } from '@/lib/services'

export default function MyCourses() {
  const { user } = useAuth()
  const { data: enrollments, loading } = useData(
    () => user?.id ? getEnrollments(user.id) : Promise.resolve([]),
    [user?.id]
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
          <p className="mt-3 text-sm text-surface-500">Cargando tus cursos...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="section-title">Mis Cursos</h1>
        <p className="section-subtitle mt-1">
          {enrollments?.length || 0} cursos inscritos
        </p>
      </div>

      {enrollments && enrollments.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {enrollments.map((enrollment) => {
            const course = enrollment.course
            if (!course) return null
            return (
              <Link
                key={enrollment.id}
                to={`/panel/cursos/${course.slug}`}
                className="card-hover overflow-hidden group"
              >
                {/* Course image */}
                <div className="aspect-video w-full overflow-hidden bg-surface-100">
                  {course.image_url ? (
                    <img
                      src={course.image_url}
                      alt={course.title}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-3xl">📚</div>
                  )}
                </div>

                <div className="p-5">
                  <h3 className="font-semibold text-surface-900 mb-1">{course.title}</h3>
                  <div className="flex items-center gap-2 text-xs text-surface-400 mb-3">
                    {course.category && (
                      <span className="rounded-none bg-surface-100 px-2 py-0.5">{course.category}</span>
                    )}
                    {course.level && (
                      <span className="rounded-none bg-surface-100 px-2 py-0.5">{course.level}</span>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-surface-500">
                      {course.duration || 'Duración por definir'}
                    </span>
                    <span className="btn-ghost text-xs px-3 py-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {enrollment.status === 'completed' ? 'Ver certificado →' : 'Continuar →'}
                    </span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      ) : (
        <div className="card p-12 text-center">
          <span className="text-5xl block mb-4">📚</span>
          <h3 className="text-lg font-semibold text-surface-900 mb-2">No tienes cursos inscritos</h3>
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
