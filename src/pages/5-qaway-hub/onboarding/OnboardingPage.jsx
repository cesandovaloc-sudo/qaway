import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '@/config/supabase'

// Onboarding comercial SaaS (2026-09-21):
// cuenta → empresa → apps/planes → resumen → pago/trial → equipo → hub.
// El pago recurrente (Preapproval) lo integra el agente Commerce;
// aquí se crea la marca en borrador + trialing/pending por app.
const PLANS = ['basico', 'intermedio', 'premium']

export default function OnboardingPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [session, setSession] = useState(null)
  const [brand, setBrand] = useState({ name: '', slug: '' })
  const [catalog, setCatalog] = useState([])
  const [pricing, setPricing] = useState([])
  const [chosen, setChosen] = useState({})
  const [msg, setMsg] = useState('')
  const [done, setDone] = useState(null)
  const [pay, setPay] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session || null))
    supabase.from('app_catalog').select('*').order('name').then(({ data }) => setCatalog(data || []))
    supabase.from('app_plan_pricing').select('*, app:app_catalog(slug)').eq('is_available', true).then(({ data }) => setPricing(data || []))
  }, [])

  function priceFor(slug, plan) {
    const row = pricing.find((p) => p.app?.slug === slug && p.plan === plan)
    return row || null
  }

  function total() {
    return Object.entries(chosen).reduce((sum, [slug, plan]) => {
      const row = priceFor(slug, plan)
      return sum + (row ? Number(row.price) : 0)
    }, 0)
  }

  async function finish() {
    setMsg('')
    const plans = Object.entries(chosen).map(([slug, plan]) => ({ slug, plan }))
    if (!brand.name || !brand.slug || plans.length === 0) {
      setMsg('Completa empresa y elige al menos una aplicación.')
      return
    }
    const { data, error } = await supabase.functions.invoke('register-brand', {
      body: { name: brand.name, slug: brand.slug, plans },
    })
    if (error || data?.error) {
      setMsg('Error: ' + (data?.error || error.message))
      return
    }
    setDone(data.tenant)
    // Cobro recurrente con precios reales de BD (si existen; si no, queda trial/pending).
    try {
      const items = plans.map((p) => ({ app_slug: p.slug, plan: p.plan }))
      const { data: payData } = await supabase.functions.invoke('mp-subscription-init', {
        body: { tenant_id: data.tenant.id, items },
      })
      if (payData?.init_point) {
        setPay(payData)
        setMsg('Marca creada. Completa tu suscripción para activar el cobro recurrente.')
      } else if (payData?.error) {
        setMsg('Marca creada (' + payData.error + '). Tus trials activos ya funcionan.')
      }
    } catch {
      setMsg('Marca creada. El pago se configurará al publicar precios.')
    }
    setStep(6)
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <p className="font-mono text-xs uppercase tracking-widest text-zinc-500">Onboarding Qaway · paso {step} de 6</p>
      <h1 className="mt-2 text-3xl font-bold">Activa tu espacio Qaway</h1>
      {msg && <p className="mt-4 rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm">{msg}</p>}

      {step === 1 && (
        <section className="mt-6">
          <h2 className="text-xl font-semibold">1. Tu cuenta</h2>
          {session ? (
            <p className="mt-2 text-sm text-emerald-400">Sesión lista: {session.user.email}</p>
          ) : (
            <p className="mt-2 text-sm text-zinc-400">Primero <Link to="/login?redirect=/onboarding" className="underline">ingresa o crea tu cuenta</Link>.</p>
          )}
          <button disabled={!session} onClick={() => setStep(2)} className="mt-4 rounded-xl bg-white px-5 py-3 font-bold text-black disabled:opacity-40">Continuar</button>
        </section>
      )}

      {step === 2 && session && (
        <section className="mt-6">
          <h2 className="text-xl font-semibold">2. Tu empresa</h2>
          <div className="mt-3 flex flex-col gap-3 sm:flex-row">
            <input value={brand.name} onChange={(e) => setBrand({ ...brand, name: e.target.value })} placeholder="Nombre comercial" className="flex-1 rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 outline-none" />
            <input value={brand.slug} onChange={(e) => setBrand({ ...brand, slug: e.target.value })} placeholder="slug-mi-empresa" className="flex-1 rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 outline-none" />
          </div>
          <button onClick={() => brand.name && brand.slug && setStep(3)} className="mt-4 rounded-xl bg-white px-5 py-3 font-bold text-black">Continuar</button>
        </section>
      )}

      {step === 3 && (
        <section className="mt-6">
          <h2 className="text-xl font-semibold">3. Elige aplicaciones y plan</h2>
          {catalog.map((a) => (
            <div key={a.id} className="mt-3 rounded-2xl border border-zinc-800 p-4">
              <p className="font-semibold">{a.name}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {PLANS.map((p) => {
                  const row = priceFor(a.slug, p)
                  if (!row) return null
                  const active = chosen[a.slug] === p
                  return (
                    <button
                      key={p}
                      onClick={() => setChosen((c) => ({ ...c, [a.slug]: active ? undefined : p }))}
                      className={`rounded-full border px-4 py-2 text-sm ${active ? 'bg-white text-black' : 'text-zinc-300'}`}
                    >
                      {p} · {row.currency} {row.price}{row.trial_days > 0 ? ` · ${row.trial_days}d trial` : ''}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
          <button onClick={() => Object.keys(chosen).length > 0 && setStep(4)} className="mt-4 rounded-xl bg-white px-5 py-3 font-bold text-black">Ver resumen</button>
        </section>
      )}

      {step === 4 && (
        <section className="mt-6">
          <h2 className="text-xl font-semibold">4. Resumen del pedido</h2>
          <ul className="mt-3 divide-y divide-zinc-800 rounded-2xl border border-zinc-800">
            {Object.entries(chosen).map(([slug, plan]) => {
              const row = priceFor(slug, plan)
              return <li key={slug} className="flex justify-between px-4 py-3 text-sm"><span>{slug} · {plan}{row?.trial_days > 0 ? ` (${row.trial_days} días trial)` : ''}</span><span>{row?.currency} {row?.price}</span></li>
            })}
          </ul>
          <p className="mt-3 text-right font-bold">Total mensual: {total().toFixed(2)}</p>
          <button onClick={() => setStep(5)} className="mt-4 rounded-xl bg-white px-5 py-3 font-bold text-black">Continuar al pago</button>
        </section>
      )}

      {step === 5 && (
        <section className="mt-6">
          <h2 className="text-xl font-semibold">5. Pago</h2>
          <p className="mt-2 text-sm text-zinc-400">
            Primero se crea tu marca en borrador. Si tus planes tienen precio vigente,
            se genera el cobro recurrente en Mercado Pago; si tienen trial, se activan
            de inmediato y el resto queda pendiente de pago.
          </p>
          <button onClick={finish} className="mt-4 rounded-xl bg-white px-5 py-3 font-bold text-black">Crear mi espacio</button>
          {pay?.init_point && (
            <a href={pay.init_point} className="mt-3 block rounded-xl border border-zinc-700 px-5 py-3 text-center text-sm font-bold">
              Pagar suscripción ({pay.currency} {pay.total}) en Mercado Pago →
            </a>
          )}
        </section>
      )}

      {step === 6 && done && (
        <section className="mt-6">
          <h2 className="text-xl font-semibold">¡Tu espacio está listo!</h2>
          <p className="mt-2 text-sm text-zinc-400">Marca: {done.slug} · Invita a tu equipo y entra al Hub.</p>
          {pay?.init_point && (
            <a href={pay.init_point} className="mt-3 block rounded-xl border border-zinc-700 px-5 py-3 text-center text-sm font-bold">
              Pagar suscripción ({pay.currency} {pay.total}) en Mercado Pago →
            </a>
          )}
          <div className="mt-4 flex gap-3">
            <Link to="/hub/usuarios" className="rounded-xl border border-zinc-700 px-5 py-3 text-sm">Invitar equipo</Link>
            <button onClick={() => navigate('/hub/panel')} className="rounded-xl bg-white px-5 py-3 font-bold text-black">Entrar al Hub</button>
          </div>
        </section>
      )}
    </div>
  )
}
