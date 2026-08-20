import { useState } from "react";
import {
  ArrowRight,
  CalendarCheck,
  CaretDown,
  ChartLineUp,
  CheckCircle,
  Clock,
  CreditCard,
  EnvelopeSimple,
  FacebookLogo,
  FirstAidKit,
  Headset,
  Heartbeat,
  InstagramLogo,
  List,
  MagicWand,
  MapPin,
  Phone,
  Play,
  SealCheck,
  ShieldCheck,
  Smiley,
  Sparkle,
  Star,
  TiktokLogo,
  Tooth,
  TrendUp,
  UsersThree,
  X,
  YoutubeLogo,
} from "@phosphor-icons/react";
import { dentalImages } from "../assets";
import { BrandLogo } from "./BrandLogo";
import { LeadForm } from "./LeadForm";
import { ResponsiveImage } from "./ResponsiveImage";
import { Reveal } from "./Reveal";

const navItems = [
  { label: "Servicios", href: "#beneficios" },
  { label: "Tratamientos", href: "#tratamientos", dropdown: true },
  { label: "Resultados", href: "#resultados" },
  { label: "Financiamiento", href: "#financiamiento" },
  { label: "Contacto", href: "#contacto" },
];

const heroHighlights = [
  { icon: UsersThree, label: "Especialistas certificados" },
  { icon: Sparkle, label: "Tecnología avanzada" },
  { icon: CreditCard, label: "Planes de pago flexibles" },
];

const heroMetrics = [
  { icon: Smiley, value: "+1,200", label: "sonrisas transformadas" },
  { icon: ShieldCheck, value: "10+", label: "años de experiencia" },
  { icon: Star, value: "4.9/5", label: "valoración de pacientes" },
  { icon: MapPin, value: "2", label: "clínicas en tu ciudad" },
];

const benefits = [
  { icon: Tooth, title: "Alineación precisa y efectiva", text: "Corregimos la posición de tus dientes para lograr una mordida más cómoda y funcional." },
  { icon: Smiley, title: "Mejora tu confianza", text: "Una sonrisa alineada realza tu imagen y te ayuda a sentirte seguro en cada momento." },
  { icon: ShieldCheck, title: "Salud para tu boca", text: "Dientes bien alineados facilitan la higiene y ayudan a prevenir problemas futuros." },
  { icon: ChartLineUp, title: "Resultados que se notan", text: "Avances visibles desde las primeras etapas con seguimiento profesional constante." },
];

const treatments = [
  {
    image: dentalImages.aligners,
    alt: "Paciente sosteniendo un alineador dental transparente",
    icon: Smiley,
    title: "Alineadores invisibles",
    text: "Corrige la posición de tus dientes con alineadores transparentes, cómodos y casi imperceptibles.",
  },
  {
    type: "whitening",
    icon: Sparkle,
    title: "Blanqueamiento dental",
    text: "Devuelve luminosidad a tu sonrisa con un procedimiento profesional, seguro y controlado.",
  },
  {
    image: dentalImages.smileDesign,
    alt: "Paciente durante una evaluación de diseño de sonrisa",
    icon: MagicWand,
    title: "Diseño de sonrisa",
    text: "Mejora la estética de tu sonrisa con un plan personalizado que resalta lo mejor de ti.",
  },
];

const specialists = [
  {
    image: dentalImages.specialistValeria,
    alt: "Dra. Valeria Martínez, especialista en ortodoncia",
    name: "Dra. Valeria Martínez",
    role: "Especialista en Ortodoncia y Ortopedia Maxilar",
    description: "Combina precisión clínica con un acompañamiento cercano en cada etapa del tratamiento.",
    years: "7+",
    specialty: "Ortodoncia y Ortopedia",
    imageSide: "left",
  },
  {
    image: dentalImages.specialistAndres,
    alt: "Dr. Andrés Hernández, especialista en ortodoncia",
    name: "Dr. Andrés Hernández",
    role: "Especialista en Ortodoncia y Estética Dental",
    description: "Enfocado en tratamientos personalizados con altos estándares de calidad y tecnología.",
    years: "10+",
    specialty: "Ortodoncia y Estética",
    imageSide: "right",
  },
];

function SectionLabel({ children }) {
  return (
    <span className="section-label">
      <Sparkle className="h-4 w-4" weight="fill" aria-hidden="true" />
      {children}
    </span>
  );
}

function WhiteningMedia() {
  return (
    <div className="whitening-media" aria-label="Comparación del resultado de un blanqueamiento dental">
      <ResponsiveImage
        alt="Sonrisa antes de un blanqueamiento dental"
        className="whitening-half"
        image={dentalImages.whiteningBefore}
        sizes="(min-width: 1024px) 200px, 50vw"
      />
      <ResponsiveImage
        alt="Sonrisa después de un blanqueamiento dental"
        className="whitening-half"
        image={dentalImages.whiteningAfter}
        sizes="(min-width: 1024px) 200px, 50vw"
      />
      <span className="whitening-divider" aria-hidden="true" />
    </div>
  );
}

function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="site-header">
      <div className="site-container flex h-[88px] items-center justify-between gap-5">
        <BrandLogo />
        <nav className="hidden items-center gap-8 lg:flex" aria-label="Navegación principal">
          {navItems.map((item) => (
            <a className="nav-link" href={item.href} key={item.label}>
              {item.label}
              {item.dropdown ? <CaretDown className="h-3.5 w-3.5" aria-hidden="true" /> : null}
            </a>
          ))}
        </nav>
        <a className="primary-button hidden min-h-[52px] lg:inline-flex" href="#contacto">
          Agenda tu evaluación
          <CalendarCheck className="h-5 w-5" weight="bold" aria-hidden="true" />
        </a>
        <button
          aria-expanded={open}
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
          className="icon-button lg:hidden"
          onClick={() => setOpen((current) => !current)}
          type="button"
        >
          {open ? <X className="h-6 w-6" /> : <List className="h-6 w-6" />}
        </button>
      </div>
      {open ? (
        <nav className="mobile-menu" aria-label="Navegación móvil">
          {navItems.map((item) => <a href={item.href} key={item.label} onClick={() => setOpen(false)}>{item.label}</a>)}
          <a className="primary-button justify-center" href="#contacto" onClick={() => setOpen(false)}>Agenda tu evaluación</a>
        </nav>
      ) : null}
    </header>
  );
}

function Hero() {
  return (
    <section className="hero-section" id="inicio">
      <ResponsiveImage
        alt="Paciente sonriendo con brackets en una clínica dental"
        className="hero-media"
        image={dentalImages.hero}
        loading="eager"
        sizes="100vw"
      />
      <div className="hero-wash" aria-hidden="true" />
      <div className="site-container hero-layout">
        <div className="hero-copy">
          <SectionLabel>Ortodoncia personalizada</SectionLabel>
          <h1>Brackets que alinean <span>tu sonrisa</span> y tu confianza</h1>
          <p>Tratamientos personalizados, seguros y cómodos para lograr la sonrisa que mereces.</p>
          <div className="hero-highlights">
            {heroHighlights.map(({ icon: Icon, label }) => (
              <div className="hero-highlight" key={label}>
                <span><Icon className="h-5 w-5" weight="regular" aria-hidden="true" /></span>
                {label}
              </div>
            ))}
          </div>
          <div className="hero-actions">
            <a className="primary-button" href="#contacto"><CalendarCheck className="h-5 w-5" weight="bold" />Agenda tu evaluación</a>
            <a className="secondary-button" href="#tratamientos"><Play className="h-5 w-5 text-rose-500" weight="fill" />Conoce tu tratamiento</a>
          </div>
        </div>
      </div>
      <div className="site-container hero-metrics-wrap" id="resultados">
        <div className="hero-metrics">
          {heroMetrics.map(({ icon: Icon, value, label }) => (
            <div className="metric" key={label}>
              <Icon className="h-8 w-8 text-rose-500" weight="regular" aria-hidden="true" />
              <div><strong>{value}</strong><span>{label}</span></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Benefits() {
  return (
    <section className="section-space" id="beneficios">
      <div className="site-container">
        <Reveal className="benefits-intro">
          <div className="benefits-copy">
            <SectionLabel>Tu sonrisa, nuestro compromiso</SectionLabel>
            <h2 className="section-title">Más que brackets, creamos <span>sonrisas que transforman</span></h2>
            <p className="section-copy">Combinamos experiencia, tecnología y un enfoque personalizado para brindarte una sonrisa alineada, saludable y llena de confianza.</p>
          </div>
          <ResponsiveImage
            alt="Detalle de una sonrisa con brackets"
            className="benefits-media"
            image={dentalImages.benefits}
            sizes="(min-width: 1024px) 58vw, 100vw"
          />
        </Reveal>
        <div className="benefits-grid">
          {benefits.map(({ icon: Icon, title, text }, index) => (
            <Reveal delay={index * 75} key={title}>
              <article className="benefit-card">
                <span className="feature-icon"><Icon className="h-8 w-8" weight="regular" /></span>
                <h3>{title}</h3>
                <span className="tiny-rule" aria-hidden="true" />
                <p>{text}</p>
              </article>
            </Reveal>
          ))}
        </div>
        <Reveal>
          <div className="evaluation-banner" id="financiamiento">
            <span className="evaluation-icon"><CalendarCheck className="h-10 w-10" weight="regular" /></span>
            <div><SectionLabel>Sin costo, sin compromiso</SectionLabel><h3>Evaluación inicial <span>sin costo</span></h3><p>Conoce el estado de tu sonrisa y recibe un plan de tratamiento personalizado.</p></div>
            <a className="primary-button" href="#contacto">Quiero mi evaluación gratis<ArrowRight className="h-5 w-5" /></a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function Treatments() {
  return (
    <section className="section-space treatments-section" id="tratamientos">
      <div className="site-container">
        <Reveal>
          <SectionLabel>Más opciones para tu sonrisa</SectionLabel>
          <h2 className="section-title mt-6">Explora otros <span>tratamientos</span></h2>
          <p className="section-copy mt-4">Soluciones diseñadas para cada etapa de tu sonrisa. Descubre la opción ideal para ti.</p>
        </Reveal>
        <div className="treatments-grid">
          {treatments.map((treatment, index) => (
            <Reveal delay={index * 90} key={treatment.title}>
              <article className="treatment-card">
                {treatment.type === "whitening" ? <WhiteningMedia /> : (
                  <ResponsiveImage alt={treatment.alt} className="treatment-media" image={treatment.image} sizes="(min-width: 1024px) 390px, 100vw" />
                )}
                <div className="treatment-content">
                  <span className="treatment-icon"><treatment.icon className="h-7 w-7" weight="regular" /></span>
                  <h3>{treatment.title}</h3>
                  <span className="tiny-rule" aria-hidden="true" />
                  <p>{treatment.text}</p>
                  <a href="#contacto">Ver tratamiento<ArrowRight className="h-5 w-5" /></a>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
        <Reveal>
          <div className="treatment-cta">
            <Headset className="h-16 w-16 text-rose-500" weight="light" aria-hidden="true" />
            <div><h3>¿No sabes cuál es ideal para ti? <span>Agenda una evaluación</span> y te orientamos.</h3><p>Nuestros especialistas te ayudarán a encontrar el tratamiento adecuado.</p></div>
            <a className="primary-button" href="#contacto"><CalendarCheck className="h-5 w-5" />Agenda tu evaluación</a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function Specialists() {
  return (
    <section className="section-space" id="especialistas">
      <div className="site-container">
        <Reveal className="specialists-heading">
          <div><SectionLabel>Nuestro equipo de especialistas</SectionLabel><h2 className="section-title mt-6">Especialistas que cuidan <span>tu sonrisa</span></h2><p className="section-copy mt-5">Ortodontistas certificados y un equipo comprometido con tu bienestar en cada paso.</p></div>
          <div className="specialist-promise"><Tooth className="h-12 w-12 text-rose-500" weight="light" /><p>Atención cercana, tecnología avanzada y resultados que transforman.</p></div>
        </Reveal>
        <div className="specialists-grid">
          {specialists.map((specialist, index) => (
            <Reveal delay={index * 100} key={specialist.name}>
              <article className={"specialist-card specialist-image-" + specialist.imageSide}>
                <ResponsiveImage alt={specialist.alt} className="specialist-media" image={specialist.image} sizes="(min-width: 1024px) 315px, 100vw" />
                <div className="specialist-content">
                  <SectionLabel>Ortodoncista</SectionLabel>
                  <h3>{specialist.name}</h3>
                  <h4>{specialist.role}</h4>
                  <span className="tiny-rule" aria-hidden="true" />
                  <p>{specialist.description}</p>
                  <div className="specialist-details">
                    <span><SealCheck className="h-6 w-6 text-rose-500" weight="regular" /><strong>{specialist.years}</strong> años de experiencia</span>
                    <span><FirstAidKit className="h-6 w-6 text-rose-500" weight="regular" />{specialist.specialty}</span>
                  </div>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function Contact() {
  return (
    <section className="contact-section" id="contacto">
      <div className="contact-photo">
        <ResponsiveImage alt="Paciente sonriendo en un sillón dental" className="contact-media" image={dentalImages.appointment} sizes="(min-width: 1024px) 50vw, 100vw" />
        <div className="rating-card"><Star className="h-7 w-7 text-rose-500" weight="fill" /><strong>4.9/5</strong><span>valoración de pacientes</span></div>
        <blockquote><span>“</span>La mejor inversión es en ti y en tu sonrisa.</blockquote>
      </div>
      <div className="contact-form-panel">
        <SectionLabel>Estamos aquí para ti</SectionLabel>
        <h2>Agenda tu evaluación y empieza <span>tu cambio</span></h2>
        <p>Déjanos tus datos y uno de nuestros especialistas se pondrá en contacto contigo para agendar tu cita.</p>
        <LeadForm />
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="site-footer" id="privacidad">
      <div className="site-container footer-grid">
        <div><BrandLogo /><p className="mt-4 text-sm text-ink/55">Tu sonrisa, nuestra prioridad.</p></div>
        <div className="footer-detail"><Phone /><span><small>Llámanos / WhatsApp</small><strong>55 1234 5678</strong></span></div>
        <div className="footer-detail"><EnvelopeSimple /><span><small>Correo electrónico</small><strong>hola@sonrisaclinica.com</strong></span></div>
        <div className="footer-detail"><Clock /><span><small>Horarios de atención</small><strong>Lun - Vie: 9:00 am - 7:00 pm</strong></span></div>
        <div className="socials" aria-label="Redes sociales"><a href="#instagram" aria-label="Instagram"><InstagramLogo /></a><a href="#facebook" aria-label="Facebook"><FacebookLogo /></a><a href="#tiktok" aria-label="TikTok"><TiktokLogo /></a><a href="#youtube" aria-label="YouTube"><YoutubeLogo /></a></div>
      </div>
      <div className="site-container mt-8 border-t border-rose-100 pt-5 text-center text-xs text-ink/45">© 2026 Sonrisa Clínica Dental · Política de Privacidad</div>
    </footer>
  );
}

export function LandingPage() {
  return (
    <div className="min-h-[100dvh] overflow-clip bg-page text-ink">
      <Header />
      <main>
        <Hero />
        <Benefits />
        <Treatments />
        <Specialists />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
