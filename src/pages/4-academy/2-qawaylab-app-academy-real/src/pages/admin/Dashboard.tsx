import { Link } from 'react-router-dom'
import { useData } from '@/hooks/useData'
import { supabase } from '@/lib/supabase'
import { getRecentActivity } from '@/lib/services/activity'

async function loadStats() {
  const [studentsResult, teachersResult, coursesResult, revenueResult] = await Promise.all([
    supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'student'),
    supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'teacher'),
    supabase.from('courses').select('id', { count: 'exact', head: true }).eq('status', 'published'),
    supabase.from('payments').select('amount').eq('status', 'completed'),
  ])

  if (studentsResult.error) throw studentsResult.error
  if (teachersResult.error) throw teachersResult.error
  if (coursesResult.error) throw coursesResult.error
  if (revenueResult.error) throw revenueResult.error

  const totalRevenue = (revenueResult.data || []).reduce((sum, p) => sum + parseFloat(p.amount || 0), 0)

  return {
    students: studentsResult.count || 0,
    teachers: teachersResult.count || 0,
    courses: coursesResult.count || 0,
    revenue: totalRevenue.toFixed(2),
  }
}

const statConfig = [
  { key: 'students', label: 'Alumnos', icon: '👥', color: 'bg-surface-100 text-surface-600' },
  { key: 'teachers', label: 'Docentes', icon: '👨‍🏫', color: 'bg-surface-100 text-surface-600' },
  { key: 'courses', label: 'Cursos', icon: '📚', color: 'bg-surface-100 text-surface-600' },
  { key: 'revenue', label: 'Ingresos', icon: '💰', color: 'bg-surface-100 text-surface-600' },
]

function formatCurrency(amount: string | number) {
  const num = parseFloat(String(amount))
  if (num >= 1000) return `$${(num / 1000).toFixed(1)}k`
  return `$${num.toFixed(0)}`
}

function timeAgo(dateStr: string | null | undefined) {
  if (!dateStr) return ''
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
  if (seconds < 60) return 'Hace unos segundos'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `Hace ${minutes}min`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `Hace ${hours}h`
  const days = Math.floor(hours / 24)
  if (days < 30) return `Hace ${days}d`
  return new Date(dateStr).toLocaleDateString('es-PE')
}

export default function AdminDashboard() {
  const { data: stats, loading: statsLoading, error: statsError } = useData(loadStats, [])
  const { data: activities, loading: activityLoading } = useData(() => getRecentActivity(8), [])

  return (
    <div>
      <div className="mb-8">
        <h1 className="section-title">Dashboard</h1>
        <p className="section-subtitle mt-1">Resumen general de la plataforma</p>
      </div>

      {/* Stats Grid */}
      <div className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statConfig.map((stat) => {
          let value = '—'
          if (statsLoading) value = '...'
          else if (!statsError && stats) {
            value = stat.key === 'revenue'
              ? formatCurrency(stats.revenue)
              : String((stats as Record<string, number | string>)[stat.key])
          }
          return (
            <div key={stat.key} className="card p-5">
              <div className="flex items-center justify-between mb-4">
                <div className={`flex h-12 w-12 items-center justify-center rounded-none ${stat.color} text-xl`}>
                  {stat.icon}
                </div>
              </div>
              <p className="text-2xl font-bold text-surface-900">{value}</p>
              <p className="text-sm text-surface-500">{stat.label}</p>
            </div>
          )
        })}
      </div>

      {/* Quick Links */}
      <div className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { to: '/admin/cursos/nuevo', label: 'Nuevo Curso', icon: '➕', color: 'bg-primary-50 text-primary-700' },
          { to: '/admin/alumnos', label: 'Gestionar Alumnos', icon: '👥', color: 'bg-surface-100 text-surface-600' },
          { to: '/admin/docentes', label: 'Gestionar Docentes', icon: '👨‍🏫', color: 'bg-surface-100 text-surface-600' },
          { to: '/admin/permisos', label: 'Roles y Permisos', icon: '🔐', color: 'bg-surface-100 text-surface-600' },
        ].map((link) => (
          <Link key={link.to} to={link.to} className="card-hover p-5 flex items-center gap-4">
            <div className={`flex h-12 w-12 items-center justify-center rounded-none ${link.color} text-xl`}>
              {link.icon}
            </div>
            <span className="font-medium text-surface-900 text-sm">{link.label}</span>
          </Link>
        ))}
      </div>

      {/* Recent Activity */}
      <section>
        <h2 className="text-lg font-semibold text-surface-900 mb-4">Actividad Reciente</h2>
        <div className="card divide-y divide-surface-100">
          {activityLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="mx-auto h-6 w-6 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
            </div>
          ) : activities && activities.length > 0 ? (
            activities.map((act) => (
              <div key={act.id} className="flex items-center justify-between px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-primary-500" />
                  <div>
                    <p className="text-sm font-medium text-surface-900">{act.action}</p>
                    <p className="text-xs text-surface-400">
                      por {act.user?.[0]?.full_name || 'Sistema'}
                    </p>
                  </div>
                </div>
                <span className="text-xs text-surface-400">{timeAgo(act.created_at)}</span>
              </div>
            ))
          ) : (
            <div className="px-6 py-8 text-center text-sm text-surface-400">
              No hay actividad reciente
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
