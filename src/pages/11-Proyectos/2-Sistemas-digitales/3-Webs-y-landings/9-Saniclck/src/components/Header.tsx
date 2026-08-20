import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronDown, Menu, X } from "lucide-react";

const links = [
  ["Inicio", "#inicio"],
  ["Servicios", "#servicios"],
  ["Nosotros", "#nosotros"],
  ["Cómo trabajamos", "#como-trabajamos"],
  ["Proyectos", "#proyectos"],
  ["Contacto", "#contacto"],
] as const;

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-4 z-50 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between rounded-[22px] bg-white/95 px-5 py-3 shadow-[0_18px_50px_rgba(0,43,51,.16)] backdrop-blur-xl sm:px-7">
        <a href="#inicio" aria-label="Saniclick, inicio" className="shrink-0">
          <img src="/images/saniclick-logo.webp" alt="Saniclick" className="h-11 w-auto object-contain sm:h-12" />
        </a>

        <nav className="hidden items-center gap-7 lg:flex" aria-label="Navegación principal">
          {links.map(([label, href]) => (
            <a key={label} href={href} className="nav-link group">
              <span>{label}</span>
              {label === "Servicios" && <ChevronDown size={15} className="transition-transform group-hover:rotate-180" />}
            </a>
          ))}
        </nav>

        <a href="#contacto" className="hidden rounded-xl bg-[#079aaa] px-5 py-3 text-sm font-bold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#067f8e] hover:shadow-lg sm:inline-flex">
          Solicitar servicio <span className="ml-2 text-lg">◔</span>
        </a>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="rounded-xl p-2 text-[#063744] lg:hidden"
          aria-expanded={open}
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            className="mx-auto mt-2 max-w-[1440px] rounded-2xl bg-white p-3 shadow-2xl lg:hidden"
          >
            {links.map(([label, href]) => (
              <a key={label} href={href} onClick={() => setOpen(false)} className="block rounded-xl px-4 py-3 font-semibold text-[#063744] hover:bg-[#eef9f8]">
                {label}
              </a>
            ))}
            <a href="#contacto" onClick={() => setOpen(false)} className="mt-2 block rounded-xl bg-[#079aaa] px-4 py-3 text-center font-bold text-white">
              Solicitar servicio
            </a>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
