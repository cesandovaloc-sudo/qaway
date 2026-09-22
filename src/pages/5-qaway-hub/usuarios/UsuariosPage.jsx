import { useEffect, useState } from 'react'
import { supabase } from '@/config/supabase'

// Gestión de usuarios y marca (SaaS, run 2026-09-21).
// Diseño: lenguaje limpio de /hub/bienvenida (claro, tarjetas blancas).
// Lógica intacta: crear marca, invitar, asignar rol y apps vía servidor/RLS.
const ROLES = ['admin', 'editor', 'viewer', 'guest']

export default function UsuariosPage() {
  const [me, setMe] = useState(null)
  const [users, setUsers] = useState([])
  const [apps, setApps] = useState([])
  const [msg, setMsg] = useState('')
  const [invite, setInvite] = useState({ email: '', role: 'viewer', app_slugs: [] })
  const [brand, setBrand] = useState({ name: '', slug: '' })
  const [loading, setLoading] = useState(true)

  async function refresh() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      // En paralelo lo independiente: perfil + catálogo. Mates depende del tenant.
      const [{ data: meRow }, { data: catalog }] = await Promise.all([
        supabase.from('users').select('*').eq('id', user.id).single(),
        supabase.from('app_catalog').select('*').order('name'),
      ])
      setMe(meRow || null)
      setApps(catalog || [])
      if (meRow?.tenant_id) {
        const { data: mates } = await supabase.from('users').select('id, email, full_name, role, tenant_id').eq('tenant_id', meRow.tenant_id)
        setUsers(mates || [])
      } else {
        setUsers([])
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { refresh() }, [])

  async function callFn(name, body, okMsg) {
    setMsg('')
    const { data, error } = await supabase.functions.invoke(name, { body })
    if (error || data?.error) {
      setMsg('Error: ' + (data?.error || error.message))
      return
    }
    setMsg(okMsg)
    refresh()
  }

  function toggleApp(slug) {
    setInvite((v) => ({
      ...v,
      app_slugs: v.app_slugs.includes(slug) ? v.app_slugs.filter((s) => s !== slug) : [...v.app_slugs, slug],
    }))
  }

  async function assignApps(userId, tenantId, role, appSlugs) {
    setMsg('')
    const { error: rpcErr } = await supabase.rpc('admin_assign_user_tenant', {
      p_user_id: userId, p_tenant_id: tenantId, p_role: role,
    })
    if (rpcErr) {
      setMsg('Error: ' + rpcErr.message)
      return
    }
    if (appSlugs?.length) {
      const rows = appSlugs.map((slug) => {
        const app = apps.find((a) => a.slug === slug)
        return app ? { user_id: userId, tenant_id: tenantId, app_id: app.id, role } : null
      }).filter(Boolean)
      if (rows.length) {
        const { error } = await supabase.from('user_app_roles').upsert(rows, { onConflict: 'user_id,tenant_id,app_id' })
        if (error) {
          setMsg('Error: ' + error.message)
          return
        }
      }
    }
    setMsg('Asignado correctamente.')
    refresh()
  }

  const isAdmin = me?.role === 'admin'

  return (
    <div className="min-h-screen" style={{ background: '#f7f7f8', color: '#111' }}>
      <div className="mx-auto max-w-4xl px-6 py-10">
        <span style={{ display: 'block', color: '#ff4b0b', fontSize: 10, fontWeight: 800, letterSpacing: 1.6 }}>EQUIPO</span>
        <h1 style={{ fontSize: 38, lineHeight: 1.04, letterSpacing: -1.8, margin: '0 0 12px', fontWeight: 800 }}>Usuarios y marca</h1>
        {loading && (
          <div className="mt-8 rounded-2xl border bg-white p-8 text-center" style={{ borderColor: '#e5e5e9' }}>
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-zinc-200 border-t-[#ff4b0b]" />
            <p className="mt-3 text-sm" style={{ color: '#85858c' }}>Cargando tu espacio…</p>
          </div>
        )}
        {!loading && msg && <p className="mt-4 rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm" style={{ color: '#111' }}>{msg}</p>}

        {!loading && !me?.tenant_id && (
          <section className="mt-8 rounded-2xl border bg-white p-5" style={{ borderColor: '#e5e5e9' }}>
            <h2 className="text-xl font-semibold" style={{ color: '#111' }}>Crea tu marca</h2>
            <p className="mt-1 text-sm" style={{ color: '#73737b' }}>Quedarás como administrador de tu marca.</p>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <input
                value={brand.name} onChange={(e) => setBrand({ ...brand, name: e.target.value })}
                placeholder="Nombre (Mi Empresa)"
                className="flex-1 rounded-xl border px-4 outline-none"
                style={{ borderColor: '#dddde2', height: 47 }}
              />
              <input
                value={brand.slug} onChange={(e) => setBrand({ ...brand, slug: e.target.value })}
                placeholder="slug (mi-empresa)"
                className="flex-1 rounded-xl border px-4 outline-none"
                style={{ borderColor: '#dddde2', height: 47 }}
              />
              <button
                onClick={() => callFn('register-brand', brand, 'Marca creada. Ya eres su administrador.')}
                className="rounded-xl px-5 font-bold text-white"
                style={{ background: '#111', height: 48, fontSize: 12 }}
              >
                Crear
              </button>
            </div>
          </section>
        )}

        {!loading && me?.tenant_id && (
          <>
            <section className="mt-8">
              <h2 className="text-xl font-semibold" style={{ color: '#111' }}>Personal de tu marca ({users.length})</h2>
              <ul className="mt-3 divide-y rounded-2xl border bg-white" style={{ borderColor: '#e5e5e9', divideColor: '#eee' }}>
                {users.map((u) => (
                  <li key={u.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm" style={{ color: '#111' }}>
                    <span>{u.full_name || u.email} <span style={{ color: '#85858c' }}>· {u.email}</span></span>
                    <span className="rounded-full border px-3 py-1 font-mono text-xs" style={{ borderColor: '#dddde2', color: '#55555c' }}>{u.role}</span>
                  </li>
                ))}
                {users.length === 0 && <li className="px-4 py-3 text-sm" style={{ color: '#85858c' }}>Sin usuarios visibles.</li>}
              </ul>
            </section>

            {isAdmin && (
              <section className="mt-8 rounded-2xl border bg-white p-5" style={{ borderColor: '#e5e5e9' }}>
                <h2 className="text-xl font-semibold" style={{ color: '#111' }}>Invitar personal</h2>
                <p className="mt-1 text-sm" style={{ color: '#73737b' }}>Reciben correo, fijan contraseña y entran a tu marca.</p>
                <div className="mt-4 flex flex-col gap-3">
                  <input
                    value={invite.email} onChange={(e) => setInvite({ ...invite, email: e.target.value })}
                    placeholder="correo@empresa.com" type="email"
                    className="rounded-xl border px-4 outline-none"
                    style={{ borderColor: '#dddde2', height: 47 }}
                  />
                  <div className="flex flex-wrap gap-2">
                    {ROLES.map((r) => (
                      <button
                        key={r} onClick={() => setInvite({ ...invite, role: r })}
                        className="rounded-full border px-4 py-2 text-sm"
                        style={invite.role === r
                          ? { borderColor: '#ff4b0b', color: '#111', boxShadow: '0 0 0 1px #ff4b0b', fontWeight: 700 }
                          : { borderColor: '#e0e0e5', color: '#55555c' }}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {apps.map((a) => (
                      <button
                        key={a.id} onClick={() => toggleApp(a.slug)}
                        className="rounded-full border px-4 py-2 text-sm"
                        style={invite.app_slugs.includes(a.slug)
                          ? { borderColor: '#ff4b0b', color: '#111', boxShadow: '0 0 0 1px #ff4b0b', fontWeight: 700 }
                          : { borderColor: '#e0e0e5', color: '#55555c' }}
                      >
                        {a.name}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => {
                      const run = async () => {
                        setMsg('')
                        const { data, error } = await supabase.functions.invoke('invite-user', {
                          body: { email: invite.email, tenant_id: me.tenant_id, role: invite.role, app_slugs: invite.app_slugs },
                        })
                        if (error || data?.error) {
                          setMsg('Error: ' + (data?.error || error.message))
                          return
                        }
                        setMsg('Invitación enviada.')
                        setInvite({ email: '', role: 'viewer', app_slugs: [] })
                      }
                      run()
                    }}
                    className="rounded-xl px-5 font-bold text-white"
                    style={{ background: '#111', height: 48, fontSize: 12 }}
                  >
                    Enviar invitación
                  </button>
                </div>

                <p className="mt-6" style={{ color: '#111', fontSize: 12, fontWeight: 800 }}>Asignar rol y apps a personal existente</p>
                <ul className="mt-2 space-y-2">
                  {users.filter((u) => u.id !== me.id).map((u) => (
                    <li key={u.id} className="flex flex-wrap items-center gap-2 text-sm" style={{ color: '#111' }}>
                      <span className="min-w-40">{u.email}</span>
                      <select
                        defaultValue={u.role} id={`role-${u.id}`}
                        className="rounded-lg border px-2 py-1"
                        style={{ borderColor: '#dddde2', background: '#fff' }}
                      >
                        {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                      </select>
                      <button
                        onClick={() => {
                          const role = document.getElementById(`role-${u.id}`).value
                          assignApps(u.id, me.tenant_id, role, invite.app_slugs)
                        }}
                        className="rounded-lg border px-3 py-1"
                        style={{ borderColor: '#dddde2' }}
                      >
                        Aplicar + apps marcadas
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  )
}
