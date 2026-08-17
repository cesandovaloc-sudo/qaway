import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Cookie, X } from 'lucide-react'

export default function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Revisar si ya aceptaron las cookies previamente
    const consent = localStorage.getItem('qaway_cookie_consent')
    if (!consent) {
      // Mostrar con un ligero retraso para no bloquear la carga inicial visual
      const timer = setTimeout(() => setIsVisible(true), 1500)
      return () => clearTimeout(timer)
    }
  }, [])

  const acceptCookies = () => {
    localStorage.setItem('qaway_cookie_consent', 'accepted')
    setIsVisible(false)
  }

  const declineCookies = () => {
    // Si necesitas manejar el rechazo explícito, puedes guardarlo también
    localStorage.setItem('qaway_cookie_consent', 'declined')
    setIsVisible(false)
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="fixed bottom-4 left-4 right-4 md:bottom-8 md:left-8 z-[9999] md:max-w-md bg-white border border-black/10 rounded-2xl p-5 md:p-6 shadow-[0_20px_50px_rgba(0,0,0,0.1)] text-[#191918]"
        >
          <div className="flex items-start gap-4">
            <div className="mt-1 w-10 h-10 rounded-full bg-[#f5f5f4] flex items-center justify-center shrink-0">
              <Cookie className="text-[#191918]" size={20} />
            </div>
            
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-bold text-[13px] uppercase tracking-widest text-[#191918]">Privacidad y Cookies</h3>
                <button 
                  onClick={declineCookies} 
                  className="text-[#191918]/40 hover:text-[#191918] transition-colors"
                  aria-label="Cerrar"
                >
                  <X size={16} />
                </button>
              </div>
              <p className="text-xs text-[#191918]/60 leading-relaxed mb-4">
                Utilizamos cookies esenciales para que el sitio funcione y cookies analíticas para entender cómo navegas. Todo con el objetivo de mejorar tu experiencia.
              </p>
              
              <div className="flex items-center gap-3">
                <button
                  onClick={acceptCookies}
                  className="flex-1 bg-[#191918] hover:bg-black text-white text-[11px] font-bold uppercase tracking-widest px-4 py-2.5 rounded-lg transition-colors"
                >
                  Aceptar todo
                </button>
                <button
                  onClick={declineCookies}
                  className="flex-1 bg-[#f5f5f4] hover:bg-[#e7e5e4] text-[#191918] text-[11px] font-bold uppercase tracking-widest px-4 py-2.5 rounded-lg transition-colors"
                >
                  Rechazar
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
