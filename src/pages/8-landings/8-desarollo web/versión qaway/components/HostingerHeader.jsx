import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const navLinks = [
  { label: "Proyectos", path: "#proyectos" },
  { label: "Servicios", path: "#servicios" },
  { label: "Precios", path: "#precios" },
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
      className={`fixed inset-x-0 top-0 z-50 w-full transition-[transform,background-color,border-color] duration-300 ${
        headerVisible ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      {/* Barra Superior de Oferta de Lanzamiento */}
      <div
        style={{
          background: "#18181b",
          borderBottom: "1px solid rgba(254, 102, 18, 0.35)",
          padding: "6px 16px",
          textAlign: "center",
          fontSize: "12px",
          color: "#ffffff",
        }}
      >
        <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#d4d4d8" }}>
            <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#fe6612", display: "inline-block", boxShadow: "0 0 8px #fe6612" }} />
            <span>🔥 <strong>Oferta de Lanzamiento:</strong> One Web <strong>S/ 79.90</strong> · Web Comercial <strong>S/ 290</strong> · Tienda <strong>S/ 490</strong></span>
          </div>
          <a
            href="#precios"
            style={{ color: "#fe6612", fontWeight: "700", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "4px" }}
            onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
            onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
          >
            <span>Ver tarifario</span>
            <ArrowRight size={12} />
          </a>
        </div>
      </div>

      {/* Main Navbar */}
      <div
        className={`h-20 w-full border-b transition-colors ${
          scrolled
            ? "bg-white/95 border-[#20201f]/10 backdrop-blur-md shadow-sm"
            : "bg-white border-[#20201f]/5"
        }`}
      >
        <div className="mx-auto flex h-full max-w-[96rem] items-center justify-between px-6 sm:px-10 lg:px-14">
          
          {/* Brand Logo Oficial */}
          <Link
            to="/"
            className="text-xl font-semibold tracking-[-0.055em] text-[#20201f] transition-opacity hover:opacity-90"
          >
            Qaway <span className="text-[#fe6612]">Lab</span>
          </Link>

          {/* Enlaces de Navegación de Landing con Efecto Oficial */}
          <nav className="hidden items-center gap-7 md:flex lg:gap-10">
            {navLinks.map((link) => (
              <div key={link.label} className="group relative flex h-full items-center">
                <a
                  href={link.path}
                  className="relative py-2 text-[11px] font-bold uppercase tracking-widest text-[#292927]/80 transition-colors hover:text-[#fe6612] after:absolute after:left-1/2 after:-translate-x-1/2 after:w-[calc(100%-0.25rem)] after:-bottom-[26px] after:h-[1.5px] after:origin-center after:scale-x-0 after:transition-transform after:duration-200 hover:after:scale-x-100 hover:after:bg-[#fe6612]"
                >
                  {link.label}
                </a>
              </div>
            ))}
          </nav>

          {/* Botón CTA Oficial */}
          <div className="flex items-center gap-4">
            <a
              href="#contacto"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#fe6612] px-6 py-2.5 text-[0.84rem] font-semibold text-white shadow-[0_8px_20px_rgba(254,102,18,0.3)] transition-all hover:bg-[#e5590c] active:translate-y-px"
            >
              <span>Cotizar proyecto</span>
              <ArrowRight size={14} />
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
