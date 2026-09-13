import { Link } from 'react-router-dom'
import {
  Globe,
  CreditCard,
  AlertTriangle,
  ShoppingCart,
  ExternalLink,
  Sparkles,
  ArrowRight,
} from 'lucide-react'

interface QuickAccessItem {
  id: string
  title: string
  subtitle: string
  badge: string
  badgeColor: string
  icon: typeof Globe
  iconColor: string
  iconBg: string
  href: string
  isExternal?: boolean
}

const quickAccessItems: QuickAccessItem[] = [
  {
    id: 'pedidos-web',
    title: 'Pedidos Web',
    subtitle: 'Revisar órdenes del carrito online, comprobantes y entregas',
    badge: 'Ventas Web',
    badgeColor: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
    icon: Globe,
    iconColor: 'text-blue-400',
    iconBg: 'bg-blue-500/10 group-hover:bg-blue-500/20',
    href: '/ventas/pedidos-web',
  },
  {
    id: 'validar-pagos',
    title: 'Validar Pagos & Vouchers',
    subtitle: 'Confirmar depósitos Yape/Plin, transferencias y créditos',
    badge: 'Finanzas',
    badgeColor: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
    icon: CreditCard,
    iconColor: 'text-amber-400',
    iconBg: 'bg-amber-500/10 group-hover:bg-amber-500/20',
    href: '/ventas',
  },
  {
    id: 'stock-critico',
    title: 'Stock Crítico & Reposición',
    subtitle: 'Supervisar productos con inventario bajo o por agotarse',
    badge: 'Logística',
    badgeColor: 'bg-rose-500/10 text-rose-400 border border-rose-500/20',
    icon: AlertTriangle,
    iconColor: 'text-rose-400',
    iconBg: 'bg-rose-500/10 group-hover:bg-rose-500/20',
    href: '/logistica',
  },
  {
    id: 'pos-mostrador',
    title: 'Punto de Venta (POS)',
    subtitle: 'Emitir venta rápida en mostrador al contado o con tarjeta',
    badge: 'Caja Rápida',
    badgeColor: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    icon: ShoppingCart,
    iconColor: 'text-emerald-400',
    iconBg: 'bg-emerald-500/10 group-hover:bg-emerald-500/20',
    href: '/ventas/nueva',
  },
]

export function QuickAccessCards() {
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
    <section className="space-y-3">
      {/* Header con título y acceso a Tienda Pública */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-brand/10 border border-brand/20">
            <Sparkles size={16} className="text-brand" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white tracking-wide uppercase">
              Accesos Rápidos Prioritarios
            </h2>
            <p className="text-xs text-muted-light/60">
              Páginas clave a revisar para la operación de tu negocio
            </p>
          </div>
        </div>

        <Link
          to="/landings/desarrollo-web-qaway"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-brand hover:text-white bg-brand/10 hover:bg-brand border border-brand/20 rounded-lg transition-all self-start sm:self-auto"
        >
          <span>Ver mi Tienda Web Online</span>
          <ExternalLink size={13} />
        </Link>
      </div>

      {/* Grid de 4 tarjetas ergonómicas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickAccessItems.map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.id}
              to={getHref(item.href)}
              className="group relative flex flex-col justify-between p-4 bg-surface border border-white/10 hover:border-brand/40 rounded-xl transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-brand/5 overflow-hidden"
            >
              {/* Decorador sutil en hover */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-white/5 to-transparent rounded-bl-full pointer-events-none transition-opacity opacity-40 group-hover:opacity-100" />

              <div>
                {/* Cabecera de la tarjeta: Icono y Badge */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div
                    className={`p-2.5 rounded-xl transition-all duration-300 group-hover:scale-105 ${item.iconBg}`}
                  >
                    <Icon size={20} className={item.iconColor} />
                  </div>
                  <span
                    className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${item.badgeColor}`}
                  >
                    {item.badge}
                  </span>
                </div>

                {/* Título y descripción ergonómica */}
                <h3 className="text-base font-semibold text-white group-hover:text-brand transition-colors duration-200 line-clamp-1">
                  {item.title}
                </h3>
                <p className="text-xs text-muted-light/70 mt-1 leading-relaxed line-clamp-2">
                  {item.subtitle}
                </p>
              </div>

              {/* Pie con llamada a la acción */}
              <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs font-medium text-muted-light/60 group-hover:text-brand transition-colors">
                <span>Ingresar ahora</span>
                <ArrowRight
                  size={14}
                  className="transition-transform duration-200 group-hover:translate-x-1"
                />
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
