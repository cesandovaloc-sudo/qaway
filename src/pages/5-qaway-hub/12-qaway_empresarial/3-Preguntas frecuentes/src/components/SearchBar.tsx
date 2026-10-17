import React, { useState, useRef, useEffect } from 'react';
import { Search, X, ChevronsUpDown, Eye, ArrowUpRight, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { DirectionData, DirectionId, ScoredCasuistica, EducationalLevel, CommonCategory } from '../types/casuistica';
import { Filter, Layers, BookOpen, GraduationCap } from 'lucide-react';

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
  selectedLevel?: string;
  onSelectLevel?: (lvl: string) => void;
  selectedCategory?: string;
  onSelectCategory?: (cat: string) => void;
}

const DIR_BADGE_STYLES: Record<string, string> = {
  DEI: 'bg-amber-100 text-amber-800 border-amber-200',
  DEP: 'bg-blue-100 text-blue-800 border-blue-200',
  DISER: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  DEBA: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  DEBE: 'bg-purple-100 text-purple-800 border-purple-200',
  DES: 'bg-rose-100 text-rose-800 border-rose-200',
  DEIB: 'bg-violet-100 text-violet-800 border-violet-200'
};

const LEVEL_BADGE_STYLES: Record<string, string> = {
  Inicial: 'bg-amber-50 text-amber-700 border-amber-200',
  Primaria: 'bg-blue-50 text-blue-700 border-blue-200',
  Secundaria: 'bg-rose-50 text-rose-700 border-rose-200',
  Transversal: 'bg-purple-50 text-purple-700 border-purple-200'
};

const LEVEL_OPTIONS = [
  { value: 'ALL', label: 'Todos los niveles' },
  { value: 'Inicial', label: 'Inicial (0 - 5 años)' },
  { value: 'Primaria', label: 'Primaria (1° a 6° grado)' },
  { value: 'Secundaria', label: 'Secundaria (1° a 5° año)' },
  { value: 'Transversal', label: 'Transversal / Intersectorial' }
];

const CATEGORY_OPTIONS = [
  { value: 'ALL', label: 'Todas las temáticas asociadas' },
  { value: 'DEP – DISER', label: 'DEP – DISER (Cambio característica IE)' },
  { value: 'DEIB – DISER', label: 'DEIB – DISER (Ámbitos rurales bilingües)' },
  { value: 'Banco de Libros', label: 'Banco de Libros (Pérdidas, PECOSA, custodia)' },
  { value: 'Lenguas Originarias', label: 'Lenguas Originarias (Alfabetos y cuadernos)' },
  { value: 'Bibliotecas y Fungibles', label: 'Bibliotecas Escolares y Material Fungible' },
  { value: 'Matrícula y Traslados', label: 'Matrícula y Traslados (SIAGIE)' }
];

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
  onSelectQuickResult,
  selectedLevel = 'ALL',
  onSelectLevel,
  selectedCategory = 'ALL',
  onSelectCategory
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showExtraFilters, setShowExtraFilters] = useState(false);
  const [isLevelDropdownOpen, setIsLevelDropdownOpen] = useState(false);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);

  const hasActiveFilters = selectedLevel !== 'ALL' || selectedCategory !== 'ALL';
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const levelDropdownRef = useRef<HTMLDivElement>(null);
  const categoryDropdownRef = useRef<HTMLDivElement>(null);

  // Cerrar al hacer clic fuera o presionar Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsDropdownOpen(false);
        setIsLevelDropdownOpen(false);
        setIsCategoryDropdownOpen(false);
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
      if (levelDropdownRef.current && !levelDropdownRef.current.contains(e.target as Node)) {
        setIsLevelDropdownOpen(false);
      }
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(e.target as Node)) {
        setIsCategoryDropdownOpen(false);
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
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="text-[11px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-100">
                                    Casuística #{item.number}
                                  </span>
                                  {item.nivel && (
                                    <span
                                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                                        LEVEL_BADGE_STYLES[item.nivel] ||
                                        'bg-slate-50 text-slate-600 border-slate-200'
                                      }`}
                                    >
                                      {item.nivel}
                                    </span>
                                  )}
                                  {item.categoriaComun && item.categoriaComun !== 'General' && (
                                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                                      {item.categoriaComun}
                                    </span>
                                  )}
                                  <span className="text-xs font-medium text-slate-400 truncate">
                                    {item.dirName}
                                  </span>
                                </div>
                                {item.title.includes(': ') ? (
                                  <div className="mt-1 space-y-0.5">
                                    <p className="text-xs font-semibold text-slate-500 truncate uppercase tracking-wide">
                                      {item.title.split(': ')[0]}
                                    </p>
                                    <p className="text-sm font-semibold text-slate-800 group-hover:text-rose-600 transition-colors line-clamp-1">
                                      {item.title.split(': ').slice(1).join(': ')}
                                    </p>
                                  </div>
                                ) : (
                                  <p className="text-sm font-semibold text-slate-800 group-hover:text-rose-600 transition-colors line-clamp-1 mt-1">
                                    {item.title}
                                  </p>
                                )}
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

        {/* Botones de acción y Más filtros estilo Inventi Pro */}
        <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap sm:flex-nowrap">
          {/* Botón Más filtros con estilo armónico oficial MINEDU (Cero negro) */}
          <button
            type="button"
            onClick={() => setShowExtraFilters(!showExtraFilters)}
            className={`h-12 px-4 rounded-xl text-xs sm:text-[13px] border transition inline-flex items-center gap-2 cursor-pointer shadow-2xs ${
              showExtraFilters || hasActiveFilters
                ? 'bg-rose-50/90 hover:bg-rose-100/70 text-[#b91c1c] border-rose-300 font-bold shadow-xs'
                : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300/80 font-semibold'
            }`}
          >
            <Filter className={`w-4 h-4 ${showExtraFilters || hasActiveFilters ? 'text-[#b91c1c]' : 'text-slate-500'}`} />
            <span>Más filtros</span>
            {hasActiveFilters && (
              <span className="w-2 h-2 rounded-full bg-[#b91c1c]"></span>
            )}
          </button>

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

      {/* Panel Desplegable de Filtros Adicionales (Estilo Inventi Pro) */}
      <AnimatePresence>
        {showExtraFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.18 }}
            className="overflow-visible"
          >
            <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Campo 1: Nivel Educativo (Custom Dropdown) */}
                <div className="space-y-1.5" ref={levelDropdownRef}>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Nivel Educativo
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => {
                        setIsLevelDropdownOpen((p) => !p);
                        setIsCategoryDropdownOpen(false);
                      }}
                      className="w-full h-11 rounded-xl bg-white border border-slate-300 hover:border-slate-400 px-3.5 text-xs sm:text-sm font-semibold text-slate-800 flex items-center justify-between gap-2 shadow-2xs transition focus:outline-none focus:ring-2 focus:ring-[#b91c1c]/20 cursor-pointer"
                    >
                      <span className="truncate">
                        {LEVEL_OPTIONS.find((o) => o.value === selectedLevel)?.label || 'Todos los niveles'}
                      </span>
                      <ChevronDown
                        className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ${
                          isLevelDropdownOpen ? 'rotate-180 text-slate-700' : ''
                        }`}
                      />
                    </button>

                    {isLevelDropdownOpen && (
                      <div className="absolute z-40 mt-1.5 w-full rounded-xl bg-white border border-slate-200 shadow-xl py-1.5 animate-in fade-in slide-in-from-top-1 max-h-60 overflow-y-auto">
                        {LEVEL_OPTIONS.map((opt) => {
                          const isSelected = selectedLevel === opt.value;
                          return (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() => {
                                if (onSelectLevel) onSelectLevel(opt.value);
                                setIsLevelDropdownOpen(false);
                              }}
                              className={`w-full px-3.5 py-2.5 text-left text-xs sm:text-sm flex items-center justify-between transition cursor-pointer ${
                                isSelected
                                  ? 'bg-red-50 text-[#b91c1c] font-bold'
                                  : 'text-slate-700 hover:bg-slate-50 font-medium'
                              }`}
                            >
                              <span>{opt.label}</span>
                              {isSelected && <span className="text-[#b91c1c] font-bold text-xs">✓</span>}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* Campo 2: Casos Asociados / Criterios Cruzados (Custom Dropdown) */}
                <div className="space-y-1.5" ref={categoryDropdownRef}>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Casos Asociados / Criterios
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => {
                        setIsCategoryDropdownOpen((p) => !p);
                        setIsLevelDropdownOpen(false);
                      }}
                      className="w-full h-11 rounded-xl bg-white border border-slate-300 hover:border-slate-400 px-3.5 text-xs sm:text-sm font-semibold text-slate-800 flex items-center justify-between gap-2 shadow-2xs transition focus:outline-none focus:ring-2 focus:ring-[#b91c1c]/20 cursor-pointer"
                    >
                      <span className="truncate">
                        {CATEGORY_OPTIONS.find((o) => o.value === selectedCategory)?.label || 'Todas las temáticas asociadas'}
                      </span>
                      <ChevronDown
                        className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ${
                          isCategoryDropdownOpen ? 'rotate-180 text-slate-700' : ''
                        }`}
                      />
                    </button>

                    {isCategoryDropdownOpen && (
                      <div className="absolute z-40 mt-1.5 w-full rounded-xl bg-white border border-slate-200 shadow-xl py-1.5 animate-in fade-in slide-in-from-top-1 max-h-60 overflow-y-auto">
                        {CATEGORY_OPTIONS.map((opt) => {
                          const isSelected = selectedCategory === opt.value;
                          return (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() => {
                                if (onSelectCategory) onSelectCategory(opt.value);
                                setIsCategoryDropdownOpen(false);
                              }}
                              className={`w-full px-3.5 py-2.5 text-left text-xs sm:text-sm flex items-center justify-between transition cursor-pointer ${
                                isSelected
                                  ? 'bg-red-50 text-[#b91c1c] font-bold'
                                  : 'text-slate-700 hover:bg-slate-50 font-medium'
                              }`}
                            >
                              <span className="truncate pr-2">{opt.label}</span>
                              {isSelected && <span className="text-[#b91c1c] font-bold text-xs shrink-0">✓</span>}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* Campo 3: Dirección Institucional */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Dirección Activa
                  </label>
                  <div className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between text-xs sm:text-sm font-bold text-slate-700 shadow-2xs">
                    <span className="truncate">{selectedDirection.code} — {selectedDirection.name}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-white text-slate-600 border border-slate-200 font-mono shrink-0 ml-2">
                      Oficial
                    </span>
                  </div>
                </div>
              </div>

              {/* Barra de Acciones del Panel estilo Inventi */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100 gap-2">
                <div className="text-xs text-slate-500 font-medium">
                  {hasActiveFilters ? (
                    <span className="text-rose-600 font-semibold flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-rose-600"></span>
                      Filtros avanzados activos
                    </span>
                  ) : (
                    <span className="text-slate-400">Sin filtros avanzados aplicados</span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (onSelectLevel) onSelectLevel('ALL');
                      if (onSelectCategory) onSelectCategory('ALL');
                      setShowExtraFilters(false);
                    }}
                    className="h-9 px-3.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition cursor-pointer shadow-2xs"
                  >
                    Cancelar / Limpiar
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowExtraFilters(false)}
                    className="h-9 px-4 rounded-lg bg-[#b91c1c] hover:bg-rose-800 text-white text-xs font-bold transition cursor-pointer shadow-xs"
                  >
                    Aplicar filtros
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
