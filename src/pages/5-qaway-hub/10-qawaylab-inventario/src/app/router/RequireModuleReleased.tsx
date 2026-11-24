import type { ReactNode } from 'react'
import { Lock } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useTenant } from '@/context/TenantContext'
import { isInventoryModuleReleased, type InventoryModuleKey } from '@/config/moduleRelease'

export default function RequireModuleReleased({
  moduleKey,
  children,
}: {
  moduleKey: InventoryModuleKey
  children: ReactNode
}) {
  const { profile } = useAuth()
  const { activeTenant } = useTenant()

  const isPlatformAdmin = Boolean(
    profile?.is_platform_admin === true ||
    (profile?.role === 'admin' && !profile?.tenant_id),
  )

  const released = isInventoryModuleReleased(moduleKey, {
    isPlatformAdmin,
    tenant: activeTenant,
  })

  if (released) return <>{children}</>

  return (
    <div className="flex-1 min-h-[calc(100vh-12rem)] flex items-center justify-center p-6">
      <div className="w-full max-w-md border border-zinc-200/90 rounded-2xl bg-white p-8 sm:p-10 text-center shadow-xs">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-amber-50 text-amber-700 border border-amber-200/60 mb-5">
          <Lock size={24} strokeWidth={1.8} />
        </div>
        <h2 className="text-base sm:text-lg font-bold text-zinc-900 tracking-tight">
          Módulo en preparación
        </h2>
        <p className="mt-2 text-sm text-zinc-500 leading-relaxed max-w-sm mx-auto">
          Este módulo aún no está habilitado para tu tenant. Estamos terminando el flujo funcional y lo iremos mostrando progresivamente.
        </p>
      </div>
    </div>
  )
}
