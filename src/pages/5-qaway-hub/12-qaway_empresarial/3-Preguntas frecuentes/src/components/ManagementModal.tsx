import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Layers,
  Cloud,
  Check,
  Pencil,
  Trash2,
  Search,
  Sparkles,
  BookOpen,
  Compass,
  Building2,
  GraduationCap
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
  const [formNumber, setFormNumber] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formCriterioTitle, setFormCriterioTitle] = useState('');
  const [formCriterioDesc, setFormCriterioDesc] = useState('');
  const [formDesarrollo, setFormDesarrollo] = useState('');
  const [formAccion, setFormAccion] = useState('');
  const [formSolucion, setFormSolucion] = useState('');

  // List Search & Filter State
  const [filterDir, setFilterDir] = useState<string>('ALL');
  const [searchListQuery, setSearchListQuery] = useState('');

  // Supabase Inputs State
  const [inputUrl, setInputUrl] = useState(supabaseUrl);
  const [inputKey, setInputKey] = useState(supabaseKey);
  const [testingSupabase, setTestingSupabase] = useState(false);
  const [supabaseFeedback, setSupabaseFeedback] = useState<{
    message: string;
    type: 'success' | 'error' | 'info';
  } | null>(null);

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

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 transition-opacity"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-4xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden transform transition-all my-8">
        {/* Cabecera del Modal */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-slate-50">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-800">
              Administración del Banco de Casuísticas
            </h3>
            <p className="text-xs text-slate-500">
              Agrega, modifica y sincroniza preguntas y soluciones para el monitoreo SIGA.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-200/70 hover:text-slate-700 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Barra de Pestañas (Tabs) */}
        <div className="flex border-b border-slate-200 bg-slate-100/70 px-6 pt-2 gap-2 text-xs font-semibold">
          <button
            type="button"
            onClick={() => onChangeTab('form')}
            className={`flex items-center gap-2 px-4 py-2.5 border-b-2 rounded-t-lg transition cursor-pointer ${
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
            className={`flex items-center gap-2 px-4 py-2.5 border-b-2 rounded-t-lg transition cursor-pointer ${
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
            className={`flex items-center gap-2 px-4 py-2.5 border-b-2 rounded-t-lg transition cursor-pointer ${
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

        {/* Contenido según pestaña activa */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {/* TAB 1: FORMULARIO */}
          {activeTab === 'form' && (
            <form onSubmit={handleSubmit} className="space-y-4">
              {editingCase && (
                <div className="flex items-center justify-between rounded-xl bg-amber-50 border border-amber-200 p-3 text-xs text-amber-800">
                  <span>
                    Estás modificando el caso <strong>#{editingCase.caseItem.number}</strong> (
                    {editingCase.caseItem.title}).
                  </span>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="font-bold underline text-amber-900 hover:text-black cursor-pointer"
                  >
                    Crear nuevo en su lugar
                  </button>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">
                    Dirección pedagógica <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formDirId}
                    onChange={(e) => setFormDirId(e.target.value as DirectionId)}
                    className="w-full h-10 rounded-xl bg-slate-50 border border-slate-200 px-3 text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-300"
                  >
                    <option value="DEI">DEI - Educación Inicial</option>
                    <option value="DEP">DEP - Educación Primaria</option>
                    <option value="DISER">DISER - Servicios Rurales</option>
                    <option value="DEBA">DEBA - Básica Alternativa</option>
                    <option value="DEBE">DEBE - Básica Especial</option>
                    <option value="DES">DES - Educación Secundaria</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">
                    N.° Correlativo <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formNumber}
                    onChange={(e) => setFormNumber(e.target.value)}
                    placeholder="01"
                    className="w-full h-10 rounded-xl bg-slate-50 border border-slate-200 px-3 text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-300"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">
                    Criterio (Etiqueta)
                  </label>
                  <input
                    type="text"
                    value={formCriterioTitle}
                    onChange={(e) => setFormCriterioTitle(e.target.value)}
                    placeholder="Pertinencia / Cobertura..."
                    className="w-full h-10 rounded-xl bg-slate-50 border border-slate-200 px-3 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-300"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">
                  Título de la casuística / problema <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="Ej: Material asignado no corresponde a la característica..."
                  className="w-full h-10 rounded-xl bg-slate-50 border border-slate-200 px-3 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-300"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">
                  Desarrollo de la casuística (Situación identificada){' '}
                  <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={formDesarrollo}
                  onChange={(e) => setFormDesarrollo(e.target.value)}
                  placeholder="Detalla qué ocurrió durante el monitoreo a la UGEL..."
                  className="w-full rounded-xl bg-slate-50 border border-slate-200 p-3 text-xs leading-relaxed text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-300"
                ></textarea>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">
                  Acción sugerida <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={formAccion}
                  onChange={(e) => setFormAccion(e.target.value)}
                  placeholder="Paso inmediato a realizar por la UGEL o directivo..."
                  className="w-full rounded-xl bg-slate-50 border border-slate-200 p-3 text-xs leading-relaxed text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-300"
                ></textarea>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-emerald-800">
                  Solución referencial <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={formSolucion}
                  onChange={(e) => setFormSolucion(e.target.value)}
                  placeholder="Resolución final, reasignación pecosa o regularización..."
                  className="w-full rounded-xl bg-slate-50 border border-slate-200 p-3 text-xs leading-relaxed text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-300"
                ></textarea>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={resetForm}
                  className="h-10 rounded-xl border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                >
                  Limpiar campos
                </button>
                <button
                  type="submit"
                  className="h-10 inline-flex items-center gap-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white px-5 text-xs font-semibold transition shadow-xs cursor-pointer"
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
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute inset-y-0 left-3 my-auto text-slate-400" />
                  <input
                    type="text"
                    value={searchListQuery}
                    onChange={(e) => setSearchListQuery(e.target.value)}
                    placeholder="Buscar pregunta por palabra clave..."
                    className="w-full h-9 pl-9 pr-3 rounded-lg bg-white border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-300"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-xs font-bold text-slate-600">Filtrar:</label>
                  <select
                    value={filterDir}
                    onChange={(e) => setFilterDir(e.target.value)}
                    className="h-9 rounded-lg bg-white border border-slate-300 px-3 text-xs font-semibold text-slate-700 focus:outline-none"
                  >
                    <option value="ALL">Todas las direcciones</option>
                    <option value="DEI">DEI - Inicial</option>
                    <option value="DEP">DEP - Primaria</option>
                    <option value="DISER">DISER - Rurales</option>
                    <option value="DEBA">DEBA - EBA</option>
                    <option value="DEBE">DEBE - EBE</option>
                    <option value="DES">DES - Secundaria</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2.5 max-h-[50vh] overflow-y-auto pr-1">
                {filteredList.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-3 p-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                          {item.dirCode} #{item.number}
                        </span>
                        <span className="text-[11px] font-medium text-slate-500 truncate">
                          {item.criterioTitle}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-800 truncate">
                        {item.title}
                      </h4>
                    </div>

                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => onEditCaseFromList(item)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-200 transition cursor-pointer"
                        title="Editar esta casuística"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteCase(item.id, item.dirId)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
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
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <Cloud className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">
                      Conexión con Supabase (Nube Oficial)
                    </h4>
                    <p className="text-xs text-slate-500">
                      Ingresa tus credenciales para sincronizar automáticamente el banco en tiempo real.
                    </p>
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700">
                      Project URL de Supabase
                    </label>
                    <input
                      type="text"
                      value={inputUrl}
                      onChange={(e) => setInputUrl(e.target.value)}
                      placeholder="https://xyzcompany.supabase.co"
                      className="w-full h-10 rounded-xl bg-white border border-slate-300 px-3 text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-300"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700">
                      Anon Public Key (API Key)
                    </label>
                    <input
                      type="password"
                      value={inputKey}
                      onChange={(e) => setInputKey(e.target.value)}
                      placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
                      className="w-full h-10 rounded-xl bg-white border border-slate-300 px-3 text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-300"
                    />
                  </div>

                  <div className="pt-2 flex items-center justify-between">
                    <div>
                      {supabaseFeedback && (
                        <span
                          className={`text-xs font-semibold ${
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
                      className="h-10 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-4 text-xs font-semibold transition shadow-xs cursor-pointer disabled:opacity-50"
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
        <div className="border-t border-slate-200 bg-slate-50 px-6 py-3.5 flex items-center justify-between text-xs text-slate-500">
          <span>
            {isSupabaseConnected
              ? 'Almacenamiento: Supabase Cloud Activo'
              : 'Almacenamiento: Caché Local (LocalStorage)'}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-slate-200/80 hover:bg-slate-300/80 text-slate-700 px-3.5 py-1.5 font-semibold transition cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
