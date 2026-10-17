import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Plus,
  Layers,
  Cloud,
  Check,
  Pencil,
  Trash2,
  Search,
  ChevronDown
} from 'lucide-react';
import { Casuistica, DirectionData, DirectionId, ScoredCasuistica } from '../types/casuistica';

interface ManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: 'form' | 'list' | 'cloud';
  onChangeTab: (tab: 'form' | 'list' | 'cloud') => void;
  directions: DirectionData[];
  editingCase: { caseItem: Casuistica; dirId: DirectionId } | null;
  onSaveCase: (dirId: DirectionId, caseItem: Casuistica) => void;
  onDeleteCase: (caseId: string, dirId: DirectionId) => void;
  onEditCaseFromList: (item: ScoredCasuistica) => void;
  supabaseUrl: string;
  supabaseKey: string;
  onSaveSupabaseConfig: (url: string, key: string) => Promise<boolean>;
  isSupabaseConnected: boolean;
}

const DIRECTION_OPTIONS: { id: DirectionId; code: string; name: string }[] = [
  { id: 'DEI', code: 'DEI', name: 'Ed. Inicial' },
  { id: 'DEP', code: 'DEP', name: 'Ed. Primaria' },
  { id: 'DISER', code: 'DISER', name: 'Servicios Rurales' },
  { id: 'DEBA', code: 'DEBA', name: 'Básica Alternativa' },
  { id: 'DEBE', code: 'DEBE', name: 'Básica Especial' },
  { id: 'DES', code: 'DES', name: 'Ed. Secundaria' }
];

export const ManagementModal: React.FC<ManagementModalProps> = ({
  isOpen,
  onClose,
  activeTab,
  onChangeTab,
  directions,
  editingCase,
  onSaveCase,
  onDeleteCase,
  onEditCaseFromList,
  supabaseUrl,
  supabaseKey,
  onSaveSupabaseConfig,
  isSupabaseConnected
}) => {
  // Form State
  const [formDirId, setFormDirId] = useState<DirectionId>('DEI');
  const [isDirDropdownOpen, setIsDirDropdownOpen] = useState(false);
  const dirDropdownRef = useRef<HTMLDivElement>(null);

  const [formNumber, setFormNumber] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formCriterioTitle, setFormCriterioTitle] = useState('');
  const [formCriterioDesc, setFormCriterioDesc] = useState('');
  const [formDesarrollo, setFormDesarrollo] = useState('');
  const [formAccion, setFormAccion] = useState('');
  const [formSolucion, setFormSolucion] = useState('');

  // List Search & Filter State
  const [filterDir, setFilterDir] = useState<string>('ALL');
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const filterDropdownRef = useRef<HTMLDivElement>(null);
  const [searchListQuery, setSearchListQuery] = useState('');

  // Supabase Inputs State
  const [inputUrl, setInputUrl] = useState(supabaseUrl);
  const [inputKey, setInputKey] = useState(supabaseKey);
  const [testingSupabase, setTestingSupabase] = useState(false);
  const [supabaseFeedback, setSupabaseFeedback] = useState<{
    message: string;
    type: 'success' | 'error' | 'info';
  } | null>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dirDropdownRef.current &&
        !dirDropdownRef.current.contains(event.target as Node)
      ) {
        setIsDirDropdownOpen(false);
      }
      if (
        filterDropdownRef.current &&
        !filterDropdownRef.current.contains(event.target as Node)
      ) {
        setIsFilterDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setInputUrl(supabaseUrl);
    setInputKey(supabaseKey);
  }, [supabaseUrl, supabaseKey]);

  useEffect(() => {
    if (editingCase) {
      setFormDirId(editingCase.dirId);
      setFormNumber(editingCase.caseItem.number);
      setFormTitle(editingCase.caseItem.title);
      setFormCriterioTitle(editingCase.caseItem.criterioTitle || '');
      setFormCriterioDesc(editingCase.caseItem.criterioDesc || '');
      setFormDesarrollo(editingCase.caseItem.desarrollo);
      setFormAccion(editingCase.caseItem.accion);
      setFormSolucion(editingCase.caseItem.solucion);
    } else {
      resetForm();
    }
  }, [editingCase]);

  const resetForm = () => {
    const currentDir = directions.find((d) => d.id === formDirId) || directions[0];
    const nextNum = String(currentDir ? currentDir.cases.length + 1 : 1).padStart(2, '0');
    setFormNumber(nextNum);
    setFormTitle('');
    setFormCriterioTitle('Criterio General');
    setFormCriterioDesc('Dotación pertinente y suficiente según padrón oficial.');
    setFormDesarrollo('');
    setFormAccion('');
    setFormSolucion('');
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const caseData: Casuistica = {
      id: editingCase ? editingCase.caseItem.id : `${formDirId.toLowerCase()}-${Date.now()}`,
      number: formNumber.trim() || '01',
      title: formTitle.trim(),
      criterioTitle: formCriterioTitle.trim() || 'Criterio General',
      criterioDesc: formCriterioDesc.trim() || 'Dotación pertinente y suficiente.',
      desarrollo: formDesarrollo.trim(),
      accion: formAccion.trim(),
      solucion: formSolucion.trim(),
      isOpen: true
    };
    onSaveCase(formDirId, caseData);
  };

  const handleTestSupabase = async () => {
    setTestingSupabase(true);
    setSupabaseFeedback({ message: 'Probando conexión con Supabase...', type: 'info' });
    const success = await onSaveSupabaseConfig(inputUrl, inputKey);
    setTestingSupabase(false);
    if (success) {
      setSupabaseFeedback({ message: '¡Conexión exitosa y sincronizada!', type: 'success' });
    } else {
      setSupabaseFeedback({
        message: 'No se pudo conectar. Verifica la URL y la Anon Key.',
        type: 'error'
      });
    }
  };

  // Build full cases list for Tab 2
  const allCases: ScoredCasuistica[] = [];
  directions.forEach((dir) => {
    dir.cases.forEach((c) => {
      allCases.push({
        ...c,
        dirId: dir.id,
        dirCode: dir.code,
        dirName: dir.name,
        score: 0
      });
    });
  });

  const filteredList = allCases.filter((c) => {
    if (filterDir !== 'ALL' && c.dirId !== filterDir) return false;
    if (searchListQuery.trim()) {
      const q = searchListQuery.toLowerCase();
      const matchTitle = c.title.toLowerCase().includes(q);
      const matchDes = c.desarrollo.toLowerCase().includes(q);
      const matchSol = c.solucion.toLowerCase().includes(q);
      return matchTitle || matchDes || matchSol;
    }
    return true;
  });

  const selectedDirOption =
    DIRECTION_OPTIONS.find((d) => d.id === formDirId) || DIRECTION_OPTIONS[0];

  const selectedFilterOption =
    filterDir === 'ALL'
      ? { id: 'ALL', code: 'ALL', name: 'Todas las direcciones' }
      : DIRECTION_OPTIONS.find((d) => d.id === filterDir) || {
          id: 'ALL',
          code: 'ALL',
          name: 'Todas las direcciones'
        };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 transition-opacity"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-4xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden transform transition-all my-6 sm:my-8">
        {/* Cabecera del Modal */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 sm:px-7 sm:py-5 bg-slate-50">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              Administración del Banco de Casuísticas
            </h3>
            <p className="text-sm text-slate-500 mt-0.5">
              Agrega, modifica y sincroniza preguntas y soluciones para el monitoreo SIGA.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Barra de Pestañas (Tabs) */}
        <div className="flex border-b border-slate-200 bg-slate-100/70 px-6 sm:px-7 pt-2.5 gap-2 text-sm font-semibold overflow-x-auto">
          <button
            type="button"
            onClick={() => onChangeTab('form')}
            className={`flex items-center gap-2 px-4 py-2.5 border-b-2 rounded-t-xl transition cursor-pointer text-sm whitespace-nowrap ${
              activeTab === 'form'
                ? 'border-[#b91c1c] text-[#b91c1c] bg-white font-bold shadow-xs'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>{editingCase ? 'Modificar Pregunta' : 'Nueva Pregunta'}</span>
          </button>

          <button
            type="button"
            onClick={() => onChangeTab('list')}
            className={`flex items-center gap-2 px-4 py-2.5 border-b-2 rounded-t-xl transition cursor-pointer text-sm whitespace-nowrap ${
              activeTab === 'list'
                ? 'border-[#b91c1c] text-[#b91c1c] bg-white font-bold shadow-xs'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Inventario / Modificar ({allCases.length})</span>
          </button>

          <button
            type="button"
            onClick={() => onChangeTab('cloud')}
            className={`flex items-center gap-2 px-4 py-2.5 border-b-2 rounded-t-xl transition cursor-pointer text-sm whitespace-nowrap ${
              activeTab === 'cloud'
                ? 'border-[#b91c1c] text-[#b91c1c] bg-white font-bold shadow-xs'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            <Cloud className="w-4 h-4" />
            <span>Conexión Supabase</span>
            {isSupabaseConnected && (
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            )}
          </button>
        </div>

        {/* Contenido del Modal */}
        <div className="p-6 sm:p-7 max-h-[70vh] overflow-y-auto">
          {/* TAB 1: FORMULARIO */}
          {activeTab === 'form' && (
            <form onSubmit={handleSubmit} className="space-y-5">
              {editingCase && (
                <div className="flex items-center justify-between rounded-xl bg-amber-50 border border-amber-200 p-3.5 text-sm text-amber-800">
                  <span>
                    Estás modificando el caso <strong>#{editingCase.caseItem.number}</strong> (
                    {editingCase.caseItem.title}).
                  </span>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="font-bold underline text-amber-900 hover:text-black cursor-pointer text-sm"
                  >
                    Crear nuevo en su lugar
                  </button>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* 1. CUSTOM DROPDOWN ESTILIZADO PARA DIRECCIÓN PEDAGÓGICA (CERO SELECT NATIVO) */}
                <div className="space-y-1.5" ref={dirDropdownRef}>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Dirección pedagógica <span className="text-red-500">*</span>
                  </label>

                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsDirDropdownOpen((prev) => !prev)}
                      className="w-full h-11 rounded-xl bg-white border border-slate-300 hover:border-slate-400 px-3.5 text-sm font-semibold text-slate-800 flex items-center justify-between gap-2 shadow-2xs transition focus:outline-none focus:ring-2 focus:ring-[#b91c1c]/20 cursor-pointer"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-[#b91c1c] text-xs font-black">
                          {selectedDirOption.code}
                        </span>
                        <span className="truncate text-slate-800 text-sm">
                          {selectedDirOption.name}
                        </span>
                      </div>
                      <ChevronDown
                        className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                          isDirDropdownOpen ? 'rotate-180 text-slate-700' : ''
                        }`}
                      />
                    </button>

                    {/* Menú Flotante Estilizado */}
                    {isDirDropdownOpen && (
                      <div className="absolute z-30 mt-1.5 w-full rounded-xl bg-white border border-slate-200 shadow-xl py-1.5 animate-in fade-in slide-in-from-top-1">
                        {DIRECTION_OPTIONS.map((opt) => {
                          const isCurrent = opt.id === formDirId;
                          return (
                            <button
                              key={opt.id}
                              type="button"
                              onClick={() => {
                                setFormDirId(opt.id);
                                setIsDirDropdownOpen(false);
                              }}
                              className={`w-full px-3.5 py-2.5 text-left text-sm flex items-center justify-between transition cursor-pointer ${
                                isCurrent
                                  ? 'bg-red-50/80 text-[#b91c1c] font-bold'
                                  : 'text-slate-700 hover:bg-slate-50 font-medium'
                              }`}
                            >
                              <div className="flex items-center gap-2.5">
                                <span
                                  className={`px-2 py-0.5 rounded-md text-xs font-black ${
                                    isCurrent
                                      ? 'bg-red-100 text-[#b91c1c]'
                                      : 'bg-slate-100 text-slate-700'
                                  }`}
                                >
                                  {opt.code}
                                </span>
                                <span>{opt.name}</span>
                              </div>
                              {isCurrent && <Check className="w-4 h-4 text-[#b91c1c]" />}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* 2. N.° CORRELATIVO */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    N.° Correlativo <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formNumber}
                    onChange={(e) => setFormNumber(e.target.value)}
                    placeholder="01"
                    className="w-full h-11 rounded-xl bg-white border border-slate-300 px-3.5 text-sm font-bold text-slate-800 placeholder:text-slate-400 placeholder:text-sm focus:outline-none focus:ring-2 focus:ring-[#b91c1c]/20 transition shadow-2xs"
                  />
                </div>

                {/* 3. CRITERIO */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Criterio (Etiqueta)
                  </label>
                  <input
                    type="text"
                    value={formCriterioTitle}
                    onChange={(e) => setFormCriterioTitle(e.target.value)}
                    placeholder="Pertinencia / Cobertura..."
                    className="w-full h-11 rounded-xl bg-white border border-slate-300 px-3.5 text-sm text-slate-800 placeholder:text-slate-400 placeholder:text-sm focus:outline-none focus:ring-2 focus:ring-[#b91c1c]/20 transition shadow-2xs"
                  />
                </div>
              </div>

              {/* TÍTULO */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Título de la casuística / problema <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="Ej: Material asignado no corresponde a la característica..."
                  className="w-full h-11 rounded-xl bg-white border border-slate-300 px-3.5 text-sm text-slate-800 placeholder:text-slate-400 placeholder:text-sm focus:outline-none focus:ring-2 focus:ring-[#b91c1c]/20 transition shadow-2xs"
                />
              </div>

              {/* DESARROLLO */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Desarrollo de la casuística (Situación identificada){' '}
                  <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={formDesarrollo}
                  onChange={(e) => setFormDesarrollo(e.target.value)}
                  placeholder="Detalla qué ocurrió durante el monitoreo a la UGEL..."
                  className="w-full rounded-xl bg-white border border-slate-300 p-3.5 text-sm leading-relaxed text-slate-800 placeholder:text-slate-400 placeholder:text-sm focus:outline-none focus:ring-2 focus:ring-[#b91c1c]/20 transition shadow-2xs"
                ></textarea>
              </div>

              {/* ACCIÓN SUGERIDA */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Acción sugerida <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={formAccion}
                  onChange={(e) => setFormAccion(e.target.value)}
                  placeholder="Paso inmediato a realizar por la UGEL o directivo..."
                  className="w-full rounded-xl bg-white border border-slate-300 p-3.5 text-sm leading-relaxed text-slate-800 placeholder:text-slate-400 placeholder:text-sm focus:outline-none focus:ring-2 focus:ring-[#b91c1c]/20 transition shadow-2xs"
                ></textarea>
              </div>

              {/* SOLUCIÓN REFERENCIAL */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-emerald-800">
                  Solución referencial <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={formSolucion}
                  onChange={(e) => setFormSolucion(e.target.value)}
                  placeholder="Resolución final, reasignación pecosa o regularización..."
                  className="w-full rounded-xl bg-white border border-slate-300 p-3.5 text-sm leading-relaxed text-slate-800 placeholder:text-slate-400 placeholder:text-sm focus:outline-none focus:ring-2 focus:ring-[#b91c1c]/20 transition shadow-2xs"
                ></textarea>
              </div>

              {/* Botones de Acción */}
              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={resetForm}
                  className="h-11 rounded-xl border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                >
                  Limpiar campos
                </button>
                <button
                  type="submit"
                  className="h-11 inline-flex items-center gap-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white px-6 text-sm font-semibold transition shadow-xs cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>
                    {editingCase ? 'Actualizar Pregunta' : 'Guardar Pregunta en el Banco'}
                  </span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: INVENTARIO */}
          {activeTab === 'list' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute inset-y-0 left-3.5 my-auto text-slate-400" />
                  <input
                    type="text"
                    value={searchListQuery}
                    onChange={(e) => setSearchListQuery(e.target.value)}
                    placeholder="Buscar pregunta por palabra clave..."
                    className="w-full h-10 pl-10 pr-3 rounded-xl bg-white border border-slate-300 text-sm text-slate-800 placeholder:text-slate-400 placeholder:text-sm focus:outline-none focus:ring-2 focus:ring-[#b91c1c]/20"
                  />
                </div>

                {/* Custom Filter Dropdown */}
                <div className="relative" ref={filterDropdownRef}>
                  <button
                    type="button"
                    onClick={() => setIsFilterDropdownOpen((prev) => !prev)}
                    className="h-10 rounded-xl bg-white border border-slate-300 hover:border-slate-400 px-3.5 text-sm font-semibold text-slate-700 flex items-center gap-2 shadow-2xs transition focus:outline-none cursor-pointer"
                  >
                    <span>{selectedFilterOption.name}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 transition-transform ${
                        isFilterDropdownOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {isFilterDropdownOpen && (
                    <div className="absolute right-0 z-30 mt-1.5 w-60 rounded-xl bg-white border border-slate-200 shadow-xl py-1.5 animate-in fade-in">
                      <button
                        type="button"
                        onClick={() => {
                          setFilterDir('ALL');
                          setIsFilterDropdownOpen(false);
                        }}
                        className={`w-full px-3.5 py-2 text-left text-sm flex items-center justify-between hover:bg-slate-50 cursor-pointer ${
                          filterDir === 'ALL' ? 'text-[#b91c1c] font-bold bg-red-50/50' : 'text-slate-700'
                        }`}
                      >
                        <span>Todas las direcciones</span>
                        {filterDir === 'ALL' && <Check className="w-4 h-4 text-[#b91c1c]" />}
                      </button>
                      {DIRECTION_OPTIONS.map((opt) => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => {
                            setFilterDir(opt.id);
                            setIsFilterDropdownOpen(false);
                          }}
                          className={`w-full px-3.5 py-2 text-left text-sm flex items-center justify-between hover:bg-slate-50 cursor-pointer ${
                            filterDir === opt.id ? 'text-[#b91c1c] font-bold bg-red-50/50' : 'text-slate-700'
                          }`}
                        >
                          <span>{opt.name}</span>
                          {filterDir === opt.id && <Check className="w-4 h-4 text-[#b91c1c]" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Lista de Casos */}
              <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
                {filteredList.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-4 p-3.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2.5 py-0.5 rounded-md text-xs font-black bg-slate-100 text-slate-700">
                          {item.dirCode} #{item.number}
                        </span>
                        <span className="text-xs font-semibold text-slate-500 truncate">
                          {item.criterioTitle}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 truncate">
                        {item.title}
                      </h4>
                    </div>

                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => onEditCaseFromList(item)}
                        className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition cursor-pointer"
                        title="Editar esta casuística"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteCase(item.id, item.dirId)}
                        className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                        title="Eliminar casuística"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: CONEXIÓN SUPABASE */}
          {activeTab === 'cloud' && (
            <div className="space-y-4">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 space-y-3.5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <Cloud className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-slate-900">
                      Conexión con Supabase (Nube Oficial)
                    </h4>
                    <p className="text-sm text-slate-500">
                      Ingresa tus credenciales para sincronizar automáticamente el banco en tiempo real.
                    </p>
                  </div>
                </div>

                <div className="space-y-3.5 pt-2">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                      Project URL de Supabase
                    </label>
                    <input
                      type="text"
                      value={inputUrl}
                      onChange={(e) => setInputUrl(e.target.value)}
                      placeholder="https://xyzcompany.supabase.co"
                      className="w-full h-11 rounded-xl bg-white border border-slate-300 px-3.5 text-sm font-mono text-slate-800 placeholder:text-slate-400 placeholder:text-sm focus:outline-none focus:ring-2 focus:ring-[#b91c1c]/20"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                      Anon Public Key (API Key)
                    </label>
                    <input
                      type="password"
                      value={inputKey}
                      onChange={(e) => setInputKey(e.target.value)}
                      placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
                      className="w-full h-11 rounded-xl bg-white border border-slate-300 px-3.5 text-sm font-mono text-slate-800 placeholder:text-slate-400 placeholder:text-sm focus:outline-none focus:ring-2 focus:ring-[#b91c1c]/20"
                    />
                  </div>

                  <div className="pt-2 flex items-center justify-between">
                    <div>
                      {supabaseFeedback && (
                        <span
                          className={`text-sm font-semibold ${
                            supabaseFeedback.type === 'success'
                              ? 'text-emerald-600'
                              : supabaseFeedback.type === 'error'
                              ? 'text-rose-600'
                              : 'text-slate-500'
                          }`}
                        >
                          {supabaseFeedback.message}
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      disabled={testingSupabase}
                      onClick={handleTestSupabase}
                      className="h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-5 text-sm font-semibold transition shadow-xs cursor-pointer disabled:opacity-50"
                    >
                      {testingSupabase ? 'Verificando...' : 'Guardar y Conectar Supabase'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Pie del Modal */}
        <div className="border-t border-slate-200 bg-slate-50 px-6 py-4 sm:px-7 flex items-center justify-between text-sm text-slate-500">
          <span>
            {isSupabaseConnected
              ? 'Almacenamiento: Supabase Cloud Activo'
              : 'Almacenamiento: Caché Local (LocalStorage)'}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 px-4 py-2 font-semibold text-sm transition cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
