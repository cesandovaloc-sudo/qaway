import { useEffect, useState, type ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { Loader2, Shield } from 'lucide-react'
import { supabase } from '@/config/supabase'
import { useAuth } from '@/context/AuthContext'

export type PlanFeature =
  | 'products'
  | 'inventory'
  | 'movements'
  | 'price_lists'
  | 'packages'
  | 'promotions'
  | 'customers'
  | 'quotations'
  | 'assisted_capture'

export default function RequirePlanFeature({ feature, children }: {
  feature: PlanFeature
  children: ReactNode
}) {
  const { session, loading } = useAuth()
  const location = useLocation()
  const [allowed, setAllowed] = useState<boolean | null>(null)

  useEffect(() => {
    let alive = true
    setAllowed(null)
    if (!session) return () => { alive = false }

    supabase.rpc('user_can_use_feature', {
      p_app_slug: 'inventario',
      p_feature_key: feature,
    }).then(({ data, error }) => {
      if (alive) setAllowed(!error && data === true)
    })

    return () => { alive = false }
  }, [feature, session])

  if (loading || (session && allowed === null)) {
    return <div className="min-h-[50vh] flex items-center justify-center"><Loader2 className="w-8 h-8 text-brand animate-spin" /></div>
  }

  if (!session) {
    const redirect = encodeURIComponent(location.pathname + location.search)
    return <Navigate to={`/login?redirect=${redirect}`} replace />
  }

  if (!allowed) {
    return (
      <div className="flex-1 min-h-[calc(100vh-12rem)] flex items-center justify-center p-6">
        <div className="w-full max-w-md border border-zinc-200/90 rounded-2xl bg-white p-8 sm:p-10 text-center shadow-xs">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-zinc-100 text-zinc-700 border border-zinc-200/60 mb-5">
            <Shield size={24} strokeWidth={1.8} />
          </div>
          <h2 className="text-base sm:text-lg font-bold text-zinc-900 tracking-tight">
            Funcionalidad no incluida en tu plan
          </h2>
          <p className="mt-2 text-sm text-zinc-500 leading-relaxed max-w-sm mx-auto">
            Tu plan actual no tiene habilitado este módulo. Solicita a tu administrador actualizar la suscripción para acceder.
          </p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
