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
      <div className="min-h-[50vh] flex items-center justify-center p-6">
        <div className="border border-zinc-200 rounded-2xl bg-white p-10 text-center max-w-md">
          <div className="mx-auto grid h-11 w-11 place-items-center rounded-full bg-zinc-100 text-muted"><Shield size={18} /></div>
          <p className="mt-3 text-sm font-extrabold text-ink">Funcionalidad no incluida en tu plan</p>
          <p className="mt-1 text-xs text-muted">Solicita a tu administrador actualizar el plan para acceder a esta funcionalidad.</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
