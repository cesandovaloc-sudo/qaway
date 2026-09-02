import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ExternalLink } from 'lucide-react'

export default function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Revisar si ya aceptaron o rechazaron las cookies previamente
    const consent = localStorage.getItem('qaway_cookie_consent')
    if (!consent) {
      // Mostrar tras 1.2s para no interferir con la primera impresión
      const timer = setTimeout(() => setIsVisible(true), 1200)
      return () => clearTimeout(timer)
    }
  }, [])

  const acceptCookies = () => {
    localStorage.setItem('qaway_cookie_consent', 'accepted')
    setIsVisible(false)
  }

  const declineCookies = () => {
    localStorage.setItem('qaway_cookie_consent', 'declined')
    setIsVisible(false)
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="fixed bottom-0 inset-x-0 z-[9999] bg-white/95 backdrop-blur-md border-t border-black/10 py-3.5 px-4 sm:px-6 lg:px-8 shadow-[0_-8px_30px_rgba(0,0,0,0.06)] text-[#27272a]"
        >
          <div className="mx-auto max-w-7xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            
            {/* Texto informativo */}
            <div className="flex-1 pr-2">
              <p className="text-[12px] sm:text-[12.5px] leading-relaxed text-[#52525b]">
                Utilizamos cookies propias y de terceros para optimizar la navegación, medir el rendimiento y personalizar tu experiencia en Qaway Lab. Puedes aceptar todas las cookies, rechazar las opcionales o conocer más en nuestra{' '}
                <a
                  href="#privacidad"
                  className="font-medium text-[#18181b] underline underline-offset-2 hover:text-[#fe6612] transition-colors"
                >
                  Política de cookies
                </a>.
              </p>
            </div>

            {/* Grupo de Acciones */}
            <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto shrink-0">
              <button
                type="button"
                onClick={acceptCookies}
                className="flex-1 md:flex-none bg-[#18181b] hover:bg-[#27272a] active:scale-[0.98] text-white text-[12px] font-semibold px-4 py-2 rounded-lg transition-all shadow-sm"
              >
                Aceptar todas
              </button>

              <button
                type="button"
                onClick={declineCookies}
                className="flex-1 md:flex-none bg-[#f4f4f5] hover:bg-[#e4e4e7] active:scale-[0.98] text-[#27272a] text-[12px] font-semibold px-4 py-2 rounded-lg transition-all border border-black/5"
              >
                Rechazar opcionales
              </button>

              <a
                href="#cookies-config"
                onClick={(e) => {
                  e.preventDefault()
                  declineCookies()
                }}
                className="hidden lg:inline-flex items-center gap-1 text-[11.5px] text-[#71717a] hover:text-[#18181b] font-medium px-2 py-1 transition-colors"
              >
                <span>Administrar cookies</span>
                <ExternalLink size={12} />
              </a>

              {/* Botón cerrar X */}
              <button
                type="button"
                onClick={declineCookies}
                aria-label="Cerrar aviso de cookies"
                className="p-1.5 text-[#71717a] hover:text-[#18181b] hover:bg-[#f4f4f5] rounded-md transition-colors ml-1 hidden sm:flex items-center justify-center"
              >
                <X size={15} />
              </button>
            </div>

          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
