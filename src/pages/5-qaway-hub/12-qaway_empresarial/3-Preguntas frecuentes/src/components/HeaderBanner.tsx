import React from 'react';
import { Plus, FileSpreadsheet } from 'lucide-react';

interface HeaderBannerProps {
  totalCases: number;
  isAdmin: boolean;
  onOpenNewCaseModal: () => void;
  onOpenExcelPage?: () => void;
  isVisible?: boolean;
}

export const HeaderBanner: React.FC<HeaderBannerProps> = ({
  totalCases,
  isAdmin,
  onOpenNewCaseModal,
  onOpenExcelPage,
  isVisible = true
}) => {
  return (
    <>
      {/* 1. NAVBAR SUPERIOR BLANCO (PERÚ RESPONDE ENCIMA DE TODO) */}
      <nav className="w-full bg-white border-b border-slate-200/90 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3 flex items-center justify-between gap-4">
          {/* Lado izquierdo: Identificador institucional formal sin logos no autorizados */}
          <div className="flex items-center gap-2.5">
            <span className="inline-flex items-center rounded-md bg-slate-100 px-2.5 py-1 text-xs font-black tracking-wider uppercase text-slate-800 border border-slate-200">
              DIGERE • MC SIGA
            </span>
            <span className="hidden sm:inline text-xs font-semibold text-slate-500">
              Monitoreo Cuadro de Distribución de Materiales Educativos
            </span>
          </div>

          {/* Lado derecho: Logotipo oficial de Perú Responde sobre fondo blanco */}
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 sm:w-8 sm:h-8 flex-shrink-0 flex items-center justify-center">
              <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                <rect width="40" height="40" rx="8" fill="#d81b3d" />
                <path
                  d="M20 10 C16 6 10 9 10 15 C10 22 20 28 20 28 C20 28 30 22 30 15 C30 9 24 6 20 10 Z"
                  fill="white"
                />
                <path
                  d="M14 16 L20 22 L26 16"
                  stroke="#d81b3d"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div className="text-left">
              <span className="block text-xs sm:text-sm font-black uppercase tracking-tight text-slate-900 leading-none">
                Perú Responde
              </span>
              <span className="block text-[11px] font-medium text-slate-500 leading-tight mt-0.5">
                Atención y Orientación
              </span>
            </div>
          </div>
        </div>
      </nav>

      {/* 2. GRAN HERO BANNER ROJO CARMESÍ A ANCHO COMPLETO (#d81b3d) CON BORDES INFERIORES REDONDEADOS */}
      <header className="relative w-full overflow-hidden bg-[#d81b3d] text-white rounded-b-2xl sm:rounded-b-3xl shadow-[0_6px_24px_-4px_rgba(216,27,61,0.28)]">
        {/* 3. ILUSTRACIÓN VECTORIAL DE LÍNEA BLANCA CON MÁSCARA (FONDO LIMPIO DETRÁS DEL TEXTO) */}
        <div
          className="pointer-events-none absolute inset-0 overflow-hidden select-none"
          style={{
            maskImage: 'linear-gradient(to right, transparent 0%, transparent 35%, rgba(0,0,0,0.35) 55%, rgba(0,0,0,0.9) 85%, black 100%)',
            WebkitMaskImage: 'linear-gradient(to right, transparent 0%, transparent 35%, rgba(0,0,0,0.35) 55%, rgba(0,0,0,0.9) 85%, black 100%)'
          }}
          aria-hidden="true"
        >
          <svg
            viewBox="0 0 1200 240"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="xMidYMax slice"
            className="w-full h-full opacity-40"
          >
            {/* Colina y relieve */}
            <path
              d="M-50 240 L-50 180 Q220 170 480 145 T950 80 Q1080 65 1250 40 L1250 240 Z"
              stroke="white"
              strokeWidth="1.25"
              strokeOpacity="0.8"
            />

            {/* Camino punteado */}
            <path
              d="M10 205 Q280 190 460 160 T860 120 Q1000 100 1150 70"
              stroke="white"
              strokeWidth="1.5"
              strokeDasharray="5 5"
              strokeOpacity="0.9"
            />

            {/* Estudiante con laptop y sombrero (Centro) */}
            <g transform="translate(450, 115)" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="28" cy="12" r="9" />
              <ellipse cx="28" cy="4" rx="16" ry="4" />
              <path d="M18 4 C18 -5 38 -5 38 4" />
              <path d="M16 35 C18 24 38 24 40 35" />
              <polygon points="35,34 56,34 50,22 38,22" />
              <line x1="30" y1="36" x2="60" y2="36" />
            </g>

            {/* Libros apilados y lápiz */}
            <g transform="translate(535, 140)" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="5,24 38,18 42,23 9,29" />
              <polygon points="4,18 36,12 40,17 8,23" />
              <polygon points="6,12 34,7 37,11 9,16" />
              <line x1="45" y1="8" x2="62" y2="28" />
              <polygon points="62,28 65,31 60,31" />
            </g>

            {/* Planta y brote ecológico */}
            <g transform="translate(660, 150)" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 25 C12 12 22 8 26 2 C28 8 24 16 18 20" />
              <path d="M8 24 C8 15 2 10 -2 6 C-4 11 0 18 6 22" />
              <line x1="10" y1="25" x2="10" y2="35" />
            </g>

            {/* Escuela rural en la colina (Derecha) */}
            <g transform="translate(860, 40)" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="-8,30 90,-5 195,30" />
              <rect x="0" y="30" width="185" height="75" />
              <rect x="18" y="44" width="45" height="34" />
              <line x1="40" y1="44" x2="40" y2="78" />
              <line x1="18" y1="61" x2="63" y2="61" />
              <rect x="80" y="40" width="30" height="65" />
              <line x1="-30" y1="75" x2="-30" y2="25" />
              <path d="M-30 25 L-10 32 L-30 39 Z" />
            </g>

            {/* Estudiante en silla de ruedas leyendo (Derecha) */}
            <g transform="translate(990, 110)" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
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

            {/* Árbol en colina (Extremo derecho) */}
            <g transform="translate(1125, 110)" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="20" y1="35" x2="20" y2="60" />
              <path d="M20 35 C-5 30 -5 -5 20 -10 C45 -5 45 30 20 35 Z" strokeDasharray="4 3" />
            </g>
          </svg>
        </div>

        {/* 4. FRANJA MULTICOLOR EN LA BASE DECORATIVA (AMARILLO, CIAN, ROSA) */}
        <div className="absolute inset-x-0 bottom-0 h-1.5 w-full flex" aria-hidden="true">
          <div className="w-1/3 bg-amber-400"></div>
          <div className="w-1/3 bg-cyan-400"></div>
          <div className="w-1/3 bg-rose-500"></div>
        </div>

        {/* 5. CONTENIDO DEL BANNER CENTRADO DENTRO DE LA FRANJA ROJA A ANCHO COMPLETO (+15% AIRE VERTICAL) */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-13 min-h-[265px] sm:min-h-[300px] flex flex-col justify-between">
          {/* TÍTULO Y LÍNEA DIVISORIA */}
          <div className="max-w-3xl space-y-2.5">
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Banco de casuísticas y preguntas frecuentes
            </h1>
            <div className="w-full max-w-xl h-0.5 bg-white/40 rounded-full"></div>
          </div>

          {/* FILA INFERIOR: DESCRIPCIÓN Y BOTÓN ANCLADO ABAJO A LA DERECHA */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5 pt-3 pb-1">
            <p className="text-sm sm:text-base leading-relaxed text-white/95 font-normal max-w-2xl">
              Herramienta interactiva de consulta para registrar, analizar y resolver casuísticas recurrentes durante el monitoreo a las UGEL e II.EE. en el marco del MC SIGA.
            </p>

            <div className="flex-shrink-0 self-end flex items-center gap-2.5">
              {isAdmin ? (
                <>
                  {onOpenExcelPage && (
                    <button
                      type="button"
                      onClick={onOpenExcelPage}
                      className="inline-flex items-center gap-2 rounded-xl bg-white/20 hover:bg-white/30 text-white backdrop-blur-xs border border-white/40 px-4 py-3 text-sm font-bold shadow-xs hover:shadow-md transition cursor-pointer"
                      title="Abrir la Hoja de Cálculo tipo Excel a Pantalla Completa"
                    >
                      <FileSpreadsheet className="w-4 h-4 text-emerald-300" />
                      <span>Hoja de Cálculo Excel</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={onOpenNewCaseModal}
                    className="group inline-flex items-center gap-2.5 rounded-xl bg-white text-[#d81b3d] hover:bg-red-50 px-5 py-3 text-sm font-bold shadow-md hover:shadow-lg transition-all transform active:scale-95 cursor-pointer"
                    title="Cargar casuísticas de modo manual"
                  >
                    <div className="w-6 h-6 rounded-lg bg-red-100 text-[#d81b3d] flex items-center justify-center group-hover:bg-red-200 transition">
                      <Plus className="w-4 h-4" />
                    </div>
                    <span>Nueva Pregunta</span>
                    <span className="ml-1 px-2 py-0.5 rounded-full text-xs font-black bg-red-100 text-[#d81b3d]">
                      {totalCases}
                    </span>
                  </button>
                </>
              ) : (
                <div className="inline-flex items-center gap-2 rounded-xl bg-white/20 backdrop-blur-xs px-4 py-2 text-sm font-semibold text-white border border-white/30">
                  <span className="text-white/90">Casos activos:</span>
                  <span className="px-2.5 py-0.5 rounded-md bg-white text-[#d81b3d] font-black text-sm">
                    {totalCases}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
    </>
  );
};
