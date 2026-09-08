// ─── Tipos de datos de la app Clínica (alineados con la migración SQL) ───

export interface Clinic {
  id: string
  name: string
  slug: string
  clinic_type: 'human' | 'veterinary' | 'mixed'
  phone?: string | null
  address?: string | null
  timezone: string
  branding?: Record<string, unknown>
  created_at?: string
}

export interface ClinicMembership {
  id?: string
  clinic_id: string
  user_id: string
  role: 'admin' | 'doctor' | 'staff'
  clinics?: Clinic | null
  created_at?: string
}

export interface Owner {
  id: string
  clinic_id: string
  full_name: string
  email?: string | null
  phone?: string | null
  created_at?: string
}

export interface Patient {
  id: string
  clinic_id: string
  owner_id?: string | null
  patient_type: 'animal' | 'human'
  first_name: string
  last_name?: string | null
  species?: string | null
  breed?: string | null
  gender?: string | null
  birth_date?: string | null
  weight_kg?: string | number | null
  microchip_number?: string | null
  document_id?: string | null
  notes?: string | null
  owners?: Owner | null
  created_at?: string
}

export interface Consultation {
  id: string
  clinic_id: string
  patient_id: string
  doctor_id?: string | null
  subjective?: string | null
  objective?: string | null
  assessment?: string | null
  plan?: string | null
  weight_kg?: number | null
  temperature?: number | null
  heart_rate?: number | null
  respiratory_rate?: number | null
  patients?: Pick<Patient, 'first_name' | 'last_name'> | null
  created_at?: string
}

export interface Vaccination {
  id: string
  clinic_id: string
  patient_id: string
  vaccine_name: string
  batch_number?: string | null
  administered_date?: string | null
  next_due_date?: string | null
  notes?: string | null
  created_at?: string
}

export interface Allergy {
  id: string
  clinic_id: string
  patient_id: string
  allergen: string
  reaction_description?: string | null
  severity?: 'mild' | 'moderate' | 'severe' | 'life-threatening' | null
  notes?: string | null
  created_at?: string
}

export interface Prescription {
  id: string
  clinic_id: string
  patient_id: string
  consultation_id?: string | null
  medication_name: string
  dosage?: string | null
  frequency?: string | null
  duration?: string | null
  instructions?: string | null
  created_at?: string
}

export interface Reminder {
  id: string
  clinic_id: string
  patient_id: string
  owner_id?: string | null
  rtype: 'vaccine' | 'follow_up' | 'medication' | 'visit'
  title: string
  message?: string | null
  send_at: string
  channel: 'email' | 'whatsapp'
  status: 'pending' | 'sent' | 'failed'
  created_at?: string
}

export interface ShareLink {
  id?: string
  clinic_id: string
  patient_id: string
  created_by?: string | null
  token: string
  expires_at?: string | null
  created_at?: string
}

export interface Toast {
  msg: string
  type: 'ok' | 'err'
}

export interface PublicRecord {
  patient: Patient
  owner?: Owner | null
  consultations?: Consultation[]
  vaccinations?: Vaccination[]
  allergies?: Allergy[]
  prescriptions?: Prescription[]
}
