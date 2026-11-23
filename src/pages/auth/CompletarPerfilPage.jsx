import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { AlertCircle } from 'lucide-react'
import { getSupabaseClient } from '@/pages/5-qaway-hub/blog-editor/services/supabaseClient'
import { getSesionCompartida } from '@/router/sessionCache'
import { getAppIdCacheado } from '@/config/appCatalogCache'
import { AUTO_APP_PROVISIONING_ENABLED, TRIAL_DAYS } from '@/config/appAccessPolicy'
import DatosEmpresaCard, {
  contactoDesdeForm,
  formDesdeTenant,
  rubroDesdeForm,
  validarDatosEmpresa,
} from '@/components/auth/DatosEmpresaCard'

export default function CompletarPerfilPage() {
  const [searchParams] = useSearchParams()
  const rawRedirect = searchParams.get('redirect')
  const destino = rawRedirect && rawRedirect.startsWith('/') && !rawRedirect.startsWith('//')
    ? rawRedirect
    : '/hub/panel'

  const supabase = getSupabaseClient()
  const [checking, setChecking] = useState(true)
  const [bloqueo, setBloqueo] = useState('')
  const [error, setError] = useState(null)
  const [errores, setErrores] = useState({})
  const [saving, setSaving] = useState(false)
  const [tenant, setTenant] = useState(null)
  const [userId, setUserId] = useState('')
  const [prefix, setPrefix] = useState('+51')
  const [form, setForm] = useState({
    name: '', country: '', rubro: '', customRubro: '', constituida: false,
    legal: '', ruc: '', phone: '', email: '',
  })

  useEffect(() => {
    let alive = true
    async function cargar() {
      if (!supabase) {
        if (alive) { setBloqueo('No hay conexión con el servidor.'); setChecking(false) }
        return
      }
      try {
        const { data: sessionData } = await getSesionCompartida()
        const user = sessionData?.session?.user
        if (!user) {
          if (alive) { setBloqueo('Necesitas iniciar sesión para continuar.'); setChecking(false) }
          return
        }
        const { data: me, error: meErr } = await supabase
          .from('users')
          .select('tenant_id, is_platform_admin')
          .eq('id', user.id)
          .maybeSingle()
        if (meErr) throw meErr
        if (me?.is_platform_admin) {
          window.location.replace('/hub/panel')
          return
        }
        if (!me?.tenant_id) {
          if (alive) { setBloqueo('Tu cuenta no tiene una empresa asignada.'); setChecking(false) }
          return
        }
        const { data: t, error: tErr } = await supabase
          .from('tenants')
          .select('id, name, legal_name, content, features')
          .eq('id', me.tenant_id)
          .maybeSingle()
        if (tErr) throw tErr
        if (!t) {
          if (alive) { setBloqueo('No se encontró tu empresa.'); setChecking(false) }
          return
        }
        const cargado = formDesdeTenant(t)
        if (alive) {
          setUserId(user.id)
          setTenant(t)
          setPrefix(cargado.prefix)
          setForm(cargado.form)
          setChecking(false)
        }
      } catch (e) {
        if (alive) { setBloqueo(e?.message || 'No se pudo cargar tu empresa.'); setChecking(false) }
      }
    }
    cargar()
    return () => { alive = false }
  }, [supabase])

  function setField(k, v) {
    setForm((f) => ({ ...f, [k]: v }))
    if (errores[k]) setErrores((x) => ({ ...x, [k]: undefined }))
    if (error) setError(null)
  }

  function setCountry(v) {
    setForm((f) => ({ ...f, country: v }))
    if (errores.country) setErrores((x) => ({ ...x, country: undefined }))
  }

  function setNumeric(k, raw, max) {
    setField(k, raw.replace(/\D/g, '').slice(0, max || 25))
  }

  async function handleSubmit() {
    setError(null)
    const errs = validarDatosEmpresa(form)
    if (Object.keys(errs).length) {
      setErrores(errs)
      setError('Completa los campos marcados antes de continuar.')
      return
    }
    setSaving(true)
    try {
      const { error: upErr } = await supabase
        .from('tenants')
        .update({
          name: form.name.trim(),
          legal_name: form.constituida ? form.legal.trim() : null,
          status: 'active',
          content: {
            ...(tenant.content || {}),
            contact: contactoDesdeForm(form, prefix),
            tax_id: form.constituida ? form.ruc.trim() : null,
          },
          features: {
            ...(tenant.features || {}),
            rubro: rubroDesdeForm(form),
            onboarding_completed: true,
          },
        })
        .eq('id', tenant.id)
      if (upErr) throw upErr

      localStorage.setItem(`qaway.onboarding_completed.${tenant.id}`, 'true')

      // Alta automática de la app desactivada (ver appAccessPolicy): completar el
      // perfil ya no regala una prueba de 30 días. El acceso se otorga por
      // invitación por correo o por acceso directo a la app.
      const { data: app, error: appErr } = await getAppIdCacheado('gestor-proyectos', supabase)
      if (appErr || !app?.id) throw new Error('No se pudo resolver la aplicación Gestor de Proyectos.')

      const ahora = new Date()
      const fin = new Date(ahora.getTime() + TRIAL_DAYS * 24 * 60 * 60 * 1000)
      const { error: subErr } = AUTO_APP_PROVISIONING_ENABLED ? await supabase
        .from('tenant_app_subscriptions')
        .upsert({
          tenant_id: tenant.id,
          app_id: app.id,
          plan: 'intermedio',
          status: 'trialing',
          billing_type: 'recurring',
          auto_renew: false,
          trial_started_at: ahora.toISOString(),
          trial_ends_at: fin.toISOString(),
          current_period_start: ahora.toISOString(),
          current_period_end: fin.toISOString(),
          list_price_at_signup: 100,
          contracted_price: 50,
          price_currency: 'PEN',
          trial_days_granted: TRIAL_DAYS,
          trial_requires_card: false,
          trial_source: 'completar_perfil',
          mp_payment_id: null,
          mp_preapproval_id: null,
        }, { onConflict: 'tenant_id,app_id' })
        : { error: null }
      if (subErr) throw subErr

      const { error: rolErr } = await supabase
        .from('user_app_roles')
        .upsert({
          user_id: userId,
          tenant_id: tenant.id,
          app_id: app.id,
          role: 'admin',
        }, { onConflict: 'user_id,tenant_id,app_id' })
      if (rolErr) throw rolErr

      window.location.replace(destino)
    } catch (e) {
      setError(e?.message || 'No se pudo guardar la información.')
    } finally {
      setSaving(false)
    }
  }

  if (checking) {
    return (
      <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc', fontFamily: "'Inter', system-ui, sans-serif" }}>
        <div style={{ fontSize: '14px', color: '#64748b' }}>Cargando tu empresa...</div>
      </main>
    )
  }

  if (bloqueo) {
    return (
      <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc', fontFamily: "'Inter', system-ui, sans-serif" }}>
        <div style={{ width: '100%', maxWidth: '440px', backgroundColor: '#fff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '28px 24px', textAlign: 'center' }}>
          <div style={{ width: '44px', height: '44px', margin: '0 auto 14px', borderRadius: '12px', backgroundColor: '#eff6ff', color: '#1d4ed8', display: 'grid', placeItems: 'center' }}>
            <AlertCircle size={20} />
          </div>
          <h1 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>{bloqueo}</h1>
          <p style={{ margin: '8px 0 20px', fontSize: '14px', color: '#64748b' }}>Inicia sesión para completar los datos de tu empresa.</p>
          <Link to="/login" style={{ display: 'inline-flex', padding: '10px 20px', borderRadius: '8px', backgroundColor: '#2563eb', color: '#fff', fontSize: '14px', textDecoration: 'none' }}>
            Ir a iniciar sesión
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 16px', backgroundColor: '#f8fafc' }}>
      <DatosEmpresaCard
        form={form}
        setField={setField}
        setCountry={setCountry}
        setNumeric={setNumeric}
        prefix={prefix}
        setPrefix={setPrefix}
        errores={errores}
        error={error}
        onSubmit={handleSubmit}
        saving={saving}
      />
    </main>
  )
}
