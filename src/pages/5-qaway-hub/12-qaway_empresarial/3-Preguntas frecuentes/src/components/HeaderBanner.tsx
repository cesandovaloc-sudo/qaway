import React from 'react';
import { Plus } from 'lucide-react';

interface HeaderBannerProps {
  totalCases: number;
  isAdmin: boolean;
  onOpenNewCaseModal: () => void;
}

export const HeaderBanner: React.FC<HeaderBannerProps> = ({
  totalCases,
  isAdmin,
  onOpenNewCaseModal
}) => {
  return (
    <header className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#b91c1c] via-[#c81e1e] to-[#dc2626] text-white shadow-sm px-6 py-7 sm:px-9 sm:py-8">
      {/* Fondo SVG geométrico institucional */}
      <div className="pointer-events-none absolute inset-y-0 right-0 w-1/2 overflow-hidden">
        <svg
          className="absolute right-0 top-0 h-full w-full transform translate-x-12 scale-125 opacity-20"
          viewBox="0 0 500 300"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
        >
          <path d="M180 300C240 160 360 60 500 20V300H180Z" fill="#ffffff" fillOpacity="0.35" />
          <path d="M290 300C330 140 410 40 500 -20V300H290Z" fill="#ffffff" fillOpacity="0.45" />
          <circle cx="420" cy="240" r="190" fill="url(#paint0_radial)" fillOpacity="0.3" />
          <defs>
            <radialGradient
              id="paint0_radial"
              cx="0"
              cy="0"
              r="1"
              gradientUnits="userSpaceOnUse"
              gradientTransform="translate(420 240) rotate(90) scale(190)"
            >
              <stop stopColor="white" />
              <stop offset="1" stopColor="white" stopOpacity="0" />
            </radialGradient>
          </defs>
        </svg>
      </div>

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="max-w-3xl space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-[11px] sm:text-xs font-bold tracking-[0.16em] uppercase text-red-100/90">
              MINEDU • DIGERE
            </span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
            Banco de casuísticas y preguntas frecuentes
          </h1>
          <p className="text-sm sm:text-base leading-relaxed text-red-50/90 font-normal pt-0.5 max-w-2xl">
            Banco oficial de consulta para registrar y revisar casuísticas recurrentes identificadas durante el monitoreo a las UGEL en el marco del MC SIGA.
          </p>
        </div>

        {/* Controles de cabecera */}
        <div className="flex-shrink-0 flex items-center gap-2">
          {isAdmin ? (
            <button
              type="button"
              onClick={onOpenNewCaseModal}
              className="group inline-flex items-center gap-2.5 rounded-xl bg-white text-[#b91c1c] hover:bg-red-50 px-4 py-3 text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all transform active:scale-95 cursor-pointer"
              title="Cargar casuísticas de modo manual"
            >
              <div className="w-6 h-6 rounded-lg bg-red-100 text-[#b91c1c] flex items-center justify-center group-hover:bg-red-200 transition">
                <Plus className="w-4 h-4" />
              </div>
              <span>+ Nueva Pregunta</span>
              <span className="ml-0.5 px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-red-100/90 text-[#b91c1c]">
                {totalCases} {totalCases === 1 ? 'caso' : 'casos'}
              </span>
            </button>
          ) : (
            <div className="inline-flex items-center gap-2 rounded-xl bg-white/10 backdrop-blur-xs px-3.5 py-2 text-xs font-semibold text-white border border-white/20">
              <span>Total registrado:</span>
              <span className="px-2 py-0.5 rounded-md bg-white text-[#b91c1c] font-black text-xs">
                {totalCases} casos
              </span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
