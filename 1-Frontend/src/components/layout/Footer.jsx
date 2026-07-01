import { Link } from 'react-router-dom'
import { socialLinks, WHATSAPP_LINK } from '@/data/navigation'

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#111111] px-6 py-14 text-white sm:px-10 lg:px-14 lg:py-16">
      <div className="mx-auto max-w-[94rem]">
        <div className="grid gap-14 lg:grid-cols-[1.5fr_.9fr_.9fr_.9fr]">
          <div className="lg:pr-16">
            <Link to="/" className="inline-flex items-center gap-2 text-2xl font-semibold tracking-[-0.05em]">
              Qaway <span className="text-[#ff4b0b]">Lab</span>
            </Link>
            <p className="mt-5 max-w-md text-sm leading-relaxed text-white/56">
              Un ecosistema para construir marca, ordenar operación y activar aprendizaje con IA.
            </p>
            <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-white/50 hover:text-white transition-colors flex items-center gap-1"
                >
                  {social.label}
                </a>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-4 text-[10px] uppercase tracking-[0.22em] text-[#ff4b0b]">Áreas</p>
            <div className="grid gap-3 text-sm text-white/72">
              <Link to="/estudio" className="hover:text-white">Estudio</Link>
              <Link to="/sistemas-digitales" className="hover:text-white">Sistemas digitales</Link>
              <Link to="/academy" className="hover:text-white">Academy</Link>
              <Link to="/hub" className="hover:text-white">Qaway Hub</Link>
            </div>
          </div>

          <div>
            <p className="mb-4 text-[10px] uppercase tracking-[0.22em] text-[#ff4b0b]">Recursos</p>
            <div className="grid gap-3 text-sm text-white/72">
              <Link to="/recursos" className="hover:text-white">Recursos</Link>
              <Link to="/blog" className="hover:text-white">Blog</Link>
            </div>
          </div>

          <div>
            <p className="mb-4 text-[10px] uppercase tracking-[0.22em] text-[#ff4b0b]">Contacto</p>
            <div className="grid gap-3 text-sm text-white/72">
              <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" className="hover:text-white">Escribir por WhatsApp</a>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-white/10 pt-6 text-center">
          <span className="text-xs uppercase tracking-[0.18em] text-white/50 font-medium">&copy; 2026 Qaway Lab</span>
        </div>
      </div>
    </footer>
  )
}
