import { useEffect, useState } from 'react'
import { supabase } from '@/config/supabase'

// Gestión de usuarios y marca (SaaS, run 2026-09-21).
// - Sin marca: crearla (register-brand) y quedas admin.
// - Admin: invita por correo (invite-user), asigna rol y apps.
// - Nadie se auto-asigna nada: todo pasa por servidor/RLS.
const ROLES = ['admin', 'editor', 'viewer', 'guest']

export default function UsuariosPage() {
  const [me, setMe] = useState(null)
  const [users, setUsers] = useState([])
  const [apps, setApps] = useState([])
  const [msg, setMsg] = useState('')
  const [invite, setInvite] = useState({ email: '', role: 'viewer', app_slugs: [] })
  const [brand, setBrand] = useState({ name: '', slug: '' })

  async function refresh() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data: meRow } = await supabase.from('users').select('*').eq('id', user.id).single()
    setMe(meRow || null)
    const { data: catalog } = await supabase.from('app_catalog').select('*').order('name')
    setApps(catalog || [])
    if (meRow) {
      const { data: mates } = await supabase.from('users').select('id, email, full_name, role, tenant_id').eq('tenant_id', meRow.tenant_id)
      setUsers(mates || [])
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
    <div className="mx-auto max-w-4xl px-6 py-10">
      <h1 className="text-3xl font-bold">Usuarios y marca</h1>
      {msg && <p className="mt-4 rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-zinc-200">{msg}</p>}

      {!me?.tenant_id && (
        <section className="mt-8 rounded-2xl border border-zinc-800 p-5">
          <h2 className="text-xl font-semibold">Crea tu marca</h2>
          <p className="mt-1 text-sm text-zinc-400">Quedarás como administrador de tu marca.</p>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <input
              value={brand.name} onChange={(e) => setBrand({ ...brand, name: e.target.value })}
              placeholder="Nombre (Mi Empresa)" className="flex-1 rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 outline-none"
            />
            <input
              value={brand.slug} onChange={(e) => setBrand({ ...brand, slug: e.target.value })}
              placeholder="slug (mi-empresa)" className="flex-1 rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 outline-none"
            />
            <button
              onClick={() => callFn('register-brand', brand, 'Marca creada. Ya eres su administrador.')}
              className="rounded-xl bg-white px-5 py-3 font-bold text-black"
            >
              Crear
            </button>
          </div>
        </section>
      )}

      {me?.tenant_id && (
        <>
          <section className="mt-8">
            <h2 className="text-xl font-semibold">Personal de tu marca ({users.length})</h2>
            <ul className="mt-3 divide-y divide-zinc-800 rounded-2xl border border-zinc-800">
              {users.map((u) => (
                <li key={u.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm">
                  <span>{u.full_name || u.email} <span className="text-zinc-500">· {u.email}</span></span>
                  <span className="rounded-full border border-zinc-700 px-3 py-1 font-mono text-xs">{u.role}</span>
                </li>
              ))}
              {users.length === 0 && <li className="px-4 py-3 text-sm text-zinc-500">Sin usuarios visibles.</li>}
            </ul>
          </section>

          {isAdmin && (
            <section className="mt-8 rounded-2xl border border-zinc-800 p-5">
              <h2 className="text-xl font-semibold">Invitar personal</h2>
              <p className="mt-1 text-sm text-zinc-400">Reciben correo, fijan contraseña y entran a tu marca.</p>
              <div className="mt-4 flex flex-col gap-3">
                <input
                  value={invite.email} onChange={(e) => setInvite({ ...invite, email: e.target.value })}
                  placeholder="correo@empresa.com" type="email"
                  className="rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 outline-none"
                />
                <div className="flex flex-wrap gap-2">
                  {ROLES.map((r) => (
                    <button
                      key={r} onClick={() => setInvite({ ...invite, role: r })}
                      className={`rounded-full border px-4 py-2 text-sm ${invite.role === r ? 'bg-white text-black' : 'text-zinc-300'}`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2">
                  {apps.map((a) => (
                    <button
                      key={a.id} onClick={() => toggleApp(a.slug)}
                      className={`rounded-full border px-4 py-2 text-sm ${invite.app_slugs.includes(a.slug) ? 'bg-white text-black' : 'text-zinc-300'}`}
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
                  className="rounded-xl bg-white px-5 py-3 font-bold text-black"
                >
                  Enviar invitación
                </button>
              </div>

              <h3 className="mt-6 font-semibold">Asignar rol y apps a personal existente</h3>
              <ul className="mt-2 space-y-2">
                {users.filter((u) => u.id !== me.id).map((u) => (
                  <li key={u.id} className="flex flex-wrap items-center gap-2 text-sm">
                    <span className="min-w-40">{u.email}</span>
                    <select
                      defaultValue={u.role} id={`role-${u.id}`}
                      className="rounded-lg border border-zinc-800 bg-zinc-900 px-2 py-1"
                    >
                      {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                    </select>
                    <button
                      onClick={() => {
                        const role = document.getElementById(`role-${u.id}`).value
                        assignApps(u.id, me.tenant_id, role, invite.app_slugs)
                      }}
                      className="rounded-lg border border-zinc-700 px-3 py-1"
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
  )
}
