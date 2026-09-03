import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Sparkles } from 'lucide-react';

export default function DemoFloatingBadge({
  backTo = '/proyectos',
  label = 'Demo interactiva',
  brand = 'Qaway Lab',
  threshold = 120
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > threshold) {
        setVisible(true);
      } else {
        setVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [threshold]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, x: -25, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: -25, scale: 0.95 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="fixed left-4 sm:left-6 top-24 sm:top-28 z-50 pointer-events-auto"
        >
          <Link
            to={backTo}
            aria-label="Volver al catálogo de proyectos de Qaway Lab"
            className="group flex items-center gap-2.5 rounded-full border border-white/20 bg-[#061d21]/80 px-3.5 py-2 text-[12.5px] font-medium text-white/90 shadow-[0_10px_28px_rgba(0,0,0,0.3)] backdrop-blur-md transition-all duration-300 hover:border-[#fe6612]/60 hover:bg-[#061d21] hover:text-white hover:shadow-[0_12px_32px_rgba(254,102,18,0.22)]"
          >
            {/* Flecha animada en hover */}
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/10 transition-transform duration-300 group-hover:-translate-x-1 group-hover:bg-[#fe6612] group-hover:text-white">
              <ArrowLeft className="h-3 w-3" strokeWidth={2.5} />
            </span>

            {/* Punto indicador pulsante de Demo */}
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#fe6612] opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#fe6612]"></span>
            </span>

            {/* Texto compacto */}
            <span className="tracking-wide">
              <span className="font-semibold text-white/95">{brand}</span>
              <span className="hidden sm:inline text-white/60 mx-1.5">·</span>
              <span className="hidden sm:inline text-white/75">{label}</span>
            </span>
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
