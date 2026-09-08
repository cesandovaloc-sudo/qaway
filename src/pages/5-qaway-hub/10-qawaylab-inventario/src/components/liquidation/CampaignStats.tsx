import { Package, TrendingDown, DollarSign, BarChart3 } from 'lucide-react'
import type { CampaignStats as CampaignStatsType } from '@/services/liquidationService'

interface CampaignStatsProps {
  stats: CampaignStatsType
}

export function CampaignStats({ stats }: CampaignStatsProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
      minimumFractionDigits: 0,
    }).format(value)
  }

  const statCards = [
    {
      label: 'Productos',
      value: stats.total_products,
      icon: Package,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      label: 'Valor referencia',
      value: formatCurrency(stats.total_reference_value),
      icon: DollarSign,
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
    },
    {
      label: 'Valor liquidación',
      value: formatCurrency(stats.total_liquidation_value),
      icon: TrendingDown,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      label: 'Descuento total',
      value: formatCurrency(stats.total_discount),
      icon: BarChart3,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((stat, index) => (
        <div
          key={index}
          className={`${stat.bgColor} rounded-lg p-4 border border-gray-100`}
        >
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg bg-white/50`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">{stat.label}</p>
              <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
