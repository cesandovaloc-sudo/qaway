import React, { useState, type ChangeEvent, type FormEvent, type ReactNode } from 'react'
import { useParams, Link, Navigate } from 'react-router-dom'
import { ArrowLeft, Syringe, AlertTriangle, Pill, Stethoscope, Link2, Copy, Check, Plus, Trash2, FileText, HeartPulse, Activity, Thermometer, type LucideIcon } from 'lucide-react'
import { useClinica, formatDate, todayKey } from '../context/ClinicaContext'

type ModalKind = 'consultation' | 'vaccine' | 'allergy' | 'prescription' | null

// ─── Modal nueva consulta SOAP ───────────────────────────────────────
function NewConsultationForm({ patientId, onClose }: { patientId: string; onClose: () => void }) {
  const { saveConsultation, showToast } = useClinica()
  const [form, setForm] = useState({ subjective: '', objective: '', assessment: '', plan: '', weight_kg: '', temperature: '', heart_rate: '' })
  const set = (k: keyof typeof form) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const { error } = await saveConsultation({ ...form, patient_id: patientId })
    setSaving(false)
    if (!error) { showToast('Consulta guardada'); onClose() }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4" onClick={onClose}>
      <form onSubmit={handleSubmit} onClick={e => e.stopPropagation()} className="bg-[#18181b] border border-white/10 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-black text-lg">Nueva consulta</h2>
          <button type="button" onClick={onClose} className="text-white/40 hover:text-white text-xl leading-none">×</button>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-4">
          <Field label="Peso (kg)" value={form.weight_kg} onChange={set('weight_kg')} />
          <Field label="Temp. (°C)" value={form.temperature} onChange={set('temperature')} />
          <Field label="FC (lpm)" value={form.heart_rate} onChange={set('heart_rate')} />
        </div>

        <div className="space-y-3">
          <TextArea label="S · Subjetivo" value={form.subjective} onChange={set('subjective')} placeholder="Motivo de consulta, síntomas…" />
          <TextArea label="O · Objetivo" value={form.objective} onChange={set('objective')} placeholder="Hallazgos del examen…" />
          <TextArea label="A · Análisis" value={form.assessment} onChange={set('assessment')} placeholder="Diagnóstico presuntivo / confirmado…" />
          <TextArea label="P · Plan" value={form.plan} onChange={set('plan')} placeholder="Tratamiento, estudios, seguimiento…" />
        </div>

        <button type="submit" disabled={saving} className="mt-5 w-full bg-[#ff4b0b] hover:bg-[#ff5c1f] disabled:opacity-50 font-bold rounded-xl py-3 text-sm transition-all">
          {saving ? 'Guardando…' : 'Guardar consulta'}
        </button>
      </form>
    </div>
  )
}

function Field({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label className="text-[11px] text-white/40 font-bold mb-1 block">{label}</label>
      <input {...props} className="w-full bg-[#111111] border border-white/10 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#ff4b0b] transition-colors" />
    </div>
  )
}

function TextArea({ label, ...props }: { label: string } & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <div>
      <label className="text-[11px] text-white/40 font-bold mb-1 block">{label}</label>
      <textarea rows={3} {...props} className="w-full bg-[#111111] border border-white/10 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#ff4b0b] transition-colors resize-y" />
    </div>
  )
}

// ─── Modal nueva vacuna ──────────────────────────────────────────────
function NewVaccineForm({ patientId, onClose }: { patientId: string; onClose: () => void }) {
  const { saveVaccination, showToast } = useClinica()
  const [form, setForm] = useState({ vaccine_name: '', batch_number: '', administered_date: todayKey(), next_due_date: '', notes: '' })
  const set = (k: keyof typeof form) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const { error } = await saveVaccination({ ...form, patient_id: patientId })
    setSaving(false)
    if (!error) { showToast('Vacuna registrada'); onClose() }
  }

  return (
    <Modal title="Registrar vacuna" onClose={onClose}>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Vacuna" value={form.vaccine_name} onChange={set('vaccine_name')} required />
        <Field label="Lote" value={form.batch_number} onChange={set('batch_number')} />
        <Field label="Fecha aplicación" type="date" value={form.administered_date} onChange={set('administered_date')} required />
        <Field label="Próximo refuerzo" type="date" value={form.next_due_date} onChange={set('next_due_date')} />
      </div>
      <button onClick={handleSubmit} disabled={saving} className="mt-4 w-full bg-[#ff4b0b] hover:bg-[#ff5c1f] disabled:opacity-50 font-bold rounded-xl py-3 text-sm transition-all">
        {saving ? 'Guardando…' : 'Guardar'}
      </button>
    </Modal>
  )
}

// ─── Modal nueva alergia ─────────────────────────────────────────────
function NewAllergyForm({ patientId, onClose }: { patientId: string; onClose: () => void }) {
  const { saveAllergy, showToast } = useClinica()
  const [form, setForm] = useState({ allergen: '', severity: 'moderate', reaction_description: '' })
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const { error } = await saveAllergy({ ...form, patient_id: patientId })
    setSaving(false)
    if (!error) { showToast('Alergia registrada'); onClose() }
  }

  return (
    <Modal title="Registrar alergia" onClose={onClose}>
      <div className="space-y-3">
        <Field label="Alérgeno" value={form.allergen} onChange={e => setForm(f => ({ ...f, allergen: e.target.value }))} required />
        <select value={form.severity} onChange={e => setForm(f => ({ ...f, severity: e.target.value }))} className="w-full bg-[#111111] border border-white/10 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#ff4b0b]">
          <option value="mild">Leve</option>
          <option value="moderate">Moderada</option>
          <option value="severe">Severa</option>
          <option value="life-threatening">Pone en riesgo la vida</option>
        </select>
        <TextArea label="Reacción" value={form.reaction_description} onChange={e => setForm(f => ({ ...f, reaction_description: e.target.value }))} />
      </div>
      <button onClick={handleSubmit} disabled={saving} className="mt-4 w-full bg-[#ff4b0b] hover:bg-[#ff5c1f] disabled:opacity-50 font-bold rounded-xl py-3 text-sm transition-all">
        {saving ? 'Guardando…' : 'Guardar'}
      </button>
    </Modal>
  )
}

// ─── Modal nueva receta ──────────────────────────────────────────────
function NewPrescriptionForm({ patientId, onClose }: { patientId: string; onClose: () => void }) {
  const { savePrescription, showToast } = useClinica()
  const [form, setForm] = useState({ medication_name: '', dosage: '', frequency: '', duration: '', instructions: '' })
  const set = (k: keyof typeof form) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const { error } = await savePrescription({ ...form, patient_id: patientId })
    setSaving(false)
    if (!error) { showToast('Receta guardada'); onClose() }
  }

  return (
    <Modal title="Nueva receta" onClose={onClose}>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Medicamento" value={form.medication_name} onChange={set('medication_name')} required />
        <Field label="Dosis" value={form.dosage} onChange={set('dosage')} />
        <Field label="Frecuencia" value={form.frequency} onChange={set('frequency')} placeholder="cada 12h" />
        <Field label="Duración" value={form.duration} onChange={set('duration')} placeholder="7 días" />
      </div>
      <div className="mt-3">
        <TextArea label="Indicaciones" value={form.instructions} onChange={set('instructions')} />
      </div>
      <button onClick={handleSubmit} disabled={saving} className="mt-4 w-full bg-[#ff4b0b] hover:bg-[#ff5c1f] disabled:opacity-50 font-bold rounded-xl py-3 text-sm transition-all">
        {saving ? 'Guardando…' : 'Guardar'}
      </button>
    </Modal>
  )
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4" onClick={onClose}>
      <div onClick={e => e.stopPropagation()} className="bg-[#18181b] border border-white/10 rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-black text-lg">{title}</h2>
          <button type="button" onClick={onClose} className="text-white/40 hover:text-white text-xl leading-none">×</button>
        </div>
        {children}
      </div>
    </div>
  )
}

// ─── Expediente del paciente ─────────────────────────────────────────
export default function PatientDetailPage() {
  const { id } = useParams()
  const { patients, consultations, vaccinations, allergies, prescriptions, patientName, createShareLink, showToast, session } = useClinica()
  const [tab, setTab] = useState<'consultas' | 'vacunas' | 'alergias' | 'recetas'>('consultas')
  const [modal, setModal] = useState<ModalKind>(null)
  const [link, setLink] = useState('')
  const [copied, setCopied] = useState(false)

  if (!session) return <Navigate to="/login" replace />

  const patient = patients.find(p => p.id === id)
  if (!patient) {
    return (
      <div className="min-h-dvh bg-[#111111] text-white flex items-center justify-center">
        <p className="text-white/40">Paciente no encontrado.</p>
      </div>
    )
  }

  const pConsultations = consultations.filter(c => c.patient_id === id)
  const pVaccines = vaccinations.filter(v => v.patient_id === id)
  const pAllergies = allergies.filter(a => a.patient_id === id)
  const pPrescriptions = prescriptions.filter(p => p.patient_id === id)

  const handleShare = async () => {
    const { url, error } = await createShareLink(id as string)
    if (error) { showToast('No se pudo crear el link', 'err'); return }
    setLink(url as string)
    showToast('Link del dueño creado')
  }

  const copyLink = async () => {
    await navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const tabs: { id: 'consultas' | 'vacunas' | 'alergias' | 'recetas'; label: string; icon: LucideIcon; count: number }[] = [
    { id: 'consultas', label: 'Consultas', icon: Stethoscope, count: pConsultations.length },
    { id: 'vacunas', label: 'Vacunas', icon: Syringe, count: pVaccines.length },
    { id: 'alergias', label: 'Alergias', icon: AlertTriangle, count: pAllergies.length },
    { id: 'recetas', label: 'Recetas', icon: Pill, count: pPrescriptions.length },
  ]

  return (
    <div className="min-h-dvh bg-[#111111] text-white">
      <header className="border-b border-white/10">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <Link to="/panel" className="inline-flex items-center gap-1.5 text-xs text-white/40 hover:text-white transition-colors mb-4">
            <ArrowLeft className="w-3.5 h-3.5" /> Panel
          </Link>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <span className="w-14 h-14 rounded-2xl bg-[#ff4b0b]/10 border border-[#ff4b0b]/20 flex items-center justify-center">
                <HeartPulse className="w-7 h-7 text-[#ff4b0b]" />
              </span>
              <div>
                <h1 className="text-2xl font-black">{patientName(patient)}</h1>
                <p className="text-sm text-white/40">
                  {patient.patient_type === 'animal'
                    ? `${patient.species || 'Mascota'}${patient.breed ? ' · ' + patient.breed : ''}${patient.gender ? ' · ' + patient.gender : ''}`
                    : `${patient.gender || ''}${patient.document_id ? ' · DNI ' + patient.document_id : ''}`}
                  {patient.owners?.full_name ? ` · Dueño: ${patient.owners.full_name}` : ''}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {link ? (
                <button onClick={copyLink} className="bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold rounded-xl px-4 py-2.5 inline-flex items-center gap-1.5 transition-colors">
                  {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? '¡Copiado!' : 'Copiar link del dueño'}
                </button>
              ) : (
                <button onClick={handleShare} className="bg-[#ff4b0b] hover:bg-[#ff5c1f] text-xs font-bold rounded-xl px-4 py-2.5 inline-flex items-center gap-1.5 transition-colors">
                  <Link2 className="w-3.5 h-3.5" /> Link del dueño
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 whitespace-nowrap text-xs font-bold rounded-xl px-4 py-2.5 transition-colors ${tab === t.id ? 'bg-[#ff4b0b] text-white' : 'bg-white/5 text-white/40 hover:text-white'}`}>
              <t.icon className="w-3.5 h-3.5" /> {t.label}
              <span className={`text-[10px] rounded-full px-1.5 py-0.5 ${tab === t.id ? 'bg-white/20' : 'bg-white/10'}`}>{t.count}</span>
            </button>
          ))}
          <button onClick={() => setModal(tab === 'consultas' ? 'consultation' : tab === 'vacunas' ? 'vaccine' : tab === 'alergias' ? 'allergy' : 'prescription')} className="ml-auto bg-white/5 hover:bg-white/10 border border-dashed border-white/20 text-xs font-bold rounded-xl px-4 py-2.5 inline-flex items-center gap-1.5 text-white/60 hover:text-white transition-colors">
            <Plus className="w-3.5 h-3.5" />
            {tab === 'consultas' && 'Nueva consulta'}
            {tab === 'vacunas' && 'Registrar vacuna'}
            {tab === 'alergias' && 'Registrar alergia'}
            {tab === 'recetas' && 'Nueva receta'}
          </button>
        </div>

        {/* Secciones */}
        {tab === 'consultas' && (
          <div className="space-y-3">
            {pConsultations.length === 0 && <Empty text="Aún no hay consultas registradas." />}
            {pConsultations.map(c => (
              <div key={c.id} className="bg-[#18181b] border border-white/10 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-white/40 font-bold">{c.created_at ? new Date(c.created_at).toLocaleString('es-PE', { dateStyle: 'medium', timeStyle: 'short' }) : ''}</span>
                  <div className="flex gap-2 text-[10px] text-white/50">
                    {c.weight_kg && <span>⚖ {c.weight_kg} kg</span>}
                    {c.temperature && <span>🌡 {c.temperature}°C</span>}
                    {c.heart_rate && <span>❤ {c.heart_rate}</span>}
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  {c.subjective && <SoapBlock label="S · Subjetivo" text={c.subjective} />}
                  {c.objective && <SoapBlock label="O · Objetivo" text={c.objective} />}
                  {c.assessment && <SoapBlock label="A · Análisis" text={c.assessment} />}
                  {c.plan && <SoapBlock label="P · Plan" text={c.plan} />}
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'vacunas' && (
          <div className="grid md:grid-cols-2 gap-3">
            {pVaccines.length === 0 && <Empty text="Aún no hay vacunas registradas." />}
            {pVaccines.map(v => (
              <div key={v.id} className="bg-[#18181b] border border-white/10 rounded-2xl p-5">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <Syringe className="w-4 h-4 text-[#ff4b0b]" />
                    <p className="font-bold">{v.vaccine_name}</p>
                  </div>
                  {v.next_due_date && (
                    <span className={`text-[10px] font-bold rounded-full px-2.5 py-1 ${v.next_due_date < todayKey() ? 'bg-red-400/10 text-red-400' : 'bg-yellow-400/10 text-yellow-400'}`}>
                      Refuerzo: {formatDate(v.next_due_date)}
                    </span>
                  )}
                </div>
                <p className="text-xs text-white/40">Aplicada: {formatDate(v.administered_date)}{v.batch_number ? ` · Lote ${v.batch_number}` : ''}</p>
                {v.notes && <p className="text-xs text-white/50 mt-2">{v.notes}</p>}
              </div>
            ))}
          </div>
        )}

        {tab === 'alergias' && (
          <div className="space-y-3">
            {pAllergies.length === 0 && <Empty text="Sin alergias registradas." />}
            {pAllergies.map(a => (
              <div key={a.id} className="bg-[#18181b] border border-red-400/20 rounded-2xl p-5 flex items-center justify-between gap-3">
                <div>
                  <p className="font-bold flex items-center gap-2">
                    <AlertTriangle className={`w-4 h-4 ${a.severity === 'life-threatening' || a.severity === 'severe' ? 'text-red-400' : 'text-yellow-400'}`} />
                    {a.allergen}
                  </p>
                  <p className="text-xs text-white/40 mt-1">
                    Severidad: {a.severity === 'mild' ? 'Leve' : a.severity === 'moderate' ? 'Moderada' : a.severity === 'severe' ? 'Severa' : 'Pone en riesgo la vida'}
                    {a.reaction_description ? ` · ${a.reaction_description}` : ''}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'recetas' && (
          <div className="grid md:grid-cols-2 gap-3">
            {pPrescriptions.length === 0 && <Empty text="Aún no hay recetas." />}
            {pPrescriptions.map(p => (
              <div key={p.id} className="bg-[#18181b] border border-white/10 rounded-2xl p-5">
                <p className="font-bold flex items-center gap-2"><Pill className="w-4 h-4 text-[#ff4b0b]" /> {p.medication_name}</p>
                <div className="mt-2 space-y-0.5 text-xs text-white/50">
                  {p.dosage && <p>Dosis: {p.dosage}</p>}
                  {p.frequency && <p>Frecuencia: {p.frequency}</p>}
                  {p.duration && <p>Duración: {p.duration}</p>}
                  {p.instructions && <p className="text-white/60">{p.instructions}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {modal === 'consultation' && <NewConsultationForm patientId={id as string} onClose={() => setModal(null)} />}
      {modal === 'vaccine' && <NewVaccineForm patientId={id as string} onClose={() => setModal(null)} />}
      {modal === 'allergy' && <NewAllergyForm patientId={id as string} onClose={() => setModal(null)} />}
      {modal === 'prescription' && <NewPrescriptionForm patientId={id as string} onClose={() => setModal(null)} />}
    </div>
  )
}

function SoapBlock({ label, text }: { label: string; text: string }) {
  return (
    <div>
      <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-1">{label}</p>
      <p className="text-sm text-white/70 whitespace-pre-wrap">{text}</p>
    </div>
  )
}

function Empty({ text }: { text: string }) {
  return <p className="text-white/30 text-sm bg-white/5 rounded-xl p-6 text-center">{text}</p>
}
