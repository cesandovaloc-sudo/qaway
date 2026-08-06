import { Link } from 'react-router-dom'
import { socialLinks, WHATSAPP_LINK } from '@/data/navigation'
import { getFooterLinks } from '@/config/siteVisibility'

export default function Footer() {
  const areaLinks = getFooterLinks('areas')
  const resourceLinks = getFooterLinks('resources')

  return (
    <footer className="border-t border-white/10 bg-[#111111] px-6 py-10 text-white sm:px-10 lg:px-14 lg:py-16">
      <div className="mx-auto max-w-[94rem]">
        <div className="grid gap-10 lg:grid-cols-[1.5fr_.9fr_.9fr_.9fr] lg:gap-14">
          <div className="lg:pr-16">
            <Link to="/" className="inline-flex items-center gap-2 text-2xl font-semibold tracking-[-0.05em]">
              Qaway <span className="text-[#ff4b0b]">Lab</span>
            </Link>
            <p className="mt-4 max-w-md text-xs leading-relaxed text-white/56 sm:text-sm">
              Un ecosistema para construir marca, ordenar operacion y activar aprendizaje con IA.
            </p>
            <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-white/50 transition-colors hover:text-white"
                >
                  {social.label}
                </a>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8 text-xs text-white/72 sm:grid-cols-3 lg:contents">
            {areaLinks.length > 0 && (
              <div>
                <p className="mb-3 text-[10px] uppercase tracking-[0.22em] text-[#ff4b0b]">Áreas</p>
                <div className="flex flex-wrap gap-x-4 gap-y-2 lg:grid lg:gap-3 lg:text-sm">
                  {areaLinks.map((link) => (
                    <Link key={link.key} to={link.path} className="text-white/50 hover:text-white">
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {resourceLinks.length > 0 && (
              <div>
                <p className="mb-3 text-[10px] uppercase tracking-[0.22em] text-[#ff4b0b]">Recursos</p>
                <div className="flex flex-wrap gap-x-4 gap-y-2 lg:grid lg:gap-3 lg:text-sm">
                  {resourceLinks.map((link) => (
                    <Link key={link.key} to={link.path} className="text-white/50 hover:text-white">
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            <div>
              <p className="mb-3 text-[10px] uppercase tracking-[0.22em] text-[#ff4b0b]">Contacto</p>
              <div className="flex flex-wrap gap-x-4 gap-y-2 lg:grid lg:gap-3 lg:text-sm">
                <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" className="text-white/50 hover:text-white">
                  Escribir por WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-white/10 pt-6 text-center">
          <span className="text-xs font-medium uppercase tracking-[0.18em] text-white/50">&copy; 2026 Qaway Lab</span>
        </div>
      </div>
    </footer>
  )
}