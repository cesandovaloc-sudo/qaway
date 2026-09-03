import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Sparkles, ExternalLink } from 'lucide-react';

export default function DemoFloatingBadge({
  backTo = '/proyectos',
  label = 'Demo interactiva',
  brand = 'QAWAY LAB',
  sublabel = 'Proyecto en vivo',
  threshold = 80
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
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="fixed left-0 top-28 sm:top-36 z-50 pointer-events-auto"
        >
          {/* Banner Lateral Adherido al Margen Izquierdo */}
          <div className="group relative flex flex-col gap-2 rounded-r-2xl border-y border-r border-white/20 bg-[#051c20]/90 py-3.5 pl-4 pr-5 shadow-[0_18px_45px_rgba(0,0,0,0.4)] backdrop-blur-md transition-all duration-300 hover:border-[#fe6612]/60 hover:bg-[#051c20] hover:shadow-[0_20px_50px_rgba(254,102,18,0.25)]">
            
            {/* 1. Cabecera: Marca + Punto Pulsante de Estado */}
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#fe6612] opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#fe6612]"></span>
              </span>
              <span className="font-mono text-[10px] font-bold tracking-widest text-[#fe6612] uppercase">
                {brand}
              </span>
              <span className="text-[10px] text-white/40">|</span>
              <span className="text-[11px] font-medium text-white/70">
                {sublabel}
              </span>
            </div>

            {/* 2. Cuerpo del Banner con Título */}
            <div className="pr-1">
              <p className="text-[13px] font-semibold text-white/95 leading-tight">
                {label}
              </p>
            </div>

            {/* 3. Botón de Retorno a Proyectos */}
            <Link
              to={backTo}
              aria-label="Volver al catálogo de proyectos de Qaway Lab"
              className="mt-1 inline-flex items-center gap-2 rounded-lg bg-white/10 px-2.5 py-1.5 text-[11.5px] font-medium text-white transition-all duration-200 hover:bg-[#fe6612] hover:text-white"
            >
              <ArrowLeft className="h-3 w-3 transition-transform duration-200 group-hover:-translate-x-0.5" strokeWidth={2.4} />
              <span>Volver al catálogo</span>
            </Link>

            {/* Acento lateral decorativo */}
            <div className="absolute left-0 top-3 bottom-3 w-[3px] rounded-r bg-[#fe6612]" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
