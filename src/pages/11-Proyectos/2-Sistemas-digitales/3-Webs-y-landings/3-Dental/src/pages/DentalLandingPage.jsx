import { useState } from "react";
import {
  CalendarDays,
  ChevronRight,
  Clock3,
  HeartHandshake,
  Instagram,
  Mail,
  MapPin,
  Menu,
  MessageCircleMore,
  Phone,
  Play,
  ShieldCheck,
  SmilePlus,
  Sparkles,
  Star,
  Stethoscope,
  WalletCards,
} from "lucide-react";
import {
  benefitsSource,
  contactSource,
  heroSource,
  specialistsSource,
  treatmentsSource,
} from "../assets";
import { createDentalLead } from "../lib/dentalLeads";

const heroBadges = [
  { icon: ShieldCheck, label: "Especialistas certificados" },
  { icon: Sparkles, label: "Tecnologia avanzada" },
  { icon: WalletCards, label: "Planes de pago flexibles" },
];

const metrics = [
  { value: "+1,200", label: "sonrisas transformadas" },
  { value: "10+", label: "anos de experiencia" },
  { value: "4.9/5", label: "valoracion de pacientes" },
  { value: "2", label: "clinicas en tu ciudad" },
];

const benefits = [
  {
    icon: SmilePlus,
    title: "Alineacion precisa",
    body: "Tratamientos ortodonticos medidos para mejorar mordida, armonia y estabilidad.",
  },
  {
    icon: HeartHandshake,
    title: "Confianza real",
    body: "Te acompanamos con seguimiento cercano para que el proceso se sienta claro y humano.",
  },
  {
    icon: ShieldCheck,
    title: "Salud bucal protegida",
    body: "La correcta alineacion facilita la higiene y ayuda a prevenir desgaste y molestias.",
  },
  {
    icon: Star,
    title: "Resultados visibles",
    body: "Combinamos plan clinico, tecnologia y estetica para cambios que se notan desde temprano.",
  },
];

const treatments = [
  {
    title: "Alineadores invisibles",
    body: "Alternativa discreta para corregir tu sonrisa sin alterar tu rutina diaria.",
    position: "8% center",
  },
  {
    title: "Brackets esteticos",
    body: "Una opcion equilibrada entre precision clinica y una presencia visual mas suave.",
    position: "50% center",
  },
  {
    title: "Brackets metalicos",
    body: "Solucion versatil y efectiva para casos que requieren control y fuerza constante.",
    position: "88% center",
  },
];

const specialists = [
  {
    name: "Dra. Valeria Martinez",
    role: "Ortodoncia y Ortopedia Maxilar",
    body: "Acompana cada caso con precision clinica, escucha activa y foco en resultados naturales.",
    position: "38% center",
    experience: "7+ anos de experiencia",
  },
  {
    name: "Dr. Andres Hernandez",
    role: "Ortodoncia y Estetica Dental",
    body: "Trabaja planes personalizados apoyados por diagnostico digital y control detallado del proceso.",
    position: "72% center",
    experience: "10+ anos de experiencia",
  },
];

const initialForm = {
  fullName: "",
  phone: "",
  email: "",
  age: "",
  treatmentInterest: "Ortodoncia",
  message: "",
  acceptedPrivacy: false,
};

function SectionEyebrow({ children }) {
  return (
    <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-blush-200/80 bg-white/90 px-3 py-1 text-[0.72rem] font-semibold uppercase tracking-[0.1em] text-blush-600 shadow-sm backdrop-blur-md">
      <span className="h-1.5 w-1.5 rounded-full bg-blush-500" />
      {children}
    </span>
  );
}

function NavLink({ href, children, onClick }) {
  return (
    <a className="text-sm font-medium text-ink/80 transition hover:text-blush-600" href={href} onClick={onClick}>
      {children}
    </a>
  );
}

export function DentalLandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [formData, setFormData] = useState(initialForm);
  const [formStatus, setFormStatus] = useState({ kind: "idle", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.acceptedPrivacy) {
      setFormStatus({
        kind: "error",
        message: "Debes aceptar la politica de privacidad para enviar el formulario.",
      });
      return;
    }

    setIsSubmitting(true);
    setFormStatus({ kind: "idle", message: "" });

    try {
      const result = await createDentalLead(formData);

      if (result.ok) {
        setFormData(initialForm);
        setFormStatus({ kind: "success", message: result.message });
      } else if (result.mode === "missing_env") {
        setFormStatus({ kind: "info", message: result.message });
      } else {
        setFormStatus({ kind: "error", message: result.message });
      }
    } catch (error) {
      setFormStatus({
        kind: "error",
        message: "Ocurrio un error inesperado al preparar el lead. Intenta nuevamente.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const statusTone = {
    success: "border-emerald-200 bg-emerald-50 text-emerald-700",
    error: "border-rose-200 bg-rose-50 text-rose-700",
    info: "border-blush-200 bg-blush-50 text-blush-700",
    idle: "hidden",
  };

  return (
    <div className="min-h-[100dvh] bg-page-glow text-ink">
      <div className="mx-auto w-full max-w-[1380px] px-4 pb-10 pt-5 sm:px-6 lg:px-8">
        <header className="sticky top-4 z-30 rounded-[32px] border border-white/90 bg-white/82 px-5 py-4 shadow-soft backdrop-blur-xl">
          <div className="flex items-center justify-between gap-4">
            <a className="flex items-center gap-3" href="#inicio">
              <div className="flex h-8 w-8 items-center justify-center rounded-2xl bg-blush-100 text-blush-600 shadow-inner">
                <SmilePlus className="h-4.5 w-4.5" strokeWidth={1.8} />
              </div>
              <div className="leading-none">
                <p className="text-sm font-semibold tracking-[0.18em]">SONRISA</p>
                <p className="mt-0.5 text-[0.55rem] tracking-[0.28em] text-ink/50">CLINICA DENTAL</p>
              </div>
            </a>

            <nav className="hidden items-center gap-9 lg:flex">
              <NavLink href="#servicios">Servicios</NavLink>
              <NavLink href="#tratamientos">Tratamientos</NavLink>
              <NavLink href="#resultados">Resultados</NavLink>
              <NavLink href="#financiamiento">Financiamiento</NavLink>
              <NavLink href="#contacto">Contacto</NavLink>
            </nav>

            <div className="flex items-center gap-3">
              <a className="hidden items-center gap-2 rounded-full bg-gradient-to-r from-blush-500 to-blush-600 px-6 py-3 text-sm font-semibold text-white shadow-glow transition hover:-translate-y-0.5 sm:inline-flex" href="#contacto">
                Agenda tu evaluacion
                <ChevronRight className="h-4 w-4" strokeWidth={2} />
              </a>
              <button
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-blush-100 bg-white text-ink/70 lg:hidden"
                type="button"
                aria-label="Abrir menu"
                onClick={() => setMenuOpen((current) => !current)}
              >
                <Menu className="h-5 w-5" strokeWidth={1.8} />
              </button>
            </div>
          </div>

          {menuOpen ? (
            <div className="mt-4 grid gap-3 rounded-[24px] border border-blush-100 bg-white/90 p-4 lg:hidden">
              <NavLink href="#servicios" onClick={() => setMenuOpen(false)}>Servicios</NavLink>
              <NavLink href="#tratamientos" onClick={() => setMenuOpen(false)}>Tratamientos</NavLink>
              <NavLink href="#resultados" onClick={() => setMenuOpen(false)}>Resultados</NavLink>
              <NavLink href="#financiamiento" onClick={() => setMenuOpen(false)}>Financiamiento</NavLink>
              <NavLink href="#contacto" onClick={() => setMenuOpen(false)}>Contacto</NavLink>
            </div>
          ) : null}
        </header>

<main className="mt-6 space-y-6" id="inicio">
          <section className="relative overflow-hidden rounded-3xl lg:rounded-[36px]" style={{ backgroundImage: `url(${heroSource})`, backgroundPosition: "78% center", backgroundSize: "cover" }}>
            <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-white/10 to-transparent" />
            <div className="relative grid min-h-[560px] gap-6 px-6 py-6 lg:min-h-[580px] lg:grid-cols-[minmax(0,1.1fr)_minmax(380px,0.9fr)] lg:px-8 lg:py-6 xl:px-10">
              <div className="flex flex-col justify-center py-2 lg:pr-4">
                <SectionEyebrow>Ortodoncia personalizada</SectionEyebrow>
                <h1 className="mt-4 max-w-[14ch] text-[2.4rem] font-semibold leading-[1.05] tracking-[-0.04em] sm:text-[3rem] lg:text-[3.6rem]">
                  Brackets que alinean <span className="text-blush-500">tu sonrisa</span> y tu confianza
                </h1>
                <p className="mt-4 max-w-[36ch] text-base leading-relaxed text-ink/70 sm:text-lg">
                  Tratamientos personalizados, seguros y comodos para lograr la sonrisa que mereces.
                </p>

                <div className="mt-5 flex flex-wrap items-center gap-2.5 lg:flex-nowrap">
                  {heroBadges.map(({ icon: Icon, label }) => (
                    <div className="inline-flex items-center gap-2 whitespace-nowrap rounded-full border border-blush-200/50 bg-white/30 px-3 py-1 text-xs font-medium text-ink/65 backdrop-blur-sm sm:text-[0.82rem]" key={label}>
                      <span className="rounded-full bg-blush-100/60 p-1 text-blush-500">
                        <Icon className="h-3.5 w-3.5" strokeWidth={1.9} />
                      </span>
                      {label}
                    </div>
                  ))}
                </div>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <a className="island-btn bg-gradient-to-r from-blush-500 to-blush-600 text-white shadow-glow" href="#contacto">
                    <span>Agenda tu evaluacion</span>
                    <span className="island-btn__icon">
                      <CalendarDays className="h-4 w-4" strokeWidth={2} />
                    </span>
                  </a>
                  <a className="inline-flex min-h-[52px] items-center justify-center rounded-full border border-blush-200/90 bg-white/85 px-6 text-sm font-semibold text-ink shadow-sm transition hover:-translate-y-0.5 active:scale-[0.98]" href="#tratamientos">
                    <Play className="mr-2 h-4 w-4 text-blush-600" fill="currentColor" strokeWidth={1.8} />
                    Conoce tu tratamiento
                  </a>
                </div>
              </div>
            </div>
          </section>

          <section className="grid gap-px overflow-hidden rounded-[34px] border border-white/80 bg-white/75 shadow-soft backdrop-blur-xl md:grid-cols-2 xl:grid-cols-4">
            {metrics.map((metric) => (
              <article className="bg-white/72 px-6 py-8 text-center" key={metric.label}>
                <p className="text-4xl font-semibold tracking-[-0.05em] text-blush-500">{metric.value}</p>
                <p className="mt-2 text-base text-ink/60">{metric.label}</p>
              </article>
            ))}
          </section>

          <section className="grid gap-6 xl:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)]" id="servicios">
            <div className="rounded-[38px] border border-white/80 bg-white/72 p-7 shadow-soft backdrop-blur-xl sm:p-8">
              <SectionEyebrow>Tu sonrisa, nuestro compromiso</SectionEyebrow>
              <h2 className="mt-6 max-w-[10ch] text-[2.8rem] font-semibold leading-[0.94] tracking-[-0.06em] sm:text-[4rem]">
                Mas que brackets, creamos <span className="text-blush-500">sonrisas</span> que transforman
              </h2>
              <p className="mt-5 max-w-[22ch] text-lg leading-relaxed text-ink/62 sm:text-xl">
                Combinamos experiencia, tecnologia y acompanamiento real para darte una experiencia dental clara y confiable.
              </p>
              <div className="mt-8 h-[260px] overflow-hidden rounded-[32px] bg-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.6)] sm:h-[320px]" style={{ backgroundImage: `linear-gradient(90deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.05) 36%, rgba(255,255,255,0.72) 100%), url(${benefitsSource})`, backgroundPosition: "left center", backgroundSize: "cover" }} />
            </div>

            <div className="grid gap-6">
              <div className="grid gap-6 md:grid-cols-2">
                {benefits.map(({ icon: Icon, title, body }) => (
                  <article className="group rounded-[32px] border border-white/90 bg-white/85 p-7 shadow-double-bezel backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-blush-200" key={title}>
                    <div className="inline-flex rounded-2xl border border-blush-200/60 bg-blush-100/80 p-3.5 text-blush-600 transition group-hover:scale-105">
                      <Icon className="h-6 w-6" strokeWidth={1.9} />
                    </div>
                    <h3 className="mt-6 text-3xl font-semibold leading-[1] tracking-[-0.05em]">{title}</h3>
                    <p className="mt-4 text-base leading-7 text-ink/65">{body}</p>
                  </article>
                ))}
              </div>

              <article className="flex flex-col items-start justify-between gap-6 rounded-[34px] border border-white/90 bg-gradient-to-r from-white/95 to-blush-50/90 p-7 shadow-soft sm:flex-row sm:items-center">
                <div>
                  <SectionEyebrow>Sin costo, sin compromiso</SectionEyebrow>
                  <h3 className="mt-4 text-4xl font-semibold tracking-[-0.05em]">
                    Evaluacion inicial <span className="text-blush-500">sin costo</span>
                  </h3>
                  <p className="mt-3 max-w-[44ch] text-base leading-7 text-ink/65">
                    Conoce el estado de tu sonrisa, recibe un diagnostico profesional y un plan personalizado desde la primera visita.
                  </p>
                </div>
                <a className="inline-flex min-h-[56px] shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-blush-500 to-blush-600 px-7 text-sm font-semibold text-white shadow-glow transition hover:-translate-y-0.5" href="#contacto">
                  Quiero mi evaluacion gratis
                </a>
              </article>
            </div>
          </section>

          <section className="rounded-[38px] border border-white/85 bg-white/78 p-7 shadow-soft backdrop-blur-xl sm:p-8" id="tratamientos">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <SectionEyebrow>Mas opciones para tu sonrisa</SectionEyebrow>
                <h2 className="mt-6 max-w-[12ch] text-[2.8rem] font-semibold leading-[0.95] tracking-[-0.06em] sm:text-[4rem]">
                  Explora otros <span className="text-blush-500">tratamientos</span>
                </h2>
              </div>
              <p className="max-w-[36ch] text-base leading-7 text-ink/65">
                Soluciones disenadas para cada etapa de tu sonrisa, con opciones funcionales y esteticas segun tu necesidad.
              </p>
            </div>

            <div className="mt-8 grid gap-6 lg:grid-cols-3">
              {treatments.map((item) => (
                <article className="group overflow-hidden rounded-[32px] border border-white/90 bg-white/88 shadow-double-bezel transition duration-300 hover:-translate-y-1 hover:border-blush-200" key={item.title}>
                  <div className="h-[240px] bg-[#f9dbe4] transition duration-500 group-hover:scale-105" style={{ backgroundImage: `url(${treatmentsSource})`, backgroundPosition: item.position, backgroundSize: "cover" }} />
                  <div className="p-7">
                    <h3 className="text-3xl font-semibold tracking-[-0.05em]">{item.title}</h3>
                    <p className="mt-4 text-base leading-7 text-ink/65">{item.body}</p>
                    <a className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-blush-600 transition group-hover:gap-3" href="#contacto">
                      Ver tratamiento
                      <ChevronRight className="h-4 w-4" strokeWidth={2} />
                    </a>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]" id="resultados">
            <article className="overflow-hidden rounded-[38px] border border-white/80 bg-white/76 shadow-soft backdrop-blur-xl">
              <div className="min-h-[420px] bg-[#fde7ee]" style={{ backgroundImage: `linear-gradient(90deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.02) 35%, rgba(255,255,255,0.58) 100%), url(${benefitsSource})`, backgroundPosition: "left center", backgroundSize: "cover" }} />
              <div className="p-7 sm:p-8">
                <SectionEyebrow>Resultados que inspiran confianza</SectionEyebrow>
                <h2 className="mt-6 max-w-[11ch] text-[2.8rem] font-semibold leading-[0.95] tracking-[-0.06em] sm:text-[4rem]">
                  Un tratamiento pensado para verse bien y sentirse mejor
                </h2>
                <p className="mt-5 max-w-[38ch] text-base leading-7 text-ink/62">
                  Alineamos funcionalidad, estetica y acompanamiento para que el cambio no solo se note, sino que tambien sea sostenible en el tiempo.
                </p>
              </div>
            </article>

            <div className="grid gap-6">
              <article className="rounded-[38px] border border-white/80 bg-white/76 p-7 shadow-soft backdrop-blur-xl sm:p-8" id="financiamiento">
                <SectionEyebrow>Financiamiento claro</SectionEyebrow>
                <h3 className="mt-6 text-[2.6rem] font-semibold leading-[0.96] tracking-[-0.05em]">
                  Cuida tu sonrisa con pagos flexibles y una ruta clara
                </h3>
                <div className="mt-6 grid gap-4 sm:grid-cols-3">
                  {["Primera evaluacion y diagnostico", "Plan de tratamiento por etapas", "Opciones de pago acompasadas a tu proceso"].map((step) => (
                    <div className="rounded-[28px] bg-blush-50/80 p-5 text-sm font-medium leading-6 text-ink/76" key={step}>
                      {step}
                    </div>
                  ))}
                </div>
              </article>

              <article className="rounded-[38px] border border-white/80 bg-gradient-to-br from-blush-500 to-blush-600 p-7 text-white shadow-glow">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white/78">Agenda hoy</p>
                <h3 className="mt-5 max-w-[11ch] text-[2.6rem] font-semibold leading-[0.96] tracking-[-0.05em]">
                  Tu nueva sonrisa puede empezar esta semana
                </h3>
                <a className="mt-8 inline-flex min-h-[54px] items-center justify-center rounded-full bg-white px-6 text-sm font-semibold text-blush-600 transition hover:-translate-y-0.5" href="#contacto">
                  Reservar evaluacion
                </a>
              </article>
            </div>
          </section>

          <section className="rounded-[38px] border border-white/80 bg-white/74 p-7 shadow-soft backdrop-blur-xl sm:p-8" id="especialistas">
            <div className="flex flex-col gap-6 lg:flex-row lg:justify-between">
              <div>
                <SectionEyebrow>Nuestro equipo de especialistas</SectionEyebrow>
                <h2 className="mt-6 max-w-[11ch] text-[2.8rem] font-semibold leading-[0.95] tracking-[-0.06em] sm:text-[4rem]">
                  Especialistas que cuidan <span className="text-blush-500">tu sonrisa</span>
                </h2>
              </div>
              <p className="max-w-[28ch] pt-2 text-base leading-7 text-ink/62">
                Atencion cercana, tecnologia avanzada y una mirada integral para acompanar cada paso del tratamiento.
              </p>
            </div>

            <div className="mt-8 grid gap-6 lg:grid-cols-2">
              {specialists.map((doctor) => (
                <article className="grid overflow-hidden rounded-[34px] border border-white/80 bg-white/82 shadow-soft md:grid-cols-[0.82fr_1fr]" key={doctor.name}>
                  <div className="min-h-[380px] bg-[#fbe5ec]" style={{ backgroundImage: `url(${specialistsSource})`, backgroundPosition: doctor.position, backgroundSize: "cover" }} />
                  <div className="flex flex-col justify-center p-7">
                    <SectionEyebrow>Ortodoncista</SectionEyebrow>
                    <h3 className="mt-6 text-[2.25rem] font-semibold leading-[0.97] tracking-[-0.05em]">{doctor.name}</h3>
                    <p className="mt-3 text-base font-medium text-blush-600">{doctor.role}</p>
                    <p className="mt-4 text-base leading-7 text-ink/62">{doctor.body}</p>
                    <div className="mt-6 flex flex-wrap gap-3">
                      <span className="rounded-full bg-blush-50 px-4 py-2 text-sm font-medium text-ink/75">{doctor.experience}</span>
                      <span className="rounded-full bg-blush-50 px-4 py-2 text-sm font-medium text-ink/75">Resultados personalizados</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="grid gap-6 rounded-[40px] border border-white/80 bg-white/72 p-6 shadow-soft backdrop-blur-xl lg:grid-cols-[minmax(0,0.78fr)_minmax(0,1.05fr)] lg:p-8" id="contacto">
            <div className="relative overflow-hidden rounded-[34px] bg-[#fde6ee]">
              <div className="min-h-[680px]" style={{ backgroundImage: `linear-gradient(90deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 42%, rgba(255,255,255,0.16) 100%), url(${contactSource})`, backgroundPosition: "left center", backgroundSize: "cover" }} />
              <div className="absolute left-5 top-5 rounded-[28px] border border-white/80 bg-white/82 px-5 py-4 shadow-soft backdrop-blur-xl">
                <p className="flex items-center gap-2 text-2xl font-semibold tracking-[-0.05em] text-blush-500">
                  <Star className="h-5 w-5 fill-current" strokeWidth={1.8} />
                  4.9/5
                </p>
                <p className="mt-2 text-sm text-ink/60">valoracion de pacientes</p>
              </div>
              <div className="absolute bottom-5 left-5 max-w-[320px] rounded-[32px] border border-white/80 bg-white/84 p-6 shadow-soft backdrop-blur-xl">
                <p className="text-4xl font-semibold leading-[1.02] tracking-[-0.05em]">La mejor inversion es en ti y en tu sonrisa</p>
                <p className="mt-4 text-sm text-ink/60">Primera evaluacion clara y personalizada</p>
              </div>
            </div>

            <div className="rounded-[34px] border border-white/80 bg-white/84 p-7 shadow-soft">
              <SectionEyebrow>Estamos aqui para ti</SectionEyebrow>
              <h2 className="mt-6 max-w-[11ch] text-[2.8rem] font-semibold leading-[0.95] tracking-[-0.06em] sm:text-[4rem]">
                Agenda tu evaluacion y empieza <span className="text-blush-500">tu cambio</span>
              </h2>
              <p className="mt-5 max-w-[32ch] text-base leading-7 text-ink/62">
                Dejanos tus datos y la landing quedara lista para guardar leads reales cuando vincules Supabase.
              </p>

              <form className="mt-7 grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
                {[
                  { label: "Nombre completo", icon: SmilePlus, type: "text", placeholder: "Tu nombre", name: "fullName", value: formData.fullName },
                  { label: "Telefono / WhatsApp", icon: Phone, type: "tel", placeholder: "Tu numero", name: "phone", value: formData.phone },
                  { label: "Correo electronico", icon: Mail, type: "email", placeholder: "tunombre@email.com", name: "email", value: formData.email },
                  { label: "Edad", icon: CalendarDays, type: "text", placeholder: "Tu edad", name: "age", value: formData.age },
                ].map((field) => (
                  <label className="grid gap-2" key={field.label}>
                    <span className="text-sm font-medium text-ink/72">{field.label}</span>
                    <span className="flex min-h-[58px] items-center gap-3 rounded-[20px] border border-blush-100 bg-mist px-4 transition focus-within:border-blush-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-blush-200/50">
                      <field.icon className="h-5 w-5 shrink-0 text-ink/45" strokeWidth={1.8} />
                      <input
                        className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-ink/35"
                        name={field.name}
                        placeholder={field.placeholder}
                        type={field.type}
                        value={field.value}
                        onChange={handleChange}
                        required={field.name !== "age"}
                      />
                    </span>
                  </label>
                ))}

                <label className="grid gap-2 md:col-span-2">
                  <span className="text-sm font-medium text-ink/72">Que te gustaria mejorar?</span>
                  <span className="flex min-h-[58px] items-center gap-3 rounded-[20px] border border-blush-100 bg-mist px-4 transition focus-within:border-blush-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-blush-200/50">
                    <Stethoscope className="h-5 w-5 shrink-0 text-ink/45" strokeWidth={1.8} />
                    <select className="w-full bg-transparent text-sm text-ink outline-none" name="treatmentInterest" value={formData.treatmentInterest} onChange={handleChange}>
                      <option>Ortodoncia</option>
                      <option>Alineadores invisibles</option>
                      <option>Brackets esteticos</option>
                      <option>Brackets metalicos</option>
                      <option>Diseno de sonrisa</option>
                    </select>
                  </span>
                </label>

                <label className="grid gap-2 md:col-span-2">
                  <span className="text-sm font-medium text-ink/72">Cuentanos brevemente tu caso</span>
                  <span className="flex gap-3 rounded-[24px] border border-blush-100 bg-mist px-4 py-4 transition focus-within:border-blush-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-blush-200/50">
                    <MessageCircleMore className="mt-1 h-5 w-5 shrink-0 text-ink/45" strokeWidth={1.8} />
                    <textarea
                      className="min-h-[140px] w-full resize-none bg-transparent text-sm text-ink outline-none placeholder:text-ink/35"
                      name="message"
                      placeholder="Escribe aqui tu consulta"
                      value={formData.message}
                      onChange={handleChange}
                    />
                  </span>
                </label>

                <label className="flex items-start gap-3 md:col-span-2">
                  <input className="mt-1 h-4 w-4 rounded border-blush-200 text-blush-500" type="checkbox" name="acceptedPrivacy" checked={formData.acceptedPrivacy} onChange={handleChange} />
                  <span className="text-sm leading-6 text-ink/62">Acepto el tratamiento de mis datos personales segun la Politica de Privacidad.</span>
                </label>

                <div className={`rounded-[20px] border px-4 py-3 text-sm font-medium md:col-span-2 ${statusTone[formStatus.kind]}`}>
                  {formStatus.message}
                </div>

                <button className="island-btn w-full justify-center bg-gradient-to-r from-blush-500 to-blush-600 text-white shadow-glow md:col-span-2 disabled:cursor-not-allowed disabled:opacity-70" type="submit" disabled={isSubmitting}>
                  <span>{isSubmitting ? "Enviando evaluacion..." : "Agendar mi evaluacion gratuita"}</span>
                  <span className="island-btn__icon">
                    <CalendarDays className="h-5 w-5" strokeWidth={1.9} />
                  </span>
                </button>
              </form>
            </div>
          </section>
        </main>

        <footer className="mt-6 rounded-[36px] border border-white/80 bg-white/76 px-6 py-7 shadow-soft backdrop-blur-xl">
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-5">
            <div>
              <p className="text-xl font-semibold tracking-[0.14em]">SONRISA</p>
              <p className="mt-2 text-sm text-ink/58">Tu sonrisa, nuestra prioridad.</p>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="mt-1 h-5 w-5 text-blush-500" strokeWidth={1.8} />
              <div>
                <p className="text-sm font-semibold">Direccion</p>
                <p className="mt-1 text-sm text-ink/58">Av. Sonrisa Feliz 123</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Phone className="mt-1 h-5 w-5 text-blush-500" strokeWidth={1.8} />
              <div>
                <p className="text-sm font-semibold">Llamanos</p>
                <p className="mt-1 text-sm text-ink/58">55 1234 5678</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Clock3 className="mt-1 h-5 w-5 text-blush-500" strokeWidth={1.8} />
              <div>
                <p className="text-sm font-semibold">Horarios</p>
                <p className="mt-1 text-sm text-ink/58">Lun - Vie: 9:00 am - 7:00 pm</p>
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold">Siguenos</p>
              <div className="mt-3 flex gap-3">
                {[Instagram, Phone, Mail].map((Icon, index) => (
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-blush-50 text-blush-600" key={index}>
                    <Icon className="h-5 w-5" strokeWidth={1.8} />
                  </span>
                ))}
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

