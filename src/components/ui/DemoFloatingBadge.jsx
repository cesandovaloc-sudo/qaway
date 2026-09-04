import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';

export default function DemoFloatingBadge({
  backTo = '/proyectos',
  label = 'Volver a proyectos',
  threshold = 140
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
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="fixed left-0 top-24 sm:top-28 z-50 pointer-events-auto"
        >
          <Link
            to={backTo}
            aria-label="Volver al catálogo de proyectos"
            className="group relative flex items-center gap-2.5 rounded-r-full border-y border-r border-black/10 bg-white/80 py-2.5 pl-3 pr-3 shadow-[0_4px_16px_rgba(0,0,0,0.06)] backdrop-blur-xl transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] max-w-[42px] hover:max-w-[210px] overflow-hidden hover:bg-[#fffbf8] hover:border-[#fe6612]/30 hover:pr-4 hover:shadow-[0_8px_24px_rgba(254,102,18,0.12)]"
          >
            {/* 1. Icono de flecha siempre visible en la pared */}
            <span className="flex h-5 w-5 shrink-0 items-center justify-center text-zinc-600 transition-colors duration-200 group-hover:text-[#fe6612] group-hover:-translate-x-0.5">
              <ArrowLeft className="h-4 w-4" strokeWidth={2.4} />
            </span>

            {/* 2. Texto que se revela suavemente solo en hover */}
            <span className="whitespace-nowrap text-[12px] font-semibold text-zinc-700 opacity-0 transition-all duration-200 group-hover:opacity-100 group-hover:text-[#fe6612]">
              {label}
            </span>

            {/* Acento lateral sutil */}
            <span className="absolute left-0 top-1.5 bottom-1.5 w-[2.5px] rounded-r bg-zinc-300 transition-colors duration-200 group-hover:bg-[#fe6612]" />
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
