import React from 'react';
import { Search, X, ChevronsUpDown, Eye } from 'lucide-react';
import { DirectionData, DirectionId } from '../types/casuistica';

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onClearSearch: () => void;
  onToggleAll: () => void;
  isAnyOpen: boolean;
  onOpenFirstMatch: () => void;
  selectedDirection: DirectionData;
  isSearching: boolean;
  resultsCount: number;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  searchQuery,
  onSearchChange,
  onClearSearch,
  onToggleAll,
  isAnyOpen,
  onOpenFirstMatch,
  selectedDirection,
  isSearching,
  resultsCount
}) => {
  return (
    <section className="rounded-2xl bg-slate-50/90 border border-slate-200/90 shadow-[0_2px_8px_-2px_rgba(15,23,42,0.04)] p-4 sm:p-5 space-y-3.5">
      <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center">
        {/* Input de búsqueda con altura ergonómica (h-12) */}
        <div className="relative flex-1">
          <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
            <Search className="w-5 h-5 text-slate-400" />
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar por casuística, problema reportado, grado, código o palabras clave..."
            className="w-full h-12 rounded-xl bg-white pl-11 pr-24 text-sm text-slate-800 placeholder:text-slate-400/50 placeholder:font-light border border-slate-300/80 shadow-2xs focus:outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-300/50 transition"
          />

          {/* Botón limpiar y badge de algoritmo */}
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 gap-1.5">
            {searchQuery ? (
              <button
                type="button"
                onClick={onClearSearch}
                title="Limpiar búsqueda"
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            ) : null}
            <span
              className="hidden sm:inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-500 border border-slate-200"
              title="Búsqueda inteligente con ponderación y tolerancia difusa"
            >
              Fuzzy
            </span>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap sm:flex-nowrap">
          <button
            type="button"
            onClick={onToggleAll}
            className="h-12 flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 px-4 text-xs sm:text-[13px] font-semibold border border-slate-300/80 shadow-2xs transition active:scale-[0.98] cursor-pointer"
          >
            <ChevronsUpDown className="w-4 h-4 text-slate-500" />
            <span>{isAnyOpen ? 'Colapsar todo' : 'Expandir todo'}</span>
          </button>

          <button
            type="button"
            onClick={onOpenFirstMatch}
            className="h-12 flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 px-4 text-xs sm:text-[13px] font-semibold border border-slate-300/80 shadow-2xs transition active:scale-[0.98] cursor-pointer"
          >
            <Eye className="w-4 h-4 text-slate-500" />
            <span>Primera coincidencia</span>
          </button>
        </div>
      </div>

      {/* Barra de estado y filtros activos */}
      <div className="pt-3 border-t border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs sm:text-[13px] text-slate-500">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-[#b91c1c]"></span>
          <div className="text-slate-600 font-medium">
            {isSearching ? (
              <span>
                Búsqueda optimizada: <strong className="font-bold text-slate-800">"{searchQuery.trim()}"</strong>. Se encontraron{' '}
                <strong className="font-bold text-[#b91c1c]">{resultsCount}</strong> coincidencia(s) clasificadas por relevancia.
              </span>
            ) : (
              <span>
                Dirección seleccionada: <strong className="font-bold text-slate-800">{selectedDirection.code} - {selectedDirection.name}</strong>. Se muestran sus casuísticas oficiales.
              </span>
            )}
          </div>
        </div>

        {isSearching && (
          <div className="inline-flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Coincidencia difusa activa</span>
          </div>
        )}
      </div>
    </section>
  );
};
