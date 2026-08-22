import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Check, ChevronDown, ChevronLeft, ChevronRight, MessageCircle, Star, Leaf } from "lucide-react";
import { serviceCategories, services, projects, testimonials, faqs } from "../data/site";
import { Icon } from "../lib/icons";
import { Reveal } from "./Reveal";

export function CategorySection() {
  return (
    <section className="section-white pt-24 pb-12" aria-labelledby="categorias-title">
      <div className="container">
        <Reveal>
          <div className="text-center">
            <p className="eyebrow">SOLUCIONES A TU ALCANCE</p>
            <h2 id="categorias-title" className="section-title">¿Qué necesitas <span>solucionar?</span></h2>
          </div>
        </Reveal>

        <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-9">
          {serviceCategories.map((item, index) => (
            <Reveal key={item.label} delay={index * 0.035}>
              <a href="#servicios" className="category-card">
                <div className={`category-icon ${index === serviceCategories.length - 1 ? "bg-[#063744] text-white" : ""}`}>
                  <Icon name={item.icon} size={28} />
                </div>
                <span>{item.label}</span>
              </a>
            </Reveal>
          ))}
        </div>

        <div className="mt-7 flex items-center justify-center gap-2 text-sm text-slate-600">
          <MessageCircle className="text-[#2e7d4a]" size={22} />
          ¿No encuentras lo que buscas? Escríbenos por <strong className="text-[#2e7d4a]">WhatsApp</strong> y te ayudamos.
        </div>
      </div>
    </section>
  );
}

export function ServicesSection() {
  return (
    <section id="servicios" className="section-white py-20" aria-labelledby="services-title">
      <div className="container">
        <Reveal>
          <div className="mb-12 text-center">
            <p className="eyebrow">SOLUCIONES INTEGRALES</p>
            <h2 id="services-title" className="section-title">Nuestros <span>servicios</span></h2>
            <p className="section-subtitle">Soluciones completas para cada necesidad.</p>
          </div>
        </Reveal>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {services.map((service, index) => (
            <Reveal key={service.title} delay={index * 0.07}>
              <article className="service-card group">
                <div className="service-image-wrap">
                  <img src={service.image} alt={service.title} className="service-image" loading="lazy" />
                  <div className={`service-icon ${service.accent}`}><Icon name={service.icon} size={24} /></div>
                </div>
                <div className="p-6">
                  <h3>{service.title}</h3>
                  <ul>
                    {service.description.map((line) => <li key={line}>{line}</li>)}
                  </ul>
                  <a href="#contacto" className="service-link">Conocer más <ArrowRight size={18} /></a>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function FeatureBanners() {
  const banners = [
    {
      image: "/images/banner-sanidad.webp",
      title: <>Espacios más limpios.<br />Entornos más <span>seguros.</span></>,
      bullets: ["Control de plagas", "Desinfección", "Limpieza de tanques", "Saneamiento ambiental"],
      cta: "Conocer servicios de sanidad",
      className: "banner-teal",
    },
    {
      image: "/images/banner-mantenimiento.webp",
      title: <>Mantenemos tu espacio<br /><span>funcionando.</span></>,
      bullets: ["Gasfitería", "Pintura", "Carpintería", "Electricidad", "Mantenimiento"],
      cta: "Ver servicios de mantenimiento",
      className: "banner-green",
    },
  ];

  return (
    <section className="section-white pb-20">
      <div className="container grid gap-5 lg:grid-cols-2">
        {banners.map((banner, index) => (
          <Reveal key={banner.cta} delay={index * 0.08}>
            <article className={`feature-banner ${banner.className}`} style={{ backgroundImage: `url(${banner.image})` }}>
              <div className="relative z-10 max-w-[620px]">
                <h2>{banner.title}</h2>
                <div className="mt-8 flex flex-wrap gap-x-6 gap-y-4 text-sm font-medium text-white">
                  {banner.bullets.map((b) => <span key={b} className="inline-flex items-center gap-2"><Check size={18} />{b}</span>)}
                </div>
                <a href="#contacto" className="banner-cta">{banner.cta}<ArrowRight size={19} /></a>
              </div>
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

export function ProjectsSection() {
  const [active, setActive] = useState("Todos");
  const categories = ["Todos", "Sanidad ambiental", "Mantenimiento", "Pintura", "Carpintería", "Servicios generales"];
  const filtered = active === "Todos" ? projects : projects.filter((p) => p.category === active);

  return (
    <section id="proyectos" className="section-white pb-20" aria-labelledby="projects-title">
      <div className="container">
        <Reveal>
          <div className="floating-dark-block">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="eyebrow text-[#16b9c7]">RESULTADOS VISIBLES</p>
                <h2 id="projects-title" className="text-3xl font-black tracking-tight text-white sm:text-4xl">Trabajos <span>realizados</span></h2>
              </div>
              <a href="#contacto" className="text-sm font-bold text-[#15b8c7] transition hover:text-white">Ver más proyectos <ArrowRight className="ml-1 inline" size={18} /></a>
            </div>

            <div className="mt-7 flex gap-2 overflow-x-auto pb-1">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setActive(category)}
                  className={`filter-pill ${active === category ? "active" : ""}`}
                >
                  {category}
                </button>
              ))}
            </div>

            <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {filtered.map((project) => (
                <motion.article layout key={project.title} className="project-card">
                  <div className="relative overflow-hidden">
                    <img src={project.image} alt={project.title} loading="lazy" />
                    <div className="project-round-icon"><Icon name={project.icon} size={19} /></div>
                  </div>
                  <div className="p-4">
                    <h3>{project.title}</h3>
                    <p>{project.meta}</p>
                    <a href="#contacto">Ver proyecto <ArrowRight size={16} /></a>
                  </div>
                </motion.article>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export function QualityBar() {
  const items = [
    ["Calidad garantizada", "Usamos productos y materiales de alta calidad.", "ShieldCheck"],
    ["Personal capacitado", "Profesionales entrenados y con experiencia.", "Users"],
    ["Atención rápida", "Respondemos y actuamos cuando nos necesitas.", "Clock3"],
    ["Compromiso ambiental", "Cuidamos tu espacio y el entorno que compartimos.", "Leaf"],
  ];
  return (
    <section className="section-white pb-24">
      <div className="container">
        <Reveal>
          <div className="quality-bar">
            {items.map(([title, text, icon], index) => (
              <div key={title} className={`quality-item ${index < items.length - 1 ? "lg:border-r lg:border-[#0c6671]/15" : ""}`}>
                <div className="quality-icon"><Icon name={icon as string} size={26} /></div>
                <div><h3>{title}</h3><p>{text}</p></div>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export function TestimonialSection() {
  const [index, setIndex] = useState(0);
  const t = testimonials[index];

  const move = (dir: 1 | -1) => setIndex((current) => (current + dir + testimonials.length) % testimonials.length);

  if (!t) return null;

  return (
    <section id="nosotros" className="section-white pb-24">
      <div className="container">
        <Reveal>
          <div className="testimonial-block">
            <div className="grid items-stretch gap-8 lg:grid-cols-[0.95fr_1.05fr]">
              <div className="flex flex-col justify-center p-2 sm:p-6 lg:p-8">
                <p className="eyebrow text-[#74be46]">LO QUE DICEN NUESTROS CLIENTES</p>
                <h2 className="mt-3 max-w-xl text-4xl font-black leading-tight text-white sm:text-5xl">
                  Excelentes resultados,<br />clientes <span> satisfechos.</span>
                </h2>
                <div className="mt-8 rounded-[24px] bg-white/[.06] p-7 backdrop-blur">
                  <div className="text-5xl font-black leading-none text-[#0ca8b7]">“</div>
                  <p className="mt-3 text-base leading-7 text-white/90 sm:text-lg">{t.quote}</p>
                  <div className="mt-6 flex items-center gap-3">
                    <div className="h-12 w-12 overflow-hidden rounded-full border border-white/20 bg-white/10">
                      <img src="/images/avatar-javier.webp" alt="" className="h-full w-full object-cover" />
                    </div>
                    <div>
                      <p className="font-bold text-white">{t.name}</p>
                      <p className="text-sm text-[#0ca8b7]">{t.role}</p>
                    </div>
                  </div>
                </div>
                <div className="mt-6 flex items-center gap-3">
                  {testimonials.map((item, i) => <button key={item.name} onClick={() => setIndex(i)} aria-label={`Testimonio ${i + 1}`} className={`h-2.5 w-2.5 rounded-full ${i === index ? "bg-[#0ca8b7]" : "bg-white/20"}`} />)}
                  <div className="ml-auto flex gap-2">
                    <button onClick={() => move(-1)} className="round-arrow"><ChevronLeft size={19} /></button>
                    <button onClick={() => move(1)} className="round-arrow active"><ChevronRight size={19} /></button>
                  </div>
                </div>
              </div>

              <div className="featured-project-card">
                <img src="/images/featured-project.webp" alt="Proyecto destacado de mantenimiento integral de vivienda" />
                <div className="featured-label">PROYECTO DESTACADO</div>
                <div className="featured-caption">
                  <div>
                    <h3>Mantenimiento integral de vivienda</h3>
                    <p>⌖ La Molina, Lima</p>
                  </div>
                  <div className="hidden gap-4 md:grid md:grid-cols-4">
                    {["Limpieza de tanques", "Mantenimiento general", "Instalaciones eléctricas", "Pintura exterior"].map((x) => <span key={x}>{x}</span>)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export function FAQSection() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section className="section-white pb-20" aria-labelledby="faq-title">
      <div className="container max-w-6xl">
        <Reveal>
          <h2 id="faq-title" className="section-title mb-10">Preguntas <span>frecuentes</span></h2>
        </Reveal>
        <div className="grid gap-x-8 md:grid-cols-2">
          {faqs.map((question, i) => {
            const isOpen = open === i;
            return (
              <Reveal key={question} delay={(i % 2) * 0.04}>
                <div className="faq-item">
                  <button onClick={() => setOpen(isOpen ? null : i)} className="flex w-full items-center justify-between gap-4 py-5 text-left font-bold text-[#073846]" aria-expanded={isOpen}>
                    {question}
                    <ChevronDown className={`shrink-0 transition-transform ${isOpen ? "rotate-180 text-[#0b9aaa]" : ""}`} />
                  </button>
                  <motion.div initial={false} animate={{ height: isOpen ? "auto" : 0, opacity: isOpen ? 1 : 0 }} className="overflow-hidden">
                    <p className="pb-5 pr-10 text-sm leading-6 text-slate-600">Sí. Coordinamos cada caso y definimos el alcance, frecuencia y materiales necesarios antes de ejecutar el servicio.</p>
                  </motion.div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function CTASection() {
  return (
    <section id="contacto" className="section-white pb-8">
      <div className="container">
        <Reveal>
          <div className="cta-block">
            <div className="relative z-10 max-w-xl">
              <p className="eyebrow text-[#7bcf51]">HABLEMOS DE TU ESPACIO</p>
              <h2 className="mt-2 text-4xl font-black leading-tight text-white sm:text-5xl">Tu espacio,<br /><span>en buenas manos.</span></h2>
              <p className="mt-5 text-white/80">Cuéntanos qué necesitas y encontremos juntos la solución.</p>
              <div className="mt-7 flex flex-wrap gap-3">
                <a href="https://wa.me/51998123456" className="cta-green">Solicitar servicio <MessageCircle size={19} /></a>
                <a href="https://wa.me/51998123456" className="cta-outline">Hablar por WhatsApp <MessageCircle size={18} /></a>
              </div>
            </div>
            <div className="cta-points">
              {["Confianza y seguridad", "Soluciones responsables", "Profesionales capacitados"].map((x, i) => (
                <div key={x}><div className="cta-point-icon"><Icon name={i === 0 ? "ShieldCheck" : i === 1 ? "Leaf" : "Users"} size={27} /></div><span>{x}</span></div>
              ))}
            </div>
            <div className="watermark">◉</div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="bg-[#003b46] text-white" id="footer">
      <div className="container py-14">
        <div className="grid gap-10 lg:grid-cols-[1.35fr_1fr_1fr_1.2fr]">
          <div>
            <div className="flex items-center gap-3">
              <div className="footer-mark"><Leaf size={31} /></div>
              <div><p className="text-3xl font-black tracking-tight">SANI<span className="text-[#0aa8b6]">CLICK</span></p><p className="text-[9px] font-bold tracking-widest text-white/80">SANIDAD · MANTENIMIENTO · SERVICIOS GENERALES</p></div>
            </div>
            <p className="mt-6 max-w-sm text-sm leading-6 text-white/70">Soluciones integrales para espacios limpios, seguros y funcionales.</p>
            <div className="mt-5 flex gap-2">
              {["f", "◎", "◔"].map((x) => <a key={x} href="#contacto" className="social">{x}</a>)}
            </div>
          </div>
          <div>
            <h3 className="footer-title">Servicios</h3>
            <ul className="footer-list">{["Limpieza de tanques","Control de plagas","Desinfección","Gasfitería","Pintura","Carpintería","Electricidad","Mantenimiento general"].map(x => <li key={x}><a href="#servicios">{x}</a></li>)}</ul>
          </div>
          <div>
            <h3 className="footer-title">Empresa</h3>
            <ul className="footer-list">{["Nosotros","Cómo trabajamos","Proyectos","Preguntas frecuentes"].map(x => <li key={x}><a href={x === "Proyectos" ? "#proyectos" : "#nosotros"}>{x}</a></li>)}</ul>
          </div>
          <div>
            <h3 className="footer-title">Contacto</h3>
            <ul className="footer-contact">
              <li>◔ <span>998 123 456</span></li>
              <li>✉ <span>hola@saniclick.pe</span></li>
              <li>◷ <span>Lun - Sáb: 8:00 am - 6:00 pm</span></li>
              <li>⌖ <span>Lima Metropolitana</span></li>
            </ul>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container flex flex-col gap-3 py-5 text-xs text-white/55 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 Saniclick. Todos los derechos reservados.</p>
          <div className="flex gap-4"><a href="#footer">Política de privacidad</a><span>|</span><a href="#footer">Términos y condiciones</a></div>
        </div>
      </div>
    </footer>
  );
}
