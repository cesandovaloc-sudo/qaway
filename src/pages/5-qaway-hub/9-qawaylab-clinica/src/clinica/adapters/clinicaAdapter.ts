import { supabase } from '@/config/supabase'
import type { Session } from '@supabase/supabase-js'
import type { Clinic, ClinicMembership, Owner, Patient, Consultation, Vaccination, Allergy, Prescription, Reminder } from '../types'

export interface ClinicaAdapter {
  getSession(): Promise<Session | null>
  onAuthStateChange(cb: (session: Session | null) => void): () => void
  signInWithPassword(email: string, password: string): Promise<{ error: { message: string } | null }>
  signOut(): Promise<void>
  getMembership(userId: string): Promise<{ membership: ClinicMembership | null; clinic: Clinic | null }>
  createClinicAndMembership(name: string, slug: string): Promise<{ data: { clinic: Clinic; membership: ClinicMembership } | null; error: unknown }>
  fetchAll(clinicId: string): Promise<{ patients: Patient[]; owners: Owner[]; consultations: Consultation[]; vaccinations: Vaccination[]; allergies: Allergy[]; prescriptions: Prescription[]; reminders: Reminder[] }>
  upsertOwner(payload: Record<string, unknown>): Promise<{ data: Owner | null; error: unknown }>
  upsertPatient(payload: Record<string, unknown>): Promise<{ data: Patient | null; error: unknown }>
  insertConsultation(payload: Record<string, unknown>): Promise<{ data: Consultation | null; error: unknown }>
  insertVaccination(payload: Record<string, unknown>): Promise<{ data: Vaccination | null; error: unknown }>
  insertAllergy(payload: Record<string, unknown>): Promise<{ data: Allergy | null; error: unknown }>
  deleteAllergy(id: string): Promise<{ error: unknown }>
  insertPrescription(payload: Record<string, unknown>): Promise<{ data: Prescription | null; error: unknown }>
  insertReminder(reminder: Record<string, unknown>): Promise<void>
  createShareLink(payload: Record<string, unknown>): Promise<{ token?: string; error?: unknown }>
  getPublicRecord(token: string): Promise<{ data: unknown; error: unknown }>
}

export const clinicaAdapter: ClinicaAdapter = {
  async getSession() {
    const { data } = await supabase.auth.getSession()
    return data.session
  },
  onAuthStateChange(cb) {
    const { data } = supabase.auth.onAuthStateChange((_event, session) => cb(session))
    return () => data.subscription.unsubscribe()
  },
  async signInWithPassword(email, password) {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error }
  },
  async signOut() {
    await supabase.auth.signOut()
  },
  async getMembership(userId) {
    const { data } = await supabase
      .from('clinic_memberships')
      .select('*, clinics(*)')
      .eq('user_id', userId)
      .limit(1)
      .maybeSingle()
    if (!data) return { membership: null, clinic: null }
    const { clinics, ...membership } = data
    return { membership: membership as ClinicMembership, clinic: clinics as Clinic }
  },
  async createClinicAndMembership(name, slug) {
    const { data, error } = await supabase.rpc('create_clinic_and_membership', { p_name: name, p_slug: slug })
    return { data: data as { clinic: Clinic; membership: ClinicMembership } | null, error }
  },
  async fetchAll(clinicId) {
    const [p, o, c, v, a, pr, r] = await Promise.all([
      supabase.from('patients').select('*, owners(*)').eq('clinic_id', clinicId).order('first_name'),
      supabase.from('owners').select('*').eq('clinic_id', clinicId).order('full_name'),
      supabase.from('consultations').select('*, patients(first_name,last_name)').eq('clinic_id', clinicId).order('created_at', { ascending: false }),
      supabase.from('vaccinations').select('*').eq('clinic_id', clinicId).order('administered_date', { ascending: false }),
      supabase.from('allergies').select('*').eq('clinic_id', clinicId),
      supabase.from('prescriptions').select('*').eq('clinic_id', clinicId).order('created_at', { ascending: false }),
      supabase.from('reminders').select('*').eq('clinic_id', clinicId).eq('status', 'pending').order('send_at'),
    ])
    return {
      patients: (p.data as Patient[]) || [],
      owners: (o.data as Owner[]) || [],
      consultations: (c.data as Consultation[]) || [],
      vaccinations: (v.data as Vaccination[]) || [],
      allergies: (a.data as Allergy[]) || [],
      prescriptions: (pr.data as Prescription[]) || [],
      reminders: (r.data as Reminder[]) || [],
    }
  },
  async upsertOwner(payload) {
    const { data, error } = payload.id
      ? await supabase.from('owners').update(payload).eq('id', payload.id as string).select().single()
      : await supabase.from('owners').insert(payload).select().single()
    return { data: data as Owner | null, error }
  },
  async upsertPatient(payload) {
    const { data, error } = payload.id
      ? await supabase.from('patients').update(payload).eq('id', payload.id as string).select().single()
      : await supabase.from('patients').insert(payload).select().single()
    return { data: data as Patient | null, error }
  },
  async insertConsultation(payload) {
    const { data, error } = await supabase.from('consultations').insert(payload).select().single()
    return { data: data as Consultation | null, error }
  },
  async insertVaccination(payload) {
    const { data, error } = await supabase.from('vaccinations').insert(payload).select().single()
    return { data: data as Vaccination | null, error }
  },
  async insertAllergy(payload) {
    const { data, error } = await supabase.from('allergies').insert(payload).select().single()
    return { data: data as Allergy | null, error }
  },
  async deleteAllergy(id) {
    return await supabase.from('allergies').delete().eq('id', id)
  },
  async insertPrescription(payload) {
    const { data, error } = await supabase.from('prescriptions').insert(payload).select().single()
    return { data: data as Prescription | null, error }
  },
  async insertReminder(reminder) {
    try {
      await supabase.from('reminders').insert(reminder)
    } catch (_e) {
      // no bloquea el flujo principal
    }
  },
  async createShareLink(payload) {
    const { data, error } = await supabase.from('share_links').insert(payload).select('token').single()
    if (error) return { error }
    return { token: (data as { token: string }).token }
  },
  async getPublicRecord(token) {
    return await supabase.rpc('get_public_record', { p_token: token })
  },
}
