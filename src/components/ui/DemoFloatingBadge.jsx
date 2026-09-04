import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';

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
          initial={{ opacity: 0, x: -35 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -35 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="fixed left-0 top-[86px] sm:top-[90px] z-50 pointer-events-auto"
        >
          {/* Banner Lateral Minimalista en Cristal Blanco */}
          <div className="group relative flex flex-col gap-2 rounded-r-2xl border-y border-r border-black/10 bg-white/85 py-3 pl-4 pr-5 shadow-[0_10px_28px_rgba(0,0,0,0.06)] backdrop-blur-xl transition-all duration-300 hover:border-black/18 hover:bg-white/95 hover:shadow-[0_14px_32px_rgba(0,0,0,0.09)]">
            
            {/* 1. Cabecera: Marca + Punto Pulsante */}
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-zinc-400 opacity-60"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-zinc-500"></span>
              </span>
              <span className="font-mono text-[10.5px] font-bold tracking-wider text-zinc-700 uppercase">
                {brand}
              </span>
              <span className="text-[10px] text-zinc-300">|</span>
              <span className="text-[11px] font-medium text-zinc-500">
                {sublabel}
              </span>
            </div>

            {/* 2. Título de la Maqueta */}
            <div>
              <p className="text-[13px] font-semibold text-zinc-800 leading-none">
                {label}
              </p>
            </div>

            {/* 3. Botón de Retorno con Grises Suaves y Texto Siempre Legible */}
            <Link
              to={backTo}
              aria-label="Volver al catálogo de proyectos de Qaway Lab"
              className="mt-0.5 inline-flex items-center gap-2 rounded-lg border border-black/[0.06] bg-black/[0.04] px-2.5 py-1.5 text-[11.5px] font-semibold !text-zinc-700 transition-all duration-200 hover:border-black/15 hover:bg-black/[0.09] hover:!text-zinc-950"
            >
              <ArrowLeft className="h-3 w-3 transition-transform duration-200 group-hover:-translate-x-0.5 !text-zinc-600 hover:!text-zinc-950" strokeWidth={2.4} />
              <span className="!text-inherit">Volver a proyectos</span>
            </Link>

            {/* Acento lateral sutil en escala de grises */}
            <div className="absolute left-0 top-2.5 bottom-2.5 w-[3px] rounded-r bg-zinc-300 group-hover:bg-zinc-500 transition-colors duration-200" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
