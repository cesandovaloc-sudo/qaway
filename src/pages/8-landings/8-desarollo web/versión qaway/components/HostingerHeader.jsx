import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const navLinks = [
  { label: "Beneficios", path: "#beneficios" },
  { label: "Rendimiento", path: "#rendimiento" },
  { label: "Seguridad", path: "#seguridad" },
  { label: "Planes", path: "#planes" },
  { label: "FAQ", path: "#faq" },
];

export function HostingerHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [headerVisible, setHeaderVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      setScrolled(currentY > 20);

      // Ocultar al hacer scroll hacia abajo, mostrar al hacer scroll hacia arriba
      if (currentY > lastScrollY.current && currentY > 50) {
        setHeaderVisible(false); // Ocultar al bajar
      } else {
        setHeaderVisible(true);  // Reaparecer al subir
      }

      lastScrollY.current = currentY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 h-20 w-full border-b transition-[transform,background-color,border-color] duration-300 ${
        headerVisible ? "translate-y-0" : "-translate-y-full"
      } ${
        scrolled
          ? "bg-[#f8f7f4]/95 border-[#20201f]/10 backdrop-blur-md shadow-sm"
          : "bg-[#f8f9f7] border-[#20201f]/5"
      }`}
    >
      <div className="mx-auto flex h-full max-w-[96rem] items-center justify-between px-6 sm:px-10 lg:px-14">
        
        {/* Brand Logo Oficial */}
        <Link
          to="/"
          className="text-xl font-semibold tracking-[-0.055em] text-[#20201f] transition-opacity hover:opacity-90"
        >
          Qaway <span className="text-[#ff4b0b]">Lab</span>
        </Link>

        {/* Enlaces de Navegación de Landing con Efecto Oficial */}
        <nav className="hidden items-center gap-7 md:flex lg:gap-10">
          {navLinks.map((link) => (
            <div key={link.label} className="group relative flex h-full items-center">
              <a
                href={link.path}
                className="relative py-2 text-[10.5px] font-bold uppercase tracking-widest text-[#292927]/80 transition-colors hover:text-[#292927] after:absolute after:left-1/2 after:-translate-x-1/2 after:w-[calc(100%-0.25rem)] after:-bottom-[26px] after:h-[1.5px] after:origin-center after:scale-x-0 after:transition-transform after:duration-200 hover:after:scale-x-100 hover:after:bg-[#ff4b0b]"
              >
                {link.label}
              </a>
            </div>
          ))}
        </nav>

        {/* Botón CTA Oficial */}
        <div className="flex items-center gap-4">
          <a
            href="#planes"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[6px] bg-[#111111] px-6 py-2.5 text-[0.84rem] font-semibold text-white shadow-[0_14px_36px_rgba(0,0,0,0.12)] transition-all hover:bg-[#27272a] active:translate-y-px"
          >
            <span>Empezar ya</span>
            <ArrowRight size={14} />
          </a>
        </div>
      </div>
    </header>
  );
}
