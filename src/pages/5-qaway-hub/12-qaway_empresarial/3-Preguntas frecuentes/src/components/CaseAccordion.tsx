import React from 'react';
import {
  ChevronDown,
  Pencil,
  Trash2,
  AlertCircle,
  SlidersHorizontal,
  CheckCircle2
} from 'lucide-react';
import { ScoredCasuistica } from '../types/casuistica';

interface CaseAccordionProps {
  caseItem: ScoredCasuistica;
  isOpen: boolean;
  onToggle: () => void;
  isAdmin: boolean;
  onEdit: () => void;
  onDelete: () => void;
  tokens: string[];
}

export const highlightContent = (text: string, tokens: string[]): React.ReactNode => {
  if (!text || !tokens || tokens.length === 0) return text;

  const validTokens = tokens.filter((t) => t.length > 1);
  if (validTokens.length === 0) return text;

  const regexPattern = new RegExp(
    `(${validTokens.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`,
    'gi'
  );

  const parts = text.split(regexPattern);
  return parts.map((part, index) => {
    const isMatch = validTokens.some(
      (t) => t.toLowerCase() === part.toLowerCase()
    );
    if (isMatch) {
      return (
        <mark
          key={index}
          className="bg-amber-200 text-amber-900 px-0.5 rounded font-semibold"
        >
          {part}
        </mark>
      );
    }
    return part;
  });
};

export const CaseAccordion: React.FC<CaseAccordionProps> = ({
  caseItem,
  isOpen,
  onToggle,
  isAdmin,
  onEdit,
  onDelete,
  tokens
}) => {
  return (
    <article
      id={`case-card-${caseItem.id}`}
      className={`rounded-2xl overflow-hidden transition-all duration-200 ${
        isOpen
          ? 'border border-rose-200/60 bg-[#fffbfa] shadow-[0_1px_4px_rgba(216,27,61,0.03)]'
          : 'border border-slate-200/80 bg-[#f8fafc] hover:border-slate-300 shadow-[0_1px_3px_rgba(15,23,42,0.02)]'
      }`}
    >
      <div
        className={`flex items-center justify-between transition-colors ${
          isOpen ? 'bg-rose-50/20' : 'bg-[#f8fafc] hover:bg-[#f1f5f9]/70'
        }`}
      >
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={isOpen}
          className="flex-1 px-4 py-3.5 sm:px-5 sm:py-4 flex items-center justify-between gap-4 text-left focus:outline-none cursor-pointer"
        >
          <div className="flex items-center gap-3.5 min-w-0">
            <span
              className={`flex-shrink-0 w-8 h-7 rounded-md text-xs flex items-center justify-center border transition-colors ${
                isOpen
                  ? 'bg-rose-50 text-rose-800 border-rose-200/70 font-bold'
                  : 'bg-slate-200/80 text-slate-700 border-slate-300/40 font-bold'
              }`}
            >
              {caseItem.number}
            </span>

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span
                  className={`inline-block text-xs uppercase tracking-wider px-2 py-0.5 rounded transition-colors ${
                    isOpen
                      ? 'text-rose-800 bg-rose-50/70 border border-rose-200/50 font-semibold'
                      : 'text-slate-600 bg-slate-200/80 font-medium'
                  }`}
                >
                  {caseItem.dirCode} • {caseItem.dirName}
                </span>
                {caseItem.score > 0 && (
                  <span className="inline-block text-xs font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                    Relevancia: {caseItem.score}
                  </span>
                )}
              </div>
              <h3
                className={`text-sm leading-snug transition-colors ${
                  isOpen ? 'font-semibold text-slate-900' : 'font-medium text-slate-700'
                }`}
              >
                {highlightContent(caseItem.title, tokens)}
              </h3>
            </div>
          </div>

          <span
            className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
              isOpen
                ? 'rotate-180 bg-rose-50/80 text-rose-700 border border-rose-200/50'
                : 'bg-slate-200/70 text-slate-600'
            }`}
          >
            <ChevronDown className="w-4 h-4" />
          </span>
        </button>

        {isAdmin && (
          <div className="pr-3.5 flex items-center gap-1.5 flex-shrink-0">
            <button
              type="button"
              onClick={onEdit}
              title="Modificar esta casuística"
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/70 transition cursor-pointer"
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onDelete}
              title="Eliminar este caso"
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Cuerpo desplegable con las 4 secciones */}
      {isOpen && (
        <div className="border-t border-rose-100/40 bg-white px-4 py-5 sm:px-6 sm:py-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Sección 1: Criterio Pedagógico/Normativo (disponible para lectores de pantalla) */}
            <div className="sr-only" aria-hidden="false">
              <h4>CRITERIO</h4>
              <p>{caseItem.criterioTitle}</p>
              <p>{caseItem.criterioDesc}</p>
            </div>

            {/* Sección 2: Desarrollo / Casuística */}
            <div className="flex items-start gap-3.5">
              <div className="flex-shrink-0 mt-0.5 w-8 h-8 rounded-lg bg-slate-100 text-slate-500 border border-slate-200/70 flex items-center justify-center">
                <AlertCircle className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  DESARROLLO / CASUÍSTICA
                </p>
                <p className="text-sm leading-relaxed text-slate-700 mt-1.5 font-normal">
                  {highlightContent(caseItem.desarrollo, tokens)}
                </p>
              </div>
            </div>

            {/* Sección 3: Acción Sugerida */}
            <div className="md:border-l md:border-slate-200/75 md:pl-6 flex items-start gap-3.5">
              <div className="flex-shrink-0 mt-0.5 w-8 h-8 rounded-lg bg-slate-100 text-slate-500 border border-slate-200/70 flex items-center justify-center">
                <SlidersHorizontal className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  ACCIÓN SUGERIDA
                </p>
                <p className="text-sm leading-relaxed text-slate-700 mt-1.5 font-normal">
                  {highlightContent(caseItem.accion, tokens)}
                </p>
              </div>
            </div>

            {/* Sección 4: Solución Referencial */}
            <div className="md:border-l md:border-slate-200/75 md:pl-6 flex items-start gap-3.5">
              <div className="flex-shrink-0 mt-0.5 w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200/60 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                  SOLUCIÓN REFERENCIAL
                </p>
                <p className="text-sm leading-relaxed text-slate-900 mt-1.5 font-medium">
                  {highlightContent(caseItem.solucion, tokens)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </article>
  );
};
