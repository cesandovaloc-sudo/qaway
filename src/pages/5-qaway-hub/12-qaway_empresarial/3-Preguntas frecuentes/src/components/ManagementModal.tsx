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
  ChevronDown,
  Table,
  Save,
  RotateCcw
} from 'lucide-react';
import { Casuistica, DirectionData, DirectionId, ScoredCasuistica } from '../types/casuistica';

interface ManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: 'form' | 'list' | 'table' | 'cloud';
  onChangeTab: (tab: 'form' | 'list' | 'table' | 'cloud') => void;
  directions: DirectionData[];
  editingCase: { caseItem: Casuistica; dirId: DirectionId } | null;
  onSaveCase: (dirId: DirectionId, caseItem: Casuistica) => void;
  onDeleteCase: (caseId: string, dirId: DirectionId) => void;
  onEditCaseFromList: (item: ScoredCasuistica) => void;
  supabaseUrl: string;
  supabaseKey: string;
  onSaveSupabaseConfig: (url: string, key: string) => Promise<boolean>;
  isSupabaseConnected: boolean;
  onBulkSaveCases?: (newDirections: DirectionData[]) => Promise<boolean>;
  onOpenFullScreenTable?: () => void;
}

const DIRECTION_OPTIONS: { id: DirectionId; code: string; name: string }[] = [
  { id: 'DEI', code: 'DEI', name: 'Ed. Inicial' },
  { id: 'DEP', code: 'DEP', name: 'Ed. Primaria' },
  { id: 'DES', code: 'DES', name: 'Ed. Secundaria' },
  { id: 'DISER', code: 'DISER', name: 'Servicios Rurales' },
  { id: 'DEIB', code: 'DEIB', name: 'Intercultural Bilingüe' },
  { id: 'DEBE', code: 'DEBE', name: 'Básica Especial' },
  { id: 'DEBA', code: 'DEBA', name: 'Básica Alternativa' }
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
  isSupabaseConnected,
  onBulkSaveCases,
  onOpenFullScreenTable
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
  const [formSolucion, setFormSolucion] = useState('');
  const [formEjemplo, setFormEjemplo] = useState('');
  const [formNormativa, setFormNormativa] = useState('');
  const [formCasoEspecifico, setFormCasoEspecifico] = useState('');

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

  // Excel Table Editor State (Solo Admin)
  const [tableData, setTableData] = useState<DirectionData[]>(directions);
  const [isSavingTable, setIsSavingTable] = useState(false);
  const [tableSearch, setTableSearch] = useState('');
  const [tableDirFilter, setTableDirFilter] = useState('ALL');

  useEffect(() => {
    setTableData(directions);
  }, [directions]);

  const handleCellChange = (
    dirId: DirectionId,
    caseId: string,
    field: keyof Casuistica,
    value: string
  ) => {
    setTableData((prev) =>
      prev.map((dir) => {
        if (dir.id !== dirId) return dir;
        return {
          ...dir,
          cases: dir.cases.map((c) => {
            if (c.id !== caseId) return c;
            return {
              ...c,
              [field]: value
            };
          })
        };
      })
    );
  };

  const handleSaveExcelTable = async () => {
    if (!onBulkSaveCases) return;
    setIsSavingTable(true);
    await onBulkSaveCases(tableData);
    setIsSavingTable(false);
  };

  const handleResetExcelTable = () => {
    setTableData(directions);
  };

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
      setFormSolucion(editingCase.caseItem.solucion || editingCase.caseItem.accion || '');
      setFormEjemplo(editingCase.caseItem.ejemplo || '');
      setFormNormativa(editingCase.caseItem.normativa || '');
      setFormCasoEspecifico(editingCase.caseItem.casoEspecifico || '');
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
    setFormSolucion('');
    setFormEjemplo('');
    setFormNormativa('');
    setFormCasoEspecifico('');
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
      solucion: formSolucion.trim(),
      ejemplo: formEjemplo.trim(),
      normativa: formNormativa.trim(),
      accion: editingCase?.caseItem.accion || '',
      casoEspecifico: formCasoEspecifico.trim(),
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
      const matchEj = (c.ejemplo || '').toLowerCase().includes(q);
      const matchEsp = (c.casoEspecifico || '').toLowerCase().includes(q);
      return matchTitle || matchDes || matchSol || matchEj || matchEsp;
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
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 lg:p-6 transition-opacity"
      role="dialog"
      aria-modal="true"
    >
      <div
        className={`relative w-full rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden transform transition-all my-4 sm:my-6 ${
          activeTab === 'table' ? 'max-w-6xl' : 'max-w-4xl'
        }`}
      >
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
            <span>Inventario ({allCases.length})</span>
          </button>

          <button
            type="button"
            onClick={() => onChangeTab('table')}
            className={`flex items-center gap-2 px-4 py-2.5 border-b-2 rounded-t-xl transition cursor-pointer text-sm whitespace-nowrap ${
              activeTab === 'table'
                ? 'border-emerald-600 text-emerald-700 bg-white font-bold shadow-xs'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            <Table className="w-4 h-4 text-emerald-600" />
            <span>Tabla Excel (Edición Rápida)</span>
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
                  Desarrollo <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={formDesarrollo}
                  onChange={(e) => setFormDesarrollo(e.target.value)}
                  placeholder="Detalla la situación identificada por la UGEL o IE..."
                  className="w-full rounded-xl bg-white border border-slate-300 p-3.5 text-sm leading-relaxed text-slate-800 placeholder:text-slate-400 placeholder:text-sm focus:outline-none focus:ring-2 focus:ring-[#b91c1c]/20 transition shadow-2xs"
                ></textarea>
              </div>

              {/* SOLUCIÓN */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Solución <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={formSolucion}
                  onChange={(e) => setFormSolucion(e.target.value)}
                  placeholder="Indica qué debe verificar y efectuar la UGEL..."
                  className="w-full rounded-xl bg-white border border-slate-300 p-3.5 text-sm leading-relaxed text-slate-800 placeholder:text-slate-400 placeholder:text-sm focus:outline-none focus:ring-2 focus:ring-[#b91c1c]/20 transition shadow-2xs"
                ></textarea>
              </div>

              {/* EJEMPLO / RESULTADO ESPERADO */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-emerald-800">
                  Ejemplo / Resultado esperado <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={formEjemplo}
                  onChange={(e) => setFormEjemplo(e.target.value)}
                  placeholder="Ejemplo práctico o resultado esperado al finalizar en el MC SIGA..."
                  className="w-full rounded-xl bg-white border border-slate-300 p-3.5 text-sm leading-relaxed text-slate-800 placeholder:text-slate-400 placeholder:text-sm focus:outline-none focus:ring-2 focus:ring-[#b91c1c]/20 transition shadow-2xs"
                ></textarea>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* NORMATIVA (DESPLEGABLE OPCIONAL) */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Normativa (Desplegable opcional)
                  </label>
                  <textarea
                    rows={2}
                    value={formNormativa}
                    onChange={(e) => setFormNormativa(e.target.value)}
                    placeholder="Ej: RM N.° 373-2026-MINEDU / Oficio Múltiple N.° 032-2026..."
                    className="w-full rounded-xl bg-white border border-slate-300 p-3 text-sm leading-relaxed text-slate-800 placeholder:text-slate-400 placeholder:text-sm focus:outline-none focus:ring-2 focus:ring-[#b91c1c]/20 transition shadow-2xs"
                  ></textarea>
                </div>

                {/* CASO ESPECÍFICO / DETALLE INTERNO UGEL (OCULTO EN PRODUCCIÓN, SOLO ADMIN + BUSCADOR) */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-amber-800">
                    Detalle interno de UGEL (Oculto en producción • Solo Admin)
                  </label>
                  <textarea
                    rows={2}
                    value={formCasoEspecifico}
                    onChange={(e) => setFormCasoEspecifico(e.target.value)}
                    placeholder="Caso con nombre de UGEL para referencia interna y buscador..."
                    className="w-full rounded-xl bg-amber-50/40 border border-amber-200 p-3 text-sm leading-relaxed text-slate-800 placeholder:text-slate-400 placeholder:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition shadow-2xs"
                  ></textarea>
                </div>
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

          {/* TAB 3: TABLA EXCEL (EDICIÓN RÁPIDA EN VIVO - SOLO ADMIN) */}
          {activeTab === 'table' && (
            <div className="space-y-4">
              {/* Barra de herramientas de la Tabla Excel */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <Table className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm sm:text-base font-bold text-slate-900">
                      Editor Tipo Tabla Excel (Modo Administrador)
                    </h4>
                    <p className="text-xs text-slate-500">
                      Edita directamente en las celdas y guarda todos los cambios en bloque en la base de datos.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  {onOpenFullScreenTable && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenFullScreenTable();
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-xs font-bold text-emerald-800 transition cursor-pointer"
                      title="Abrir en página dedicada a pantalla completa"
                    >
                      <span>Pantalla Completa ↗</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleResetExcelTable}
                    title="Restablecer cambios no guardados"
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                    <span>Descartar</span>
                  </button>

                  <button
                    type="button"
                    disabled={isSavingTable}
                    onClick={handleSaveExcelTable}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs cursor-pointer disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    <span>
                      {isSavingTable
                        ? 'Guardando...'
                        : isSupabaseConnected
                        ? 'Guardar y Sincronizar a Supabase'
                        : 'Guardar Cambios en la App'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Filtro rápido dentro de la tabla */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute inset-y-0 left-3.5 my-auto text-slate-400" />
                  <input
                    type="text"
                    value={tableSearch}
                    onChange={(e) => setTableSearch(e.target.value)}
                    placeholder="Filtrar filas por título, desarrollo o solución..."
                    className="w-full h-9 pl-9 pr-3 rounded-lg bg-white border border-slate-300 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>

                <select
                  value={tableDirFilter}
                  onChange={(e) => setTableDirFilter(e.target.value)}
                  className="h-9 rounded-lg bg-white border border-slate-300 px-3 text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
                >
                  <option value="ALL">Todas las direcciones</option>
                  {DIRECTION_OPTIONS.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.code} — {d.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Contenedor Cuadrícula Excel con Scroll Horizontal Suave */}
              <div className="rounded-xl border border-slate-200 overflow-x-auto max-h-[55vh] overflow-y-auto bg-white shadow-2xs">
                <table className="w-full text-left text-xs border-collapse min-w-[980px]">
                  <thead className="bg-slate-100/90 text-slate-700 sticky top-0 z-20 border-b border-slate-300">
                    <tr>
                      <th className="px-3 py-2.5 font-bold uppercase tracking-wider text-[11px] w-12 text-center border-r border-slate-200">
                        N°
                      </th>
                      <th className="px-3 py-2.5 font-bold uppercase tracking-wider text-[11px] w-20 border-r border-slate-200">
                        Dir.
                      </th>
                      <th className="px-3 py-2.5 font-bold uppercase tracking-wider text-[11px] min-w-[200px] border-r border-slate-200">
                        Título de la Casuística
                      </th>
                      <th className="px-3 py-2.5 font-bold uppercase tracking-wider text-[11px] min-w-[240px] border-r border-slate-200">
                        Desarrollo (Público)
                      </th>
                      <th className="px-3 py-2.5 font-bold uppercase tracking-wider text-[11px] min-w-[240px] border-r border-slate-200">
                        Solución
                      </th>
                      <th className="px-3 py-2.5 font-bold uppercase tracking-wider text-[11px] min-w-[200px] border-r border-slate-200">
                        Ejemplo / Resultado
                      </th>
                      <th className="px-3 py-2.5 font-bold uppercase tracking-wider text-[11px] min-w-[180px] border-r border-slate-200">
                        Normativa
                      </th>
                      <th className="px-3 py-2.5 font-bold uppercase tracking-wider text-[11px] min-w-[180px]">
                        Detalle UGEL (Admin)
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-slate-800">
                    {tableData
                      .filter((d) => tableDirFilter === 'ALL' || d.id === tableDirFilter)
                      .flatMap((dir) =>
                        dir.cases
                          .filter((c) => {
                            if (!tableSearch.trim()) return true;
                            const q = tableSearch.toLowerCase();
                            return (
                              c.title.toLowerCase().includes(q) ||
                              c.desarrollo.toLowerCase().includes(q) ||
                              c.solucion.toLowerCase().includes(q) ||
                              (c.casoEspecifico || '').toLowerCase().includes(q)
                            );
                          })
                          .map((c) => ({ ...c, dirId: dir.id, dirCode: dir.code }))
                      )
                      .map((row) => (
                        <tr key={row.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="px-2 py-1.5 text-center font-bold text-slate-600 bg-slate-50/50 border-r border-slate-200">
                            <input
                              type="text"
                              value={row.number}
                              onChange={(e) =>
                                handleCellChange(row.dirId, row.id, 'number', e.target.value)
                              }
                              className="w-10 text-center font-bold bg-transparent border-b border-transparent hover:border-slate-300 focus:border-emerald-500 focus:outline-none"
                            />
                          </td>
                          <td className="px-2 py-1.5 font-bold text-[#b91c1c] border-r border-slate-200">
                            <span className="px-1.5 py-0.5 rounded bg-red-50 text-[10px]">
                              {row.dirCode}
                            </span>
                          </td>
                          <td className="p-1 border-r border-slate-200">
                            <textarea
                              rows={2}
                              value={row.title}
                              onChange={(e) =>
                                handleCellChange(row.dirId, row.id, 'title', e.target.value)
                              }
                              className="w-full p-1.5 rounded bg-transparent border border-transparent hover:border-slate-300 focus:border-emerald-500 focus:bg-white focus:outline-none resize-y text-xs font-semibold"
                            />
                          </td>
                          <td className="p-1 border-r border-slate-200">
                            <textarea
                              rows={2}
                              value={row.desarrollo}
                              onChange={(e) =>
                                handleCellChange(row.dirId, row.id, 'desarrollo', e.target.value)
                              }
                              className="w-full p-1.5 rounded bg-transparent border border-transparent hover:border-slate-300 focus:border-emerald-500 focus:bg-white focus:outline-none resize-y text-xs"
                            />
                          </td>
                          <td className="p-1 border-r border-slate-200">
                            <textarea
                              rows={2}
                              value={row.solucion}
                              onChange={(e) =>
                                handleCellChange(row.dirId, row.id, 'solucion', e.target.value)
                              }
                              className="w-full p-1.5 rounded bg-transparent border border-transparent hover:border-slate-300 focus:border-emerald-500 focus:bg-white focus:outline-none resize-y text-xs text-slate-700"
                            />
                          </td>
                          <td className="p-1 border-r border-slate-200">
                            <textarea
                              rows={2}
                              value={row.ejemplo || ''}
                              onChange={(e) =>
                                handleCellChange(row.dirId, row.id, 'ejemplo', e.target.value)
                              }
                              className="w-full p-1.5 rounded bg-transparent border border-transparent hover:border-slate-300 focus:border-emerald-500 focus:bg-white focus:outline-none resize-y text-xs text-emerald-800"
                            />
                          </td>
                          <td className="p-1 border-r border-slate-200">
                            <textarea
                              rows={2}
                              value={row.normativa || ''}
                              onChange={(e) =>
                                handleCellChange(row.dirId, row.id, 'normativa', e.target.value)
                              }
                              placeholder="RM N.° 373-2026-MINEDU..."
                              className="w-full p-1.5 rounded bg-transparent border border-transparent hover:border-slate-300 focus:border-emerald-500 focus:bg-white focus:outline-none resize-y text-[11px] text-slate-600"
                            />
                          </td>
                          <td className="p-1">
                            <textarea
                              rows={2}
                              value={row.casoEspecifico || ''}
                              onChange={(e) =>
                                handleCellChange(
                                  row.dirId,
                                  row.id,
                                  'casoEspecifico',
                                  e.target.value
                                )
                              }
                              placeholder="Detalle UGEL interno..."
                              className="w-full p-1.5 rounded bg-amber-50/40 border border-transparent hover:border-amber-300 focus:border-amber-500 focus:bg-white focus:outline-none resize-y text-[11px] text-amber-900"
                            />
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: CONEXIÓN SUPABASE */}
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
