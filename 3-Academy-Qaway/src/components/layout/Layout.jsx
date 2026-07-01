import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'

const navLinks = [
  { path: '/', label: 'Inicio' },
  { path: '/cursos', label: 'Cursos' },
  { path: '/panel', label: 'Mi Panel' },
]

export default function Layout({ children }) {
  const { pathname } = useLocation()

  return (
    <div className="min-h-screen bg-[#f5f5f4] text-[#0d0f0d] font-sans">
      {/* ─── Navbar ─── */}
      <header className="fixed top-0 left-0 right-0 z-50 mix-blend-difference">
        <nav className="section-container flex items-center justify-between h-16 md:h-20">
          <Link
            to="/"
            className="text-sm font-semibold tracking-tight text-white hover:text-[#ff4b0b] transition-colors"
          >
            Qaway Academy
          </Link>

          <div className="flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-xs font-medium tracking-widest uppercase transition-colors ${
                  pathname === link.path
                    ? 'text-[#ff4b0b]'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </nav>
      </header>

      {/* ─── Main content ─── */}
      <motion.main
        key={pathname}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        {children}
      </motion.main>

      {/* ─── Footer ─── */}
      <footer className="border-t border-[#0d0f0d]/10">
        <div className="section-container py-12 md:py-16">
          <div className="flex flex-col md:flex-row items-start justify-between gap-8">
            <div>
              <Link
                to="/"
                className="text-sm font-semibold tracking-tight text-[#0d0f0d]"
              >
                Qaway Academy
              </Link>
              <p className="mt-2 text-xs text-[#666860] max-w-xs leading-relaxed">
                Plataforma educativa de Qaway Lab. Aprende IA, marketing digital,
                automatización y más.
              </p>
            </div>
            <div className="flex gap-8 text-xs text-[#666860]">
              <Link to="/cursos" className="hover:text-[#ff4b0b] transition-colors">
                Cursos
              </Link>
              <Link to="/acceder" className="hover:text-[#ff4b0b] transition-colors">
                Acceder
              </Link>
              <Link to="/registro" className="hover:text-[#ff4b0b] transition-colors">
                Registro
              </Link>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-[#0d0f0d]/8 text-[10px] text-[#666860] tracking-wider uppercase">
            &copy; {new Date().getFullYear()} Qaway Lab. Todos los derechos reservados.
          </div>
        </div>
      </footer>
    </div>
  )
}
