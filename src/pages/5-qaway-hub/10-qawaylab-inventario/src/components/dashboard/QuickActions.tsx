import { Link } from 'react-router-dom'
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

interface QuickActionsProps {
  hideHeader?: boolean
}

export function QuickActions({ hideHeader = false }: QuickActionsProps = {}) {
  const getHref = (href: string) => {
    const pathname = typeof window !== 'undefined' ? window.location.pathname : ''
    const basePrefix = pathname.startsWith('/hub/inventario')
      ? '/hub/inventario'
      : pathname.startsWith('/inventario')
      ? '/inventario'
      : ''
    if (!basePrefix) return href
    return `${basePrefix}${href.startsWith('/') ? href : `/${href}`}`
  }

  return (
    <div>
      {!hideHeader && (
        <div className="flex items-center gap-2 mb-3">
          <h2 className="text-[15px] font-bold text-[#0f172a]">Acciones rápidas</h2>
          <span className="px-2 py-0.5 bg-[#f4f4f5] text-[#52525b] text-[11px] font-semibold rounded-full border border-[#e4e4e7]">
            {actions.length}
          </span>
        </div>
      )}
      
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {actions.map((action) => (
          <Link
            key={action.label}
            to={getHref(action.href)}
            className={`
              relative group
              flex flex-col items-center gap-2.5 
              p-[14px_12px] rounded-[12px] 
              border border-[#e4e4e7]
              shadow-[0_4px_20px_rgba(0,0,0,0.03)]
              transition-all duration-200 ease-out
              ${action.primary
                ? `
                  bg-[#ff4b0b] 
                  text-white 
                  shadow-[0_2px_8px_rgba(255,75,11,0.25)]
                  hover:bg-[#ea3e00]
                  hover:-translate-y-0.5
                `
                : `
                  bg-white text-[#0f172a] 
                  hover:border-[#cbd5e1] 
                  hover:shadow-[0_10px_25px_rgba(0,0,0,0.06)]
                  hover:-translate-y-0.5
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
          </Link>
        ))}
      </div>
    </div>
  )
}
