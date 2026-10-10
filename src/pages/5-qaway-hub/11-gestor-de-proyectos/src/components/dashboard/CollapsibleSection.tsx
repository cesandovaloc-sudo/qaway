import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

interface CollapsibleSectionProps {
  /** Identificador único para persistir el estado en localStorage */
  id: string
  title: string
  description?: string
  /** Estado inicial si el usuario no ha interactuado aún */
  defaultOpen?: boolean
  children: React.ReactNode
}

/**
 * Sección colapsable del dashboard.
 * Persiste la preferencia del usuario en localStorage bajo `dashboard-collapsed`.
 * Si el usuario nunca interactuó, usa `defaultOpen`.
 */
export function CollapsibleSection({
  id,
  title,
  description,
  defaultOpen = true,
  children,
}: CollapsibleSectionProps) {
  const STORAGE_KEY = 'dashboard-collapsed'

  const getInitial = () => {
    if (typeof window === 'undefined') return defaultOpen
    try {
      const store = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? '{}')
      if (typeof store[id] === 'boolean') return store[id]
    } catch {
      /* localStorage corrupto: usar default */
    }
    return defaultOpen
  }

  const [isOpen, setIsOpen] = useState(getInitial)

  const toggle = () => {
    const next = !isOpen
    setIsOpen(next)
    try {
      const store = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? '{}')
      store[id] = next
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
    } catch {
      /* sin persistencia disponible: solo estado en memoria */
    }
  }

  return (
    <section className="bg-surface border border-zinc-200 rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={toggle}
        className="w-full flex items-center justify-between gap-3 px-5 py-3.5 hover:bg-zinc-50 transition-colors text-left cursor-pointer"
        aria-expanded={isOpen}
      >
        <div>
          <h2 className="text-sm font-bold text-zinc-900">{title}</h2>
          {description && <p className="text-xs text-zinc-500 mt-0.5">{description}</p>}
        </div>
        <ChevronDown
          size={16}
          className={`shrink-0 text-zinc-400 transition-transform duration-200 ${isOpen ? '' : '-rotate-90'}`}
        />
      </button>
      {isOpen && <div className="px-5 pb-5">{children}</div>}
    </section>
  )
}
