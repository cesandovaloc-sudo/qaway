import { Link } from 'react-router-dom'
import { useState, useRef, useEffect } from 'react'
import type { User } from '@supabase/supabase-js'

interface UserMenuProps {
  user: User | null
  profile: { full_name?: string | null; role?: string | null } | null
  signOut: () => Promise<void>
}

const menuItems = [
  { to: '/panel', label: 'Mi Aprendizaje', icon: '📊' },
  { to: '/panel/certificados', label: 'Certificados', icon: '🎓', studentOnly: true },
  { to: '/panel/recursos', label: 'Recursos', icon: '📎', studentOnly: true },
  { to: '/panel/compras', label: 'Mis Compras', icon: '🛒' },
  { to: '/panel/configuracion', label: 'Configuración', icon: '⚙️' },
]

function formatShortName(name: string) {
  if (!name) return 'Usuario'
  // Si es un email, tomar la parte antes del @
  if (name.includes('@')) {
    const local = name.split('@')[0]
    return local.charAt(0).toUpperCase() + local.slice(1)
  }
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0]
  // "Nombre Apellido" → "Nombre A."
  const firstName = parts[0]
  const lastInitial = parts[parts.length - 1].charAt(0).toUpperCase()
  return `${firstName} ${lastInitial}.`
}

function getInitial(name: string) {
  if (!name) return '?'
  const first = name.trim().charAt(0)
  return first.toUpperCase()
}

export default function UserMenu({ user, profile, signOut }: UserMenuProps) {
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    function handleClickOutside(e: globalThis.MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    function handleEsc(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [])

  const rawName = profile?.full_name || user?.email || ''
  const displayName = formatShortName(rawName)
  const initial = getInitial(rawName)
  const isTeacher = profile?.role === 'teacher'
  const isAdmin = profile?.role === 'admin'
  const isStudent = !isTeacher && !isAdmin && profile?.role !== 'editor' && profile?.role !== 'support'

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-none p-1.5 transition-colors hover:bg-surface-100"
        aria-haspopup="true"
        aria-expanded={open}
      >
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-100 text-sm font-semibold text-primary-700 transition-transform duration-200 hover:scale-105">
          {initial}
        </div>
        <span className="hidden sm:inline text-sm font-medium text-surface-700">
          {displayName}
        </span>
        <svg
          className={`h-4 w-4 text-surface-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-2 w-64 origin-top-right rounded-none border border-surface-200 bg-white p-2 ring-1 ring-black/5 animate-in fade-in slide-in-from-top-2 duration-150 z-50"
          role="menu"
        >
          <div className="border-b border-surface-100 px-3 pb-3 mb-1">
            <p className="text-sm font-semibold text-surface-900 truncate">{displayName}</p>
            <p className="text-xs text-surface-400 truncate">{user?.email}</p>
            {isTeacher && (
              <span className="mt-1 inline-block rounded-none bg-primary-100 px-2 py-0.5 text-xs font-medium text-primary-700">
                Docente
              </span>
            )}
            {isAdmin && (
              <span className="mt-1 inline-block rounded-none bg-surface-100 px-2 py-0.5 text-xs font-medium text-surface-600">
                Administrador
              </span>
            )}
          </div>

          {menuItems.filter((item) => !item.studentOnly || isStudent).map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-none px-3 py-2.5 text-sm font-medium text-surface-700 transition-colors hover:bg-surface-100"
              role="menuitem"
            >
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </Link>
          ))}

          {(isTeacher || isAdmin) && (
            <div className="border-t border-surface-100 mt-1 pt-1">
              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 rounded-none px-3 py-2.5 text-sm font-medium text-primary-600 transition-colors hover:bg-primary-50"
                  role="menuitem"
                >
                  <span className="text-lg">🔐</span>
                  Panel Admin
                </Link>
              )}
              {isTeacher && (
                <Link
                  to="/docente"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 rounded-none px-3 py-2.5 text-sm font-medium text-primary-600 transition-colors hover:bg-primary-50"
                  role="menuitem"
                >
                  <span className="text-lg">📝</span>
                  Panel Docente
                </Link>
              )}
            </div>
          )}

          <div className="border-t border-surface-100 mt-1 pt-1">
            <button
              onClick={async () => {
                setOpen(false)
                try { await signOut() } catch {}
              }}
              className="flex w-full items-center gap-3 rounded-none px-3 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
              role="menuitem"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Cerrar sesión
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
