import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, type ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { clinicaAdapter } from '../adapters/clinicaAdapter'
import type {
  Clinic, ClinicMembership, Owner, Patient, Consultation, Vaccination,
  Allergy, Prescription, Reminder, Toast,
} from '../types'

const ClinicaContext = createContext<ClinicaContextValue | null>(null)

// ─── Utilidades de fechas ────────────────────────────────────────────
export function todayKey(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + 'T12:00:00')
  d.setDate(d.getDate() + days)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function formatDate(dateStr?: string | null): string {
  if (!dateStr) return '—'
  try {
    return new Date(dateStr + 'T12:00:00').toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })
  } catch {
    return dateStr
  }
}

// Entradas de formularios: los inputs de React entregan strings, el contexto convierte
// los campos numéricos antes de insertar en Supabase.
export type ConsultationInput = Omit<Partial<Consultation>, 'weight_kg' | 'temperature' | 'heart_rate' | 'respiratory_rate'> & {
  weight_kg?: string | number | null
  temperature?: string | number | null
  heart_rate?: string | number | null
  respiratory_rate?: string | number | null
}

export type VaccinationInput = Partial<Vaccination>

export type AllergyInput = Omit<Partial<Allergy>, 'severity'> & { severity?: string | null }

interface ClinicaContextValue {
  session: Session | null
  clinic: Clinic | null
  membership: ClinicMembership | null
  loading: boolean
  toast: Toast | null
  patients: Patient[]
  owners: Owner[]
  consultations: Consultation[]
  vaccinations: Vaccination[]
  allergies: Allergy[]
  prescriptions: Prescription[]
  reminders: Reminder[]
  upcomingVaccines: Vaccination[]
  patientName: (p: Patient | null | undefined) => string
  signIn: (email: string, password: string) => Promise<{ error: { message: string } | null }>
  signOut: () => Promise<void>
  showToast: (msg: string, type?: 'ok' | 'err') => void
  saveOwner: (owner: Partial<Owner>) => Promise<{ data: Owner | null; error: unknown }>
  savePatient: (patient: Partial<Patient>) => Promise<{ data: Patient | null; error: unknown }>
  saveConsultation: (consultation: ConsultationInput) => Promise<{ data: Consultation | null; error: unknown }>
  saveVaccination: (vaccine: VaccinationInput) => Promise<{ data: Vaccination | null; error: unknown }>
  saveAllergy: (allergy: AllergyInput) => Promise<{ data: Allergy | null; error: unknown }>
  deleteAllergy: (id: string) => Promise<{ error: unknown }>
  savePrescription: (prescription: Partial<Prescription>) => Promise<{ data: Prescription | null; error: unknown }>
  createShareLink: (patientId: string) => Promise<{ url?: string; token?: string; error?: unknown }>
  getPublicRecord: (token: string) => Promise<{ data: unknown; error: unknown }>
}

export function ClinicaProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [clinic, setClinic] = useState<Clinic | null>(null)
  const [membership, setMembership] = useState<ClinicMembership | null>(null)
  const [patients, setPatients] = useState<Patient[]>([])
  const [owners, setOwners] = useState<Owner[]>([])
  const [consultations, setConsultations] = useState<Consultation[]>([])
  const [vaccinations, setVaccinations] = useState<Vaccination[]>([])
  const [allergies, setAllergies] = useState<Allergy[]>([])
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState<Toast | null>(null)

  const showToast = useCallback((msg: string, type: 'ok' | 'err' = 'ok') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }, [])

  // ─── Sesión ───────────────────────────────────────────────────────
  useEffect(() => {
    clinicaAdapter.getSession().then((session) => {
      setSession(session)
      setLoading(false)
    })
    const unsubscribe = clinicaAdapter.onAuthStateChange((s) => setSession(s))
    return () => unsubscribe()
  }, [])

  const signIn = useCallback(async (email: string, password: string) => {
    return await clinicaAdapter.signInWithPassword(email, password)
  }, [])

  const signOut = useCallback(async () => {
    await clinicaAdapter.signOut()
    setClinic(null)
    setMembership(null)
  }, [])

  // ─── Cargar datos de la clínica del usuario ───────────────────────
  const loadClinicData = useCallback(async () => {
    if (!session?.user) return
    setLoading(true)
    const { membership, clinic } = await clinicaAdapter.getMembership(session.user.id)
    if (!membership) {
      // Auto-crear clinica al primer login (RPC security definer, respeta RLS)
      const name = 'Mi Clínica'
      const base = (session.user.email || 'mi-clinica').split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '-')
      const slug = `${base}-${Math.random().toString(36).slice(2, 6)}`
      const { data, error } = await clinicaAdapter.createClinicAndMembership(name, slug)
      if (error || !data) {
        setLoading(false)
        return
      }
      setClinic(data.clinic)
      setMembership(data.membership)
    } else {
      setClinic(clinic)
      setMembership(membership)
    }
    setLoading(false)
  }, [session?.user])

  // Efecto: al tener sesión, cargar todos los datos
  useEffect(() => {
    if (session?.user) loadClinicData()
  }, [session?.user])

  const clinicId = clinic?.id

  const fetchAll = useCallback(async (cid: string) => {
    const data = await clinicaAdapter.fetchAll(cid)
    setPatients(data.patients)
    setOwners(data.owners)
    setConsultations(data.consultations)
    setVaccinations(data.vaccinations)
    setAllergies(data.allergies)
    setPrescriptions(data.prescriptions)
    setReminders(data.reminders)
  }, [])

  useEffect(() => {
    if (clinicId) fetchAll(clinicId)
  }, [clinicId, fetchAll])

  // ─── Alertas calculadas (vacunas por vencer, seguimientos) ────────
  const upcomingVaccines = useMemo(() => {
    const today = todayKey()
    return vaccinations
      .filter(v => v.next_due_date && v.next_due_date <= addDays(today, 30))
      .sort((a, b) => (a.next_due_date || '').localeCompare(b.next_due_date || ''))
  }, [vaccinations])

  const patientName = useCallback((p: Patient | null | undefined): string => {
    if (!p) return ''
    return p.patient_type === 'animal'
      ? `${p.first_name}${p.last_name ? ' ' + p.last_name : ''}${p.species ? ' (' + p.species + ')' : ''}`
      : `${p.first_name}${p.last_name ? ' ' + p.last_name : ''}`
  }, [])

  // ─── CRUD: Dueños ──────────────────────────────────────────────────
  const saveOwner = useCallback(async (owner: Partial<Owner>) => {
    if (!clinicId) return { data: null, error: 'Sin clínica' }
    const payload = { ...owner, clinic_id: clinicId }
    const { data, error } = await clinicaAdapter.upsertOwner(payload)
    if (!error) fetchAll(clinicId)
    return { data, error }
  }, [clinicId, fetchAll])

  // ─── CRUD: Pacientes ───────────────────────────────────────────────
  const savePatient = useCallback(async (patient: Partial<Patient>) => {
    if (!clinicId) return { data: null, error: 'Sin clínica' }
    const payload = { ...patient, clinic_id: clinicId }
    const { data, error } = await clinicaAdapter.upsertPatient(payload)
    if (!error) fetchAll(clinicId)
    return { data, error }
  }, [clinicId, fetchAll])

  // ─── CRUD: Consultas SOAP ──────────────────────────────────────────
  const saveConsultation = useCallback(async (consultation: ConsultationInput) => {
    if (!clinicId) return { data: null, error: 'Sin clínica' }
    const payload = {
      ...consultation,
      clinic_id: clinicId,
      doctor_id: session?.user?.id,
      weight_kg: consultation.weight_kg ? Number(consultation.weight_kg) : null,
      temperature: consultation.temperature ? Number(consultation.temperature) : null,
      heart_rate: consultation.heart_rate ? Number(consultation.heart_rate) : null,
      respiratory_rate: consultation.respiratory_rate ? Number(consultation.respiratory_rate) : null,
    }
    const { data, error } = await clinicaAdapter.insertConsultation(payload)
    if (!error) fetchAll(clinicId)
    return { data, error }
  }, [clinicId, session?.user, fetchAll])

  // ─── CRUD: Vacunas (encola recordatorio del refuerzo) ─────────────
  const saveVaccination = useCallback(async (vaccine: VaccinationInput) => {
    if (!clinicId) return { data: null, error: 'Sin clínica' }
    const payload = { ...vaccine, clinic_id: clinicId }
    const { data, error } = await clinicaAdapter.insertVaccination(payload)
    if (!error && vaccine.next_due_date) {
      // Encolar alerta 3 dias antes del refuerzo (la envia la edge function)
      const send = new Date(vaccine.next_due_date + 'T09:00:00')
      send.setDate(send.getDate() - 3)
      await clinicaAdapter.insertReminder({
        clinic_id: clinicId,
        patient_id: vaccine.patient_id as string,
        rtype: 'vaccine',
        title: `Refuerzo de ${vaccine.vaccine_name}`,
        message: `Tu paciente tiene programado el refuerzo de ${vaccine.vaccine_name} el ${vaccine.next_due_date}.`,
        send_at: send.toISOString(),
        channel: 'email',
      })
    }
    if (!error) fetchAll(clinicId)
    return { data, error }
  }, [clinicId, fetchAll])

  // ─── CRUD: Alergias ────────────────────────────────────────────────
  const saveAllergy = useCallback(async (allergy: AllergyInput) => {
    if (!clinicId) return { data: null, error: 'Sin clínica' }
    const payload = { ...allergy, clinic_id: clinicId }
    const { data, error } = await clinicaAdapter.insertAllergy(payload)
    if (!error) fetchAll(clinicId)
    return { data, error }
  }, [clinicId, fetchAll])

  const deleteAllergy = useCallback(async (id: string) => {
    if (!clinicId) return { error: 'Sin clínica' }
    const { error } = await clinicaAdapter.deleteAllergy(id)
    if (!error) fetchAll(clinicId)
    return { error }
  }, [clinicId, fetchAll])

  // ─── CRUD: Recetas ─────────────────────────────────────────────────
  const savePrescription = useCallback(async (prescription: Partial<Prescription>) => {
    if (!clinicId) return { data: null, error: 'Sin clínica' }
    const payload = { ...prescription, clinic_id: clinicId }
    const { data, error } = await clinicaAdapter.insertPrescription(payload)
    if (!error) fetchAll(clinicId)
    return { data, error }
  }, [clinicId, fetchAll])

  // ─── Link seguro del dueño (solo lectura, sin login) ──────────────
  const createShareLink = useCallback(async (patientId: string) => {
    if (!clinicId) return { error: 'Sin clínica' }
    const { token, error } = await clinicaAdapter.createShareLink({ clinic_id: clinicId, patient_id: patientId, created_by: session?.user?.id })
    if (error || !token) return { error }
    const base = (import.meta.env.VITE_APP_URL as string | undefined) || window.location.origin
    return { url: `${base}/expediente/${token}`, token }
  }, [clinicId, session?.user])

  // ─── Expediente público por token (RPC segura) ────────────────────
  const getPublicRecord = useCallback(async (token: string) => {
    return await clinicaAdapter.getPublicRecord(token)
  }, [])

  const value = useMemo<ClinicaContextValue>(() => ({
    session, clinic, membership, loading, toast,
    patients, owners, consultations, vaccinations, allergies, prescriptions, reminders,
    upcomingVaccines, patientName,
    signIn, signOut, showToast,
    saveOwner, savePatient, saveConsultation, saveVaccination, saveAllergy, deleteAllergy, savePrescription,
    createShareLink, getPublicRecord,
  }), [
    session, clinic, membership, loading, toast,
    patients, owners, consultations, vaccinations, allergies, prescriptions, reminders,
    upcomingVaccines, patientName,
    signIn, signOut, showToast,
    saveOwner, savePatient, saveConsultation, saveVaccination, saveAllergy, deleteAllergy, savePrescription,
    createShareLink, getPublicRecord,
  ])

  return <ClinicaContext.Provider value={value}>{children}</ClinicaContext.Provider>
}

export function useClinica(): ClinicaContextValue {
  const ctx = useContext(ClinicaContext)
  if (!ctx) throw new Error('useClinica debe usarse dentro de ClinicaProvider')
  return ctx
}
