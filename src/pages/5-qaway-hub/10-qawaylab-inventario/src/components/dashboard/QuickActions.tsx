import { 
  Plus, 
  Camera, 
  ArrowUpRight, 
  ShoppingCart, 
  Zap,
  FileText
} from 'lucide-react'

interface QuickAction {
  label: string
  icon: typeof Plus
  href: string
  primary?: boolean
  description?: string
}

const actions: QuickAction[] = [
  { 
    label: 'Nuevo producto', 
    icon: Plus, 
    href: '/inventario',
    description: 'Agregar al catálogo'
  },
  { 
    label: 'Capturar con IA', 
    icon: Camera, 
    href: '/captura', 
    primary: true,
    description: 'Foto → Producto'
  },
  { 
    label: 'Ajustar inventario', 
    icon: ArrowUpRight, 
    href: '/inventario/movimientos',
    description: 'Entradas y salidas'
  },
  { 
    label: 'Crear cotización', 
    icon: FileText, 
    href: '/cotizaciones',
    description: 'Enviar a cliente'
  },
  { 
    label: 'Crear paquete', 
    icon: ShoppingCart, 
    href: '/paquetes',
    description: 'Bundle de productos'
  },
  { 
    label: 'Nueva campaña', 
    icon: Zap, 
    href: '/liquidacion',
    description: 'Liquidar inventario'
  },
]

export function QuickActions() {
  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Acciones rápidas</h2>
        <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-xs font-medium rounded-full">
          {actions.length}
        </span>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {actions.map((action) => (
          <a
            key={action.label}
            href={action.href}
            className={`
              relative group
              flex flex-col items-center gap-3 
              p-4 rounded-2xl 
              transition-all duration-300 ease-out
              ${action.primary
                ? `
                  bg-gradient-to-br from-orange-500 to-orange-600 
                  text-white 
                  shadow-lg shadow-orange-500/25
                  hover:shadow-xl hover:shadow-orange-500/30
                  hover:-translate-y-1
                  hover:from-orange-400 hover:to-orange-500
                `
                : `
                  bg-white text-gray-700 
                  border border-gray-100
                  hover:border-orange-200 
                  hover:shadow-lg hover:shadow-gray-200/50
                  hover:-translate-y-1
                  hover:bg-gradient-to-br hover:from-orange-50 hover:to-white
                `
              }
            `}
          >
            {/* Icon */}
            <div className={`
              p-3 rounded-xl
              transition-all duration-300
              ${action.primary
                ? 'bg-white/20 group-hover:bg-white/30 group-hover:scale-110'
                : 'bg-gray-100 group-hover:bg-orange-100 group-hover:scale-110 group-hover:rotate-3'
              }
            `}>
              <action.icon 
                size={22} 
                strokeWidth={1.75}
                className="transition-transform duration-300" 
              />
            </div>
            
            {/* Label */}
            <div className="text-center">
              <span className="text-sm font-semibold block leading-tight">
                {action.label}
              </span>
              {action.description && (
                <span className={`
                  text-xs mt-1 block
                  ${action.primary ? 'text-orange-100' : 'text-gray-400'}
                `}>
                  {action.description}
                </span>
              )}
            </div>
            
            {/* Hover indicator */}
            <div className={`
              absolute inset-0 rounded-2xl 
              ring-1 ring-inset
              ${action.primary
                ? 'ring-white/20'
                : 'ring-orange-500/0 group-hover:ring-orange-500/20'
              }
              transition-all duration-300
            `} />
          </a>
        ))}
      </div>
    </div>
  )
}
