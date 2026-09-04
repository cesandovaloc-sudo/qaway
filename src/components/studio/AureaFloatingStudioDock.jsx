import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, MessageCircle, X, ChevronUp } from 'lucide-react';

export default function AureaFloatingStudioDock() {
  const [minimized, setMinimized] = useState(false);
  const [closed, setClosed] = useState(false);

  if (closed) return null;

  const whatsappMessage = encodeURIComponent(
    "Hola Qaway Lab, estuve viendo el proyecto Auréa Skincare y me gustaría cotizar una plataforma web similar para mi marca."
  );
  const whatsappUrl = `https://wa.me/51953282216?text=${whatsappMessage}`;

  return (
    <div className="aurea-dock-container" role="region" aria-label="Información del estudio Qaway Lab">
      <AnimatePresence mode="wait">
        {!minimized ? (
          <motion.div
            key="dock-expanded"
            initial={{ opacity: 0, y: 32, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="aurea-studio-dock"
          >
            <div className="dock-brand-info">
              <span className="dock-badge">
                <Sparkles size={13} className="dock-sparkle-icon" />
                <span>Qaway Lab Project</span>
              </span>
              <p className="dock-text">
                ¿Deseas una experiencia digital botánica y consciente como <strong>Auréa</strong> para tu negocio?
              </p>
            </div>

            <div className="dock-actions">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="dock-cta-btn"
                aria-label="Cotizar proyecto web con Qaway Lab por WhatsApp"
              >
                <MessageCircle size={15} />
                <span>Cotizar proyecto</span>
              </a>

              <button
                onClick={() => setMinimized(true)}
                className="dock-icon-btn"
                aria-label="Minimizar barra de estudio"
                title="Minimizar"
              >
                <X size={15} />
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.button
            key="dock-minimized"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.85 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setMinimized(false)}
            className="aurea-dock-pill-trigger"
            aria-label="Abrir información de diseño Qaway Lab"
          >
            <Sparkles size={14} className="dock-sparkle-icon" />
            <span>Diseñado por Qaway Lab</span>
            <ChevronUp size={14} />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
