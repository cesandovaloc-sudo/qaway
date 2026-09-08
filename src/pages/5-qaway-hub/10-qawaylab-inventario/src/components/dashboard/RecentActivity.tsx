import { Package, FileText, Zap, ArrowLeftRight, Activity } from 'lucide-react'
import type { RecentActivity as RecentActivityType } from '@/services/dashboardService'

interface RecentActivityProps {
  activities: RecentActivityType[]
}

const iconMap: Record<string, typeof Package> = {
  'package': Package,
  'file-text': FileText,
  'zap': Zap,
  'arrow-left-right': ArrowLeftRight,
}

const colorMap: Record<string, { bg: string; text: string; ring: string }> = {
  'product': { bg: 'bg-blue-100', text: 'text-blue-600', ring: 'ring-blue-600/10' },
  'quotation': { bg: 'bg-purple-100', text: 'text-purple-600', ring: 'ring-purple-600/10' },
  'campaign': { bg: 'bg-orange-100', text: 'text-orange-600', ring: 'ring-orange-600/10' },
  'movement': { bg: 'bg-emerald-100', text: 'text-emerald-600', ring: 'ring-emerald-600/10' },
}

export function RecentActivity({ activities }: RecentActivityProps) {
  const formatDate = (date: string) => {
    const now = new Date()
    const activityDate = new Date(date)
    const diffMs = now.getTime() - activityDate.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return 'Ahora'
    if (diffMins < 60) return `${diffMins}m`
    if (diffHours < 24) return `${diffHours}h`
    if (diffDays < 7) return `${diffDays}d`
    return activityDate.toLocaleDateString('es-PE', { day: '2-digit', month: 'short' })
  }

  if (activities.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-5">
          <div className="p-2 bg-gray-100 rounded-lg">
            <Activity size={18} className="text-gray-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Actividad reciente</h3>
        </div>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="p-4 bg-gray-50 rounded-2xl mb-4">
            <Package size={32} className="text-gray-300" />
          </div>
          <p className="text-sm text-gray-500 font-medium">Sin actividad reciente</p>
          <p className="text-xs text-gray-400 mt-1">Las acciones aparecerán aquí</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-orange-100 rounded-lg">
            <Activity size={18} className="text-orange-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Actividad reciente</h3>
        </div>
        <span className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs font-semibold rounded-full">
          {activities.length}
        </span>
      </div>
      
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-[19px] top-2 bottom-2 w-px bg-gradient-to-b from-gray-200 via-gray-200 to-transparent" />
        
        <div className="space-y-1">
          {activities.map((activity, index) => {
            const Icon = iconMap[activity.icon] || Package
            const colors = colorMap[activity.type] || { bg: 'bg-gray-100', text: 'text-gray-600', ring: 'ring-gray-600/10' }
            const isLast = index === activities.length - 1

            return (
              <div 
                key={activity.id} 
                className={`
                  relative flex items-start gap-4 
                  p-3 -mx-3 rounded-xl
                  hover:bg-gray-50 
                  transition-colors duration-200
                  group
                `}
              >
                {/* Icon with timeline dot */}
                <div className="relative">
                  <div className={`
                    p-2 rounded-xl ${colors.bg} ${colors.text}
                    ring-1 ${colors.ring}
                    group-hover:scale-110
                    transition-transform duration-200
                  `}>
                    <Icon size={16} strokeWidth={2} />
                  </div>
                  {/* Timeline dot */}
                  {!isLast && (
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-gray-200 rounded-full" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 pt-0.5">
                  <p className="text-sm font-semibold text-gray-900 leading-tight">
                    {activity.title}
                  </p>
                  <p className="text-sm text-gray-500 truncate mt-0.5">
                    {activity.description}
                  </p>
                </div>

                {/* Timestamp */}
                <span className="text-xs font-medium text-gray-400 whitespace-nowrap pt-0.5 tabular-nums">
                  {formatDate(activity.timestamp)}
                </span>
              </div>
            )
          })}
        </div>
      </div>
      
      {activities.length > 5 && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <button className="w-full text-center text-sm font-medium text-orange-600 hover:text-orange-700 transition-colors">
            Ver toda la actividad →
          </button>
        </div>
      )}
    </div>
  )
}
