import {
  ShieldCheck,
  Sparkles,
  WalletCards,
  SmilePlus,
  HeartHandshake,
  Star,
} from 'lucide-react'

export const heroBadges = [
  { icon: ShieldCheck, label: 'Especialistas certificados' },
  { icon: Sparkles, label: 'Tecnología avanzada' },
  { icon: WalletCards, label: 'Planes de pago flexibles' },
]

export const metrics = [
  { value: '+1,200', label: 'sonrisas transformadas' },
  { value: '10+', label: 'años de experiencia' },
  { value: '4.9/5', label: 'valoración de pacientes' },
  { value: '2', label: 'clínicas en tu ciudad' },
]

export const benefits = [
  {
    icon: SmilePlus,
    title: 'Alineación precisa',
    body: 'Tratamientos ortodónticos medidos para mejorar mordida, armonía y estabilidad estética.',
  },
  {
    icon: HeartHandshake,
    title: 'Confianza real',
    body: 'Te acompañamos con seguimiento cercano para que el proceso se sienta claro, seguro y humano.',
  },
  {
    icon: ShieldCheck,
    title: 'Salud bucal protegida',
    body: 'La correcta alineación facilita la higiene y ayuda a prevenir el desgaste prematuro y molestias.',
  },
  {
    icon: Star,
    title: 'Resultados visibles',
    body: 'Combinamos plan clínico, tecnología 3D y estética para cambios notables desde los primeros meses.',
  },
]

export const treatments = [
  {
    title: 'Alineadores invisibles',
    body: 'Alternativa discreta y removible para corregir tu sonrisa sin alterar tu ritmo de vida diario.',
    position: '8% center',
  },
  {
    title: 'Brackets estéticos',
    body: 'Una opción equilibrada entre máxima precisión clínica y una presencia visual suave y translúcida.',
    position: '50% center',
  },
  {
    title: 'Brackets metálicos',
    body: 'Solución de alta versatilidad y probada efectividad para casos que requieren control minucioso.',
    position: '88% center',
  },
]

export const specialists = [
  {
    name: 'Dra. Valeria Martínez',
    role: 'Ortodoncia y Ortopedia Maxilar',
    body: 'Acompaña cada caso con precisión clínica, escucha activa y foco en resultados armónicos y naturales.',
    position: '38% center',
    experience: '7+ años de experiencia',
  },
  {
    name: 'Dr. Andrés Hernández',
    role: 'Ortodoncia y Estética Dental',
    body: 'Trabaja planes personalizados apoyados en diagnóstico digital 3D y control exhaustivo del proceso.',
    position: '72% center',
    experience: '10+ años de experiencia',
  },
]

export const paymentSteps = [
  'Primera evaluación y diagnóstico digital',
  'Plan de tratamiento estructurado por etapas',
  'Opciones de financiamiento a tu medida',
]

export const initialForm = {
  fullName: '',
  phone: '',
  email: '',
  age: '',
  treatmentInterest: 'Ortodoncia',
  message: '',
  acceptedPrivacy: false,
}
