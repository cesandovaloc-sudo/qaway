import React, { useState, useMemo } from 'react';
import {
  ArrowLeft,
  Save,
  Cloud,
  FileSpreadsheet,
  RotateCcw,
  Plus,
  Trash2,
  Copy,
  Search,
  CheckCircle2,
  AlertTriangle,
  Code2,
  X
} from 'lucide-react';
import { Casuistica, DirectionData, DirectionId } from '../types/casuistica';

interface CasuisticasExcelPageProps {
  directions: DirectionData[];
  onBack: () => void;
  onSave: (newDirections: DirectionData[]) => Promise<boolean>;
  onResetOfficial: () => void;
  supabaseUrl: string;
  supabaseKey: string;
  isSupabaseConnected: boolean;
  onSyncSupabase: () => Promise<boolean>;
}

const DIRECTION_TABS: { id: string; label: string; code: string }[] = [
  { id: 'ALL', label: 'Todas las Direcciones', code: 'ALL' },
  { id: 'DEI', label: 'DEI (Inicial)', code: 'DEI' },
  { id: 'DEP', label: 'DEP (Primaria)', code: 'DEP' },
  { id: 'DES', label: 'DES (Secundaria)', code: 'DES' },
  { id: 'DISER', label: 'DISER (Rural)', code: 'DISER' },
  { id: 'DEIB', label: 'DEIB (Bilingüe)', code: 'DEIB' },
  { id: 'DEBE', label: 'DEBE (Especial)', code: 'DEBE' },
  { id: 'DEBA', label: 'DEBA (Alternativa)', code: 'DEBA' }
];

export const CasuisticasExcelPage: React.FC<CasuisticasExcelPageProps> = ({
  directions,
  onBack,
  onSave,
  onResetOfficial,
  supabaseUrl,
  supabaseKey,
  isSupabaseConnected,
  onSyncSupabase
}) => {
  const [data, setData] = useState<DirectionData[]>(() => JSON.parse(JSON.stringify(directions)));
  const [activeDirTab, setActiveDirTab] = useState<string>('DEI');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [isDirty, setIsDirty] = useState<boolean>(false);
  const [showSqlModal, setShowSqlModal] = useState<boolean>(false);

  // Manejador de edición de celda
  const handleCellChange = (
    dirId: DirectionId,
    caseId: string,
    field: keyof Casuistica,
    value: string
  ) => {
    setData((prev) =>
      prev.map((dir) => {
        if (dir.id !== dirId) return dir;
        return {
          ...dir,
          cases: dir.cases.map((c) => {
            if (c.id !== caseId) return c;
            return { ...c, [field]: value };
          })
        };
      })
    );
    setIsDirty(true);
  };

  // Agregar nueva fila en la dirección activa
  const handleAddRow = () => {
    const targetDirId: DirectionId =
      activeDirTab === 'ALL' ? 'DEI' : (activeDirTab as DirectionId);

    setData((prev) =>
      prev.map((dir) => {
        if (dir.id !== targetDirId) return dir;
        const newNum = String(dir.cases.length + 1).padStart(2, '0');
        const newCase: Casuistica = {
          id: `${targetDirId.toLowerCase()}-${Date.now()}`,
          number: newNum,
          title: 'Nueva pregunta o casuística...',
          criterioTitle: 'Criterio General',
          criterioDesc: 'Descripción del criterio...',
          desarrollo: 'Detalle de la consulta de la UGEL o IE...',
          solucion: 'Respuesta u orientación oficial...',
          ejemplo: '',
          normativa: '',
          accion: '',
          casoEspecifico: '',
          isOpen: false
        };
        return {
          ...dir,
          cases: [newCase, ...dir.cases]
        };
      })
    );
    setIsDirty(true);
  };

  // Duplicar fila
  const handleDuplicateRow = (dirId: DirectionId, caseItem: Casuistica) => {
    setData((prev) =>
      prev.map((dir) => {
        if (dir.id !== dirId) return dir;
        const copyCase: Casuistica = {
          ...caseItem,
          id: `${dirId.toLowerCase()}-${Date.now()}`,
          number: `${caseItem.number}B`,
          title: `${caseItem.title} (Copia)`
        };
        const index = dir.cases.findIndex((c) => c.id === caseItem.id);
        const newCases = [...dir.cases];
        newCases.splice(index + 1, 0, copyCase);
        return { ...dir, cases: newCases };
      })
    );
    setIsDirty(true);
  };

  // Eliminar fila
  const handleDeleteRow = (dirId: DirectionId, caseId: string) => {
    if (!window.confirm('¿Confirmas eliminar esta fila de la tabla?')) return;
    setData((prev) =>
      prev.map((dir) => {
        if (dir.id !== dirId) return dir;
        return {
          ...dir,
          cases: dir.cases.filter((c) => c.id !== caseId)
        };
      })
    );
    setIsDirty(true);
  };

  // Guardar local
  const handleSaveLocal = async () => {
    setIsSaving(true);
    try {
      await onSave(data);
      setIsDirty(false);
    } finally {
      setIsSaving(false);
    }
  };

  // Sincronizar con Supabase
  const handleSyncCloud = async () => {
    setIsSyncing(true);
    try {
      await onSave(data);
      await onSyncSupabase();
      setIsDirty(false);
    } finally {
      setIsSyncing(false);
    }
  };

  // Exportar a CSV
  const handleExportCSV = () => {
    const rows = [
      [
        'ID',
        'Dirección',
        'Número',
        'Pregunta / Título',
        'Criterio',
        'Desarrollo de la Situación',
        'Solución / Criterio Oficial',
        'Ejemplo Práctico',
        'Normativa Aplicable',
        'Caso Específico / UGEL'
      ]
    ];

    data.forEach((dir) => {
      dir.cases.forEach((c) => {
        rows.push([
          c.id,
          dir.code,
          c.number,
          `"${(c.title || '').replace(/"/g, '""')}"`,
          `"${(c.criterioTitle || '').replace(/"/g, '""')}"`,
          `"${(c.desarrollo || '').replace(/"/g, '""')}"`,
          `"${(c.solucion || '').replace(/"/g, '""')}"`,
          `"${(c.ejemplo || '').replace(/"/g, '""')}"`,
          `"${(c.normativa || '').replace(/"/g, '""')}"`,
          `"${(c.casoEspecifico || '').replace(/"/g, '""')}"`
        ]);
      });
    });

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + rows.map((e) => e.join(';')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `casuisticas_minedu_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filas filtradas
  const visibleRows = useMemo(() => {
    const q = searchTerm.toLowerCase().trim();
    return data
      .filter((d) => activeDirTab === 'ALL' || d.id === activeDirTab)
      .flatMap((dir) =>
        dir.cases
          .filter((c) => {
            if (!q) return true;
            return (
              c.number.toLowerCase().includes(q) ||
              c.title.toLowerCase().includes(q) ||
              c.desarrollo.toLowerCase().includes(q) ||
              c.solucion.toLowerCase().includes(q) ||
              (c.ejemplo || '').toLowerCase().includes(q) ||
              (c.normativa || '').toLowerCase().includes(q) ||
              (c.casoEspecifico || '').toLowerCase().includes(q)
            );
          })
          .map((c) => ({ ...c, dirId: dir.id, dirCode: dir.code }))
      );
  }, [data, activeDirTab, searchTerm]);

  const totalFiltered = visibleRows.length;
  const totalAll = data.reduce((acc, d) => acc + d.cases.length, 0);

  const sqlSnippet = `-- 1. CREACIÓN DE LA TABLA CASUÍSTICAS EN SUPABASE
CREATE TABLE IF NOT EXISTS public.casuisticas (
  id TEXT PRIMARY KEY,
  dir_id TEXT NOT NULL,
  dir_code TEXT NOT NULL,
  dir_name TEXT NOT NULL,
  number TEXT NOT NULL,
  title TEXT NOT NULL,
  criterio_title TEXT,
  criterio_desc TEXT,
  desarrollo TEXT NOT NULL,
  solucion TEXT NOT NULL,
  ejemplo TEXT,
  normativa TEXT,
  caso_especifico TEXT,
  accion TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. HABILITAR SEGURIDAD POR FILAS (RLS)
ALTER TABLE public.casuisticas ENABLE ROW LEVEL SECURITY;

-- 3. POLÍTICA DE LECTURA Y ESCRITURA PÚBLICA / ANON
CREATE POLICY "Permitir lectura publica" ON public.casuisticas FOR SELECT USING (true);
CREATE POLICY "Permitir escritura publica" ON public.casuisticas FOR ALL USING (true);
`;

  return (
    <div className="w-full min-h-screen bg-slate-100 flex flex-col font-sans text-slate-800 antialiased">
      {/* 1. BARRA SUPERIOR STICKY ESTILO EXCEL / WORKBOOK */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
        {/* Fila principal de controles */}
        <div className="w-full px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
          {/* Lado izquierdo: Volver + Título + Status */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer"
              title="Volver a la vista de casuísticas"
            >
              <ArrowLeft className="w-4 h-4 text-slate-600" />
              <span>Volver a Consultas</span>
            </button>

            <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                <FileSpreadsheet className="w-4 h-4" />
              </div>
              <div>
                <h1 className="text-sm sm:text-base font-extrabold text-slate-900 leading-tight">
                  Editor Masivo de Casuísticas — Vista Hoja de Cálculo
                </h1>
                <p className="text-[11px] text-slate-500 font-medium">
                  {totalFiltered} casuísticas visibles (de {totalAll} totales)
                  {isDirty && (
                    <span className="ml-2 px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-bold">
                      Cambios sin guardar
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Lado derecho: Acciones (Agregar, Guardar, Supabase, Exportar) */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleAddRow}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition cursor-pointer border border-slate-300"
            >
              <Plus className="w-3.5 h-3.5 text-slate-700" />
              <span>+ Fila</span>
            </button>

            <button
              type="button"
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition cursor-pointer border border-slate-300"
              title="Descargar como archivo CSV para Excel"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
              <span>Exportar Excel</span>
            </button>

            <button
              type="button"
              onClick={() => setShowSqlModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition cursor-pointer border border-indigo-200"
              title="Ver código SQL para crear la tabla casuisticas en Supabase"
            >
              <Code2 className="w-3.5 h-3.5 text-indigo-600" />
              <span>Script Supabase</span>
            </button>

            <button
              type="button"
              onClick={handleSyncCloud}
              disabled={isSyncing}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer shadow-xs ${
                isSupabaseConnected
                  ? 'bg-sky-600 hover:bg-sky-700 text-white'
                  : 'bg-slate-800 hover:bg-slate-900 text-white'
              }`}
              title="Sincronizar toda la hoja con la base de datos de Supabase"
            >
              <Cloud className="w-3.5 h-3.5" />
              <span>{isSyncing ? 'Sincronizando...' : 'Sincronizar Supabase'}</span>
            </button>

            <button
              type="button"
              onClick={handleSaveLocal}
              disabled={isSaving}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition cursor-pointer shadow-sm disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Guardando...' : 'Guardar Todo'}</span>
            </button>
          </div>
        </div>

        {/* Fila secundaria: Pestañas de Dirección y Buscador Rápido */}
        <div className="w-full px-4 sm:px-6 py-2 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          {/* Tabs por Dirección */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
            {DIRECTION_TABS.map((tab) => {
              const count =
                tab.id === 'ALL'
                  ? totalAll
                  : data.find((d) => d.id === tab.id)?.cases.length || 0;
              const isActive = activeDirTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveDirTab(tab.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-white text-slate-600 hover:bg-slate-200/80 border border-slate-200'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                      isActive ? 'bg-slate-700 text-slate-200' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Buscador de celda */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Filtrar en toda la hoja..."
                className="w-48 sm:w-64 h-8 pl-8 pr-3 rounded-lg bg-white border border-slate-300 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <button
              type="button"
              onClick={onResetOfficial}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-white border border-slate-200 transition"
              title="Restablecer casos oficiales (52 de DEI)"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* 2. ÁREA DE TABLA EXCEL A PANTALLA COMPLETA */}
      <main className="flex-1 w-full overflow-x-auto overflow-y-auto bg-slate-50">
        <table className="w-full border-collapse text-left text-xs bg-white">
          <thead className="sticky top-0 z-30 bg-slate-200/90 backdrop-blur-xs text-slate-700 font-bold border-b border-slate-300 shadow-2xs">
            <tr>
              <th className="w-14 px-2 py-2.5 text-center border-r border-slate-300">#</th>
              <th className="w-20 px-2 py-2.5 text-center border-r border-slate-300">Dir</th>
              <th className="w-80 min-w-[280px] px-3 py-2.5 border-r border-slate-300">
                Título / Pregunta Central
              </th>
              <th className="w-48 min-w-[170px] px-3 py-2.5 border-r border-slate-300">
                Caso Concreto / UGEL
              </th>
              <th className="w-96 min-w-[320px] px-3 py-2.5 border-r border-slate-300">
                Desarrollo de la Situación
              </th>
              <th className="w-96 min-w-[320px] px-3 py-2.5 border-r border-slate-300">
                Solución / Criterio Oficial
              </th>
              <th className="w-72 min-w-[240px] px-3 py-2.5 border-r border-slate-300">
                Ejemplo de Aplicación
              </th>
              <th className="w-64 min-w-[220px] px-3 py-2.5 border-r border-slate-300">
                Normativa Aplicable
              </th>
              <th className="w-20 px-2 py-2.5 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-slate-800">
            {visibleRows.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-16 text-center text-slate-500 font-medium">
                  No se encontraron filas que coincidan con el filtro &quot;{searchTerm}&quot;.
                </td>
              </tr>
            ) : (
              visibleRows.map((row, idx) => (
                <tr
                  key={row.id}
                  className={`hover:bg-amber-50/40 transition-colors ${
                    idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'
                  }`}
                >
                  {/* Número */}
                  <td className="px-1 py-1.5 text-center font-bold text-slate-700 border-r border-slate-200 bg-slate-50/80">
                    <input
                      type="text"
                      value={row.number}
                      onChange={(e) =>
                        handleCellChange(row.dirId, row.id, 'number', e.target.value)
                      }
                      className="w-10 text-center font-bold bg-transparent border-b border-transparent hover:border-slate-300 focus:border-emerald-500 focus:bg-white focus:outline-none text-xs"
                    />
                  </td>

                  {/* Dirección */}
                  <td className="px-2 py-1.5 text-center border-r border-slate-200">
                    <span className="inline-block px-2 py-0.5 rounded text-[11px] font-black bg-red-50 text-[#b91c1c] border border-red-200/60">
                      {row.dirCode}
                    </span>
                  </td>

                  {/* Título */}
                  <td className="p-1 border-r border-slate-200">
                    <textarea
                      rows={2}
                      value={row.title}
                      onChange={(e) =>
                        handleCellChange(row.dirId, row.id, 'title', e.target.value)
                      }
                      className="w-full p-2 rounded bg-transparent border border-transparent hover:border-slate-300 focus:border-emerald-500 focus:bg-white focus:outline-none resize-y text-xs font-semibold leading-relaxed text-slate-900"
                    />
                  </td>

                  {/* Caso Específico / UGEL */}
                  <td className="p-1 border-r border-slate-200">
                    <textarea
                      rows={2}
                      value={row.casoEspecifico || ''}
                      onChange={(e) =>
                        handleCellChange(row.dirId, row.id, 'casoEspecifico', e.target.value)
                      }
                      placeholder="UGEL / IE..."
                      className="w-full p-2 rounded bg-amber-50/30 border border-transparent hover:border-amber-300 focus:border-amber-500 focus:bg-white focus:outline-none resize-y text-xs text-amber-950 font-medium"
                    />
                  </td>

                  {/* Desarrollo */}
                  <td className="p-1 border-r border-slate-200">
                    <textarea
                      rows={3}
                      value={row.desarrollo}
                      onChange={(e) =>
                        handleCellChange(row.dirId, row.id, 'desarrollo', e.target.value)
                      }
                      className="w-full p-2 rounded bg-transparent border border-transparent hover:border-slate-300 focus:border-emerald-500 focus:bg-white focus:outline-none resize-y text-xs leading-relaxed text-slate-700"
                    />
                  </td>

                  {/* Solución */}
                  <td className="p-1 border-r border-slate-200">
                    <textarea
                      rows={3}
                      value={row.solucion}
                      onChange={(e) =>
                        handleCellChange(row.dirId, row.id, 'solucion', e.target.value)
                      }
                      className="w-full p-2 rounded bg-transparent border border-transparent hover:border-slate-300 focus:border-emerald-500 focus:bg-white focus:outline-none resize-y text-xs leading-relaxed text-slate-800 font-medium"
                    />
                  </td>

                  {/* Ejemplo */}
                  <td className="p-1 border-r border-slate-200">
                    <textarea
                      rows={2}
                      value={row.ejemplo || ''}
                      onChange={(e) =>
                        handleCellChange(row.dirId, row.id, 'ejemplo', e.target.value)
                      }
                      placeholder="Ejemplo práctico..."
                      className="w-full p-2 rounded bg-emerald-50/20 border border-transparent hover:border-emerald-300 focus:border-emerald-500 focus:bg-white focus:outline-none resize-y text-xs text-emerald-900"
                    />
                  </td>

                  {/* Normativa */}
                  <td className="p-1 border-r border-slate-200">
                    <textarea
                      rows={2}
                      value={row.normativa || ''}
                      onChange={(e) =>
                        handleCellChange(row.dirId, row.id, 'normativa', e.target.value)
                      }
                      placeholder="RM N.° 373-2026-MINEDU..."
                      className="w-full p-2 rounded bg-transparent border border-transparent hover:border-slate-300 focus:border-emerald-500 focus:bg-white focus:outline-none resize-y text-[11px] text-slate-600 font-mono"
                    />
                  </td>

                  {/* Acciones */}
                  <td className="px-2 py-2 text-center align-middle">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleDuplicateRow(row.dirId, row)}
                        className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition"
                        title="Duplicar fila"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteRow(row.dirId, row.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition"
                        title="Eliminar fila"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </main>

      {/* MODAL CON EL SCRIPT SQL DE SUPABASE */}
      {showSqlModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2 text-indigo-700">
                <Code2 className="w-5 h-5" />
                <h3 className="text-base font-bold text-slate-900">
                  Script SQL para Crear la Tabla en Supabase
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowSqlModal(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Para habilitar la sincronización en la nube, ingresa al panel de{' '}
              <strong>Supabase &gt; SQL Editor &gt; New Query</strong>, pega el siguiente código y presiona{' '}
              <strong>Run</strong>. PostgREST expondrá la tabla automáticamente.
            </p>

            <div className="relative">
              <pre className="p-4 bg-slate-900 text-slate-100 rounded-xl text-xs font-mono overflow-x-auto max-h-64 leading-relaxed">
                {sqlSnippet}
              </pre>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(sqlSnippet);
                  alert('¡Script SQL copiado al portapapeles!');
                }}
                className="absolute top-3 right-3 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg transition shadow-xs"
              >
                Copiar SQL
              </button>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-slate-500">
                URL actual: <code className="font-mono text-slate-700">{supabaseUrl}</code>
              </span>
              <button
                type="button"
                onClick={() => setShowSqlModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
