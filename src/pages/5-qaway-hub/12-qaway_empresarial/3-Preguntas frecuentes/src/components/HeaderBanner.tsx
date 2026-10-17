import React from 'react';
import { Plus, HeartHandshake } from 'lucide-react';

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
    <header className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#b91c1c] via-[#c81e1e] to-[#dc2626] text-white shadow-sm px-6 py-6 sm:px-9 sm:py-8 min-h-[240px] sm:min-h-[270px] flex flex-col justify-between">
      {/* 1. ILUSTRACIONES VECTORIALES BLANCAS (LÍNEA BLANCA PANORÁMICA SOBRE FONDO ROJO) */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-40 sm:h-52 md:h-60 overflow-hidden opacity-30 select-none"
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 1200 240"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="xMidYMax slice"
          className="w-full h-full"
        >
          {/* Relieve y colina de fondo */}
          <path
            d="M-50 240 L-50 180 Q220 170 480 145 T950 80 Q1080 65 1250 40 L1250 240 Z"
            stroke="white"
            strokeWidth="1.25"
            strokeOpacity="0.6"
          />

          {/* Camino con línea punteada */}
          <path
            d="M10 205 Q280 190 460 160 T860 120 Q1000 100 1150 70"
            stroke="white"
            strokeWidth="1.5"
            strokeDasharray="5 5"
            strokeOpacity="0.75"
          />

          {/* Escuela 1 (Izquierda) */}
          <g transform="translate(130, 115)" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="0" y="30" width="110" height="60" />
            <rect x="110" y="45" width="85" height="45" />
            <polygon points="-8,30 55,-5 118,30" />
            <polygon points="110,45 152,25 195,45" />
            <rect x="35" y="55" width="40" height="35" />
            <line x1="55" y1="55" x2="55" y2="90" />
            <rect x="18" y="40" width="18" height="15" />
            <rect x="74" y="40" width="18" height="15" />
            <rect x="125" y="55" width="14" height="14" />
            <rect x="145" y="55" width="14" height="14" />
            <rect x="165" y="55" width="14" height="14" />
            <line x1="55" y1="-5" x2="55" y2="-28" />
            <path d="M55 -28 L80 -22 L55 -16 Z" />
            <circle cx="-20" cy="40" r="22" strokeDasharray="3 2" />
            <circle cx="215" cy="50" r="26" strokeDasharray="3 2" />
          </g>

          {/* Estudiante en bicicleta (Izquierda Extrema) */}
          <g transform="translate(20, 135)" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="18" cy="42" r="15" />
            <circle cx="65" cy="42" r="15" />
            <circle cx="18" cy="42" r="2" />
            <circle cx="65" cy="42" r="2" />
            <line x1="18" y1="42" x2="40" y2="42" />
            <line x1="40" y1="42" x2="65" y2="42" />
            <line x1="40" y1="42" x2="32" y2="24" />
            <line x1="32" y1="24" x2="18" y2="42" />
            <line x1="32" y1="24" x2="56" y2="24" />
            <line x1="56" y1="24" x2="65" y2="42" />
            <line x1="56" y1="24" x2="54" y2="15" />
            <line x1="50" y1="15" x2="58" y2="15" />
            <circle cx="38" cy="-5" r="9" />
            <path d="M34 -1 C32 15 28 24 32 24" />
            <line x1="35" y1="10" x2="54" y2="16" />
            <path d="M32 24 L40 40 L44 42" />
          </g>

          {/* Estudiante con laptop y sombrero (Centro) */}
          <g transform="translate(430, 120)" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="28" cy="12" r="9" />
            <ellipse cx="28" cy="4" rx="16" ry="4" />
            <path d="M18 4 C18 -5 38 -5 38 4" />
            <path d="M16 35 C18 24 38 24 40 35" />
            <polygon points="35,34 56,34 50,22 38,22" />
            <line x1="30" y1="36" x2="60" y2="36" />
          </g>

          {/* Libros apilados y lápiz */}
          <g transform="translate(515, 145)" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="5,24 38,18 42,23 9,29" />
            <polygon points="4,18 36,12 40,17 8,23" />
            <polygon points="6,12 34,7 37,11 9,16" />
            <line x1="45" y1="8" x2="62" y2="28" />
            <polygon points="62,28 65,31 60,31" />
          </g>

          {/* Plantas y Hoja ecológica */}
          <g transform="translate(640, 155)" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 25 C12 12 22 8 26 2 C28 8 24 16 18 20" />
            <path d="M8 24 C8 15 2 10 -2 6 C-4 11 0 18 6 22" />
            <line x1="10" y1="25" x2="10" y2="35" />
          </g>

          {/* Escuela 2 en la colina (Derecha Superior) */}
          <g transform="translate(860, 45)" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="-8,30 90,-5 195,30" />
            <rect x="0" y="30" width="185" height="75" />
            <rect x="18" y="44" width="45" height="34" />
            <line x1="40" y1="44" x2="40" y2="78" />
            <line x1="18" y1="61" x2="63" y2="61" />
            <rect x="80" y="40" width="30" height="65" />
            <line x1="-30" y1="75" x2="-30" y2="25" />
            <path d="M-30 25 L-10 32 L-30 39 Z" />
          </g>

          {/* Estudiante en silla de ruedas leyendo (Inclusión - Derecha) */}
          <g transform="translate(990, 115)" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="40" cy="46" r="16" />
            <circle cx="40" cy="46" r="3" />
            <line x1="40" y1="46" x2="22" y2="28" />
            <line x1="22" y1="28" x2="22" y2="10" />
            <line x1="22" y1="28" x2="38" y2="28" />
            <line x1="38" y1="28" x2="46" y2="48" />
            <circle cx="28" cy="2" r="8" />
            <path d="M26 10 C24 18 28 26 36 26" />
            <path d="M26 20 L20 16 L20 25 L26 29 Z" />
            <path d="M26 20 L32 16 L32 25 L26 29 Z" />
          </g>

          {/* Árbol en colina (Derecha extrema) */}
          <g transform="translate(1125, 115)" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="20" y1="35" x2="20" y2="60" />
            <path d="M20 35 C-5 30 -5 -5 20 -10 C45 -5 45 30 20 35 Z" strokeDasharray="4 3" />
          </g>
        </svg>
      </div>

      {/* 2. FRANJA MULTICOLOR INFERIOR DECORATIVA */}
      <div className="absolute inset-x-0 bottom-0 h-1.5 flex" aria-hidden="true">
        <div className="w-1/3 bg-amber-400"></div>
        <div className="w-1/3 bg-cyan-400"></div>
        <div className="w-1/3 bg-rose-500"></div>
      </div>

      {/* 3. FILA SUPERIOR: BADGE OFICIAL Y 'PERÚ RESPONDE' ARRIBA */}
      <div className="relative z-10 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2.5">
          <span className="inline-flex items-center rounded-lg bg-white/20 backdrop-blur-xs px-3 py-1 text-xs font-black tracking-widest uppercase text-white border border-white/30">
            DIGERE • MC SIGA
          </span>
          <span className="text-white/70 text-xs font-bold">•</span>
          <span className="text-xs sm:text-sm font-semibold text-red-100">
            Dotación Oficial de Materiales Educativos
          </span>
        </div>

        {/* 'Perú Responde' anclado arriba a la derecha */}
        <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl bg-white/20 backdrop-blur-md border border-white/30 shadow-xs">
          <HeartHandshake className="w-4 h-4 text-white" />
          <div className="text-left">
            <span className="block text-xs font-black uppercase tracking-wider text-white leading-none">
              Perú Responde
            </span>
            <span className="block text-[11px] text-red-100 font-medium leading-tight mt-0.5">
              Atención y Orientación
            </span>
          </div>
        </div>
      </div>

      {/* 4. ZONA CENTRAL: TÍTULO Y LÍNEA DIVISORIA */}
      <div className="relative z-10 max-w-3xl space-y-2.5 my-4 sm:my-5">
        <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
          Banco de casuísticas y preguntas frecuentes
        </h1>
        <div className="w-full max-w-xl h-0.5 bg-white/40 rounded-full"></div>
      </div>

      {/* 5. FILA INFERIOR: DESCRIPCIÓN A LA IZQUIERDA Y BOTÓN DE ACCIÓN ABAJO A LA DERECHA */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2">
        <p className="text-sm sm:text-base leading-relaxed text-red-50/95 font-normal max-w-2xl">
          Herramienta interactiva de consulta para registrar, analizar y resolver casuísticas recurrentes durante el monitoreo a las UGEL e II.EE. a nivel nacional.
        </p>

        {/* Botón "+ Nueva Pregunta" anclado abajo a la derecha */}
        <div className="flex-shrink-0 self-end">
          {isAdmin ? (
            <button
              type="button"
              onClick={onOpenNewCaseModal}
              className="group inline-flex items-center gap-2.5 rounded-xl bg-white text-[#b91c1c] hover:bg-red-50 px-5 py-3 text-sm font-bold shadow-md hover:shadow-lg transition-all transform active:scale-95 cursor-pointer"
              title="Cargar casuísticas de modo manual"
            >
              <div className="w-6 h-6 rounded-lg bg-red-100 text-[#b91c1c] flex items-center justify-center group-hover:bg-red-200 transition">
                <Plus className="w-4 h-4" />
              </div>
              <span>+ Nueva Pregunta</span>
              <span className="ml-1 px-2 py-0.5 rounded-full text-xs font-black bg-red-100 text-[#b91c1c]">
                {totalCases}
              </span>
            </button>
          ) : (
            <div className="inline-flex items-center gap-2 rounded-xl bg-white/15 backdrop-blur-xs px-4 py-2 text-sm font-semibold text-white border border-white/20">
              <span className="text-white/90">Casos activos:</span>
              <span className="px-2.5 py-0.5 rounded-md bg-white text-[#b91c1c] font-black text-sm">
                {totalCases}
              </span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
