import {
  CalendarDays,
  HeartHandshake,
  ShieldCheck,
  Smile,
  SmilePlus,
  Sparkles,
  Star,
  TrendingUp,
  WalletCards,
} from "lucide-react";

export const heroBadges = [
  { icon: ShieldCheck, label: "Especialistas certificados" },
  { icon: Sparkles, label: "Tecnología avanzada" },
  { icon: WalletCards, label: "Planes de pago flexibles" },
];

export const metrics = [
  { value: "+1,200", label: "sonrisas transformadas" },
  { value: "10+", label: "años de experiencia" },
  { value: "4.9/5", label: "valoración de pacientes" },
  { value: "2", label: "clínicas en tu ciudad" },
];

export const benefits = [
  {
    icon: SmilePlus,
    title: "Alineación precisa y efectiva",
    body: "Corregimos la posición de tus dientes con planes personalizados para lograr resultados óptimos.",
  },
  {
    icon: Smile,
    title: "Mejora tu confianza",
    body: "Una sonrisa alineada realza tu imagen y te ayuda a sentirte seguro en cada momento.",
  },
  {
    icon: ShieldCheck,
    title: "Salud para tu boca",
    body: "Dientes bien alineados facilitan la higiene bucal y previenen problemas a futuro.",
  },
  {
    icon: TrendingUp,
    title: "Resultados que se notan",
    body: "Avances visibles desde las primeras etapas y una sonrisa que transforma tu día a día.",
  },
];

export const treatments = [
  {
    title: "Alineadores invisibles",
    body: "Alternativa discreta y removible para corregir tu sonrisa sin alterar tu rutina diaria ni tu imagen.",
    imageKey: "alineadores",
  },
  {
    title: "Brackets estéticos",
    body: "Una opción equilibrada entre máxima precisión clínica y una presencia visual suave y sutil.",
    imageKey: "bracketsEsteticos",
  },
  {
    title: "Brackets metálicos",
    body: "Solución versátil, resistente y de alta eficacia para casos que demandan control biomecánico continuo.",
    imageKey: "bracketsMetalicos",
  },
];

export const specialists = [
  {
    name: "Dra. Valeria Martínez",
    role: "Ortodoncia y Ortopedia Maxilar",
    body: "Acompaña cada caso con rigor clínico, escucha activa y enfoque en resultados estéticos naturales.",
    position: "38% center",
    experience: "7+ años de experiencia",
  },
  {
    name: "Dr. Andrés Hernández",
    role: "Ortodoncia y Estética Dental",
    body: "Diseña planes personalizados apoyados por diagnóstico digital 3D y control meticuloso del tratamiento.",
    position: "72% center",
    experience: "10+ años de experiencia",
  },
];

export const financingSteps = [
  {
    step: "01",
    title: "Diagnóstico inicial",
    description: "Evaluación clínica integral y escaneo digital para definir el plan exacto.",
  },
  {
    step: "02",
    title: "Plan por etapas",
    description: "Conoce los tiempos estimados y los hitos de evolución antes de empezar.",
  },
  {
    step: "03",
    title: "Pagos flexibles",
    description: "Facilidades en cuotas mensuales adaptadas al ritmo de tu tratamiento.",
  },
];

export const contactDetails = {
  address: "Av. Principal 123, San Isidro, Lima",
  phone: "+51 987 654 321",
  displayPhone: "987 654 321",
  hours: "Lun - Vie: 9:00 am - 7:00 pm | Sáb: 9:00 am - 2:00 pm",
  email: "citas@sonrisadental.pe",
};

export const initialForm = {
  fullName: "",
  phone: "",
  email: "",
  age: "",
  treatmentInterest: "Ortodoncia",
  message: "",
  acceptedPrivacy: false,
};
