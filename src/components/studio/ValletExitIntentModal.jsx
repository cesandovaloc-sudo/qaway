import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, MessageCircle, X, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';

export default function ValletExitIntentModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasTriggered, setHasTriggered] = useState(false);

  useEffect(() => {
    // 1. Detección de Exit-Intent en Desktop (cursor saliendo por la parte superior hacia las pestañas)
    const handleMouseLeave = (e) => {
      if (e.clientY <= 10 && !hasTriggered) {
        setIsOpen(true);
        setHasTriggered(true);
      }
    };

    // 2. Detección por Scroll Profundo (cuando llega al final de la página > 85%)
    const handleScroll = () => {
      const scrollPercent = (window.scrollY + window.innerHeight) / document.documentElement.scrollHeight;
      if (scrollPercent > 0.85 && !hasTriggered) {
        setIsOpen(true);
        setHasTriggered(true);
      }
    };

    document.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [hasTriggered]);

  const handleClose = () => {
    setIsOpen(false);
  };

  const whatsappMessage = encodeURIComponent(
    "Hola Qaway Lab, vi el proyecto de Vallet Inmobiliaria y me interesa desarrollar una plataforma interactiva de captación de clientes para mi negocio inmobiliario."
  );
  const whatsappUrl = `https://wa.me/51953282216?text=${whatsappMessage}`;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="vallet-exit-overlay" role="dialog" aria-modal="true" aria-labelledby="vallet-modal-title">
          {/* Fondo desenfocado */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="vallet-exit-backdrop"
            onClick={handleClose}
          />

          {/* Tarjeta Modal Editorial */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 20 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="vallet-exit-card"
          >
            <button
              onClick={handleClose}
              className="vallet-exit-close"
              aria-label="Cerrar modal de propuesta"
            >
              <X size={18} />
            </button>

            <div className="vallet-exit-kicker">
              <span className="kicker-pill">
                <Sparkles size={13} />
                <span>QAWAY LAB · CASE STUDY</span>
              </span>
              <span className="kicker-category">PropTech & Real Estate</span>
            </div>

            <h3 id="vallet-modal-title" className="vallet-exit-title">
              ¿Tu desarrollo inmobiliario necesita una plataforma que convierta?
            </h3>

            <p className="vallet-exit-desc">
              Creamos sistemas inmobiliarios a medida: <strong>catálogos interactivos</strong>, <strong>filtros inteligentes</strong> y <strong>embudos de captación de inversores</strong> diseñados para acelerar tus ventas.
            </p>

            <div className="vallet-exit-features">
              <div className="exit-feat">
                <ShieldCheck size={16} className="feat-icon" />
                <span>Carga ultrarrápida optimizada para anuncios</span>
              </div>
              <div className="exit-feat">
                <Building2 size={16} className="feat-icon" />
                <span>Experiencia editorial para propiedades exclusivas</span>
              </div>
            </div>

            <div className="vallet-exit-actions">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="vallet-exit-primary-btn"
                aria-label="Conversar con el equipo de Qaway Lab por WhatsApp"
              >
                <MessageCircle size={16} />
                <span>Solicitar propuesta para mi proyecto</span>
                <ArrowRight size={16} />
              </a>

              <button
                type="button"
                onClick={handleClose}
                className="vallet-exit-secondary-btn"
              >
                Continuar explorando el demo
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
