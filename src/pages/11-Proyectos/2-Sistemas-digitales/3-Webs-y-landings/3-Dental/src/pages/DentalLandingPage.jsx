import { useState } from "react";
import {
  CalendarDays,
  ChevronRight,
  Clock3,
  Instagram,
  Mail,
  MapPin,
  Menu,
  MessageCircleMore,
  Phone,
  Play,
  SmilePlus,
  Star,
  Stethoscope,
  X,
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
  paymentSteps,
  initialForm,
} from "../data/dentalData";

function SectionEyebrow({ children }) {
  return (
    <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-blush-200/80 bg-white/95 px-3.5 py-1 text-[0.75rem] font-semibold uppercase tracking-[0.1em] text-blush-600 shadow-sm backdrop-blur-md">
      <span className="h-1.5 w-1.5 rounded-full bg-blush-500" />
      {children}
    </span>
  );
}

function NavLink({ href, children, onClick }) {
  return (
    <a
      className="text-sm font-medium text-slate-700 transition hover:text-blush-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blush-400 focus-visible:rounded-lg px-1 py-0.5"
      href={href}
      onClick={onClick}
    >
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
    success: "border-emerald-200 bg-emerald-50 text-emerald-800",
    error: "border-rose-200 bg-rose-50 text-rose-800",
    info: "border-blush-200 bg-blush-50 text-blush-800",
    idle: "hidden",
  };

  return (
    <div className="min-h-[100dvh] bg-page-glow text-ink">
      <div className="mx-auto w-full max-w-[1380px] px-4 pb-10 pt-5 sm:px-6 lg:px-8">
        {/* HEADER NAVBAR */}
        <header className="sticky top-4 z-30 rounded-[32px] border border-white/90 bg-white/85 px-5 py-4 shadow-soft backdrop-blur-xl transition-all duration-300">
          <div className="flex items-center justify-between gap-4">
            <a className="flex items-center gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blush-400 focus-visible:rounded-2xl" href="#inicio">
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-blush-100 text-blush-600 shadow-inner">
                <SmilePlus className="h-5 w-5" strokeWidth={1.8} />
              </div>
              <div className="leading-none">
                <p className="text-sm font-bold tracking-[0.18em] text-slate-900">SONRISA</p>
                <p className="mt-0.5 text-[0.6rem] font-semibold tracking-[0.28em] text-slate-500">CLÍNICA DENTAL</p>
              </div>
            </a>

            <nav className="hidden items-center gap-8 lg:flex" aria-label="Navegación principal">
              <NavLink href="#servicios">Servicios</NavLink>
              <NavLink href="#tratamientos">Tratamientos</NavLink>
              <NavLink href="#resultados">Resultados</NavLink>
              <NavLink href="#financiamiento">Financiamiento</NavLink>
              <NavLink href="#especialistas">Especialistas</NavLink>
              <NavLink href="#contacto">Contacto</NavLink>
            </nav>

            <div className="flex items-center gap-3">
              <a
                className="hidden items-center gap-2 rounded-full bg-gradient-to-r from-blush-500 to-blush-600 px-6 py-3 text-sm font-semibold text-white shadow-glow transition duration-300 hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blush-400 sm:inline-flex"
                href="#contacto"
              >
                Agenda tu evaluación
                <ChevronRight className="h-4 w-4" strokeWidth={2} />
              </a>
              <button
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-blush-100 bg-white text-slate-700 transition hover:bg-blush-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blush-400 lg:hidden"
                type="button"
                aria-label={menuOpen ? "Cerrar menú" : "Abrir menú de navegación"}
                aria-expanded={menuOpen}
                onClick={() => setMenuOpen((current) => !current)}
              >
                {menuOpen ? <X className="h-5 w-5" strokeWidth={1.8} /> : <Menu className="h-5 w-5" strokeWidth={1.8} />}
              </button>
            </div>
          </div>

          {menuOpen ? (
            <nav className="mt-4 grid gap-3 rounded-[24px] border border-blush-100 bg-white/95 p-4 shadow-md lg:hidden" aria-label="Navegación móvil">
              <NavLink href="#servicios" onClick={() => setMenuOpen(false)}>Servicios</NavLink>
              <NavLink href="#tratamientos" onClick={() => setMenuOpen(false)}>Tratamientos</NavLink>
              <NavLink href="#resultados" onClick={() => setMenuOpen(false)}>Resultados</NavLink>
              <NavLink href="#financiamiento" onClick={() => setMenuOpen(false)}>Financiamiento</NavLink>
              <NavLink href="#especialistas" onClick={() => setMenuOpen(false)}>Especialistas</NavLink>
              <NavLink href="#contacto" onClick={() => setMenuOpen(false)}>Contacto</NavLink>
            </nav>
          ) : null}
        </header>

        <main className="mt-6 space-y-8" id="inicio">
          {/* HERO SECTION FULL-WIDTH */}
          <div className="relative left-1/2 -translate-x-1/2 w-[100vw] -mt-[140px] overflow-hidden">
            <section
              className="relative min-h-[640px] w-full pt-[145px]"
              style={{
                backgroundImage: `url(${heroSource})`,
                backgroundPosition: "78% center",
                backgroundSize: "cover",
              }}
            >
              <div className="pointer-events-none absolute inset-y-0 left-0 w-[60%] bg-gradient-to-r from-white via-white/92 to-transparent" />
              <div className="relative mx-auto max-w-[1380px] px-4 pb-16 pt-6 sm:px-6 lg:px-8 lg:pb-20">
                <div className="flex max-w-[640px] flex-col justify-center">
                  <SectionEyebrow>Ortodoncia personalizada</SectionEyebrow>
                  <h1 className="mt-4 max-w-[14ch] text-[2.4rem] font-bold leading-[1.05] tracking-[-0.04em] text-slate-900 sm:text-[3rem] lg:text-[3.6rem]">
                    Brackets que alinean <span className="text-blush-500">tu sonrisa</span> y tu confianza
                  </h1>
                  <p className="mt-4 max-w-[36ch] text-base leading-relaxed text-slate-700 sm:text-lg">
                    Tratamientos personalizados, seguros y cómodos con tecnología de diagnóstico digital para lograr la sonrisa que mereces.
                  </p>

                  <div className="mt-5 flex flex-wrap items-center gap-2.5 lg:flex-nowrap">
                    {heroBadges.map(({ icon: Icon, label }) => (
                      <div
                        className="inline-flex items-center gap-2 whitespace-nowrap rounded-full border border-blush-200/60 bg-white/70 px-3 py-1.5 text-xs font-medium text-slate-700 backdrop-blur-sm sm:text-[0.82rem]"
                        key={`hero-badge-${label}`}
                      >
                        <span className="rounded-full bg-blush-100 p-1 text-blush-600">
                          <Icon className="h-3.5 w-3.5" strokeWidth={2} />
                        </span>
                        {label}
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
                    <a className="island-btn bg-gradient-to-r from-blush-500 to-blush-600 text-white shadow-glow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blush-400" href="#contacto">
                      <span>Agenda tu evaluación</span>
                      <span className="island-btn__icon">
                        <CalendarDays className="h-4 w-4" strokeWidth={2} />
                      </span>
                    </a>
                    <a
                      className="inline-flex min-h-[52px] items-center justify-center rounded-full border border-blush-200/90 bg-white/90 px-6 text-sm font-semibold text-slate-800 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:bg-white active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blush-400"
                      href="#tratamientos"
                    >
                      <Play className="mr-2 h-4 w-4 text-blush-600" fill="currentColor" strokeWidth={1.8} />
                      Conoce los tratamientos
                    </a>
                  </div>
                </div>
              </div>
            </section>

            {/* Barra de métricas overlay centrada */}
            <div className="relative z-20 -mt-14 px-4 sm:px-6 lg:-mt-16 lg:px-8">
              <div className="mx-auto grid max-w-[1240px] gap-px overflow-hidden rounded-[28px] border border-white/90 bg-white/90 shadow-soft backdrop-blur-xl md:grid-cols-2 xl:grid-cols-4">
                {metrics.map((metric) => (
                  <article className="bg-white/85 px-6 py-6 text-center" key={`metric-${metric.label}`}>
                    <p className="text-3xl font-bold tracking-[-0.05em] text-blush-500 sm:text-4xl">{metric.value}</p>
                    <p className="mt-1 text-xs font-medium text-slate-600 sm:text-sm">{metric.label}</p>
                  </article>
                ))}
              </div>
            </div>
          </div>

          {/* BENEFICIOS / SERVICIOS */}
          <section className="grid gap-6 xl:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)]" id="servicios">
            <div className="flex flex-col justify-between rounded-[38px] border border-white/85 bg-white/75 p-7 shadow-soft backdrop-blur-xl sm:p-8">
              <div>
                <SectionEyebrow>Tu sonrisa, nuestro compromiso</SectionEyebrow>
                <h2 className="mt-6 max-w-[10ch] text-[2.8rem] font-bold leading-[0.94] tracking-[-0.06em] text-slate-900 sm:text-[4rem]">
                  Más que brackets, creamos <span className="text-blush-500">sonrisas</span> que transforman
                </h2>
                <p className="mt-5 max-w-[24ch] text-lg leading-relaxed text-slate-700 sm:text-xl">
                  Combinamos experiencia clínica, tecnología 3D y acompañamiento humano para una experiencia dental clara y confortable.
                </p>
              </div>
              <div
                className="mt-8 h-[260px] overflow-hidden rounded-[32px] bg-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.6)] sm:h-[300px]"
                style={{
                  backgroundImage: `linear-gradient(90deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.05) 36%, rgba(255,255,255,0.72) 100%), url(${benefitsSource})`,
                  backgroundPosition: "left center",
                  backgroundSize: "cover",
                }}
              />
            </div>

            <div className="grid gap-6">
              <div className="grid gap-6 md:grid-cols-2">
                {benefits.map(({ icon: Icon, title, body }) => (
                  <article
                    className="group rounded-[32px] border border-white/90 bg-white/85 p-7 shadow-double-bezel backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-blush-200"
                    key={title}
                  >
                    <div className="inline-flex rounded-2xl border border-blush-200/60 bg-blush-100/80 p-3.5 text-blush-600 transition duration-300 group-hover:scale-105">
                      <Icon className="h-6 w-6" strokeWidth={1.9} />
                    </div>
                    <h3 className="mt-6 text-2xl font-bold leading-[1.1] tracking-[-0.04em] text-slate-900">{title}</h3>
                    <p className="mt-4 text-base leading-7 text-slate-600">{body}</p>
                  </article>
                ))}
              </div>

              <article className="flex flex-col items-start justify-between gap-6 rounded-[34px] border border-white/90 bg-gradient-to-r from-white/95 to-blush-50/90 p-7 shadow-soft sm:flex-row sm:items-center">
                <div>
                  <SectionEyebrow>Sin costo, sin compromiso</SectionEyebrow>
                  <h3 className="mt-4 text-3xl font-bold tracking-[-0.04em] text-slate-900 sm:text-4xl">
                    Evaluación inicial <span className="text-blush-500">sin costo</span>
                  </h3>
                  <p className="mt-3 max-w-[44ch] text-base leading-7 text-slate-700">
                    Conoce el estado de tu salud bucal, recibe un diagnóstico profesional y un plan personalizado desde la primera visita.
                  </p>
                </div>
                <a
                  className="inline-flex min-h-[56px] shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-blush-500 to-blush-600 px-7 text-sm font-semibold text-white shadow-glow transition duration-300 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blush-400"
                  href="#contacto"
                >
                  Quiero mi evaluación gratis
                </a>
              </article>
            </div>
          </section>

          {/* TRATAMIENTOS */}
          <section className="rounded-[38px] border border-white/85 bg-white/78 p-7 shadow-soft backdrop-blur-xl sm:p-8" id="tratamientos">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <SectionEyebrow>Más opciones para tu sonrisa</SectionEyebrow>
                <h2 className="mt-6 max-w-[12ch] text-[2.8rem] font-bold leading-[0.95] tracking-[-0.06em] text-slate-900 sm:text-[4rem]">
                  Explora nuestros <span className="text-blush-500">tratamientos</span>
                </h2>
              </div>
              <p className="max-w-[36ch] text-base leading-7 text-slate-700">
                Soluciones diseñadas para cada perfil de paciente, con opciones funcionales y estéticas según tus objetivos y estilo de vida.
              </p>
            </div>

            <div className="mt-8 grid gap-6 lg:grid-cols-3">
              {treatments.map((item) => (
                <article
                  className="group overflow-hidden rounded-[32px] border border-white/90 bg-white/88 shadow-double-bezel transition duration-300 hover:-translate-y-1 hover:border-blush-200"
                  key={item.title}
                >
                  <div
                    className="h-[240px] bg-[#f9dbe4] transition duration-500 group-hover:scale-105"
                    style={{
                      backgroundImage: `url(${treatmentsSource})`,
                      backgroundPosition: item.position,
                      backgroundSize: "cover",
                    }}
                  />
                  <div className="p-7">
                    <h3 className="text-2xl font-bold tracking-[-0.04em] text-slate-900">{item.title}</h3>
                    <p className="mt-4 text-base leading-7 text-slate-600">{item.body}</p>
                    <a
                      className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-blush-600 transition group-hover:gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blush-400"
                      href="#contacto"
                    >
                      Ver tratamiento
                      <ChevronRight className="h-4 w-4" strokeWidth={2} />
                    </a>
                  </div>
                </article>
              ))}
            </div>
          </section>

          {/* RESULTADOS & FINANCIAMIENTO */}
          <section className="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]" id="resultados">
            <article className="overflow-hidden rounded-[38px] border border-white/80 bg-white/76 shadow-soft backdrop-blur-xl">
              <div
                className="min-h-[380px] bg-[#fde7ee]"
                style={{
                  backgroundImage: `linear-gradient(90deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.02) 35%, rgba(255,255,255,0.58) 100%), url(${benefitsSource})`,
                  backgroundPosition: "left center",
                  backgroundSize: "cover",
                }}
              />
              <div className="p-7 sm:p-8">
                <SectionEyebrow>Resultados que inspiran confianza</SectionEyebrow>
                <h2 className="mt-6 max-w-[12ch] text-[2.8rem] font-bold leading-[0.95] tracking-[-0.06em] text-slate-900 sm:text-[3.6rem]">
                  Un tratamiento pensado para verse bien y sentirse mejor
                </h2>
                <p className="mt-5 max-w-[40ch] text-base leading-7 text-slate-700">
                  Alineamos funcionalidad bucal, armonía facial y seguimiento continuo para que el cambio no solo se note, sino que perdure toda la vida.
                </p>
              </div>
            </article>

            <div className="grid gap-6">
              <article className="rounded-[38px] border border-white/80 bg-white/76 p-7 shadow-soft backdrop-blur-xl sm:p-8" id="financiamiento">
                <SectionEyebrow>Financiamiento claro</SectionEyebrow>
                <h3 className="mt-6 text-[2.4rem] font-bold leading-[0.96] tracking-[-0.05em] text-slate-900 sm:text-[2.8rem]">
                  Cuida tu sonrisa con pagos flexibles y una ruta clara
                </h3>
                <div className="mt-6 grid gap-4 sm:grid-cols-3">
                  {paymentSteps.map((step) => (
                    <div className="rounded-[24px] bg-blush-50/90 p-5 text-sm font-semibold leading-6 text-slate-800 border border-blush-100" key={step}>
                      {step}
                    </div>
                  ))}
                </div>
              </article>

              <article className="rounded-[38px] border border-white/80 bg-gradient-to-br from-blush-500 to-blush-600 p-7 text-white shadow-glow">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/85">Agenda hoy</p>
                <h3 className="mt-5 max-w-[12ch] text-[2.4rem] font-bold leading-[0.96] tracking-[-0.05em]">
                  Tu nueva sonrisa puede empezar esta semana
                </h3>
                <a
                  className="mt-8 inline-flex min-h-[54px] items-center justify-center rounded-full bg-white px-7 text-sm font-bold text-blush-600 transition duration-300 hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                  href="#contacto"
                >
                  Reservar evaluación
                </a>
              </article>
            </div>
          </section>

          {/* ESPECIALISTAS */}
          <section className="rounded-[38px] border border-white/80 bg-white/74 p-7 shadow-soft backdrop-blur-xl sm:p-8" id="especialistas">
            <div className="flex flex-col gap-6 lg:flex-row lg:justify-between">
              <div>
                <SectionEyebrow>Nuestro equipo de especialistas</SectionEyebrow>
                <h2 className="mt-6 max-w-[11ch] text-[2.8rem] font-bold leading-[0.95] tracking-[-0.06em] text-slate-900 sm:text-[4rem]">
                  Especialistas que cuidan <span className="text-blush-500">tu sonrisa</span>
                </h2>
              </div>
              <p className="max-w-[32ch] pt-2 text-base leading-7 text-slate-700">
                Atención cercana, tecnología digital avanzada y una mirada integral para acompañar cada fase del tratamiento.
              </p>
            </div>

            <div className="mt-8 grid gap-6 lg:grid-cols-2">
              {specialists.map((doctor) => (
                <article className="grid overflow-hidden rounded-[34px] border border-white/80 bg-white/85 shadow-soft md:grid-cols-[0.85fr_1fr]" key={doctor.name}>
                  <div
                    className="min-h-[380px] bg-[#fbe5ec]"
                    style={{
                      backgroundImage: `url(${specialistsSource})`,
                      backgroundPosition: doctor.position,
                      backgroundSize: "cover",
                    }}
                  />
                  <div className="flex flex-col justify-center p-7">
                    <SectionEyebrow>Ortodoncista</SectionEyebrow>
                    <h3 className="mt-6 text-[2.2rem] font-bold leading-[0.97] tracking-[-0.05em] text-slate-900">{doctor.name}</h3>
                    <p className="mt-2 text-base font-semibold text-blush-600">{doctor.role}</p>
                    <p className="mt-4 text-base leading-7 text-slate-600">{doctor.body}</p>
                    <div className="mt-6 flex flex-wrap gap-2.5">
                      <span className="rounded-full bg-blush-50 px-4 py-2 text-xs font-semibold text-slate-700 border border-blush-100">{doctor.experience}</span>
                      <span className="rounded-full bg-blush-50 px-4 py-2 text-xs font-semibold text-slate-700 border border-blush-100">Resultados personalizados</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>

          {/* CONTACTO & FORMULARIO */}
          <section className="grid gap-6 rounded-[40px] border border-white/80 bg-white/72 p-6 shadow-soft backdrop-blur-xl lg:grid-cols-[minmax(0,0.78fr)_minmax(0,1.05fr)] lg:p-8" id="contacto">
            <div className="relative overflow-hidden rounded-[34px] bg-[#fde6ee]">
              <div
                className="min-h-[680px]"
                style={{
                  backgroundImage: `linear-gradient(90deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 42%, rgba(255,255,255,0.16) 100%), url(${contactSource})`,
                  backgroundPosition: "left center",
                  backgroundSize: "cover",
                }}
              />
              <div className="absolute left-5 top-5 rounded-[28px] border border-white/80 bg-white/85 px-5 py-4 shadow-soft backdrop-blur-xl">
                <p className="flex items-center gap-2 text-2xl font-bold tracking-[-0.05em] text-blush-500">
                  <Star className="h-5 w-5 fill-current" strokeWidth={1.8} />
                  4.9/5
                </p>
                <p className="mt-1 text-xs font-medium text-slate-600">valoración de pacientes</p>
              </div>
              <div className="absolute bottom-5 left-5 max-w-[320px] rounded-[32px] border border-white/80 bg-white/90 p-6 shadow-soft backdrop-blur-xl">
                <p className="text-3xl font-bold leading-[1.05] tracking-[-0.04em] text-slate-900">La mejor inversión es en ti y en tu sonrisa</p>
                <p className="mt-3 text-sm text-slate-600">Primera evaluación diagnóstica personalizada</p>
              </div>
            </div>

            <div className="rounded-[34px] border border-white/80 bg-white/85 p-7 shadow-soft">
              <SectionEyebrow>Estamos aquí para ti</SectionEyebrow>
              <h2 className="mt-6 max-w-[12ch] text-[2.8rem] font-bold leading-[0.95] tracking-[-0.06em] text-slate-900 sm:text-[3.8rem]">
                Agenda tu evaluación y empieza <span className="text-blush-500">tu cambio</span>
              </h2>
              <p className="mt-4 max-w-[34ch] text-base leading-7 text-slate-700">
                Déjanos tus datos y un asesor clínico te contactará para coordinar tu cita en el horario que prefieras.
              </p>

              <form className="mt-7 grid gap-4 md:grid-cols-2" onSubmit={handleSubmit} noValidate>
                {[
                  { id: "field-fullName", label: "Nombre completo", icon: SmilePlus, type: "text", placeholder: "Tu nombre", name: "fullName", value: formData.fullName, required: true },
                  { id: "field-phone", label: "Teléfono / WhatsApp", icon: Phone, type: "tel", placeholder: "Tu número", name: "phone", value: formData.phone, required: true },
                  { id: "field-email", label: "Correo electrónico", icon: Mail, type: "email", placeholder: "tunombre@email.com", name: "email", value: formData.email, required: true },
                  { id: "field-age", label: "Edad", icon: CalendarDays, type: "text", placeholder: "Tu edad (opcional)", name: "age", value: formData.age, required: false },
                ].map((field) => (
                  <div className="grid gap-1.5" key={field.id}>
                    <label className="text-sm font-semibold text-slate-700" htmlFor={field.id}>
                      {field.label} {field.required && <span className="text-blush-500">*</span>}
                    </label>
                    <div className="flex min-h-[58px] items-center gap-3 rounded-[20px] border border-blush-100 bg-slate-50/70 px-4 transition focus-within:border-blush-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-blush-200/50">
                      <field.icon className="h-5 w-5 shrink-0 text-slate-400" strokeWidth={1.8} />
                      <input
                        id={field.id}
                        className="w-full bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
                        name={field.name}
                        placeholder={field.placeholder}
                        type={field.type}
                        value={field.value}
                        onChange={handleChange}
                        required={field.required}
                      />
                    </div>
                  </div>
                ))}

                <div className="grid gap-1.5 md:col-span-2">
                  <label className="text-sm font-semibold text-slate-700" htmlFor="field-treatmentInterest">
                    ¿Qué te gustaría mejorar? <span className="text-blush-500">*</span>
                  </label>
                  <div className="flex min-h-[58px] items-center gap-3 rounded-[20px] border border-blush-100 bg-slate-50/70 px-4 transition focus-within:border-blush-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-blush-200/50">
                    <Stethoscope className="h-5 w-5 shrink-0 text-slate-400" strokeWidth={1.8} />
                    <select
                      id="field-treatmentInterest"
                      className="w-full bg-transparent text-sm text-slate-800 outline-none"
                      name="treatmentInterest"
                      value={formData.treatmentInterest}
                      onChange={handleChange}
                    >
                      <option>Ortodoncia</option>
                      <option>Alineadores invisibles</option>
                      <option>Brackets estéticos</option>
                      <option>Brackets metálicos</option>
                      <option>Diseño de sonrisa</option>
                    </select>
                  </div>
                </div>

                <div className="grid gap-1.5 md:col-span-2">
                  <label className="text-sm font-semibold text-slate-700" htmlFor="field-message">
                    Cuéntanos brevemente tu caso
                  </label>
                  <div className="flex gap-3 rounded-[24px] border border-blush-100 bg-slate-50/70 px-4 py-4 transition focus-within:border-blush-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-blush-200/50">
                    <MessageCircleMore className="mt-1 h-5 w-5 shrink-0 text-slate-400" strokeWidth={1.8} />
                    <textarea
                      id="field-message"
                      className="min-h-[120px] w-full resize-none bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
                      name="message"
                      placeholder="Escribe aquí cualquier detalle o consulta sobre tu sonrisa..."
                      value={formData.message}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <label className="flex items-start gap-3 md:col-span-2 cursor-pointer">
                  <input
                    className="mt-1 h-4 w-4 rounded border-blush-300 text-blush-500 focus:ring-blush-400"
                    type="checkbox"
                    name="acceptedPrivacy"
                    checked={formData.acceptedPrivacy}
                    onChange={handleChange}
                  />
                  <span className="text-sm leading-6 text-slate-600">
                    Acepto el tratamiento de mis datos personales según la Política de Privacidad para el agendamiento de mi evaluación.
                  </span>
                </label>

                {formStatus.kind !== "idle" && (
                  <div
                    role="alert"
                    aria-live="polite"
                    className={`rounded-[20px] border px-4 py-3 text-sm font-medium md:col-span-2 ${statusTone[formStatus.kind]}`}
                  >
                    {formStatus.message}
                  </div>
                )}

                <button
                  className="island-btn w-full justify-center bg-gradient-to-r from-blush-500 to-blush-600 text-white shadow-glow md:col-span-2 disabled:cursor-not-allowed disabled:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blush-400"
                  type="submit"
                  disabled={isSubmitting}
                >
                  <span>{isSubmitting ? "Enviando evaluación..." : "Agendar mi evaluación gratuita"}</span>
                  <span className="island-btn__icon">
                    <CalendarDays className="h-5 w-5" strokeWidth={1.9} />
                  </span>
                </button>
              </form>
            </div>
          </section>
        </main>

        {/* FOOTER */}
        <footer className="mt-8 rounded-[36px] border border-white/80 bg-white/80 px-6 py-8 shadow-soft backdrop-blur-xl">
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-5">
            <div>
              <p className="text-xl font-bold tracking-[0.14em] text-slate-900">SONRISA</p>
              <p className="mt-2 text-sm text-slate-600">Tu sonrisa, nuestra prioridad clínica y estética.</p>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="mt-1 h-5 w-5 text-blush-500 shrink-0" strokeWidth={1.8} />
              <div>
                <p className="text-sm font-bold text-slate-800">Dirección</p>
                <p className="mt-1 text-sm text-slate-600">Av. Principal Médica 123, Consultorio 402</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Phone className="mt-1 h-5 w-5 text-blush-500 shrink-0" strokeWidth={1.8} />
              <div>
                <p className="text-sm font-bold text-slate-800">Llámanos</p>
                <p className="mt-1 text-sm text-slate-600">+51 987 654 321</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Clock3 className="mt-1 h-5 w-5 text-blush-500 shrink-0" strokeWidth={1.8} />
              <div>
                <p className="text-sm font-bold text-slate-800">Horarios</p>
                <p className="mt-1 text-sm text-slate-600">Lun - Vie: 9:00 am - 7:00 pm<br />Sáb: 9:00 am - 2:00 pm</p>
              </div>
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">Síguenos</p>
              <div className="mt-3 flex gap-3">
                {[Instagram, Phone, Mail].map((Icon, index) => (
                  <span
                    className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-blush-50 text-blush-600 transition hover:bg-blush-100 hover:text-blush-700 cursor-pointer"
                    key={index}
                  >
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

