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
import { QuickActions } from './QuickActions'

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
    badgeColor: 'bg-blue-500/10 text-blue-600 border border-blue-500/20',
    icon: Globe,
    iconColor: 'text-blue-600',
    iconBg: 'bg-blue-500/10 group-hover:bg-blue-500/20',
    href: '/ventas/pedidos-web',
  },
  {
    id: 'validar-pagos',
    title: 'Validar Pagos & Vouchers',
    subtitle: 'Confirmar depósitos Yape/Plin, transferencias y créditos',
    badge: 'Finanzas',
    badgeColor: 'bg-amber-500/10 text-amber-600 border border-amber-500/20',
    icon: CreditCard,
    iconColor: 'text-amber-600',
    iconBg: 'bg-amber-500/10 group-hover:bg-amber-500/20',
    href: '/ventas',
  },
  {
    id: 'stock-critico',
    title: 'Stock Crítico & Reposición',
    subtitle: 'Supervisar productos con inventario bajo o por agotarse',
    badge: 'Logística',
    badgeColor: 'bg-rose-500/10 text-rose-600 border border-rose-500/20',
    icon: AlertTriangle,
    iconColor: 'text-rose-600',
    iconBg: 'bg-rose-500/10 group-hover:bg-rose-500/20',
    href: '/logistica',
  },
  {
    id: 'pos-mostrador',
    title: 'Punto de Venta (POS)',
    subtitle: 'Emitir venta rápida en mostrador al contado o con tarjeta',
    badge: 'Caja Rápida',
    badgeColor: 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20',
    icon: ShoppingCart,
    iconColor: 'text-emerald-600',
    iconBg: 'bg-emerald-500/10 group-hover:bg-emerald-500/20',
    href: '/punto-de-venta',
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
            <h2 className="text-sm font-semibold text-ink tracking-wide uppercase">
              Accesos Rápidos Prioritarios
            </h2>
            <p className="text-xs text-muted">
              Páginas clave a revisar para la operación de tu negocio
            </p>
          </div>
        </div>

        <Link
          to="/landings/desarrollo-web-qaway"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 h-[34px] px-3 text-[13px] font-semibold text-[#34415b] hover:text-white bg-white hover:bg-[#ff4b0b] border border-[#e5ebf4] hover:border-[#ff4b0b] rounded-[8px] transition-all self-start sm:self-auto shadow-2xs"
        >
           <span>Ver mi tienda online</span>
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
              className="group relative flex flex-col justify-between p-[14px_16px] bg-white border border-[#e4e4e7] rounded-[12px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 hover:shadow-[0_10px_25px_rgba(0,0,0,0.06)] transition-all duration-200 ease-out overflow-hidden"
            >
              <div>
                {/* Cabecera de la tarjeta: Icono y Badge */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div
                    className="w-7 h-7 rounded-[8px] bg-[#f4f4f5] text-[#52525b] grid place-items-center flex-shrink-0 group-hover:text-[#ff4b0b] transition-colors"
                  >
                    <Icon size={15} strokeWidth={2} />
                  </div>
                  <span
                    className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${item.badgeColor}`}
                  >
                    {item.badge}
                  </span>
                </div>

                {/* Título y descripción ergonómica */}
                <h3 className="text-[14.5px] font-bold text-[#0f172a] group-hover:text-[#ff4b0b] transition-colors duration-200 line-clamp-1">
                  {item.title}
                </h3>
                <p className="text-[12px] text-[#71809e] mt-1 leading-relaxed line-clamp-2">
                  {item.subtitle}
                </p>
              </div>

              {/* Pie con llamada a la acción */}
              <div className="mt-3 pt-2.5 border-t border-[#f1f5f9] flex items-center justify-between text-[11px] font-semibold text-[#71717a] group-hover:text-[#ff4b0b] transition-colors">
                <span>Ingresar ahora</span>
                <ArrowRight
                  size={13}
                  className="transition-transform duration-200 group-hover:translate-x-1"
                />
              </div>
            </Link>
          )
        })}
      </div>

      {/* Fila 2: Acciones rápidas operativas (6 tarjetas) */}
      <div className="pt-1">
        <QuickActions hideHeader />
      </div>
    </section>
  )
}
