import { Link } from 'react-router-dom'
import { Lock, MessageCircle, ArrowLeft } from 'lucide-react'
import { WHATSAPP_LINK } from '@/data/navigation'

const APP_LABELS = {
  'gestor-proyectos': 'Gestor de Proyectos',
  inventario: 'Inventario',
  crm: 'CRM',
  agenda: 'Agenda',
  blog: 'Editor de Blog',
  marketing: 'Marketing Studio',
  panel: 'Hub Panel',
}

function buildWhatsappAccessUrl(moduleLabel) {
  const base = WHATSAPP_LINK.split('?')[0]
  const text = `Hola Qaway Lab, necesito solicitar acceso al módulo "${moduleLabel}" para mi cuenta.`
  return `${base}?text=${encodeURIComponent(text)}`
}

export default function AppAccessLockedView({ moduleKey = null }) {
  const moduleLabel = (moduleKey && APP_LABELS[moduleKey]) || 'este módulo'
  const whatsappHref = buildWhatsappAccessUrl(moduleLabel)

  return (
    <main
      className="min-h-screen w-full bg-[#f8f9fc] text-[#191918] flex items-center justify-center px-6 py-16"
      style={{ fontFamily: "'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}
    >
      <section className="w-full max-w-[460px] rounded-2xl border border-black/10 bg-white p-8 sm:p-10 text-center shadow-[0_24px_60px_rgba(15,23,42,0.08)]">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-[#fe6612]/25 bg-[#fe6612]/10 text-[#fe6612]">
          <Lock size={28} strokeWidth={1.9} aria-hidden="true" />
        </div>

        <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-[#fe6612]">
          Acceso restringido
        </p>

        <h1 className="no-qw text-2xl font-bold tracking-[-0.02em] text-[#191918]">
          Módulo no habilitado
        </h1>

        <p className="mt-3 text-[15px] leading-relaxed text-[#4e4d4a]">
          Tu organización no cuenta con permisos activos para ingresar a{' '}
          <span className="font-semibold text-[#191918]">{moduleLabel}</span>.
          Solicita acceso a tu administrador o comunícate con Qaway Lab para activarlo.
        </p>

        <div className="mt-7 flex flex-col gap-3">
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-[46px] w-full items-center justify-center gap-2 rounded-xl bg-[#fe6612] px-5 py-3 text-[14.5px] font-bold text-white shadow-[0_12px_28px_rgba(254,102,18,0.22)] transition-colors hover:bg-[#e05508]"
          >
            <MessageCircle size={18} strokeWidth={2} aria-hidden="true" />
            Solicitar permiso por WhatsApp
          </a>

          <Link
            to="/"
            className="inline-flex min-h-[42px] w-full items-center justify-center gap-2 rounded-xl border border-black/12 bg-white px-5 py-2.5 text-[14.5px] font-semibold text-[#3e3d3b] transition-colors hover:bg-black/[0.03]"
          >
            <ArrowLeft size={16} strokeWidth={1.9} aria-hidden="true" />
            Volver al inicio
          </Link>
        </div>
      </section>
    </main>
  )
}
