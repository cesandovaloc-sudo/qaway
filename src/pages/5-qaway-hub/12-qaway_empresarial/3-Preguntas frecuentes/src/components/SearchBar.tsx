import React, { useState, useRef, useEffect } from 'react';
import { Search, X, ChevronsUpDown, Eye, ArrowUpRight, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { DirectionData, DirectionId, ScoredCasuistica } from '../types/casuistica';

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
  quickResults?: ScoredCasuistica[];
  onSelectQuickResult?: (item: ScoredCasuistica) => void;
}

const DIR_BADGE_STYLES: Record<string, string> = {
  DEI: 'bg-amber-100 text-amber-800 border-amber-200',
  DEP: 'bg-blue-100 text-blue-800 border-blue-200',
  DISER: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  DEBA: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  DEBE: 'bg-purple-100 text-purple-800 border-purple-200',
  DES: 'bg-rose-100 text-rose-800 border-rose-200'
};

export const SearchBar: React.FC<SearchBarProps> = ({
  searchQuery,
  onSearchChange,
  onClearSearch,
  onToggleAll,
  isAnyOpen,
  onOpenFirstMatch,
  selectedDirection,
  isSearching,
  resultsCount,
  quickResults = [],
  onSelectQuickResult
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Cerrar al hacer clic fuera o presionar Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsDropdownOpen(false);
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        if (searchQuery.trim()) setIsDropdownOpen(true);
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [searchQuery]);

  const handleInputChange = (val: string) => {
    onSearchChange(val);
    if (val.trim().length > 0) {
      setIsDropdownOpen(true);
    } else {
      setIsDropdownOpen(false);
    }
  };

  const handleSelectCase = (item: ScoredCasuistica) => {
    setIsDropdownOpen(false);
    if (onSelectQuickResult) {
      onSelectQuickResult(item);
    }
  };

  return (
    <section className="rounded-2xl bg-slate-50/90 border border-slate-200/90 shadow-[0_2px_8px_-2px_rgba(15,23,42,0.04)] p-4 sm:p-5 space-y-3.5">
      <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center">
        {/* Input de búsqueda omnibox con super filtro flotante estilo CRM */}
        <div ref={containerRef} className="relative flex-1">
          <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
            <Search className="w-5 h-5 text-slate-400" />
          </span>
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onFocus={() => {
              if (searchQuery.trim().length > 0) setIsDropdownOpen(true);
            }}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder="Buscar por casuística, problema reportado, grado, código o palabras clave..."
            className="w-full h-12 rounded-xl bg-white pl-11 pr-24 text-sm text-slate-800 placeholder:text-slate-400/50 placeholder:font-light border border-slate-300/80 shadow-2xs focus:outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-300/50 transition"
          />

          {/* Botón limpiar y atajo de teclado */}
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 gap-1.5">
            {searchQuery ? (
              <button
                type="button"
                onClick={() => {
                  onClearSearch();
                  setIsDropdownOpen(false);
                }}
                title="Limpiar búsqueda"
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            ) : (
              <div className="hidden sm:flex items-center gap-1 pointer-events-none">
                <kbd className="px-1.5 py-0.5 text-[10px] font-mono rounded bg-slate-100 border border-slate-200 text-slate-500 font-medium">
                  ⌘K
                </kbd>
              </div>
            )}
          </div>

          {/* Menú Flotante de Resultados Rápidos (Command Palette Dropdown estilo CRM) */}
          <AnimatePresence>
            {isDropdownOpen && searchQuery.trim() !== '' && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                transition={{ duration: 0.15 }}
                className="absolute top-[calc(100%+8px)] left-0 right-0 border border-slate-200 rounded-2xl shadow-2xl z-50 overflow-hidden bg-white text-slate-900"
              >
                {quickResults.length === 0 ? (
                  <div className="p-6 text-center">
                    <p className="text-sm font-medium text-slate-500">
                      No se encontraron casuísticas para "{searchQuery}"
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Intenta con otra palabra clave como matrícula, faltantes, pecosa o traslado.
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col">
                    <div className="px-4 py-2.5 border-b border-slate-100 bg-slate-50 flex items-center justify-between text-slate-600">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-rose-500" />
                        Resultados Rápidos ({resultsCount})
                      </span>
                      <span className="text-[11px] text-slate-400 font-medium">
                        Coincidencias por relevancia
                      </span>
                    </div>

                    <ul className="py-1.5 max-h-80 overflow-y-auto divide-y divide-slate-100">
                      {quickResults.slice(0, 6).map((item) => {
                        const badgeStyle =
                          DIR_BADGE_STYLES[item.dirCode] ||
                          'bg-slate-100 text-slate-700 border-slate-200';

                        return (
                          <li key={item.id}>
                            <button
                              type="button"
                              onClick={() => handleSelectCase(item)}
                              className="w-full px-4 py-3 transition-colors flex items-start gap-3 text-left group hover:bg-rose-50/40 cursor-pointer"
                            >
                              {/* Sigla de Dirección con color pastel */}
                              <div
                                className={`w-11 h-9 rounded-lg font-bold text-[11px] flex items-center justify-center shrink-0 border ${badgeStyle} mt-0.5`}
                              >
                                {item.dirCode}
                              </div>

                              {/* Información principal */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="text-[11px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-100">
                                    Casuística #{item.number}
                                  </span>
                                  <span className="text-xs font-medium text-slate-400 truncate">
                                    {item.dirName}
                                  </span>
                                </div>
                                <p className="text-sm font-semibold text-slate-800 group-hover:text-rose-600 transition-colors line-clamp-1 mt-1">
                                  {item.title}
                                </p>
                                <p className="text-xs text-slate-500 line-clamp-1 mt-0.5 font-normal">
                                  {item.criterioTitle || item.criterioDesc || item.solucion}
                                </p>
                              </div>

                              <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-rose-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0 mt-1" />
                            </button>
                          </li>
                        );
                      })}
                    </ul>

                    {/* Footer del dropdown */}
                    <div className="px-4 py-2 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-[11px] text-slate-400">
                      <span>Clic para saltar directo a la casuística</span>
                      <span>Esc para cerrar</span>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
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
