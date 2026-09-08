import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { ShieldCheck, Syringe, AlertTriangle, Stethoscope, Pill, Loader2, HeartPulse } from 'lucide-react'
import { useClinica, formatDate } from '../context/ClinicaContext'
import type { PublicRecord } from '../types'

const SEVERITY_LABEL: Record<string, string> = { mild: 'Leve', moderate: 'Moderada', severe: 'Severa', 'life-threatening': 'Pone en riesgo la vida' }

export default function PublicRecordPage() {
  const { token } = useParams()
  const { getPublicRecord } = useClinica()
  const [record, setRecord] = useState<PublicRecord | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getPublicRecord(token as string).then(({ data, error }) => {
      setLoading(false)
      if (error) {
        setError('Este enlace no es válido o ha expirado.')
        return
      }
      setRecord(data as PublicRecord)
    })
  }, [token])

  if (loading) {
    return (
      <div className="min-h-dvh bg-[#111111] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#ff4b0b] animate-spin" />
      </div>
    )
  }

  if (error || !record) {
    return (
      <div className="min-h-dvh bg-[#111111] text-white flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <ShieldCheck className="w-12 h-12 text-white/20 mx-auto mb-4" />
          <h1 className="text-2xl font-black mb-2">Enlace no válido</h1>
          <p className="text-white/50 text-sm">{error || 'No se pudo cargar el expediente.'}</p>
        </div>
      </div>
    )
  }

  const p = record.patient
  const name = p.patient_type === 'animal' ? p.first_name : `${p.first_name}${p.last_name ? ' ' + p.last_name : ''}`

  return (
    <div className="min-h-dvh bg-[#111111] text-white">
      <div className="max-w-2xl mx-auto px-6 py-10">
        <div className="text-center mb-8">
          <div className="inline-flex w-14 h-14 rounded-2xl bg-[#ff4b0b] items-center justify-center mb-4">
            <HeartPulse className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl font-black">{name}</h1>
          <p className="text-white/40 text-sm mt-1">
            {p.species && <span>{p.species} · </span>}{p.breed && <span>{p.breed} · </span>}
            {p.gender && <span>{p.gender} · </span>}
            {p.birth_date && <span>Nac: {formatDate(p.birth_date)}</span>}
          </p>
          {record.owner && (
            <p className="text-xs text-white/30 mt-1">Tutor: {record.owner.full_name}{record.owner.phone ? ` · ${record.owner.phone}` : ''}</p>
          )}
          <div className="inline-flex items-center gap-1.5 text-[10px] text-green-400 bg-green-400/10 border border-green-400/20 rounded-full px-3 py-1 mt-3">
            <ShieldCheck className="w-3 h-3" /> Acceso seguro · solo lectura
          </div>
        </div>

        {/* Alergias primero: alerta clinica */}
        {record.allergies && record.allergies.length > 0 && (
          <section className="mb-6">
            <h2 className="text-xs font-black uppercase tracking-widest text-red-400 mb-2 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" /> Alergias
            </h2>
            <div className="space-y-2">
              {record.allergies.map((a, i) => (
                <div key={i} className="bg-red-400/5 border border-red-400/20 rounded-xl px-4 py-3">
                  <p className="text-sm font-bold">{a.allergen} <span className="text-[10px] font-normal text-red-300/70 ml-1">{a.severity ? SEVERITY_LABEL[a.severity] : ''}</span></p>
                  {a.reaction_description && <p className="text-xs text-white/50 mt-0.5">{a.reaction_description}</p>}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Vacunas */}
        <section className="mb-6">
          <h2 className="text-xs font-black uppercase tracking-widest text-white/30 mb-2 flex items-center gap-1.5">
            <Syringe className="w-3.5 h-3.5" /> Vacunas
          </h2>
          <div className="space-y-2">
            {(record.vaccinations || []).length === 0 && <p className="text-white/30 text-sm bg-white/5 rounded-xl p-4 text-center">Sin vacunas registradas.</p>}
            {(record.vaccinations || []).map((v, i) => (
              <div key={i} className="bg-[#18181b] border border-white/10 rounded-xl px-4 py-3 flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-bold">{v.vaccine_name}</p>
                  <p className="text-[11px] text-white/40">Aplicada: {formatDate(v.administered_date)}{v.batch_number ? ` · Lote ${v.batch_number}` : ''}</p>
                </div>
                {v.next_due_date && (
                  <span className="text-[10px] font-bold rounded-full px-2.5 py-1 bg-yellow-400/10 text-yellow-400 whitespace-nowrap">
                    Refuerzo: {formatDate(v.next_due_date)}
                  </span>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Consultas */}
        <section className="mb-6">
          <h2 className="text-xs font-black uppercase tracking-widest text-white/30 mb-2 flex items-center gap-1.5">
            <Stethoscope className="w-3.5 h-3.5" /> Consultas
          </h2>
          <div className="space-y-2">
            {(record.consultations || []).length === 0 && <p className="text-white/30 text-sm bg-white/5 rounded-xl p-4 text-center">Sin consultas registradas.</p>}
            {(record.consultations || []).map((c, i) => (
              <div key={i} className="bg-[#18181b] border border-white/10 rounded-xl px-4 py-3">
                <p className="text-[11px] text-white/40 font-bold mb-1">{c.created_at ? new Date(c.created_at).toLocaleDateString('es-PE', { dateStyle: 'medium' }) : ''}</p>
                {c.assessment && <p className="text-sm text-white/70"><b>Diagnóstico:</b> {c.assessment}</p>}
                {c.plan && <p className="text-sm text-white/50 mt-0.5"><b>Plan:</b> {c.plan}</p>}
              </div>
            ))}
          </div>
        </section>

        {/* Recetas */}
        <section className="mb-10">
          <h2 className="text-xs font-black uppercase tracking-widest text-white/30 mb-2 flex items-center gap-1.5">
            <Pill className="w-3.5 h-3.5" /> Recetas
          </h2>
          <div className="space-y-2">
            {(record.prescriptions || []).length === 0 && <p className="text-white/30 text-sm bg-white/5 rounded-xl p-4 text-center">Sin recetas.</p>}
            {(record.prescriptions || []).map((p, i) => (
              <div key={i} className="bg-[#18181b] border border-white/10 rounded-xl px-4 py-3">
                <p className="text-sm font-bold">{p.medication_name}</p>
                <p className="text-[11px] text-white/50">{[p.dosage, p.frequency, p.duration].filter(Boolean).join(' · ')}{p.instructions ? ` — ${p.instructions}` : ''}</p>
              </div>
            ))}
          </div>
        </section>

        <p className="text-center text-[10px] text-white/25 pb-4">Qaway Lab · Clínica — expediente digital</p>
      </div>
    </div>
  )
}
