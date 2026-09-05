import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, MessageCircle } from 'lucide-react';
import './studio-dock.css';

export default function StudioFloatingDock({
  projectName = "Proyecto Qaway",
  backUrl = "/proyectos",
  scrollThreshold = 140
}) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > scrollThreshold) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [scrollThreshold]);

  const whatsappMessage = encodeURIComponent(
    `Hola Qaway Lab, estuve viendo el proyecto ${projectName} y me gustaría conversar sobre el desarrollo de una presencia digital similar para mi marca.`
  );
  const whatsappUrl = `https://wa.me/51953282216?text=${whatsappMessage}`;

  return (
    <div className="qw-studio-dock-container" role="region" aria-label="Barra de información y contacto de Qaway Lab">
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, y: 46, filter: 'blur(12px)', scale: 0.96 }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)', scale: 1 }}
            exit={{ opacity: 0, y: 32, filter: 'blur(10px)', scale: 0.96 }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            className="qw-studio-dock glass-white"
          >
            {/* 1. Botón Volver a Proyectos */}
            <Link
              to={backUrl}
              className="dock-back-pill"
              aria-label="Volver al catálogo de proyectos"
            >
              <ArrowLeft size={14} strokeWidth={2.4} />
              <span>Volver a Proyectos</span>
            </Link>

            {/* 2. Bloque de Texto General + Derechos Reservados */}
            <div className="dock-brand-info">
              <p className="dock-text">
                ¿Deseas que tu marca o proyecto tenga una presencia digital como esta?
              </p>
              <span className="dock-copyright-note">
                Qaway Lab Studio © · Todos los derechos reservados
              </span>
            </div>

            {/* 3. CTA Conversemos */}
            <div className="dock-actions">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="dock-cta-btn"
                aria-label="Conversar con Qaway Lab por WhatsApp"
              >
                <MessageCircle size={16} />
                <span>Conversemos</span>
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
