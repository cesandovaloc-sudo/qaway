import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, ShieldCheck, Sparkles, Wrench, X, Users, Leaf } from "lucide-react";
import { Header } from "./Header";

const benefits = [
  { title: "Sanidad", text: "Soluciones para espacios limpios y seguros.", icon: ShieldCheck },
  { title: "Mantenimiento", text: "Prevención, reparación y cuidado.", icon: Wrench },
  { title: "Profesionales", text: "Trabajo organizado y responsable.", icon: Users },
  { title: "Múltiples soluciones", text: "Un solo contacto para diferentes necesidades.", icon: Leaf },
];

export function Hero() {
  const reduced = useReducedMotion();

  return (
    <section id="inicio" className="hero-section relative min-h-[850px] overflow-hidden bg-[#002f39] pt-32 sm:min-h-[900px]">
      <Header />

      <div className="absolute inset-0">
        <img
          src="/images/hero-fumigacion.webp"
          alt="Profesional de Saniclick realizando un servicio de fumigación"
          className="absolute inset-y-0 right-0 h-full w-full object-cover object-[68%_center]"
        />
        <div className="hero-overlay absolute inset-0" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-[720px] max-w-[1440px] items-center px-6 pb-32 sm:px-10 lg:px-14">
        <motion.div
          initial={{ opacity: 0, x: reduced ? 0 : -28 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: reduced ? 0 : 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-[650px] pt-16"
        >
          <p className="mb-5 max-w-lg text-sm font-semibold uppercase tracking-[0.13em] text-[#19bfca] sm:text-base">
            Soluciones integrales para<br />espacios limpios, seguros y funcionales
          </p>

          <h1 className="max-w-[690px] text-5xl font-black leading-[0.98] tracking-[-0.045em] text-white sm:text-6xl lg:text-[76px]">
            Todo lo que<br />
            tu espacio necesita,<br />
            <span className="text-[#0ba6b5]">en un solo lugar.</span>
          </h1>

          <p className="mt-7 max-w-[540px] text-lg leading-8 text-white/90 sm:text-xl">
            Soluciones de sanidad, mantenimiento y servicios generales para hogares, empresas e instituciones.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#contacto" className="cta-primary">
              Solicitar servicio <span className="text-xl">◔</span>
            </a>
            <a href="#servicios" className="cta-secondary">
              Ver servicios <ArrowRight size={21} />
            </a>
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-x-5 gap-y-3 text-sm font-medium text-white/90 sm:text-base">
            {[
              { label: "Limpieza", Icon: Sparkles },
              { label: "Desinfección", Icon: ShieldCheck },
              { label: "Mantenimiento", Icon: Wrench },
              { label: "Reparaciones", Icon: X },
            ].map(({ label, Icon }) => (
              <span key={label} className="inline-flex items-center gap-2">
                <Icon size={19} />
                {label}
              </span>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="absolute bottom-5 left-1/2 z-20 w-[calc(100%-32px)] max-w-[1380px] -translate-x-1/2">
        <div className="feature-bar">
          {benefits.map(({ title, text, icon: I }, index) => (
            <div key={title} className={`feature-item ${index < benefits.length - 1 ? "lg:border-r lg:border-white/25" : ""}`}>
              <div className="feature-icon"><I size={27} /></div>
              <div>
                <h2>{title}</h2>
                <p>{text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
