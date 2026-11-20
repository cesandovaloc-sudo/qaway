import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { CheckCircle2, Lock } from 'lucide-react'
import { getSupabaseClient } from '@/pages/5-qaway-hub/blog-editor/services/supabaseClient'
import UpdatePasswordCard from '@/components/auth/UpdatePasswordCard'

const APP_ROUTE_BY_SLUG = {
  'gestor-proyectos': '/hub/gestor_proyectos',
  inventario: '/hub/inventario',
  crm: '/hub/crm',
  agenda: '/hub/agenda',
  blog: '/hub/blog-editor',
  marketing: '/hub/marketing',
}

async function resolvePostUpdateTarget(supabase, rawRedirect) {
  if (rawRedirect && rawRedirect.startsWith('/') && !rawRedirect.startsWith('//')) {
    return rawRedirect
  }
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return '/login'
    const { data: me } = await supabase
      .from('users')
      .select('tenant_id, is_platform_admin')
      .eq('id', user.id)
      .maybeSingle()

    if (me?.is_platform_admin) return '/hub/panel'
    if (me?.tenant_id) {
      const [{ data: subs }, { data: catalog }] = await Promise.all([
        supabase
          .from('tenant_app_subscriptions')
          .select('app_id, status')
          .eq('tenant_id', me.tenant_id)
          .in('status', ['active', 'trialing']),
        supabase.from('app_catalog').select('id, slug'),
      ])
      const slugById = Object.fromEntries((catalog || []).map((a) => [a.id, a.slug]))
      for (const sub of subs || []) {
        const slug = slugById[sub.app_id]
        if (slug && APP_ROUTE_BY_SLUG[slug]) return APP_ROUTE_BY_SLUG[slug]
      }
    }
  } catch (_) {}
  return '/hub/gestor_proyectos'
}

// Flujo /update-password: sirve tanto para links de recuperación de contraseña
// como para usuarios con cambio obligatorio pendiente al primer ingreso.
export default function UpdatePasswordPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const rawRedirect = searchParams.get('redirect')
  const supabase = getSupabaseClient()

  const [checking, setChecking] = useState(true)
  const [ready, setReady] = useState(false)
  const [doneTarget, setDoneTarget] = useState('')

  useEffect(() => {
    if (!supabase) {
      setChecking(false)
      return
    }
    let alive = true
    supabase.auth.getSession().then(({ data }) => {
      if (!alive) return
      setReady(Boolean(data.session))
      setChecking(false)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (!alive) return
      if (event === 'PASSWORD_RECOVERY' || session) {
        setReady(true)
        setChecking(false)
      }
    })
    return () => {
      alive = false
      sub.subscription.unsubscribe()
    }
  }, [supabase])

  const handleSuccess = async () => {
    const target = await resolvePostUpdateTarget(supabase, rawRedirect)
    setDoneTarget(target)
    setTimeout(() => {
      navigate(target, { replace: true })
    }, 900)
  }

  return (
    <main
      className="min-h-screen w-full flex items-center justify-center px-4 py-12"
      style={{
        backgroundColor: '#f8fafc',
        fontFamily: "'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
    >
      {checking ? (
        <div className="text-sm font-medium text-slate-500">Verificando sesión...</div>
      ) : !ready ? (
        <div
          style={{
            width: '100%',
            maxWidth: '440px',
            backgroundColor: '#ffffff',
            borderRadius: '14px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 20px 25px -5px rgba(15, 23, 42, 0.12)',
            padding: '28px 24px',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              width: '44px',
              height: '44px',
              margin: '0 auto 14px',
              borderRadius: '12px',
              backgroundColor: '#eff6ff',
              color: '#1d4ed8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Lock size={20} />
          </div>
          <h1 className="no-qw" style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>
            Enlace inválido o vencido
          </h1>
          <p style={{ margin: '8px 0 20px', fontSize: '14px', color: '#64748b', lineHeight: 1.5 }}>
            Solicita un nuevo enlace de recuperación desde el inicio de sesión.
          </p>
          <Link
            to="/login"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '10px 20px',
              borderRadius: '8px',
              backgroundColor: '#2563eb',
              color: '#ffffff',
              fontSize: '14px',
              fontWeight: 500,
              textDecoration: 'none',
            }}
          >
            Volver a iniciar sesión
          </Link>
        </div>
      ) : doneTarget ? (
        <div
          style={{
            width: '100%',
            maxWidth: '440px',
            backgroundColor: '#ffffff',
            borderRadius: '14px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 20px 25px -5px rgba(15, 23, 42, 0.12)',
            padding: '28px 24px',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              width: '44px',
              height: '44px',
              margin: '0 auto 14px',
              borderRadius: '12px',
              backgroundColor: '#ecfdf5',
              color: '#059669',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <CheckCircle2 size={22} />
          </div>
          <h1 className="no-qw" style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>
            Contraseña actualizada
          </h1>
          <p style={{ margin: '8px 0 20px', fontSize: '14px', color: '#64748b', lineHeight: 1.5 }}>
            Redirigiendo a tu espacio de trabajo...
          </p>
          <Link
            to={doneTarget}
            replace
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '10px 20px',
              borderRadius: '8px',
              backgroundColor: '#2563eb',
              color: '#ffffff',
              fontSize: '14px',
              fontWeight: 500,
              textDecoration: 'none',
            }}
          >
            Continuar ahora
          </Link>
        </div>
      ) : (
        <UpdatePasswordCard
          supabaseClient={supabase}
          title="Actualiza tu contraseña"
          subtitle="Define una nueva contraseña segura para proteger el acceso a tu cuenta."
          submitLabel="Guardar contraseña"
          onSuccess={handleSuccess}
        />
      )}
    </main>
  )
}
