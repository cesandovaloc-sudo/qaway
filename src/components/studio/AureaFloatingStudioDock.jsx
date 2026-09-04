import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, MessageCircle, X, ChevronUp, Sparkles } from 'lucide-react';

export default function AureaFloatingStudioDock({
  projectName = "Auréa Skincare",
  backUrl = "/proyectos"
}) {
  const [minimized, setMinimized] = useState(false);
  const [closed, setClosed] = useState(false);

  if (closed) return null;

  const whatsappMessage = encodeURIComponent(
    `Hola Qaway Lab, estuve viendo el proyecto ${projectName} y me gustaría conversar sobre el desarrollo de una presencia digital similar para mi marca.`
  );
  const whatsappUrl = `https://wa.me/51953282216?text=${whatsappMessage}`;

  return (
    <div className="aurea-dock-container" role="region" aria-label="Barra de información y contacto de Qaway Lab">
      <AnimatePresence mode="wait">
        {!minimized ? (
          <motion.div
            key="dock-expanded"
            initial={{ opacity: 0, y: 28, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="aurea-studio-dock glass-white"
          >
            {/* 1. Botón Volver a Proyectos */}
            <Link
              to={backUrl}
              className="dock-back-pill"
              aria-label="Volver al catálogo de proyectos"
            >
              <ArrowLeft size={13} strokeWidth={2.4} />
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

            {/* 3. Acciones: CTA Conversemos + Botón Minimizar */}
            <div className="dock-actions">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="dock-cta-btn"
                aria-label="Conversar con Qaway Lab por WhatsApp"
              >
                <MessageCircle size={15} />
                <span>Conversemos</span>
              </a>

              <button
                type="button"
                onClick={() => setMinimized(true)}
                className="dock-icon-btn"
                aria-label="Minimizar barra"
                title="Minimizar"
              >
                <X size={14} />
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.button
            key="dock-minimized"
            initial={{ opacity: 0, scale: 0.88 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.88 }}
            whileHover={{ scale: 1.04, y: -2 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => setMinimized(false)}
            className="aurea-dock-pill-trigger glass-white"
            aria-label="Abrir barra de diseño Qaway Lab"
          >
            <Sparkles size={13} className="dock-sparkle-icon" />
            <span>Diseñado por Qaway Lab</span>
            <ChevronUp size={13} />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
