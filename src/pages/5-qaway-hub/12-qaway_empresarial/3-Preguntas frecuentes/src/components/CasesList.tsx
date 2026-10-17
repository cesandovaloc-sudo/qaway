import React from 'react';
import {
  Sparkles,
  BookOpen,
  Compass,
  Building2,
  Layers,
  GraduationCap,
  Search,
  Plus,
  AlertCircle,
  ChevronsUpDown
} from 'lucide-react';
import { DirectionData, DirectionId, ScoredCasuistica } from '../types/casuistica';
import { CaseAccordion } from './CaseAccordion';

interface CasesListProps {
  items: ScoredCasuistica[];
  mode: 'direction' | 'search';
  direction: DirectionData;
  tokens: string[];
  isAdmin: boolean;
  onToggleCase: (caseId: string) => void;
  onEditCase: (item: ScoredCasuistica) => void;
  onDeleteCase: (item: ScoredCasuistica) => void;
  onAddNewCase: () => void;
  onClearSearch: () => void;
  allowMultipleOpen: boolean;
  onToggleAllowMultiple: () => void;
  onToggleDirectionAll: () => void;
  isAllOpenInDirection: boolean;
}

const renderHeaderIcon = (mode: 'direction' | 'search', dirId: DirectionId) => {
  if (mode === 'search') {
    return <Search className="w-5 h-5 text-slate-600" />;
  }
  switch (dirId) {
    case 'DEI':
      return <Sparkles className="w-5 h-5 text-slate-600" />;
    case 'DEP':
      return <BookOpen className="w-5 h-5 text-slate-600" />;
    case 'DISER':
      return <Compass className="w-5 h-5 text-slate-600" />;
    case 'DEBA':
      return <Building2 className="w-5 h-5 text-slate-600" />;
    case 'DEBE':
      return <Layers className="w-5 h-5 text-slate-600" />;
    case 'DES':
      return <GraduationCap className="w-5 h-5 text-slate-600" />;
    default:
      return <BookOpen className="w-5 h-5 text-slate-600" />;
  }
};

export const CasesList: React.FC<CasesListProps> = ({
  items,
  mode,
  direction,
  tokens,
  isAdmin,
  onToggleCase,
  onEditCase,
  onDeleteCase,
  onAddNewCase,
  onClearSearch,
  allowMultipleOpen,
  onToggleAllowMultiple,
  onToggleDirectionAll,
  isAllOpenInDirection
}) => {
  const countLabel =
    items.length === 1 ? '1 casuística registrada' : `${items.length} casuísticas registradas`;

  return (
    <main className="rounded-2xl bg-white border border-slate-200/75 shadow-[0_2px_12px_-4px_rgba(15,23,42,0.04)] p-4 sm:p-6 space-y-4">
      {/* Cabecera de la sección activa */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3.5 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-100/90 border border-slate-200/60 text-slate-600 flex items-center justify-center flex-shrink-0">
            {renderHeaderIcon(mode, direction.id)}
          </div>
          <span className="inline-flex items-center rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700 border border-slate-200/70">
            {mode === 'search' ? 'RESULTADOS' : direction.code}
          </span>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
              {mode === 'search' ? 'Casuísticas encontradas en el banco' : direction.name}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
              {countLabel} {mode === 'search' ? '• Ordenadas por relevancia' : ''}
            </p>
          </div>
        </div>

        {/* Botones de control del bloque: Visualizar varios desplegados y Añadir */}
        <div className="flex items-center gap-2 flex-wrap">
          {items.length > 0 && (
            <>
              {/* Botón para poder visualizar varios desplegados (sin que se colapsen) */}
              <button
                type="button"
                onClick={onToggleAllowMultiple}
                aria-pressed={allowMultipleOpen}
                className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold border transition cursor-pointer ${
                  allowMultipleOpen
                    ? 'bg-rose-50 text-rose-800 border-rose-300 shadow-2xs font-bold'
                    : 'bg-white text-slate-600 border-slate-200/90 hover:bg-slate-50'
                }`}
                title="Permitir visualizar varias preguntas desplegadas simultáneamente sin que se colapsen"
              >
                <ChevronsUpDown className="w-3.5 h-3.5 text-rose-600" />
                <span>{allowMultipleOpen ? 'Varios desplegados: Sí' : 'Visualizar varios desplegados'}</span>
              </button>

              {/* Botón para expandir o contraer todas las de este bloque */}
              <button
                type="button"
                onClick={onToggleDirectionAll}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200/90 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                title={isAllOpenInDirection ? 'Contraer todas las preguntas de este bloque' : 'Desplegar todas las preguntas de este bloque'}
              >
                <span>{isAllOpenInDirection ? 'Contraer todo' : 'Desplegar todo'}</span>
              </button>
            </>
          )}

          {isAdmin && (
            <button
              type="button"
              onClick={onAddNewCase}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-black transition cursor-pointer"
              title="Añadir nueva casuística a esta dirección"
            >
              <Plus className="w-3.5 h-3.5 text-[#b91c1c]" />
              <span>+ Añadir a {direction.code}</span>
            </button>
          )}
        </div>
      </div>

      {/* Lista de Acordeones o Estado Vacío */}
      {items.length === 0 ? (
        <div className="rounded-2xl bg-slate-50/70 border border-slate-200/70 p-8 text-center space-y-3">
          <div className="mx-auto w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center">
            <AlertCircle className="w-6 h-6" />
          </div>
          <p className="text-sm font-bold text-slate-800">
            No se encontraron casuísticas que coincidan con la búsqueda
          </p>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Intenta con otra palabra clave o selecciona otra dirección.
          </p>
          <div className="pt-1 flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={onClearSearch}
              className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
            >
              Limpiar búsqueda
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <CaseAccordion
              key={item.id}
              caseItem={item}
              isOpen={!!item.isOpen}
              onToggle={() => onToggleCase(item.id)}
              isAdmin={isAdmin}
              onEdit={() => onEditCase(item)}
              onDelete={() => onDeleteCase(item)}
              tokens={tokens}
            />
          ))}
        </div>
      )}
    </main>
  );
};
