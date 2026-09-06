import { useState } from "react";
import {
  ArrowRight,
  CalendarCheck,
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
import {
  heroBadges,
  metrics,
  benefits,
  treatments,
  specialists,
  financingSteps,
  contactDetails,
  initialForm,
} from "../data/dentalData";
import { dentalLeadSchema } from "../lib/dentalValidation";

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

    const validationResult = dentalLeadSchema.safeParse(formData);
    if (!validationResult.success) {
      const firstIssue = validationResult.error.issues[0]?.message || "Verifica los datos ingresados.";
      setFormStatus({
        kind: "error",
        message: firstIssue,
      });
      return;
    }

    setIsSubmitting(true);
    setFormStatus({ kind: "idle", message: "" });

    try {
      const result = await createDentalLead(validationResult.data);

      if (result.ok) {
        setFormData(initialForm);
        setFormStatus({ kind: "success", message: result.message });
      } else if (result.mode === "missing_env") {
        setFormStatus({ kind: "info", message: result.message });
      } else {
        setFormStatus({ kind: "error", message: result.message });
      }
    } catch {
      setFormStatus({
        kind: "error",
        message: "Ocurrió un error inesperado al procesar el registro. Intenta nuevamente.",
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
          {/* HERO FULL-WIDTH SEGURO SIN DESBORDAMIENTO HORIZONTAL */}
          <div className="relative left-1/2 -translate-x-1/2 w-screen max-w-[100vw] -mt-[140px] overflow-x-clip">
            <section className="relative min-h-[640px] w-full pt-[145px]" style={{ backgroundImage: `url(${heroSource})`, backgroundPosition: "78% center", backgroundSize: "cover" }}>
              <div className="pointer-events-none absolute inset-y-0 left-0 w-[55%] bg-gradient-to-r from-white via-white/90 to-transparent" />
              <div className="relative mx-auto max-w-[1380px] px-4 pb-16 pt-6 sm:px-6 lg:px-8 lg:pb-20">
                <div className="flex max-w-[640px] flex-col justify-center">
                  <SectionEyebrow>Ortodoncia personalizada</SectionEyebrow>
                  <h1 className="mt-4 max-w-[14ch] text-[2.4rem] font-semibold leading-[1.05] tracking-[-0.04em] sm:text-[3rem] lg:text-[3.6rem]">
                    Brackets que alinean <span className="text-blush-700">tu sonrisa</span> y tu confianza
                  </h1>
                  <p className="mt-4 max-w-[36ch] text-base leading-relaxed text-ink/75 sm:text-lg">
                    Tratamientos personalizados, seguros y cómodos para lograr la sonrisa que mereces.
                  </p>

                  <div className="mt-5 flex flex-wrap items-center gap-2.5 lg:flex-nowrap">
                    {heroBadges.map(({ icon: Icon, label }) => (
                      <div className="inline-flex items-center gap-2 whitespace-nowrap rounded-full border border-blush-200/60 bg-white/60 px-3 py-1 text-xs font-medium text-ink/80 backdrop-blur-sm sm:text-[0.82rem]" key={`opt2-badge-${label}`}>
                        <span className="rounded-full bg-blush-100 p-1 text-blush-700">
                          <Icon className="h-3.5 w-3.5" strokeWidth={1.9} />
                        </span>
                        {label}
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
                    <a className="island-btn bg-gradient-to-r from-blush-500 to-blush-600 text-white shadow-glow" href="#contacto">
                      <span>Agenda tu evaluación</span>
                      <span className="island-btn__icon">
                        <CalendarDays className="h-4 w-4" strokeWidth={2} />
                      </span>
                    </a>
                    <a className="inline-flex min-h-[52px] items-center justify-center rounded-full border border-blush-200/90 bg-white/90 px-6 text-sm font-semibold text-ink shadow-sm transition hover:-translate-y-0.5 active:scale-[0.98]" href="#tratamientos">
                      <Play className="mr-2 h-4 w-4 text-blush-700" fill="currentColor" strokeWidth={1.8} />
                      Conoce tu tratamiento
                    </a>
                  </div>
                </div>
              </div>
            </section>

            {/* Barra de métricas 50% overlay centrada */}
            <div className="relative z-20 -mt-14 px-4 sm:px-6 lg:-mt-16 lg:px-8">
              <div className="mx-auto grid max-w-[1240px] gap-px overflow-hidden rounded-[28px] border border-white/90 bg-white/90 shadow-soft backdrop-blur-xl md:grid-cols-2 xl:grid-cols-4">
                {metrics.map((metric) => (
                  <article className="bg-white/80 px-6 py-6 text-center" key={`opt2-${metric.label}`}>
                    <p className="text-3xl font-semibold tracking-[-0.05em] text-blush-700 sm:text-4xl">{metric.value}</p>
                    <p className="mt-1 text-sm text-ink/70">{metric.label}</p>
                  </article>
                ))}
              </div>
            </div>
          </div>

          <section className="space-y-6" id="servicios">
            {/* Cabecera abierta e integrada a sangre derecha como la imagen de referencia */}
            <div className="relative min-h-[380px] sm:min-h-[440px] lg:min-h-[480px] flex items-center overflow-hidden rounded-3xl">
              {/* Imagen de fondo a sangre en el costado derecho */}
              <div
                className="pointer-events-none absolute inset-y-0 right-0 w-full sm:w-[65%] lg:w-[52%] bg-cover bg-no-repeat bg-right"
                style={{
                  backgroundImage: `url(${benefitsSource})`,
                }}
              />
              {/* Fundido suave hacia el texto sin cortes duros */}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#fff7f9] via-[#fff7f9]/95 via-45% to-transparent lg:via-[#fff7f9]/90" />

              {/* Texto directo sobre el lienzo */}
              <div className="relative z-10 max-w-[620px] py-8 sm:py-12 px-2 sm:px-4">
                <SectionEyebrow>Tu sonrisa, nuestro compromiso</SectionEyebrow>
                <h2 className="mt-5 text-3xl font-bold tracking-tight text-ink sm:text-4xl lg:text-[3.3rem] lg:leading-[1.08]">
                  Más que brackets, <br className="hidden sm:inline" />
                  creamos <span className="text-blush-600">sonrisas</span> que <br className="hidden sm:inline" />
                  <span className="text-blush-600">transforman</span>
                </h2>
                <p className="mt-5 max-w-[48ch] text-base leading-relaxed text-ink/75 sm:text-lg">
                  Combinamos experiencia, tecnología y un enfoque personalizado para brindarte una sonrisa alineada, saludable y llena de confianza.
                </p>
              </div>
            </div>

            {/* Fila horizontal de 4 tarjetas de beneficios centradas */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {benefits.map(({ icon: Icon, title, body }) => (
                <article
                  key={title}
                  className="group flex flex-col items-center text-center rounded-[32px] border border-white/90 bg-white/88 p-7 shadow-double-bezel backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-blush-200"
                >
                  <div className="inline-flex h-16 w-16 items-center justify-center rounded-full border border-blush-200/60 bg-blush-100/70 p-3.5 text-blush-600 transition duration-300 group-hover:scale-105">
                    <Icon className="h-8 w-8" strokeWidth={1.8} />
                  </div>
                  <h3 className="mt-6 text-xl font-bold tracking-tight text-ink sm:text-2xl">{title}</h3>
                  <p className="mt-3 text-sm sm:text-base leading-relaxed text-ink/70">{body}</p>
                </article>
              ))}
            </div>

            {/* Banner horizontal completo: Evaluación inicial sin costo */}
            <article className="flex flex-col items-start justify-between gap-6 rounded-[34px] border border-white/90 bg-white/90 p-7 sm:p-8 shadow-soft backdrop-blur-xl lg:flex-row lg:items-center">
              <div className="flex items-start gap-5">
                <div className="hidden sm:flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-blush-200/60 bg-blush-100/70 text-blush-600 shadow-sm">
                  <CalendarCheck className="h-7 w-7" strokeWidth={1.8} />
                </div>
                <div>
                  <SectionEyebrow>Sin costo, sin compromiso</SectionEyebrow>
                  <h3 className="mt-3 text-2xl sm:text-3xl font-bold tracking-tight text-ink">
                    Evaluación inicial <span className="text-blush-600">sin costo</span>
                  </h3>
                  <p className="mt-2 max-w-[50ch] text-sm sm:text-base leading-relaxed text-ink/70">
                    Conoce el estado de tu sonrisa, recibe un diagnóstico profesional y un plan de tratamiento personalizado.
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-start lg:items-end gap-2 shrink-0 w-full sm:w-auto">
                <a
                  className="inline-flex min-h-[54px] w-full sm:w-auto items-center justify-center gap-2 rounded-full bg-gradient-to-r from-blush-500 to-blush-600 px-7 text-sm font-semibold text-white shadow-glow transition hover:-translate-y-0.5 active:scale-[0.98]"
                  href="#contacto"
                >
                  <ArrowRight className="h-4 w-4" strokeWidth={2} />
                  Quiero mi evaluación gratis
                </a>
                <div className="flex items-center gap-1.5 text-xs font-medium text-ink/60 self-center lg:self-end">
                  <ShieldCheck className="h-3.5 w-3.5 text-blush-600" strokeWidth={2} />
                  <span>100% seguro y confidencial</span>
                </div>
              </div>
            </article>
          </section>

          <section className="rounded-[38px] border border-white/85 bg-white/78 p-7 shadow-soft backdrop-blur-xl sm:p-8" id="tratamientos">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <SectionEyebrow>Más opciones para tu sonrisa</SectionEyebrow>
                <h2 className="mt-6 text-3xl font-bold tracking-tight text-ink sm:text-4xl lg:text-5xl">
                  Explora otros <span className="text-blush-700">tratamientos</span>
                </h2>
              </div>
              <p className="max-w-[36ch] text-base leading-relaxed text-ink/75">
                Soluciones diseñadas para cada etapa de tu sonrisa, con opciones funcionales y estéticas según tu necesidad.
              </p>
            </div>

            <div className="mt-8 grid gap-6 lg:grid-cols-3">
              {treatments.map((item) => (
                <article className="group overflow-hidden rounded-[32px] border border-white/90 bg-white/88 shadow-double-bezel transition duration-300 hover:-translate-y-1 hover:border-blush-200" key={item.title}>
                  <div className="h-[240px] bg-[#f9dbe4] card-hover-image" style={{ backgroundImage: `url(${treatmentsSource})`, backgroundPosition: item.position, backgroundSize: "cover" }} />
                  <div className="p-7">
                    <h3 className="text-2xl font-semibold tracking-tight text-ink">{item.title}</h3>
                    <p className="mt-3 text-base leading-relaxed text-ink/75">{item.body}</p>
                    <a className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-blush-700 transition group-hover:gap-3" href="#contacto">
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
              <div className="min-h-[420px] bg-[#fde7ee] card-hover-image" style={{ backgroundImage: `linear-gradient(90deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.02) 35%, rgba(255,255,255,0.58) 100%), url(${benefitsSource})`, backgroundPosition: "left center", backgroundSize: "cover" }} />
              <div className="p-7 sm:p-8">
                <SectionEyebrow>Resultados que inspiran confianza</SectionEyebrow>
                <h2 className="mt-6 text-3xl font-bold tracking-tight text-ink sm:text-4xl lg:text-5xl">
                  Un tratamiento pensado para verse bien y sentirse mejor
                </h2>
                <p className="mt-5 max-w-[38ch] text-base leading-relaxed text-ink/75">
                  Alineamos funcionalidad, estética y acompañamiento para que el cambio no solo se note, sino que también sea sostenible en el tiempo.
                </p>
              </div>
            </article>

            <div className="grid gap-6">
              <article className="rounded-[38px] border border-white/80 bg-white/76 p-7 shadow-soft backdrop-blur-xl sm:p-8" id="financiamiento">
                <SectionEyebrow>Financiamiento claro</SectionEyebrow>
                <h3 className="mt-6 text-2xl font-bold tracking-tight text-ink sm:text-3xl">
                  Cuida tu sonrisa con pagos flexibles y una ruta clara
                </h3>
                <div className="mt-6 grid gap-4 sm:grid-cols-3">
                  {financingSteps.map((item) => (
                    <div className="rounded-[28px] border border-blush-100 bg-blush-50/80 p-5 text-sm font-medium leading-6 text-ink/80 shadow-sm transition hover:-translate-y-0.5" key={item.step}>
                      <span className="text-xs font-bold uppercase tracking-wider text-blush-700">{item.step}</span>
                      <p className="mt-2 text-base font-semibold text-ink">{item.title}</p>
                      <p className="mt-1 text-sm text-ink/70 leading-relaxed">{item.description}</p>
                    </div>
                  ))}
                </div>
              </article>

              <article className="rounded-[38px] border border-white/80 bg-gradient-to-br from-blush-500 to-blush-600 p-7 text-white shadow-glow">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white/85">Agenda hoy</p>
                <h3 className="mt-5 max-w-[11ch] text-2xl font-bold tracking-tight text-white sm:text-3xl">
                  Tu nueva sonrisa puede empezar esta semana
                </h3>
                <a className="mt-8 inline-flex min-h-[54px] items-center justify-center rounded-full bg-white px-6 text-sm font-semibold text-blush-700 transition hover:-translate-y-0.5 shadow-sm" href="#contacto">
                  Reservar evaluación
                </a>
              </article>
            </div>
          </section>

          <section className="rounded-[38px] border border-white/80 bg-white/74 p-7 shadow-soft backdrop-blur-xl sm:p-8" id="especialistas">
            <div className="flex flex-col gap-6 lg:flex-row lg:justify-between">
              <div>
                <SectionEyebrow>Nuestro equipo de especialistas</SectionEyebrow>
                <h2 className="mt-6 text-3xl font-bold tracking-tight text-ink sm:text-4xl lg:text-5xl">
                  Especialistas que cuidan <span className="text-blush-700">tu sonrisa</span>
                </h2>
              </div>
              <p className="max-w-[28ch] pt-2 text-base leading-relaxed text-ink/75">
                Atención cercana, tecnología avanzada y una mirada integral para acompañar cada paso del tratamiento.
              </p>
            </div>

            <div className="mt-8 grid gap-6 lg:grid-cols-2">
              {specialists.map((doctor) => (
                <article className="grid overflow-hidden rounded-[34px] border border-white/80 bg-white/82 shadow-soft md:grid-cols-[0.82fr_1fr]" key={doctor.name}>
                  <div className="min-h-[380px] bg-[#fbe5ec] card-hover-image" style={{ backgroundImage: `url(${specialistsSource})`, backgroundPosition: doctor.position, backgroundSize: "cover" }} />
                  <div className="flex flex-col justify-center p-7">
                    <SectionEyebrow>Ortodoncista</SectionEyebrow>
                    <h3 className="mt-6 text-2xl font-bold tracking-tight text-ink">{doctor.name}</h3>
                    <p className="mt-2 text-base font-medium text-blush-700">{doctor.role}</p>
                    <p className="mt-4 text-base leading-relaxed text-ink/75">{doctor.body}</p>
                    <div className="mt-6 flex flex-wrap gap-3">
                      <span className="rounded-full bg-blush-50 px-4 py-2 text-sm font-medium text-ink/80 border border-blush-100/60">{doctor.experience}</span>
                      <span className="rounded-full bg-blush-50 px-4 py-2 text-sm font-medium text-ink/80 border border-blush-100/60">Resultados personalizados</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="grid gap-6 rounded-[40px] border border-white/80 bg-white/72 p-6 shadow-soft backdrop-blur-xl lg:grid-cols-[minmax(0,0.78fr)_minmax(0,1.05fr)] lg:p-8" id="contacto">
            <div className="relative overflow-hidden rounded-[34px] bg-[#fde6ee]">
              <div className="min-h-[680px] card-hover-image" style={{ backgroundImage: `linear-gradient(90deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 42%, rgba(255,255,255,0.16) 100%), url(${contactSource})`, backgroundPosition: "left center", backgroundSize: "cover" }} />
              <div className="absolute left-5 top-5 rounded-[28px] border border-white/80 bg-white/82 px-5 py-4 shadow-soft backdrop-blur-xl">
                <p className="flex items-center gap-2 text-2xl font-bold tracking-tight text-blush-700">
                  <Star className="h-5 w-5 fill-current" strokeWidth={1.8} />
                  4.9/5
                </p>
                <p className="mt-1 text-sm text-ink/70">valoración de pacientes</p>
              </div>
              <div className="absolute bottom-5 left-5 max-w-[320px] rounded-[32px] border border-white/80 bg-white/90 p-6 shadow-soft backdrop-blur-xl">
                <p className="text-2xl font-bold leading-tight tracking-tight text-ink sm:text-3xl">La mejor inversión es en ti y en tu sonrisa</p>
                <p className="mt-3 text-sm text-ink/70">Primera evaluación clara y personalizada</p>
              </div>
            </div>

            <div className="rounded-[34px] border border-white/80 bg-white/84 p-7 shadow-soft">
              <SectionEyebrow>Estamos aquí para ti</SectionEyebrow>
              <h2 className="mt-6 text-3xl font-bold tracking-tight text-ink sm:text-4xl lg:text-5xl">
                Agenda tu evaluación y empieza <span className="text-blush-700">tu cambio</span>
              </h2>
              <p className="mt-4 max-w-[34ch] text-base leading-relaxed text-ink/75">
                Déjanos tus datos y un especialista coordinará tu cita para un diagnóstico completo y personalizado.
              </p>

              <form className="mt-7 grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
                {[
                  { label: "Nombre completo", icon: SmilePlus, type: "text", placeholder: "Tu nombre", name: "fullName", value: formData.fullName },
                  { label: "Teléfono / WhatsApp", icon: Phone, type: "tel", placeholder: "Tu número", name: "phone", value: formData.phone },
                  { label: "Correo electrónico", icon: Mail, type: "email", placeholder: "tunombre@email.com", name: "email", value: formData.email },
                  { label: "Edad", icon: CalendarDays, type: "text", placeholder: "Tu edad", name: "age", value: formData.age },
                ].map((field) => (
                  <label className="grid gap-2" key={field.label}>
                    <span className="text-sm font-semibold text-ink/80">{field.label}</span>
                    <span className="flex min-h-[58px] items-center gap-3 rounded-[20px] border border-blush-100 bg-white/70 px-4 transition focus-within:border-blush-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-blush-200/50">
                      <field.icon className="h-5 w-5 shrink-0 text-ink/50" strokeWidth={1.8} />
                      <input
                        className="w-full bg-transparent text-base text-ink outline-none placeholder:text-ink/40"
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
                  <span className="text-sm font-semibold text-ink/80">¿Qué te gustaría mejorar?</span>
                  <span className="flex min-h-[58px] items-center gap-3 rounded-[20px] border border-blush-100 bg-white/70 px-4 transition focus-within:border-blush-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-blush-200/50">
                    <Stethoscope className="h-5 w-5 shrink-0 text-ink/50" strokeWidth={1.8} />
                    <select className="w-full bg-transparent text-base text-ink outline-none" name="treatmentInterest" value={formData.treatmentInterest} onChange={handleChange}>
                      <option>Ortodoncia</option>
                      <option>Alineadores invisibles</option>
                      <option>Brackets estéticos</option>
                      <option>Brackets metálicos</option>
                      <option>Diseño de sonrisa</option>
                    </select>
                  </span>
                </label>

                <label className="grid gap-2 md:col-span-2">
                  <span className="text-sm font-semibold text-ink/80">Cuéntanos brevemente tu caso</span>
                  <span className="flex gap-3 rounded-[24px] border border-blush-100 bg-white/70 px-4 py-4 transition focus-within:border-blush-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-blush-200/50">
                    <MessageCircleMore className="mt-1 h-5 w-5 shrink-0 text-ink/50" strokeWidth={1.8} />
                    <textarea
                      className="min-h-[140px] w-full resize-none bg-transparent text-base text-ink outline-none placeholder:text-ink/40"
                      name="message"
                      placeholder="Escribe aquí tu consulta"
                      value={formData.message}
                      onChange={handleChange}
                    />
                  </span>
                </label>

                <label className="flex items-start gap-3 md:col-span-2 cursor-pointer">
                  <input className="mt-1 h-4 w-4 rounded border-blush-300 text-blush-600 focus:ring-blush-400" type="checkbox" name="acceptedPrivacy" checked={formData.acceptedPrivacy} onChange={handleChange} />
                  <span className="text-sm leading-6 text-ink/75">Acepto el tratamiento de mis datos personales según la Política de Privacidad.</span>
                </label>

                <div className={`rounded-[20px] border px-4 py-3 text-sm font-medium md:col-span-2 ${statusTone[formStatus.kind]}`}>
                  {formStatus.message}
                </div>

                <button className="island-btn w-full justify-center bg-gradient-to-r from-blush-500 to-blush-600 text-white shadow-glow md:col-span-2 disabled:cursor-not-allowed disabled:opacity-70" type="submit" disabled={isSubmitting}>
                  <span>{isSubmitting ? "Enviando evaluación..." : "Agendar mi evaluación gratuita"}</span>
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
              <p className="mt-2 text-sm text-ink/65">Tu sonrisa, nuestra prioridad.</p>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="mt-1 h-5 w-5 text-blush-700" strokeWidth={1.8} />
              <div>
                <p className="text-sm font-semibold">Dirección</p>
                <p className="mt-1 text-sm text-ink/65">{contactDetails.address}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Phone className="mt-1 h-5 w-5 text-blush-700" strokeWidth={1.8} />
              <div>
                <p className="text-sm font-semibold">Llámanos</p>
                <p className="mt-1 text-sm text-ink/65">{contactDetails.displayPhone}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Clock3 className="mt-1 h-5 w-5 text-blush-700" strokeWidth={1.8} />
              <div>
                <p className="text-sm font-semibold">Horarios</p>
                <p className="mt-1 text-sm text-ink/65">{contactDetails.hours}</p>
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold">Síguenos</p>
              <div className="mt-3 flex gap-3">
                {[Instagram, Phone, Mail].map((Icon, index) => (
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-blush-50 text-blush-700 border border-blush-100/70 transition hover:bg-blush-100" key={index}>
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

