import React, { useState, type ChangeEvent, type FormEvent, type ReactNode } from 'react'
import { Link, useNavigate, Navigate } from 'react-router-dom'
import { Plus, LogOut, Users, Syringe, BellRing, Search, PawPrint, User as UserIcon, type LucideIcon } from 'lucide-react'
import { useClinica, formatDate } from '../context/ClinicaContext'
import type { Patient } from '../types'

// ─── Formulario nuevo paciente ───────────────────────────────────────
function NewPatientForm({ onClose }: { onClose: () => void }) {
  const { savePatient, saveOwner, showToast } = useClinica()
  const [type, setType] = useState<'animal' | 'human'>('animal')
  const [form, setForm] = useState({
    first_name: '', last_name: '', species: '', breed: '', gender: '',
    birth_date: '', weight_kg: '', microchip_number: '', document_id: '',
  })
  const [ownerForm, setOwnerForm] = useState({ full_name: '', email: '', phone: '' })
  const [saving, setSaving] = useState(false)

  const set = (k: keyof typeof form) => (e: ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSaving(true)
    let ownerId: string | null = null
    if (ownerForm.full_name) {
      const { data: owner } = await saveOwner(ownerForm)
      ownerId = owner?.id ?? null
    }
    const { error } = await savePatient({
      ...form,
      patient_type: type,
      weight_kg: form.weight_kg ? Number(form.weight_kg) : null,
      owner_id: ownerId,
    })
    setSaving(false)
    if (!error) {
      showToast('Paciente registrado')
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4" onClick={onClose}>
      <form onSubmit={handleSubmit} onClick={e => e.stopPropagation()} className="bg-[#18181b] border border-white/10 rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-black text-lg">Nuevo paciente</h2>
          <button type="button" onClick={onClose} className="text-white/40 hover:text-white text-xl leading-none">×</button>
        </div>

        <div className="flex gap-2 mb-5">
          {[{ v: 'animal', l: 'Mascota' }, { v: 'human', l: 'Persona' }].map(t => (
            <button key={t.v} type="button" onClick={() => setType(t.v as 'animal' | 'human')}
              className={`flex-1 rounded-xl py-2.5 text-sm font-bold transition-colors ${type === t.v ? 'bg-[#ff4b0b] text-white' : 'bg-white/5 text-white/40 hover:text-white'}`}>
              {t.l}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input label="Nombre" value={form.first_name} onChange={set('first_name')} required />
          {type === 'human' && <Input label="Apellido" value={form.last_name} onChange={set('last_name')} />}
          {type === 'animal' && <Input label="Especie" value={form.species} onChange={set('species')} placeholder="Canino / Felino" />}
          {type === 'animal' && <Input label="Raza" value={form.breed} onChange={set('breed')} />}
          <Input label="Sexo" value={form.gender} onChange={set('gender')} placeholder="M / H" />
          <Input label="Nacimiento" type="date" value={form.birth_date} onChange={set('birth_date')} />
          <Input label="Peso (kg)" value={form.weight_kg} onChange={set('weight_kg')} />
          {type === 'animal' && <Input label="Microchip" value={form.microchip_number} onChange={set('microchip_number')} />}
          {type === 'human' && <Input label="DNI" value={form.document_id} onChange={set('document_id')} />}
        </div>

        <h3 className="text-xs font-black uppercase tracking-widest text-white/30 mt-6 mb-3">Dueño / Tutor (opcional)</h3>
        <div className="grid grid-cols-2 gap-3">
          <Input label="Nombre completo" value={ownerForm.full_name} onChange={e => setOwnerForm(o => ({ ...o, full_name: e.target.value }))} />
          <Input label="Teléfono" value={ownerForm.phone} onChange={e => setOwnerForm(o => ({ ...o, phone: e.target.value }))} />
          <Input label="Email" className="col-span-2" value={ownerForm.email} onChange={e => setOwnerForm(o => ({ ...o, email: e.target.value }))} />
        </div>

        <button type="submit" disabled={saving} className="mt-6 w-full bg-[#ff4b0b] hover:bg-[#ff5c1f] disabled:opacity-50 font-bold rounded-xl py-3 text-sm transition-all">
          {saving ? 'Guardando…' : 'Guardar paciente'}
        </button>
      </form>
    </div>
  )
}

function Input({ label, className = '', ...props }: { label: string; className?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className={className}>
      <label className="text-[11px] text-white/40 font-bold mb-1 block">{label}</label>
      <input {...props} className="w-full bg-[#111111] border border-white/10 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#ff4b0b] transition-colors" />
    </div>
  )
}

// ─── Dashboard principal ─────────────────────────────────────────────
export default function DashboardPage() {
  const { clinic, patients, vaccinations, upcomingVaccines, reminders, patientName, signOut, session } = useClinica()
  const [showNew, setShowNew] = useState(false)
  const [query, setQuery] = useState('')
  const navigate = useNavigate()

  if (!session) return <Navigate to="/login" replace />

  const filtered = patients.filter(p => {
    const q = query.toLowerCase()
    return p.first_name.toLowerCase().includes(q) || (p.last_name || '').toLowerCase().includes(q) || (p.species || '').toLowerCase().includes(q)
  })

  const alerts = [...upcomingVaccines.map(v => ({ type: 'vacuna' as const, id: v.id, text: `${v.vaccine_name} · vence ${formatDate(v.next_due_date)}`, patient: v.patient_id })), ...reminders.map(r => ({ type: r.rtype, id: r.id, text: r.title, patient: r.patient_id }))]

  return (
    <div className="min-h-dvh bg-[#111111] text-white">
      <header className="border-b border-white/10 sticky top-0 bg-[#111111]/90 backdrop-blur z-40">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-xl bg-[#ff4b0b] flex items-center justify-center font-black">{clinic?.name?.charAt(0)?.toUpperCase() || 'Q'}</span>
            <div>
              <h1 className="font-bold leading-tight">{clinic?.name || 'Mi Clínica'}</h1>
              <p className="text-[11px] text-white/40">Panel clínico · {patients.length} pacientes</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowNew(true)} className="bg-[#ff4b0b] hover:bg-[#ff5c1f] text-xs font-bold rounded-xl px-4 py-2.5 inline-flex items-center gap-1.5 transition-colors">
              <Plus className="w-3.5 h-3.5" /> Nuevo paciente
            </button>
            <button onClick={signOut} className="text-white/40 hover:text-white text-xs p-2 transition-colors" title="Salir">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <Stat icon={Users} label="Pacientes" value={patients.length} />
          <Stat icon={Syringe} label="Vacunas registradas" value={vaccinations.length} />
          <Stat icon={BellRing} label="Alertas pendientes" value={alerts.length} accent />
        </div>

        {/* Alertas */}
        {alerts.length > 0 && (
          <section className="mb-8">
            <h2 className="text-sm font-black uppercase tracking-widest text-[#ff4b0b] mb-3 flex items-center gap-2">
              <BellRing className="w-4 h-4" /> Alertas y recordatorios
            </h2>
            <div className="grid md:grid-cols-2 gap-2">
              {alerts.slice(0, 6).map((a, i) => (
                <div key={i} className="bg-[#ff4b0b]/5 border border-[#ff4b0b]/20 rounded-xl px-4 py-3 flex items-center gap-3 text-sm">
                  <span className="w-2 h-2 rounded-full bg-[#ff4b0b] animate-pulse" />
                  <span className="text-white/70">{a.text}</span>
                  {a.patient && (
                    <button onClick={() => navigate(`/paciente/${a.patient}`)} className="ml-auto text-[11px] text-[#ff4b0b] hover:underline font-bold">Ver</button>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Busqueda + lista */}
        <div className="flex items-center justify-between mb-4 gap-3">
          <h2 className="font-black text-lg">Pacientes</h2>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              value={query} onChange={e => setQuery(e.target.value)}
              placeholder="Buscar…"
              className="bg-[#18181b] border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm w-56 outline-none focus:border-[#ff4b0b] transition-colors"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map(p => (
            <button key={p.id} onClick={() => navigate(`/paciente/${p.id}`)}
              className="text-left bg-[#18181b] border border-white/10 rounded-2xl p-5 hover:border-[#ff4b0b]/40 transition-all hover:-translate-y-0.5">
              <div className="flex items-center gap-3 mb-3">
                <span className="w-11 h-11 rounded-xl bg-[#ff4b0b]/10 border border-[#ff4b0b]/20 flex items-center justify-center">
                  {p.patient_type === 'animal' ? <PawPrint className="w-5 h-5 text-[#ff4b0b]" /> : <UserIcon className="w-5 h-5 text-[#ff4b0b]" />}
                </span>
                <div>
                  <p className="font-bold">{patientName(p)}</p>
                  <p className="text-[11px] text-white/40">{p.owners?.full_name ? `Dueño: ${p.owners.full_name}` : 'Sin dueño registrado'}</p>
                </div>
              </div>
              <div className="flex gap-2">
                {p.species && <Tag>{p.species}</Tag>}
                {p.breed && <Tag>{p.breed}</Tag>}
                {p.gender && <Tag>{p.gender}</Tag>}
              </div>
            </button>
          ))}
          {filtered.length === 0 && (
            <p className="text-white/30 text-sm bg-white/5 rounded-xl p-6 text-center col-span-full">
              {patients.length === 0 ? 'Aún no hay pacientes. Crea el primero con “Nuevo paciente”.' : 'Sin resultados para la búsqueda.'}
            </p>
          )}
        </div>
      </main>

      {showNew && <NewPatientForm onClose={() => setShowNew(false)} />}
    </div>
  )
}

function Stat({ icon: Icon, label, value, accent }: { icon: LucideIcon; label: string; value: number; accent?: boolean }) {
  return (
    <div className={`bg-[#18181b] border rounded-2xl p-5 ${accent ? 'border-[#ff4b0b]/30' : 'border-white/10'}`}>
      <Icon className={`w-5 h-5 mb-2 ${accent ? 'text-[#ff4b0b]' : 'text-white/40'}`} />
      <p className="text-2xl font-black">{value}</p>
      <p className="text-[11px] text-white/40 font-bold">{label}</p>
    </div>
  )
}

function Tag({ children }: { children: ReactNode }) {
  return <span className="text-[10px] bg-white/5 border border-white/10 rounded-full px-2.5 py-1 text-white/50">{children}</span>
}

export type { Patient }
