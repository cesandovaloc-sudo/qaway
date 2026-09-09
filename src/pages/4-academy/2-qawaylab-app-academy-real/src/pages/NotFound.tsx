import { Link } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import Logo from '@/components/common/Logo'

export default function NotFound() {
  const { user, profile } = useAuth()

  const getDashboardLink = () => {
    if (!user) return '/academy/app/cursos'
    switch (profile?.role as string | undefined) {
      case 'admin':
      case 'support':
        return '/academy/app/admin'
      case 'teacher':
      case 'editor':
        return '/academy/app/docente'
      default:
        return '/academy/app/panel'
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface-50 px-4">
      <div className="text-center max-w-md">
        {/* Logo único de la app */}
        <Logo className="mb-8" />

        {/* Error code */}
        <div className="mb-6">
          <span className="inline-block text-[120px] font-bold leading-none tracking-tighter text-primary-600/20 select-none">
            404
          </span>
        </div>

        {/* Message */}
        <h1 className="text-2xl font-bold text-surface-900 mb-3">
          Página no encontrada
        </h1>
        <p className="text-surface-500 leading-relaxed mb-8">
          La página que buscas no existe, fue movida o nunca existió.
          Revisa la URL o vuelve al inicio.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to={getDashboardLink()}
            className="btn-primary min-w-[160px] text-center"
          >
            {user ? 'Ir a mi panel' : 'Ir al inicio'}
          </Link>
          <Link
            to="/academy/app/cursos"
            className="btn-secondary min-w-[160px] text-center"
          >
            Explorar cursos
          </Link>
        </div>

        {/* Help text */}
        <p className="mt-12 text-xs text-surface-400">
          ¿Crees que esto es un error?{' '}
          <a href="mailto:soporte@qaway.com" className="text-primary-600 hover:text-primary-700 underline underline-offset-2">
            Contacta a soporte
          </a>
        </p>
      </div>
    </div>
  )
}
